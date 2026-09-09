import { NextResponse, NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  void req;
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/pos",
    "/orders",
    "/barista",
    "/products",
    "/categories",
    "/inventory",
    "/customers",
    "/promotions",
    "/ratings",
    "/report",
    "/staff",
    "/settings",
  ],
};
