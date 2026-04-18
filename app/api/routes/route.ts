import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Route as RouteModel } from "@/models";

export async function GET() {
  try {
    await dbConnect();
    const rows = await RouteModel.find({}).limit(50).lean();
    return NextResponse.json({ rows });
  } catch (error: any) {
    console.error("Routes fetch error:", error);
    return NextResponse.json(
      { error: "Unable to fetch routes." },
      { status: 500 },
    );
  }
}
