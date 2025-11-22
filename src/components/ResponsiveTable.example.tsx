/**
 * Example usage of ResponsiveTable component
 * 
 * This file demonstrates how to use the ResponsiveTable component
 * to create a table that automatically converts to cards on mobile.
 */

import { ResponsiveTable, ColumnDef } from "./ResponsiveTable";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

// Example data type
interface Ticket {
  id: string;
  ticketId: string;
  title: string;
  customer: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "pending" | "resolved";
}

// Example usage
export function TicketsTableExample({ tickets }: { tickets: Ticket[] }) {
  // Define columns for desktop table view
  const columns: ColumnDef<Ticket>[] = [
    {
      key: "ticketId",
      header: "Ticket ID",
      render: (ticket) => (
        <span className="font-mono text-sm font-semibold text-blue-600">
          {ticket.ticketId}
        </span>
      ),
    },
    {
      key: "title",
      header: "Title",
      render: (ticket) => (
        <div className="font-medium">{ticket.title}</div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
    },
    {
      key: "priority",
      header: "Priority",
      render: (ticket) => (
        <Badge
          variant={
            ticket.priority === "critical"
              ? "destructive"
              : ticket.priority === "high"
              ? "warning"
              : "outline"
          }
        >
          {ticket.priority}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (ticket) => (
        <Badge
          variant={
            ticket.status === "open"
              ? "destructive"
              : ticket.status === "in-progress"
              ? "warning"
              : ticket.status === "resolved"
              ? "success"
              : "outline"
          }
        >
          {ticket.status}
        </Badge>
      ),
    },
  ];

  // Define mobile card renderer
  const mobileCardRenderer = (ticket: Ticket) => (
    <Card className="cursor-pointer transition-smooth hover:shadow-lg active:scale-[0.98]">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-mono text-blue-600 font-semibold">
              {ticket.ticketId}
            </span>
            <Badge
              variant={
                ticket.priority === "critical"
                  ? "destructive"
                  : ticket.priority === "high"
                  ? "warning"
                  : "outline"
              }
            >
              {ticket.priority}
            </Badge>
          </div>
          <h4 className="font-medium line-clamp-2">{ticket.title}</h4>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>{ticket.customer}</span>
            <Badge
              variant={
                ticket.status === "open"
                  ? "destructive"
                  : ticket.status === "in-progress"
                  ? "warning"
                  : ticket.status === "resolved"
                  ? "success"
                  : "outline"
              }
            >
              {ticket.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ResponsiveTable
      data={tickets}
      columns={columns}
      mobileCardRenderer={mobileCardRenderer}
      onRowClick={(ticket) => {
        // Navigate to ticket detail page
        window.location.href = `/dashboard/tickets/${ticket.id}`;
      }}
      emptyMessage="No tickets found. Create your first ticket to get started!"
      emptyAction={
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Ticket
        </Button>
      }
    />
  );
}
