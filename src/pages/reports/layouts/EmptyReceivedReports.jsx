import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { LayersPlus } from "lucide-react";

const EmptyReceivedReports = ({ variant = "empty", filter = "all" }) => {
    if (variant === "error") {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia>
                        <LayersPlus />
                    </EmptyMedia>
                    <EmptyTitle>Unable to load reports right now.</EmptyTitle>
                    <EmptyDescription>
                        Please refresh the page or try again in a moment.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    const title =
        filter === "incoming"
            ? "No incoming reports"
            : filter === "recent"
                ? "No recent reports"
                : "No reported incidents yet";

    const description =
        filter === "incoming"
            ? "Pending reports from recipients will show up here."
            : filter === "recent"
                ? "Acknowledged, resolved, or rejected reports will appear here."
                : "When recipients submit reports, they will appear here.";

    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia>
                    <LayersPlus />
                </EmptyMedia>
                <EmptyTitle>{title}</EmptyTitle>
                <EmptyDescription>{description}</EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
};

export default EmptyReceivedReports;