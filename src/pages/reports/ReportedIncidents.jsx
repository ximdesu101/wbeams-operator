import { useCallback, useState } from "react";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import MapViewer from "./layouts/MapViewer";
import ReceivedReports from "./layouts/ReceivedReports";
import CardMetrics from "./layouts/CardMetrics";

const ReportedIncidents = () => {
    const [activeTab, setActiveTab] = useState("incoming");
    const [metrics, setMetrics] = useState({ total: 0, pending: 0 });

    const handleMetricsChange = useCallback((next) => {
        setMetrics(next);
    }, []);

    return (
        <div className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <MapViewer />
                </div>
                <div className="space-y-4">
                    <CardMetrics
                        totalReports={metrics.total}
                        pendingReports={metrics.pending}
                    />
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList className="w-full">
                            <TabsTrigger value="incoming" className="flex-1">
                                Incoming Reports
                            </TabsTrigger>
                            <TabsTrigger value="recent" className="flex-1">
                                Recent Reports
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <ReceivedReports
                        filter={activeTab}
                        onMetricsChange={handleMetricsChange}
                    />
                </div>
            </div>
        </div>
    );
};
