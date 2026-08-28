import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    InputGroup,
    InputGroupTextarea,
    InputGroupInput,
} from "@/components/ui/input-group";
import {
    Sheet,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetContent,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldError,
    FieldContent,
    FieldTitle,
} from "@/components/ui/field";
import { Send } from "lucide-react";
import { alertSchema } from "@/schemas/alertSchema";
import { zodFieldValidator } from "@/lib/validators";
import { sendAlert } from "@/services/alertService";

const severityStyles = {
    emerald: {
        card: "has-[[data-state=checked]]:border-emerald-500 has-[[data-state=checked]]:bg-emerald-50 dark:has-[[data-state=checked]]:bg-emerald-950/40",
        text: "has-[[data-state=checked]]:text-emerald-700 dark:has-[[data-state=checked]]:text-emerald-400",
    },
    yellow: {
        card: "has-[[data-state=checked]]:border-yellow-500 has-[[data-state=checked]]:bg-yellow-50 dark:has-[[data-state=checked]]:bg-yellow-950/40",
        text: "has-[[data-state=checked]]:text-yellow-700 dark:has-[[data-state=checked]]:text-yellow-400",
    },
    orange: {
        card: "has-[[data-state=checked]]:border-orange-500 has-[[data-state=checked]]:bg-orange-50 dark:has-[[data-state=checked]]:bg-orange-950/40",
        text: "has-[[data-state=checked]]:text-orange-700 dark:has-[[data-state=checked]]:text-orange-400",
    },
    red: {
        card: "has-[[data-state=checked]]:border-red-500 has-[[data-state=checked]]:bg-red-50 dark:has-[[data-state=checked]]:bg-red-950/40",
        text: "has-[[data-state=checked]]:text-red-700 dark:has-[[data-state=checked]]:text-red-400",
    },
};

const ComposeAlert = ({ open, onOpenChange, alertType, onSuccess }) => {
    const queryClient = useQueryClient();

    const sendAlertMutation = useMutation({
        mutationFn: (values) =>
            sendAlert({
                alert_type_id: alertType.id,
                title: alertType.name,
                message: values.message,
                response_instructions: values.instructions
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean),
                severity: values.severity,
                target_roles: values.targetRoles,
                channels: values.channels,
            }),
        onSuccess: () => {
            toast.success("Alert dispatched successfully.");
            queryClient.invalidateQueries({ queryKey: ["alerts"] });
            queryClient.invalidateQueries({ queryKey: ["recent-dispatched"] });
            form.reset();
            onOpenChange(false);
            onSuccess?.();
        },
        onError: (err) => {
            const errors = err.response?.data?.errors;
            if (errors) {
                Object.entries(errors).forEach(([key, messages]) => {
                    form.setFieldMeta(key, (meta) => ({
                        ...meta,
                        errorMap: { onSubmit: messages[0] },
                    }));
                });
            } else {
                toast.error(err.response?.data?.message || "Something went wrong.");
            }
        },
    });

    const form = useForm({
        defaultValues: {
            message: "",
            instructions: "",
            severity: "low",
            targetRoles: ["student", "faculty", "staff"],
            channels: ["email", "web_push", "sms"],
        },
        onSubmit: async ({ value }) => {
            const result = alertSchema.safeParse(value);
            if (!result.success) {
                result.error.issues.forEach((issue) => {
                    form.setFieldMeta(issue.path[0], (meta) => ({
                        ...meta,
                        errorMap: { onSubmit: issue.message },
                    }));
                });
                return;
            }
            await sendAlertMutation.mutateAsync(result.data);
        },
    });

    useEffect(() => {
        if (!open || !alertType) return;
        form.reset({
            message: alertType.description ?? "",
            instructions: (alertType.response_instructions ?? []).join("\n"),
            severity: alertType.severity ?? "low",
            targetRoles: ["student", "faculty", "staff"],
            channels: ["email", "web_push", "sms"],
        });
    }, [open, alertType, form]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-lg p-0 gap-0 flex flex-col"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                    noValidate
                    className="flex flex-col h-full min-h-0"
                >
                    {/* Header */}
                    <SheetHeader className="px-6 py-4 border-b shrink-0 space-y-1">
                        <SheetTitle className="text-lg">
                            {alertType?.name ?? "Compose Alert"}
                        </SheetTitle>
                    </SheetHeader>

                    {/* Scrollable body */}
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        <FieldGroup>
                            {/* Headline */}
                            <form.Field
                                name="message"
                                validators={{
                                    onBlur: zodFieldValidator(alertSchema.shape.message),
                                }}
                            >
                                {(field) => (
                                    <Field data-invalid={!field.state.meta.isValid}>
                                        <FieldLabel htmlFor={field.name}>Headline</FieldLabel>
                                        <InputGroup>
                                            <InputGroupTextarea
                                                id={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                disabled={sendAlertMutation.isPending}
                                                aria-invalid={!field.state.meta.isValid}
                                            />
                                        </InputGroup>
                                        <FieldError
                                            errors={field.state.meta.errors.map((message) => ({ message }))}
                                        />
                                    </Field>
                                )}
                            </form.Field>

                            {/* Response Instructions */}
                            <form.Field name="instructions">
                                {(field) => (
                                    <Field>
                                        <FieldLabel htmlFor={field.name}>
                                            Response Instructions
                                        </FieldLabel>
                                        <InputGroup>
                                            <InputGroupTextarea
                                                id={field.name}
                                                rows={4}
                                                className="min-h-[100px] resize-none no-scrollbar"
                                                placeholder="One instruction per line"
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                disabled={sendAlertMutation.isPending}
                                            />
                                        </InputGroup>
                                    </Field>
                                )}
                            </form.Field>

                            {/* Severity */}
                            <form.Field name="severity">
                                {(field) => (
                                    <Field data-invalid={!field.state.meta.isValid}>
                                        <FieldLabel>Severity</FieldLabel>
                                        <RadioGroup
                                            value={field.state.value}
                                            onValueChange={(val) => field.handleChange(val)}
                                            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                                            disabled={sendAlertMutation.isPending}
                                        >
                                            {[
                                                { value: "low", title: "Low", color: "emerald" },
                                                { value: "medium", title: "Medium", color: "yellow" },
                                                { value: "high", title: "High", color: "orange" },
                                                { value: "critical", title: "Critical", color: "red" },
                                            ].map((opt) => (
                                                <FieldLabel
                                                    key={opt.value}
                                                    htmlFor={`${opt.value}-severity`}
                                                    className="cursor-pointer"
                                                >
                                                    <Field
                                                        className={cn(
                                                            "flex h-10 w-full items-center justify-center rounded-md border transition-colors",
                                                            severityStyles[opt.color].card,
                                                            severityStyles[opt.color].text
                                                        )}
                                                    >
                                                        <FieldContent className="text-center text-sm">
                                                            {opt.title}
                                                        </FieldContent>

                                                        <RadioGroupItem
                                                            value={opt.value}
                                                            id={`${opt.value}-severity`}
                                                            className="sr-only"
                                                        />
                                                    </Field>
                                                </FieldLabel>
                                            ))}
                                        </RadioGroup>
                                        <FieldError
                                            errors={field.state.meta.errors.map((message) => ({ message }))}
                                        />
                                    </Field>
                                )}
                            </form.Field>

                            {/* Target Roles */}
                            <form.Field
                                name="targetRoles"
                                validators={{
                                    onChange: zodFieldValidator(alertSchema.shape.targetRoles),
                                }}
                            >
                                {(field) => {
                                    const toggleRole = (role) => {
                                        const current = field.state.value;
                                        field.handleChange(
                                            current.includes(role)
                                                ? current.filter((r) => r !== role)
                                                : [...current, role]
                                        );
                                    };

                                    const ROLE_DETAILS = [
                                        { value: "student", title: "Students" },
                                        { value: "faculty", title: "Faculty" },
                                        { value: "staff", title: "Staff" },
                                    ];

                                    return (
                                        <Field data-invalid={!field.state.meta.isValid}>
                                            <FieldLabel>Send to</FieldLabel>
                                            <div className="grid grid-cols-3 gap-2">
                                                {ROLE_DETAILS.map((opt) => (
                                                    <FieldLabel
                                                        key={opt.value}
                                                        htmlFor={`${opt.value}-role`}
                                                        className="cursor-pointer"
                                                    >
                                                        <Field
                                                            orientation="horizontal"
                                                            className="items-center justify-between rounded-md border px-3 py-2 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                                                        >
                                                            <FieldContent>
                                                                <FieldTitle className="text-sm">
                                                                    {opt.title}
                                                                </FieldTitle>
                                                            </FieldContent>
                                                            <Checkbox
                                                                id={`${opt.value}-role`}
                                                                checked={field.state.value.includes(opt.value)}
                                                                onCheckedChange={() => toggleRole(opt.value)}
                                                                disabled={sendAlertMutation.isPending}
                                                            />
                                                        </Field>
                                                    </FieldLabel>
                                                ))}
                                            </div>
                                            <FieldError
                                                errors={field.state.meta.errors.map((message) => ({ message }))}
                                            />
                                        </Field>
                                    );
                                }}
                            </form.Field>

                            {/* Channels */}
                            <form.Field
                                name="channels"
                                validators={{
                                    onChange: zodFieldValidator(alertSchema.shape.channels),
                                }}
                            >
                                {(field) => {
                                    const toggleChannel = (channel) => {
                                        const current = field.state.value;
                                        field.handleChange(
                                            current.includes(channel)
                                                ? current.filter((c) => c !== channel)
                                                : [...current, channel]
                                        );
                                    };

                                    const CHANNEL_DETAILS = [
                                        { value: "email", title: "Email" },
                                        { value: "web_push", title: "In-App" },
                                        { value: "sms", title: "SMS" },
                                    ];

                                    return (
                                        <Field data-invalid={!field.state.meta.isValid}>
                                            <FieldLabel>Channels</FieldLabel>
                                            <div className="grid grid-cols-3 gap-2">
                                                {CHANNEL_DETAILS.map((opt) => (
                                                    <FieldLabel
                                                        key={opt.value}
                                                        htmlFor={`${opt.value}-channel`}
                                                        className="cursor-pointer"
                                                    >
                                                        <Field
                                                            orientation="horizontal"
                                                            className="items-center justify-between rounded-md border px-3 py-2 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                                                        >
                                                            <FieldContent>
                                                                <FieldTitle className="text-sm">
                                                                    {opt.title}
                                                                </FieldTitle>
                                                            </FieldContent>
                                                            <Checkbox
                                                                id={`${opt.value}-channel`}
                                                                checked={field.state.value.includes(opt.value)}
                                                                onCheckedChange={() => toggleChannel(opt.value)}
                                                                disabled={sendAlertMutation.isPending}
                                                            />
                                                        </Field>
                                                    </FieldLabel>
                                                ))}
                                            </div>
                                            <FieldError
                                                errors={field.state.meta.errors.map((message) => ({ message }))}
                                            />
                                        </Field>
                                    );
                                }}
                            </form.Field>
                        </FieldGroup>
                    </div>

                    {/* Footer */}
                    <SheetFooter className="px-6 py-4 border-t shrink-0 flex-row gap-2 sm:justify-end">
                        <SheetClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={sendAlertMutation.isPending}
                                className="flex-1 sm:flex-none"
                            >
                                Cancel
                            </Button>
                        </SheetClose>
                        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                            {([canSubmit, isSubmitting]) => (
                                <Button
                                    type="submit"
                                    disabled={
                                        !canSubmit ||
                                        isSubmitting ||
                                        sendAlertMutation.isPending
                                    }
                                    className="flex-1 sm:flex-none"
                                >
                                    {isSubmitting || sendAlertMutation.isPending ? (
                                        <>
                                            <Spinner />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-3.5 h-3.5" />
                                            Send Alert
                                        </>
                                    )}
                                </Button>
                            )}
                        </form.Subscribe>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
};

export default ComposeAlert;