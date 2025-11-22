import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './index';

export const fileService = {
    // Upload a file
    async upload(file: File, path: string) {
        try {
            const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            return {
                url: downloadURL,
                path: snapshot.ref.fullPath,
                name: file.name,
                size: file.size,
                type: file.type,
            };
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },

    // Upload multiple files
    async uploadMultiple(files: File[], path: string) {
        try {
            const uploadPromises = files.map(file => this.upload(file, path));
            return await Promise.all(uploadPromises);
        } catch (error) {
            console.error('Error uploading files:', error);
            throw error;
        }
    },

    // Delete a file
    async delete(filePath: string) {
        try {
            const fileRef = ref(storage, filePath);
            await deleteObject(fileRef);
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    },

    // Get download URL
    async getDownloadURL(filePath: string) {
        try {
            const fileRef = ref(storage, filePath);
            return await getDownloadURL(fileRef);
        } catch (error) {
            console.error('Error getting download URL:', error);
            throw error;
        }
    },
};
