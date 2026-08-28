import api from "@/lib/axios";

export const getEmergencyCategories = async () => {
    const response = await api.get("/operator/emergency-categories");
    return response.data;
};

export const getRecentDispatched = async ({ search = "", limit = 20 } = {}) => {
    const response = await api.get("/operator/alerts", {
        params: {
            search: search || undefined,
            limit,
        },
    });
    return response.data;
};

export const sendAlert = async (payload) => {
    const response = await api.post("/operator/alerts", payload);
    return response.data;
};