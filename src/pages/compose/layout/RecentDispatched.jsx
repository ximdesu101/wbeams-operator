import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as LucideIcons from "lucide-react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    LayersPlus,
    TriangleAlert,
    CheckCircle2,
    ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getRecentDispatched, resolveAlert } from "@/services/alertService";

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

function EmptyState({ searching, resolved }) {
    return (
        <div className="p-4">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon" className="p-6">
                        {resolved
                            ? <ShieldCheck className="size-8" />
                            : <LayersPlus className="size-8" />}
                    </EmptyMedia>
                    <EmptyTitle>
                        {searching
                            ? "No matching alerts"
                            : resolved
                                ? "No resolved alerts yet"
                                : "No active alerts"}
                    </EmptyTitle>
                    <EmptyDescription>
                        {searching
                            ? "Try a different search term."
                            : resolved
                                ? "Resolved alerts will appear here."
                                : "Alerts you send will show up here."}
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        </div>
    );
}

function AlertItem({ alert, onResolve, resolving }) {
    const iconName = alert.alert_type?.icon;
    const Icon = (iconName && LucideIcons[iconName]) || TriangleAlert;
    const severity = alert.severity || "low";
    const isActive = alert.status !== "resolved";

    return (
        <li className="flex gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
            <div
                className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50"
                style={
                    alert.alert_type?.color
                        ? {
                              borderColor: alert.alert_type.color,
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
                        {alert.title || alert.alert_type?.name || "Alert"}
                    </p>
                    <Badge
                        variant={severityVariant[severity] || "secondary"}
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

                    {Array.isArray(alert.channels) && alert.channels.length > 0 ? (
                        <>
                            <span aria-hidden>•</span>
                            <span className="capitalize">
                                {alert.channels
                                    .map((c) => (c === "web_push" ? "Push" : c))
                                    .join(", ")}
                            </span>
                        </>
                    ) : null}

                    {/* Resolved date shown in resolved tab */}
                    {!isActive && alert.resolved_at_label ? (
                        <>
                            <span aria-hidden>•</span>
                            <span className="text-green-600 font-medium">
                                Resolved {alert.resolved_at_label}
                            </span>
                        </>
                    ) : null}
                </div>

                {/* Resolve button — only on active alerts */}
                {isActive ? (
                    <div className="pt-1">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1.5 text-xs text-green-700 border-green-300 hover:bg-green-50 hover:text-green-800 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/40"
                            disabled={resolving}
                            onClick={() => onResolve(alert.id)}
                        >
                            <CheckCircle2 className="size-3.5" />
                            {resolving ? "Resolving…" : "Resolve"}
                        </Button>
                    </div>
                ) : null}
            </div>
        </li>
    );
}

const RecentDispatched = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [resolvingId, setResolvingId] = useState(null);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
        return () => clearTimeout(t);
    }, [search]);

    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey: ["recent-dispatched", debouncedSearch],
        queryFn: () => getRecentDispatched({ search: debouncedSearch, limit: 50 }),
        placeholderData: (prev) => prev,
    });

    const allAlerts = useMemo(() => {
        const payload = data?.data ?? data ?? [];
        return Array.isArray(payload) ? payload : [];
    }, [data]);

    const activeAlerts   = useMemo(() => allAlerts.filter((a) => a.status !== "resolved"), [allAlerts]);
    const resolvedAlerts = useMemo(() => allAlerts.filter((a) => a.status === "resolved"), [allAlerts]);

    const resolveMutation = useMutation({
        mutationFn: (id) => resolveAlert(id),
        onMutate: (id) => setResolvingId(id),
        onSuccess: () => {
            toast.success("Alert resolved.");
            queryClient.invalidateQueries({ queryKey: ["recent-dispatched"] });
            queryClient.invalidateQueries({ queryKey: ["alerts"] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Could not resolve alert.");
        },
        onSettled: () => setResolvingId(null),
    });

    const handleResolve = (id) => resolveMutation.mutate(id);

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
                                <EmptyTitle>Couldn't load alerts</EmptyTitle>
                                <EmptyDescription>
                                    Refresh the page or try again in a moment.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    </div>
                ) : (
                    <Tabs defaultValue="active" className="flex flex-col h-full">
                        <div className="px-4 pt-3">
                            <TabsList className="w-full">
                                <TabsTrigger value="active" className="flex-1 gap-1.5">
                                    Active
                                    {activeAlerts.length > 0 ? (
                                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                                            {activeAlerts.length}
                                        </Badge>
                                    ) : null}
                                </TabsTrigger>
                                <TabsTrigger value="resolved" className="flex-1 gap-1.5">
                                    Resolved
                                    {resolvedAlerts.length > 0 ? (
                                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                                            {resolvedAlerts.length}
                                        </Badge>
                                    ) : null}
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Active tab */}
                        <TabsContent value="active">
                            {activeAlerts.length === 0 ? (
                                <EmptyState searching={!!debouncedSearch} resolved={false} />
                            ) : (
                                <ScrollArea className="h-[360px]">
                                    <ul className="divide-y">
                                        {activeAlerts.map((alert) => (
                                            <AlertItem
                                                key={alert.id}
                                                alert={alert}
                                                onResolve={handleResolve}
                                                resolving={resolvingId === alert.id}
                                            />
                                        ))}
                                    </ul>
                                </ScrollArea>
                            )}
                        </TabsContent>

                        {/* Resolved tab */}
                        <TabsContent value="resolved">
                            {resolvedAlerts.length === 0 ? (
                                <EmptyState searching={!!debouncedSearch} resolved={true} />
                            ) : (
                                <ScrollArea className="h-[360px]">
                                    <ul className="divide-y">
                                        {resolvedAlerts.map((alert) => (
                                            <AlertItem
                                                key={alert.id}
                                                alert={alert}
                                                onResolve={handleResolve}
                                                resolving={false}
                                            />
                                        ))}
                                    </ul>
                                </ScrollArea>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </CardContent>
        </Card>
    );
};

export default RecentDispatched;
