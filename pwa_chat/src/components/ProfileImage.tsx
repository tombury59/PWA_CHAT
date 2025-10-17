import React from 'react';
import Image from 'next/image';

interface ProfileImageProps {
    src: string;
    alt: string;
    className?: string;
    style?: React.CSSProperties;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ src, alt, className, style }) => {
    const [imageSrc, setImageSrc] = React.useState<string>(src);
    const [error, setError] = React.useState(false);

    React.useEffect(() => {
        const processImage = async () => {
            if (src.startsWith('data:')) {
                try {
                    const response = await fetch('/api/avatar', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ imageData: src }),
                    });

                    if (!response.ok) throw new Error('Failed to process image');

                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    setImageSrc(url);
                    
                    return () => URL.revokeObjectURL(url);
                } catch (err) {
                    console.error('Error processing image:', err);
                    setError(true);
                }
            }
        };

        processImage();
    }, [src]);

    if (!src || error) {
        return (
            <div className={className} style={{ ...style, backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                👤
            </div>
        );
    }

    if (imageSrc.startsWith('data:') || imageSrc.startsWith('blob:')) {
        return (
            <img
                src={imageSrc}
                alt={alt}
                className={className}
                style={style}
                onError={() => setError(true)}
            />
        );
    }

    return (
        <Image
            src={imageSrc}
            alt={alt}
            width={64}
            height={64}
            className={className}
            style={style}
            onError={() => setError(true)}
        />
    );
};

export default ProfileImage;
