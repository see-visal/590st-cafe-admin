import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json({ error: "Auth disabled" }, { status: 404 });
}

export async function POST() {
	return NextResponse.json({ error: "Auth disabled" }, { status: 404 });
}
