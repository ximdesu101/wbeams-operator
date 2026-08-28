import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldError,
} from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import LoginImage from "@/assets/LoginImage.png";
import { Tiles } from "@/components/styles/background/tiles";
import { LoginSchema } from "@/schemas/authSchema";
import { zodFieldValidator } from "@/lib/validators";
import { OperatorLogin } from "@/services/authOperatorService";
import ForgotPassword from "./ForgotPassword";

const LoginForm = ({ className, ...props }) => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("operator_token");
        if (token) {
            navigate("/compose-alert", { replace: true });
        }
    }, [navigate]);

    const loginMutation = useMutation({
        mutationFn: (values) => OperatorLogin(values),
        onSuccess: (data) => {
            localStorage.setItem("operator_token", data.token);
            localStorage.setItem("operator", JSON.stringify(data.operator));
            navigate("/compose-alert", { replace: true });
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
            } else if (err.response?.status === 401) {
                toast.error(err.response.data.message || "Invalid credentials.");
            } else if (err.response?.status === 429) {
                toast.error(err.response.data.message || "Too many attempts. Try again later.");
            } else {
                toast.error(err.response?.data?.message || "Something went wrong.");
            }
        },
    });

    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        onSubmit: async ({ value }) => {
            const result = LoginSchema.safeParse(value);
            if (!result.success) {
                result.error.issues.forEach((issue) => {
                    form.setFieldMeta(issue.path[0], (meta) => ({
                        ...meta,
                        errorMap: { onSubmit: issue.message },
                    }));
                });
                return;
            }
            await loginMutation.mutateAsync(result.data);
        },
    });

    return (
        <div
            className={cn("relative w-screen h-screen overflow-hidden", className)}
            {...props}
        >
            <div className="absolute inset-0 z-0">
                <Tiles rows={50} cols={50} />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 p-6 md:p-10 z-10">
                <div className="w-full max-w-sm md:max-w-4xl">
                    <Card className="overflow-hidden p-0">
                        <CardContent className="grid p-0 md:grid-cols-2">
                            <form
                                className="p-6 md:p-8"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    form.handleSubmit();
                                }}
                                noValidate
                            >
                                <FieldGroup>
                                    <div className="flex flex-col items-center gap-1 text-center">
                                        <h1 className="text-2xl font-bold">Welcome back</h1>
                                        <p className="text-sm text-balance text-muted-foreground">
                                            Sign in to your operator account
                                        </p>
                                    </div>
                                    <form.Field
                                        name="email"
                                        validators={{
                                            onBlur: zodFieldValidator(LoginSchema.shape.email),
                                        }}
                                    >
                                        {(field) => (
                                            <Field data-invalid={!field.state.meta.isValid}>
                                                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                                                <InputGroup>
                                                    <InputGroupInput
                                                        id={field.name}
                                                        type="email"
                                                        placeholder="operator@example.com"
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) =>
                                                            field.handleChange(e.target.value)
                                                        }
                                                        disabled={loginMutation.isPending}
                                                        aria-invalid={!field.state.meta.isValid}
                                                        autoComplete="email"
                                                    />
                                                    <InputGroupAddon>
                                                        <Mail />
                                                    </InputGroupAddon>
                                                </InputGroup>
                                                <FieldError
                                                    errors={field.state.meta.errors.map((message) => ({
                                                        message,
                                                    }))}
                                                />
                                            </Field>
                                        )}
                                    </form.Field>
                                    <form.Field
                                        name="password"
                                        validators={{
                                            onBlur: zodFieldValidator(LoginSchema.shape.password),
                                        }}
                                    >
                                        {(field) => (
                                            <Field data-invalid={!field.state.meta.isValid}>
                                                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                                                <InputGroup>
                                                    <InputGroupInput
                                                        id={field.name}
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="••••••••"
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) =>
                                                            field.handleChange(e.target.value)
                                                        }
                                                        disabled={loginMutation.isPending}
                                                        aria-invalid={!field.state.meta.isValid}
                                                        autoComplete="current-password"
                                                    />
                                                    <InputGroupAddon><Lock /></InputGroupAddon> 
                                                    <InputGroupAddon align="inline-end">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
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
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>
                                                                    {showPassword
                                                                        ? "Hide password"
                                                                        : "Show password"}
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </InputGroupAddon>
                                                </InputGroup>
                                                <FieldError
                                                    errors={field.state.meta.errors.map((message) => ({
                                                        message,
                                                    }))}
                                                />
                                            </Field>
                                        )}
                                    </form.Field>
                                    <div>
                                        <ForgotPassword />
                                    </div>
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
                                                        loginMutation.isPending
                                                    }
                                                >
                                                    {isSubmitting || loginMutation.isPending ? (
                                                        <>
                                                            <Spinner />
                                                            Signing in...
                                                        </>
                                                    ) : (
                                                        "Sign In"
                                                    )}
                                                </Button>
                                            )}
                                        </form.Subscribe>
                                    </Field>
                                </FieldGroup>
                            </form>
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
};

export default LoginForm;