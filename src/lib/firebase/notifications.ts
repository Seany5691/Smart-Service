import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    serverTimestamp,
    onSnapshot,
} from 'firebase/firestore';
import { db } from './index';

export interface Notification {
    id?: string;
    userId: string;
    title: string;
    message: string;
    type: 'ticket' | 'customer' | 'system' | 'sla';
    read: boolean;
    link?: string;
    createdAt?: any;
}

export const notificationService = {
    // Create a notification
    async create(notification: Omit<Notification, 'id' | 'createdAt'>) {
        const docRef = await addDoc(collection(db, 'notifications'), {
            ...notification,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    },

    // Get notifications for a user
    async getByUserId(userId: string): Promise<Notification[]> {
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        const notifications = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Notification));
        
        // Sort in memory instead of using orderBy to avoid composite index
        return notifications.sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() || 0;
            const bTime = b.createdAt?.toMillis?.() || 0;
            return bTime - aTime;
        });
    },

    // Subscribe to notifications
    subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId)
        );

        return onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Notification));
            
            // Sort in memory instead of using orderBy to avoid composite index
            const sorted = notifications.sort((a, b) => {
                const aTime = a.createdAt?.toMillis?.() || 0;
                const bTime = b.createdAt?.toMillis?.() || 0;
                return bTime - aTime;
            });
            
            callback(sorted);
        });
    },

    // Mark notification as read
    async markAsRead(notificationId: string) {
        await updateDoc(doc(db, 'notifications', notificationId), {
            read: true,
        });
    },

    // Mark all as read
    async markAllAsRead(userId: string) {
        const notifications = await this.getByUserId(userId);
        const unreadNotifications = notifications.filter(n => !n.read);
        
        await Promise.all(
            unreadNotifications.map(n => 
                n.id ? this.markAsRead(n.id) : Promise.resolve()
            )
        );
    },

    // Get unread count
    async getUnreadCount(userId: string): Promise<number> {
        const notifications = await this.getByUserId(userId);
        return notifications.filter(n => !n.read).length;
    },

    // Create ticket notification
    async notifyNewTicket(userId: string, ticketId: string, ticketTitle: string) {
        await this.create({
            userId,
            title: 'New Ticket Created',
            message: `Ticket ${ticketId}: ${ticketTitle}`,
            type: 'ticket',
            read: false,
            link: `/dashboard/tickets/${ticketId}`,
        });
    },

    // Create SLA warning notification
    async notifySLAWarning(userId: string, ticketId: string, hoursRemaining: number) {
        await this.create({
            userId,
            title: 'SLA Warning',
            message: `Ticket ${ticketId} SLA breach in ${hoursRemaining} hours`,
            type: 'sla',
            read: false,
            link: `/dashboard/tickets/${ticketId}`,
        });
    },
};
