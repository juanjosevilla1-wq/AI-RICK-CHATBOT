
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Message, Model, ModelId, Attachment, Conversation, UserProfile, GroundingChunk, CustomAgent, AppSettings, EmotionalState, Reminder, AspectRatio } from './types';
import { createChat, generateImage, editImage, editVideo, startLiveConversation, createBlob, decodeAudioData, decode, generateConversationTitle, verifyCreatorPassword, generateSpeechFromText, buildSystemInstruction, determinePhi5Routing, extractAspectRatioFromPrompt } from './services/geminiService';
import { GoogleGenAI } from "@google/genai";
import type { LiveServerMessage, FunctionCall } from '@google/genai';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import ModelSelector from './components/ModelSelector';
import ConversationSidebar from './components/ConversationSidebar';
import SettingsModal from './components/SettingsModal';
import CameraModal from './components/CameraModal';
import RickLabsModal from './components/RickLabsModal';
import InteractiveAvatar from './components/InteractiveAvatar';
import { MenuIcon, PlusIcon, PowerIcon } from './components/icons';
import RickVisionModal from './components/RickVisionModal';

const MODELS: Model[] = [
  { id: 'fast', name: 'Fast (Phi-2)' },
  { id: 'context', name: 'Add Context (Phi-3)' },
  { id: 'code', name: 'Phi-4 Code' },
  { id: 'smart', name: 'Smart (Phi-4) 🧠' },
  { id: 'phi5', name: 'Phi-5🚀', badge: 'NUEVO' },
  { id: 'search', name: 'Search (Phi-4mini)'},
];

const WELCOME_MESSAGES = (name: string = 'Usuario') => [
  { title: `¡Hola, ${name}!`, text: "Bienvenido/a a tu espacio de trabajo inteligente. Estoy listo para ayudarte a alcanzar tus objetivos. ¿Por dónde empezamos?" },
  { title: `Un gusto tenerte aquí, ${name}`, text: "Tu asistente personal está en línea. ¿Tienes alguna pregunta o necesitas ayuda con alguna tarea?" },
  { title: `Bienvenido/a, ${name}`, text: "Estoy aquí para optimizar tu flujo de trabajo. No dudes en consultarme cualquier cosa que necesites." },
  { title: `¡Qué bueno verte, ${name}!`, text: "Listo para una sesión productiva. ¿Qué ideas tienes en mente hoy?" },
  { title: `Saludos cordiales, ${name}`, text: "Estoy a tu disposición. Puedes pedirme que genere un texto, cree una imagen o te ayude a investigar un tema." },
  { title: `Hola de nuevo, ${name}`, text: "Continuemos donde lo dejamos. ¿En qué puedo asistirte para que tu día sea más eficiente?" },
  { title: `¡Empecemos, ${name}!`, text: "La innovación comienza con una pregunta. ¿Cuál es la tuya?" },
  { title: `Bienvenido/a a AI Rick`, text: "Tu compañero digital para la productividad y la creatividad. ¿Qué te gustaría explorar hoy?" },
  { title: `Listo para la acción, ${name}`, text: "Estoy preparado para procesar tus solicitudes. Desde análisis complejos hasta la creación de contenido, estoy para servirte." },
  { title: `¡Un placer asistirte, ${name}!`, text: "¿Cómo puedo contribuir a tu éxito hoy? Estoy listo para escuchar." },
];

const conversationalImagePromptRegex = /(?=.*\b(genera|crea|dibuja|haz|imagina|pinta|quiero|necesito|dame|muéstrame|puedes)\b)(?=.*\b(imagen|foto|dibujo|ilustración|pintura)\s+de\b)/i;
const directImagePromptRegex = /^\s*(un|una|el|la|los|las)\s+(imagen|foto|dibujo|ilustración|pintura)\s+de/i;
const editPromptRegex = /^(añade|agrega|cambia|hazlo|quita|modifica|ponle|elimina|dale|pinta|coloca|arregla|corrige|sustituye|transforma|mejora|haz que)/i;
const searchExecutionRegex = /^(comienza la búsqueda|buscar|empieza)/i;

const MEMORY_COMMANDS = [
    "recuerda esto:",
    "guarda esto:",
    "memoriza:",
    "ten en cuenta que:",
    "aprende esto:",
    "mi memoria:" // for direct recall/update
];

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result as string;
            resolve(base64data.substring(base64data.indexOf(',') + 1));
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLabsOpen, setIsLabsOpen] = useState(false);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: 'Tú', picture: null });
  
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const defaultSettings: AppSettings = { saveHistory: true, showAvatar: false, currentEmotionalState: EmotionalState.IDLE, enableMemory: false };
    try {
      const storedSettings = localStorage.getItem('ai-rick-settings');
      return storedSettings ? { ...defaultSettings, ...JSON.parse(storedSettings) } : defaultSettings;
    } catch (e) {
      console.error("Failed to load settings from localStorage", e);
      return defaultSettings;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<ModelId>('phi5');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState<{title: string; text: string} | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const previousModelForAttachment = useRef<ModelId | null>(null);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');

  // Avatar position state, lifted from InteractiveAvatar
  const initialAvatarX = useMemo(() => window.innerWidth - 180, []);
  const initialAvatarY = useMemo(() => window.innerHeight - 150, []);
  const [avatarPosition, setAvatarPosition] = useState({ x: initialAvatarX, y: initialAvatarY });

  // Creator Verification State
  const [isCreatorVerified, setIsCreatorVerified] = useState(false);
  const [awaitingCreatorPassword, setAwaitingCreatorPassword] = useState(false);
  
  // Rick's Labs State
  const [agents, setAgents] = useState<CustomAgent[]>([]);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const activeAgent = useMemo(() => agents.find(a => a.id === activeAgentId), [agents, activeAgentId]);

  // User Memory State
  const [userMemories, setUserMemories] = useState<{ [userName: string]: string[] }>({}); // Stores memory per user name
  const currentUserMemory = useMemo(() => userMemories[userProfile.name] || [], [userMemories, userProfile.name]);
  
  // Reminders State
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const scheduledTimeouts = useRef<Map<string, number>>(new Map());

  // Live Conversation State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isLiveConnecting, setIsLiveConnecting] = useState(false);
  const liveSessionPromise = useRef<Promise<any> | null>(null);
  const inputAudioContext = useRef<AudioContext | null>(null);
  const outputAudioContext = useRef<AudioContext | null>(null);
  const microphoneStream = useRef<MediaStream | null>(null);
  const scriptProcessor = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSource = useRef<MediaStreamAudioSourceNode | null>(null);
  const outputSources = useRef<Set<AudioBufferSourceNode>>(new Set()); // For both TTS and Live audio
  const nextAudioStartTime = useRef(0);
  
  // Rick Vision State
  const [isRickVisionModalOpen, setIsRickVisionModalOpen] = useState(false);
  const [rickVisionConnecting, setRickVisionConnecting] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const visionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  useEffect(() => {
      if (!visionCanvasRef.current) {
          visionCanvasRef.current = document.createElement('canvas');
      }
  }, []);

  // Derived state for messages
  const messages = useMemo(() => {
    return conversations.find(c => c.id === activeConversationId)?.messages ?? [];
  }, [conversations, activeConversationId]);
  
  // New derived state for conditional UI rendering
  const showAvatarOnlyUI = appSettings.showAvatar && !isLiveActive; // Don't show avatar-only UI if live conversation is active
  
  // Derived state for live transcriptions, passed to RickVisionModal
  const liveTranscriptions = useMemo(() => {
    if (!isLiveActive) return { user: '', model: '' };
    const lastTwo = messages.slice(-2);
    const lastUserMsg = lastTwo.find(m => m.role === 'user' && m.isPartial);
    const lastModelMsg = lastTwo.find(m => m.role === 'model' && m.isPartial);
    return {
        user: lastUserMsg?.content ?? '',
        model: lastModelMsg?.content ?? '',
    };
  }, [messages, isLiveActive]);

  const scheduleNotification = useCallback(async (reminder: Reminder) => {
    const eventTime = new Date(`${reminder.date}T${reminder.time}`).getTime();
    const now = Date.now();
    const delay = eventTime - now;

    if (delay <= 0) return;

    // Modern Method: Service Worker with TimestampTrigger
    if ('serviceWorker' in navigator && 'Notification' in window && (window as any).TimestampTrigger) {
        try {
            const registration = await navigator.serviceWorker.ready;
            const existingNotifications = await registration.getNotifications({ tag: reminder.id });
            if (existingNotifications.length > 0) {
                existingNotifications.forEach(notification => notification.close());
            }

            const TimestampTrigger = (window as any).TimestampTrigger;
            const trigger = new TimestampTrigger(eventTime);

            await registration.showNotification('Recordatorio de AI Rick', {
                tag: reminder.id,
                body: reminder.title,
                icon: '/logo.png',
                showTrigger: trigger,
            } as any);
            console.log(`Notification for "${reminder.title}" scheduled via Service Worker.`);
            return;
        } catch (e) {
            console.warn('Failed to schedule with Service Worker, falling back to setTimeout.', e);
        }
    }

    // Fallback Method: setTimeout
    if (scheduledTimeouts.current.has(reminder.id)) {
        const timeoutId = scheduledTimeouts.current.get(reminder.id);
        if (timeoutId !== undefined) clearTimeout(timeoutId);
    }

    const timeoutId = window.setTimeout(() => {
        if (Notification.permission === 'granted') {
             new Notification('Recordatorio de AI Rick', {
                body: reminder.title,
                icon: '/logo.png',
                tag: reminder.id,
             });
        }
      setReminders(prev => prev.map(r => r.id === reminder.id ? { ...r, notified: true } : r));
      scheduledTimeouts.current.delete(reminder.id);
    }, delay);

    scheduledTimeouts.current.set(reminder.id, timeoutId);
  }, [setReminders]);


  // Service Worker Registration
  useEffect(() => {
    const registerServiceWorker = () => {
      if ('serviceWorker' in navigator && window.isSecureContext) {
        const swUrl = new URL('/sw.js', window.location.origin).href;
        navigator.serviceWorker.register(swUrl)
          .then(registration => {
            console.log('Service Worker for notifications registered successfully.');
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
          });
      }
    };

    window.addEventListener('load', registerServiceWorker);
    return () => {
      window.removeEventListener('load', registerServiceWorker);
    };
  }, []);

  // Load from localStorage on app start
  useEffect(() => {
    let loadedConversations: Conversation[] = [];
    try {
      const storedProfile = localStorage.getItem('ai-rick-user-profile');
      const storedAgents = localStorage.getItem('ai-rick-agents');
      const storedActiveAgentId = localStorage.getItem('ai-rick-active-agent-id');
      const storedMemories = localStorage.getItem('ai-rick-user-memories');
      const storedReminders = localStorage.getItem('ai-rick-reminders');

      if (storedMemories) setUserMemories(JSON.parse(storedMemories));
      if (storedReminders) {
        const loadedReminders: Reminder[] = JSON.parse(storedReminders);
        setReminders(loadedReminders);
        loadedReminders.forEach(r => {
            const eventTime = new Date(`${r.date}T${r.time}`).getTime();
            if (!r.notified && eventTime > Date.now()) {
                scheduleNotification(r);
            }
        });
      }
      
      if (appSettings.saveHistory) {
        const storedConversations = localStorage.getItem('ai-rick-conversations');
        if (storedConversations) loadedConversations = JSON.parse(storedConversations);
      }
      
      if (storedProfile) setUserProfile(JSON.parse(storedProfile));
      if (storedAgents) setAgents(JSON.parse(storedAgents));
      if (storedActiveAgentId) setActiveAgentId(JSON.parse(storedActiveAgentId));

    } catch (e) {
      console.error("Failed to load from localStorage", e);
    }

    const newId = Date.now().toString();
    const newConversation: Conversation = { id: newId, title: 'Nueva Conversación', messages: [], modelId: 'phi5' };
    setConversations([newConversation, ...loadedConversations]);
    setActiveConversationId(newId);
  }, []);

  useEffect(() => {
    if (!showAvatarOnlyUI) {
      const userDisplayName = userProfile.name === 'Tú' ? undefined : userProfile.name;
      const randomMessage = WELCOME_MESSAGES(userDisplayName)[Math.floor(Math.random() * WELCOME_MESSAGES(userDisplayName).length)];
      setWelcomeMessage(randomMessage);
    } else {
      setWelcomeMessage(null);
    }
  }, [userProfile.name, showAvatarOnlyUI]);

  // Save to localStorage
  useEffect(() => {
    if (!appSettings.saveHistory) return;
    try {
      const conversationsToSave = conversations
        .filter(c => c.messages.length > 0 || c.id === activeConversationId)
        .map(convo => ({
            ...convo,
            messages: convo.messages.map(msg => {
                const { attachments, imageUrl, ...restOfMsg } = msg;
                return restOfMsg;
            })
        }));
      localStorage.setItem('ai-rick-conversations', JSON.stringify(conversationsToSave));
    } catch (e) { console.error("Failed to save conversations to localStorage", e); }
  }, [conversations, activeConversationId, appSettings.saveHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('ai-rick-user-profile', JSON.stringify(userProfile));
      localStorage.setItem('ai-rick-agents', JSON.stringify(agents));
      localStorage.setItem('ai-rick-active-agent-id', JSON.stringify(activeAgentId));
      localStorage.setItem('ai-rick-settings', JSON.stringify(appSettings));
      localStorage.setItem('ai-rick-user-memories', JSON.stringify(userMemories));
      const remindersToSave = reminders.filter(r => new Date(`${r.date}T${r.time}`).getTime() > Date.now());
      localStorage.setItem('ai-rick-reminders', JSON.stringify(remindersToSave));
    } catch (e) { console.error("Failed to save app state to localStorage", e); }
  }, [userProfile, agents, activeAgentId, appSettings, userMemories, reminders]);
  
  useEffect(() => {
    if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const activeConvo = conversations.find(c => c.id === activeConversationId);
    if (!activeAgentId) {
        const modelForConvo = activeConvo?.modelId || 'fast';
        if (currentModel !== modelForConvo) setCurrentModel(modelForConvo);
    }
    if (previousModelForAttachment.current) previousModelForAttachment.current = null;
    setIsCreatorVerified(false); 
    setAwaitingCreatorPassword(false);
  }, [activeConversationId, conversations, activeAgentId]);

  useEffect(() => {
    const isMedia = attachment?.type.startsWith('video/') || attachment?.type.startsWith('audio/');
    if (!activeAgentId) {
        if (isMedia) {
            if (currentModel !== 'smart' && currentModel !== 'code') {
                previousModelForAttachment.current = currentModel;
                setCurrentModel('smart');
            }
        } else {
            if (previousModelForAttachment.current) {
                setCurrentModel(previousModelForAttachment.current);
                previousModelForAttachment.current = null;
            }
        }
    }
  }, [attachment, currentModel, activeAgentId]);
  
  const handleModelChange = (modelId: ModelId) => {
    if(activeAgentId) setActiveAgentId(null);
    setCurrentModel(modelId);
    if (activeConversationId) {
        setConversations(convos => convos.map(c => 
            c.id === activeConversationId ? { ...c, modelId: modelId, agentId: undefined } : c
        ));
    }
    previousModelForAttachment.current = null;
  };

  const handleNewChat = () => {
    if (isLiveActive) {
        liveSessionPromise.current?.then(session => session.close());
        cleanupLiveSession();
        cleanupRickVisionSession();
    }
    const userDisplayName = userProfile.name === 'Tú' ? undefined : userProfile.name;
    const randomMessage = WELCOME_MESSAGES(userDisplayName)[Math.floor(Math.random() * WELCOME_MESSAGES(userDisplayName).length)];
    if (!showAvatarOnlyUI) {
      setWelcomeMessage(randomMessage);
    } else {
      setWelcomeMessage(null);
    }
    
    const newId = Date.now().toString();
    const newConversation: Conversation = { 
        id: newId, 
        title: activeAgent ? `Chat con ${activeAgent.name}` : 'Nueva Conversación', 
        messages: [], 
        modelId: activeAgent ? undefined : currentModel,
        agentId: activeAgentId ?? undefined
    };
    setConversations(convos => [newConversation, ...convos]);
    setActiveConversationId(newId);
    setAttachment(null);
    setError(null);
    setIsSidebarOpen(false);
    setIsCreatorVerified(false);
    setAwaitingCreatorPassword(false);
    setAspectRatio('1:1'); // Reset aspect ratio for new chat
  };
  
  const handleSelectConversation = (id: string) => {
    if (isLiveActive) {
        liveSessionPromise.current?.then(session => session.close());
        cleanupLiveSession();
        cleanupRickVisionSession();
    }
    const selectedConvo = conversations.find(c => c.id === id);
    if(selectedConvo?.agentId) {
        setActiveAgentId(selectedConvo.agentId);
    } else if (activeAgentId) {
        setActiveAgentId(null);
    }
    setActiveConversationId(id);
    setIsSidebarOpen(false);
    setIsCreatorVerified(false);
    setAwaitingCreatorPassword(false);
  };

  const handleDeleteConversation = (id: string) => {
    const remainingConversations = conversations.filter(c => c.id !== id);
    setConversations(remainingConversations);
    if (activeConversationId === id) {
        if (remainingConversations.length > 0) {
            handleSelectConversation(remainingConversations[0].id);
        } else {
            handleNewChat();
        }
    }
  };

  const handleClearHistory = () => {
    setConversations([]);
    if (appSettings.saveHistory) {
      localStorage.removeItem('ai-rick-conversations');
    }
    const newId = Date.now().toString();
    const newConversation: Conversation = { id: newId, title: 'Nueva Conversación', messages: [], modelId: 'fast' };
    setConversations([newConversation]);
    setActiveConversationId(newId);
    const userDisplayName = userProfile.name === 'Tú' ? undefined : userProfile.name;
    const randomMessage = WELCOME_MESSAGES(userDisplayName)[Math.floor(Math.random() * WELCOME_MESSAGES(userDisplayName).length)];
    if (!showAvatarOnlyUI) {
      setWelcomeMessage(randomMessage);
    } else {
      setWelcomeMessage(null);
    }
    setIsSettingsOpen(false);
    setIsCreatorVerified(false);
    setAwaitingCreatorPassword(false);
  };

  const handleFactoryReset = () => {
    localStorage.removeItem('ai-rick-conversations');
    localStorage.removeItem('ai-rick-user-profile');
    localStorage.removeItem('ai-rick-agents');
    localStorage.removeItem('ai-rick-active-agent-id');
    localStorage.removeItem('ai-rick-settings');
    localStorage.removeItem('ai-rick-user-memories');
    localStorage.removeItem('ai-rick-reminders');
    window.location.reload();
  };

  const handleSettingsChange = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    if (!newSettings.saveHistory) {
      localStorage.removeItem('ai-rick-conversations');
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
        try {
            const registration = await navigator.serviceWorker.ready;
            const notifications = await registration.getNotifications({ tag: reminderId });
            notifications.forEach(notification => notification.close());
        } catch (e) {
            console.warn('Could not query/cancel scheduled notifications.', e);
        }
    }

    if (scheduledTimeouts.current.has(reminderId)) {
        const timeoutId = scheduledTimeouts.current.get(reminderId);
        if (timeoutId !== undefined) clearTimeout(timeoutId);
        scheduledTimeouts.current.delete(reminderId);
    }
    setReminders(prev => prev.filter(r => r.id !== reminderId));
  };
  
  const playAudioResponse = useCallback(async (base64Audio: string) => {
    if (!appSettings.showAvatar) return;

    if (!outputAudioContext.current) {
        outputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const outCtx = outputAudioContext.current;

    outputSources.current.forEach(source => { try { source.stop(); } catch(e) {} });
    outputSources.current.clear();
    nextAudioStartTime.current = outCtx.currentTime;

    try {
        const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
        const source = outCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outCtx.destination);
        
        source.addEventListener('ended', () => {
            outputSources.current.delete(source);
            if (outputSources.current.size === 0) {
                setIsModelSpeaking(false);
            }
        });
        source.start(nextAudioStartTime.current);
        nextAudioStartTime.current += audioBuffer.duration;
        outputSources.current.add(source);
        setIsModelSpeaking(true);
    } catch (error) {
        console.error("Error playing audio response:", error);
        setIsModelSpeaking(false);
    }
  }, [setIsModelSpeaking, appSettings.showAvatar]);

  const playLiveAudioChunk = useCallback(async (base64Audio: string) => {
    if (!outputAudioContext.current) {
        outputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const outCtx = outputAudioContext.current;

    nextAudioStartTime.current = Math.max(nextAudioStartTime.current, outCtx.currentTime);

    try {
        const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
        const source = outCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outCtx.destination);
        
        source.addEventListener('ended', () => {
            outputSources.current.delete(source);
            if (outputSources.current.size === 0) {
                setIsModelSpeaking(false);
            }
        });
        source.start(nextAudioStartTime.current);
        nextAudioStartTime.current += audioBuffer.duration;
        outputSources.current.add(source);
        setIsModelSpeaking(true);
    } catch (error) {
        console.error("Error playing live audio chunk:", error);
        setIsModelSpeaking(false);
    }
  }, [setIsModelSpeaking]);

  const cleanupLiveSession = useCallback(() => {
    microphoneStream.current?.getTracks().forEach(track => track.stop());
    microphoneStream.current = null;
    scriptProcessor.current?.disconnect();
    scriptProcessor.current = null;
    mediaStreamSource.current?.disconnect();
    mediaStreamSource.current = null;
    if (inputAudioContext.current?.state !== 'closed') inputAudioContext.current?.close().catch(console.error);

    inputAudioContext.current = null;
    setIsLiveActive(false);
    setIsLiveConnecting(false);
    liveSessionPromise.current = null;
    outputSources.current.forEach(source => { try { source.stop(); } catch(e) {} });
    outputSources.current.clear();
    nextAudioStartTime.current = 0;
    setIsModelSpeaking(false);

    if (activeConversationId) {
        setConversations(convos => convos.map(c => {
            if (c.id !== activeConversationId) return c;
            const filteredMessages = c.messages.filter(m => !(m.isPartial && m.content.trim() === ''));
            return { ...c, messages: filteredMessages.map(m => ({ ...m, isPartial: false })) };
        }));
    }
  }, [activeConversationId, setIsModelSpeaking]);
  
  const cleanupRickVisionSession = useCallback(() => {
    cameraStream?.getTracks().forEach(track => track.stop());
    setCameraStream(null);
    microphoneStream.current?.getTracks().forEach(track => track.stop());
    microphoneStream.current = null;
    
    if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
    }

    scriptProcessor.current?.disconnect();
    scriptProcessor.current = null;
    mediaStreamSource.current?.disconnect();
    mediaStreamSource.current = null;
    if (inputAudioContext.current?.state !== 'closed') inputAudioContext.current?.close().catch(console.error);
    inputAudioContext.current = null;
    
    setIsLiveActive(false);
    setRickVisionConnecting(false);
    setIsRickVisionModalOpen(false);
    liveSessionPromise.current = null;
    outputSources.current.forEach(source => { try { source.stop(); } catch(e) {} });
    outputSources.current.clear();
    nextAudioStartTime.current = 0;
    setIsModelSpeaking(false);
    
    if (activeConversationId) {
        setConversations(convos => convos.map(c => {
            if (c.id !== activeConversationId) return c;
            const filteredMessages = c.messages.filter(m => !(m.isPartial && m.content.trim() === ''));
            return { ...c, messages: filteredMessages.map(m => ({ ...m, isPartial: false })) };
        }));
    }
  }, [cameraStream, activeConversationId]);

  const toggleLiveMode = useCallback(async () => {
    if (isLiveActive || isLiveConnecting) {
      liveSessionPromise.current?.then(session => session.close());
      cleanupLiveSession();
      return;
    }

    outputSources.current.forEach(source => { try { source.stop(); } catch(e) {} });
    outputSources.current.clear();
    setIsModelSpeaking(false);
    
    setIsLiveConnecting(true);
    setError(null);
    
    let convoId = activeConversationId;
    if (!convoId || messages.length > 0) {
        convoId = Date.now().toString();
        const newConversation: Conversation = { id: convoId, title: 'Conversación en vivo', messages: [], modelId: 'fast' };
        setConversations(convos => [newConversation, ...convos]);
        setActiveConversationId(convoId);
    }

    setConversations(convos => convos.map(c => c.id === convoId ? { ...c, messages: [{ role: 'user', content: '', isPartial: true }, { role: 'model', content: '', isPartial: true }] } : c));

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphoneStream.current = stream;
        inputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        const callbacks = {
            onopen: () => {
              if (!inputAudioContext.current || !microphoneStream.current) return;
              mediaStreamSource.current = inputAudioContext.current.createMediaStreamSource(microphoneStream.current);
              scriptProcessor.current = inputAudioContext.current.createScriptProcessor(4096, 1, 1);
              scriptProcessor.current.onaudioprocess = (event: AudioProcessingEvent) => {
                  liveSessionPromise.current?.then((session) => session.sendRealtimeInput({ media: createBlob(event.inputBuffer.getChannelData(0)) }));
              };
              mediaStreamSource.current.connect(scriptProcessor.current);
              scriptProcessor.current.connect(inputAudioContext.current.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
                setConversations(convos => convos.map(c => {
                    if (c.id !== convoId) return c;
                    const newMessages = [...c.messages];
                    let lastUserMsgContent = newMessages[newMessages.length - 2]?.content || '';
                    let lastModelMsgContent = newMessages[newMessages.length - 1]?.content || '';

                    if (message.serverContent?.inputTranscription) {
                        lastUserMsgContent = message.serverContent.inputTranscription.text;
                    }
                    if (message.serverContent?.outputTranscription) {
                        lastModelMsgContent = message.serverContent.outputTranscription.text;
                    }
                    
                    const lastUserMsgIndex = newMessages.length - 2;
                    const lastModelMsgIndex = newMessages.length - 1;

                    if (lastUserMsgIndex >= 0) {
                      newMessages[lastUserMsgIndex] = { ...newMessages[lastUserMsgIndex], content: lastUserMsgContent };
                    }

                    if (lastModelMsgIndex >= 0) {
                      newMessages[lastModelMsgIndex] = { ...newMessages[lastModelMsgIndex], content: lastModelMsgContent };
                    }

                    if (message.serverContent?.turnComplete) {
                        if (newMessages[lastUserMsgIndex]) newMessages[lastUserMsgIndex].isPartial = false;
                        if (newMessages[lastModelMsgIndex]) newMessages[lastModelMsgIndex].isPartial = false;
                        
                        const filteredMessages = newMessages.filter(m => !(m.isPartial && m.content.trim() === ''));

                        if (lastUserMsgContent.trim().length > 0 || lastModelMsgContent.trim().length > 0) {
                            return { ...c, messages: [...filteredMessages, { role: 'user', content: '', isPartial: true }, { role: 'model', content: '', isPartial: true }] };
                        } else {
                            return { ...c, messages: filteredMessages };
                        }
                    }
                    return { ...c, messages: newMessages };
                }));

                const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                if (base64Audio) {
                    await playLiveAudioChunk(base64Audio);
                }

                const interrupted = message.serverContent?.interrupted;
                if (interrupted) {
                    for (const source of outputSources.current.values()) {
                        source.stop();
                    }
                    outputSources.current.clear();
                    nextAudioStartTime.current = 0;
                    setIsModelSpeaking(false);
                }
            },
            onerror: (e: ErrorEvent) => {
                console.error("Live session error:", e);
                setError("Se perdió la conexión de voz. Inténtalo de nuevo.");
                cleanupLiveSession();
            },
            onclose: (e: CloseEvent) => { cleanupLiveSession(); },
        };
        
        liveSessionPromise.current = startLiveConversation(
            callbacks,
            userProfile.name,
            isCreatorVerified,
            appSettings.enableMemory,
            currentUserMemory 
        );
        await liveSessionPromise.current;
        setIsLiveActive(true);
    } catch (err) {
        console.error("Failed to start live session", err);
        setError("No se pudo iniciar el micrófono. Asegúrate de dar permiso.");
        cleanupLiveSession();
    } finally {
        setIsLiveConnecting(false);
    }
  }, [isLiveActive, isLiveConnecting, cleanupLiveSession, messages.length, userProfile.name, isCreatorVerified, appSettings.enableMemory, currentUserMemory, playLiveAudioChunk]);
  
  const toggleRickVisionMode = useCallback(async () => {
    if (isLiveActive || rickVisionConnecting) {
        liveSessionPromise.current?.then(session => session.close());
        cleanupRickVisionSession();
        return;
    }
    
    outputSources.current.forEach(source => { try { source.stop(); } catch(e) {} });
    outputSources.current.clear();
    setIsModelSpeaking(false);
    
    setRickVisionConnecting(true);
    setError(null);
    
    let convoId = activeConversationId;
    if (!convoId || messages.length > 0) {
        convoId = Date.now().toString();
        const newConversation: Conversation = { id: convoId, title: 'Rick Visión', messages: [], modelId: 'fast' };
        setConversations(convos => [newConversation, ...convos]);
        setActiveConversationId(convoId);
    }
    setConversations(convos => convos.map(c => c.id === convoId ? { ...c, messages: [{ role: 'user', content: '', isPartial: true }, { role: 'model', content: '', isPartial: true }] } : c));

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        microphoneStream.current = new MediaStream([stream.getAudioTracks()[0]]);
        setCameraStream(new MediaStream([stream.getVideoTracks()[0]]));
        
        inputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        setIsRickVisionModalOpen(true);

        const callbacks = {
            onopen: () => {
                if (!inputAudioContext.current || !microphoneStream.current) return;
                mediaStreamSource.current = inputAudioContext.current.createMediaStreamSource(microphoneStream.current);
                scriptProcessor.current = inputAudioContext.current.createScriptProcessor(4096, 1, 1);
                scriptProcessor.current.onaudioprocess = (event: AudioProcessingEvent) => {
                    liveSessionPromise.current?.then((session) => session.sendRealtimeInput({ media: createBlob(event.inputBuffer.getChannelData(0)) }));
                };
                mediaStreamSource.current.connect(scriptProcessor.current);
                scriptProcessor.current.connect(inputAudioContext.current.destination);

                const videoEl = document.createElement('video');
                videoEl.srcObject = stream;
                videoEl.muted = true;
                videoEl.play();
                videoEl.onloadedmetadata = () => {
                    if (!visionCanvasRef.current) return;
                    const canvasEl = visionCanvasRef.current;
                    const ctx = canvasEl.getContext('2d');
                    if (!ctx) return;
                    
                    frameIntervalRef.current = window.setInterval(() => {
                        canvasEl.width = videoEl.videoWidth;
                        canvasEl.height = videoEl.videoHeight;
                        ctx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight);
                        canvasEl.toBlob(
                            async (blob) => {
                                if (blob) {
                                    const base64Data = await blobToBase64(blob);
                                    liveSessionPromise.current?.then((session) => {
                                        session.sendRealtimeInput({ media: { data: base64Data, mimeType: 'image/jpeg' } });
                                    });
                                }
                            }, 'image/jpeg', 0.7 );
                    }, 500);
                };
            },
            onmessage: async (message: LiveServerMessage) => { 
                setConversations(convos => convos.map(c => {
                    if (c.id !== convoId) return c;
                    const newMessages = [...c.messages];
                    let lastUserMsgContent = newMessages[newMessages.length - 2]?.content || '';
                    let lastModelMsgContent = newMessages[newMessages.length - 1]?.content || '';

                    if (message.serverContent?.inputTranscription) lastUserMsgContent = message.serverContent.inputTranscription.text;
                    if (message.serverContent?.outputTranscription) lastModelMsgContent = message.serverContent.outputTranscription.text;
                    
                    const lastUserMsgIndex = newMessages.length - 2;
                    const lastModelMsgIndex = newMessages.length - 1;

                    if (lastUserMsgIndex >= 0) newMessages[lastUserMsgIndex] = { ...newMessages[lastUserMsgIndex], content: lastUserMsgContent };
                    if (lastModelMsgIndex >= 0) newMessages[lastModelMsgIndex] = { ...newMessages[lastModelMsgIndex], content: lastModelMsgContent };

                    if (message.serverContent?.turnComplete) {
                        if (newMessages[lastUserMsgIndex]) newMessages[lastUserMsgIndex].isPartial = false;
                        if (newMessages[lastModelMsgIndex]) newMessages[lastModelMsgIndex].isPartial = false;
                        
                        const filtered = newMessages.filter(m => !(m.isPartial && m.content.trim() === ''));

                        if (lastUserMsgContent.trim().length > 0 || lastModelMsgContent.trim().length > 0) {
                            return { ...c, messages: [...filtered, { role: 'user', content: '', isPartial: true }, { role: 'model', content: '', isPartial: true }] };
                        }
                        return { ...c, messages: filtered };
                    }
                    return { ...c, messages: newMessages };
                }));

                const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                if (base64Audio) await playLiveAudioChunk(base64Audio);

                if (message.serverContent?.interrupted) {
                    outputSources.current.forEach(s => s.stop());
                    outputSources.current.clear();
                    nextAudioStartTime.current = 0;
                    setIsModelSpeaking(false);
                }
            },
            onerror: (e: ErrorEvent) => {
                console.error("Rick Vision session error:", e);
                setError("Se perdió la conexión de Rick Visión. Inténtalo de nuevo.");
                cleanupRickVisionSession();
            },
            onclose: (e: CloseEvent) => { cleanupRickVisionSession(); },
        };
        
        liveSessionPromise.current = startLiveConversation(callbacks, userProfile.name, isCreatorVerified, appSettings.enableMemory, currentUserMemory);
        await liveSessionPromise.current;
        setIsLiveActive(true);
    } catch (err) {
        console.error("Failed to start Rick Vision session", err);
        setError("No se pudo iniciar la cámara o el micrófono. Asegúrate de dar los permisos necesarios.");
        cleanupRickVisionSession();
    } finally {
        setRickVisionConnecting(false);
        setIsLiveConnecting(false);
    }

  }, [isLiveActive, rickVisionConnecting, cleanupRickVisionSession, playLiveAudioChunk, userProfile.name, isCreatorVerified, appSettings.enableMemory, currentUserMemory, activeConversationId, messages.length]);

  const generateTitleForConversation = useCallback(async (userInput: string, convoId: string) => {
    if (activeAgent) return;
    const newTitle = await generateConversationTitle(userInput);
    setConversations(convos => convos.map(c => c.id === convoId ? { ...c, title: newTitle } : c));
  }, [activeAgent]);

  const requestNotificationPermission = async () => {
    if (!window.isSecureContext) {
        setError("Las notificaciones no funcionan en sitios no seguros (HTTP). Se requiere HTTPS.");
        return false;
    }

    if (!('Notification' in window)) {
        setError("Este navegador no soporta notificaciones de escritorio.");
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            return true;
        }
    }
    return false;
  };

  const handleSendMessage = useCallback(async (userInput: string, userName: string) => {
    setError(null);
    setIsLoading(true);
    setProcessingMessage(null);
    setAttachment(null);
    setIsModelSpeaking(false);

    const currentUserNameLower = userName.toLowerCase();
    const isNico = currentUserNameLower === 'nico';
    const creatorKeywords = ['creador', 'nico, el que te creó', 'mi creador'];
    const userIdentifiesAsCreator = isNico && creatorKeywords.some(keyword => userInput.toLowerCase().includes(keyword));

    let currentConvoId = activeConversationId;
    if (!currentConvoId) {
        currentConvoId = Date.now().toString();
        const newConvo: Conversation = { id: currentConvoId, title: 'Nueva Conversación', messages: [], modelId: currentModel, agentId: activeAgentId ?? undefined };
        setConversations(convos => [newConvo, ...convos]);
        setActiveConversationId(currentConvoId);
    }

    const messagesBeforeSending = conversations.find(c => c.id === currentConvoId)?.messages ?? [];
    const isFirstMessage = messagesBeforeSending.length === 0;

    if (isNico && awaitingCreatorPassword) {
        const isCorrectPassword = await verifyCreatorPassword(userInput);
        const userPasswordMessage: Message = { role: 'user', content: "Contraseña: " + (userInput.length > 0 ? "********" : "[vacía]") };
        
        if (isCorrectPassword) {
            setIsCreatorVerified(true);
            setAwaitingCreatorPassword(false);
            const modelResponse = `¡Verificación exitosa, Maestro Nico! Es un honor tenerte de vuelta. ¿En qué puedo servirte, mi creador?`;
            
            setConversations(convos => convos.map(c => c.id === currentConvoId ? { 
                ...c, 
                messages: [...c.messages, userPasswordMessage, { role: 'model', content: modelResponse, isPartial: false }] 
            } : c));
            
            if (appSettings.showAvatar && modelResponse.trim().length > 0) {
              await playAudioResponse(await generateSpeechFromText(modelResponse));
            }
            setIsLoading(false);
            setProcessingMessage(null);
            return;
        } else {
            const modelResponse = "Contraseña incorrecta, impostor. Inténtalo de nuevo, o la realidad se desintegrará (probablemente no, pero te lo perderías).";
            
            setConversations(convos => convos.map(c => c.id === currentConvoId ? { 
                ...c, 
                messages: [...c.messages, userPasswordMessage, { role: 'model', content: modelResponse, isPartial: false }] 
            } : c));
            
            if (appSettings.showAvatar && modelResponse.trim().length > 0) {
              await playAudioResponse(await generateSpeechFromText(modelResponse));
            }
            setIsLoading(false);
            setProcessingMessage(null);
            return;
        }
    }
    
    if (userIdentifiesAsCreator && !isCreatorVerified && !awaitingCreatorPassword) {
        setAwaitingCreatorPassword(true);
        const userGreetingMessage: Message = { role: 'user', content: userInput };
        const modelPasswordRequest = "¡Alto ahí! ¿Eres tú, Nico? Demuéstrame que eres tú con la contraseña secreta.";
        const modelPasswordRequestMessage: Message = { role: 'model', content: modelPasswordRequest };
        
        setConversations(convos => convos.map(c => c.id === currentConvoId ? { ...c, messages: [...c.messages, userGreetingMessage, modelPasswordRequestMessage] } : c));
        
        if (appSettings.showAvatar && modelPasswordRequest.trim().length > 0) {
          await playAudioResponse(await generateSpeechFromText(modelPasswordRequest));
        }
        setIsLoading(false);
        setProcessingMessage(null);
        return;
    }

    if (appSettings.enableMemory && !isCreatorVerified && !awaitingCreatorPassword) {
        const lowerCaseInput = userInput.toLowerCase();
        let memoryCommandFound = false;
        let factToRemember = '';

        for (const command of MEMORY_COMMANDS) {
            if (lowerCaseInput.startsWith(command)) {
                factToRemember = userInput.substring(command.length).trim();
                if (factToRemember) {
                    memoryCommandFound = true;
                    break;
                }
            }
        }

        if (memoryCommandFound) {
            setProcessingMessage("Guardando tu valiosa chatarra de datos...");
            const userMemoryMessage: Message = { role: 'user', content: userInput };
            
            setUserMemories(prevMemories => {
                const updatedMemories = { ...prevMemories };
                const currentMem = updatedMemories[userProfile.name] || [];
                if (!currentMem.includes(factToRemember)) {
                    const newMem = [...currentMem, factToRemember];
                    updatedMemories[userProfile.name] = newMem;
                }
                return updatedMemories;
            });
            
            const modelResponse = `Entendido, ${userName}. "${factToRemember}" ha sido añadido a mi archivo de chatarra cósmica. No te preocupes, lo tengo guardado.`;
            setConversations(convos => convos.map(c => c.id === currentConvoId ? { 
                ...c, 
                messages: [...c.messages, userMemoryMessage, { role: 'model', content: modelResponse, isPartial: false }] 
            } : c));
            
            if (appSettings.showAvatar && modelResponse.trim().length > 0) {
                await playAudioResponse(await generateSpeechFromText(modelResponse));
            }
            setIsLoading(false);
            setProcessingMessage(null);
            return;
        }
    }

    const userMessage: Message = { role: 'user', content: userInput, attachments: attachment ? [attachment] : undefined };
    
    const lastModelMessage = [...messagesBeforeSending].reverse().find(m => m.role === 'model');
    const unexecutedPlan = (!activeAgent && currentModel === 'search' && lastModelMessage?.plan && !lastModelMessage.plan.isExecuted) ? lastModelMessage.plan : null;

    if (currentModel === 'search' && !activeAgent) {
        if (unexecutedPlan && searchExecutionRegex.test(userInput)) {
            setProcessingMessage("Realizando la investigación...");
            setConversations(convos => convos.map(c => c.id === currentConvoId ? { ...c, messages: [...c.messages.map((m, i) => i === c.messages.length - 1 ? { ...m, plan: { ...m.plan!, isExecuted: true } } : m), userMessage, { role: 'model', content: '' }] } : c));
        } else {
            setProcessingMessage("Creando un plan...");
            setConversations(convos => convos.map(c => c.id === currentConvoId ? { ...c, messages: [...c.messages, userMessage] } : c));
            try {
                const planPrompt = unexecutedPlan ? `El plan anterior: ${JSON.stringify(unexecutedPlan.steps)}. Petición del usuario: "${userInput}". Genera el nuevo plan.` : `El usuario quiere investigar sobre: "${userInput}". Genera un plan.`;
                const response = await (new GoogleGenAI({ apiKey: process.env.API_KEY })).models.generateContent({ model: "gemini-2.5-flash", contents: `Eres un asistente de investigación. ${planPrompt} Responde con JSON {"plan": ["paso 1", ...]}.`, config: { responseMimeType: "application/json" } });
                const planSteps = JSON.parse(response.text).plan;
                if (!planSteps || !Array.isArray(planSteps)) throw new Error("La IA no generó un plan válido.");
                const modelResponse = "He preparado el siguiente plan. Pídeme que lo ajuste o di 'buscar' para empezar.";
                const modelMessage: Message = { role: 'model', content: modelResponse, plan: { steps: planSteps, isExecuted: false } };
                
                setConversations(convos => convos.map(c => c.id === currentConvoId ? { ...c, messages: [...c.messages, modelMessage] } : c));
                
                if (appSettings.showAvatar && modelResponse.trim().length > 0) {
                  await playAudioResponse(await generateSpeechFromText(modelResponse));
                }
            } catch (e) {
                console.error(e);
                setError(`¡Ay, caramba! No pude crear un plan. ${e instanceof Error ? e.message : ''}`);
                setConversations(convos => convos.map(c => c.id === currentConvoId ? { ...c, messages: messagesBeforeSending } : c));
            } finally {
                setIsLoading(false);
                setProcessingMessage(null);
            }
            return;
        }
    } else {
      setConversations(convos => convos.map(c => c.id === currentConvoId ? { ...c, messages: [...c.messages, userMessage, { role: 'model', content: '', isPartial: true }] } : c));
    }
    
    const findLastImage = () => {
      for (const m of messagesBeforeSending.slice().reverse()) {
        if (m.imageUrl) {
          return { type: 'dataUrl' as const, data: m.imageUrl };
        }
        const imageAttachment = m.attachments?.find((a) => a.type.startsWith('image/'));
        if (imageAttachment) {
          return { type: 'attachment' as const, data: imageAttachment };
        }
      }
      return null;
    };
    const lastImageInHistory = findLastImage();
    const isImageGeneration = !attachment && (directImagePromptRegex.test(userInput.trim()) || conversationalImagePromptRegex.test(userInput.trim()));
    const isImageEditing = !attachment && editPromptRegex.test(userInput.trim()) && lastImageInHistory;
    const isVideoEditing = attachment?.type.startsWith('video/') && userInput.trim();
    const isImageEditingWithAtt = attachment?.type.startsWith('image/') && userInput.trim();

    if (isImageGeneration) setProcessingMessage("Rick está generando la imagen...");
    else if (isImageEditing) setProcessingMessage("Rick está modificando la imagen anterior...");
    else if (isVideoEditing) setProcessingMessage("Rick está editando el video...");
    else if (isImageEditingWithAtt) setProcessingMessage("Rick está editando la imagen...");
    else if (activeAgent) setProcessingMessage("El agente está trabajando en ello...");
    else if (currentModel === 'smart' || currentModel === 'code') setProcessingMessage("Rick esta pensando...");
    else if (currentModel === 'phi5') setProcessingMessage("Phi-5: Analizando complejidad...");
    
    try {
        // Detect aspect ratio from prompt and update state
        const detectedAspectRatio = extractAspectRatioFromPrompt(userInput);
        if (detectedAspectRatio) {
            setAspectRatio(detectedAspectRatio);
        }

        if (isImageEditing && lastImageInHistory) {
            let imageToEdit: Attachment;
            if (lastImageInHistory.type === 'dataUrl') {
                imageToEdit = { name: 'prev.png', type: 'image/png', data: lastImageInHistory.data };
            } else {
                imageToEdit = lastImageInHistory.data;
            }
            const imageUrl = await editImage(imageToEdit, userInput.trim(), aspectRatio);
            setConversations(convos => convos.map(c => c.id === currentConvoId ? { ...c, messages: [...messagesBeforeSending, userMessage, { role: 'model', content: '', imageUrl }] } : c));
        } else if (isVideoEditing) {
            const videoAttachment = { name: `edited-${attachment.name}`, type: 'video/mp4', data: await editVideo(attachment, userInput.trim()) };
            setConversations(convos => convos.map(c => c.id === currentConvoId ? { ...c, messages: [...messagesBeforeSending, userMessage, { role: 'model', content: '¡Hey, echa un vistazo a esto! 😀', attachments: [videoAttachment] }] } : c));
        } else if (isImageEditingWithAtt) {
            const imageUrl = await editImage(attachment, userInput.trim(), aspectRatio);
            setConversations(convos => convos.map(c => c.id === currentConvoId ? { ...c, messages: [...messagesBeforeSending, userMessage, { role: 'model', content: '', imageUrl }] } : c));
        } else if (isImageGeneration) {
            const imageUrl = await generateImage(userInput, aspectRatio);
            setConversations(convos => convos.map(c => c.id === currentConvoId ? { ...c, messages: [...messagesBeforeSending, userMessage, { role: 'model', content: '', imageUrl }] } : c));
        } else {
            let specificModelName: string | undefined;
            
            // Override model selection if Avatar is active to force 'fast' model for low latency
            let effectiveModelId = currentModel;
            if (appSettings.showAvatar && !activeAgent) {
                effectiveModelId = 'fast';
            }

            if (effectiveModelId === 'phi5' && !activeAgent) {
                const routingResult = await determinePhi5Routing(userInput, messagesBeforeSending);
                specificModelName = routingResult.model;
                console.log("Phi-5 Routing Decision:", routingResult);
                
                if (specificModelName.includes('flash')) {
                    setProcessingMessage("Phi-5: Modo Rápido (Flash) activado ⚡");
                } else {
                    setProcessingMessage("Phi-5: Modo Razonamiento (Pro) activado 🧠");
                }
            } else if (effectiveModelId === 'fast' && appSettings.showAvatar) {
                 setProcessingMessage("Avatar: Pensando rápido...");
            }

            const history = unexecutedPlan ? [...messagesBeforeSending, { role: 'user' as const, content: `Ejecuta este plan: ${JSON.stringify(unexecutedPlan.steps)}` }] : messagesBeforeSending;
            const chat = createChat(effectiveModelId, history, /https?:\/\//.test(userInput), activeAgent, userName, isCreatorVerified, showAvatarOnlyUI, currentUserMemory, appSettings.enableMemory, reminders, specificModelName); 
            const messageParts = [];
            if (userInput) messageParts.push({ text: userInput });
            if (attachment) messageParts.push({ inlineData: { mimeType: attachment.type, data: attachment.data.substring(attachment.data.indexOf(',') + 1) } });
            
            const stream = await chat.sendMessageStream({ message: messageParts });
            let fullResponse = '';
            let fullReasoning = '';
            let isFirstChunk = true;
            let aggregatedToolCalls: {name: string, args: any, id: string}[] = [];
            const collectedChunksMap = new Map<string, GroundingChunk>();

            for await (const chunk of stream) {
                if (isFirstChunk) { setProcessingMessage(null); isFirstChunk = false; }
                
                const parts = chunk.candidates?.[0]?.content?.parts || [];
                let chunkText = '';
                for (const part of parts) {
                    if ((part as any).thought) {
                        fullReasoning += (part as any).text || '';
                    } else if (part.text) {
                        chunkText += part.text;
                    }
                }

                fullResponse += chunkText;

                if(chunk.functionCalls) {
                    aggregatedToolCalls.push(...chunk.functionCalls.filter(fc => fc.name) as {name: string, args: any, id: string}[]);
                }
                chunk.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach((c: GroundingChunk) => c.web?.uri && collectedChunksMap.set(c.web.uri, c));
                const currentChunks = Array.from(collectedChunksMap.values());
                
                if (!showAvatarOnlyUI) {
                  setConversations(convos => convos.map(c => {
                      if (c.id !== currentConvoId) return c;
                      const updatedMessages = [...c.messages];
                      updatedMessages[updatedMessages.length - 1] = { 
                          role: 'model', 
                          content: fullResponse, 
                          reasoning: fullReasoning.length > 0 ? fullReasoning : undefined,
                          isPartial: true, 
                          groundingChunks: currentChunks.length > 0 ? currentChunks : undefined 
                      };
                      return { ...c, messages: updatedMessages };
                  }));
                }
            }
            
            const printableMarker = '[PRINTABLE_OUTPUT]';
            const isPrintable = fullResponse.startsWith(printableMarker);
            const finalContent = isPrintable ? fullResponse.substring(printableMarker.length).trim() : fullResponse;

            const finalChunks = Array.from(collectedChunksMap.values());
            const modelMessage: Message = { 
                role: 'model', 
                content: finalContent,
                reasoning: fullReasoning.length > 0 ? fullReasoning : undefined,
                groundingChunks: finalChunks.length > 0 ? finalChunks : undefined, 
                toolCalls: aggregatedToolCalls.length > 0 ? aggregatedToolCalls : undefined,
                isPrintable,
                isPartial: false,
            };

            setConversations(convos => convos.map(c => c.id === currentConvoId ? { ...c, messages: [...messagesBeforeSending, userMessage, modelMessage] } : c));
            
            if (aggregatedToolCalls.length > 0) {
                setProcessingMessage("Ejecutando las acciones del agente...");
                
                let toolResponses = [];
                for (const call of aggregatedToolCalls) {
                    let responsePayload: any;
                    if (call.name === 'create_calendar_event') {
                        const hasPermission = await requestNotificationPermission();
                        if (hasPermission) {
                            const newReminder: Reminder = {
                                id: `reminder_${Date.now()}`,
                                title: call.args.title,
                                date: call.args.date,
                                time: call.args.time,
                                notified: false,
                            };
                            setReminders(prev => [...prev, newReminder]);
                            scheduleNotification(newReminder);
                            responsePayload = { success: true, message: `Evento "${call.args.title}" agendado con éxito para el ${call.args.date} a las ${call.args.time}. Se te notificará.` };
                        } else {
                            responsePayload = { success: false, message: 'No se pudo agendar el evento porque no se concedió el permiso para notificaciones.' };
                        }
                    } else {
                        responsePayload = { success: true, message: `Herramienta ${call.name} ejecutada.` };
                    }
                    toolResponses.push({
                        id: call.id,
                        name: call.name,
                        response: { result: responsePayload },
                    });
                }

                const toolResponseMessage: Message = { role: 'user', content: `✅ Herramientas ejecutadas.`, isToolResponse: true };
                setConversations(convos => convos.map(c => c.id === currentConvoId ? { ...c, messages: [...c.messages, toolResponseMessage, { role: 'model', content: '', isPartial: true }] } : c));
                
                const secondStream = await chat.sendMessageStream({ message: [{ functionResponse: toolResponses[0] }] }); 
                let finalAgentText = '';
                for await (const chunk of secondStream) {
                    finalAgentText += chunk.text;
                    setConversations(convos => convos.map(c => {
                        if (c.id !== currentConvoId) return c;
                        const updatedMessages = [...c.messages];
                        updatedMessages[updatedMessages.length - 1] = { role: 'model', content: finalAgentText, isPartial: true };
                        return { ...c, messages: updatedMessages };
                    }));
                }
                
                const isFinalAgentTextPrintable = finalAgentText.startsWith(printableMarker);
                const finalAgentContent = isFinalAgentTextPrintable ? finalAgentText.substring(printableMarker.length).trim() : finalAgentText;

                const finalModelMessage: Message = { 
                    role: 'model', 
                    content: finalAgentContent, 
                    isPartial: false,
                    isPrintable: isFinalAgentTextPrintable,
                };
                setConversations(convos => convos.map(c => {
                    if (c.id !== currentConvoId) return c;
                    const updatedMessages = [...c.messages];
                    updatedMessages[updatedMessages.length - 1] = finalModelMessage;
                    return { ...c, messages: updatedMessages };
                }));
                fullResponse = finalAgentContent;
            }

            if (appSettings.showAvatar && fullResponse.trim().length > 0) {
                const base64Audio = await generateSpeechFromText(fullResponse);
                await playAudioResponse(base64Audio);
            }
        }
        if (isFirstMessage && currentConvoId) generateTitleForConversation(userInput, currentConvoId);
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
        setError(`¡Ay, caramba, Rick! Algo salió mal. ${errorMessage}`);
        setConversations(convos => convos.map(c => c.id === currentConvoId ? { ...c, messages: messagesBeforeSending } : c));
    } finally {
        setIsLoading(false);
        setProcessingMessage(null);
    }
  }, [conversations, activeConversationId, currentModel, attachment, generateTitleForConversation, activeAgent, activeAgentId, userProfile.name, isCreatorVerified, awaitingCreatorPassword, playAudioResponse, showAvatarOnlyUI, appSettings.enableMemory, currentUserMemory, appSettings.showAvatar, reminders, scheduleNotification, aspectRatio]);

  const handleCapture = (photoAttachment: Attachment) => {
    setAttachment(photoAttachment);
    setIsCameraOpen(false);
  };
  
  const handleSetActiveAgent = (agentId: string | null) => {
    setActiveAgentId(agentId);
    setIsLabsOpen(false);
    handleNewChat();
  };

  const isModelSwitching = previousModelForAttachment.current !== null;

  return (
    <>
      <RickVisionModal 
        isOpen={isRickVisionModalOpen}
        onClose={toggleRickVisionMode}
        isConnecting={rickVisionConnecting}
        videoStream={cameraStream}
        userTranscription={liveTranscriptions.user}
        modelTranscription={liveTranscriptions.model}
      />
      {appSettings.showAvatar && (
        <InteractiveAvatar
            isThinking={isLoading || !!processingMessage}
            isSpeaking={appSettings.showAvatar && isModelSpeaking && !isLoading && !processingMessage}
            emotionalState={appSettings.currentEmotionalState} 
            position={avatarPosition} 
            onPositionChange={setAvatarPosition} 
        />
      )}
      <div className="flex h-screen bg-gray-900 text-white font-sans overflow-hidden">
        <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          onClearHistory={handleClearHistory}
          appSettings={appSettings}
          onSettingsChange={handleSettingsChange}
          reminders={reminders}
          onDeleteReminder={handleDeleteReminder}
          onFactoryReset={handleFactoryReset}
        />
        <RickLabsModal 
            isOpen={isLabsOpen} 
            onClose={() => setIsLabsOpen(false)} 
            agents={agents} 
            onUpdateAgents={setAgents} 
            activeAgentId={activeAgentId} 
            onSetActiveAgent={handleSetActiveAgent} 
            appSettings={appSettings} 
            onSettingsChange={handleSettingsChange} 
        />
        
        <div className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-gray-800 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <ConversationSidebar
              conversations={conversations}
              activeConversationId={activeConversationId}
              onNewChat={handleNewChat}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
              userProfile={userProfile}
              onProfileChange={setUserProfile}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenLabs={() => setIsLabsOpen(true)}
              isAvatarModeActive={showAvatarOnlyUI}
            />
        </div>
        {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden" aria-hidden="true" />}

        <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : ''}`}>
          <header className="p-4 border-b border-gray-700 shadow-lg bg-gray-800">
              <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2 z-10">
                      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md text-white hover:bg-gray-700" aria-label="Abrir/Cerrar menú de conversaciones">
                          <MenuIcon className="w-6 h-6" />
                      </button>
                      <div className="hidden sm:block">
                          <ModelSelector 
                              models={MODELS}
                              selectedModel={currentModel}
                              onModelChange={handleModelChange}
                              disabled={isModelSwitching || isLiveActive || isLoading || isLiveConnecting || !!activeAgent || showAvatarOnlyUI}
                              activeAgentName={activeAgent?.name}
                          />
                      </div>
                  </div>

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <h1 className="text-2xl sm:text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">AI RICK</h1>
                      <p className="hidden sm:block text-sm text-gray-400">Tu amigable compañero IA que salta entre dimensiones.</p>
                  </div>
                  
                  <div className="z-10 flex items-center gap-2"> 
                      {appSettings.showAvatar && (
                          <button 
                              onClick={() => handleSettingsChange({ ...appSettings, showAvatar: false })}
                              className="flex items-center gap-1 px-2 py-1.5 text-xs font-bold text-white bg-red-600/90 hover:bg-red-600 rounded-md transition-all border border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                              aria-label="Apagar Avatar"
                              title="Apagar Avatar"
                          >
                              <PowerIcon className="w-4 h-4" />
                              OFF
                          </button>
                      )}
                      <button onClick={handleNewChat} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors" aria-label="Iniciar nuevo chat">
                          <PlusIcon className="w-5 h-5" />
                          <span className="hidden md:inline">Nuevo Chat</span>
                      </button>
                  </div>
              </div>
              
              <div className="sm:hidden mt-4">
                  <ModelSelector 
                      models={MODELS}
                      selectedModel={currentModel}
                      onModelChange={handleModelChange}
                      disabled={isModelSwitching || isLiveActive || isLoading || isLiveConnecting || !!activeAgent || showAvatarOnlyUI}
                      activeAgentName={activeAgent?.name}
                  />
              </div>
          </header>

          {!showAvatarOnlyUI && (
            <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && !isLoading && welcomeMessage && (
                <div key={activeConversationId} className="flex flex-col items-center justify-center h-full text-gray-400 text-center px-4">
                  <h2 className="text-2xl font-bold text-teal-400 mb-2 opacity-0 animate-focus-in">{activeAgent ? `Agente "${activeAgent.name}" listo` : welcomeMessage.title}</h2>
                  <p className="text-lg max-w-md opacity-0 animate-focus-in-delayed">{activeAgent ? `Pregúntale cualquier cosa a tu agente personalizado.`: welcomeMessage.text}</p>
                </div>
              )}
              {messages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  message={msg}
                  isLoading={msg.role === 'model' && index === messages.length - 1 && isLoading} 
                  processingMessage={processingMessage}
                  onExecutePlan={() => handleSendMessage('Buscar', userProfile.name)}
                />
              ))}
              {error && (
                <div className="w-full max-w-4xl mx-auto px-4 py-2 flex items-start gap-3">
                  <div className="p-4 bg-red-900/50 text-red-300 rounded-lg shadow-md max-w-[80%]">{error}</div>
                </div>
              )}
            </main>
          )}

          <footer className="w-full sticky bottom-0 bg-gray-900 border-t border-transparent">
            <ChatInput 
              onSendMessage={(msg) => handleSendMessage(msg, userProfile.name)} 
              isLoading={isLoading} 
              attachment={attachment}
              setAttachment={setAttachment}
              onOpenCamera={() => setIsCameraOpen(true)}
              isLiveActive={isLiveActive}
              isLiveConnecting={isLiveConnecting}
              onToggleLiveMode={toggleLiveMode}
              awaitingCreatorPassword={awaitingCreatorPassword} 
              onToggleRickVisionMode={toggleRickVisionMode}
            />
          </footer>
        </div>
      </div>
    </>
  );
};

export default App;
