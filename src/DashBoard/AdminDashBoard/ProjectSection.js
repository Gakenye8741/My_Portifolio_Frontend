import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useGetProjectsQuery } from "../../Features/Apis/Projects.Api";
import { useGetMediaAssetsQuery } from "../../Features/Apis/Media.Api";
import { useGetSectionsByProjectQuery, useCreateSectionMutation, useDeleteSectionMutation, useReorderSectionsMutation } from "../../Features/Apis/ProjectSection.Api";
import { useTheme } from '../../ThemeContext';
import { Plus, Trash2, Layout, ChevronUp, ChevronDown, Type, Loader2, History, Wand2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
const ProjectSectionManager = () => {
    const { theme } = useTheme();
    // --- STATE ---
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [newSection, setNewSection] = useState({
        sectionTitle: "",
        explanation: "",
        mediaId: ""
    });
    // --- API HOOKS ---
    const { data: projects } = useGetProjectsQuery();
    const { data: mediaAssets } = useGetMediaAssetsQuery();
    const { data: sections, isLoading: isFetching } = useGetSectionsByProjectQuery(selectedProjectId, { skip: !selectedProjectId });
    const [createSection, { isLoading: isCreating }] = useCreateSectionMutation();
    const [deleteSection] = useDeleteSectionMutation();
    const [reorderSections] = useReorderSectionsMutation();
    // --- HANDLERS ---
    const handleAddSection = async () => {
        if (!newSection.sectionTitle || !newSection.explanation)
            return toast.error("Missing content fields");
        try {
            await createSection({
                projectId: selectedProjectId,
                ...newSection,
                order: (sections?.length || 0) + 1
            }).unwrap();
            setNewSection({ sectionTitle: "", explanation: "", mediaId: "" });
            setShowAddForm(false);
            toast.success("SECTION_ADDED_TO_STORY");
        }
        catch (err) {
            toast.error("DEPLOYMENT_FAILED");
        }
    };
    const handleMove = async (index, direction) => {
        if (!sections)
            return;
        const newSections = [...sections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= sections.length)
            return;
        // Swap logic for local reorder mapping
        const reorderPayload = [
            { id: sections[index].id, order: sections[targetIndex].order },
            { id: sections[targetIndex].id, order: sections[index].order }
        ];
        try {
            await reorderSections(reorderPayload).unwrap();
            toast.success("SEQUENCE_UPDATED");
        }
        catch (err) {
            toast.error("REORDER_FAILED");
        }
    };
    return (_jsx("div", { className: "min-h-screen p-4 lg:p-8", style: { backgroundColor: theme["base-100"], color: theme["base-content"] }, children: _jsxs("div", { className: "max-w-5xl mx-auto", children: [_jsxs("header", { className: "mb-12 border-b pb-8", style: { borderColor: `${theme.primary}15` }, children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx("div", { className: "h-2 w-2 rounded-full", style: { backgroundColor: theme.primary } }), _jsx("span", { className: "text-[10px] font-black uppercase tracking-[0.5em] opacity-50", children: "Narrative_Architect" })] }), _jsxs("h1", { className: "text-5xl font-black italic uppercase tracking-tighter", children: ["Story", _jsx("span", { className: "font-light not-italic", style: { color: theme.primary }, children: "Designer" })] })] }), _jsxs("section", { className: "mb-12", children: [_jsx("label", { className: "text-[9px] font-black uppercase tracking-widest opacity-30 mb-4 block", children: "Select_Deployment_Target" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("select", { value: selectedProjectId, onChange: (e) => setSelectedProjectId(e.target.value), className: "w-full bg-transparent border-2 rounded-3xl py-5 px-8 text-xs font-bold uppercase tracking-widest outline-none transition-all focus:border-opacity-100", style: { borderColor: `${theme["base-content"]}10`, color: theme["base-content"] }, children: [_jsx("option", { value: "", className: "bg-black text-white", children: "-- IDENTIFY_PROJECT --" }), projects?.map(p => _jsx("option", { value: p.id, className: "bg-black text-white", children: p.title }, p.id))] }), selectedProjectId && (_jsxs("button", { onClick: () => setShowAddForm(!showAddForm), className: "rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-95", style: { backgroundColor: showAddForm ? 'transparent' : theme.primary, border: `2px solid ${theme.primary}`, color: showAddForm ? theme.primary : theme["base-100"] }, children: [showAddForm ? _jsx(Layout, { size: 18 }) : _jsx(Plus, { size: 18 }), showAddForm ? 'View_Narrative' : 'Add_New_Fragment'] }))] })] }), showAddForm && (_jsx("div", { className: "mb-12 p-10 rounded-[3rem] border-2 animate-in zoom-in-95 duration-300", style: { borderColor: `${theme.primary}20`, backgroundColor: `${theme.primary}05` }, children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-10", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-[9px] font-black uppercase opacity-40 ml-1", children: "Section_Title" }), _jsxs("div", { className: "relative", children: [_jsx(Type, { className: "absolute left-4 top-1/2 -translate-y-1/2 opacity-20", size: 16 }), _jsx("input", { placeholder: "e.g. THE_PROBLEM", value: newSection.sectionTitle, onChange: (e) => setNewSection({ ...newSection, sectionTitle: e.target.value }), className: "w-full bg-transparent border-b-2 py-4 pl-12 pr-4 text-xs font-bold uppercase outline-none", style: { borderColor: `${theme["base-content"]}15` } })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-[9px] font-black uppercase opacity-40 ml-1", children: "Narrative_Explanation" }), _jsx("textarea", { rows: 4, placeholder: "Describe the fragment context...", value: newSection.explanation, onChange: (e) => setNewSection({ ...newSection, explanation: e.target.value }), className: "w-full bg-transparent border-2 rounded-3xl p-6 text-xs leading-relaxed outline-none", style: { borderColor: `${theme["base-content"]}15` } })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsx("label", { className: "text-[9px] font-black uppercase opacity-40 ml-1 block", children: "Visual_Asset_Link" }), _jsx("div", { className: "grid grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-2 no-scrollbar", children: mediaAssets?.map(asset => (_jsx("div", { onClick: () => setNewSection({ ...newSection, mediaId: asset.id }), className: `aspect-square rounded-2xl cursor-pointer overflow-hidden border-2 transition-all ${newSection.mediaId === asset.id ? 'scale-90 border-primary' : 'opacity-20 grayscale border-transparent hover:opacity-100 hover:grayscale-0'}`, style: { borderColor: newSection.mediaId === asset.id ? theme.primary : 'transparent' }, children: _jsx("img", { src: asset.fileUrl, className: "w-full h-full object-cover" }) }, asset.id))) }), _jsxs("button", { onClick: handleAddSection, disabled: isCreating, className: "w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.5em] shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95", style: { backgroundColor: theme.primary, color: theme["base-100"] }, children: [isCreating ? _jsx(Loader2, { className: "animate-spin", size: 18 }) : _jsx(Wand2, { size: 18 }), "Append_To_Story"] })] })] }) })), _jsxs("div", { className: "space-y-6", children: [isFetching ? (_jsx("div", { className: "py-20 flex justify-center", children: _jsx(Loader2, { className: "animate-spin opacity-20", size: 40 }) })) : sections?.map((section, index) => (_jsxs("div", { className: "group flex gap-6 p-8 rounded-[2.5rem] border transition-all hover:translate-x-2", style: { backgroundColor: `${theme["base-content"]}03`, borderColor: `${theme["base-content"]}08` }, children: [_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("button", { onClick: () => handleMove(index, 'up'), className: "p-2 rounded-lg opacity-20 hover:opacity-100 hover:bg-white/5", children: _jsx(ChevronUp, { size: 16 }) }), _jsx("div", { className: "h-8 w-px mx-auto opacity-10", style: { backgroundColor: theme["base-content"] } }), _jsx("span", { className: "text-[10px] font-black text-center opacity-20", children: section.order }), _jsx("div", { className: "h-8 w-px mx-auto opacity-10", style: { backgroundColor: theme["base-content"] } }), _jsx("button", { onClick: () => handleMove(index, 'down'), className: "p-2 rounded-lg opacity-20 hover:opacity-100 hover:bg-white/5", children: _jsx(ChevronDown, { size: 16 }) })] }), _jsxs("div", { className: "flex-1 flex flex-col md:flex-row gap-8", children: [section.media?.fileUrl && (_jsx("div", { className: "w-full md:w-48 h-32 rounded-3xl overflow-hidden shadow-xl shrink-0", children: _jsx("img", { src: section.media.fileUrl, className: "w-full h-full object-cover" }) })), _jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "text-xl font-black italic uppercase tracking-tighter", style: { color: theme.primary }, children: section.sectionTitle }), _jsx("p", { className: "text-xs leading-relaxed opacity-50 max-w-2xl", children: section.explanation })] })] }), _jsx("div", { className: "flex items-start", children: _jsx("button", { onClick: () => deleteSection(section.id), className: "p-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-all bg-rose-500 bg-opacity-10 text-rose-500 hover:bg-rose-500 hover:text-white", children: _jsx(Trash2, { size: 18 }) }) })] }, section.id))), !selectedProjectId && (_jsxs("div", { className: "py-40 text-center rounded-[3rem] border-2 border-dashed opacity-10", style: { borderColor: theme["base-content"] }, children: [_jsx(History, { size: 60, className: "mx-auto mb-6" }), _jsx("p", { className: "text-xs font-black uppercase tracking-[0.8em]", children: "Awaiting_Selection" })] }))] })] }) }));
};
export default ProjectSectionManager;
