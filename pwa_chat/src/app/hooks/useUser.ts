import { useState, useEffect } from 'react';

export interface UserState {
    name: string;
    photo: string | null;
}

export const useUser = () => {
    const [user, setUser] = useState<UserState>({
        name: 'Anonyme',
        photo: null
    });

    useEffect(() => {
        const loadUserData = () => {
            if (typeof window === 'undefined') return;
            
            const userName = localStorage.getItem('userName');
            const userPhoto = localStorage.getItem('userPhoto');
            
            if (userName || userPhoto) {
                setUser({
                    name: userName || 'Anonyme',
                    photo: userPhoto
                });
            }
        };

        loadUserData();
        
        // Add event listener for storage changes
        window.addEventListener('storage', loadUserData);
        
        return () => {
            window.removeEventListener('storage', loadUserData);
        };
    }, []);

    return user;
};
