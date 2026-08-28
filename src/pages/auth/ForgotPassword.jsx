import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Mail, Send, LockKeyhole, CheckCircle2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { requestPasswordReset } from "@/services/AuthOperatorService";
import { ForgotPasswordSchema } from "@/schemas/authSchema";
import { zodFieldValidator } from "@/lib/validators";
import { toast } from "sonner";

const ForgotPassword = () => {
    const [open, setOpen] = useState(false);
    const [sent, setSent] = useState(false);
    const [sentEmail, setSentEmail] = useState("");

    const forgotMutation = useMutation({
        mutationFn: (email) => requestPasswordReset(email),
        onSuccess: (_data, email) => {
            setSentEmail(email);
            setSent(true);
            toast.success("Check your email for a reset link.");
        },
        onError: (err) => {
            if (err.response?.status === 422) {
                const validationErrors = err.response.data.errors;
                if (validationErrors) {
                    Object.entries(validationErrors).forEach(([key, messages]) => {
                        form.setFieldMeta(key, (meta) => ({
                            ...meta,
                            errorMap: { onSubmit: messages[0] },
                        }));
                    });
                } else {
                    toast.error(err.response.data.message || "Validation failed.");
                }
            } else if (err.response?.status === 429) {
                toast.error(err.response.data.message || "Too many attempts.");
            } else {
                toast.error(err.response?.data?.message || "Unable to send reset link.");
            }
        },
    });

    const form = useForm({
        defaultValues: {
            email: "",
        },
        onSubmit: async ({ value }) => {
            const result = ForgotPasswordSchema.safeParse(value);
            if (!result.success) {
                result.error.issues.forEach((issue) => {
                    form.setFieldMeta(issue.path[0], (meta) => ({
                        ...meta,
                        errorMap: { onSubmit: issue.message },
                    }));
                });
                return;
            }
            await forgotMutation.mutateAsync(result.data.email);
        },
    });

    const handleOpenChange = (next) => {
        setOpen(next);
        if (!next) {
            setTimeout(() => {
                setSent(false);
                setSentEmail("");
                form.reset();
                forgotMutation.reset();
            }, 200);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <button type="button" className="text-sm hover:underline">
                    Forgot password?
                </button>
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-sm"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <LockKeyhole className="size-5" />
                        Forgot Password?
                    </DialogTitle>
                    <DialogDescription>
                        {sent
                            ? "If an account with that email exists, we sent a password reset link. Check your inbox (and spam folder)."
                            : "Enter your email address and we will send you a link to reset your password."}
                    </DialogDescription>
                </DialogHeader>

                {sent ? (
                    <>
                        <div className="flex flex-col items-center gap-3 py-4 text-center">
                            <CheckCircle2 className="size-10 text-green-600" />
                            <p className="text-sm text-muted-foreground">
                                Reset link sent to{" "}
                                <span className="font-medium text-foreground">{sentEmail}</span>
                            </p>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Close
                                </Button>
                            </DialogClose>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setSent(false);
                                    form.reset();
                                }}
                            >
                                Send again
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            form.handleSubmit();
                        }}
                        noValidate
                        className="grid gap-4"
                    >
                        <form.Field
                            name="email"
                            validators={{
                                onBlur: zodFieldValidator(ForgotPasswordSchema.shape.email),
                            }}
                        >
                            {(field) => (
                                <Field data-invalid={!field.state.meta.isValid}>
                                    <InputGroup>
                                        <InputGroupAddon>
                                            <Mail />
                                        </InputGroupAddon>
                                        <InputGroupInput
                                            id={field.name}
                                            type="email"
                                            placeholder="Enter your email"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            disabled={forgotMutation.isPending}
                                            aria-invalid={!field.state.meta.isValid}
                                            autoComplete="email"
                                            required
                                        />
                                    </InputGroup>
                                    <FieldError
                                        errors={field.state.meta.errors.map((message) => ({
                                            message,
                                        }))}
                                    />
                                </Field>
                            )}
                        </form.Field>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={forgotMutation.isPending}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    Close
                                </Button>
                            </DialogClose>
                            <form.Subscribe
                                selector={(state) => [state.canSubmit, state.isSubmitting]}
                            >
                                {([canSubmit, isSubmitting]) => (
                                    <Button
                                        type="submit"
                                        disabled={
                                            !canSubmit ||
                                            isSubmitting ||
                                            forgotMutation.isPending
                                        }
                                    >
                                        {isSubmitting || forgotMutation.isPending ? (
                                            <>
                                                <Spinner />
                                                Sending…
                                            </>
                                        ) : (
                                            <>
                                                <Send />
                                                Submit
                                            </>
                                        )}
                                    </Button>
                                )}
                            </form.Subscribe>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ForgotPassword;