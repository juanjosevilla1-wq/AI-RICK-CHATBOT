
import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, PaperclipIcon, MicrophoneIcon, TrashIcon, VideoIcon, AudioIcon, LoadingIcon, PlusIcon, CameraIcon } from './icons';
import { Attachment } from '../types';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  attachment: Attachment | null;
  setAttachment: (attachment: Attachment | null) => void;
  onOpenCamera: () => void;
  isLiveActive: boolean;
  isLiveConnecting: boolean;
  onToggleLiveMode: () => void;
  awaitingCreatorPassword: boolean;
  onToggleRickVisionMode: () => void;
}

const AttachmentPreview: React.FC<{ attachment: Attachment, onRemove: () => void }> = ({ attachment, onRemove }) => (
    <div className="absolute bottom-full left-0 right-0 p-2 bg-gray-800">
        <div className="max-w-4xl mx-auto bg-gray-700 rounded-lg p-2 flex items-center gap-3">
            {attachment.type.startsWith('image/') ? (
                <img src={attachment.data} alt={attachment.name} className="w-12 h-12 rounded object-cover"/>
            ) : (
                <div className="w-12 h-12 flex items-center justify-center bg-gray-600 rounded">
                    {attachment.type.startsWith('video/') ? (
                        <VideoIcon className="w-6 h-6 text-gray-400" />
                    ) : attachment.type.startsWith('audio/') ? (
                        <AudioIcon className="w-6 h-6 text-gray-400" />
                    ) : (
                        <PaperclipIcon className="w-6 h-6 text-gray-400" />
                    )}
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{attachment.name}</p>
                <p className="text-gray-400 text-xs">{attachment.type}</p>
            </div>
            <button onClick={onRemove} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-600">
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
    </div>
);

const ChatInput: React.FC<ChatInputProps> = ({ 
    onSendMessage, 
    isLoading, 
    attachment, 
    setAttachment,
    onOpenCamera,
    isLiveActive,
    isLiveConnecting,
    onToggleLiveMode,
    awaitingCreatorPassword,
    onToggleRickVisionMode
}) => {
  const [input, setInput] = useState('');
  const [placeholderMessage, setPlaceholderMessage] = useState('');
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && inputRef.current && !isLiveActive) {
      inputRef.current.focus();
    }
  }, [isLoading, isLiveActive]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) {
            setIsAttachmentMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || attachment || awaitingCreatorPassword) && !isLoading && !isLiveActive) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // 100MB limit to prevent browser crash/OOM when reading into base64 string
        const MAX_SIZE = 100 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            setPlaceholderMessage("El archivo es demasiado grande (>100MB). Usa archivos más pequeños.");
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const result = loadEvent.target?.result;
            if (typeof result === 'string') {
                setAttachment({
                    name: file.name,
                    type: file.type,
                    data: result,
                });
            } else {
                console.error("FileReader did not return a string result for the attachment.");
                setPlaceholderMessage("Error al cargar el archivo. Inténtalo de nuevo.");
            }
        };
        reader.onerror = (error) => {
            console.error("Error reading file:", reader.error);
            setPlaceholderMessage("No se pudo leer el archivo. Error de permisos o lectura.");
        };
        
        try {
            reader.readAsDataURL(file);
        } catch (err) {
            console.error("Crash prevented during file read:", err);
            setPlaceholderMessage("Error de memoria: El archivo es demasiado grande para este dispositivo.");
        }
    }
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAttachFileClick = () => {
    fileInputRef.current?.click();
    setIsAttachmentMenuOpen(false);
  };
  
  const handleTakePhotoClick = () => {
    onOpenCamera();
    setIsAttachmentMenuOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (placeholderMessage) {
      setPlaceholderMessage('');
    }
  };

  const defaultPlaceholder = isLiveActive
    ? "Conversando con AI Rick..."
    : isLiveConnecting
    ? "Conectando audio..."
    : awaitingCreatorPassword
    ? "Introduce la contraseña secreta..."
    : attachment
    ? attachment.type.startsWith('image/')
      ? "Describe cómo quieres editar la imagen..."
      : attachment.type.startsWith('video/')
      ? "Describe cómo quieres editar el video..."
      : "Añade un comentario sobre el archivo..."
    : "Pregúntale lo que sea a AI Rick...";
  
  const placeholderText = placeholderMessage || defaultPlaceholder;
  const isInputDisabled = isLoading || isLiveActive || isLiveConnecting;
  const isSubmitDisabled = isLoading || isLiveActive || isLiveConnecting || (!input.trim() && !attachment && !awaitingCreatorPassword);
  const isAttachmentButtonsDisabled = isInputDisabled || awaitingCreatorPassword;

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-900 relative">
      {attachment && <AttachmentPreview attachment={attachment} onRemove={() => setAttachment(null)} />}
      <div className="relative max-w-4xl mx-auto flex items-center gap-2">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*,audio/*,.pdf,.txt,.js,.py,.html,.css,.json,.md,.xml,.csv"/>
        
        <div className="relative flex gap-2">
            {/* Attachment Menu */}
            <div className="relative" ref={attachmentMenuRef}>
                {isAttachmentMenuOpen && (
                    <div className="absolute bottom-full mb-2 w-52 bg-gray-700 rounded-lg shadow-lg text-white animate-focus-in overflow-hidden z-20">
                        <ul className="py-1">
                            <li>
                                <button
                                    type="button"
                                    onClick={handleAttachFileClick}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-600 transition-colors"
                                    disabled={isAttachmentButtonsDisabled}
                                >
                                    <PaperclipIcon className="w-5 h-5 text-gray-400" />
                                    <span>Adjuntar archivo</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={handleTakePhotoClick}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-600 transition-colors"
                                    disabled={isAttachmentButtonsDisabled}
                                >
                                    <CameraIcon className="w-5 h-5 text-gray-400" />
                                    <span>Tomar una foto</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => setIsAttachmentMenuOpen(prev => !prev)}
                    disabled={isAttachmentButtonsDisabled}
                    className="p-2.5 rounded-full text-white bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors duration-300"
                    aria-label="Adjuntar archivo o tomar foto"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
        
        <div className="relative flex-grow">
            <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder={placeholderText}
                disabled={isInputDisabled}
                className={`w-full bg-gray-800 border border-gray-700 rounded-full py-3 pl-6 pr-28 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ${placeholderMessage ? 'placeholder-red-400' : ''}`}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                    type="button"
                    onClick={onToggleLiveMode}
                    disabled={isLoading || !!attachment || awaitingCreatorPassword}
                    className={`p-2.5 rounded-full transition-colors duration-300 ${
                      isLiveActive ? 'bg-red-600 text-white animate-pulse' : 
                      isLiveConnecting ? 'bg-yellow-600 text-white' : 
                      'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                    aria-label={isLiveActive ? "Detener conversación" : "Iniciar conversación por voz"}
                >
                    {isLiveConnecting ? <LoadingIcon className="w-5 h-5 animate-spin" /> : <MicrophoneIcon className="w-5 h-5" />}
                </button>
                <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className="p-2.5 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300"
                    aria-label="Enviar mensaje"
                >
                    <SendIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
