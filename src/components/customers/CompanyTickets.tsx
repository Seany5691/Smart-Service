"use client";

import { useState, useEffect } from "react";
import { ticketService } from "@/lib/firebase/services";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CompanyTicketsProps {
    companyId?: string;
}

export default function CompanyTickets({ companyId }: CompanyTicketsProps) {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTickets = async () => {
            if (!companyId) {
                setLoading(false);
                return;
            }

            try {
                const data = await ticketService.getByCompanyId(companyId);
                setTickets(data);
            } catch (error) {
                console.error("Error loading company tickets:", error);
            } finally {
                setLoading(false);
            }
        };

        loadTickets();
    }, [companyId]);

    if (loading) {
        return <div className="text-center py-8 text-muted-foreground">Loading tickets...</div>;
    }

    if (tickets.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No service requests found for this company.</p>
            </div>
        );
    }

    const statusColors: Record<string, string> = {
        open: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        "in-progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        closed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    };

    return (
        <div className="space-y-4">
            {tickets.map((ticket) => (
                <Card key={ticket.id} className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs text-muted-foreground">{ticket.ticketId}</span>
                                    <Badge variant="outline" className={statusColors[ticket.status]}>
                                        {ticket.status.replace("-", " ")}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                        {ticket.priority}
                                    </Badge>
                                </div>
                                <h4 className="font-semibold">{ticket.title}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                            </div>
                            <div className="text-right text-xs text-muted-foreground space-y-1">
                                <div className="flex items-center justify-end gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                        {ticket.createdAt?.seconds
                                            ? new Date(ticket.createdAt.seconds * 1000).toLocaleDateString()
                                            : "Just now"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-end gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                        {ticket.createdAt?.seconds
                                            ? formatDistanceToNow(new Date(ticket.createdAt.seconds * 1000), { addSuffix: true })
                                            : "Just now"}
                                    </span>
                                </div>
                                {ticket.contactName && (
                                    <div className="flex items-center justify-end gap-1 text-primary">
                                        <User className="h-3 w-3" />
                                        <span>{ticket.contactName}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
