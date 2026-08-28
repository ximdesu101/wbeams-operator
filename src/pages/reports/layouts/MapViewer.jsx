import { Fragment, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Circle,
    Polyline,
    useMap,
} from "react-leaflet";
import { 
    AlertTriangle, 
    MapPin, 
    User, 
    Ruler, 
    Film, 
    AudioLines, 
    ChevronDown, 
    ChevronRight 
} from "lucide-react";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import api from "@/lib/axios";
import {
    CAMPUS_LOCATION_BY_NAME,
    DEFAULT_MAP_CENTER,
} from "@/lib/campusLocations";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

function parseCoord(value) {
    if (value === null || value === undefined || value === "") return NaN;
    const n = Number(value);
    return Number.isFinite(n) ? n : NaN;
}

/** Haversine distance in meters */
function distanceMeters(lat1, lng1, lat2, lng2) {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters) {
    if (!Number.isFinite(meters)) return "—";
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(2)} km`;
}

function FlyToActive({ target }) {
    const map = useMap();

    useEffect(() => {
        if (!target) return;
        const [lat, lng] = target;
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
            map.flyTo([lat, lng], map.getZoom(), { duration: 0.75 });
        }
    }, [map, target]);

    return null;
}

function ReportPopupContent({ report, updateStatusMutation, distanceLabel }) {
    return (
        <div className="w-72 space-y-3">
            <div className="flex items-start gap-2 border-b pb-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="font-semibold leading-tight">
                    {report.EmergencyType || report.title || "Report"}
                </p>
            </div>

            <div className="space-y-1.5">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                        Alert site: {report.location || "Unknown location"}
                    </span>
                </div>

                {distanceLabel && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Ruler className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>Distance from sender: {distanceLabel}</span>
                    </div>
                )}

                {report.profile && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <User className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>{report.profile}</span>
                    </div>
                )}

                {(report.Description || report.details) && (
                    <p className="rounded-md bg-muted/50 px-2.5 py-2 text-sm leading-snug">
                        {report.Description || report.details}
                    </p>
                )}

                {report.ReportedBy && (
                    <p className="text-sm text-muted-foreground">
                        Reported by:{" "}
                        <span className="font-medium">{report.ReportedBy}</span>
                    </p>
                )}

                <p className="text-sm text-muted-foreground">
                    Status:{" "}
                    <span className="font-medium capitalize">
                        {report.status || "pending"}
                    </span>
                </p>

                {report.video_url && (
                    <details className="overflow-hidden rounded-md border bg-muted/30">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-1 px-2 py-1.5 text-[11px] font-medium text-muted-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                            <span className="flex items-center gap-1">
                                <Film className="h-3 w-3 text-sky-600" />
                                Video
                            </span>
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 open:hidden [[open]_&]:hidden" />
                        </summary>
                        <video
                            src={report.video_url}
                            controls
                            playsInline
                            preload="metadata"
                            className="max-h-36 w-full border-t bg-black object-contain"
                        />
                    </details>
                )}

                {report.voice_url && (
                    <details className="overflow-hidden rounded-md border bg-muted/30">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-1 px-2 py-1.5 text-[11px] font-medium text-muted-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                            <span className="flex items-center gap-1">
                                <AudioLines className="h-3 w-3 text-amber-600" />
                                Voice
                            </span>
                        </summary>
                        <div className="border-t p-2">
                            <audio
                                src={report.voice_url}
                                controls
                                preload="metadata"
                                className="w-full"
                            />
                        </div>
                    </details>
                )}
            </div>

            {(report.status === "pending" || report.status === "acknowledged") && (
                <div className="flex justify-end gap-2 border-t pt-2">
                    {report.status === "pending" && (
                        <Button
                            size="sm"
                            className="w-full"
                            disabled={updateStatusMutation.isPending}
                            onClick={() =>
                                updateStatusMutation.mutate({
                                    id: report.id,
                                    status: "acknowledged",
                                })
                            }
                        >
                            {updateStatusMutation.isPending
                                ? "Updating..."
                                : "Acknowledge"}
                        </Button>
                    )}
                    {report.status === "acknowledged" && (
                        <Button
                            size="sm"
                            className="w-full"
                            disabled={updateStatusMutation.isPending}
                            onClick={() =>
                                updateStatusMutation.mutate({
                                    id: report.id,
                                    status: "resolved",
                                })
                            }
                        >
                            {updateStatusMutation.isPending
                                ? "Updating..."
                                : "Resolve"}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

export default function MapViewer() {
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["operator-reports"],
        queryFn: async () => {
            const response = await api.get("/operator/reports");
            return response.data?.data ?? [];
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
        onError: (error) => {
            toast.error(
                error?.response?.data?.message ??
                "Failed to update report status. Please try again."
            );
        },
    });

    // Campus reports: alert circle + sender pin + distance
    const campusReports = useMemo(() => {
        if (!Array.isArray(data)) return [];

        return data
            .filter((report) => {
                // Hide after acknowledge / reject / resolve
                if (report?.status !== "pending") return false;
                return Boolean(
                    report?.location && CAMPUS_LOCATION_BY_NAME[report.location]
                );
            })
            .map((report) => {
                const campus = CAMPUS_LOCATION_BY_NAME[report.location];
                const senderLat = parseCoord(report?.latitude);
                const senderLng = parseCoord(report?.longitude);
                const hasSender =
                    Number.isFinite(senderLat) && Number.isFinite(senderLng);

                const alertPos = campus.position;
                let distance = null;
                if (hasSender) {
                    distance = distanceMeters(
                        senderLat,
                        senderLng,
                        alertPos[0],
                        alertPos[1]
                    );
                }

                return {
                    report,
                    alertPos,
                    radius: campus.radius,
                    senderPos: hasSender ? [senderLat, senderLng] : null,
                    distance,
                    distanceLabel: hasSender ? formatDistance(distance) : null,
                };
            });
    }, [data]);

    // SOS only (not a campus dropdown location)
    const sosMarkers = useMemo(() => {
        if (!Array.isArray(data)) return [];

        return data.filter((report) => {
            // Hide after acknowledge / reject / resolve
            if (report?.status !== "pending") return false;
            if (report?.location && CAMPUS_LOCATION_BY_NAME[report.location]) {
                return false;
            }
            const latitude = parseCoord(report?.latitude);
            const longitude = parseCoord(report?.longitude);
            return Number.isFinite(latitude) && Number.isFinite(longitude);
        });
    }, [data]);

    const flyTarget = useMemo(() => {
        if (campusReports[0]?.senderPos) return campusReports[0].senderPos;
        if (campusReports[0]?.alertPos) return campusReports[0].alertPos;
        if (sosMarkers[0]) {
            return [
                parseCoord(sosMarkers[0].latitude),
                parseCoord(sosMarkers[0].longitude),
            ];
        }
        return null;
    }, [campusReports, sosMarkers]);

    const initialCenter = flyTarget ?? DEFAULT_MAP_CENTER;
    const activeCount = campusReports.length + sosMarkers.length;

    return (
        <div className="rounded-lg overflow-hidden">
            {isLoading && (
                <div className="mb-2 text-sm text-muted-foreground">
                    Loading report locations...
                </div>
            )}

            {isError && (
                <div className="mb-2 text-sm text-destructive">
                    Unable to load report markers right now.
                </div>
            )}

            <MapContainer
                center={initialCenter}
                zoom={17}
                style={{ height: "535px", width: "100%" }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FlyToActive target={flyTarget} />

                {/* Campus reports: alert pulse + sender pin + line */}
                {campusReports.map(
                    ({ report, alertPos, radius, senderPos, distanceLabel }) => (
                        <Fragment key={`campus-report-${report.id}`}>
                            <Circle
                                center={alertPos}
                                radius={radius}
                                pathOptions={{
                                    color: "#ef4444",
                                    fillColor: "#ef4444",
                                    fillOpacity: 0.25,
                                    weight: 2,
                                    className: "pulse-circle",
                                }}
                            >
                                <Popup>
                                    <ReportPopupContent
                                        report={report}
                                        updateStatusMutation={updateStatusMutation}
                                        distanceLabel={distanceLabel}
                                    />
                                </Popup>
                            </Circle>

                            <Circle
                                center={alertPos}
                                radius={4}
                                pathOptions={{
                                    color: "#ef4444",
                                    fillColor: "#ef4444",
                                    fillOpacity: 1,
                                    weight: 0,
                                }}
                            />

                            {senderPos && (
                                <>
                                    <Polyline
                                        positions={[senderPos, alertPos]}
                                        pathOptions={{
                                            color: "#3b82f6",
                                            weight: 3,
                                            dashArray: "6 8",
                                            opacity: 0.85,
                                        }}
                                    />
                                    <Marker position={senderPos}>
                                        <Popup>
                                            <div className="space-y-1 text-sm">
                                                <p className="font-semibold flex items-center gap-1">
                                                    <User className="h-3.5 w-3.5" />
                                                    Sender location
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {report.ReportedBy || "Recipient"}
                                                </p>
                                                {distanceLabel && (
                                                    <p className="text-muted-foreground">
                                                        {distanceLabel} from alert site (
                                                        {report.location})
                                                    </p>
                                                )}
                                            </div>
                                        </Popup>
                                    </Marker>
                                </>
                            )}
                        </Fragment>
                    )
                )}

                {/* SOS pins */}
                {sosMarkers.map((report) => (
                    <Marker
                        key={`sos-${report.id}`}
                        position={[
                            parseCoord(report.latitude),
                            parseCoord(report.longitude),
                        ]}
                    >
                        <Popup>
                            <ReportPopupContent
                                report={report}
                                updateStatusMutation={updateStatusMutation}
                            />
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}