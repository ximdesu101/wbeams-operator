import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

import ThemeIcon from "@/components/theme/ThemeIcon"
import ThemeSwitch from "@/components/theme/ThemeSwitch"
import ThemeText from "@/components/theme/ThemeText"

export function NavProjects({ projects }) {
    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Account & System Setting</SidebarGroupLabel>

            <SidebarMenu>
                {projects.map((item) => (
                    <SidebarMenuItem key={item.name}>
                        {item.isThemeToggle ? (
                            <SidebarMenuButton asChild>
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center space-x-2">
                                        <ThemeIcon />
                                        <ThemeText />
                                    </div>
                                    <ThemeSwitch />
                                </div>
                            </SidebarMenuButton>
                        ) : (
                            <SidebarMenuButton asChild>
                                <a href={item.url}>
                                    {item.icon && <item.icon />}
                                    <span>{item.name}</span>
                                </a>
                            </SidebarMenuButton>
                        )}
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}