import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Web Standards way to consume and discard a ReadableStream
    const reader = request.body?.getReader();
    if (reader) {
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
