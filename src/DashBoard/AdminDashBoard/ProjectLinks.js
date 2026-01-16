import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useGetProjectsQuery } from "../../Features/Apis/Projects.Api";
import { useGetLinksByProjectIdQuery, useSyncProjectLinksMutation } from '../../Features/Apis/ProjectLinks.Api';
import { useTheme } from '../../ThemeContext';
import { Link as LinkIcon, Plus, Trash2, Zap, Loader2, ChevronDown, LayoutGrid } from 'lucide-react';
import { toast } from 'react-hot-toast';
const StandaloneLinkManager = () => {
    const { theme } = useTheme();
    // --- STATE ---
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [localLinks, setLocalLinks] = useState([]);
    // --- API HOOKS ---
    const { data: projects, isLoading: projectsLoading } = useGetProjectsQuery();
    const { data: existingLinks, isLoading: linksLoading, isFetching: linksFetching } = useGetLinksByProjectIdQuery(selectedProjectId, { skip: !selectedProjectId });
    const [syncLinks, { isLoading: isSyncing }] = useSyncProjectLinksMutation();
    // Sync local state when API data arrives
    useEffect(() => {
        if (existingLinks) {
            setLocalLinks(existingLinks.map(l => ({
                label: l.label, url: l.url, type: l.type
            })));
        }
        else {
            setLocalLinks([]);
        }
    }, [existingLinks]);
    // --- HANDLERS ---
    const addLinkRow = () => setLocalLinks([...localLinks, { label: "", url: "", type: "live_demo" }]);
    const removeLinkRow = (index) => setLocalLinks(localLinks.filter((_, i) => i !== index));
    const updateLinkRow = (index, field, value) => {
        const updated = [...localLinks];
        updated[index] = { ...updated[index], [field]: value };
        setLocalLinks(updated);
    };
    const handleSync = async () => {
        if (!selectedProjectId)
            return toast.error("Select a target project first");
        try {
            await syncLinks({ projectId: selectedProjectId, links: localLinks }).unwrap();
            toast.success("REGISTRY_UPDATED_SUCCESSFULLY");
        }
        catch (err) {
            toast.error("SYNC_FAILED");
        }
    };
    return (_jsx("div", { className: "min-h-screen p-4 lg:p-8 transition-all duration-500", style: { backgroundColor: theme["base-100"], color: theme["base-content"] }, children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "mb-10 space-y-2 border-b pb-8", style: { borderColor: `${theme.primary}10` }, children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "h-1.5 w-1.5 rounded-full animate-pulse", style: { backgroundColor: theme.primary } }), _jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.4em]", style: { color: theme.primary }, children: "Network_Control / Link_Sync" })] }), _jsxs("h1", { className: "text-4xl font-black italic tracking-tighter uppercase leading-none", children: ["Link", _jsx("span", { className: "font-light not-italic", style: { color: theme.primary }, children: "Registry" })] })] }), _jsxs("div", { className: "mb-8 p-6 rounded-3xl border transition-all", style: { backgroundColor: `${theme["base-content"]}03`, borderColor: `${theme["base-content"]}08` }, children: [_jsx("label", { className: "text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-3 block", children: "Target_Deployment_Node" }), _jsxs("div", { className: "relative", children: [_jsx(LayoutGrid, { className: "absolute left-4 top-1/2 -translate-y-1/2 opacity-20", size: 18 }), _jsxs("select", { value: selectedProjectId, onChange: (e) => setSelectedProjectId(e.target.value), className: "w-full appearance-none bg-transparent border rounded-2xl py-4 pl-12 pr-10 text-xs font-bold uppercase tracking-widest outline-none focus:ring-1", style: { borderColor: `${theme["base-content"]}15`, color: theme["base-content"], "--tw-ring-color": theme.primary }, children: [_jsx("option", { value: "", children: "-- SELECT_PROJECT_IDENTITY --" }), projects?.map(p => (_jsx("option", { value: p.id, className: "bg-[#1a1a1a]", children: p.title }, p.id)))] }), _jsx(ChevronDown, { className: "absolute right-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none", size: 18 })] })] }), selectedProjectId ? (_jsxs("div", { className: "space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-[11px] font-black uppercase tracking-[0.3em]", children: "Manifest_Links" }), _jsxs("button", { onClick: addLinkRow, className: "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95", style: { backgroundColor: `${theme.primary}15`, color: theme.primary }, children: [_jsx(Plus, { size: 14 }), " Add_Entry"] })] }), _jsx("div", { className: "space-y-4", children: linksFetching ? (_jsx("div", { className: "py-20 flex justify-center", children: _jsx(Loader2, { className: "animate-spin opacity-20", size: 32 }) })) : localLinks.map((link, index) => (_jsxs("div", { className: "flex flex-col md:flex-row gap-4 p-5 rounded-3xl border transition-all", style: { backgroundColor: `${theme["base-content"]}02`, borderColor: `${theme["base-content"]}05` }, children: [_jsxs("div", { className: "flex-1 space-y-1", children: [_jsx("input", { value: link.label, onChange: (e) => updateLinkRow(index, 'label', e.target.value), placeholder: "Label (e.g. GitHub)", className: "w-full bg-transparent border-none p-0 text-[11px] font-bold uppercase outline-none", style: { color: theme["base-content"] } }), _jsx("div", { className: "h-[1px] w-full opacity-10", style: { backgroundColor: theme["base-content"] } }), _jsx("input", { value: link.url, onChange: (e) => updateLinkRow(index, 'url', e.target.value), placeholder: "URI Endpoint", className: "w-full bg-transparent border-none p-0 text-[10px] font-mono opacity-50 outline-none mt-2" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("select", { value: link.type, onChange: (e) => updateLinkRow(index, 'type', e.target.value), className: "bg-transparent border rounded-xl py-2 px-3 text-[9px] font-black uppercase outline-none", style: { borderColor: `${theme["base-content"]}10` }, children: [_jsx("option", { value: "live_demo", children: "Live" }), _jsx("option", { value: "github_fullstack", children: "Repo" }), _jsx("option", { value: "documentation", children: "Docs" })] }), _jsx("button", { onClick: () => removeLinkRow(index), className: "p-2 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all", children: _jsx(Trash2, { size: 16 }) })] })] }, index))) }), localLinks.length > 0 && (_jsxs("button", { onClick: handleSync, disabled: isSyncing, className: "w-full py-5 rounded-3xl text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]", style: { backgroundColor: theme.primary, color: theme["base-100"] }, children: [isSyncing ? _jsx(Loader2, { className: "animate-spin", size: 18 }) : _jsx(Zap, { size: 18 }), "Execute_Link_Sync"] }))] })) : (_jsxs("div", { className: "py-32 text-center rounded-[3rem] border-2 border-dashed opacity-20", style: { borderColor: `${theme["base-content"]}10` }, children: [_jsx(LinkIcon, { size: 48, className: "mx-auto mb-4" }), _jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.5em]", children: "Select_Deployment_To_Begin" })] }))] }) }));
};
export default StandaloneLinkManager;
