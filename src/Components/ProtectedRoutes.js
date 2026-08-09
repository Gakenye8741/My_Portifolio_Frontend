import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
const ProtectedRoutes = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: '/login', replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
export default ProtectedRoutes;
