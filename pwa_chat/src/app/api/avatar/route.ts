import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { imageData } = body;

        if (!imageData) {
            return new NextResponse('Image data is required', { status: 400 });
        }

        // Si l'image est déjà une URL valide, la retourner directement
        if (imageData.startsWith('http')) {
            return NextResponse.json({ url: imageData });
        }

        // Convertir le base64 en Buffer
        const base64Data = imageData.split(';base64,').pop();
        if (!base64Data) {
            return new NextResponse('Invalid image data', { status: 400 });
        }

        const buffer = Buffer.from(base64Data, 'base64');

        // Retourner l'image comme une réponse avec le bon type MIME
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000, immutable'
            }
        });
    } catch (error) {
        console.error('Error processing image:', error);
        return new NextResponse('Error processing image', { status: 500 });
    }
}
