import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
// import TokenExpiryWatcher from "../../components/TokenWatcher";
const RootLayout = () => {
    return (_jsx(_Fragment, { children: _jsx(Outlet, {}) }));
};
export default RootLayout;
