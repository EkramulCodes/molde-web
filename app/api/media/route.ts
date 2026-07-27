import { NextResponse } from 'next/server';
import { getDb, saveDb, MediaItem } from '@/lib/store';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.media || []);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      // Check if base64 or url payload was sent
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${cleanFilename}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    const mediaItem: MediaItem = {
      id: `media-${Date.now()}`,
      filename: file.name,
      url: publicUrl,
      size: file.size,
      type: file.type || 'image/jpeg',
      createdAt: new Date().toISOString(),
    };

    const db = getDb();
    if (!db.media) db.media = [];
    db.media.unshift(mediaItem);
    saveDb(db);

    return NextResponse.json({ success: true, data: mediaItem });
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload media file' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing media id' }, { status: 400 });
    }

    const db = getDb();
    if (!db.media) db.media = [];

    const item = db.media.find((m) => m.id === id);
    if (item && item.url.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', item.url);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error('Could not delete physical file', e);
        }
      }
    }

    db.media = db.media.filter((m) => m.id !== id);
    saveDb(db);

    return NextResponse.json({ success: true, message: 'Media deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete media' }, { status: 400 });
  }
}
