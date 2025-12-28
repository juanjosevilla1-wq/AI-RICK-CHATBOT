
import React, { useState } from 'react';
import { Conversation, UserProfile } from '../types';
import { PlusIcon, TrashIcon, SettingsIcon, BeakerIcon } from './icons';
import ProfileSection from './ProfileButton';

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  userProfile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
  onOpenSettings: () => void;
  onOpenLabs: () => void;
  isAvatarModeActive: boolean; // New prop
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  userProfile,
  onProfileChange,
  onOpenSettings,
  onOpenLabs,
  isAvatarModeActive, // Destructure new prop
}) => {
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmingDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (confirmingDeleteId) {
      onDeleteConversation(confirmingDeleteId);
      setConfirmingDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmingDeleteId(null);
  };

  return (
    <aside className="w-64 bg-gray-800 flex flex-col p-2 relative">
      <div className="mb-2 pb-2 border-b border-gray-700">
        <ProfileSection 
          userProfile={userProfile}
          onProfileChange={onProfileChange}
        />
      </div>
      <button
        onClick={onNewChat}
        className="flex items-center justify-center gap-2 w-full px-4 py-2 mb-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
      >
        <PlusIcon className="w-5 h-5" />
        Nueva Conversación
      </button>
      <nav className="flex-1 overflow-y-auto mb-2">
        <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Conversaciones</p>
        <ul className="space-y-1">
          {conversations.map((convo) => (
            <li key={convo.id} className="group flex items-center rounded-md hover:bg-gray-700">
              <button
                onClick={() => onSelectConversation(convo.id)}
                className={`flex-1 text-left px-3 py-2 text-sm rounded-l-md truncate ${
                  activeConversationId === convo.id
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 group-hover:text-white'
                }`}
                disabled={isAvatarModeActive} // Disable selecting conversations in avatar mode
              >
                {convo.title || 'Conversación sin título'}
              </button>
              <button
                onClick={(e) => handleDeleteClick(e, convo.id)}
                className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-md"
                aria-label="Eliminar conversación"
                disabled={isAvatarModeActive} // Disable deleting conversations in avatar mode
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="pt-2 border-t border-gray-700 space-y-1">
        <button
          onClick={onOpenLabs}
          className="flex items-center justify-start w-full px-4 py-2 text-sm font-semibold text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
          disabled={isAvatarModeActive} // Disable Labs in avatar mode
        >
          <BeakerIcon className="w-5 h-5 mr-3" />
          Laboratorios Rick
        </button>
        <button
          onClick={onOpenSettings}
          className="flex items-center justify-start w-full px-4 py-2 text-sm font-semibold text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
          disabled={isAvatarModeActive} // Disable Settings in avatar mode
        >
          <SettingsIcon className="w-5 h-5 mr-3" />
          Ajustes
        </button>
      </div>


      {confirmingDeleteId && (
        <div 
          className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-10"
          onClick={handleCancelDelete}
        >
          <div 
            className="bg-gray-700 rounded-lg p-6 shadow-xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-2">¿Eliminar conversación?</h3>
            <p className="text-sm text-gray-300 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default ConversationSidebar;
