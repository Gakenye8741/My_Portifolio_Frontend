import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navbar } from "../Components/Navbar";
import { AdminLayout } from "../DashBoard/DashBoards/dashboardDesign/AdminLayout";
export const AdminDashBoard = () => {
    return (_jsxs("div", { className: "h-screen mt-20", children: [_jsx(Navbar, {}), _jsx(AdminLayout, {})] }));
};
