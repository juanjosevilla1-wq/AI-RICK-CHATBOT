import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CustomAgent, AgentKnowledgeFile, AgentTool } from '../types';
import { XMarkIcon, TrashIcon, PaperclipIcon, GlobeAltIcon, CalendarIcon, BookOpenIcon, EnvelopeIcon, TableCellsIcon, PrinterIcon } from './icons';

interface AgentEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (agent: CustomAgent) => void;
    agentToEdit: CustomAgent | null;
}

const AgentEditorModal: React.FC<AgentEditorModalProps> = ({ isOpen, onClose, onSave, agentToEdit }) => {
    
    const getInitialAgentState = useCallback((): CustomAgent => {
        return {
            id: agentToEdit?.id || Date.now().toString(),
            name: agentToEdit?.name || '',
            personalityTraits: agentToEdit?.personalityTraits || 'servicial, ingenioso, un poco sarcástico',
            communicationStyle: agentToEdit?.communicationStyle || 'coloquial',
            responseSpeed: agentToEdit?.responseSpeed || 'equilibrado',
            knowledgeFiles: agentToEdit?.knowledgeFiles || [],
            tools: agentToEdit?.tools || [],
        };
    }, [agentToEdit]);

    const [agent, setAgent] = useState<CustomAgent>(getInitialAgentState);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setAgent(getInitialAgentState());
        }
    }, [isOpen, getInitialAgentState]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAgent(prev => ({ ...prev, [name]: value }));
    };
    
    const handleToolChange = (tool: AgentTool) => {
        setAgent(prev => {
            const newTools = prev.tools.includes(tool)
                ? prev.tools.filter(t => t !== tool)
                : [...prev.tools, tool];
            return { ...prev, tools: newTools };
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file: File) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target?.result as string;
                    const newFile: AgentKnowledgeFile = { name: file.name, content };
                    setAgent(prev => ({ ...prev, knowledgeFiles: [...prev.knowledgeFiles, newFile] }));
                };
                reader.readAsText(file);
            });
        }
    };
    
    const removeFile = (fileName: string) => {
        setAgent(prev => ({ ...prev, knowledgeFiles: prev.knowledgeFiles.filter(f => f.name !== fileName) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!agent.name.trim()) {
            alert("El nombre del agente no puede estar vacío.");
            return;
        }
        onSave(agent);
        onClose();
    };

    const FormField: React.FC<{ label: string; children: React.ReactNode, helperText?: string }> = ({ label, children, helperText }) => (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
            {children}
            {helperText && <p className="text-xs text-gray-400 mt-1">{helperText}</p>}
        </div>
    );

    const ToolCheckbox: React.FC<{ tool: AgentTool, label: string, description: string, icon: React.ReactNode }> = ({ tool, label, description, icon }) => (
        <div className="flex items-start gap-3">
            <input
                type="checkbox"
                id={`tool-${tool}`}
                checked={agent.tools.includes(tool)}
                onChange={() => handleToolChange(tool)}
                className="mt-1 h-4 w-4 rounded border-gray-500 bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
                <label htmlFor={`tool-${tool}`} className="flex items-center gap-2 font-semibold text-gray-200 cursor-pointer">
                    {icon} {label}
                </label>
                <p className="text-xs text-gray-400">{description}</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">{agentToEdit ? 'Editar Agente' : 'Crear Nuevo Agente'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-700">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <FormField label="Nombre del Agente">
                        <input type="text" name="name" value={agent.name} onChange={handleChange} placeholder="Ej. Asistente de Código" required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500" />
                    </FormField>
                    <FormField label="Rasgos de Personalidad" helperText="Describe la actitud del agente con adjetivos separados por comas.">
                        <textarea name="personalityTraits" value={agent.personalityTraits} onChange={handleChange} rows={2} placeholder="divertido, serio, curioso, profesional..." className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500"></textarea>
                    </FormField>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Estilo de Comunicación" helperText="Define cómo se expresará el agente.">
                            <select name="communicationStyle" value={agent.communicationStyle} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500">
                                <option value="coloquial">Coloquial</option>
                                <option value="formal">Formal</option>
                                <option value="humorístico">Humorístico</option>
                            </select>
                        </FormField>
                        <FormField label="Nivel de Rapidez" helperText="'Profundo' usa más IA, puede ser más lento pero más completo.">
                             <select name="responseSpeed" value={agent.responseSpeed} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500">
                                <option value="rápido">Rápido (Respuestas directas)</option>
                                <option value="equilibrado">Equilibrado (Balanceado)</option>
                                <option value="profundo">Profundo (Razonamiento complejo)</option>
                            </select>
                        </FormField>
                    </div>
                     <FormField label="Capacidades del Agente" helperText="Activa herramientas para darle superpoderes a tu agente.">
                        <div className="space-y-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                            <ToolCheckbox tool="web_search" label="Búsqueda Web" description="Permite al agente buscar en Google para obtener información en tiempo real." icon={<GlobeAltIcon className="w-5 h-5 text-blue-400" />} />
                            <ToolCheckbox tool="document_analysis" label="Análisis de Documentos" description="Mejora la habilidad del agente para consultar su base de conocimiento." icon={<BookOpenIcon className="w-5 h-5 text-yellow-400" />} />
                            <ToolCheckbox tool="calendar_scheduling" label="Programación de Calendario" description="Permite al agente crear eventos de calendario cuando se lo pidas." icon={<CalendarIcon className="w-5 h-5 text-red-400" />} />
                            <ToolCheckbox tool="email_drafter" label="Redactor de Emails" description="Capacita al agente para redactar borradores de correos electrónicos." icon={<EnvelopeIcon className="w-5 h-5 text-green-400" />} />
                            <ToolCheckbox tool="data_extractor" label="Extractor de Datos" description="Permite extraer información (ej. emails, teléfonos) de un texto." icon={<TableCellsIcon className="w-5 h-5 text-purple-400" />} />
                            <ToolCheckbox tool="printable_worksheet_creator" label="Creador de Fichas Imprimibles" description="Formatea las respuestas como documentos listos para imprimir." icon={<PrinterIcon className="w-5 h-5 text-indigo-400" />} />
                        </div>
                    </FormField>
                     <FormField label="Base de Conocimiento">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="p-6 border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer hover:border-blue-500 hover:bg-gray-700/50 transition-colors"
                        >
                            <PaperclipIcon className="w-8 h-8 mx-auto text-gray-500 mb-2"/>
                            <p className="text-blue-400 font-semibold">Haz clic para subir archivos</p>
                            <p className="text-xs text-gray-500 mt-1">Soportados: .txt, .md, .json</p>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept=".txt,.md,.json" className="hidden" />
                        </div>
                         {agent.knowledgeFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <h4 className="text-sm font-medium text-gray-400">Archivos cargados:</h4>
                                <ul className="max-h-32 overflow-y-auto space-y-2 pr-2">
                                    {agent.knowledgeFiles.map(file => (
                                        <li key={file.name} className="flex items-center justify-between p-2 bg-gray-700 rounded-md animate-focus-in">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <PaperclipIcon className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                                                <span className="truncate text-sm text-gray-300" title={file.name}>{file.name}</span>
                                            </div>
                                            <button type="button" onClick={() => removeFile(file.name)} className="p-1 text-gray-400 hover:text-red-400 rounded-full hover:bg-gray-600 flex-shrink-0"><TrashIcon className="w-4 h-4"/></button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </FormField>
                </form>
                <footer className="p-4 border-t border-gray-700 flex justify-end gap-3 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500">Cancelar</button>
                    <button type="submit" onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar Agente</button>
                </footer>
            </div>
        </div>
    );
};

export default AgentEditorModal;