"use client";

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
} from "lucide-react";

export default function ReportsPage() {
    const reports = [
        {
            id: 1,
            name: "Monthly Ticket Summary",
            description: "Overview of all tickets created and resolved this month",
            type: "Tickets",
            lastGenerated: "2025-03-15",
            icon: Ticket,
            gradient: "from-blue-500 to-indigo-600",
        },
        {
            id: 2,
            name: "Customer Activity Report",
            description: "Detailed breakdown of customer interactions and tickets",
            type: "Customers",
            lastGenerated: "2025-03-10",
            icon: Users,
            gradient: "from-emerald-500 to-teal-600",
        },
        {
            id: 3,
            name: "SLA Performance",
            description: "Analysis of SLA compliance and response times",
            type: "Performance",
            lastGenerated: "2025-03-12",
            icon: Clock,
            gradient: "from-amber-500 to-orange-600",
        },
        {
            id: 4,
            name: "Revenue Analysis",
            description: "Financial overview and billing statistics",
            type: "Financial",
            lastGenerated: "2025-03-01",
            icon: TrendingUp,
            gradient: "from-purple-500 to-pink-600",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/10"></div>
                <div className="relative flex items-center justify-between">
                    <div>
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
                    <Button 
                        size="lg"
                        className="gap-2 bg-white text-cyan-600 hover:bg-cyan-50 shadow-lg"
                    >
                        <Calendar className="h-5 w-5" />
                        Schedule Report
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="relative overflow-hidden border-0 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-5"></div>
                    <CardContent className="relative p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                                <div className="text-4xl font-bold mt-2">{reports.length}</div>
                            </div>
                            <div className="rounded-2xl p-4 bg-blue-500/10">
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-0 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-5"></div>
                    <CardContent className="relative p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                                <div className="text-4xl font-bold mt-2">12</div>
                            </div>
                            <div className="rounded-2xl p-4 bg-emerald-500/10">
                                <Calendar className="h-8 w-8 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-0 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-5"></div>
                    <CardContent className="relative p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                                <div className="text-4xl font-bold mt-2">3</div>
                            </div>
                            <div className="rounded-2xl p-4 bg-purple-500/10">
                                <Clock className="h-8 w-8 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-0 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 opacity-5"></div>
                    <CardContent className="relative p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Downloads</p>
                                <div className="text-4xl font-bold mt-2">48</div>
                            </div>
                            <div className="rounded-2xl p-4 bg-amber-500/10">
                                <Download className="h-8 w-8 text-amber-600" />
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
                                <div className={`absolute inset-0 bg-gradient-to-br ${report.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
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
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">{report.type}</Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        Last: {report.lastGenerated}
                                                    </span>
                                                </div>
                                                <Button size="sm" variant="outline" className="gap-2">
                                                    <Download className="h-4 w-4" />
                                                    Generate
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
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl border hover:bg-accent/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Monthly Ticket Summary</p>
                                        <p className="text-xs text-muted-foreground">Downloaded on Mar {15 - i}, 2025</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <Download className="h-4 w-4" />
                                    Download Again
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
