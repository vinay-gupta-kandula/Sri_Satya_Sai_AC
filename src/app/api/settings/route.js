import { NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/db';

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const current = await getSettings();

    const updated = {
      ...current,
      ...body,
      updatedAt: new Date().toISOString()
    };

    await saveSettings(updated);

    return NextResponse.json({
      success: true,
      message: 'Business settings updated successfully',
      data: updated
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update settings', error: error.message },
      { status: 500 }
    );
  }
}
