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
import { timelineService } from './timeline';

// Ticket Operations
export const ticketService = {
    // Create a new ticket
    async create(ticketData: any, user?: any) {
        const docRef = await addDoc(collection(db, 'tickets'), {
            ...ticketData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        
        // Log ticket creation in timeline
        if (user) {
            await timelineService.logTicketCreated(docRef.id, ticketData, user);
        }
        
        return docRef.id;
    },

    // Get all tickets
    async getAll() {
        const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Get ticket by ID
    async getById(id: string) {
        const docRef = doc(db, 'tickets', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    },

    // Update ticket
    async update(id: string, data: any, user?: any, oldData?: any) {
        const docRef = doc(db, 'tickets', id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });
        
        // Log status change if status was updated
        if (user && oldData && data.status && data.status !== oldData.status) {
            await timelineService.logStatusChange(id, oldData.status, data.status, user);
        }
        
        // Log assignment if assignee was updated
        if (user && oldData && data.assignee && data.assignee !== oldData.assignee) {
            await timelineService.logAssignment(id, data.assignee, user);
        }
    },

    // Delete ticket
    async delete(id: string) {
        await deleteDoc(doc(db, 'tickets', id));
    },

    // Get tickets by status
    async getByStatus(status: string) {
        const q = query(
            collection(db, 'tickets'),
            where('status', '==', status),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Get tickets by company ID
    async getByCompanyId(companyId: string) {
        const q = query(
            collection(db, 'tickets'),
            where('companyId', '==', companyId)
        );
        const querySnapshot = await getDocs(q);
        // Sort in memory instead of in query to avoid index requirement
        const tickets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return tickets.sort((a: any, b: any) => {
            const aTime = a.createdAt?.toMillis?.() || 0;
            const bTime = b.createdAt?.toMillis?.() || 0;
            return bTime - aTime; // Descending order
        });
    },

    // Subscribe to real-time ticket updates
    subscribeToTickets(callback: (tickets: any[]) => void) {
        const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (snapshot) => {
            const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(tickets);
        });
    },

    // Subscribe to a single ticket
    subscribeToTicket(id: string, callback: (ticket: any) => void) {
        const docRef = doc(db, 'tickets', id);
        return onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                callback({ id: doc.id, ...doc.data() });
            }
        });
    },
};

// Customer Operations
export const customerService = {
    async create(customerData: any) {
        const docRef = await addDoc(collection(db, 'customers'), {
            ...customerData,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    },

    async getAll() {
        const querySnapshot = await getDocs(collection(db, 'customers'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async getById(id: string) {
        const docRef = doc(db, 'customers', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    },

    async update(id: string, data: any) {
        const docRef = doc(db, 'customers', id);
        await updateDoc(docRef, data);
    },

    async delete(id: string) {
        await deleteDoc(doc(db, 'customers', id));
    },
};

// Invoice Operations
export const invoiceService = {
    async create(invoiceData: any) {
        const docRef = await addDoc(collection(db, 'invoices'), {
            ...invoiceData,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    },

    async getAll() {
        const q = query(collection(db, 'invoices'), orderBy('issueDate', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async getById(id: string) {
        const docRef = doc(db, 'invoices', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    },

    async update(id: string, data: any) {
        const docRef = doc(db, 'invoices', id);
        await updateDoc(docRef, data);
    },
};

// Inventory Operations
export const inventoryService = {
    async create(itemData: any) {
        const docRef = await addDoc(collection(db, 'inventory'), {
            ...itemData,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    },

    async getAll() {
        const querySnapshot = await getDocs(collection(db, 'inventory'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async update(id: string, data: any) {
        const docRef = doc(db, 'inventory', id);
        await updateDoc(docRef, data);
    },

    async delete(id: string) {
        await deleteDoc(doc(db, 'inventory', id));
    },
};
