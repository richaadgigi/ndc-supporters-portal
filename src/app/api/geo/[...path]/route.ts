import { NextRequest, NextResponse } from 'next/server';

const TARGET = (process.env.NEXT_PUBLIC_GEO_API_URL ?? '').replace(/\/+$/, '');
const API_KEY = process.env.NEXT_PUBLIC_GEO_API_KEY ?? '';
const USERNAME = process.env.NEXT_PUBLIC_GEO_API_USERNAME ?? '';

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  if (!TARGET || !API_KEY || !USERNAME) {
    return NextResponse.json({ detail: 'Geography API is not configured on the server.' }, { status: 500 });
  }

  const { path } = await context.params;
  const url = `${TARGET}/api/v1/geography/${path.join('/')}/${req.nextUrl.search}`;

  try {
    const upstream = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY,
        'X-Username': USERNAME,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') ?? 'application/json',
        'cache-control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message ?? 'Upstream request failed' }, { status: 502 });
  }
}
