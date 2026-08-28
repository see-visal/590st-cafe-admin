import { NextResponse, type NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  void req;
  return NextResponse.next();
}

/** Every admin route. Keep in sync with src/app/(admin). */
export const config = {
  matcher: [
    "/",
    "/audit-logs",
    "/barista-queue",
    "/categories",
    "/customers",
    "/dashboard",
    "/inventory/:path*",
    "/notifications",
    "/orders",
    "/payments",
    "/points",
    "/pos",
    "/products/:path*",
    "/promotions/:path*",
    "/reports",
    "/settings",
    "/staff",
  ],
};
