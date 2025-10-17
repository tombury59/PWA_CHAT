import React from 'react';
import Image from 'next/image';

interface ProfileImageProps {
    src: string;
    alt: string;
    className?: string;
    style?: React.CSSProperties;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ src, alt, className, style }) => {
    // Si c'est une URL data, on crée un blob pour l'optimiser
    const [blobUrl, setBlobUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (src.startsWith('data:')) {
            // Convertir base64 en Blob
            fetch(src)
                .then(res => res.blob())
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    setBlobUrl(url);
                    return () => URL.revokeObjectURL(url);
                })
                .catch(console.error);
        }
    }, [src]);

    if (!src) {
        return null;
    }

    // Si c'est une URL data et qu'on a un blob, utiliser le blob
    const imageSrc = blobUrl || src;

    // Si c'est un blob ou une URL data, utiliser une img classique
    if (blobUrl || src.startsWith('data:')) {
        return (
            <img
                src={imageSrc}
                alt={alt}
                className={className}
                style={style}
            />
        );
    }

    // Sinon utiliser Next/Image pour les URLs externes
    return (
        <Image
            src={imageSrc}
            alt={alt}
            width={64}
            height={64}
            className={className}
            style={style}
        />
    );
};

export default ProfileImage;
