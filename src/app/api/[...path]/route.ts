import { NextRequest, NextResponse } from "next/server";

const BACKEND_ORIGIN = "http://localhost:8080";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return forward(req, (await ctx.params).path);
}
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return forward(req, (await ctx.params).path);
}
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return forward(req, (await ctx.params).path);
}
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return forward(req, (await ctx.params).path);
}
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return forward(req, (await ctx.params).path);
}
export async function OPTIONS(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return forward(req, (await ctx.params).path);
}

async function forward(req: NextRequest, pathSegments: string[]) {
  const upstreamUrl = new URL(`${BACKEND_ORIGIN}/${pathSegments.join("/")}`);
  upstreamUrl.search = req.nextUrl.search;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("content-length");

  const method = req.method;
  const body =
    method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer();

  const upstreamRes = await fetch(upstreamUrl, {
    method,
    headers,
    body,
    redirect: "manual",
  });

  const resHeaders = new Headers(upstreamRes.headers);
  resHeaders.delete("content-encoding");

  const data = await upstreamRes.arrayBuffer();

  return new NextResponse(data, {
    status: upstreamRes.status,
    headers: resHeaders,
  });
}
