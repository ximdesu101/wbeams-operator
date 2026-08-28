import { useMemo, useState } from "react";
import { useOperatorSSEReady } from "@/hooks/sseChannel";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    BellRing,
    FileWarning,
    LogOut,
    ShieldCheck,
    UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OperatorLogout } from "@/services/AuthOperatorService";
import { cn } from "@/lib/utils";

import ThemeIcon from "@/components/styles/theme/ThemeIcon"
import ThemeSwitch from "@/components/styles/theme/ThemeSwitch"
import ThemeText from "@/components/styles/theme/ThemeText"

function getOperatorUser() {
    try {
        const raw = localStorage.getItem("operator");
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function getInitials(name, email) {
    if (name && typeof name === "string") {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return "OP";
}

const navItems = [
    { to: "/compose-alert", label: "Compose Alert", icon: BellRing },
    { to: "/reports", label: "Reported Incidents", icon: FileWarning },
];

export default function OperatorLayout() {
    const navigate = useNavigate();
    const [loggingOut, setLoggingOut] = useState(false);

    // One multiplexed SSE connection for the whole operator app
    useOperatorSSEReady(1200);

    const user = useMemo(() => getOperatorUser(), []);
    const displayName =
        [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
        user?.name ||
        "Operator";
    const displayEmail = user?.email || "";

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            const token = localStorage.getItem("operator_token");
            if (token) {
                await OperatorLogout();
            }
        } catch (error) {
            console.error(error);
        } finally {
            localStorage.removeItem("operator_token");
            localStorage.removeItem("operator");
            navigate("/", { replace: true });
        }
    };

    return (
        <div className="flex min-h-svh flex-col bg-background">
            <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <Link
                        to="/compose-alert"
                        className="relative z-10 flex shrink-0 items-center gap-2 font-semibold tracking-tight"
                    >
                        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <ShieldCheck className="size-4" />
                        </span>
                        <span className="hidden sm:inline">
                            NwSSU{" "}
                            <span className="text-destructive">WBEAMS</span>
                        </span>
                    </Link>

                    <nav className="pointer-events-none absolute inset-x-0 top-0 flex h-14 items-center justify-center">
                        <div className="pointer-events-auto flex items-center gap-1 overflow-x-auto">
                            {navItems.map(({ to, label, icon: Icon }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    className={({ isActive }) =>
                                        cn(
                                            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-muted text-foreground"
                                                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                                        )
                                    }
                                >
                                    <Icon className="size-4 shrink-0" />
                                    <span className="hidden sm:inline">{label}</span>
                                </NavLink>
                            ))}
                        </div>
                    </nav>

                    <div className="relative z-10 flex shrink-0 items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-10 gap-2 px-2 data-[state=open]:bg-muted"
                                >
                                    <Avatar className="size-7">
                                        <AvatarFallback>
                                            {getInitials(displayName, displayEmail)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden max-w-[10rem] truncate text-sm font-medium md:inline">
                                        {displayName}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-56">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-medium">
                                            {displayName}
                                        </span>
                                        {displayEmail ? (
                                            <span className="text-xs text-muted-foreground">
                                                {displayEmail}
                                            </span>
                                        ) : null}
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem disabled className="gap-2">
                                    <UserRound className="size-4" />
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="gap-2 cursor-default"
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    <div className="flex w-full items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <ThemeIcon />
                                            <ThemeText />
                                        </div>
                                        <ThemeSwitch />
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    variant="destructive"
                                    className="gap-2"
                                    disabled={loggingOut}
                                    onClick={handleLogout}
                                >
                                    <LogOut className="size-4" />
                                    {loggingOut ? "Signing out…" : "Sign out"}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    );
}