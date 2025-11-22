import {
    collection,
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from './index';

// Hardware options
export const hardwareOptions = [
    { value: "yealink-w73h", label: "Yealink W73H", category: "Phone" },
    { value: "yealink-w73p", label: "Yealink W73P", category: "Phone" },
    { value: "fanvil-v62-pro", label: "Fanvil V62 Pro", category: "Phone" },
    { value: "reyee-cloud-router", label: "Reyee Cloud Router", category: "Network" },
    { value: "yealink-t46s", label: "Yealink T46S", category: "Phone" },
    { value: "yealink-t54w", label: "Yealink T54W", category: "Phone" },
    { value: "grandstream-gxp2170", label: "Grandstream GXP2170", category: "Phone" },
    { value: "cisco-spa504g", label: "Cisco SPA504G", category: "Phone" },
];

// Default categories and subcategories
export const defaultCategories = {
    telephony: {
        name: "Telephony",
        subcategories: [
            "Voice Quality Issues",
            "Broken Phone",
            "Calls Not Going Out",
            "Calls Not Coming In",
            "Voicemail Issues",
            "Extension Not Working",
            "Conference Call Issues",
            "Call Transfer Issues",
            "Other"
        ]
    },
    copiers: {
        name: "Copiers",
        subcategories: [
            "Paper Jam",
            "Print Quality Issues",
            "Scanner Not Working",
            "Toner Issues",
            "Network Connection",
            "Error Codes",
            "Maintenance Required",
            "Other"
        ]
    },
    cctv: {
        name: "CCTV",
        subcategories: [
            "Camera Offline",
            "Poor Image Quality",
            "Recording Issues",
            "Playback Issues",
            "Network Issues",
            "Storage Full",
            "Motion Detection",
            "Other"
        ]
    },
    internet: {
        name: "Internet",
        subcategories: [
            "No Connection",
            "Slow Speed",
            "Intermittent Connection",
            "WiFi Issues",
            "Router Issues",
            "Network Configuration",
            "Other"
        ]
    },
    office: {
        name: "Office Automation",
        subcategories: [
            "Software Issues",
            "Hardware Issues",
            "Email Problems",
            "Printer Issues",
            "Network Issues",
            "Other"
        ]
    }
};

// SLA options (in hours)
export const slaOptions = [
    { value: "2", label: "2 Hours" },
    { value: "4", label: "4 Hours" },
    { value: "8", label: "8 Hours" },
    { value: "12", label: "12 Hours" },
    { value: "24", label: "24 Hours" },
    { value: "48", label: "48 Hours" },
    { value: "72", label: "72 Hours" },
];

// Priority options
export const priorityOptions = [
    { value: "low", label: "Low", slaHours: 48 },
    { value: "medium", label: "Medium", slaHours: 24 },
    { value: "high", label: "High", slaHours: 8 },
    { value: "critical", label: "Critical", slaHours: 2 },
];

export const settingsService = {
    // Get categories configuration
    async getCategories() {
        try {
            const docRef = doc(db, 'settings', 'categories');
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return docSnap.data().categories || defaultCategories;
            }
            
            // Initialize with defaults if not exists
            await this.updateCategories(defaultCategories);
            return defaultCategories;
        } catch (error) {
            console.error("Error getting categories:", error);
            return defaultCategories;
        }
    },

    // Update categories configuration
    async updateCategories(categories: any) {
        const docRef = doc(db, 'settings', 'categories');
        await setDoc(docRef, {
            categories,
            updatedAt: serverTimestamp(),
        });
    },

    // Add subcategory to a category
    async addSubcategory(categoryKey: string, subcategory: string) {
        const categories = await this.getCategories();
        if (categories[categoryKey]) {
            categories[categoryKey].subcategories.push(subcategory);
            await this.updateCategories(categories);
        }
    },

    // Remove subcategory from a category
    async removeSubcategory(categoryKey: string, subcategory: string) {
        const categories = await this.getCategories();
        if (categories[categoryKey]) {
            categories[categoryKey].subcategories = categories[categoryKey].subcategories.filter(
                (s: string) => s !== subcategory
            );
            await this.updateCategories(categories);
        }
    },

    // Get technicians/users for assignment
    async getTechnicians() {
        // This would typically come from a users collection
        // For now, return a default list
        return [
            { id: "unassigned", name: "Unassigned" },
            { id: "tech1", name: "John Smith" },
            { id: "tech2", name: "Sarah Johnson" },
            { id: "tech3", name: "Mike Williams" },
            { id: "tech4", name: "Emily Brown" },
        ];
    },
};
