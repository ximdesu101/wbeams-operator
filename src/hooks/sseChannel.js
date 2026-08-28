import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSSE } from "./useSSE";

const OPERATOR_CHANNEL_QUERY_KEYS = {
    "emergency-categories": [["emergency-categories"]],
    "alert-types": [["emergency-categories"]],
    alerts: [["recent-dispatched"], ["alerts"]],
    reports: [["operator-reports"]],
};

export function useOperatorSSE({ enabled = true } = {}) {
    const queryClient = useQueryClient();

    useSSE({
        endpoint: "/operator/sse",
        getToken: () => localStorage.getItem("operator_token"),
        enabled,
        onUpdate: ({ data }) => {
            const channel = data?.channel;
            if (!channel) return;

            const keys = OPERATOR_CHANNEL_QUERY_KEYS[channel];
            if (!keys) return;

            keys.forEach((queryKey) => {
                queryClient.invalidateQueries({ queryKey });
            });
        },
        onError: (error) => {
            if (error.status === 401) {
                toast.error("Session expired. Please login again.");
            }
        },
    });
}

export function useOperatorSSEReady(delayMs = 1200) {
    const [sseReady, setSseReady] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setSseReady(true), delayMs);
        return () => clearTimeout(timer);
    }, [delayMs]);

    useOperatorSSE({ enabled: sseReady });
}