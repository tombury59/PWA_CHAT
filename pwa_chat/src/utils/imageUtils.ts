export const compressImage = async (base64String: string): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Maximum size for the image
            const MAX_SIZE = 800;
            
            if (width > height) {
                if (width > MAX_SIZE) {
                    height = Math.round((height * MAX_SIZE) / width);
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width = Math.round((width * MAX_SIZE) / height);
                    height = MAX_SIZE;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(base64String);
                return;
            }
            
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to JPEG with 70% quality
        };
        img.src = base64String;
    });
};
