import { NextResponse } from 'next/server';
import { webcrypto } from 'crypto';

const cryptoObj = (globalThis.crypto as any) || webcrypto;

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sizeParam = searchParams.get('size');
  
  // High-capacity payload (up to 250MB per stream)
  const sizeInBytes = sizeParam ? parseInt(sizeParam, 10) : 100 * 1024 * 1024;
  const safeSize = Math.min(sizeInBytes, 250 * 1024 * 1024);

  const stream = new ReadableStream({
    async start(controller) {
      let sent = 0;
      const chunkSize = 1024 * 1024; // 1MB
      const buffer = new Uint8Array(chunkSize);
      const quota = 65536; // 64KB limit for getRandomValues

      while (sent < safeSize) {
        const remaining = safeSize - sent;
        const toSend = Math.min(chunkSize, remaining);
        
        // Fill buffer in chunks to avoid QuotaExceededError (64KB limit)
        for (let i = 0; i < toSend; i += quota) {
          const len = Math.min(quota, toSend - i);
          cryptoObj.getRandomValues(buffer.subarray(i, i + len));
        }
        
        if (toSend === chunkSize) {
          controller.enqueue(new Uint8Array(buffer));
        } else {
          controller.enqueue(buffer.slice(0, toSend));
        }
        
        sent += toSend;
        
        if (sent % (chunkSize * 8) === 0) {
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
