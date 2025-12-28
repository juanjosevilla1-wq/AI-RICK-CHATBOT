




import React, { useState } from 'react';
import { AppSettings, Reminder } from '../types';
import {
    XMarkIcon, LockClosedIcon, ClockIcon, TrashIcon, CameraIcon, MicrophoneIcon, BookOpenIcon, BellIcon
} from './icons';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onClearHistory: () => void;
    appSettings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
    reminders: Reminder[];
    onDeleteReminder: (reminderId: string) => void;
    onFactoryReset: () => void; // New prop for factory reset
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onClearHistory, appSettings, onSettingsChange, reminders, onDeleteReminder, onFactoryReset }) => {
    const [activeTab, setActiveTab] = useState('history');
    const [showConfirmClear, setShowConfirmClear] = useState(false);
    const [showConfirmFactoryReset, setShowConfirmFactoryReset] = useState(false); // State for factory reset confirmation

    const handleClearHistoryClick = () => {
        onClearHistory();
        setShowConfirmClear(false);
    };
    
    const handleFactoryResetClick = () => {
        onFactoryReset();
        setShowConfirmFactoryReset(false);
    };

    if (!isOpen) {
        return null;
    }

    const tabs = [
        { id: 'history', name: 'Historial y Privacidad', icon: ClockIcon },
        { id: 'memory', name: 'Memoria de Usuario', icon: BookOpenIcon },
        { id: 'reminders', name: 'Recordatorios', icon: BellIcon },
        { id: 'permissions', name: 'Permisos', icon: LockClosedIcon },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'history':
                return <HistoryPrivacySection 
                            onConfirmClear={() => setShowConfirmClear(true)} 
                            onConfirmFactoryReset={() => setShowConfirmFactoryReset(true)}
                            settings={appSettings}
                            onSettingsChange={onSettingsChange}
                        />;
            case 'memory':
                return <MemorySection
                            settings={appSettings}
                            onSettingsChange={onSettingsChange}
                        />;
            case 'reminders':
                return <RemindersSection
                            reminders={reminders}
                            onDeleteReminder={onDeleteReminder}
                        />;
            case 'permissions':
                return <PermissionsSection />;
            default:
                return null;
        }
    };
    
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl h-full max-h-[600px] flex overflow-hidden" onClick={e => e.stopPropagation()}>
                <aside className="w-1/3 bg-gray-900/50 p-4 border-r border-gray-700">
                    <h2 className="text-lg font-bold mb-6 text-white">Ajustes</h2>
                    <nav>
                        <ul>
                            {tabs.map(tab => (
                                <li key={tab.id}>
                                    <button
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md text-left transition-colors ${activeTab === tab.id ? 'bg-blue-900/50 text-blue-400 font-semibold' : 'text-gray-300 hover:bg-gray-700/50'}`}
                                    >
                                        <tab.icon className="w-5 h-5" />
                                        <span>{tab.name}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>
                <main className="w-2/3 p-8 overflow-y-auto relative">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-700">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                    {renderContent()}
                </main>
            </div>
            {showConfirmClear && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={() => setShowConfirmClear(false)}>
                    <div className="bg-gray-700 rounded-lg p-6 shadow-xl text-center" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white mb-2">¿Borrar todo el historial?</h3>
                        <p className="text-sm text-gray-300 mb-6">Todas tus conversaciones serán eliminadas permanentemente. Esta acción no se puede deshacer.</p>
                        <div className="flex justify-center gap-4">
                        <button onClick={() => setShowConfirmClear(false)} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors">Cancelar</button>
                        <button onClick={handleClearHistoryClick} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">Sí, borrar todo</button>
                        </div>
                    </div>
                 </div>
            )}
            {showConfirmFactoryReset && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={() => setShowConfirmFactoryReset(false)}>
                    <div className="bg-gray-700 rounded-lg p-6 shadow-xl text-center border border-red-500" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-red-400 mb-2">⚠️ RESTABLECER APLICACIÓN</h3>
                        <p className="text-sm text-gray-300 mb-6">Esto borrará <strong>TODOS</strong> los datos (conversaciones, ajustes, memoria, agentes, perfil) y recargará la página. ¿Estás seguro?</p>
                        <div className="flex justify-center gap-4">
                        <button onClick={() => setShowConfirmFactoryReset(false)} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors">Cancelar</button>
                        <button onClick={handleFactoryResetClick} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-bold">SÍ, RESTABLECER</button>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
};

const Section: React.FC<{ title: string, description: string, children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="animate-focus-in">
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="text-gray-400 mt-1 mb-6">{description}</p>
        <div className="space-y-6">{children}</div>
    </div>
);

const ToggleSwitch: React.FC<{ label: string, enabled: boolean, onChange: (enabled: boolean) => void }> = ({ label, enabled, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
        <span className="text-gray-300">{label}</span>
        <button
            type="button"
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ring-offset-gray-800 ${enabled ? 'bg-blue-600' : 'bg-gray-600'}`}
            onClick={() => onChange(!enabled)}
            aria-pressed={enabled}
        >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    </div>
);

const PermissionsSection: React.FC = () => {
    return (
        <Section title="Permisos" description="Gestiona el acceso de la aplicación a los recursos de tu dispositivo.">
             <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                <div className="flex items-start gap-4">
                    <CameraIcon className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1"/>
                    <div>
                        <h4 className="font-semibold text-white">Cámara</h4>
                        <p className="text-sm text-gray-400">Se te pedirá permiso para usar la cámara cuando quieras tomar una foto para adjuntarla a un mensaje.</p>
                    </div>
                </div>
            </div>
             <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                <div className="flex items-start gap-4">
                    <MicrophoneIcon className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1"/>
                    <div>
                        <h4 className="font-semibold text-white">Micrófono</h4>
                        <p className="text-sm text-gray-400">Se te pedirá permiso para usar el micrófono cuando inicies una conversación de voz en tiempo real.</p>
                    </div>
                </div>
            </div>
             <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                <div className="flex items-start gap-4">
                    <BellIcon className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1"/>
                    <div>
                        <h4 className="font-semibold text-white">Notificaciones</h4>
                        <p className="text-sm text-gray-400">Se te pedirá permiso para enviar notificaciones la primera vez que crees un recordatorio de calendario.</p>
                    </div>
                </div>
            </div>
        </Section>
    );
};

interface HistoryPrivacyProps {
    onConfirmClear: () => void;
    onConfirmFactoryReset: () => void;
    settings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
}

const HistoryPrivacySection: React.FC<HistoryPrivacyProps> = ({ onConfirmClear, onConfirmFactoryReset, settings, onSettingsChange }) => (
    <Section title="Historial y Privacidad" description="Controla tus datos y tu historial de conversaciones.">
        <ToggleSwitch 
            label="Activar memoria de conversaciones" 
            enabled={settings.saveHistory}
            onChange={(enabled) => onSettingsChange({ ...settings, saveHistory: enabled })}
        />
        <div className="space-y-3 pt-2">
            <button onClick={onConfirmClear} className="w-full flex items-center justify-center gap-2 p-2 text-red-400 rounded-md hover:bg-red-900/20 border border-red-900/30 transition-colors">
                <TrashIcon className="w-5 h-5"/> Borrar todas las conversaciones
            </button>
            <button onClick={onConfirmFactoryReset} className="w-full flex items-center justify-center gap-2 p-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors font-semibold">
                ⚠️ Restablecer Aplicación (Factory Reset)
            </button>
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">
            Tu historial se guarda únicamente en este navegador. Nadie más tiene acceso a él.
        </p>
    </Section>
);

const MemorySection: React.FC<{ settings: AppSettings; onSettingsChange: (settings: AppSettings) => void; }> = ({ settings, onSettingsChange }) => (
    <Section title="Memoria de Usuario" description="Habilita la capacidad de Rick para recordar información específica que le proporciones.">
        <ToggleSwitch
            label="Activar memoria a largo plazo"
            enabled={settings.enableMemory}
            onChange={(enabled) => onSettingsChange({ ...settings, enableMemory: enabled })}
        />
        <p className="text-center text-xs text-gray-500">
            Cuando la memoria está activa, puedes pedirle a Rick que "Recuerda esto: [dato]" y lo utilizará en futuras conversaciones.
            Los datos se guardan solo en tu navegador.
        </p>
    </Section>
);

const RemindersSection: React.FC<{ reminders: Reminder[]; onDeleteReminder: (id: string) => void; }> = ({ reminders, onDeleteReminder }) => {
    const upcomingReminders = reminders.filter(r => new Date(`${r.date}T${r.time}`) > new Date());
    
    return (
        <Section title="Recordatorios" description="Aquí están todos los eventos y tareas que has agendado.">
            {upcomingReminders.length > 0 ? (
                <ul className="space-y-3">
                    {upcomingReminders.sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()).map(reminder => (
                        <li key={reminder.id} className="flex items-center justify-between p-3 bg-gray-900/50 border border-gray-700 rounded-lg animate-focus-in">
                            <div>
                                <p className="font-semibold text-white">{reminder.title}</p>
                                <p className="text-sm text-gray-400">{new Date(`${reminder.date}T${reminder.time}`).toLocaleString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <button onClick={() => onDeleteReminder(reminder.id)} className="p-2 text-gray-500 rounded-full hover:bg-red-900/50 hover:text-red-400 transition-colors" aria-label="Eliminar recordatorio">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-10 border-2 border-dashed border-gray-700 rounded-lg">
                    <BellIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No tienes recordatorios pendientes.</p>
                    <p className="text-xs text-gray-500 mt-1">Pídele a un agente que te recuerde algo, ¡como "recuérdame llamar a mamá mañana a las 10am"!</p>
                </div>
            )}
        </Section>
    );
};


export default SettingsModal;