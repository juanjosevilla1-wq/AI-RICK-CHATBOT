
import React from 'react';

export const BotIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12,2A10,10,0,0,0,2,12a9.91,9.91,0,0,0,1.7,5.5A1,1,0,0,0,5,18H8.32a1,1,0,0,0,.95-.68,5,5,0,0,1,9.46,0,1,1,0,0,0,.95.68H20a1,1,0,0,0,.78-.37,1,1,0,0,0,.22-1.13A9.91,9.91,0,0,0,22,12,10,10,0,0,0,12,2Zm-3,9a1.5,1.5,0,1,1,1.5,1.5A1.5,1.5,0,0,1,9,11Zm6,0a1.5,1.5,0,1,1,1.5,1.5A1.5,1.5,0,0,1,15,11Z"/>
  </svg>
);

export const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

export const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

export const LoadingIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="m4.93 4.93 2.83 2.83" />
      <path d="m16.24 16.24 2.83 2.83" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="m4.93 19.07 2.83-2.83" />
      <path d="m16.24 7.76 2.83-2.83" />
    </svg>
);

export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
);
  
export const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M2 6a2 2 0 012-2h1.586a1 1 0 00.707-.293l1.414-1.414a1 1 0 011.414 0l1.414 1.414a1 1 0 00.707.293H14a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
      <path d="M10 12a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
);

export const SwitchCameraIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
        <path fillRule="evenodd" d="M10 12.5a.75.75 0 01.75-.75h5.5a.75.75 0 01.75.75v5.5a.75.75 0 01-.75.75h-5.5a.75.75 0 01-.75-.75v-5.5zm-8.5-6a.75.75 0 01.75-.75h5.5a.75.75 0 01.75.75v5.5a.75.75 0 01-.75.75h-5.5a.75.75 0 01-.75-.75v-5.5zM10 3.25a.75.75 0 01.75-.75h5.5a.75.75 0 01.75.75v5.5a.75.75 0 01-.75.75H10.75a.75.75 0 01-.75-.75v-5.5zM3.25 10a.75.75 0 01.75-.75h5.5a.75.75 0 01.75.75v5.5a.75.75 0 01-.75.75H4a.75.75 0 01-.75-.75V10zM17 10a.75.75 0 00-.75-.75h-1.5a.75.75 0 000 1.5h1.5A.75.75 0 0017 10zM3 3.25a.75.75 0 00-.75.75v1.5a.75.75 0 001.5 0v-1.5a.75.75 0 00-.75-.75z" clipRule="evenodd" />
    </svg>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25V4.075c.827-.05 1.66-.075 2.5-.075zM7.443 6.066a.75.75 0 00-.746-1.238l-.16.03a1.99 1.99 0 00-1.443 1.849l.841 10.519a1.25 1.25 0 001.246 1.168h4.807a1.25 1.25 0 001.246-1.168l.84-10.519a1.99 1.99 0 00-1.442-1.85l-.161-.03a.75.75 0 00-.746 1.238l.16.03a.49.49 0 01.356.455l-.84 10.519a.25.25 0 01-.249.234H7.596a.25.25 0 01-.249-.234l-.84-10.519a.49.49 0 01.356-.455l.16-.03z" clipRule="evenodd" />
    </svg>
);

export const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
    </svg>
);

export const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 0v9.5c0 .138.112.25.25.25h13.5a.25.25 0 00.25-.25v-9.5a.25.25 0 00-.25-.25H3.25a.25.25 0 00-.25.25z" clipRule="evenodd" />
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path fillRule="evenodd" d="M.664 15.592a.75.75 0 001.06 0l3.25-3.25a.75.75 0 011.06 0l1.373 1.372.94-1.881a.75.75 0 011.316.658l-1.07 2.14a.75.75 0 001.06 1.06l3.25-3.25a.75.75 0 011.06 0l3.25 3.25a.75.75 0 001.06-1.06l-3.25-3.25a2.25 2.25 0 00-3.182 0l-3.25 3.25a.75.75 0 01-1.06 0l-1.373-1.372-.94 1.881a.75.75 0 01-1.316-.658l1.07-2.14a.75.75 0 00-1.06-1.06L1.724 14.532a.75.75 0 000 1.06z" clipRule="evenodd" />
    </svg>
);
  
export const ChatBubbleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M2 5.25A3.25 3.25 0 015.25 2h9.5A3.25 3.25 0 0118 5.25v5.5A3.25 3.25 0 0114.75 14h-2.522a.75.75 0 00-.598.274l-1.5 2.25a.75.75 0 01-1.16 0l-1.5-2.25A.75.75 0 004.772 14H3.25A1.75 1.75 0 001.5 12.25v-7A1.75 1.75 0 003.25 7H2a.75.75 0 010-1.5h1.25A3.25 3.25 0 012 5.25zM6 8.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm.5 1.5a.5.5 0 000 1h4a.5.5 0 000-1h-4z" clipRule="evenodd" />
    </svg>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M10 2.75a.75.75 0 00-1.5 0v9.546l-3.04-2.94a.75.75 0 10-1.04 1.08l4.25 4.1a.75.75 0 001.04 0l4.25-4.1a.75.75 0 10-1.04-1.08l-3.04 2.94V2.75A.75.75 0 0010 2.75zM3.5 14.75a.75.75 0 00-1.5 0v1.5A2.75 2.75 0 004.75 19h10.5A2.75 2.75 0 0018 16.25v-1.5a.75.75 0 00-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-1.5z" clipRule="evenodd" />
    </svg>
);

export const PaperclipIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243L15.75 8.5a1.5 1.5 0 012.122 2.121l-8.25 8.25a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.364 6.364l-3.379 3.379a1.5 1.5 0 01-2.12-2.122l3.378-3.378a3 3 0 000-4.242z" clipRule="evenodd" />
    </svg>
);

export const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
      <path d="M5.5 8.5a.5.5 0 01.5.5v1.5a4 4 0 004 4h0a4 4 0 004-4V9a.5.5 0 011 0v1.5a5 5 0 01-5 5h0a5 5 0 01-5-5V9a.5.5 0 01.5-.5z" />
    </svg>
);

export const VideoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
        <path d="M3.25 4.25A2.25 2.25 0 015.5 2h9a2.25 2.25 0 012.25 2.25v11.5A2.25 2.25 0 0114.5 18h-9A2.25 2.25 0 013.25 15.75V4.25zM5.75 6a.75.75 0 00-.75.75v6.5a.75.75 0 00.75.75h8.5a.75.75 0 00.75-.75v-6.5a.75.75 0 00-.75-.75h-8.5zM6 4.75a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM8.5 4.75a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM6 13.75a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM8.5 13.75a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5z" />
    </svg>
);

export const AudioIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
        <path d="M2.345 6.151a.75.75 0 01.493-.728l14-3.5a.75.75 0 01.912.912l-3.5 14a.75.75 0 01-.912.098l-3.51-1.755a.75.75 0 00-.537.01l-2.91 1.746A.75.75 0 015 16.25V8.56a.75.75 0 00-.31-.614l-2.345-1.795zM3.5 8.06v7.22c0 .21.223.363.41.286l2.59-1.554a.75.75 0 01.537-.01l3.51 1.755a.75.75 0 00.913-.098l3.08-12.322-12.322 3.08a.75.75 0 00.098.912L5.58 9.814a.75.75 0 01.31.614v-2.368z" />
    </svg>
);

export const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

export const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={className} aria-hidden="true">
        <path fill="#4285F4" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#34A853" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C39.902,36.69,44,31.1,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FBBC05" d="M10.21,25.966c-0.576-1.748-0.904-3.636-0.904-5.631s0.328-3.883,0.904-5.631l-6.19-5.238 C2.193,12.723,1,16.035,1,20c0,3.965,1.193,7.277,3.02,10.238L10.21,25.966z"/>
        <path fill="#EA4335" d="M24,48c5.42,0,10.23-1.815,13.8-4.818l-6.19-5.238c-1.854,1.406-4.291,2.24-7.01,2.24 c-4.935,0-9.15-2.91-10.74-7.01l-6.224,5.257C9.02,42.428,15.937,48,24,48z"/>
        <path fill="none" d="M1,1h46v46H1V1z"/>
    </svg>
);

export const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M11.078 2.25c-.217-1.171-1.734-1.171-1.951 0l-.513 2.784c-.313.16-.614.34-.9.537l-2.617-1.036c-1.125-.445-2.291.509-1.846 1.636l1.294 2.24c.243.421.41.884.49 1.365l-.331 2.92c-.08.703.492 1.336 1.196 1.336h2.944c.704 0 1.276-.633 1.196-1.336l-.33-2.92c.08-.48.247-.944.49-1.365l1.294-2.24c.445-1.126-.72-2.08-1.846-1.636l-2.618 1.036c-.286-.197-.587-.377-.9-.537l-.513-2.784ZM10 12.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 000 4.5Z" clipRule="evenodd" />
    </svg>
);

export const LockClosedIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
    </svg>
);

export const UserCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.5 5.5 0 00-4.477 2.387a.75.75 0 001.03 1.126A3.5 3.5 0 0110 14.5a3.5 3.5 0 013.447 1.013a.75.75 0 001.03-1.126A5.5 5.5 0 0010 12z" clipRule="evenodd" />
    </svg>
);

export const PaintBrushIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M1 3.25A2.25 2.25 0 013.25 1h5.5A2.25 2.25 0 0111 3.25v.5A2.25 2.25 0 018.75 6h-5.5A2.25 2.25 0 011 3.75v-.5zM2.5 3.75A.75.75 0 013.25 3h5.5A.75.75 0 019.5 3.75v.5A.75.75 0 018.75 5h-5.5A.75.75 0 012.5 4.25v-.5z" clipRule="evenodd" />
      <path d="M14.5 3.25a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V3.25z" />
      <path fillRule="evenodd" d="M3.25 8A2.25 2.25 0 015.5 5.75h5.5a.75.75 0 010 1.5H5.5A.75.75 0 004.75 8v8.25A.75.75 0 005.5 17h5.5a.75.75 0 010 1.5H5.5A2.25 2.25 0 013.25 16.25V8z" clipRule="evenodd" />
    </svg>
);

export const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
    </svg>
);

export const ClipboardDocumentListIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm2.5 4.5a.75.75 0 000 1.5h7a.75.75 0 000-1.5h-7zm0 3a.75.75 0 000 1.5h7a.75.75 0 000-1.5h-7zm0 3a.75.75 0 000 1.5h4a.75.75 0 000-1.5h-4z" clipRule="evenodd" />
    </svg>
);

export const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 4.343a.75.75 0 011.06 1.06l-1.06 1.06a.75.75 0 01-1.06-1.06l1.06-1.06zM4.343 15.657a.75.75 0 011.06-1.06l1.06 1.06a.75.75 0 11-1.06 1.06l-1.06-1.06zM16.717 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM2.5 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM15.657 15.657a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 111.06-1.06l1.06 1.06zM5.404 5.404a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 1.06l-1.06 1.06z" />
    </svg>
);

export const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M7.455 2.164A8.949 8.949 0 0115.316 10a8.949 8.949 0 01-7.861 7.836 9.001 9.001 0 01-8.316-8.316A9.001 9.001 0 017.455 2.164z" clipRule="evenodd" />
    </svg>
);

export const ComputerDesktopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
    <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v8A1.5 1.5 0 0 0 2.5 14h15a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 17.5 3h-15Z" />
    <path d="M4 15a1 1 0 0 0-1 1v.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5V16a1 1 0 0 0-1-1H4Z" />
  </svg>
);


export const GlobeAltIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a.5.5 0 00.5.5h2a.5.5 0 00.5-.5V7.5a1.5 1.5 0 011.5-1.5c.526 0 .988-.27 1.256-.579A6.012 6.012 0 0115.668 8.027 6.012 6.012 0 0110 14.002a6.012 6.012 0 01-5.668-5.975z" clipRule="evenodd" />
    </svg>
);

export const BellIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 0013.484 0 .75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6zM8.5 16.5a1.5 1.5 0 103 0h-3z" clipRule="evenodd" />
    </svg>
);

export const ArrowRightOnRectangleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M16.72 9.72a.75.75 0 011.06 0l2.25 2.25a.75.75 0 010 1.06l-2.25 2.25a.75.75 0 11-1.06-1.06L17.44 12H9.25a.75.75 0 010-1.5h8.19l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
);

export const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
);

export const BeakerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
        <path d="M3.5 2.75a.75.75 0 00-1.5 0v14.5a.75.75 0 001.5 0v-4.392c1.657.243 2.89 1.663 3.25 3.392a.75.75 0 001.45-.398C7.785 13.93 7.091 12.3 5.818 11.522c.624-.22 1.18-1.01 1.482-2.022a.75.75 0 00-1.4-.458c-.14.47-.442.89-.78 1.062C6.143 9.47 7.5 7.857 7.5 6V4.75a.75.75 0 00-1.5 0V6c0 .995-1.164 2.309-2.018 2.813A.75.75 0 003.5 8V2.75z" />
        <path d="M8.25 2a.75.75 0 01.75.75v14.5a.75.75 0 01-1.5 0V2.75A.75.75 0 018.25 2zM12.5 11.25a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75zM12.5 7.25a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z" />
    </svg>
);

export const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.181m0-7.07-3.181-3.181m0 0A3.375 3.375 0 0 1 6.318 4.634m12.77 1.961 3.181 3.181m0 0v-4.992m0 0h-4.992m-4.787 1.981A3.375 3.375 0 0 1 18.783 20.366M6.318 4.634a3.375 3.375 0 0 0-4.444 4.298m.636 1.071l-.149 1.462M18.783 20.366a3.375 3.375 0 0 0 4.444-4.298m-.636-1.071 3.181-3.181M10.257 11.648l3.904 3.904m-3.904 3.904L9.043 16.5m.002-3.858 3.904-3.904" />
    </svg>
);

export const PowerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
    </svg>
);

export const BookOpenIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M.93 6.258A1.503 1.503 0 000 7.502v9.75c0 .193.076.377.203.513A.75.75 0 00.75 18h11a.75.75 0 00.547-.234c.127-.136.203-.32.203-.513V7.502a1.503 1.503 0 00-.93-1.244L8.47 4.19A2.25 2.25 0 005.5 4.19L.93 6.258zm6.208 6.643a.75.75 0 01.772.062l4.25 3a.75.75 0 010 1.256l-4.25 3A.75.75 0 017 14.502V8.252A.75.75 0 017.138 7.27a.75.75 0 01.772.062l4.25 3a.75.75 0 010 1.256l-4.25 3a.75.75 0 01-.772-.062z" clipRule="evenodd" />
    </svg>
);

export const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
        <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zM4.5 8.5a.75.75 0 000 1.5h11a.75.75 0 000-1.5h-11z" clipRule="evenodd" />
    </svg>
);

export const EnvelopeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
      <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
    </svg>
);

export const TableCellsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
        <path d="M2 3a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zM3 5v12h14V5H3z" />
        <path d="M3 9h14v2H3V9z" />
    </svg>
);

export const PrinterIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M5 2.5a.5.5 0 00-.5.5v2a.5.5 0 00.5.5h10a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5H5zM4.5 7a.5.5 0 00-.5.5v6a.5.5 0 00.5.5h11a.5.5 0 00.5-.5v-6a.5.5 0 00-.5-.5h-11z" clipRule="evenodd" />
      <path d="M18 7H2a1 1 0 00-1 1v8a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1zm-1 8a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1h12a1 1 0 011 1v6z" />
    </svg>
);

export const CircuitIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5c0 1.54.83 2.9 2.05 3.65" />
        <path d="M12 2a4.5 4.5 0 0 1 4.5 4.5c0 1.54-.83 2.9-2.05 3.65" />
        <path d="M12 12a4.5 4.5 0 0 1 4.5-4.5c0-1.54-.83-2.9-2.05-3.65" />
        <path d="M12 12a4.5 4.5 0 0 0-4.5-4.5c0-1.54.83-2.9-2.05-3.65" />
        <path d="M12 12a4.5 4.5 0 0 0 4.5 4.5c0 1.54.83 2.9 2.05 3.65" />
        <path d="M12 12a4.5 4.5 0 0 1-4.5 4.5c0 1.54-.83 2.9-2.05-3.65" />
        <path d="M12 22a4.5 4.5 0 0 1-4.5-4.5c0-1.54.83-2.9-2.05-3.65" />
        <path d="M12 22a4.5 4.5 0 0 0 4.5-4.5c0-1.54-.83-2.9-2.05-3.65" />
        <path d="M2 12h3" />
        <path d="M19 12h3" />
        <path d="M12 2v3" />
        <path d="M12 19v3" />
        <path d="M4.93 4.93l2.12 2.12" />
        <path d="M16.95 16.95l2.12 2.12" />
        <path d="M4.93 19.07l2.12-2.12" />
        <path d="M16.95 7.05l2.12-2.12" />
    </svg>
);

export const ThinkingSpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" strokeDasharray="5 5" strokeLinecap="round" />
    </svg>
);

export const BoltIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
    </svg>
);

export const BoltSlashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852l-1.252 5.632-2.122 2.122-1.68-4.813a.75.75 0 01.181-.845l4.514-2.95zM16.89 11.25c.665 0 1.185.63.992 1.262l-2.052 6.71-6.933-6.933.62-.62 1.549-1.55 2.273-2.273 3.551 3.404zM2.25 5.504l1.688 1.688L5.114 9.75H3.75a.75.75 0 00-.548 1.262l10.5 11.25a.75.75 0 001.272-.71l-1.69-6.196 2.645 2.645 1.5 1.5 1.818 1.818a.75.75 0 001.06-1.06l-18-18a.75.75 0 00-1.06 1.06z" clipRule="evenodd" />
    </svg>
);

export const GridIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
);

export const BrainIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

export const ChevronUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
  </svg>
);

export const AspectRatioIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M4 5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H4Zm0 2h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" />
    <path d="M8 10a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Z" />
  </svg>
);

export const ClipboardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
  </svg>
);

export const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

export const HammerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
    <path d="M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0 1 12 2.753a3.375 3.375 0 0 1 5.432 3.063h.568a1.875 1.875 0 0 1 1.875 1.875v.75c0 1.036-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 0 0 0-3.75h-5.25Z" />
  </svg>
);

export const ArrowsPointingOutIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
  </svg>
);

export const CodeBracketIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 18" />
  </svg>
);

export const ArrowLeftStartOnRectangleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
  </svg>
);
