"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Trash2, CheckCircle2, Circle } from "lucide-react";
import { Task } from "@/lib/firebase/tasks";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface TaskCardProps {
    task: Task;
    onComplete: (taskId: string) => void;
    onUncomplete: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    showActions?: boolean;
}

export default function TaskCard({
    task,
    onComplete,
    onUncomplete,
    onDelete,
    showActions = true,
}: TaskCardProps) {
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);

    const formatDueDate = () => {
        if (!task.dueDate) return null;
        
        try {
            const date = new Date(task.dueDate);
            const dateStr = format(date, "MMM dd, yyyy");
            
            if (task.dueTime) {
                return `${dateStr} at ${task.dueTime}`;
            }
            return dateStr;
        } catch {
            return task.dueDate;
        }
    };

    const handleClick = () => {
        // Navigate to linked entity if exists
        if (task.ticketId) {
            router.push(`/dashboard/tickets/${task.ticketId}`);
        } else if (task.customerId) {
            router.push(`/dashboard/customers/${task.customerId}`);
        }
    };

    const isClickable = task.ticketId || task.customerId;
    const dueInfo = formatDueDate();

    return (
        <div
            className={`flex items-start gap-3 p-3 border rounded-lg transition-all ${
                task.completed ? "bg-muted/50" : "bg-card"
            } ${
                isClickable
                    ? "cursor-pointer hover:bg-accent/50 hover:border-primary/50"
                    : ""
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Checkbox */}
            {showActions && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (task.completed) {
                            onUncomplete(task.id!);
                        } else {
                            onComplete(task.id!);
                        }
                    }}
                    className="mt-1 flex-shrink-0"
                >
                    {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                        <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                    )}
                </button>
            )}

            {/* Content */}
            <div
                className="flex-1 min-w-0"
                onClick={isClickable ? handleClick : undefined}
            >
                {/* Customer/Ticket Info */}
                {(task.customerName || task.ticketNumber) && (
                    <div className="flex items-center gap-2 mb-1">
                        {task.customerName && (
                            <p className="text-sm font-medium text-primary">
                                {task.customerName}
                            </p>
                        )}
                        {task.ticketNumber && (
                            <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                                {task.ticketNumber}
                            </span>
                        )}
                    </div>
                )}

                {/* Description */}
                <p
                    className={`text-sm ${
                        task.completed
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                    }`}
                >
                    {task.description}
                </p>

                {/* Due Date */}
                {dueInfo && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Calendar className="h-3 w-3" />
                        <span>{dueInfo}</span>
                    </div>
                )}

                {/* Assigned Info */}
                {task.assignedTo && task.assignedTo.length > 1 && (
                    <div className="text-xs text-muted-foreground mt-1">
                        Shared with team member
                    </div>
                )}

                {/* Completed Info */}
                {task.completed && task.completedByName && (
                    <div className="text-xs text-muted-foreground mt-1">
                        Completed by {task.completedByName}
                    </div>
                )}
            </div>

            {/* Delete Button */}
            {showActions && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task.id!);
                    }}
                    className={`flex-shrink-0 ${
                        isHovered ? "opacity-100" : "opacity-0"
                    } transition-opacity`}
                >
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            )}
        </div>
    );
}
