
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Attachment } from '../types';
import { XMarkIcon, LoadingIcon, SwitchCameraIcon, BoltIcon, BoltSlashIcon, GridIcon, ClockIcon } from './icons';

interface CameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (attachment: Attachment) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user'); 
    
    // New camera features state
    const [flashMode, setFlashMode] = useState(false);
    const [hasTorch, setHasTorch] = useState(false);
    const [showGrid, setShowGrid] = useState(false);
    const [timer, setTimer] = useState<0 | 3 | 10>(0);
    const [countdownValue, setCountdownValue] = useState<number | null>(null);
    const [isFlashing, setIsFlashing] = useState(false);

    const stopStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            streamRef.current = null;
        }
    }, []);
    
    const startCamera = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        stopStream(); 

        try {
            const constraints: MediaStreamConstraints = {
                video: { 
                    facingMode: facingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            
            // Check for Torch capability
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities() as any;
            if (capabilities && capabilities.torch) {
                setHasTorch(true);
            } else {
                setHasTorch(false);
                setFlashMode(false);
            }

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    setIsLoading(false);
                };
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError(`No se pudo acceder a la cámara ${facingMode === 'user' ? 'frontal' : 'trasera'}. Por favor, verifica los permisos.`);
            setIsLoading(false);
        }
    }, [facingMode, stopStream]);

    // Effect to apply flash mode
    useEffect(() => {
        if (streamRef.current && hasTorch) {
            const track = streamRef.current.getVideoTracks()[0];
            const constraints = { advanced: [{ torch: flashMode }] } as any;
            track.applyConstraints(constraints).catch(e => console.error("Error applying torch", e));
        }
    }, [flashMode, hasTorch]);

    useEffect(() => {
        if (isOpen) {
            setFacingMode('user'); 
            startCamera();
        } else {
            stopStream();
            setCountdownValue(null);
            setIsFlashing(false);
        }

        return () => {
            stopStream();
        };
    }, [isOpen, startCamera, stopStream]);

    const takePhoto = () => {
        if (videoRef.current) {
            setIsFlashing(true); // Visual flash effect
            setTimeout(() => setIsFlashing(false), 150);

            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                // Mirror horizontal if facing user for natural selfie feel
                if (facingMode === 'user') {
                    context.translate(canvas.width, 0);
                    context.scale(-1, 1);
                }

                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                const photoAttachment: Attachment = {
                    name: `captura-${Date.now()}.jpg`,
                    type: 'image/jpeg',
                    data: dataUrl
                };
                onCapture(photoAttachment);
                onClose();
            }
        }
    };

    const handleCaptureClick = () => {
        if (timer === 0) {
            takePhoto();
        } else {
            setCountdownValue(timer);
        }
    };

    // Countdown logic
    useEffect(() => {
        if (countdownValue === null) return;

        if (countdownValue > 0) {
            const timeout = setTimeout(() => setCountdownValue(countdownValue - 1), 1000);
            return () => clearTimeout(timeout);
        } else {
            takePhoto();
            setCountdownValue(null);
        }
    }, [countdownValue]);

    const toggleFacingMode = () => {
        setFacingMode(prevMode => (prevMode === 'user' ? 'environment' : 'user'));
    };

    const toggleTimer = () => {
        setTimer(prev => {
            if (prev === 0) return 3;
            if (prev === 3) return 10;
            return 0;
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black" onClick={onClose}>
            <div className="relative w-full h-full flex flex-col" onClick={e => e.stopPropagation()}>
                
                {/* Top Bar */}
                <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
                    <button onClick={onClose} className="p-2 rounded-full text-white hover:bg-white/20 transition">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                    
                    <div className="flex gap-4 bg-black/30 rounded-full px-4 py-1 backdrop-blur-sm">
                        {hasTorch && (
                            <button 
                                onClick={() => setFlashMode(!flashMode)} 
                                className={`p-2 rounded-full transition ${flashMode ? 'text-yellow-400' : 'text-white hover:text-gray-300'}`}
                            >
                                {flashMode ? <BoltIcon className="w-5 h-5" /> : <BoltSlashIcon className="w-5 h-5" />}
                            </button>
                        )}
                        <button 
                             onClick={() => setShowGrid(!showGrid)}
                             className={`p-2 rounded-full transition ${showGrid ? 'text-blue-400' : 'text-white hover:text-gray-300'}`}
                        >
                            <GridIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={toggleTimer} 
                            className={`p-2 rounded-full transition flex items-center gap-1 ${timer > 0 ? 'text-blue-400' : 'text-white hover:text-gray-300'}`}
                        >
                            <ClockIcon className="w-5 h-5" />
                            {timer > 0 && <span className="text-xs font-bold">{timer}s</span>}
                        </button>
                    </div>
                    
                    <div className="w-10"></div> {/* Spacer for centering */}
                </div>

                {/* Camera Viewport */}
                <div className="relative flex-1 bg-black overflow-hidden">
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white">
                            <LoadingIcon className="w-10 h-10 animate-spin mb-2 text-teal-400" />
                            <p>Iniciando cámara...</p>
                        </div>
                    )}
                    
                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-center bg-gray-900">
                            <p className="text-red-400 mb-4">{error}</p>
                            <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded-md text-white">Cerrar</button>
                        </div>
                    )}
                    
                    {/* Video Feed */}
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} 
                    />
                    
                    {/* Grid Overlay */}
                    {showGrid && (
                        <div className="absolute inset-0 pointer-events-none opacity-40">
                            <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                                <div className="border-r border-b border-white/50"></div>
                                <div className="border-r border-b border-white/50"></div>
                                <div className="border-b border-white/50"></div>
                                <div className="border-r border-b border-white/50"></div>
                                <div className="border-r border-b border-white/50"></div>
                                <div className="border-b border-white/50"></div>
                                <div className="border-r border-white/50"></div>
                                <div className="border-r border-white/50"></div>
                                <div></div>
                            </div>
                        </div>
                    )}

                    {/* Countdown Overlay */}
                    {countdownValue !== null && (
                        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/20">
                            <span className="text-9xl font-bold text-white animate-pulse drop-shadow-lg">{countdownValue}</span>
                        </div>
                    )}

                    {/* Flash Animation Overlay */}
                    <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-150 z-40 ${isFlashing ? 'opacity-100' : 'opacity-0'}`} />
                </div>

                {/* Bottom Controls */}
                <div className="relative p-8 pb-12 bg-black flex justify-between items-center">
                    <div className="w-12">
                         {/* Placeholder for Gallery - can be added later */}
                    </div>

                    <button
                        onClick={handleCaptureClick}
                        disabled={isLoading || !!error || countdownValue !== null}
                        className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group transition-transform active:scale-95"
                        aria-label="Tomar foto"
                    >
                       <div className={`w-16 h-16 rounded-full bg-white transition-all duration-200 ${countdownValue !== null ? 'bg-red-500 animate-pulse' : 'group-hover:scale-90'}`}></div>
                    </button>

                    <button 
                        onClick={toggleFacingMode} 
                        className="p-3 rounded-full text-white bg-gray-800 hover:bg-gray-700 transition active:rotate-180 duration-500"
                        aria-label="Cambiar cámara"
                        disabled={isLoading}
                    >
                        <SwitchCameraIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CameraModal;
