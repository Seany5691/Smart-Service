"use client";

import { formatCurrency } from "@/lib/utils/currency";
import { format } from "date-fns";
import { ReportData } from "@/lib/firebase/reports";

interface ReportPrintTemplateProps {
    report: ReportData;
    reportType: 'monthly-ticket-summary' | 'customer-activity' | 'sla-performance' | 'revenue-analysis';
}

export default function ReportPrintTemplate({ report, reportType }: ReportPrintTemplateProps) {
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
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">{report.title}</h1>
                            <p className="text-sm text-gray-600">
                                Generated: {format(new Date(report.generatedAt), 'dd MMM yyyy HH:mm')}
                            </p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Smart Ticketing</h2>
                            <p className="text-sm text-gray-600">Service Management System</p>
                            <p className="text-sm text-gray-600">support@smartticketing.com</p>
                        </div>
                    </div>
                </div>

                {/* Report Content Based on Type */}
                {reportType === 'monthly-ticket-summary' && (
                    <MonthlyTicketSummaryContent report={report} />
                )}
                
                {reportType === 'customer-activity' && (
                    <CustomerActivityContent report={report} />
                )}
                
                {reportType === 'sla-performance' && (
                    <SLAPerformanceContent report={report} />
                )}
                
                {reportType === 'revenue-analysis' && (
                    <RevenueAnalysisContent report={report} />
                )}

                {/* Footer */}
                <div className="border-t border-gray-300 pt-6 mt-8">
                    <div className="text-center text-sm text-gray-500">
                        <p className="mb-1">Smart Ticketing - Service Management System</p>
                        <p>This report is confidential and intended for internal use only.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Monthly Ticket Summary Report Content
function MonthlyTicketSummaryContent({ report }: { report: ReportData }) {
    return (
        <>
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Created</p>
                    <p className="text-2xl font-bold text-gray-900">{report.summary.totalCreated}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Resolved</p>
                    <p className="text-2xl font-bold text-gray-900">{report.summary.totalResolved}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Resolution Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{report.summary.resolutionRate}%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Avg Resolution</p>
                    <p className="text-2xl font-bold text-gray-900">{report.summary.avgResolutionTimeHours}h</p>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-800">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase">Category</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 uppercase">Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(report.summary.categoryBreakdown).map(([category, count]) => (
                            <tr key={category} className="border-b border-gray-200">
                                <td className="py-3 px-4 text-sm text-gray-900 capitalize">{category}</td>
                                <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">{count as number}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Priority Breakdown */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Breakdown</h3>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-800">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase">Priority</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 uppercase">Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(report.summary.priorityBreakdown).map(([priority, count]) => (
                            <tr key={priority} className="border-b border-gray-200">
                                <td className="py-3 px-4 text-sm text-gray-900 capitalize">{priority}</td>
                                <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">{count as number}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

// Customer Activity Report Content
function CustomerActivityContent({ report }: { report: ReportData }) {
    return (
        <>
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{report.summary.totalCustomers}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Tickets</p>
                    <p className="text-2xl font-bold text-gray-900">{report.summary.totalTickets}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Avg per Customer</p>
                    <p className="text-2xl font-bold text-gray-900">{report.summary.avgTicketsPerCustomer}</p>
                </div>
            </div>

            {/* Customer Details */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Activity Details</h3>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-800">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase">Customer</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 uppercase">Total</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 uppercase">Open</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 uppercase">Resolved</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 uppercase">Avg Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.data.customers.map((customer: any, index: number) => (
                            <tr key={index} className="border-b border-gray-200">
                                <td className="py-3 px-4 text-sm text-gray-900">{customer.customerName}</td>
                                <td className="py-3 px-4 text-sm text-center text-gray-900">{customer.totalTickets}</td>
                                <td className="py-3 px-4 text-sm text-center text-gray-900">{customer.openTickets}</td>
                                <td className="py-3 px-4 text-sm text-center text-gray-900">{customer.resolvedTickets}</td>
                                <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">
                                    {customer.avgResolutionTimeHours}h
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

// SLA Performance Report Content
function SLAPerformanceContent({ report }: { report: ReportData }) {
    return (
        <>
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Tickets</p>
                    <p className="text-2xl font-bold text-gray-900">{report.summary.totalTickets}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Compliant</p>
                    <p className="text-2xl font-bold text-green-600">{report.summary.compliantTickets}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Breached</p>
                    <p className="text-2xl font-bold text-red-600">{report.summary.breachedTickets}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Compliance Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{report.summary.complianceRate}%</p>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Avg Resolution Time</p>
                    <p className="text-xl font-bold text-gray-900">{report.summary.avgResolutionTimeHours} hours</p>
                </div>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Avg SLA Time</p>
                    <p className="text-xl font-bold text-gray-900">{report.summary.avgSLATimeHours} hours</p>
                </div>
            </div>

            {/* Priority Breakdown */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SLA Performance by Priority</h3>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-800">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase">Priority</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 uppercase">Total</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 uppercase">Compliant</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 uppercase">Breached</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 uppercase">Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(report.summary.priorityBreakdown).map(([priority, data]: [string, any]) => (
                            <tr key={priority} className="border-b border-gray-200">
                                <td className="py-3 px-4 text-sm text-gray-900 capitalize">{priority}</td>
                                <td className="py-3 px-4 text-sm text-center text-gray-900">{data.total}</td>
                                <td className="py-3 px-4 text-sm text-center text-green-600">{data.compliant}</td>
                                <td className="py-3 px-4 text-sm text-center text-red-600">{data.breached}</td>
                                <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">
                                    {data.total > 0 ? Math.round((data.compliant / data.total) * 100) : 0}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Breach Details */}
            {report.data.breachDetails && report.data.breachDetails.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">SLA Breach Details</h3>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b-2 border-gray-800">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase">Ticket</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 uppercase">Priority</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 uppercase">Breach Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.data.breachDetails.slice(0, 10).map((breach: any, index: number) => (
                                <tr key={index} className="border-b border-gray-200">
                                    <td className="py-3 px-4 text-sm text-gray-900">{breach.title}</td>
                                    <td className="py-3 px-4 text-sm text-center text-gray-900 capitalize">{breach.priority}</td>
                                    <td className="py-3 px-4 text-sm text-right text-red-600 font-semibold">
                                        +{breach.breachTimeHours}h
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {report.data.breachDetails.length > 10 && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Showing top 10 of {report.data.breachDetails.length} breaches
                        </p>
                    )}
                </div>
            )}
        </>
    );
}

// Revenue Analysis Report Content
function RevenueAnalysisContent({ report }: { report: ReportData }) {
    return (
        <>
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Revenue</p>
                    <p className="text-xl font-bold text-gray-900">{report.summary.totalRevenue}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Paid</p>
                    <p className="text-xl font-bold text-green-600">{report.summary.paidRevenue}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Pending</p>
                    <p className="text-xl font-bold text-amber-600">{report.summary.pendingRevenue}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Overdue</p>
                    <p className="text-xl font-bold text-red-600">{report.summary.overdueRevenue}</p>
                </div>
            </div>

            {/* Invoice Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Invoices</p>
                    <p className="text-2xl font-bold text-gray-900">{report.summary.totalInvoices}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Paid</p>
                    <p className="text-2xl font-bold text-green-600">{report.summary.paidInvoices}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Pending</p>
                    <p className="text-2xl font-bold text-amber-600">{report.summary.pendingInvoices}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Avg Value</p>
                    <p className="text-2xl font-bold text-gray-900">{report.summary.avgInvoiceValue}</p>
                </div>
            </div>

            {/* Revenue by Customer */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Customer</h3>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-800">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase">Customer</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 uppercase">Total</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 uppercase">Paid</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 uppercase">Pending</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.summary.customerRevenue.map((customer: any, index: number) => (
                            <tr key={index} className="border-b border-gray-200">
                                <td className="py-3 px-4 text-sm text-gray-900">{customer.name}</td>
                                <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">
                                    {formatCurrency(customer.total)}
                                </td>
                                <td className="py-3 px-4 text-sm text-right text-green-600">
                                    {formatCurrency(customer.paid)}
                                </td>
                                <td className="py-3 px-4 text-sm text-right text-amber-600">
                                    {formatCurrency(customer.pending)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Monthly Trends */}
            {report.data.monthlyTrends && Object.keys(report.data.monthlyTrends).length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Payment Trends</h3>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b-2 border-gray-800">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase">Month</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 uppercase">Invoices</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 uppercase">Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(report.data.monthlyTrends)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([month, data]: [string, any]) => (
                                    <tr key={month} className="border-b border-gray-200">
                                        <td className="py-3 px-4 text-sm text-gray-900">{month}</td>
                                        <td className="py-3 px-4 text-sm text-center text-gray-900">{data.invoices}</td>
                                        <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">
                                            {formatCurrency(data.revenue)}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
