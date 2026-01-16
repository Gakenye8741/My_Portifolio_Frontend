import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTheme } from '../ThemeContext';
import { Lock, ShieldCheck, ArrowRight, AlertCircle, Eye, EyeOff, Mail } from 'lucide-react';
import { useLoginMutation } from '../Features/Apis/AuthApi';
import { setCredentials } from '../Features/Auth/AuthSlice';
const Login = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // RTK Query Mutation Hook
    const [login, { isLoading }] = useLoginMutation();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // 1. Execute mutation with current form data
            const result = await login({
                email: formData.email,
                password: formData.password
            }).unwrap();
            // 2. Dispatch to Redux (Mapping exactly to your AuthSlice payload)
            // Result from backend: { token, user: { role, email, etc... } }
            dispatch(setCredentials({
                user: result.user,
                token: result.token,
                role: result.user.role // Extracting role specifically to satisfy TS
            }));
            // 3. Navigate to the projects management center
            navigate('/registry');
        }
        catch (err) {
            // 4. Detailed Error Catching
            const errorMessage = err.data?.message || 'PROTOCOL_FAILURE: ACCESS_DENIED';
            setError(errorMessage.toUpperCase());
        }
    };
    return (_jsxs("main", { className: "min-h-screen flex items-center justify-center p-6 relative overflow-hidden", style: { backgroundColor: theme["base-100"], color: theme["base-content"] }, children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx("div", { className: "absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10", style: { backgroundColor: theme.primary } }), _jsx("div", { className: "absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10", style: { backgroundColor: theme.primary } })] }), _jsxs("div", { className: "w-full max-w-md relative z-10", children: [_jsxs("div", { className: "text-center mb-10 space-y-4", children: [_jsx("div", { className: "inline-flex p-4 rounded-3xl bg-black/40 border border-white/5 shadow-2xl mb-4", children: _jsx(ShieldCheck, { size: 40, style: { color: theme.primary }, className: "animate-pulse" }) }), _jsxs("h2", { className: "text-4xl font-black uppercase italic tracking-tighter", children: ["ADMIN_", _jsx("span", { style: { color: theme.primary }, children: "AUTH." })] }), _jsx("p", { className: "text-[10px] font-bold opacity-30 uppercase tracking-[0.5em]", children: "System_Secure_Gateway_v2.0" })] }), _jsxs("form", { onSubmit: handleLogin, className: "space-y-6 p-8 md:p-12 rounded-[3.5rem] border border-white/5 bg-black/20 backdrop-blur-3xl shadow-2xl", children: [error && (_jsxs("div", { className: "flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest animate-shake", children: [_jsx(AlertCircle, { size: 16 }), " ", error] })), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "space-y-2 group", children: [_jsx("label", { className: "text-[9px] font-black uppercase tracking-widest opacity-30 ml-2", children: "Access_Identifier (Email)" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { size: 18, className: "absolute left-5 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity", style: { color: theme.primary } }), _jsx("input", { type: "email", required: true, placeholder: "ADMIN@EXAMPLE.COM", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), className: "w-full bg-black/40 border-2 border-white/5 rounded-2xl py-5 pl-14 pr-6 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-primary/40 transition-all placeholder:opacity-20" })] })] }), _jsxs("div", { className: "space-y-2 group", children: [_jsx("label", { className: "text-[9px] font-black uppercase tracking-widest opacity-30 ml-2", children: "Security_Protocol" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { size: 18, className: "absolute left-5 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity", style: { color: theme.primary } }), _jsx("input", { type: showPassword ? "text" : "password", required: true, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: formData.password, onChange: (e) => setFormData({ ...formData, password: e.target.value }), className: "w-full bg-black/40 border-2 border-white/5 rounded-2xl py-5 pl-14 pr-14 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-primary/40 transition-all placeholder:opacity-20" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-5 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-100 transition-opacity", children: showPassword ? _jsx(EyeOff, { size: 18 }) : _jsx(Eye, { size: 18 }) })] })] })] }), _jsx("button", { type: "submit", disabled: isLoading, className: "w-full relative group overflow-hidden py-6 rounded-2xl transition-all active:scale-95 disabled:opacity-50", style: { backgroundColor: theme.primary, color: theme["base-100"] }, children: _jsx("span", { className: "relative z-10 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.3em]", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" }), "AUTHENTICATING..."] })) : (_jsxs(_Fragment, { children: ["Establish_Session ", _jsx(ArrowRight, { size: 18 })] })) }) })] }), _jsx("div", { className: "mt-8 text-center", children: _jsx("button", { onClick: () => navigate('/'), className: "text-[9px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-all", children: "\u2190 Return_to_Public_Registry" }) })] }), _jsx("style", { children: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      ` })] }));
};
export default Login;
