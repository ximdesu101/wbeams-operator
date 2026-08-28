import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import {
    FileText,
    ClockAlert,
} from "lucide-react";

const CardMetrics = ({ totalReports = 0, pendingReports = 0 }) => {
    const cardMetrics = [
        {
            id: 1,
            title: "Total Reports",
            value: totalReports,
            icon: FileText,
            bgColor: "bg-blue-100",
            iconColor: "text-blue-600",
        },
        {
            id: 2,
            title: "Pending Reports",
            value: pendingReports,
            icon: ClockAlert,
            bgColor: "bg-amber-100",
            iconColor: "text-amber-600",
        },
    ];

    return (
        <div className="grid grid-cols-2 auto-rows-min gap-4">
            {cardMetrics.map((data) => {
                const Icon = data.icon;

                return (
                    <Card key={data.id} className="flex-row gap-0">
                        <div className="flex-1">
                            <CardHeader className="pb-0">
                                <CardTitle className="text-sm">
                                    {data.title}
                                </CardTitle>
                            </CardHeader>

                            <CardContent>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    {data.value}
                                </h1>
                            </CardContent>
                        </div>
                        <div className="flex items-center pr-4">
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full ${data.bgColor}`}
                            >
                                <Icon className={`h-5 w-5 ${data.iconColor}`} />
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default CardMetrics;