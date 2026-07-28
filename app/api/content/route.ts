import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  return NextResponse.json({
    ...db.content,
    navItems: db.navItems,
    contactInfo: db.contactInfo,
    siteSettings: db.siteSettings,
    footerSettings: db.footerSettings
  });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const db = getDb();
    
    // Distribute updates to the right parts of the DB
    if (body.navItems) db.navItems = body.navItems;
    if (body.contactInfo) db.contactInfo = body.contactInfo;
    if (body.siteSettings) db.siteSettings = body.siteSettings;
    if (body.footerSettings) db.footerSettings = body.footerSettings;
    
    // Standard content fields
    const { navItems, contactInfo, siteSettings, footerSettings, ...contentFields } = body;
    db.content = { ...db.content, ...contentFields };
    
    saveDb(db);
    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update content' }, { status: 400 });
  }
}
