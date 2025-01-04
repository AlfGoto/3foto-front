"use client";

import { useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { Trash2, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Session } from "next-auth";

interface DisplayItem {
  date: string;
  perime: string;
  keys: string[];
  name: string;
  id: string;
}

interface DisplayItemsProps {
  items: DisplayItem[];
  session: Session | null;
}

export function DisplayDisplays({ items, session }: DisplayItemsProps) {
  const [deleted, setDeleted] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleDelete = async (id: string) => {
    setError(null);
    setDeletingItems((prev) => new Set(prev).add(id));

    try {
      const myHeaders = new Headers();
      if (session?.token) myHeaders.append("credentials", session?.token);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_DISPLAY!}/displays/${id}`,
        {
          method: "post",
          credentials: "include",
          headers: myHeaders,
        }
      );
      const json = await response.json();
      if (response.ok) setDeleted([...deleted, json.id]);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Failed to delete display");
    } finally {
      setDeletingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const getExpiryStatus = (perime: string) => {
    const expiryDate = new Date(perime);
    const now = new Date();
    const daysLeft = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0) {
      return { color: "text-destructive", text: "Expired" };
    } else if (daysLeft <= 7) {
      return { color: "text-yellow-600", text: `Expires in ${daysLeft} days` };
    } else {
      return {
        color: "text-green-600",
        text: `Expires in ${formatDistanceToNow(expiryDate)}`,
      };
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {items
        .filter((i) => !deleted.includes(i.id))
        .map((item) => {
          const isExpanded = expandedItems.has(item.id);
          const isDeleting = deletingItems.has(item.id);
          const expiryStatus = getExpiryStatus(item.perime);

          return (
            <Card key={item.id} className="w-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{item.name}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Created: {format(new Date(item.date), "PPP")}
                    </div>
                    <div
                      className={`text-sm font-medium ${expiryStatus.color}`}
                    >
                      {expiryStatus.text}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/display/${item.id}`}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Link>
                    <Button
                      variant="destructive"
                      size="icon"
                      disabled={isDeleting}
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Collapsible>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">
                      {item.keys.length} File{item.keys.length !== 1 ? "s" : ""}
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-8 w-8"
                        onClick={() => toggleExpand(item.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="mt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {item.keys.map((key, index) => (
                        <div
                          key={index}
                          className="text-sm p-2 bg-muted rounded-md truncate"
                          title={key}
                        >
                          {key}
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}
