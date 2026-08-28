const ReceivedReportSkeleton = () => (
    <div className="space-y-4">
        {[0, 1, 2].map((key) => (
            <div
                key={key}
                className="animate-pulse rounded-xl border border-border bg-background p-4"
            >
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="space-y-2">
                        <div className="h-5 w-40 rounded-md bg-muted" />
                        <div className="h-4 w-28 rounded-md bg-muted" />
                    </div>
                    <div className="h-6 w-20 rounded-full bg-muted" />
                </div>
                <div className="space-y-2">
                    <div className="h-4 w-full rounded-md bg-muted" />
                    <div className="h-4 w-2/3 rounded-md bg-muted" />
                    <div className="h-4 w-1/2 rounded-md bg-muted" />
                </div>
                <div className="mt-4 flex gap-2">
                    <div className="h-8 w-24 rounded-md bg-muted" />
                    <div className="h-8 w-20 rounded-md bg-muted" />
                    <div className="h-8 w-20 rounded-md bg-muted" />
                </div>
            </div>
        ))}
    </div>
);

export default ReceivedReportSkeleton;