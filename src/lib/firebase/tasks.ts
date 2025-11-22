import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    onSnapshot,
} from 'firebase/firestore';
import { db } from './index';

export interface Task {
    id?: string;
    description: string;
    
    // Linking
    customerId?: string;
    customerName?: string;
    ticketId?: string;
    ticketNumber?: string;
    
    // Scheduling
    dueDate?: string;
    dueTime?: string;
    
    // Assignment
    createdBy: string;
    createdByName: string;
    createdByEmail: string;
    assignedTo?: string[];
    
    // Status
    completed: boolean;
    completedAt?: string;
    completedBy?: string;
    completedByName?: string;
    
    // Metadata
    source: 'dashboard' | 'ticket' | 'customer' | 'note_pin';
    noteId?: string;
    
    // Timestamps
    createdAt: any;
    updatedAt: any;
}

export const taskService = {
    // Create a new task
    async create(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, user?: any, assignedToName?: string): Promise<string> {
        // Remove undefined values (Firebase doesn't allow them)
        const cleanData: any = {
            description: taskData.description,
            createdBy: taskData.createdBy,
            createdByName: taskData.createdByName,
            createdByEmail: taskData.createdByEmail,
            completed: false,
            source: taskData.source,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        // Only add optional fields if they have values
        if (taskData.customerId) cleanData.customerId = taskData.customerId;
        if (taskData.customerName) cleanData.customerName = taskData.customerName;
        if (taskData.ticketId) cleanData.ticketId = taskData.ticketId;
        if (taskData.ticketNumber) cleanData.ticketNumber = taskData.ticketNumber;
        if (taskData.dueDate) cleanData.dueDate = taskData.dueDate;
        if (taskData.dueTime) cleanData.dueTime = taskData.dueTime;
        if (taskData.assignedTo && taskData.assignedTo.length > 0) cleanData.assignedTo = taskData.assignedTo;
        if (taskData.noteId) cleanData.noteId = taskData.noteId;

        const docRef = await addDoc(collection(db, 'tasks'), cleanData);
        
        // Log to ticket timeline if task is linked to a ticket
        if (taskData.ticketId && user) {
            const { timelineService } = await import('./timeline');
            await timelineService.logTaskAdded(
                taskData.ticketId,
                docRef.id,
                taskData.description,
                user,
                assignedToName
            );
        }
        
        return docRef.id;
    },

    // Get all tasks for a user (created by or assigned to)
    async getByUser(userId: string): Promise<Task[]> {
        // Get tasks created by user
        const createdQuery = query(
            collection(db, 'tasks'),
            where('createdBy', '==', userId),
            orderBy('createdAt', 'desc')
        );
        
        // Get tasks assigned to user
        const assignedQuery = query(
            collection(db, 'tasks'),
            where('assignedTo', 'array-contains', userId),
            orderBy('createdAt', 'desc')
        );
        
        const [createdSnapshot, assignedSnapshot] = await Promise.all([
            getDocs(createdQuery),
            getDocs(assignedQuery)
        ]);
        
        const tasks = new Map<string, Task>();
        
        createdSnapshot.docs.forEach(doc => {
            tasks.set(doc.id, { id: doc.id, ...doc.data() } as Task);
        });
        
        assignedSnapshot.docs.forEach(doc => {
            if (!tasks.has(doc.id)) {
                tasks.set(doc.id, { id: doc.id, ...doc.data() } as Task);
            }
        });
        
        return Array.from(tasks.values()).sort((a, b) => {
            // Sort incomplete tasks first, then by creation date
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            const aTime = a.createdAt?.toMillis?.() || 0;
            const bTime = b.createdAt?.toMillis?.() || 0;
            return bTime - aTime;
        });
    },

    // Get tasks for a customer
    async getByCustomer(customerId: string): Promise<Task[]> {
        const q = query(
            collection(db, 'tasks'),
            where('customerId', '==', customerId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    },

    // Get tasks for a ticket
    async getByTicket(ticketId: string): Promise<Task[]> {
        const q = query(
            collection(db, 'tasks'),
            where('ticketId', '==', ticketId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    },

    // Get a single task
    async getById(id: string): Promise<Task | null> {
        const docRef = doc(db, 'tasks', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Task;
        }
        return null;
    },

    // Update a task
    async update(id: string, data: Partial<Task>): Promise<void> {
        const docRef = doc(db, 'tasks', id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });
    },

    // Mark task as complete
    async complete(id: string, user: { uid: string; name: string; email?: string }): Promise<void> {
        // Get the task first to check if it's linked to a ticket
        const task = await this.getById(id);
        
        const docRef = doc(db, 'tasks', id);
        await updateDoc(docRef, {
            completed: true,
            completedAt: new Date().toISOString(),
            completedBy: user.uid,
            completedByName: user.name,
            updatedAt: serverTimestamp(),
        });
        
        // Log to ticket timeline if task is linked to a ticket
        if (task && task.ticketId) {
            const { timelineService } = await import('./timeline');
            await timelineService.logTaskCompleted(
                task.ticketId,
                id,
                task.description,
                {
                    uid: user.uid,
                    name: user.name,
                    email: user.email || '',
                }
            );
        }
    },

    // Mark task as incomplete
    async uncomplete(id: string): Promise<void> {
        const docRef = doc(db, 'tasks', id);
        await updateDoc(docRef, {
            completed: false,
            completedAt: null,
            completedBy: null,
            completedByName: null,
            updatedAt: serverTimestamp(),
        });
    },

    // Delete a task
    async delete(id: string): Promise<void> {
        await deleteDoc(doc(db, 'tasks', id));
    },

    // Subscribe to user tasks in real-time
    subscribeToUserTasks(userId: string, callback: (tasks: Task[]) => void) {
        const q = query(
            collection(db, 'tasks'),
            where('createdBy', '==', userId),
            orderBy('createdAt', 'desc')
        );
        
        return onSnapshot(q, async (snapshot) => {
            // Also get assigned tasks
            const assignedQuery = query(
                collection(db, 'tasks'),
                where('assignedTo', 'array-contains', userId),
                orderBy('createdAt', 'desc')
            );
            const assignedSnapshot = await getDocs(assignedQuery);
            
            const tasks = new Map<string, Task>();
            
            snapshot.docs.forEach(doc => {
                tasks.set(doc.id, { id: doc.id, ...doc.data() } as Task);
            });
            
            assignedSnapshot.docs.forEach(doc => {
                if (!tasks.has(doc.id)) {
                    tasks.set(doc.id, { id: doc.id, ...doc.data() } as Task);
                }
            });
            
            const sortedTasks = Array.from(tasks.values()).sort((a, b) => {
                // Sort incomplete tasks first, then by creation date
                if (a.completed !== b.completed) {
                    return a.completed ? 1 : -1;
                }
                const aTime = a.createdAt?.toMillis?.() || 0;
                const bTime = b.createdAt?.toMillis?.() || 0;
                return bTime - aTime;
            });
            
            callback(sortedTasks);
        });
    },

    // Subscribe to customer tasks
    subscribeToCustomerTasks(customerId: string, callback: (tasks: Task[]) => void) {
        const q = query(
            collection(db, 'tasks'),
            where('customerId', '==', customerId),
            orderBy('createdAt', 'desc')
        );
        
        return onSnapshot(q, (snapshot) => {
            const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
            callback(tasks);
        });
    },

    // Subscribe to ticket tasks
    subscribeToTicketTasks(ticketId: string, callback: (tasks: Task[]) => void) {
        const q = query(
            collection(db, 'tasks'),
            where('ticketId', '==', ticketId),
            orderBy('createdAt', 'desc')
        );
        
        return onSnapshot(q, (snapshot) => {
            const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
            callback(tasks);
        });
    },
};
