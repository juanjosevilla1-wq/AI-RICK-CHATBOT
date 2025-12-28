import React, { useRef, useEffect } from 'react';
import { XMarkIcon, LoadingIcon } from './icons';

interface RickVisionModalProps {
    isOpen: boolean;
    onClose: () => void;
    userTranscription: string;
    modelTranscription: string;
    isConnecting: boolean;
    videoStream: MediaStream | null;
}

const RickVisionModal: React.FC<RickVisionModalProps> = ({ isOpen, onClose, userTranscription, modelTranscription, isConnecting, videoStream }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    
    useEffect(() => {
        if (isOpen && videoRef.current && videoStream) {
            videoRef.current.srcObject = videoStream;
        }
    }, [isOpen, videoStream]);
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 animate-focus-in" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="relative flex-1 bg-black flex items-center justify-center">
                    {isConnecting && <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70"><LoadingIcon className="w-12 h-12 animate-spin text-teal-400" /><p className="text-white mt-4">Iniciando Rick Visión...</p></div>}
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                        <p className="text-xl text-white font-semibold drop-shadow-md">Tú: <span className="text-gray-300 font-normal">{userTranscription}</span></p>
                        <p className="text-xl text-teal-300 font-semibold drop-shadow-md">Rick: <span className="text-gray-200 font-normal">{modelTranscription}</span></p>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={onClose} className="p-2 rounded-full text-white bg-black bg-opacity-50 hover:bg-opacity-75 transition-colors" aria-label="Cerrar Rick Visión">
                            <XMarkIcon className="w-7 h-7" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RickVisionModal;
