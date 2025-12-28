
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { CustomAgent, AppSettings, EmotionalState, Attachment, Model, ModelId } from '../types';
import AgentEditorModal from './AgentEditorModal';
import { XMarkIcon, PlusIcon, EditIcon, TrashIcon, BeakerIcon, HammerIcon, UserIcon, PaperclipIcon, LoadingIcon, RefreshIcon, ComputerDesktopIcon, ArrowsPointingOutIcon, CodeBracketIcon, ArrowLeftStartOnRectangleIcon, DownloadIcon, ClockIcon } from './icons';
import { generateWebApp } from '../services/geminiService';
import ModelSelector from './ModelSelector';
import JSZip from 'jszip';

interface RickLabsModalProps {
    isOpen: boolean;
    onClose: () => void;
    agents: CustomAgent[];
    onUpdateAgents: (agents: CustomAgent[]) => void;
    activeAgentId: string | null;
    onSetActiveAgent: (agentId: string | null) => void;
    appSettings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
}

// Build Models Definition
const BUILD_MODELS: Model[] = [
  { id: 'code', name: 'Phi-4 Code' },
  { id: 'phi5', name: 'Phi-5🚀' },
  { id: 'fast', name: 'Fast (Phi-2)' },
];

interface SavedApp {
    id: string;
    name: string;
    code: string;
    prompt: string;
    timestamp: number;
    modelId: ModelId;
}

const AgentCard: React.FC<{
    agent: CustomAgent;
    isActive: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onToggleActive: () => void;
}> = ({ agent, isActive, onEdit, onDelete, onToggleActive }) => {
    return (
        <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 flex flex-col justify-between transition-all duration-300 ease-in-out hover:scale-[1.03] hover:shadow-xl hover:border-teal-500/50">
            <div>
                <div className="flex justify-between items-start">
                    <h4 className="text-lg font-bold text-white">{agent.name}</h4>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${isActive ? 'bg-teal-500/20 text-teal-300' : 'bg-gray-600 text-gray-300'}`}>
                        {isActive ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
                <p className="text-sm text-gray-400 mt-1 capitalize">{agent.communicationStyle} &bull; {agent.responseSpeed}</p>
                 <p className="text-xs text-gray-400 mt-2 truncate" title={agent.personalityTraits}>Rasgos: {agent.personalityTraits}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-600 flex items-center justify-between gap-2">
                <button onClick={onToggleActive} className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${isActive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                    {isActive ? 'Desactivar' : 'Activar'}
                </button>
                <div className="flex gap-1">
                    <button onClick={onEdit} className="p-2 rounded-md bg-gray-600 text-gray-300 hover:bg-gray-500 hover:text-white transition-colors"><EditIcon className="w-4 h-4" /></button>
                    <button onClick={onDelete} className="p-2 rounded-md bg-gray-600 text-gray-300 hover:bg-red-500 hover:text-white transition-colors"><TrashIcon className="w-4 h-4" /></button>
                </div>
            </div>
        </div>
    );
};

const ToggleSwitch: React.FC<{ label: string, enabled: boolean, onChange: (enabled: boolean) => void }> = ({ label, enabled, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
        <span className="text-gray-300">{label}</span>
        <button
            type="button"
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ring-offset-gray-800 ${enabled ? 'bg-teal-600' : 'bg-gray-600'}`}
            onClick={() => onChange(!enabled)}
            aria-pressed={enabled}
        >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    </div>
);

interface BuildStudioProps {
    onExit: () => void;
}

const BuildStudio: React.FC<BuildStudioProps> = ({ onExit }) => {
    const [prompt, setPrompt] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isBuilding, setIsBuilding] = useState(false);
    const [buildFiles, setBuildFiles] = useState<Attachment[]>([]);
    const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
    const [selectedModelId, setSelectedModelId] = useState<ModelId>('code');
    const [history, setHistory] = useState<SavedApp[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewFrameRef = useRef<HTMLIFrameElement>(null);

    // Load history from localStorage
    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('rick-build-history');
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (e) {
            console.error("Error loading build history", e);
        }
    }, []);

    // This useMemo ensures that for the PREVIEW iframe, we use Blob URLs so the browser can display the images.
    // The actual generated code contains relative paths like "cat.png", which we swap here.
    const previewCode = useMemo(() => {
        if (!generatedCode) return '';
        let codeForPreview = generatedCode;
        
        buildFiles.forEach(file => {
            // Replace simple relative filename with the blob URL for live preview
            // Note: This simple replacement assumes the AI uses the filename exactly as provided.
            // Using a global replace to catch multiple usages.
            // We use split/join to avoid regex special character issues in filenames.
            codeForPreview = codeForPreview.split(file.name).join(file.data);
        });
        
        return codeForPreview;
    }, [generatedCode, buildFiles]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            Array.from(e.target.files).forEach((file: File) => {
                if (file.size > 10 * 1024 * 1024) {
                    alert(`El archivo ${file.name} es demasiado grande (>10MB) para el editor web.`);
                    return;
                }
                const reader = new FileReader();
                reader.onload = (loadEvent) => {
                    const result = loadEvent.target?.result;
                    if (typeof result === 'string') {
                         const newFile: Attachment = { 
                                name: file.name, 
                                type: file.type, 
                                data: result // Base64 Data URI
                        };
                        setBuildFiles(prev => [...prev, newFile]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleRemoveFile = (fileName: string) => {
        setBuildFiles(prev => prev.filter(f => f.name !== fileName));
    };

    const saveToHistory = (code: string, currentPrompt: string) => {
        const newApp: SavedApp = {
            id: Date.now().toString(),
            name: currentPrompt.length > 40 ? currentPrompt.substring(0, 40) + '...' : currentPrompt || "Sin título",
            code: code,
            prompt: currentPrompt,
            timestamp: Date.now(),
            modelId: selectedModelId
        };
        
        // Start with the new list (current + previous history)
        // We limit to a reasonable number initially to prevent uncontrolled growth before size check
        let updatedHistory = [newApp, ...history];
        if (updatedHistory.length > 20) {
            updatedHistory = updatedHistory.slice(0, 20);
        }

        // Try to save, pruning old items if QuotaExceededError occurs
        const trySave = (items: SavedApp[]) => {
            try {
                localStorage.setItem('rick-build-history', JSON.stringify(items));
                setHistory(items); // Sync state on success
            } catch (e: any) {
                if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || (e.message && e.message.includes('quota'))) {
                    console.warn("Storage quota exceeded. Pruning history...");
                    if (items.length > 1) {
                        // Remove the oldest item (last in array) and retry
                        const prunedItems = items.slice(0, -1);
                        trySave(prunedItems);
                    } else {
                        // Cannot even save the single new item
                        console.error("Storage full, cannot save new app.");
                        alert("Historial lleno. No se pudo guardar la nueva versión automáticamente porque el código es muy grande para el almacenamiento local.");
                        // Keep it in React state so user doesn't lose it in current session
                        setHistory([newApp, ...history]); 
                    }
                } else {
                    console.error("Error saving history:", e);
                }
            }
        };

        trySave(updatedHistory);
    };

    const handleLoadHistory = (app: SavedApp) => {
        if (generatedCode && !confirm("¿Cargar esta versión reemplazará tu trabajo actual. ¿Continuar?")) return;
        setGeneratedCode(app.code);
        setPrompt(app.prompt); // Optional: load the prompt that created it? or leave blank for new iterations?
        setSelectedModelId(app.modelId);
        setBuildFiles([]); // Clear files as they are local blobs and not persisted in history
        setViewMode('preview');
        setShowHistory(false);
    };

    const handleDeleteHistory = (e: React.MouseEvent, appId: string) => {
        e.stopPropagation();
        const updatedHistory = history.filter(h => h.id !== appId);
        setHistory(updatedHistory);
        localStorage.setItem('rick-build-history', JSON.stringify(updatedHistory));
    };

    const handleBuild = async () => {
        if (!prompt.trim()) return;
        setIsBuilding(true);
        try {
            // Pass generatedCode as previousCode context if updating
            const code = await generateWebApp(prompt, buildFiles, selectedModelId, generatedCode);
            setGeneratedCode(code);
            setViewMode('preview');
            saveToHistory(code, prompt); // Auto-save to history with robust error handling
            setPrompt(''); // Clear prompt after build request
        } catch (error) {
            console.error("Build failed:", error);
            alert("Error generating app. Please try again.");
        } finally {
            setIsBuilding(false);
        }
    };

    const handleDownloadHtml = () => {
        if (!generatedCode) return;
        const blob = new Blob([generatedCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownloadZip = async () => {
        if (!generatedCode) return;
        try {
            const zip = new JSZip();
            
            // Add index.html
            zip.file("index.html", generatedCode);
            
            // Add assets
            for (const file of buildFiles) {
                try {
                    // Check if it's a base64 data URI
                    if (file.data.startsWith('data:')) {
                        const base64Data = file.data.split(',')[1];
                        zip.file(file.name, base64Data, { base64: true });
                    } else if (file.data.startsWith('blob:')) {
                         // Legacy support or fallback
                         const response = await fetch(file.data);
                         if (!response.ok) throw new Error(`Failed to fetch ${file.name}`);
                         const blob = await response.blob();
                         zip.file(file.name, blob);
                    } else {
                        // Plain text fallback
                        zip.file(file.name, file.data);
                    }
                } catch (err) {
                    console.error(`Skipping file ${file.name} due to read error:`, err);
                    alert(`No se pudo incluir el archivo "${file.name}" en el ZIP. Se omitirá.`);
                }
            }
            
            // Generate ZIP
            const content = await zip.generateAsync({ type: "blob" });
            
            // Trigger download
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'rick-project.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
        } catch (e) {
            console.error("Error creating ZIP:", e);
            alert("Error al comprimir el proyecto. Intenta recargar la página si el problema persiste.");
        }
    };

    const handleReset = () => {
        if (generatedCode && !confirm("¿Estás seguro de que quieres reiniciar el proyecto? Se perderá el código actual.")) {
            return;
        }
        setPrompt('');
        setGeneratedCode('');
        setBuildFiles([]);
        setViewMode('preview');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const toggleFullScreenPreview = () => {
        if (previewFrameRef.current) {
            if (!document.fullscreenElement) {
                previewFrameRef.current.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#111] relative">
            {/* History Sidebar Overlay */}
            <div className={`absolute top-14 left-0 bottom-0 w-72 bg-[#1a1a1a] border-r border-gray-800 transform transition-transform duration-300 z-20 flex flex-col ${showHistory ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Historial</h3>
                    <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-white"><XMarkIcon className="w-5 h-5"/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {history.length === 0 ? (
                        <p className="text-center text-xs text-gray-500 mt-10">No hay apps guardadas aún.</p>
                    ) : (
                        history.map(app => (
                            <div key={app.id} onClick={() => handleLoadHistory(app)} className="group p-3 rounded bg-[#222] hover:bg-[#2a2a2a] cursor-pointer border border-transparent hover:border-gray-700 transition-all">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-semibold text-teal-400 truncate flex-1 pr-2">{app.name}</span>
                                    <button onClick={(e) => handleDeleteHistory(e, app.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <TrashIcon className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-500">{new Date(app.timestamp).toLocaleString()}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Studio Header */}
            <header className="h-14 border-b border-gray-800 bg-[#1a1a1a] flex items-center justify-between px-4 flex-shrink-0 z-30">
                <div className="flex items-center gap-4">
                    <button onClick={onExit} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
                        <ArrowLeftStartOnRectangleIcon className="w-5 h-5" /> Salir
                    </button>
                    <div className="h-6 w-px bg-gray-700 mx-2"></div>
                    <h2 className="text-white font-bold tracking-wide">RICK STUDIO <span className="text-teal-500 text-xs align-top">BETA</span></h2>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="w-48">
                        <ModelSelector 
                            models={BUILD_MODELS} 
                            selectedModel={selectedModelId} 
                            onModelChange={setSelectedModelId} 
                            disabled={isBuilding} 
                        />
                    </div>
                    <button 
                        onClick={() => setShowHistory(!showHistory)}
                        className={`p-2 transition-colors ${showHistory ? 'text-teal-400 bg-gray-800 rounded' : 'text-gray-400 hover:text-white'}`}
                        title="Historial de Apps"
                    >
                        <ClockIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={handleReset}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Reiniciar Proyecto"
                    >
                        <RefreshIcon className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
                        <button 
                            onClick={handleDownloadZip} 
                            disabled={!generatedCode}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-600 text-white rounded text-sm disabled:opacity-30 transition-colors"
                            title="Descargar Proyecto ZIP"
                        >
                            <DownloadIcon className="w-4 h-4" /> ZIP
                        </button>
                        <div className="w-px h-4 bg-gray-600"></div>
                        <button 
                            onClick={handleDownloadHtml} 
                            disabled={!generatedCode}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-600 text-white rounded text-sm disabled:opacity-30 transition-colors font-mono"
                            title="Descargar archivo HTML"
                        >
                            HTML
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Work Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Pane: Controls & Code */}
                <div className="w-1/3 min-w-[350px] max-w-[500px] flex flex-col border-r border-gray-800 bg-[#151515]">
                    <div className="flex border-b border-gray-800">
                        <button 
                            onClick={() => setViewMode('preview')}
                            className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${viewMode === 'preview' ? 'text-teal-400 border-b-2 border-teal-500 bg-[#1a1a1a]' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Prompt
                        </button>
                        <button 
                            onClick={() => setViewMode('code')}
                            className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${viewMode === 'code' ? 'text-teal-400 border-b-2 border-teal-500 bg-[#1a1a1a]' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Código
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {viewMode === 'preview' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                                        {generatedCode ? "ACTUALIZAR APP" : "NUEVA APP"}
                                    </label>
                                    <textarea 
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder={generatedCode ? "Ej: Cambia el fondo a negro, añade un botón..." : "Ej: Crea un juego de serpiente en Python, o una landing page moderna..."}
                                        className="w-full h-40 bg-[#222] border border-gray-700 rounded-md p-3 text-white placeholder-gray-600 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 resize-none text-sm transition-all"
                                        autoFocus
                                    />
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-xs flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                                        >
                                            <PaperclipIcon className="w-3 h-3" /> Adjuntar Archivos
                                        </button>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />
                                    </div>
                                    
                                    {buildFiles.length > 0 && (
                                        <div className="flex flex-wrap gap-2 p-2 bg-[#222] rounded border border-gray-800">
                                            {buildFiles.map(f => (
                                                <div key={f.name} className="flex items-center gap-1 bg-gray-700 px-2 py-1 rounded text-[10px] text-gray-200">
                                                    <span className="truncate max-w-[120px]">{f.name}</span>
                                                    <button onClick={() => handleRemoveFile(f.name)} className="text-red-400 hover:text-white"><XMarkIcon className="w-3 h-3" /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button 
                                    onClick={handleBuild}
                                    disabled={isBuilding || !prompt.trim()}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold rounded-md shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {isBuilding ? <LoadingIcon className="w-5 h-5 animate-spin" /> : <HammerIcon className="w-5 h-5" />}
                                    {isBuilding ? (generatedCode ? 'Generando assets...' : 'Construyendo...') : (generatedCode ? 'Actualizar App' : 'Construir App')}
                                </button>
                                
                                {generatedCode && (
                                    <div className="mt-6 p-4 bg-[#222] rounded border border-gray-700">
                                        <h4 className="text-xs font-bold text-gray-400 mb-2">ESTADO</h4>
                                        <div className="flex items-center gap-2 text-green-400 text-sm">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            App lista. Usa el panel derecho para interactuar.
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full relative">
                                <pre className="h-full text-[10px] font-mono text-gray-300 bg-[#111] p-2 rounded overflow-auto border border-gray-800 leading-relaxed">
                                    {generatedCode || "// No code generated yet..."}
                                </pre>
                                <button 
                                    onClick={() => navigator.clipboard.writeText(generatedCode)}
                                    className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded"
                                >
                                    Copiar
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Pane: Preview */}
                <div className="flex-1 bg-[#222] relative flex flex-col">
                    <div className="h-8 bg-[#2d2d2d] flex items-center justify-between px-4 border-b border-[#333]">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                            <span className="ml-3 text-[10px] text-gray-500 font-mono tracking-wide">localhost:3000/preview</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={toggleFullScreenPreview} className="text-gray-400 hover:text-white transition-colors" title="Pantalla Completa">
                                <ArrowsPointingOutIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 relative bg-white" ref={previewFrameRef}>
                        {generatedCode ? (
                            <iframe 
                                srcDoc={previewCode} // Use the modified code with blob URLs
                                title="App Preview"
                                className="w-full h-full border-0 block"
                                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                                <ComputerDesktopIcon className="w-24 h-24 mb-4 opacity-10" />
                                <p className="text-sm opacity-50 font-medium">Tu aplicación aparecerá aquí</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


const RickLabsModal: React.FC<RickLabsModalProps> = ({ isOpen, onClose, agents, onUpdateAgents, activeAgentId, onSetActiveAgent, appSettings, onSettingsChange }) => {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [agentToEdit, setAgentToEdit] = useState<CustomAgent | null>(null);
    const [activeTab, setActiveTab] = useState<'agents' | 'avatar' | 'build'>('agents');
    
    if (!isOpen) return null;

    // If build tab is active, we render the full-screen Studio interface
    if (activeTab === 'build') {
        return (
            <div className="fixed inset-0 z-50 bg-[#111] w-screen h-screen overflow-hidden animate-focus-in">
                <BuildStudio onExit={() => setActiveTab('agents')} />
            </div>
        );
    }

    const handleCreateAgent = () => {
        setAgentToEdit(null);
        setIsEditorOpen(true);
    };
    
    const handleEditAgent = (agent: CustomAgent) => {
        setAgentToEdit(agent);
        setIsEditorOpen(true);
    };

    const handleDeleteAgent = (agentId: string) => {
        if (confirm(`¿Seguro que quieres eliminar el agente "${agents.find(a => a.id === agentId)?.name}"? Esta acción es irreversible.`)) {
            if (activeAgentId === agentId) {
                onSetActiveAgent(null);
            }
            onUpdateAgents(agents.filter(a => a.id !== agentId));
        }
    };
    
    const handleSaveAgent = (agent: CustomAgent) => {
        const existingIndex = agents.findIndex(a => a.id === agent.id);
        if (existingIndex > -1) {
            const updatedAgents = [...agents];
            updatedAgents[existingIndex] = agent;
            onUpdateAgents(updatedAgents);
        } else {
            onUpdateAgents([...agents, agent]);
        }
    };
    
    const handleToggleActive = (agentId: string) => {
        if (activeAgentId === agentId) {
            onSetActiveAgent(null);
        } else {
            onSetActiveAgent(agentId);
        }
    }

    const handleEmotionalStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onSettingsChange({ ...appSettings, currentEmotionalState: e.target.value as EmotionalState });
    };

    return (
        <>
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
                <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl h-full max-h-[85vh] flex overflow-hidden" onClick={e => e.stopPropagation()}>
                    {/* Sidebar Navigation */}
                    <aside className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col flex-shrink-0">
                        <div className="p-6 border-b border-gray-700 flex items-center gap-3">
                            <BeakerIcon className="w-8 h-8 text-teal-400"/>
                            <div>
                                <h2 className="text-xl font-bold text-white leading-tight">Laboratorios</h2>
                                <span className="text-xs text-gray-400 tracking-widest">RICK</span>
                            </div>
                        </div>
                        <nav className="flex-1 p-4 space-y-2">
                            <button 
                                onClick={() => setActiveTab('agents')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'agents' ? 'bg-gray-800 text-white border-l-4 border-teal-500' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                            >
                                <BeakerIcon className="w-5 h-5" />
                                <span className="font-medium">Agentes IA</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('build')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'build' ? 'bg-gray-800 text-white border-l-4 border-blue-500' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                            >
                                <HammerIcon className="w-5 h-5" />
                                <span className="font-medium">Build (Web)</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('avatar')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'avatar' ? 'bg-gray-800 text-white border-l-4 border-purple-500' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                            >
                                <UserIcon className="w-5 h-5" />
                                <span className="font-medium">Avatar</span>
                            </button>
                        </nav>
                        <div className="p-4 border-t border-gray-700">
                            <button onClick={onClose} className="w-full py-2 text-gray-400 hover:text-white flex items-center justify-center gap-2 hover:bg-gray-800 rounded-md transition-colors">
                                <XMarkIcon className="w-5 h-5" /> Cerrar
                            </button>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 flex flex-col min-w-0 bg-gray-800">
                        {/* Header specific to tab */}
                        <header className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/90 backdrop-blur z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    {activeTab === 'agents' && 'Gestor de Agentes'}
                                    {activeTab === 'avatar' && 'Configuración de Avatar'}
                                </h2>
                                <p className="text-sm text-gray-400 mt-1">
                                    {activeTab === 'agents' && 'Crea personalidades de IA especializadas.'}
                                    {activeTab === 'avatar' && 'Personaliza la presencia holográfica de Rick.'}
                                </p>
                            </div>
                            {activeTab === 'agents' && (
                                <button onClick={handleCreateAgent} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-lg">
                                    <PlusIcon className="w-5 h-5" />
                                    Crear Agente
                                </button>
                            )}
                        </header>

                        <div className="flex-1 overflow-y-auto p-6">
                            {activeTab === 'agents' && (
                                <div className="animate-focus-in">
                                    {agents.length === 0 ? (
                                        <div className="text-center py-20 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center">
                                            <BeakerIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                            <p className="text-lg font-semibold text-gray-400">Tu laboratorio está vacío.</p>
                                            <p className="text-gray-500 text-sm max-w-xs mt-1">¡Es hora de un poco de ciencia! Haz clic en "Crear Agente" para empezar la experimentación.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {agents.map(agent => (
                                                <AgentCard 
                                                    key={agent.id}
                                                    agent={agent}
                                                    isActive={agent.id === activeAgentId}
                                                    onEdit={() => handleEditAgent(agent)}
                                                    onDelete={() => handleDeleteAgent(agent.id)}
                                                    onToggleActive={() => handleToggleActive(agent.id)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'avatar' && (
                                <div className="max-w-2xl mx-auto animate-focus-in space-y-8">
                                    <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-700">
                                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                            <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
                                            Sistema Holográfico
                                        </h3>
                                        
                                        <div className="space-y-8">
                                            <ToggleSwitch 
                                                label="Activar Proyección Holográfica (Avatar)" 
                                                enabled={appSettings.showAvatar}
                                                onChange={(enabled) => onSettingsChange({ ...appSettings, showAvatar: enabled })}
                                            />
                                            
                                            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                                <label className="block text-sm font-medium text-gray-300 mb-3">Calibración Emocional Manual</label>
                                                <div className="relative">
                                                    <select
                                                        value={appSettings.currentEmotionalState}
                                                        onChange={handleEmotionalStateChange}
                                                        disabled={!appSettings.showAvatar}
                                                        className="appearance-none w-full bg-gray-900 border border-gray-600 text-white py-3 pl-4 pr-10 rounded-lg leading-tight focus:outline-none focus:bg-gray-900 focus:border-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {Object.values(EmotionalState).map(state => (
                                                            <option key={state} value={state}>
                                                                {state.charAt(0).toUpperCase() + state.slice(1)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Normalmente la IA detecta la emoción automáticamente. Usa esto para forzar un estado específico.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
            <AgentEditorModal 
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onSave={handleSaveAgent}
                agentToEdit={agentToEdit}
            />
        </>
    );
};

export default RickLabsModal;
