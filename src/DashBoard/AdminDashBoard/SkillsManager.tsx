import React, { useState } from 'react';
import {
    useGetTechSkillsQuery,
    useCreateTechSkillMutation,
    useDeleteTechSkillMutation,
    useCreateMediaMutation,
    useUpdateTechSkillMutation
} from '../../Features/Apis/Skills.Api';
import { useTheme } from '../../ThemeContext';
import {
    Plus, Trash2, Search, Filter,
    CloudUpload, Code, Award, Zap,
    X, Image as ImageIcon, Loader2,
    Database, Cpu, Terminal, Boxes,
    Wand2, Activity, Edit3
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const SkillsManager = () => {
    const { theme } = useTheme();

    // --- UI STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<string>("all");
    const [editingId, setEditingId] = useState<string | null>(null);

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
    const handleNameChange = (name: string) => {
        const cleanName = name.toLowerCase().replace(/\s+/g, '').replace(/\./g, 'dot');
        const autoIconUrl = `https://cdn.simpleicons.org/${cleanName}`;

        setFormData({
            ...formData,
            name: name,
            iconUrl: autoIconUrl
        });
    };

    // --- HANDLERS ---
    const handleSubmit = async (e: React.FormEvent) => {
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
            } else {
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
        } catch (err) {
            toast.error("TRANSACTION_FAILURE");
        }
    };

    const handleEdit = (skill: any) => {
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

    return (
        <div className="min-h-screen p-4 lg:p-8 transition-all duration-500" style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}>
            <div className="max-w-7xl mx-auto">

                {/* --- HEADER --- */}
                <header className="mb-10 border-b pb-8" style={{ borderColor: `${theme.primary}15` }}>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-2 w-2 rounded-full animate-ping" style={{ backgroundColor: theme.primary }} />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">System_Architect / Arsenal_Registry</span>
                    </div>
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter">
                        Skill<span className="font-light not-italic" style={{ color: theme.primary }}>Matrix</span>
                    </h1>
                </header>

                {/* --- CONTROL BAR --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    <div className="lg:col-span-2 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${activeTab === cat ? 'bg-primary text-white border-primary' : 'border-transparent opacity-40 hover:opacity-100'}`}
                                style={{
                                    backgroundColor: activeTab === cat ? theme.primary : 'transparent',
                                    borderColor: activeTab === cat ? theme.primary : `${theme["base-content"]}10`
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 opacity-20" size={18} />
                        <input
                            type="text"
                            placeholder="FILTER_REGISTRY..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-2 rounded-2xl py-4 pl-14 pr-8 text-xs font-bold outline-none transition-all focus:border-primary/50"
                            style={{ backgroundColor: `${theme["base-content"]}03`, borderColor: `${theme["base-content"]}10` }}
                        />
                    </div>
                </div>

                {/* --- MAIN GRID --- */}
                {isFetching ? (
                    <div className="py-48 flex flex-col items-center justify-center opacity-20">
                        <Loader2 className="animate-spin mb-4" size={40} />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Syncing_Database_Nodes...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-32">
                        {filteredSkills.map((skill) => (
                            <div
                                key={skill.id}
                                className="group relative rounded-3xl p-6 border-2 transition-all duration-300 hover:scale-[1.03]"
                                style={{
                                    backgroundColor: `${theme["base-content"]}03`,
                                    borderColor: `${theme["base-content"]}08`
                                }}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-black/20 flex items-center justify-center border border-white/5 overflow-hidden">
                                        {skill.icon?.fileUrl ? (
                                            <img src={skill.icon.fileUrl} className="w-8 h-8 object-contain" alt={skill.name} />
                                        ) : <Cpu size={20} className="opacity-20" />}
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => handleEdit(skill)}
                                            className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white"
                                        >
                                            <Edit3 size={14} />
                                        </button>
                                        <button
                                            onClick={() => deleteSkill(skill.id)}
                                            className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-black italic uppercase tracking-tighter mb-1">{skill.name}</h3>
                                <p className="text-[8px] font-bold opacity-30 uppercase tracking-[0.2em] mb-4">{skill.category}</p>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[8px] font-black opacity-20 uppercase tracking-widest">Mastery</span>
                                        <span className="text-sm font-black italic" style={{ color: theme.primary }}>{skill.skill?.proficiency}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-1000"
                                            style={{ backgroundColor: theme.primary, width: `${skill.skill?.proficiency}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 pt-2">
                                        <Zap size={10} style={{ color: theme.primary }} />
                                        <span className="text-[8px] font-mono opacity-40 uppercase">{skill.skill?.yearsExperience}Y_EXP</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- FLOATING ACTION BUTTON --- */}
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="group px-12 py-6 rounded-full font-black text-[11px] uppercase tracking-[0.5em] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 transition-all hover:scale-105 active:scale-95"
                        style={{ backgroundColor: theme.primary, color: theme["base-100"] }}
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                        Initialize_New_Node
                    </button>
                </div>

                {/* --- MODAL --- */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                        <div className="w-full max-w-2xl rounded-[3.5rem] border-2 p-12 shadow-2xl" style={{ backgroundColor: theme["base-100"], borderColor: `${theme.primary}20` }}>
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-4xl font-black tracking-tighter italic uppercase">
                                    {editingId ? 'Update_' : 'Mount_'}<span style={{ color: theme.primary }}>Resource</span>
                                </h2>
                                <button onClick={closeModal} className="p-2 opacity-30 hover:opacity-100"><X /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase opacity-30 ml-2">Identity_Label</label>
                                        <div className="relative">
                                            <input
                                                required
                                                className="w-full bg-transparent border-2 rounded-2xl py-4 px-6 text-xs font-bold outline-none transition-all focus:border-primary"
                                                style={{ borderColor: `${theme["base-content"]}10` }}
                                                placeholder="e.g. React"
                                                value={formData.name}
                                                onChange={e => handleNameChange(e.target.value)}
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/20 rounded-lg border border-white/5">
                                                <img src={formData.iconUrl} alt="" className="w-5 h-5 object-contain" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase opacity-30 ml-2">Classification</label>
                                        <select
                                            className="w-full bg-transparent border-2 rounded-2xl py-4 px-6 text-xs font-bold outline-none"
                                            style={{ borderColor: `${theme["base-content"]}10` }}
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {categories.filter(c => c !== "all").map(c => <option key={c} value={c} className="bg-black text-white">{c.toUpperCase()}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase opacity-30 ml-2">Asset_Endpoint (Auto-Generated)</label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 opacity-20" size={16} />
                                        <input
                                            required
                                            className="w-full bg-transparent border-2 rounded-2xl py-4 pl-14 pr-6 text-xs font-mono outline-none opacity-60"
                                            style={{ borderColor: `${theme["base-content"]}10` }}
                                            value={formData.iconUrl}
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <label className="text-[9px] font-black uppercase opacity-30">Mastery_Level</label>
                                            <span className="text-xl font-black italic" style={{ color: theme.primary }}>{formData.proficiency}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            className="w-full accent-primary"
                                            value={formData.proficiency}
                                            onChange={e => setFormData({ ...formData, proficiency: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase opacity-30 ml-2">Time_Experience (Y)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-transparent border-2 rounded-2xl py-4 px-6 text-xs font-bold outline-none"
                                            style={{ borderColor: `${theme["base-content"]}10` }}
                                            value={formData.yearsExperience}
                                            onChange={e => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isCreating || isUploading || isUpdating}
                                    className="w-full py-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.5em] shadow-xl flex items-center justify-center gap-4 transition-all active:scale-95"
                                    style={{ backgroundColor: theme.primary, color: theme["base-100"] }}
                                >
                                    {(isCreating || isUploading || isUpdating) ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
                                    {editingId ? 'Commit_System_Reconfiguration' : 'Execute_Deployment_Sequence'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SkillsManager;