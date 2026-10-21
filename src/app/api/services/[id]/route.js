import { NextResponse } from 'next/server';
import { getServices, saveServices } from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const services = await getServices();
    const index = services.findIndex((s) => s.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    const current = services[index];
    const updated = {
      ...current,
      name: body.name !== undefined ? body.name.trim() : current.name,
      section: body.section !== undefined ? body.section.toLowerCase() : current.section,
      description: body.description !== undefined ? body.description.trim() : current.description,
      image: body.image !== undefined ? body.image : current.image,
      badge: body.badge !== undefined ? body.badge : current.badge,
      price: body.price !== undefined ? body.price : current.price,
      features: Array.isArray(body.features) ? body.features : current.features,
      popular: body.popular !== undefined ? body.popular : current.popular,
      updatedAt: new Date().toISOString()
    };

    services[index] = updated;
    await saveServices(services);

    return NextResponse.json({
      success: true,
      message: 'Service updated successfully',
      data: updated
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update service', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const services = await getServices();
    const filtered = services.filter((s) => s.id !== id);

    if (filtered.length === services.length) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    await saveServices(filtered);

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete service', error: error.message },
      { status: 500 }
    );
  }
}
