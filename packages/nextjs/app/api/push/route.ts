import { NextRequest, NextResponse } from 'next/server';
import { sendPushNotification } from '@/utils/push';

export async function POST(req: NextRequest) {
  try {
    const { title, body, recipient } = await req.json();

    if (!title || !body || !recipient) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await sendPushNotification({ title, body, recipient });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Notification failed' }, { status: 500 });
  }
}