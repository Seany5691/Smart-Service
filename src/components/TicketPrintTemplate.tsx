"use client";

import { format } from "date-fns";
import { TimelineEntry } from "@/lib/firebase/timeline";

interface TicketPrintTemplateProps {
    ticket: any;
    timeline: TimelineEntry[];
}

export default function TicketPrintTemplate({ ticket, timeline }: TicketPrintTemplateProps) {
    const calculateDuration = (startDate: any, endDate?: any) => {
        const start = startDate?.toDate ? startDate.toDate() : new Date(startDate);
        const end = endDate ? (endDate.toDate ? endDate.toDate() : new Date(endDate)) : new Date();
        
        const diffMs = end.getTime() - start.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''}, ${diffHours} hour${diffHours > 1 ? 's' : ''}, ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''}, ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
        } else {
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
        }
    };

    const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return "N/A";
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return format(date, "dd MMM yyyy HH:mm");
        } catch {
            return "N/A";
        }
    };

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
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">Ticket Report</h1>
                            <p className="text-2xl font-mono text-gray-700 mb-2">{ticket.ticketId}</p>
                            <p className="text-sm text-gray-600">
                                Generated: {format(new Date(), 'dd MMM yyyy HH:mm')}
                            </p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Smart Ticketing</h2>
                            <p className="text-sm text-gray-600">Service Management System</p>
                            <p className="text-sm text-gray-600">support@smartticketing.com</p>
                        </div>
                    </div>
                </div>

                {/* Ticket Status Banner */}
                <div className={`p-4 mb-6 rounded border-2 ${
                    ticket.isClosed 
                        ? 'bg-red-50 border-red-300' 
                        : 'bg-green-50 border-green-300'
                }`}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-lg font-bold text-gray-900">
                                {ticket.isClosed ? 'TICKET CLOSED' : 'TICKET OPEN'}
                            </p>
                            <p className="text-sm text-gray-700">
                                {ticket.isClosed 
                                    ? `Completed in: ${calculateDuration(ticket.createdAt, ticket.closedAt)}`
                                    : `Open for: ${calculateDuration(ticket.createdAt)}`
                                }
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Progress Status</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {ticket.progressStatus || 'Not Started'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Ticket Details */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                        Ticket Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Title</p>
                            <p className="text-sm text-gray-900">{ticket.title}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</p>
                            <p className="text-sm text-gray-900 capitalize">{ticket.status}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Customer</p>
                            <p className="text-sm text-gray-900">{ticket.customer || ticket.companyName}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Contact</p>
                            <p className="text-sm text-gray-900">{ticket.contactName || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Category</p>
                            <p className="text-sm text-gray-900 capitalize">{ticket.category}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Subcategory</p>
                            <p className="text-sm text-gray-900">{ticket.subcategory || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Priority</p>
                            <p className="text-sm text-gray-900 capitalize">{ticket.priority}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Assigned To</p>
                            <p className="text-sm text-gray-900">{ticket.assignee}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Created By</p>
                            <p className="text-sm text-gray-900">{ticket.createdBy}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Created At</p>
                            <p className="text-sm text-gray-900">{formatTimestamp(ticket.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">SLA</p>
                            <p className="text-sm text-gray-900">{ticket.slaHours ? `${ticket.slaHours} Hours` : 'N/A'}</p>
                        </div>
                        {ticket.isClosed && (
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Closed At</p>
                                <p className="text-sm text-gray-900">{formatTimestamp(ticket.closedAt)}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                        Description
                    </h3>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{ticket.description}</p>
                </div>

                {/* Work Done (if closed) */}
                {ticket.isClosed && ticket.workDone && (
                    <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Work Completed</h3>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap mb-2">{ticket.workDone}</p>
                        <p className="text-xs text-gray-600">
                            Closed by {ticket.closedBy} on {formatTimestamp(ticket.closedAt)}
                        </p>
                    </div>
                )}

                {/* Reopen Reason (if reopened) */}
                {ticket.reopenReason && (
                    <div className="mb-6 p-4 bg-amber-50 rounded border border-amber-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Reopen Reason</h3>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap mb-2">{ticket.reopenReason}</p>
                        <p className="text-xs text-gray-600">
                            Reopened by {ticket.reopenedBy} on {formatTimestamp(ticket.reopenedAt)}
                        </p>
                    </div>
                )}

                {/* Hardware */}
                {ticket.hardware && ticket.hardware.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                            Customer Hardware
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {ticket.hardware.map((item: any, index: number) => (
                                <div key={index} className="p-3 bg-gray-50 rounded border border-gray-200">
                                    <p className="font-medium text-sm text-gray-900">{item.label}</p>
                                    {item.nickname && (
                                        <p className="text-xs text-gray-600 italic">"{item.nickname}"</p>
                                    )}
                                    {item.serialNumber && (
                                        <p className="text-xs text-gray-600">Serial: {item.serialNumber}</p>
                                    )}
                                    {item.macAddress && (
                                        <p className="text-xs text-gray-600">MAC: {item.macAddress}</p>
                                    )}
                                    {item.ipAddress && (
                                        <p className="text-xs text-gray-600">IP: {item.ipAddress}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Complete Timeline */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                        Complete Activity Timeline
                    </h3>
                    <div className="space-y-3">
                        {timeline.map((entry, index) => (
                            <div key={entry.id || index} className="border-l-2 border-gray-300 pl-4 pb-3">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="font-semibold text-sm text-gray-900">{entry.action}</p>
                                    <p className="text-xs text-gray-500">{formatTimestamp(entry.createdAt)}</p>
                                </div>
                                <p className="text-sm text-gray-700 mb-1">{entry.description}</p>
                                
                                {/* Show work done for closed tickets */}
                                {entry.type === 'ticket_closed' && entry.metadata?.workDone && (
                                    <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                                        <p className="text-xs font-medium text-gray-600 mb-1">Work Done:</p>
                                        <p className="text-xs text-gray-900">{entry.metadata.workDone}</p>
                                    </div>
                                )}
                                
                                {/* Show reason for reopened tickets */}
                                {entry.type === 'ticket_reopened' && entry.metadata?.reason && (
                                    <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                                        <p className="text-xs font-medium text-gray-600 mb-1">Reason:</p>
                                        <p className="text-xs text-gray-900">{entry.metadata.reason}</p>
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-gray-500">By: {entry.userName}</p>
                                    {!entry.isPublic && (
                                        <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                                            Internal
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {timeline.length === 0 && (
                            <p className="text-center text-gray-500 py-4">No activity recorded</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-300 pt-6 mt-8">
                    <div className="text-center text-sm text-gray-500">
                        <p className="mb-1">Smart Ticketing - Service Management System</p>
                        <p>This report is confidential and intended for customer records.</p>
                        <p className="mt-2 text-xs">
                            Report generated on {format(new Date(), 'dd MMMM yyyy')} at {format(new Date(), 'HH:mm')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
