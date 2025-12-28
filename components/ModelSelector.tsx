
import React, { useState, useRef, useEffect } from 'react';
import { Model, ModelId } from '../types';
import { BeakerIcon } from './icons';

interface ModelSelectorProps {
  models: Model[];
  selectedModel: ModelId;
  onModelChange: (modelId: ModelId) => void;
  disabled: boolean;
  activeAgentName?: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ models, selectedModel, onModelChange, disabled, activeAgentName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (activeAgentName) {
    return (
      <div className="relative">
        <div className="flex items-center gap-2 w-full bg-gray-700 border border-gray-600 text-teal-300 py-2 pl-3 pr-8 rounded-md leading-tight">
            <BeakerIcon className="w-5 h-5" />
            <span className="font-semibold truncate">Agente: {activeAgentName}</span>
        </div>
      </div>
    );
  }

  const selectedModelObj = models.find(m => m.id === selectedModel);
  
  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between bg-gray-700 border border-gray-600 text-white py-2 pl-3 pr-3 rounded-md leading-tight focus:outline-none focus:bg-gray-600 focus:border-gray-500 transition disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]`}
      >
        <div className="flex items-center gap-2 truncate flex-1">
            <span className="truncate">{selectedModelObj?.name}</span>
            {selectedModelObj?.badge && (
                <span className="bg-gradient-to-r from-blue-400 to-teal-400 text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm animate-pulse">
                    {selectedModelObj.badge}
                </span>
            )}
        </div>
        <div className="pointer-events-none flex items-center px-1 text-gray-400">
            <svg className={`fill-current h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-gray-700 border border-gray-600 rounded-md shadow-xl z-50 max-h-60 overflow-y-auto">
            {models.map((model) => (
                <button
                    key={model.id}
                    onClick={() => {
                        onModelChange(model.id);
                        setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-600 flex items-center justify-between ${selectedModel === model.id ? 'bg-gray-600 text-white font-medium' : 'text-gray-300'}`}
                >
                    <span className="truncate">{model.name}</span>
                    {model.badge && (
                        <span className="bg-gradient-to-r from-blue-400 to-teal-400 text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm ml-2 flex-shrink-0">
                            {model.badge}
                        </span>
                    )}
                </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
