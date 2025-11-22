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
        
        // Log all changes to timeline
        if (user && oldData) {
            // Log status change
            if (data.status && data.status !== oldData.status) {
                await timelineService.logStatusChange(id, oldData.status, data.status, user);
            }
            
            // Log assignment change
            if (data.assignee && data.assignee !== oldData.assignee) {
                await timelineService.logAssignment(id, data.assignee, user);
            }
            
            // Log progress change
            if (data.progressStatus && data.progressStatus !== oldData.progressStatus) {
                await timelineService.logProgressChange(id, oldData.progressStatus || 'Not Started', data.progressStatus, user);
            }
            
            // Log priority change
            if (data.priority && data.priority !== oldData.priority) {
                await timelineService.logPriorityChange(id, oldData.priority, data.priority, user);
            }
            
            // Log category change
            if (data.category && data.category !== oldData.category) {
                await timelineService.logCategoryChange(id, oldData.category, data.category, user);
            }
            
            // Log subcategory change
            if (data.subcategory && data.subcategory !== oldData.subcategory) {
                await timelineService.logSubcategoryChange(id, oldData.subcategory || 'None', data.subcategory, user);
            }
            
            // Log SLA change
            if (data.slaHours && data.slaHours !== oldData.slaHours) {
                await timelineService.logSLAChange(id, oldData.slaHours, data.slaHours, user);
            }
        }
    },

    // Close ticket
    async closeTicket(id: string, workDone: string, user: any) {
        const docRef = doc(db, 'tickets', id);
        const closedAt = new Date();
        
        await updateDoc(docRef, {
            status: 'resolved',
            progressStatus: 'Completed',
            isClosed: true,
            closedAt: closedAt.toISOString(),
            closedBy: user.name || user.displayName || user.email,
            closedById: user.uid,
            workDone,
            updatedAt: serverTimestamp(),
        });
        
        // Log ticket closure
        await timelineService.logTicketClosed(id, workDone, user);
    },

    // Reopen ticket
    async reopenTicket(id: string, reason: string, user: any) {
        const docRef = doc(db, 'tickets', id);
        
        await updateDoc(docRef, {
            status: 'open',
            progressStatus: 'Not Started',
            isClosed: false,
            closedAt: null,
            closedBy: null,
            closedById: null,
            reopenedAt: new Date().toISOString(),
            reopenedBy: user.name || user.displayName || user.email,
            reopenedById: user.uid,
            reopenReason: reason,
            updatedAt: serverTimestamp(),
        });
        
        // Log ticket reopening
        await timelineService.logTicketReopened(id, reason, user);
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
            updatedAt: serverTimestamp(),
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
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });
    },

    // Generate unique invoice number in format INV-YYYY-NNNNN
    async generateInvoiceNumber(): Promise<string> {
        const currentYear = new Date().getFullYear();
        const q = query(
            collection(db, 'invoices'),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        // Find the highest invoice number for the current year
        let maxNumber = 0;
        querySnapshot.docs.forEach(doc => {
            const invoiceNumber = doc.data().invoiceNumber;
            if (invoiceNumber && invoiceNumber.startsWith(`INV-${currentYear}-`)) {
                const numberPart = parseInt(invoiceNumber.split('-')[2]);
                if (!isNaN(numberPart) && numberPart > maxNumber) {
                    maxNumber = numberPart;
                }
            }
        });
        
        // Increment and format with leading zeros
        const nextNumber = maxNumber + 1;
        return `INV-${currentYear}-${nextNumber.toString().padStart(5, '0')}`;
    },

    // Calculate monthly revenue from paid invoices
    async getMonthlyRevenue(year: number, month: number): Promise<number> {
        const querySnapshot = await getDocs(collection(db, 'invoices'));
        
        let totalRevenue = 0;
        querySnapshot.docs.forEach(doc => {
            const invoice = doc.data();
            if (invoice.status === 'paid' && invoice.issueDate) {
                const issueDate = new Date(invoice.issueDate);
                if (issueDate.getFullYear() === year && issueDate.getMonth() === month - 1) {
                    // Ensure amount is a number
                    const amount = typeof invoice.amount === 'number' ? invoice.amount : parseFloat(invoice.amount) || 0;
                    totalRevenue += amount;
                }
            }
        });
        
        return totalRevenue;
    },

    // Calculate total outstanding amount from pending invoices
    async getOutstandingAmount(): Promise<number> {
        const q = query(
            collection(db, 'invoices'),
            where('status', '==', 'pending')
        );
        const querySnapshot = await getDocs(q);
        
        let totalOutstanding = 0;
        querySnapshot.docs.forEach(doc => {
            const invoice = doc.data();
            // Ensure amount is a number
            const amount = typeof invoice.amount === 'number' ? invoice.amount : parseFloat(invoice.amount) || 0;
            totalOutstanding += amount;
        });
        
        return totalOutstanding;
    },

    // Mark an invoice as paid
    async markAsPaid(id: string): Promise<void> {
        const docRef = doc(db, 'invoices', id);
        await updateDoc(docRef, {
            status: 'paid',
            paidAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
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

    // Calculate stock status based on quantity
    calculateStatus(quantity: number): 'in-stock' | 'low-stock' | 'out-of-stock' {
        if (quantity === 0) return 'out-of-stock';
        if (quantity < 10) return 'low-stock';
        return 'in-stock';
    },

    // Get inventory statistics
    async getStats() {
        const querySnapshot = await getDocs(collection(db, 'inventory'));
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        let totalItems = 0;
        let inStock = 0;
        let lowStock = 0;
        let totalValue = 0;
        
        items.forEach((item: any) => {
            totalItems++;
            
            const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 0;
            const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : parseFloat(item.unitPrice) || 0;
            
            const status = this.calculateStatus(quantity);
            
            if (status === 'in-stock') {
                inStock++;
            } else if (status === 'low-stock') {
                lowStock++;
            }
            
            totalValue += quantity * unitPrice;
        });
        
        return {
            totalItems,
            inStock,
            lowStock,
            totalValue,
        };
    },

    // Get items with low stock (quantity < 10)
    async getLowStockItems() {
        const querySnapshot = await getDocs(collection(db, 'inventory'));
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        return items.filter((item: any) => {
            const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 0;
            return quantity < 10 && quantity > 0;
        });
    },

    // Update inventory quantity
    async updateQuantity(id: string, quantity: number): Promise<void> {
        const docRef = doc(db, 'inventory', id);
        const status = this.calculateStatus(quantity);
        
        await updateDoc(docRef, {
            quantity,
            status,
            updatedAt: serverTimestamp(),
        });
    },
};
