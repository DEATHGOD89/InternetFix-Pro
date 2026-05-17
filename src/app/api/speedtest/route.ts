import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
// Using edge runtime is ideal for streaming to avoid Vercel's Node.js response limits/buffering
export const runtime = 'edge';

// Pre-generate a 1MB buffer of random data ONCE to avoid severe CPU bottleneck during streaming.
// Generating random bytes inside the stream loop artificially limits the download speed to the server's CPU speed.
const CHUNK_SIZE = 1024 * 1024; // 1MB
const randomBuffer = new Uint8Array(CHUNK_SIZE);

// In Edge runtime, globalThis.crypto is available
if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
  const quota = 65536;
  for (let i = 0; i < CHUNK_SIZE; i += quota) {
    const len = Math.min(quota, CHUNK_SIZE - i);
    crypto.getRandomValues(randomBuffer.subarray(i, i + len));
  }
} else {
  // Fallback
  for (let i = 0; i < CHUNK_SIZE; i++) {
    randomBuffer[i] = Math.floor(Math.random() * 256);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sizeParam = searchParams.get('size');
  
  // High-capacity payload (up to 250MB per stream)
  const sizeInBytes = sizeParam ? parseInt(sizeParam, 10) : 100 * 1024 * 1024;
  const safeSize = Math.min(sizeInBytes, 250 * 1024 * 1024);

  const stream = new ReadableStream({
    async start(controller) {
      let sent = 0;

      while (sent < safeSize) {
        const remaining = safeSize - sent;
        const toSend = Math.min(CHUNK_SIZE, remaining);
        
        if (toSend === CHUNK_SIZE) {
          controller.enqueue(randomBuffer);
        } else {
          controller.enqueue(randomBuffer.slice(0, toSend));
        }
        
        sent += toSend;
        
        // Yield to the event loop occasionally to avoid blocking completely
        if (sent % (CHUNK_SIZE * 5) === 0) {
            await new Promise(r => setTimeout(r, 0));
        }
      }
      controller.close();
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': safeSize.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

export async function POST(request: Request) {
  try {
    const reader = request.body?.getReader();
    if (!reader) return NextResponse.json({ success: true });
    
    // EXTREMELY FAST DISCARD: Consume bytes without any processing
    let received = 0;
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.length;
    }
    
    return NextResponse.json({ receivedBytes: received });
  } catch (error) {
    return NextResponse.json({ error: 'Upload discarded with error' }, { status: 500 });
  }
}

export async function HEAD() {
    return new NextResponse(null, {
        headers: { 
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Connection': 'keep-alive'
        }
    });
}
