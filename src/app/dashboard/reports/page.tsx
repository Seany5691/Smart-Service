"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    Download,
    Calendar,
    TrendingUp,
    Users,
    Ticket,
    Clock,
    Loader2,
} from "lucide-react";
import { reportsService, ReportData } from "@/lib/firebase/reports";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ReportPrintTemplate from "@/components/ReportPrintTemplate";
import { format } from "date-fns";

type ReportType = 'monthly-ticket-summary' | 'customer-activity' | 'sla-performance' | 'revenue-analysis';

export default function ReportsPage() {
    const { user } = useAuth();
    const [recentDownloads, setRecentDownloads] = useState<any[]>([]);
    const [loadingDownloads, setLoadingDownloads] = useState(true);
    const [generatingReport, setGeneratingReport] = useState<string | null>(null);
    const [currentReport, setCurrentReport] = useState<{ data: ReportData; type: ReportType } | null>(null);

    const reports = [
        {
            id: 'monthly-ticket-summary',
            name: "Monthly Ticket Summary",
            description: "Overview of all tickets created and resolved this month",
            type: "Tickets",
            icon: Ticket,
            gradient: "from-blue-500 to-indigo-600",
        },
        {
            id: 'customer-activity',
            name: "Customer Activity Report",
            description: "Detailed breakdown of customer interactions and tickets",
            type: "Customers",
            icon: Users,
            gradient: "from-emerald-500 to-teal-600",
        },
        {
            id: 'sla-performance',
            name: "SLA Performance",
            description: "Analysis of SLA compliance and response times",
            type: "Performance",
            icon: Clock,
            gradient: "from-amber-500 to-orange-600",
        },
        {
            id: 'revenue-analysis',
            name: "Revenue Analysis",
            description: "Financial overview and billing statistics",
            type: "Financial",
            icon: TrendingUp,
            gradient: "from-purple-500 to-pink-600",
        },
    ];

    useEffect(() => {
        loadRecentDownloads();
    }, [user]);

    const loadRecentDownloads = async () => {
        if (!user) return;
        
        try {
            setLoadingDownloads(true);
            const downloads = await reportsService.getRecentDownloads(user.uid, 5);
            setRecentDownloads(downloads);
        } catch (error) {
            console.error('Error loading recent downloads:', error);
        } finally {
            setLoadingDownloads(false);
        }
    };

    const handleGenerateReport = async (reportId: string) => {
        if (!user) {
            toast.error("You must be logged in to generate reports");
            return;
        }

        setGeneratingReport(reportId);

        try {
            let reportData: ReportData;
            let reportType: ReportType;

            // Get current date for default parameters
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;

            switch (reportId) {
                case 'monthly-ticket-summary':
                    reportData = await reportsService.generateMonthlyTicketSummary(currentYear, currentMonth);
                    reportType = 'monthly-ticket-summary';
                    break;
                
                case 'customer-activity':
                    reportData = await reportsService.generateCustomerActivityReport();
                    reportType = 'customer-activity';
                    break;
                
                case 'sla-performance':
                    reportData = await reportsService.generateSLAPerformanceReport();
                    reportType = 'sla-performance';
                    break;
                
                case 'revenue-analysis':
                    // Default to last 3 months
                    const endDate = format(now, 'yyyy-MM-dd');
                    const startDate = format(new Date(now.getFullYear(), now.getMonth() - 3, 1), 'yyyy-MM-dd');
                    reportData = await reportsService.generateRevenueAnalysis(startDate, endDate);
                    reportType = 'revenue-analysis';
                    break;
                
                default:
                    throw new Error('Unknown report type');
            }

            // Set current report for printing
            setCurrentReport({ data: reportData, type: reportType });

            // Save download history
            const report = reports.find(r => r.id === reportId);
            if (report) {
                await reportsService.saveReportDownload(
                    reportId,
                    report.name,
                    user.uid,
                    { year: currentYear, month: currentMonth }
                );
            }

            // Reload recent downloads
            await loadRecentDownloads();

            toast.success("Report generated successfully");

            // Trigger print dialog after a short delay to ensure rendering
            setTimeout(() => {
                reportsService.exportToPDF();
            }, 500);

        } catch (error) {
            console.error('Error generating report:', error);
            toast.error("Failed to generate report");
        } finally {
            setGeneratingReport(null);
        }
    };

    const handleDownloadAgain = async (download: any) => {
        if (!user) return;

        setGeneratingReport(download.reportId);

        try {
            let reportData: ReportData;
            let reportType: ReportType;

            const params = download.parameters || {};
            const year = params.year || new Date().getFullYear();
            const month = params.month || new Date().getMonth() + 1;

            switch (download.reportId) {
                case 'monthly-ticket-summary':
                    reportData = await reportsService.generateMonthlyTicketSummary(year, month);
                    reportType = 'monthly-ticket-summary';
                    break;
                
                case 'customer-activity':
                    reportData = await reportsService.generateCustomerActivityReport();
                    reportType = 'customer-activity';
                    break;
                
                case 'sla-performance':
                    reportData = await reportsService.generateSLAPerformanceReport();
                    reportType = 'sla-performance';
                    break;
                
                case 'revenue-analysis':
                    const now = new Date();
                    const endDate = format(now, 'yyyy-MM-dd');
                    const startDate = format(new Date(now.getFullYear(), now.getMonth() - 3, 1), 'yyyy-MM-dd');
                    reportData = await reportsService.generateRevenueAnalysis(startDate, endDate);
                    reportType = 'revenue-analysis';
                    break;
                
                default:
                    throw new Error('Unknown report type');
            }

            setCurrentReport({ data: reportData, type: reportType });

            toast.success("Report regenerated successfully");

            setTimeout(() => {
                reportsService.exportToPDF();
            }, 500);

        } catch (error) {
            console.error('Error regenerating report:', error);
            toast.error("Failed to regenerate report");
        } finally {
            setGeneratingReport(null);
        }
    };

    return (
        <>
            <div className="space-y-6">
                {/* Header with Gradient */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-grid-white/10"></div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                <FileText className="h-6 w-6" />
                            </div>
                            <h1 className="text-4xl font-bold">Reports</h1>
                        </div>
                        <p className="text-cyan-100 mt-2">
                            Generate and download business reports
                        </p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card className="relative overflow-hidden border-0 shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-5 pointer-events-none"></div>
                        <CardContent className="relative p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Available Reports</p>
                                    <div className="text-4xl font-bold mt-2">{reports.length}</div>
                                </div>
                                <div className="rounded-2xl p-4 bg-blue-500/10">
                                    <FileText className="h-8 w-8 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-0 shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-5 pointer-events-none"></div>
                        <CardContent className="relative p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Recent Downloads</p>
                                    <div className="text-4xl font-bold mt-2">
                                        {loadingDownloads ? "..." : recentDownloads.length}
                                    </div>
                                </div>
                                <div className="rounded-2xl p-4 bg-emerald-500/10">
                                    <Download className="h-8 w-8 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-0 shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-5 pointer-events-none"></div>
                        <CardContent className="relative p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Report Types</p>
                                    <div className="text-4xl font-bold mt-2">4</div>
                                </div>
                                <div className="rounded-2xl p-4 bg-purple-500/10">
                                    <TrendingUp className="h-8 w-8 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-0 shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 opacity-5 pointer-events-none"></div>
                        <CardContent className="relative p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Current Month</p>
                                    <div className="text-2xl font-bold mt-2">{format(new Date(), 'MMM yyyy')}</div>
                                </div>
                                <div className="rounded-2xl p-4 bg-amber-500/10">
                                    <Calendar className="h-8 w-8 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Available Reports */}
                <Card className="shadow-lg border-0">
                    <CardHeader className="border-b bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20">
                        <CardTitle>Available Reports</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {reports.map((report) => (
                                <Card key={report.id} className="group hover:shadow-xl transition-all border-0 shadow-md overflow-hidden">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${report.gradient} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`}></div>
                                    <CardContent className="relative p-6">
                                        <div className="flex items-start gap-4">
                                            <div className={`rounded-xl p-3 bg-gradient-to-br ${report.gradient} shadow-lg`}>
                                                <report.icon className="h-6 w-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg mb-1">{report.name}</h3>
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {report.description}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="outline">{report.type}</Badge>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className="gap-2"
                                                        onClick={() => handleGenerateReport(report.id)}
                                                        disabled={generatingReport === report.id}
                                                    >
                                                        {generatingReport === report.id ? (
                                                            <>
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                Generating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Download className="h-4 w-4" />
                                                                Generate
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Downloads */}
                <Card className="shadow-lg border-0">
                    <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                        <CardTitle>Recent Downloads</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {loadingDownloads ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : recentDownloads.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No reports downloaded yet</p>
                                <p className="text-sm mt-1">Generate a report to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentDownloads.map((download) => {
                                    const report = reports.find(r => r.id === download.reportId);
                                    const Icon = report?.icon || FileText;
                                    const downloadDate = download.downloadedAt?.toDate ? 
                                        download.downloadedAt.toDate() : 
                                        new Date(download.downloadedAt);

                                    return (
                                        <div key={download.id} className="flex items-center justify-between p-4 rounded-xl border hover:bg-accent/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                    <Icon className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{download.reportName}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Downloaded on {format(downloadDate, 'MMM dd, yyyy')}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="gap-2"
                                                onClick={() => handleDownloadAgain(download)}
                                                disabled={generatingReport === download.reportId}
                                            >
                                                {generatingReport === download.reportId ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Download className="h-4 w-4" />
                                                )}
                                                Download Again
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Print Template - Hidden on screen, visible when printing */}
            {currentReport && (
                <ReportPrintTemplate 
                    report={currentReport.data} 
                    reportType={currentReport.type}
                />
            )}
        </>
    );
}
