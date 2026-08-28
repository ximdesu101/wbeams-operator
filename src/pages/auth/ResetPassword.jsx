import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { Tiles } from "@/components/styles/background/tiles";
import LoginImage from "@/assets/LoginImage.png";
import {
    validateResetToken,
    resetOperatorPassword,
} from "@/services/authOperatorService";
import {
    ResetPasswordSchema,
    passwordFieldSchema,
} from "@/schemas/authSchema";
import { zodFieldValidator } from "@/lib/validators";
import { toast } from "sonner";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

function ResetPassword({ className, ...props }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";
    const [showPassword, setShowPassword] = useState(false);

    const tokenQuery = useQuery({
        queryKey: ["reset-token", token],
        queryFn: () => validateResetToken(token),
        enabled: Boolean(token),
        retry: false,
    });

    const resetMutation = useMutation({
        mutationFn: (values) =>
            resetOperatorPassword(token, values.password, values.password_confirmation),
        onSuccess: () => {
            toast.success("Password reset successfully. You can now log in.");
            navigate("/", { replace: true });
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
            } else {
                toast.error(err.response?.data?.message || "Something went wrong.");
            }
        },
    });

    const form = useForm({
        defaultValues: {
            password: "",
            password_confirmation: "",
        },
        onSubmit: async ({ value }) => {
            const result = ResetPasswordSchema.safeParse(value);
            if (!result.success) {
                result.error.issues.forEach((issue) => {
                    form.setFieldMeta(issue.path[0], (meta) => ({
                        ...meta,
                        errorMap: { onSubmit: issue.message },
                    }));
                });
                return;
            }
            await resetMutation.mutateAsync(result.data);
        },
    });

    useEffect(() => {
        if (!token) return;
        form.reset();
    }, [token]);

    const email = tokenQuery.data?.data?.email;
    const tokenValid = tokenQuery.isSuccess;
    const tokenInvalid = !token || tokenQuery.isError;

    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <Tiles rows={40} cols={20} tileSize="md" />
            </div>
            <div
                className={cn(
                    "relative z-10 flex w-full max-w-sm flex-col gap-6 md:max-w-4xl",
                    className
                )}
                {...props}
            >
                <div className="flex flex-col gap-6">
                    <Card className="overflow-hidden p-0">
                        <CardContent className="grid p-0 md:grid-cols-2">
                            <div className="p-6 md:p-8">
                                <CardHeader className="px-0 pt-0">
                                    <CardTitle className="flex items-center gap-2 text-2xl">
                                        <LockKeyhole className="size-6" />
                                        Reset password
                                    </CardTitle>
                                    <CardDescription>
                                        {tokenQuery.isLoading
                                            ? "Validating your reset link…"
                                            : tokenValid
                                              ? email
                                                  ? `Set a new password for ${email}`
                                                  : "Choose a new password for your account."
                                              : "This reset link is invalid or has expired."}
                                    </CardDescription>
                                </CardHeader>

                                {tokenQuery.isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Spinner className="size-8" />
                                    </div>
                                ) : tokenInvalid ? (
                                    <div className="grid gap-4 py-4">
                                        <p className="text-sm text-muted-foreground">
                                            Request a new password reset from the login page.
                                        </p>
                                        <Button
                                            type="button"
                                            onClick={() => navigate("/", { replace: true })}
                                        >
                                            Back to login
                                        </Button>
                                    </div>
                                ) : (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            form.handleSubmit();
                                        }}
                                        noValidate
                                    >
                                        <FieldGroup>
                                            <form.Field
                                                name="password"
                                                validators={{
                                                    onBlur: zodFieldValidator(passwordFieldSchema),
                                                }}
                                            >
                                                {(field) => (
                                                    <Field data-invalid={!field.state.meta.isValid}>
                                                        <FieldLabel htmlFor={field.name}>
                                                            New password
                                                        </FieldLabel>
                                                        <InputGroup>
                                                            <InputGroupAddon>
                                                                <LockKeyhole />
                                                            </InputGroupAddon>
                                                            <InputGroupInput
                                                                id={field.name}
                                                                type={
                                                                    showPassword ? "text" : "password"
                                                                }
                                                                value={field.state.value}
                                                                onBlur={field.handleBlur}
                                                                onChange={(e) =>
                                                                    field.handleChange(e.target.value)
                                                                }
                                                                disabled={resetMutation.isPending}
                                                                aria-invalid={!field.state.meta.isValid}
                                                                autoComplete="new-password"
                                                            />
                                                            <InputGroupAddon align="inline-end">
                                                                <button
                                                                    type="button"
                                                                    className="text-muted-foreground"
                                                                    onClick={() =>
                                                                        setShowPassword((v) => !v)
                                                                    }
                                                                    tabIndex={-1}
                                                                >
                                                                    {showPassword ? (
                                                                        <EyeOff className="size-4" />
                                                                    ) : (
                                                                        <Eye className="size-4" />
                                                                    )}
                                                                </button>
                                                            </InputGroupAddon>
                                                        </InputGroup>
                                                        <FieldError
                                                            errors={field.state.meta.errors.map(
                                                                (message) => ({ message })
                                                            )}
                                                        />
                                                    </Field>
                                                )}
                                            </form.Field>

                                            <form.Field name="password_confirmation">
                                                {(field) => (
                                                    <Field data-invalid={!field.state.meta.isValid}>
                                                        <FieldLabel htmlFor={field.name}>
                                                            Confirm password
                                                        </FieldLabel>
                                                        <InputGroup>
                                                            <InputGroupAddon>
                                                                <LockKeyhole />
                                                            </InputGroupAddon>
                                                            <InputGroupInput
                                                                id={field.name}
                                                                type={
                                                                    showPassword ? "text" : "password"
                                                                }
                                                                value={field.state.value}
                                                                onBlur={field.handleBlur}
                                                                onChange={(e) =>
                                                                    field.handleChange(e.target.value)
                                                                }
                                                                disabled={resetMutation.isPending}
                                                                aria-invalid={!field.state.meta.isValid}
                                                                autoComplete="new-password"
                                                            />
                                                        </InputGroup>
                                                        <FieldError
                                                            errors={field.state.meta.errors.map(
                                                                (message) => ({ message })
                                                            )}
                                                        />
                                                    </Field>
                                                )}
                                            </form.Field>

                                            <FieldDescription>
                                                Password must be at least 8 characters.
                                            </FieldDescription>

                                            <Field>
                                                <form.Subscribe
                                                    selector={(state) => [
                                                        state.canSubmit,
                                                        state.isSubmitting,
                                                    ]}
                                                >
                                                    {([canSubmit, isSubmitting]) => (
                                                        <Button
                                                            type="submit"
                                                            disabled={
                                                                !canSubmit ||
                                                                isSubmitting ||
                                                                resetMutation.isPending
                                                            }
                                                        >
                                                            {isSubmitting || resetMutation.isPending ? (
                                                                <>
                                                                    <Spinner />
                                                                    Resetting…
                                                                </>
                                                            ) : (
                                                                "Reset password"
                                                            )}
                                                        </Button>
                                                    )}
                                                </form.Subscribe>
                                            </Field>
                                        </FieldGroup>
                                    </form>
                                )}
                            </div>
                            <div className="relative hidden bg-muted md:block">
                                <img
                                    src={LoginImage}
                                    alt=""
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;