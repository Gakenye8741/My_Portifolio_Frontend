import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useGetTechSkillsQuery, useCreateTechSkillMutation, useDeleteTechSkillMutation, useCreateMediaMutation, useUpdateTechSkillMutation } from '../../Features/Apis/Skills.Api';
import { useTheme } from '../../ThemeContext';
import { Plus, Trash2, Search, Zap, X, Image as ImageIcon, Loader2, Cpu, Wand2, Edit3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
const SkillsManager = () => {
    const { theme } = useTheme();
    // --- UI STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [editingId, setEditingId] = useState(null);
    // --- FORM STATE ---
    const [formData, setFormData] = useState({
        name: '',
        category: 'frontend',
        proficiency: 80,
        yearsExperience: 1,
        iconUrl: ''
    });
    // --- API HOOKS ---
    const { data: skills, isLoading: isFetching } = useGetTechSkillsQuery();
    const [createMedia, { isLoading: isUploading }] = useCreateMediaMutation();
    const [createTechSkill, { isLoading: isCreating }] = useCreateTechSkillMutation();
    const [updateTechSkill, { isLoading: isUpdating }] = useUpdateTechSkillMutation();
    const [deleteSkill] = useDeleteTechSkillMutation();
    // --- AUTO ICON LOGIC ---
    const handleNameChange = (name) => {
        const cleanName = name.toLowerCase().replace(/\s+/g, '').replace(/\./g, 'dot');
        const autoIconUrl = `https://cdn.simpleicons.org/${cleanName}`;
        setFormData({
            ...formData,
            name: name,
            iconUrl: autoIconUrl
        });
    };
    // --- HANDLERS ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // STEP 5: Transactional Update
                await updateTechSkill({
                    id: editingId,
                    techUpdates: { name: formData.name, category: formData.category },
                    skillUpdates: { proficiency: formData.proficiency, yearsExperience: formData.yearsExperience }
                }).unwrap();
                toast.success("NODE_RECONFIGURED");
            }
            else {
                // STEP 1 & 2: Create Media then Transactional Skill Create
                const media = await createMedia({
                    fileName: `${formData.name}_icon`.toLowerCase(),
                    fileUrl: formData.iconUrl,
                    fileType: 'image/png',
                    fileSize: 0
                }).unwrap();
                await createTechSkill({
                    techData: { name: formData.name, category: formData.category, iconId: media.id },
                    skillData: { proficiency: formData.proficiency, yearsExperience: formData.yearsExperience }
                }).unwrap();
                toast.success("CORE_SKILL_SYNCHRONIZED");
            }
            closeModal();
        }
        catch (err) {
            toast.error("TRANSACTION_FAILURE");
        }
    };
    const handleEdit = (skill) => {
        setEditingId(skill.id);
        setFormData({
            name: skill.name,
            category: skill.category,
            proficiency: skill.skill?.proficiency || 0,
            yearsExperience: skill.skill?.yearsExperience || 0,
            iconUrl: skill.icon?.fileUrl || ''
        });
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ name: '', category: 'frontend', proficiency: 80, yearsExperience: 1, iconUrl: '' });
    };
    const categories = ["all", "frontend", "backend", "language", "database", "tools"];
    const filteredSkills = (skills || []).filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === "all" || s.category === activeTab;
        return matchesSearch && matchesTab;
    });
    return (_jsx("div", { className: "min-h-screen p-4 lg:p-8 transition-all duration-500", style: { backgroundColor: theme["base-100"], color: theme["base-content"] }, children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("header", { className: "mb-10 border-b pb-8", style: { borderColor: `${theme.primary}15` }, children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx("div", { className: "h-2 w-2 rounded-full animate-ping", style: { backgroundColor: theme.primary } }), _jsx("span", { className: "text-[10px] font-black uppercase tracking-[0.4em] opacity-40", children: "System_Architect / Arsenal_Registry" })] }), _jsxs("h1", { className: "text-5xl font-black italic uppercase tracking-tighter", children: ["Skill", _jsx("span", { className: "font-light not-italic", style: { color: theme.primary }, children: "Matrix" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10", children: [_jsx("div", { className: "lg:col-span-2 flex gap-2 overflow-x-auto pb-2 no-scrollbar", children: categories.map(cat => (_jsx("button", { onClick: () => setActiveTab(cat), className: `px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${activeTab === cat ? 'bg-primary text-white border-primary' : 'border-transparent opacity-40 hover:opacity-100'}`, style: {
                                    backgroundColor: activeTab === cat ? theme.primary : 'transparent',
                                    borderColor: activeTab === cat ? theme.primary : `${theme["base-content"]}10`
                                }, children: cat }, cat))) }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-5 top-1/2 -translate-y-1/2 opacity-20", size: 18 }), _jsx("input", { type: "text", placeholder: "FILTER_REGISTRY...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full bg-transparent border-2 rounded-2xl py-4 pl-14 pr-8 text-xs font-bold outline-none transition-all focus:border-primary/50", style: { backgroundColor: `${theme["base-content"]}03`, borderColor: `${theme["base-content"]}10` } })] })] }), isFetching ? (_jsxs("div", { className: "py-48 flex flex-col items-center justify-center opacity-20", children: [_jsx(Loader2, { className: "animate-spin mb-4", size: 40 }), _jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.5em]", children: "Syncing_Database_Nodes..." })] })) : (_jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-32", children: filteredSkills.map((skill) => (_jsxs("div", { className: "group relative rounded-3xl p-6 border-2 transition-all duration-300 hover:scale-[1.03]", style: {
                            backgroundColor: `${theme["base-content"]}03`,
                            borderColor: `${theme["base-content"]}08`
                        }, children: [_jsxs("div", { className: "flex justify-between items-start mb-6", children: [_jsx("div", { className: "w-12 h-12 rounded-2xl bg-black/20 flex items-center justify-center border border-white/5 overflow-hidden", children: skill.icon?.fileUrl ? (_jsx("img", { src: skill.icon.fileUrl, className: "w-8 h-8 object-contain", alt: skill.name })) : _jsx(Cpu, { size: 20, className: "opacity-20" }) }), _jsxs("div", { className: "flex gap-2 opacity-0 group-hover:opacity-100 transition-all", children: [_jsx("button", { onClick: () => handleEdit(skill), className: "p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white", children: _jsx(Edit3, { size: 14 }) }), _jsx("button", { onClick: () => deleteSkill(skill.id), className: "p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white", children: _jsx(Trash2, { size: 14 }) })] })] }), _jsx("h3", { className: "text-lg font-black italic uppercase tracking-tighter mb-1", children: skill.name }), _jsx("p", { className: "text-[8px] font-bold opacity-30 uppercase tracking-[0.2em] mb-4", children: skill.category }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-end", children: [_jsx("span", { className: "text-[8px] font-black opacity-20 uppercase tracking-widest", children: "Mastery" }), _jsxs("span", { className: "text-sm font-black italic", style: { color: theme.primary }, children: [skill.skill?.proficiency, "%"] })] }), _jsx("div", { className: "h-1 w-full bg-white/5 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full transition-all duration-1000", style: { backgroundColor: theme.primary, width: `${skill.skill?.proficiency}%` } }) }), _jsxs("div", { className: "flex items-center gap-2 pt-2", children: [_jsx(Zap, { size: 10, style: { color: theme.primary } }), _jsxs("span", { className: "text-[8px] font-mono opacity-40 uppercase", children: [skill.skill?.yearsExperience, "Y_EXP"] })] })] })] }, skill.id))) })), _jsx("div", { className: "fixed bottom-10 left-1/2 -translate-x-1/2 z-40", children: _jsxs("button", { onClick: () => setIsModalOpen(true), className: "group px-12 py-6 rounded-full font-black text-[11px] uppercase tracking-[0.5em] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 transition-all hover:scale-105 active:scale-95", style: { backgroundColor: theme.primary, color: theme["base-100"] }, children: [_jsx(Plus, { size: 18, className: "group-hover:rotate-90 transition-transform" }), "Initialize_New_Node"] }) }), isModalOpen && (_jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300", children: _jsxs("div", { className: "w-full max-w-2xl rounded-[3.5rem] border-2 p-12 shadow-2xl", style: { backgroundColor: theme["base-100"], borderColor: `${theme.primary}20` }, children: [_jsxs("div", { className: "flex justify-between items-center mb-10", children: [_jsxs("h2", { className: "text-4xl font-black tracking-tighter italic uppercase", children: [editingId ? 'Update_' : 'Mount_', _jsx("span", { style: { color: theme.primary }, children: "Resource" })] }), _jsx("button", { onClick: closeModal, className: "p-2 opacity-30 hover:opacity-100", children: _jsx(X, {}) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-8", children: [_jsxs("div", { className: "grid grid-cols-2 gap-8", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-[9px] font-black uppercase opacity-30 ml-2", children: "Identity_Label" }), _jsxs("div", { className: "relative", children: [_jsx("input", { required: true, className: "w-full bg-transparent border-2 rounded-2xl py-4 px-6 text-xs font-bold outline-none transition-all focus:border-primary", style: { borderColor: `${theme["base-content"]}10` }, placeholder: "e.g. React", value: formData.name, onChange: e => handleNameChange(e.target.value) }), _jsx("div", { className: "absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/20 rounded-lg border border-white/5", children: _jsx("img", { src: formData.iconUrl, alt: "", className: "w-5 h-5 object-contain" }) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-[9px] font-black uppercase opacity-30 ml-2", children: "Classification" }), _jsx("select", { className: "w-full bg-transparent border-2 rounded-2xl py-4 px-6 text-xs font-bold outline-none", style: { borderColor: `${theme["base-content"]}10` }, value: formData.category, onChange: e => setFormData({ ...formData, category: e.target.value }), children: categories.filter(c => c !== "all").map(c => _jsx("option", { value: c, className: "bg-black text-white", children: c.toUpperCase() }, c)) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-[9px] font-black uppercase opacity-30 ml-2", children: "Asset_Endpoint (Auto-Generated)" }), _jsxs("div", { className: "relative", children: [_jsx(ImageIcon, { className: "absolute left-5 top-1/2 -translate-y-1/2 opacity-20", size: 16 }), _jsx("input", { required: true, className: "w-full bg-transparent border-2 rounded-2xl py-4 pl-14 pr-6 text-xs font-mono outline-none opacity-60", style: { borderColor: `${theme["base-content"]}10` }, value: formData.iconUrl, readOnly: true })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-8", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("label", { className: "text-[9px] font-black uppercase opacity-30", children: "Mastery_Level" }), _jsxs("span", { className: "text-xl font-black italic", style: { color: theme.primary }, children: [formData.proficiency, "%"] })] }), _jsx("input", { type: "range", className: "w-full accent-primary", value: formData.proficiency, onChange: e => setFormData({ ...formData, proficiency: parseInt(e.target.value) }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-[9px] font-black uppercase opacity-30 ml-2", children: "Time_Experience (Y)" }), _jsx("input", { type: "number", className: "w-full bg-transparent border-2 rounded-2xl py-4 px-6 text-xs font-bold outline-none", style: { borderColor: `${theme["base-content"]}10` }, value: formData.yearsExperience, onChange: e => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) }) })] })] }), _jsxs("button", { type: "submit", disabled: isCreating || isUploading || isUpdating, className: "w-full py-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.5em] shadow-xl flex items-center justify-center gap-4 transition-all active:scale-95", style: { backgroundColor: theme.primary, color: theme["base-100"] }, children: [(isCreating || isUploading || isUpdating) ? _jsx(Loader2, { className: "animate-spin" }) : _jsx(Wand2, { size: 20 }), editingId ? 'Commit_System_Reconfiguration' : 'Execute_Deployment_Sequence'] })] })] }) }))] }) }));
};
export default SkillsManager;
