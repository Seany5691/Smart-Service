/**
 * Generate PDF using browser's native print functionality
 * @param invoiceNumber - The invoice number to use in the filename
 */
export function generatePDF(invoiceNumber: string): void {
    // Set document title for the PDF filename
    const originalTitle = document.title;
    document.title = `Invoice_${invoiceNumber}`;
    
    // Trigger print dialog
    window.print();
    
    // Restore original title after a short delay
    setTimeout(() => {
        document.title = originalTitle;
    }, 100);
}
