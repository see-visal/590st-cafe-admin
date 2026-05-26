import { NextResponse, NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/orders",
    "/barista",
    "/products",
    "/categories",
    "/inventory",
    "/customers",
    "/ratings",
    "/report",
    "/settings",
  ],
};
