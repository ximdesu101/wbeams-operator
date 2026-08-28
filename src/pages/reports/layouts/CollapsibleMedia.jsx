import { useState } from "react";
import {
    Film,
    AudioLines,
    ChevronDown,
    ChevronRight,
} from "lucide-react";

export function CollapsibleVideo({ src }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="overflow-hidden rounded-xl border bg-muted/30">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50"
                aria-expanded={open}
            >
                <span className="flex items-center gap-1.5">
                    <Film className="h-3.5 w-3.5 text-sky-600" />
                    Video attachment
                </span>
                {open ? (
                    <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                    <ChevronRight className="h-4 w-4 shrink-0" />
                )}
            </button>
            {open && (
                <video
                    src={src}
                    controls
                    playsInline
                    preload="metadata"
                    className="max-h-56 w-full border-t bg-black object-contain"
                />
            )}
        </div>
    );
}

export function CollapsibleVoice({ src }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="overflow-hidden rounded-xl border bg-muted/30">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50"
                aria-expanded={open}
            >
                <span className="flex items-center gap-1.5">
                    <AudioLines className="h-3.5 w-3.5 text-amber-600" />
                    Voice message
                </span>
                {open ? (
                    <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                    <ChevronRight className="h-4 w-4 shrink-0" />
                )}
            </button>
            {open && (
                <div className="border-t p-3">
                    <audio
                        src={src}
                        controls
                        preload="metadata"
                        className="w-full"
                    />
                </div>
            )}
        </div>
    );
}