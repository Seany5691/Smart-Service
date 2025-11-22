# Mobile Component Usage Examples

This document provides practical examples of using mobile-optimized components in the Smart Service Ticketing System.

## LoadingState Component

### Basic Loading

```tsx
import { LoadingState } from "@/components/LoadingState";

export default function MyPage() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <LoadingState message="Loading tickets..." />;
  }

  return <div>Content</div>;
}
```

### Full-Screen Loading

```tsx
import { LoadingState } from "@/components/LoadingState";

export default function MyPage() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <LoadingState message="Loading..." fullScreen />;
  }

  return <div>Content</div>;
}
```

### Skeleton Screens

```tsx
import { SkeletonTable, SkeletonStats, SkeletonCard } from "@/components/LoadingState";

export default function TicketsPage() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonStats />
        <SkeletonTable />
      </div>
    );
  }

  return <div>Tickets content</div>;
}
```

## EmptyState Component

### Basic Empty State

```tsx
import { EmptyState } from "@/components/EmptyState";
import { Ticket } from "lucide-react";

export default function TicketsPage() {
  const tickets = [];

  if (tickets.length === 0) {
    return (
      <EmptyState
        icon={Ticket}
        title="No tickets found"
        description="Create your first ticket to get started"
        actionLabel="Create Ticket"
        onAction={() => setShowModal(true)}
      />
    );
  }

  return <div>Tickets list</div>;
}
```

### Empty State with Search

```tsx
import { EmptyState } from "@/components/EmptyState";
import { Search } from "lucide-react";

export default function SearchResults() {
  const results = [];
  const searchQuery = "test";

  if (results.length === 0 && searchQuery) {
    return (
      <EmptyState
        icon={Search}
        title="No results found"
        description={`No results for "${searchQuery}". Try adjusting your search.`}
        actionLabel="Clear Search"
        onAction={() => setSearchQuery("")}
      />
    );
  }

  return <div>Results</div>;
}
```

### Empty State with Multiple Actions

```tsx
import { EmptyState } from "@/components/EmptyState";
import { Building2 } from "lucide-react";

export default function CustomersPage() {
  const customers = [];

  if (customers.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No customers yet"
        description="Start by adding your first customer"
        actionLabel="Add Customer"
        onAction={() => setShowModal(true)}
        secondaryActionLabel="Import Customers"
        onSecondaryAction={() => setShowImport(true)}
      />
    );
  }

  return <div>Customers list</div>;
}
```

## ErrorState Component

### Basic Error

```tsx
import { ErrorState } from "@/components/ErrorState";

export default function MyPage() {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setError(null);
          loadData();
        }}
      />
    );
  }

  return <div>Content</div>;
}
```

### Network Error

```tsx
import { NetworkError } from "@/components/ErrorState";

export default function MyPage() {
  const [networkError, setNetworkError] = useState(false);

  if (networkError) {
    return (
      <NetworkError
        onRetry={() => {
          setNetworkError(false);
          loadData();
        }}
      />
    );
  }

  return <div>Content</div>;
}
```

### Permission Error

```tsx
import { PermissionError } from "@/components/ErrorState";

export default function ProtectedPage() {
  const { user } = useAuth();

  if (!user?.hasPermission) {
    return (
      <PermissionError
        message="You need admin access to view this page"
      />
    );
  }

  return <div>Protected content</div>;
}
```

### Not Found Error

```tsx
import { NotFoundError } from "@/components/ErrorState";

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const ticket = await getTicket(params.id);

  if (!ticket) {
    return <NotFoundError resourceName="ticket" />;
  }

  return <div>Ticket details</div>;
}
```

### Full-Screen Error

```tsx
import { ErrorState } from "@/components/ErrorState";

export default function MyPage() {
  const [criticalError, setCriticalError] = useState<string | null>(null);

  if (criticalError) {
    return (
      <ErrorState
        title="Critical Error"
        message={criticalError}
        onRetry={() => window.location.reload()}
        onGoHome={() => router.push('/dashboard')}
        fullScreen
      />
    );
  }

  return <div>Content</div>;
}
```

## MobileModal Component

### Basic Modal

```tsx
import { MobileModal } from "@/components/MobileModal";

export default function MyPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button onClick={() => setShowModal(true)}>
        Open Modal
      </Button>

      <MobileModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Edit Item"
      >
        <form>
          <Input label="Name" />
          <Button type="submit">Save</Button>
        </form>
      </MobileModal>
    </>
  );
}
```

### Modal with Size Variants

```tsx
import { MobileModal } from "@/components/MobileModal";

// Small modal
<MobileModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Confirm"
  size="sm"
>
  <p>Are you sure?</p>
</MobileModal>

// Large modal
<MobileModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Edit Ticket"
  size="lg"
>
  <form>{/* Large form */}</form>
</MobileModal>

// Full-width modal
<MobileModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Details"
  size="full"
>
  <div>{/* Full-width content */}</div>
</MobileModal>
```

### Modal with Form

```tsx
import { MobileModal } from "@/components/MobileModal";

export default function AddCustomerModal() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveCustomer(data);
      setShowModal(false);
      toast.success("Customer added!");
    } catch (error) {
      toast.error("Failed to add customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      title="Add Customer"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            label="Company Name"
            required
            className="h-12 text-base"
          />
          <Input
            label="Email"
            type="email"
            required
            className="h-12 text-base"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowModal(false)}
            disabled={loading}
            className="w-full sm:w-auto min-h-[44px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto min-h-[44px]"
          >
            {loading ? "Saving..." : "Save Customer"}
          </Button>
        </div>
      </form>
    </MobileModal>
  );
}
```

## ResponsiveTable Component

### Basic Table

```tsx
import { ResponsiveTable } from "@/components/ResponsiveTable";

export default function TicketsPage() {
  const tickets = [
    { id: '1', ticketId: 'TKT-001', title: 'Fix bug', status: 'open' },
    // ...
  ];

  return (
    <ResponsiveTable
      data={tickets}
      columns={[
        { key: 'ticketId', label: 'ID' },
        { key: 'title', label: 'Title' },
        { key: 'status', label: 'Status' },
      ]}
      mobileCardRenderer={(ticket) => (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono">{ticket.ticketId}</span>
            <Badge>{ticket.status}</Badge>
          </div>
          <h3 className="font-medium">{ticket.title}</h3>
        </div>
      )}
      onRowClick={(ticket) => router.push(`/tickets/${ticket.id}`)}
    />
  );
}
```

### Table with Custom Rendering

```tsx
import { ResponsiveTable } from "@/components/ResponsiveTable";

export default function CustomersPage() {
  const customers = [
    { id: '1', name: 'Acme Corp', email: 'contact@acme.com', phone: '123-456-7890' },
    // ...
  ];

  return (
    <ResponsiveTable
      data={customers}
      columns={[
        { key: 'name', label: 'Company' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
      ]}
      mobileCardRenderer={(customer) => (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">{customer.name}</h3>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <a href={`mailto:${customer.email}`} className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {customer.email}
            </a>
            <a href={`tel:${customer.phone}`} className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {customer.phone}
            </a>
          </div>
        </div>
      )}
      onRowClick={(customer) => router.push(`/customers/${customer.id}`)}
    />
  );
}
```

## Complete Page Example

```tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Ticket } from "lucide-react";
import { LoadingState, SkeletonTable } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { MobileModal } from "@/components/MobileModal";
import { ResponsiveTable } from "@/components/ResponsiveTable";

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTickets();
      setTickets(data);
    } catch (err) {
      setError("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-accent rounded-xl animate-pulse" />
        <SkeletonTable />
      </div>
    );
  }

  // Error state
  if (error) {
    return <ErrorState message={error} onRetry={loadTickets} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-6 lg:p-8 rounded-2xl text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold">Tickets</h1>
            <p className="mt-2 text-sm lg:text-base">
              {tickets.length} total tickets
            </p>
          </div>
          <Button
            size="lg"
            className="w-full sm:w-auto bg-white text-blue-600"
            onClick={() => setShowModal(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tickets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-12 text-base"
        />
      </div>

      {/* Content */}
      {filteredTickets.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No tickets found"
          description={
            searchQuery
              ? "Try adjusting your search"
              : "Create your first ticket to get started"
          }
          actionLabel={!searchQuery ? "Create Ticket" : undefined}
          onAction={!searchQuery ? () => setShowModal(true) : undefined}
        />
      ) : (
        <ResponsiveTable
          data={filteredTickets}
          columns={[
            { key: 'ticketId', label: 'ID' },
            { key: 'title', label: 'Title' },
            { key: 'status', label: 'Status' },
          ]}
          mobileCardRenderer={(ticket) => (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono">{ticket.ticketId}</span>
                <Badge>{ticket.status}</Badge>
              </div>
              <h3 className="font-medium">{ticket.title}</h3>
            </div>
          )}
          onRowClick={(ticket) => router.push(`/tickets/${ticket.id}`)}
        />
      )}

      {/* Modal */}
      <MobileModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Ticket"
        size="lg"
      >
        <form className="space-y-4">
          <Input
            label="Title"
            required
            className="h-12 text-base"
          />
          <Button
            type="submit"
            className="w-full min-h-[44px]"
          >
            Create Ticket
          </Button>
        </form>
      </MobileModal>
    </div>
  );
}
```

## Best Practices

1. **Always use loading states** - Show skeleton screens instead of blank pages
2. **Provide helpful empty states** - Guide users on what to do next
3. **Handle errors gracefully** - Offer retry options and clear error messages
4. **Make modals full-screen on mobile** - Use MobileModal component
5. **Convert tables to cards** - Use ResponsiveTable for better mobile UX
6. **Use touch-friendly sizes** - Minimum 44px for buttons, 48px for inputs
7. **Test on real devices** - DevTools simulation is not enough
8. **Provide visual feedback** - Use active states for touch interactions
