import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    query,
    where,
    getDocs,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from './index';

export interface HardwareItem {
    id?: string;
    customerId: string;
    hardwareType: string;
    hardwareLabel: string;
    nickname?: string;
    serialNumber?: string;
    macAddress?: string;
    ipAddress?: string;
    quantity: number;
    notes?: string;
    addedBy: string;
    addedAt?: any;
}

export const hardwareService = {
    // Add hardware to customer
    async addHardware(hardwareData: any) {
        // Remove undefined values to avoid Firebase errors
        const cleanData = Object.fromEntries(
            Object.entries(hardwareData).filter(([_, value]) => value !== undefined)
        );
        
        const docRef = await addDoc(collection(db, 'hardware'), {
            ...cleanData,
            addedAt: serverTimestamp(),
        });
        return docRef.id;
    },

    // Get all hardware for a customer
    async getByCustomerId(customerId: string): Promise<HardwareItem[]> {
        const q = query(
            collection(db, 'hardware'),
            where('customerId', '==', customerId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as HardwareItem));
    },

    // Delete hardware item
    async delete(id: string) {
        await deleteDoc(doc(db, 'hardware', id));
    },

    // Get hardware summary for customer (grouped by type)
    async getHardwareSummary(customerId: string) {
        const hardware = await this.getByCustomerId(customerId);
        const summary: { [key: string]: number } = {};
        
        hardware.forEach(item => {
            if (summary[item.hardwareLabel]) {
                summary[item.hardwareLabel] += item.quantity;
            } else {
                summary[item.hardwareLabel] = item.quantity;
            }
        });
        
        return summary;
    },
};
