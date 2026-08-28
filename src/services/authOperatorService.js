import api from "@/lib/axios";

export const validateActivationToken = async (token) => {
    const response = await api.get("/operator/validate-token", {
        params: { token },
    });
    return response.data;
};

export const activateOperatorAccount = async (token, password, password_confirmation) => {
    const response = await api.post("/operator/activate", {
        token,
        password,
        password_confirmation,
    });
    return response.data;
};

export const OperatorLogin = async (credentials) => {
    const response = await api.post("/operator/login", credentials);
    return response.data;
};

export const OperatorMe = async () => {
    const response = await api.get("/operator/me");
    return response.data;
};

export const OperatorLogout = async () => {
    const response = await api.post("/operator/logout");
    return response.data;
};

export const requestPasswordReset = async (email) => {
    const response = await api.post("/operator/forgot-password", { email });
    return response.data;
};

export const validateResetToken = async (token) => {
    const response = await api.get("/operator/validate-reset-token", {
        params: { token },
    });
    return response.data;
};

export const resetOperatorPassword = async (token, password, password_confirmation) => {
    const response = await api.post("/operator/reset-password", {
        token,
        password,
        password_confirmation,
    });
    return response.data;
};