import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/Components/SEO.tsx
import { Helmet } from 'react-helmet-async';
export default function SEO({ title, description, name = "Gakenye Ndiritu", type = "website", path = "", }) {
    const siteUrl = "https://gakenye-ndiritu.co.ke";
    const fullUrl = `${siteUrl}${path}`;
    return (_jsxs(Helmet, { children: [_jsx("title", { children: title }), _jsx("meta", { name: "description", content: description }), _jsx("link", { rel: "canonical", href: fullUrl }), _jsx("meta", { property: "og:type", content: type }), _jsx("meta", { property: "og:url", content: fullUrl }), _jsx("meta", { property: "og:title", content: title }), _jsx("meta", { property: "og:description", content: description }), _jsx("meta", { property: "og:site_name", content: `${name} Portfolio` }), _jsx("meta", { name: "twitter:card", content: "summary_large_image" }), _jsx("meta", { name: "twitter:title", content: title }), _jsx("meta", { name: "twitter:description", content: description })] }));
}
