import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    serverTimestamp,
    onSnapshot,
} from 'firebase/firestore';
import { db } from './index';

export interface TimelineEntry {
    id?: string;
    ticketId: string;
    type: 'created' | 'status_changed' | 'assigned' | 'note_added' | 'file_uploaded' | 'priority_changed' | 'customer_message' | 'technician_message' | 'progress_changed' | 'ticket_closed' | 'ticket_reopened' | 'category_changed' | 'subcategory_changed' | 'sla_changed' | 'task_added' | 'task_completed';
    action: string;
    description: string;
    userId: string;
    userName: string;
    userEmail: string;
    isPublic: boolean; // true = visible to client, false = internal only
    metadata?: {
        oldValue?: string;
        newValue?: string;
        fileUrl?: string;
        fileName?: string;
        fileSize?: number;
        whatsappMessageId?: string;
        workDone?: string;
        reason?: string;
        taskId?: string;
        taskDescription?: string;
        assignedToName?: string;
        [key: string]: any;
    };
    createdAt: any;
}

export const timelineService = {
    // Add a timeline entry
    async addEntry(entry: Omit<TimelineEntry, 'id' | 'createdAt'>) {
        const docRef = await addDoc(collection(db, 'timeline'), {
            ...entry,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    },

    // Get all timeline entries for a ticket
    async getByTicketId(ticketId: string): Promise<TimelineEntry[]> {
        const q = query(
            collection(db, 'timeline'),
            where('ticketId', '==', ticketId),
            orderBy('createdAt', 'asc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
        } as TimelineEntry));
    },

    // Listen to timeline changes in real-time
    subscribeToTicketTimeline(ticketId: string, callback: (entries: TimelineEntry[]) => void) {
        const q = query(
            collection(db, 'timeline'),
            where('ticketId', '==', ticketId),
            orderBy('createdAt', 'asc')
        );
        
        return onSnapshot(q, (snapshot) => {
            const entries = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as TimelineEntry));
            callback(entries);
        });
    },

    // Helper: Log ticket creation
    async logTicketCreated(ticketId: string, ticketData: any, user: any) {
        return this.addEntry({
            ticketId,
            type: 'created',
            action: 'Ticket Created',
            description: `Ticket ${ticketData.ticketId} created by ${user.name || user.email}`,
            userId: user.uid || 'system',
            userName: user.name || user.displayName || 'System',
            userEmail: user.email || '',
            isPublic: true,
            metadata: {
                ticketNumber: ticketData.ticketId,
                category: ticketData.category,
                priority: ticketData.priority,
            }
        });
    },

    // Helper: Log status change
    async logStatusChange(ticketId: string, oldStatus: string, newStatus: string, user: any) {
        return this.addEntry({
            ticketId,
            type: 'status_changed',
            action: 'Status Changed',
            description: `Status changed from "${oldStatus}" to "${newStatus}"`,
            userId: user.uid || 'system',
            userName: user.name || user.displayName || 'System',
            userEmail: user.email || '',
            isPublic: true,
            metadata: {
                oldValue: oldStatus,
                newValue: newStatus,
            }
        });
    },

    // Helper: Log assignment
    async logAssignment(ticketId: string, assigneeName: string, user: any) {
        return this.addEntry({
            ticketId,
            type: 'assigned',
            action: 'Technician Assigned',
            description: `Assigned to ${assigneeName}`,
            userId: user.uid || 'system',
            userName: user.name || user.displayName || 'System',
            userEmail: user.email || '',
            isPublic: true,
            metadata: {
                assignee: assigneeName,
            }
        });
    },

    // Helper: Log note
    async logNote(ticketId: string, note: string, user: any, isPublic: boolean) {
        return this.addEntry({
            ticketId,
            type: 'note_added',
            action: isPublic ? 'Public Note Added' : 'Internal Note Added',
            description: note,
            userId: user.uid || 'system',
            userName: user.name || user.displayName || 'System',
            userEmail: user.email || '',
            isPublic,
            metadata: {
                noteType: isPublic ? 'public' : 'internal',
            }
        });
    },

    // Helper: Log file upload
    async logFileUpload(ticketId: string, fileName: string, fileUrl: string, fileSize: number, user: any) {
        return this.addEntry({
            ticketId,
            type: 'file_uploaded',
            action: 'File Uploaded',
            description: `Uploaded file: ${fileName}`,
            userId: user.uid || 'system',
            userName: user.name || user.displayName || 'System',
            userEmail: user.email || '',
            isPublic: true,
            metadata: {
                fileName,
                fileUrl,
                fileSize,
            }
        });
    },

    // Helper: Log WhatsApp message
    async logWhatsAppMessage(ticketId: string, message: string, fromClient: boolean, user: any) {
        return this.addEntry({
            ticketId,
            type: fromClient ? 'customer_message' : 'technician_message',
            action: fromClient ? 'Customer Message (WhatsApp)' : 'Technician Message (WhatsApp)',
            description: message,
            userId: user.uid || 'whatsapp',
            userName: user.name || user.displayName || (fromClient ? 'Customer' : 'Technician'),
            userEmail: user.email || '',
            isPublic: true,
            metadata: {
                source: 'whatsapp',
                fromClient,
            }
        });
    },

    // Helper: Log progress status change
    async logProgressChange(ticketId: string, oldProgress: string, newProgress: string, user: any) {
        return this.addEntry({
            ticketId,
            type: 'progress_changed',
            action: 'Progress Status Updated',
            description: `Progress changed from "${oldProgress}" to "${newProgress}"`,
            userId: user.uid || 'system',
            userName: user.name || user.displayName || 'System',
            userEmail: user.email || '',
            isPublic: true,
            metadata: {
                oldValue: oldProgress,
                newValue: newProgress,
            }
        });
    },

    // Helper: Log ticket closed
    async logTicketClosed(ticketId: string, workDone: string, user: any) {
        return this.addEntry({
            ticketId,
            type: 'ticket_closed',
            action: 'Ticket Closed',
            description: `Ticket closed by ${user.name || user.displayName || user.email}`,
            userId: user.uid || 'system',
            userName: user.name || user.displayName || 'System',
            userEmail: user.email || '',
            isPublic: true,
            metadata: {
                workDone,
            }
        });
    },

    // Helper: Log ticket reopened
    async logTicketReopened(ticketId: string, reason: string, user: any) {
        return this.addEntry({
            ticketId,
            type: 'ticket_reopened',
            action: 'Ticket Reopened',
            description: `Ticket reopened by ${user.name || user.displayName || user.email}`,
            userId: user.uid || 'system',
            userName: user.name || user.displayName || 'System',
            userEmail: user.email || '',
            isPublic: true,
            metadata: {
                reason,
            }
        });
    },

    // Helper: Log priority change
    async logPriorityChange(ticketId: string, oldPriority: string, newPriority: string, user: any) {
        return this.addEntry({
            ticketId,
            type: 'priority_changed',
            action: 'Priority Changed',
            description: `Priority changed from "${oldPriority}" to "${newPriority}"`,
            userId: user.uid || 'system',
            userName: user.name || user.displayName || 'System',
            userEmail: user.email || '',
            isPublic: true,
            metadata: {
                oldValue: oldPriority,
                newValue: newPriority,
            }
        });
    },

    // Helper: Log category change
    async logCategoryChange(ticketId: string, oldCategory: string, newCategory: string, user: any) {
        return this.addEntry({
            ticketId,
            type: 'category_changed',
            action: 'Category Changed',
            description: `Category changed from "${oldCategory}" to "${newCategory}"`,
            userId: user.uid || 'system',
            userName: user.name || user.displayName || 'System',
            userEmail: user.email || '',
            isPublic: false,
            metadata: {
                oldValue: oldCategory,
                newValue: newCategory,
            }
        });
    },

    // Helper: Log subcategory change
    async logSubcategoryChange(ticketId: string, oldSubcategory: string, newSubcategory: string, user: any) {
        return this.addEntry({
            ticketId,
            type: 'subcategory_changed',
            action: 'Subcategory Changed',
            description: `Subcategory changed from "${oldSubcategory}" to "${newSubcategory}"`,
            userId: user.uid || 'system',
            userName: user.name || user.displayName || 'System',
            userEmail: user.email || '',
            isPublic: false,
            metadata: {
                oldValue: oldSubcategory,
                newValue: newSubcategory,
            }
        });
    },

    // Helper: Log SLA change
    async logSLAChange(ticketId: string, oldSLA: string, newSLA: string, user: any) {
        return this.addEntry({
            ticketId,
            type: 'sla_changed',
            action: 'SLA Changed',
            description: `SLA changed from ${oldSLA} hours to ${newSLA} hours`,
            userId: user.uid || 'system',
            userName: user.name || user.displayName || 'System',
            userEmail: user.email || '',
            isPublic: false,
            metadata: {
                oldValue: oldSLA,
                newValue: newSLA,
            }
        });
    },

    // Helper: Log task added
    async logTaskAdded(ticketId: string, taskId: string, taskDescription: string, user: any, assignedToName?: string) {
        const metadata: any = {
            taskId,
            taskDescription,
        };
        
        // Only add assignedToName if it has a value
        if (assignedToName) {
            metadata.assignedToName = assignedToName;
        }
        
        return this.addEntry({
            ticketId,
            type: 'task_added',
            action: 'Task Added',
            description: assignedToName 
                ? `Task created and assigned to ${assignedToName}: ${taskDescription}`
                : `Task created: ${taskDescription}`,
            userId: user.uid || 'system',
            userName: user.name || user.displayName || 'System',
            userEmail: user.email || '',
            isPublic: true,
            metadata,
        });
    },

    // Helper: Log task completed
    async logTaskCompleted(ticketId: string, taskId: string, taskDescription: string, user: any) {
        return this.addEntry({
            ticketId,
            type: 'task_completed',
            action: 'Task Completed',
            description: `Task completed: ${taskDescription}`,
            userId: user.uid || 'system',
            userName: user.name || user.displayName || 'System',
            userEmail: user.email || '',
            isPublic: true,
            metadata: {
                taskId,
                taskDescription,
            }
        });
    },
};
