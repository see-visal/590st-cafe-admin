import { NextResponse, NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  void req;
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
    "/staff",
    "/settings",
  ],
};
