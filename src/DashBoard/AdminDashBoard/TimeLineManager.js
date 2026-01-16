import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useGetProjectTimelineQuery, useCreateTimelineEventMutation, useDeleteTimelineEventMutation, useUpdateTimelineEventMutation } from '../../Features/Apis/ProjectTimeline.Api';
import { useGetProjectsQuery } from '../../Features/Apis/Projects.Api';
import { useTheme } from '../../ThemeContext';
import { Plus, Trash2, Calendar, GitCommit, Terminal, Edit3, X, Loader2, CheckCircle2, History as HistoryIcon, ChevronDown, Layout, Zap, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
const TimelineManager = () => {
    const { theme } = useTheme();
    // --- SELECTION & DROPDOWN STATE ---
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    // --- UI STATE ---
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    // --- FORM STATE ---
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });
    // --- API HOOKS ---
    const { data: projects } = useGetProjectsQuery();
    const { data: events, isLoading: isFetching } = useGetProjectTimelineQuery(selectedProjectId, {
        skip: !selectedProjectId,
    });
    const [createEvent, { isLoading: isCreating }] = useCreateTimelineEventMutation();
    const [updateEvent, { isLoading: isUpdating }] = useUpdateTimelineEventMutation();
    const [deleteEvent] = useDeleteTimelineEventMutation();
    // Close dropdown logic
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const selectedProject = projects?.find(p => p.id === selectedProjectId);
    const handleOpenPanel = (event) => {
        if (event) {
            setEditingId(event.id);
            setFormData({
                title: event.title,
                description: event.description,
                date: new Date(event.date).toISOString().split('T')[0]
            });
        }
        else {
            setEditingId(null);
            setFormData({
                title: '',
                description: '',
                date: new Date().toISOString().split('T')[0]
            });
        }
        setIsPanelOpen(true);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProjectId)
            return toast.error("SELECT_PROJECT_FIRST");
        const promise = editingId
            ? updateEvent({ id: editingId, ...formData }).unwrap()
            : createEvent({ projectId: selectedProjectId, ...formData }).unwrap();
        toast.promise(promise, {
            loading: 'Syncing Chrono-Node...',
            success: editingId ? 'Sequence Updated' : 'Node Initialized',
            error: 'Transaction Failed',
        });
        try {
            await promise;
            setIsPanelOpen(false);
        }
        catch (err) { }
    };
    const handleDelete = async (id) => {
        if (window.confirm("Purge this timeline node from the registry?")) {
            try {
                await deleteEvent(id).unwrap();
                toast.success("Node Purged");
            }
            catch (err) {
                toast.error("Purge Failed");
            }
        }
    };
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "p-8 rounded-[2.5rem] border-2 flex flex-col md:flex-row items-center justify-between gap-6", style: { backgroundColor: `${theme["base-content"]}03`, borderColor: `${theme["base-content"]}08` }, children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "p-3 rounded-2xl bg-primary/10", style: { color: theme.primary }, children: _jsx(Layout, { size: 24 }) }), _jsxs("div", { children: [_jsxs("h3", { className: "text-xl font-black italic uppercase tracking-tighter", children: ["Target_", _jsx("span", { style: { color: theme.primary }, children: "Project" })] }), _jsx("p", { className: "text-[9px] font-bold opacity-30 uppercase tracking-[0.3em]", children: "Select_Node_To_Manage" })] })] }), _jsxs("div", { className: "relative w-full md:w-80", ref: dropdownRef, children: [_jsxs("div", { onClick: () => setIsDropdownOpen(!isDropdownOpen), className: "w-full border-2 rounded-2xl py-4 px-6 flex justify-between items-center cursor-pointer transition-all", style: {
                                    borderColor: isDropdownOpen ? theme.primary : `${theme["base-content"]}15`,
                                    backgroundColor: theme["base-100"]
                                }, children: [_jsx("span", { className: "text-[10px] font-black uppercase tracking-widest opacity-80", children: selectedProject ? selectedProject.title : "Choose_Project_ID..." }), _jsx(ChevronDown, { size: 16, className: `transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`, style: { color: theme.primary } })] }), isDropdownOpen && (_jsx("div", { className: "absolute top-[calc(100%+10px)] left-0 w-full z-50 rounded-2xl border-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200", style: { backgroundColor: theme["base-100"], borderColor: `${theme["base-content"]}10`, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }, children: _jsx("div", { className: "max-h-60 overflow-y-auto no-scrollbar", children: projects?.map((project) => (_jsxs("div", { onClick: () => { setSelectedProjectId(project.id); setIsDropdownOpen(false); }, className: "px-6 py-4 flex items-center justify-between hover:bg-primary/10 cursor-pointer transition-colors group", children: [_jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider group-hover:text-primary", children: project.title }), selectedProjectId === project.id && _jsx(CheckCircle2, { size: 14, style: { color: theme.primary } })] }, project.id))) }) }))] })] }), !selectedProjectId ? (_jsxs("div", { className: "py-32 flex flex-col items-center opacity-20 border-2 border-dashed rounded-[3rem]", style: { borderColor: `${theme["base-content"]}10` }, children: [_jsx(Terminal, { size: 48, className: "mb-4" }), _jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.5em]", children: "Awaiting_Selection_Input..." })] })) : (_jsxs("div", { className: "p-6 rounded-[2.5rem] border-2 animate-in fade-in slide-in-from-bottom-4", style: { backgroundColor: `${theme["base-content"]}03`, borderColor: `${theme["base-content"]}08` }, children: [_jsxs("div", { className: "flex justify-between items-center mb-10 p-4", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3", children: [_jsx(HistoryIcon, { size: 24, style: { color: theme.primary } }), "Project_", _jsx("span", { style: { color: theme.primary }, children: "History" })] }), _jsx("p", { className: "text-[9px] font-bold opacity-30 uppercase tracking-[0.3em]", children: "Sequential_Node_Logging" })] }), _jsxs("button", { onClick: () => handleOpenPanel(), className: "px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-2xl active:scale-95 group", style: { backgroundColor: theme.primary, color: theme["base-100"] }, children: [_jsx(Plus, { size: 18, className: "group-hover:rotate-90 transition-transform duration-300" }), " Initialize Node"] })] }), isFetching ? (_jsxs("div", { className: "py-20 flex flex-col items-center opacity-20", children: [_jsx(Loader2, { className: "animate-spin mb-4" }), _jsx("p", { className: "text-[8px] font-black uppercase tracking-widest", children: "Reading_Time_Shards..." })] })) : (_jsxs("div", { className: "overflow-x-auto", children: [_jsxs("table", { className: "w-full text-left border-separate border-spacing-y-3", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "px-8 py-2 text-[9px] font-black uppercase tracking-[0.3em] opacity-30", children: "Chrono Node" }), _jsx("th", { className: "px-8 py-2 text-[9px] font-black uppercase tracking-[0.3em] opacity-30", children: "Timestamp" }), _jsx("th", { className: "px-8 py-2 text-[9px] font-black uppercase tracking-[0.3em] opacity-30 text-right", children: "System Actions" })] }) }), _jsx("tbody", { children: (events || []).map((event) => (_jsxs("tr", { className: "group transition-all duration-300", children: [_jsx("td", { className: "px-8 py-6 rounded-l-3xl border-y border-l", style: { backgroundColor: `${theme["base-content"]}03`, borderColor: `${theme["base-content"]}05` }, children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110", style: { backgroundColor: `${theme.primary}10` }, children: _jsx(GitCommit, { size: 18, style: { color: theme.primary } }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-black italic uppercase tracking-tight", children: event.title }), _jsx("p", { className: "text-[10px] opacity-40 line-clamp-1 max-w-xs", children: event.description })] })] }) }), _jsx("td", { className: "px-8 py-6 border-y", style: { backgroundColor: `${theme["base-content"]}03`, borderColor: `${theme["base-content"]}05` }, children: _jsxs("div", { className: "flex items-center gap-2 text-[10px] font-mono opacity-50", children: [_jsx(Calendar, { size: 12, style: { color: theme.primary } }), new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()] }) }), _jsx("td", { className: "px-8 py-6 rounded-r-3xl border-y border-r text-right", style: { backgroundColor: `${theme["base-content"]}03`, borderColor: `${theme["base-content"]}05` }, children: _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx("button", { onClick: () => handleOpenPanel(event), className: "p-3 rounded-2xl transition-all hover:scale-110 active:scale-95", style: { backgroundColor: `${theme["base-content"]}05`, color: theme["base-content"] }, children: _jsx(Edit3, { size: 16 }) }), _jsx("button", { onClick: () => handleDelete(event.id), className: "p-3 rounded-2xl transition-all hover:scale-110 active:scale-95 bg-rose-500 bg-opacity-10 text-rose-500 hover:bg-rose-500 hover:text-white", children: _jsx(Trash2, { size: 16 }) })] }) })] }, event.id))) })] }), (!events || events.length === 0) && (_jsxs("div", { className: "text-center py-20 opacity-20", children: [_jsx(Activity, { size: 32, className: "mx-auto mb-4" }), _jsx("p", { className: "text-[10px] font-black uppercase tracking-widest", children: "No_Chrono_Nodes_Found" })] }))] }))] })), isPanelOpen && (_jsxs("div", { className: "fixed inset-0 z-[1000] flex justify-end", children: [_jsx("div", { className: "absolute inset-0 bg-black/80 backdrop-blur-md", onClick: () => setIsPanelOpen(false) }), _jsxs("div", { className: "relative w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l", style: { backgroundColor: theme["base-100"], borderColor: `${theme.primary}10` }, children: [_jsxs("div", { className: "p-10 border-b relative overflow-hidden", style: { borderColor: `${theme["base-content"]}05` }, children: [_jsx(HistoryIcon, { size: 150, className: "absolute -right-10 -bottom-10 opacity-[0.03] -rotate-12 pointer-events-none", style: { color: theme.primary } }), _jsxs("div", { className: "flex items-center justify-between relative z-10", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("span", { className: "p-1 rounded-md", style: { color: theme.primary, backgroundColor: `${theme.primary}15` }, children: _jsx(Zap, { size: 14 }) }), _jsx("span", { className: "text-[9px] font-black uppercase tracking-[0.4em]", style: { color: theme.primary }, children: "Sequence_Log_Sync" })] }), _jsx("h2", { className: "text-4xl font-black italic uppercase tracking-tighter leading-none", children: editingId ? 'Edit_Node' : 'New_Node' })] }), _jsx("button", { onClick: () => setIsPanelOpen(false), className: "p-4 rounded-3xl transition-all hover:bg-rose-500/20 hover:text-rose-500", style: { backgroundColor: `${theme["base-content"]}05`, color: theme["base-content"] }, children: _jsx(X, { size: 24 }) })] })] }), _jsxs("form", { id: "timeline-form", onSubmit: handleSubmit, className: "p-10 flex-1 overflow-y-auto space-y-10 no-scrollbar", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "h-[2px] w-8", style: { backgroundColor: theme.primary } }), _jsx("h3", { className: "text-[10px] font-black uppercase tracking-[0.3em]", children: "Node Metadata" })] }), _jsxs("div", { className: "grid grid-cols-1 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-[9px] font-black uppercase opacity-30 tracking-widest ml-1", children: "Title" }), _jsx("input", { required: true, value: formData.title, onChange: (e) => setFormData({ ...formData, title: e.target.value }), className: "w-full border-none rounded-2xl py-4 px-6 text-xs outline-none focus:ring-1", style: { backgroundColor: `${theme["base-content"]}05`, color: theme["base-content"], boxShadow: `inset 0 0 0 1px ${theme.primary}20` } })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-[9px] font-black uppercase opacity-30 tracking-widest ml-1", children: "Timestamp" }), _jsx("input", { type: "date", required: true, value: formData.date, onChange: (e) => setFormData({ ...formData, date: e.target.value }), className: "w-full border-none rounded-2xl py-4 px-6 text-xs font-mono outline-none", style: { backgroundColor: `${theme["base-content"]}05`, color: theme["base-content"] } })] })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "h-[2px] w-8", style: { backgroundColor: theme.primary } }), _jsx("h3", { className: "text-[10px] font-black uppercase tracking-[0.3em]", children: "Event manifest" })] }), _jsx("textarea", { rows: 6, placeholder: "Detail the technical milestones or project updates...", value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), className: "w-full border-none rounded-3xl py-5 px-6 text-xs outline-none resize-none", style: { backgroundColor: `${theme["base-content"]}05`, color: theme["base-content"] } })] })] }), _jsx("div", { className: "p-10 border-t", style: { backgroundColor: `${theme["base-content"]}02`, borderColor: `${theme["base-content"]}05` }, children: _jsxs("button", { form: "timeline-form", type: "submit", disabled: isCreating || isUpdating, className: "w-full py-5 rounded-3xl text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] group", style: { backgroundColor: theme.primary, color: theme["base-100"] }, children: [isCreating || isUpdating ? _jsx(Loader2, { className: "animate-spin", size: 18 }) : _jsx(CheckCircle2, { size: 18, className: "group-hover:scale-110 transition-transform" }), editingId ? 'Execute_Update' : 'Commit_Sequence'] }) })] })] }))] }));
};
export default TimelineManager;
