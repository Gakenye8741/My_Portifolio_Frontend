import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useGetProjectsQuery } from "../../Features/Apis/Projects.Api";
import { useGetTechSkillsQuery } from "../../Features/Apis/Skills.Api";
import { useGetProjectTechStackQuery, useSyncProjectTechMutation } from "../../Features/Apis/ProjectTech.Api";
import { useTheme } from '../../ThemeContext';
import { Cpu, Check, Search, Save, Loader2, Database, Terminal, Boxes } from 'lucide-react';
import { toast } from 'react-hot-toast';
const ProjectTechManager = () => {
    const { theme } = useTheme();
    // --- UI STATE ---
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTechIds, setSelectedTechIds] = useState([]);
    // --- API HOOKS ---
    const { data: projects } = useGetProjectsQuery();
    const { data: allTechs, isLoading: techsLoading } = useGetTechSkillsQuery();
    const { data: currentStack, isFetching: stackFetching } = useGetProjectTechStackQuery(selectedProjectId, {
        skip: !selectedProjectId
    });
    const [syncTech, { isLoading: isSyncing }] = useSyncProjectTechMutation();
    // Sync local selection when a project is selected
    useEffect(() => {
        // Added safety check for technologies property
        if (currentStack?.technologies) {
            setSelectedTechIds(currentStack.technologies.map((t) => t.id));
        }
        else {
            setSelectedTechIds([]);
        }
    }, [currentStack]);
    // --- HANDLERS ---
    const toggleTech = (techId) => {
        setSelectedTechIds(prev => prev.includes(techId)
            ? prev.filter(id => id !== techId)
            : [...prev, techId]);
    };
    const handleSync = async () => {
        if (!selectedProjectId)
            return;
        try {
            await syncTech({
                projectId: selectedProjectId,
                body: { technologyIds: selectedTechIds }
            }).unwrap();
            toast.success("TECH_STACK_SYNCHRONIZED");
        }
        catch (err) {
            toast.error("TRANSACTION_FAILURE");
        }
    };
    // Added safety fallback to empty array
    const filteredTechs = (allTechs || [])?.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase()));
    return (_jsx("div", { className: "min-h-screen p-4 lg:p-8 transition-all duration-500", style: { backgroundColor: theme["base-100"], color: theme["base-content"] }, children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs("header", { className: "mb-10 border-b pb-8", style: { borderColor: `${theme.primary}15` }, children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx("div", { className: "h-2 w-2 rounded-full animate-ping", style: { backgroundColor: theme.primary } }), _jsx("span", { className: "text-[10px] font-black uppercase tracking-[0.4em] opacity-40", children: "System_Integrator / Tech_Stack" })] }), _jsxs("h1", { className: "text-5xl font-black italic uppercase tracking-tighter", children: ["Stack", _jsx("span", { className: "font-light not-italic", style: { color: theme.primary }, children: "Matrix" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10", children: [_jsxs("div", { className: "lg:col-span-2 space-y-2", children: [_jsx("label", { className: "text-[9px] font-black uppercase opacity-30 ml-2", children: "Select_Project_Node" }), _jsxs("div", { className: "relative", children: [_jsx(Boxes, { className: "absolute left-5 top-1/2 -translate-y-1/2 opacity-20", size: 18 }), _jsxs("select", { value: selectedProjectId, onChange: (e) => setSelectedProjectId(e.target.value), className: "w-full bg-transparent border-2 rounded-2xl py-5 pl-14 pr-8 text-xs font-bold uppercase outline-none transition-all", style: { backgroundColor: `${theme["base-content"]}03`, borderColor: `${theme["base-content"]}10` }, children: [_jsx("option", { value: "", className: "bg-black text-white", children: "-- MOUNT_PROJECT_IDENTITY --" }), projects?.map(p => _jsx("option", { value: p.id, className: "bg-black text-white", children: p.title }, p.id))] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-[9px] font-black uppercase opacity-30 ml-2", children: "Search_Library" }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-5 top-1/2 -translate-y-1/2 opacity-20", size: 18 }), _jsx("input", { type: "text", placeholder: "Filter by Name/Category...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full bg-transparent border-2 rounded-2xl py-5 pl-14 pr-8 text-xs font-bold outline-none", style: { backgroundColor: `${theme["base-content"]}03`, borderColor: `${theme["base-content"]}10` } })] })] })] }), selectedProjectId ? (_jsxs("div", { className: "space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700", children: [_jsxs("div", { className: "flex items-center gap-6 p-4 rounded-2xl border-2 border-dashed", style: { borderColor: `${theme.primary}20` }, children: [_jsxs("div", { className: "flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-xl", children: [_jsx(Terminal, { size: 14, style: { color: theme.primary } }), _jsxs("span", { className: "text-[10px] font-black text-white uppercase", children: [selectedTechIds.length, " Nodes_Selected"] })] }), _jsx("div", { className: "h-4 w-[1px] bg-white/10" }), _jsx("p", { className: "text-[9px] font-mono opacity-30 uppercase", children: "Status: Registry_Awaiting_Sync" })] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4", children: techsLoading || stackFetching ? (_jsx("div", { className: "col-span-full py-20 flex justify-center", children: _jsx(Loader2, { className: "animate-spin opacity-20", size: 40 }) })) : filteredTechs?.map(tech => {
                                const isActive = selectedTechIds.includes(tech.id);
                                return (_jsxs("div", { onClick: () => toggleTech(tech.id), className: "group relative cursor-pointer rounded-3xl p-6 border-2 transition-all duration-300 hover:scale-[1.03] active:scale-95", style: {
                                        backgroundColor: isActive ? `${theme.primary}10` : `${theme["base-content"]}02`,
                                        borderColor: isActive ? theme.primary : `${theme["base-content"]}08`
                                    }, children: [_jsxs("div", { className: "flex flex-col items-center gap-4 text-center", children: [tech.iconUrl ? (_jsx("img", { src: tech.iconUrl, className: `w-10 h-10 object-contain transition-all ${isActive ? 'grayscale-0' : 'grayscale opacity-30'}`, alt: tech.name })) : (_jsx(Cpu, { size: 32, className: `transition-all ${isActive ? 'opacity-100' : 'opacity-10'}`, style: { color: isActive ? theme.primary : 'inherit' } })), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-black uppercase tracking-tight", children: tech.name }), _jsx("p", { className: "text-[7px] font-bold opacity-30 uppercase mt-1 tracking-widest", children: tech.category })] })] }), isActive && (_jsx("div", { className: "absolute top-3 right-3 p-1 rounded-full bg-primary shadow-lg", style: { backgroundColor: theme.primary }, children: _jsx(Check, { size: 10, color: "white", strokeWidth: 4 }) }))] }, tech.id));
                            }) }), _jsx("div", { className: "sticky bottom-10 flex justify-center", children: _jsxs("button", { onClick: handleSync, disabled: isSyncing, className: "group px-12 py-6 rounded-full font-black text-[11px] uppercase tracking-[0.5em] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 transition-all hover:scale-105 active:scale-95", style: { backgroundColor: theme.primary, color: theme["base-100"] }, children: [isSyncing ? _jsx(Loader2, { className: "animate-spin" }) : _jsx(Save, { size: 18, className: "group-hover:rotate-12 transition-transform" }), "Synchronize_Stack_Registry"] }) })] })) : (_jsxs("div", { className: "py-48 text-center rounded-[4rem] border-2 border-dashed opacity-10", style: { borderColor: theme["base-content"] }, children: [_jsx(Database, { size: 64, className: "mx-auto mb-6" }), _jsx("p", { className: "text-xs font-black uppercase tracking-[0.8em]", children: "Awaiting_Identity_Mount" })] }))] }) }));
};
export default ProjectTechManager;
