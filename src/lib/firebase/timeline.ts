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
    type: 'created' | 'status_changed' | 'assigned' | 'note_added' | 'file_uploaded' | 'priority_changed' | 'customer_message' | 'technician_message';
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
};
