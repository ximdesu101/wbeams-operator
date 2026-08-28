import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { 
    CollapsibleVideo, 
    CollapsibleVoice 
} from "./CollapsibleMedia";

const statusLabel = {
    pending: "Pending",
    acknowledged: "Acknowledged",
    rejected: "Rejected",
    resolved: "Resolved",
};

const ReceivedReportCard = ({ report, onUpdateStatus, isUpdating = false }) => {
    if (!report || typeof report !== "object") {
        return null;
    }

    const hasVideo = Boolean(report.video_url);
    const hasVoice = Boolean(report.voice_url);

    return (
        <div className="rounded-xl border border-border bg-background p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                    <p className="font-semibold">
                        {report.EmergencyType || report.title || "SOS Report"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {report.location || "Unknown location"}
                    </p>
                </div>
                <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
                    {statusLabel[report.status] ?? "Pending"}
                </span>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                    {report.Description ||
                        report.details ||
                        "No details provided."}
                </p>
                <p>Reported by: {report.ReportedBy || "Recipient"}</p>
                <p>Date: {report.DateReported || "Unknown"}</p>
            </div>

            {(hasVideo || hasVoice) && (
                <div className="mt-3 grid gap-2">
                    {hasVideo && <CollapsibleVideo src={report.video_url} />}
                    {hasVoice && <CollapsibleVoice src={report.voice_url} />}
                </div>
            )}

            <CardFooter className="mt-4 flex flex-wrap gap-2 border-t-0 bg-transparent px-0 py-0">
                <Button
                    size="sm"
                    disabled={isUpdating || report.status !== "pending"}
                    onClick={() =>
                        onUpdateStatus?.({
                            id: report.id,
                            status: "acknowledged",
                        })
                    }
                >
                    Acknowledge
                </Button>
                <Button
                    size="sm"
                    variant="destructive"
                    disabled={
                        isUpdating ||
                        report.status === "resolved" ||
                        report.status === "rejected"
                    }
                    onClick={() =>
                        onUpdateStatus?.({
                            id: report.id,
                            status: "rejected",
                        })
                    }
                >
                    Reject
                </Button>
                <Button
                    size="sm"
                    variant="secondary"
                    disabled={isUpdating || report.status !== "acknowledged"}
                    onClick={() =>
                        onUpdateStatus?.({
                            id: report.id,
                            status: "resolved",
                        })
                    }
                >
                    Resolve
                </Button>
            </CardFooter>
        </div>
    );
};

export default ReceivedReportCard;