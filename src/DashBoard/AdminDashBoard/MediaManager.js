import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import axios from 'axios';
import { useCreateMediaAssetMutation, useGetMediaAssetsQuery, useDeleteMediaAssetMutation } from '../../Features/Apis/Media.Api';
import { useTheme } from '../../ThemeContext';
import { CloudUpload, Trash2, ImageIcon, Loader2, X, Plus, Database, Activity, ShieldQuestion, CheckCircle2, Zap, HardDrive } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
const CLOUD_NAME = "dwibg4vvf";
const UPLOAD_PRESET = "tickets";
const MediaManager = () => {
    const { theme } = useTheme();
    // --- API HOOKS ---
    const { data: assets, isLoading: isFetching } = useGetMediaAssetsQuery();
    const [createMedia] = useCreateMediaAssetMutation();
    const [deleteMedia] = useDeleteMediaAssetMutation();
    // --- UI STATE ---
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    // --- HANDLERS ---
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file)
            return toast.error("Please select a file first");
        setIsUploading(true);
        const cloudFormData = new FormData();
        cloudFormData.append('file', file);
        cloudFormData.append('upload_preset', UPLOAD_PRESET);
        try {
            const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, cloudFormData, {
                onUploadProgress: (p) => {
                    setUploadProgress(Math.round((p.loaded * 100) / (p.total || 1)));
                },
            });
            await createMedia({
                fileName: file.name,
                fileUrl: res.data.secure_url,
                fileType: file.type,
                fileSize: file.size,
            }).unwrap();
            toast.success("ASSET_SYNCED_TO_BACKEND");
            setIsPanelOpen(false);
            setFile(null);
        }
        catch (err) {
            toast.error(err.data?.error || "UPLOAD_TRANSACTION_FAILED");
        }
        finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };
    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: 'ERASE_ASSET?',
            text: "Note: This will fail if a project is using this thumbnail.",
            icon: 'warning',
            background: theme["base-100"],
            color: theme["base-content"],
            showCancelButton: true,
            confirmButtonColor: theme.primary,
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'DELETE_FROM_REGISTRY'
        });
        if (confirm.isConfirmed) {
            try {
                await deleteMedia(id).unwrap();
                toast.success("ASSET_REMOVED");
            }
            catch (err) {
                Swal.fire({
                    title: 'Constraint Error',
                    text: 'Cannot delete: This asset is currently bound to an active Project.',
                    icon: 'error',
                    background: theme["base-100"],
                    color: theme["base-content"]
                });
            }
        }
    };
    if (isFetching)
        return (_jsxs("div", { className: "h-[60vh] flex flex-col items-center justify-center gap-4", children: [_jsx(Loader2, { className: "animate-spin opacity-20", size: 40, style: { color: theme.primary } }), _jsx("span", { className: "text-[10px] font-mono tracking-[0.5em] opacity-40 uppercase", children: "Scanning_Cloud_Storage" })] }));
    return (_jsxs("div", { className: "min-h-screen p-4 lg:p-8 selection:bg-indigo-500/30 transition-colors duration-500", style: { backgroundColor: theme["base-100"], color: theme["base-content"] }, children: [_jsxs("div", { className: "max-w-7xl mx-auto mb-10", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-8", style: { borderColor: `${theme.primary}15` }, children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "h-1.5 w-1.5 rounded-full animate-pulse", style: { backgroundColor: theme.primary } }), _jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.4em]", style: { color: theme.primary }, children: "Asset_Registry / Media" })] }), _jsxs("h1", { className: "text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none", children: ["Media", _jsx("span", { className: "font-light not-italic", style: { color: theme.primary }, children: "Archive" })] }), _jsxs("p", { className: "text-xs max-w-2xl leading-relaxed mt-4 opacity-40", children: ["Centralized binary storage for project fragments. Assets are cached on ", _jsx("span", { className: "font-bold opacity-100", children: "Cloudinary Edge" }), " and indexed in the ", _jsx("span", { style: { color: theme.primary }, children: "Azure South Stable" }), " registry."] })] }), _jsxs("button", { onClick: () => setIsPanelOpen(true), className: "group px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-2xl active:scale-95", style: { backgroundColor: theme.primary, color: theme["base-100"] }, children: [_jsx(Plus, { size: 18, strokeWidth: 3, className: "group-hover:rotate-90 transition-transform duration-300" }), " New_Deployment"] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mt-10", children: [
                            { icon: _jsx(Database, { size: 18 }), title: "Cloud Sync", desc: "Auto-synchronizing image fragments with Cloudinary.", color: theme.primary },
                            { icon: _jsx(HardDrive, { size: 18 }), title: "Registry Lock", desc: "Constraint-based deletion for active links.", color: "#10b981" },
                            { icon: _jsx(Activity, { size: 18 }), title: "Edge Serving", desc: "Globally distributed high-bandwidth cache.", color: "#ec4899" }
                        ].map((card, idx) => (_jsxs("div", { className: "p-6 rounded-3xl border transition-all hover:translate-y-[-2px]", style: { backgroundColor: `${theme["base-content"]}05`, borderColor: `${theme["base-content"]}05` }, children: [_jsx("div", { className: "mb-4", style: { color: card.color }, children: card.icon }), _jsx("h3", { className: "text-[10px] font-black uppercase tracking-widest mb-1", children: card.title }), _jsx("p", { className: "text-[10px] opacity-40", children: card.desc })] }, idx))) })] }), _jsx("div", { className: "max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6", children: assets?.map((asset) => (_jsxs("div", { className: "group relative aspect-square rounded-[2.5rem] overflow-hidden border transition-all hover:scale-[1.02]", style: { backgroundColor: `${theme["base-content"]}05`, borderColor: `${theme["base-content"]}10` }, children: [_jsx("img", { src: asset.fileUrl, alt: asset.fileName, className: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" }), _jsxs("div", { className: "absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6 backdrop-blur-sm", style: { backgroundColor: `${theme["base-100"]}ee` }, children: [_jsxs("span", { className: "text-[7px] font-mono text-center mb-6 break-all opacity-40 uppercase tracking-tighter", children: ["ID: ", asset.id] }), _jsx("button", { onClick: () => handleDelete(asset.id), className: "p-4 rounded-3xl bg-rose-500 bg-opacity-10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-2xl active:scale-90", children: _jsx(Trash2, { size: 20 }) })] })] }, asset.id))) }), isPanelOpen && (_jsxs("div", { className: "fixed inset-0 z-[1000] flex justify-end", children: [_jsx("div", { className: "absolute inset-0 bg-black/80 backdrop-blur-md", onClick: () => setIsPanelOpen(false) }), _jsxs("div", { className: "relative w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l", style: { backgroundColor: theme["base-100"], borderColor: `${theme.primary}10` }, children: [_jsxs("div", { className: "p-10 border-b relative overflow-hidden", style: { borderColor: `${theme["base-content"]}05` }, children: [_jsx(ImageIcon, { size: 150, className: "absolute -right-10 -bottom-10 opacity-[0.03] -rotate-12 pointer-events-none", style: { color: theme.primary } }), _jsxs("div", { className: "flex items-center justify-between relative z-10", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("span", { className: "p-1 rounded-md", style: { color: theme.primary, backgroundColor: `${theme.primary}15` }, children: _jsx(Zap, { size: 14 }) }), _jsx("span", { className: "text-[9px] font-black uppercase tracking-[0.4em]", style: { color: theme.primary }, children: "Ingestion_Stream" })] }), _jsx("h2", { className: "text-4xl font-black italic uppercase tracking-tighter leading-none", children: "Upload_Asset" })] }), _jsx("button", { onClick: () => setIsPanelOpen(false), className: "p-4 rounded-3xl transition-all hover:bg-rose-500/20 hover:text-rose-500", style: { backgroundColor: `${theme["base-content"]}05`, color: theme["base-content"] }, children: _jsx(X, { size: 24 }) })] })] }), _jsxs("form", { onSubmit: handleUpload, className: "p-10 flex-1 overflow-y-auto space-y-10 no-scrollbar", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "h-[2px] w-8", style: { backgroundColor: theme.primary } }), _jsx("h3", { className: "text-[10px] font-black uppercase tracking-[0.3em]", children: "Binary Selection" })] }), _jsxs("div", { className: "relative group", children: [_jsx("input", { type: "file", onChange: (e) => setFile(e.target.files?.[0] || null), className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" }), _jsxs("div", { className: "border-2 border-dashed rounded-[3rem] p-16 flex flex-col items-center justify-center transition-all group-hover:scale-[0.98]", style: { backgroundColor: `${theme["base-content"]}03`, borderColor: `${theme["base-content"]}10` }, children: [_jsx(CloudUpload, { size: 48, className: "mb-6 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all", style: { color: theme.primary } }), _jsx("p", { className: "text-[10px] font-black uppercase tracking-widest opacity-40", children: file ? file.name : "Drag_Binary_To_Registry" }), file && (_jsxs("p", { className: "text-[8px] font-mono opacity-20 mt-3", children: [(file.size / 1024 / 1024).toFixed(2), " MB // ", file.type.toUpperCase()] }))] })] })] }), isUploading && (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between text-[9px] font-black uppercase tracking-widest opacity-40", children: [_jsx("span", { children: "Uploading_To_Edge" }), _jsxs("span", { children: [uploadProgress, "%"] })] }), _jsx("div", { className: "h-1.5 rounded-full overflow-hidden", style: { backgroundColor: `${theme["base-content"]}05` }, children: _jsx("div", { className: "h-full transition-all duration-300", style: { width: `${uploadProgress}%`, backgroundColor: theme.primary } }) })] })), _jsxs("div", { className: "p-6 rounded-3xl border flex gap-4 items-start", style: { backgroundColor: `${theme.primary}05`, borderColor: `${theme.primary}15` }, children: [_jsx(ShieldQuestion, { size: 20, className: "mt-0.5", style: { color: theme.primary } }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-bold uppercase", style: { color: theme.primary }, children: "Registry Protocol" }), _jsx("p", { className: "text-[9px] opacity-40 mt-1 leading-relaxed", children: "System allows unique binary indexing. Erasure is locked if the fragment is bound to an active project deployment." })] })] })] }), _jsx("div", { className: "p-10 border-t", style: { backgroundColor: `${theme["base-content"]}02`, borderColor: `${theme["base-content"]}05` }, children: _jsxs("button", { onClick: handleUpload, disabled: isUploading || !file, className: "w-full py-5 rounded-3xl text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-20", style: { backgroundColor: theme.primary, color: theme["base-100"] }, children: [isUploading ? _jsx(Loader2, { className: "animate-spin", size: 18 }) : _jsx(CheckCircle2, { size: 18 }), isUploading ? 'Executing_Sync...' : 'Confirm_Deployment'] }) })] })] }))] }));
};
export default MediaManager;
