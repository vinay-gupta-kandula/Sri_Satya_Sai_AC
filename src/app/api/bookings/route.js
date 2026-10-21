import { NextResponse } from 'next/server';
import { getBookings, saveBookings } from '@/lib/db';

export async function GET() {
  try {
    const bookings = await getBookings();
    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch bookings', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerName, phone, serviceType, serviceName, address, notes } = body;

    if (!customerName || !phone) {
      return NextResponse.json(
        { success: false, message: 'Name and phone number are required' },
        { status: 400 }
      );
    }

    const bookings = await getBookings();
    const newBooking = {
      id: `lead-${Date.now()}`,
      customerName: customerName.trim(),
      phone: phone.trim(),
      serviceType: serviceType || 'ac',
      serviceName: serviceName || 'General Inspection',
      address: address ? address.trim() : '',
      notes: notes ? notes.trim() : '',
      status: 'New',
      createdAt: new Date().toISOString()
    };

    bookings.unshift(newBooking);
    try {
      await saveBookings(bookings);
    } catch (saveErr) {
      console.warn('Booking save warning:', saveErr.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Booking request received! Our technician will call you shortly.',
      data: newBooking
    }, { status: 201 });
  } catch (error) {
    console.error('Bookings API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit booking', error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'Booking ID and status are required' },
        { status: 400 }
      );
    }

    const bookings = await getBookings();
    const index = bookings.findIndex((b) => b.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    bookings[index].status = status;
    bookings[index].updatedAt = new Date().toISOString();
    await saveBookings(bookings);

    return NextResponse.json({
      success: true,
      message: 'Booking status updated',
      data: bookings[index]
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update booking status', error: error.message },
      { status: 500 }
    );
  }
}
