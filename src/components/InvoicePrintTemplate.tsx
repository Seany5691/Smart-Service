"use client";

import { formatCurrency } from "@/lib/utils/currency";
import { format } from "date-fns";

interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

interface Invoice {
    id?: string;
    invoiceNumber: string;
    customerId: string;
    customerName: string;
    amount: number;
    issueDate: string;
    dueDate: string;
    status: string;
    items: InvoiceItem[];
    notes?: string;
}

interface InvoicePrintTemplateProps {
    invoice: Invoice;
}

export default function InvoicePrintTemplate({ invoice }: InvoicePrintTemplateProps) {
    return (
        <div className="print-template hidden print:block pointer-events-none">
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-template,
                    .print-template * {
                        visibility: visible;
                    }
                    .print-template {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 40px;
                        background: white;
                        color: black;
                    }
                    @page {
                        margin: 0;
                        size: A4;
                    }
                }
            `}</style>

            <div className="max-w-4xl mx-auto bg-white text-black p-8">
                {/* Header */}
                <div className="border-b-4 border-gray-800 pb-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">INVOICE</h1>
                            <p className="text-lg font-semibold text-gray-700">{invoice.invoiceNumber}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Smart Ticketing</h2>
                            <p className="text-sm text-gray-600">Service Management System</p>
                            <p className="text-sm text-gray-600">support@smartticketing.com</p>
                            <p className="text-sm text-gray-600">+27 11 123 4567</p>
                        </div>
                    </div>
                </div>

                {/* Invoice Details */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To:</h3>
                        <p className="text-lg font-semibold text-gray-900">{invoice.customerName}</p>
                    </div>
                    <div className="text-right">
                        <div className="space-y-1">
                            <div className="flex justify-end gap-4">
                                <span className="text-sm font-semibold text-gray-500">Issue Date:</span>
                                <span className="text-sm text-gray-900">
                                    {format(new Date(invoice.issueDate), 'dd MMM yyyy')}
                                </span>
                            </div>
                            <div className="flex justify-end gap-4">
                                <span className="text-sm font-semibold text-gray-500">Due Date:</span>
                                <span className="text-sm text-gray-900">
                                    {format(new Date(invoice.dueDate), 'dd MMM yyyy')}
                                </span>
                            </div>
                            <div className="flex justify-end gap-4">
                                <span className="text-sm font-semibold text-gray-500">Status:</span>
                                <span className={`text-sm font-semibold uppercase ${
                                    invoice.status === 'paid' ? 'text-green-600' : 'text-amber-600'
                                }`}>
                                    {invoice.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Line Items Table */}
                <div className="mb-8">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b-2 border-gray-800">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase">
                                    Description
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 uppercase w-24">
                                    Qty
                                </th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 uppercase w-32">
                                    Unit Price
                                </th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 uppercase w-32">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item, index) => (
                                <tr key={index} className="border-b border-gray-200">
                                    <td className="py-3 px-4 text-sm text-gray-900">{item.description}</td>
                                    <td className="py-3 px-4 text-sm text-center text-gray-900">{item.quantity}</td>
                                    <td className="py-3 px-4 text-sm text-right text-gray-900">
                                        {formatCurrency(item.unitPrice)}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">
                                        {formatCurrency(item.total)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                    <div className="w-64">
                        <div className="border-t-2 border-gray-800 pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-lg font-semibold text-gray-700">Subtotal:</span>
                                <span className="text-lg font-semibold text-gray-900">
                                    {formatCurrency(invoice.amount)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-800 text-white p-4 rounded">
                                <span className="text-xl font-bold">Total Amount:</span>
                                <span className="text-2xl font-bold">
                                    {formatCurrency(invoice.amount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                    <div className="mb-8 p-4 bg-gray-50 rounded border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Notes:</h3>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
                    </div>
                )}

                {/* Footer */}
                <div className="border-t border-gray-300 pt-6 mt-8">
                    <div className="text-center text-sm text-gray-500">
                        <p className="mb-1">Thank you for your business!</p>
                        <p>For any questions regarding this invoice, please contact us at support@smartticketing.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
