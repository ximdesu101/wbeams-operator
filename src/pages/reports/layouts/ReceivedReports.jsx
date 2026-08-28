import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "@/lib/axios";
import ReceivedReportCard from "./ReceivedReportCard";
import ReceivedReportSkeleton from "./ReceivedReportSkeleton";
import EmptyReceivedReports from "./EmptyReceivedReports";

/**
 * @param {{ filter?: "incoming" | "recent" | "all", onMetricsChange?: (metrics: { total: number, pending: number }) => void }} props
 */
const ReceivedReports = ({ filter = "incoming", onMetricsChange }) => {
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["operator-reports"],
        queryFn: async () => {
            const response = await api.get("/operator/reports");
            const payload = response.data?.data ?? response.data ?? [];
            return Array.isArray(payload) ? payload : [];
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            const response = await api.patch(`/operator/reports/${id}/status`, {
                status,
            });
            return response.data?.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["operator-reports"] });
        },
    });

    const allReports = useMemo(() => {
        if (!Array.isArray(data)) return [];
        return data.filter(
            (item) => item && typeof item === "object" && item.id != null
        );
    }, [data]);

    useEffect(() => {
        if (typeof onMetricsChange === "function") {
            const pending = allReports.filter(
                (r) => (r.status ?? "pending") === "pending"
            ).length;
            onMetricsChange({ total: allReports.length, pending });
        }
    }, [allReports, onMetricsChange]);

    const reports = useMemo(() => {
        if (filter === "incoming") {
            return allReports.filter(
                (r) => (r.status ?? "pending") === "pending"
            );
        }
        if (filter === "recent") {
            return allReports.filter(
                (r) => (r.status ?? "pending") !== "pending"
            );
        }
        return allReports;
    }, [allReports, filter]);

    return (
        <ScrollArea className="h-[380px]">
            <div className="space-y-4 pr-3">
                {isLoading ? (
                    <ReceivedReportSkeleton />
                ) : isError ? (
                    <EmptyReceivedReports variant="error" />
                ) : reports.length === 0 ? (
                    <EmptyReceivedReports filter={filter} />
                ) : (
                    reports.map((report) => (
                        <ReceivedReportCard
                            key={report.id}
                            report={report}
                            isUpdating={
                                updateStatusMutation.isPending &&
                                updateStatusMutation.variables?.id === report.id
                            }
                            onUpdateStatus={(payload) =>
                                updateStatusMutation.mutate(payload)
                            }
                        />
                    ))
                )}
            </div>
        </ScrollArea>
    );
};

export default ReceivedReports;