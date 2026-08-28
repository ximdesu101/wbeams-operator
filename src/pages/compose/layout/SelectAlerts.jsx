import { useState } from "react"
import * as LucideIcons from "lucide-react"
import { TriangleAlert, InfoIcon } from "lucide-react"
import {
    Alert,
    AlertAction,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useQuery } from "@tanstack/react-query"
import { getEmergencyCategories } from "@/services/alertService"
import ComposeAlert from "./ComposeAlert"

const SelectAlerts = () => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedAlertType, setSelectedAlertType] = useState(null)

    const { data, isLoading, isError } = useQuery({
        queryKey: ["emergency-categories"],
        queryFn: getEmergencyCategories,
    })

    const categories = data?.data ?? []

    const handleSelect = (alert) => {
        setSelectedAlertType(alert)
        setDialogOpen(true)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Spinner className="size-8" />
            </div>
        )
    }

    if (isError) {
        return <p className="text-sm text-destructive">Failed to load alert types.</p>
    }

    if (categories.length === 0) {
        return (
            <Alert variant="destructive">
                <InfoIcon />
                <AlertTitle>No active alert categories available.</AlertTitle>
                <AlertDescription>
                    The admin haven't created an alert type yet
                </AlertDescription>
            </Alert>
        )
    }
    return (
        <>
            <div className="space-y-6">
                {categories.map((category) => (
                    <Card key={category.id}>
                        <CardHeader>
                            <CardTitle>{category.name}</CardTitle>
                        </CardHeader>

                        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {category.alert_types.map((alert) => {
                                const Icon = LucideIcons[alert.icon] || TriangleAlert

                                return (
                                    <button
                                        key={alert.id}
                                        type="button"
                                        onClick={() => handleSelect(alert)}
                                        className="
                                            flex flex-col items-center justify-center
                                            gap-2 rounded-lg border bg-card
                                            p-4 text-sm font-medium
                                            transition-colors
                                            hover:bg-accent hover:text-accent-foreground
                                        "
                                        style={{ borderColor: alert.color }}
                                    >
                                        <Icon
                                            className="h-6 w-6"
                                            style={{ color: alert.color }}
                                        />
                                        <span className="text-center">
                                            {alert.name}
                                        </span>
                                    </button>
                                )
                            })}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <ComposeAlert
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                alertType={selectedAlertType}
            />
        </>
    )
}

export default SelectAlerts