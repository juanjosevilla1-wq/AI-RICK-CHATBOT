import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { UserIcon, CameraIcon, EditIcon } from './icons';

interface ProfileSectionProps {
    userProfile: UserProfile;
    onProfileChange: (profile: UserProfile) => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ userProfile, onProfileChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [name, setName] = useState(userProfile.name);

    useEffect(() => {
        setName(userProfile.name);
    }, [userProfile.name]);

    const handlePictureButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                onProfileChange({ ...userProfile, picture: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const saveName = () => {
        if (name.trim() === '') {
            setName(userProfile.name); // Revert if empty
        } else {
            onProfileChange({ ...userProfile, name: name.trim() });
        }
        setIsEditingName(false);
    };

    const handleNameEditToggle = () => {
        if (isEditingName) {
            saveName();
        } else {
            setIsEditingName(true);
        }
    };
    
    const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            saveName();
        } else if (e.key === 'Escape') {
            setName(userProfile.name);
            setIsEditingName(false);
        }
    };

    return (
        <div className="flex items-center gap-3 p-2">
             <input
                type="file"
                ref={fileInputRef}
                onChange={handlePictureChange}
                className="hidden"
                accept="image/*"
            />
            <button onClick={handlePictureButtonClick} className="relative flex-shrink-0 group">
                {userProfile.picture ? (
                    <img src={userProfile.picture} alt="User Profile" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                    <UserIcon className="w-10 h-10 p-1 bg-gray-600 text-gray-300 rounded-full" />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center rounded-full transition-opacity cursor-pointer">
                    <CameraIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100" />
                </div>
            </button>
            <div className="flex-1 min-w-0">
                {isEditingName ? (
                    <input 
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                        onKeyDown={handleNameKeyDown}
                        onBlur={saveName}
                        autoFocus
                        className="w-full bg-transparent border-b border-blue-500 text-white focus:outline-none"
                    />
                ) : (
                    <p className="text-sm font-semibold text-white truncate">{userProfile.name}</p>
                )}
            </div>
            <button onClick={handleNameEditToggle} className="p-1 rounded-md hover:bg-gray-700 flex-shrink-0">
                <EditIcon className="w-4 h-4 text-gray-400" />
            </button>
        </div>
    );
};

export default ProfileSection;