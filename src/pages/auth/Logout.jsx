import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OperatorLogout } from "@/services/AuthOperatorService";

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleLogout = async () => {
            const token = localStorage.getItem("operator_token");

            try {
                if (token) {
                    await AdminLogout(token);
                }
            } catch (error) {
                console.error(error);
            } finally {
                localStorage.removeItem("Operator_token");
                localStorage.removeItem("operator");

                navigate("/", { replace: true });
            }
        };

        handleLogout();
    }, [navigate]);

    return null;
};

export default Logout;