import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    FileUp,
    Logs,
    RouteOff,
    FolderSync,
    ShieldCheck,
    Activity,
    UserRoundCog,
    ChartNoAxesCombined,
    Settings2,
    LogOut,
    Loader2,
} from "lucide-react";

import { NavMain } from "@/components/layout/sidebar/sidebar-layout/nav-main";
import { NavUser } from "@/components/layout/sidebar/sidebar-layout/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';

const navMain = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Compose Alert", url: "/compose-alert", icon: LayoutDashboard },
    { title: "Reported Incidence", url: "/reports", icon: LayoutDashboard },
    { title: "Analytics", url: "#", icon: ChartNoAxesCombined },
    { title: "User Logs", url: "#", icon: Logs },
];

export function AppSidebar({ ...props }) {
    const [operator] = useState(() => {
        const stored = localStorage.getItem("operator");
        if (!stored) return null;

        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    });

    const user = operator
        ? {
            name: `${operator.first_name} ${operator.last_name}`,
            email: operator.email,
            avatar: operator.avatar ?? "/avatars/shadcn.jpg",
        }
        : {
            name: "Unknown Operator",
            email: "",
            avatar: "/avatars/shadcn.jpg",
        };

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <ShieldCheck className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">NwSSU Alert</span>
                                <span className="truncate text-xs text-muted-foreground">Emergency Alert System</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}