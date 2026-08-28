import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from "@/App";
import Login from "@/pages/auth/Login";
import AuthProtector from "./guard/AuthProtector";
import OperatorLayout from "@/pages/OperatorLayout";
import PageLoader from "@/components/common/PageLoader";

const AccountActivitation = lazy(() => import("@/pages/auth/AccountActivation"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const Compose = lazy(() => import("@/pages/compose/Compose"));
const Reports = lazy(() => import("@/pages/reports/ReportedIncidents"));

const withSuspense = (Component) => (
    <Suspense fallback={<PageLoader />}>
        <Component />
    </Suspense>
);

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <Login />,
            },
            {
                path: "operator/activate",
                element: withSuspense(AccountActivitation),
            },
            {
                path: "operator/reset-password",
                element: withSuspense(ResetPassword),
            },
        ],
    },
    {
        element: <AuthProtector />,
        children: [
            {
                element: <OperatorLayout />,
                children: [
                    {
                        path: "compose-alert",
                        element: withSuspense(Compose),
                    },
                    {
                        path: "reports",
                        element: withSuspense(Reports),
                    },
                ],
            },
        ],
    },
]);