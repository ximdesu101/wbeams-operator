import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import { Tiles } from "@/components/styles/background/tiles";
import LoginImage from "@/assets/LoginImage.png";
import {
    validateActivationToken,
    activateOperatorAccount,
} from "@/services/authOperatorService";
import {
    ActivateAccountSchema,
    passwordFieldSchema,
    passwordConfirmFieldSchema,
} from "@/schemas/authSchema";
import { zodFieldValidator } from "@/lib/validators";
import { toast } from "sonner";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";

function OperatorActivation({ className, ...props }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const tokenQuery = useQuery({
        queryKey: ["activation-token", token],
        queryFn: () => validateActivationToken(token),
        enabled: Boolean(token),
        retry: false,
    });

    const activateMutation = useMutation({
        mutationFn: (values) =>
            activateOperatorAccount(token, values.password, values.password_confirmation),
        onSuccess: () => {
            toast.success("Account activated! You can now log in.");
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
            const result = ActivateAccountSchema.safeParse(value);
            if (!result.success) {
                result.error.issues.forEach((issue) => {
                    form.setFieldMeta(issue.path[0], (meta) => ({
                        ...meta,
                        errorMap: { onSubmit: issue.message },
                    }));
                });
                return;
            }
            await activateMutation.mutateAsync(result.data);
        },
    });

    useEffect(() => {
        if (!token) return;
        form.reset();
    }, [token]);

    const operator = tokenQuery.data?.data;
    const tokenValid = tokenQuery.isSuccess;
    const tokenInvalid = !token || tokenQuery.isError;

    return (
        <div
            className={cn("relative w-screen h-screen overflow-hidden", className)}
            {...props}
        >
            <div className="absolute inset-0 z-0">
                <Tiles rows={40} cols={20} />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 p-6 md:p-10 z-10">
                <div className="w-full max-w-sm md:max-w-4xl">
                    <Card className="overflow-hidden p-0">
                        <CardContent className="grid p-0 md:grid-cols-2">
                            <div className="p-6 md:p-8">
                                <CardHeader className="px-0 pt-0">
                                    <CardTitle className="flex items-center gap-2 text-2xl">
                                        <ShieldCheck className="size-6" />
                                        Activate account
                                    </CardTitle>
                                    <CardDescription>
                                        {tokenQuery.isLoading
                                            ? "Validating your invitation link…"
                                            : tokenValid
                                                ? operator
                                                ? <>Welcome, {operator.first_name}! Please set a password to activate your account. Your email is <strong>{operator.email}</strong>.</>
                                                    : "Set a password to activate your account."
                                                : "This invitation link is invalid or has expired."}
                                    </CardDescription>
                                </CardHeader>
                                <Separator/>
                                {tokenQuery.isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Spinner className="size-8" />
                                    </div>
                                ) : tokenInvalid ? (
                                    <div className="grid gap-4">
                                        <p className="text-sm text-muted-foreground">
                                            Ask your administrator to resend an invitation.
                                        </p>
                                        <Separator />
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
                                                    onBlur: zodFieldValidator(
                                                        passwordFieldSchema
                                                    ),
                                                }}
                                            >
                                                {(field) => (
                                                    <Field data-invalid={!field.state.meta.isValid}>
                                                        <FieldLabel htmlFor={field.name}>
                                                            Password
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
                                                                disabled={activateMutation.isPending}
                                                                aria-invalid={!field.state.meta.isValid}
                                                                autoComplete="new-password"
                                                            />
                                                            <InputGroupAddon align="inline-end">
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <button
                                                                            type="button"
                                                                            aria-label="Toggle password visibility"
                                                                            onClick={() => setShowPassword((prev) => !prev)}
                                                                            className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                                                                        >
                                                                            {showPassword ? (
                                                                                <EyeOff className="w-5 h-5" />
                                                                            ) : (
                                                                                <Eye className="w-5 h-5" />
                                                                            )}
                                                                        </button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{showPassword ? 'Hide password' : 'Show password'}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
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
                                            <form.Field
                                                name="password_confirmation"
                                                validators={{
                                                    onBlur: ({ value, fieldApi }) => {
                                                        const schemaResult = passwordConfirmFieldSchema.safeParse(value);
                                                        if (!schemaResult.success) {
                                                            return schemaResult.error.issues[0].message;
                                                        }
                                                        if (value !== fieldApi.form.getFieldValue("password")) {
                                                            return "Passwords do not match";
                                                        }
                                                        return undefined;
                                                    },
                                                }}
                                            >
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
                                                                    showConfirmPassword ? "text" : "password"
                                                                }
                                                                value={field.state.value}
                                                                onBlur={field.handleBlur}
                                                                onChange={(e) =>
                                                                    field.handleChange(e.target.value)
                                                                }
                                                                disabled={activateMutation.isPending}
                                                                aria-invalid={!field.state.meta.isValid}
                                                                autoComplete="new-password"
                                                            />
                                                            <InputGroupAddon align="inline-end">
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <button
                                                                            type="button"
                                                                            aria-label="Toggle password visibility"
                                                                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                                                                            className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                                                                        >
                                                                            {showConfirmPassword ? (
                                                                                <EyeOff className="w-5 h-5" />
                                                                            ) : (
                                                                                <Eye className="w-5 h-5" />
                                                                            )}
                                                                        </button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{showConfirmPassword ? 'Hide password' : 'Show password'}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
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
                                                                activateMutation.isPending
                                                            }
                                                        >
                                                            {isSubmitting ||
                                                                activateMutation.isPending ? (
                                                                <>
                                                                    <Spinner />
                                                                    Activating…
                                                                </>
                                                            ) : (
                                                                "Activate account"
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

export default OperatorActivation;