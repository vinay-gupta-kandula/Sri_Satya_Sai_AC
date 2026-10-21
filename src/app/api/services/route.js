import { NextResponse } from 'next/server';
import { getServices, saveServices } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const services = await getServices();

    if (section && (section === 'ac' || section === 'refrigeration')) {
      return NextResponse.json({
        success: true,
        data: services.filter((s) => s.section === section)
      });
    }

    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch services', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { section, name, description, image, badge, price, features } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Service name is required' },
        { status: 400 }
      );
    }

    if (!section || !['ac', 'refrigeration'].includes(section.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: 'Section must be either "ac" or "refrigeration"' },
        { status: 400 }
      );
    }

    const services = await getServices();

    const newService = {
      id: `svc-${Date.now()}`,
      section: section.toLowerCase(),
      name: name.trim(),
      description: description ? description.trim() : 'Expert doorstep diagnostic and repair service.',
      image: image || (section.toLowerCase() === 'ac' ? '/images/ac-jet-wash.jpg' : '/images/fridge-repair.jpg'),
      badge: badge ? badge.trim() : (section.toLowerCase() === 'ac' ? 'AC Service' : 'Fridge Service'),
      price: price ? price.trim() : '',
      features: Array.isArray(features) && features.length > 0 
        ? features 
        : ['Same-day doorstep visit', 'Expert certified technician', 'Genuine replacement parts', 'Guaranteed workmanship'],
      popular: body.popular || false,
      createdAt: new Date().toISOString()
    };

    services.unshift(newService);
    await saveServices(services);

    return NextResponse.json({
      success: true,
      message: 'Service created successfully',
      data: newService
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to create service', error: error.message },
      { status: 500 }
    );
  }
}
