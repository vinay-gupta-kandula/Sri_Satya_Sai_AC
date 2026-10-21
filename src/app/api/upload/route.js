import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { success: false, message: 'No valid image file uploaded' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalExt = path.extname(file.name) || '.jpg';
    const safeExt = originalExt.toLowerCase().match(/\.(jpg|jpeg|png|webp|avif)$/) 
      ? originalExt.toLowerCase() 
      : '.jpg';

    const filename = `service-${Date.now()}-${Math.floor(Math.random() * 1000)}${safeExt}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload handler error:', error);
    return NextResponse.json(
      { success: false, message: 'Image upload failed', error: error.message },
      { status: 500 }
    );
  }
}
