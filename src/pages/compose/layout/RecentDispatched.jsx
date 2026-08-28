import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as LucideIcons from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { LayersPlus, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRecentDispatched } from "@/services/alertService";

const severityVariant = {
    low: "secondary",
    medium: "outline",
    high: "default",
    critical: "destructive",
};

const severityLabel = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
};

function AlertListSkeleton() {
    return (
        <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-24" />
                </div>
            ))}
        </div>
    );
}

const RecentDispatched = () => {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
        return () => clearTimeout(t);
    }, [search]);

    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey: ["recent-dispatched", debouncedSearch],
        queryFn: () => getRecentDispatched({ search: debouncedSearch, limit: 25 }),
        placeholderData: (prev) => prev,
    });

    const alerts = useMemo(() => {
        const payload = data?.data ?? data ?? [];
        return Array.isArray(payload) ? payload : [];
    }, [data]);

    return (
        <Card className="flex h-full min-h-[420px] flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between gap-2">
                    <span>Recent Dispatched</span>
                    {isFetching && !isLoading ? (
                        <span className="text-xs font-normal text-muted-foreground">
                            Updating…
                        </span>
                    ) : null}
                </CardTitle>
                <Input
                    type="search"
                    placeholder="Search alerts…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mt-2"
                    aria-label="Search recent dispatched alerts"
                />
            </CardHeader>
            <Separator />
            <CardContent className="flex-1 p-0">
                {isLoading ? (
                    <AlertListSkeleton />
                ) : isError ? (
                    <div className="p-4">
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon" className="p-6">
                                    <TriangleAlert className="size-8" />
                                </EmptyMedia>
                                <EmptyTitle>Couldn’t load alerts</EmptyTitle>
                                <EmptyDescription>
                                    Refresh the page or try again in a moment.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="p-4">
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon" className="p-6">
                                    <LayersPlus className="size-8" />
                                </EmptyMedia>
                                <EmptyTitle>
                                    {debouncedSearch
                                        ? "No matching alerts"
                                        : "No dispatched alerts yet"}
                                </EmptyTitle>
                                <EmptyDescription>
                                    {debouncedSearch
                                        ? "Try a different search term."
                                        : "Alerts you send will show up here."}
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    </div>
                ) : (
                    <ScrollArea className="h-[360px]">
                        <ul className="divide-y">
                            {alerts.map((alert) => {
                                const iconName = alert.alert_type?.icon;
                                const Icon =
                                    (iconName && LucideIcons[iconName]) ||
                                    TriangleAlert;
                                const severity = alert.severity || "low";

                                return (
                                    <li
                                        key={alert.id}
                                        className="flex gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                                    >
                                        <div
                                            className={cn(
                                                "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50"
                                            )}
                                            style={
                                                alert.alert_type?.color
                                                    ? {
                                                          borderColor:
                                                              alert.alert_type.color,
                                                          color: alert.alert_type.color,
                                                      }
                                                    : undefined
                                            }
                                        >
                                            <Icon className="size-4" />
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="truncate text-sm font-medium leading-tight">
                                                    {alert.title ||
                                                        alert.alert_type?.name ||
                                                        "Alert"}
                                                </p>
                                                <Badge
                                                    variant={
                                                        severityVariant[severity] ||
                                                        "secondary"
                                                    }
                                                    className="shrink-0 capitalize"
                                                >
                                                    {severityLabel[severity] || severity}
                                                </Badge>
                                            </div>
                                            {alert.message ? (
                                                <p className="line-clamp-2 text-xs text-muted-foreground">
                                                    {alert.message}
                                                </p>
                                            ) : null}
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                                                {alert.sent_at_label ? (
                                                    <span>{alert.sent_at_label}</span>
                                                ) : null}
                                                {Array.isArray(alert.channels) &&
                                                alert.channels.length > 0 ? (
                                                    <>
                                                        <span aria-hidden>•</span>
                                                        <span className="capitalize">
                                                            {alert.channels
                                                                .map((c) =>
                                                                    c === "web_push"
                                                                        ? "Push"
                                                                        : c
                                                                )
                                                                .join(", ")}
                                                        </span>
                                                    </>
                                                ) : null}
                                                {alert.status ? (
                                                    <>
                                                        <span aria-hidden>•</span>
                                                        <span className="capitalize">
                                                            {alert.status}
                                                        </span>
                                                    </>
                                                ) : null}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
};

export default RecentDispatched;