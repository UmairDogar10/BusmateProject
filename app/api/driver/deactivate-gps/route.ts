import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import { Bus as BusModel } from "@/models";

/**
 * Clears live GPS sharing for the authenticated driver's assigned bus.
 * Called on logout so students no longer see a stale marker.
 */
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getCurrentUser(request);
    if (error || !user) {
      return NextResponse.json({ ok: true });
    }
    if (user.role !== "driver") {
      return NextResponse.json({ ok: true });
    }

    await dbConnect();
    await BusModel.updateOne({ driverId: user._id }, { $set: { isGpsActive: false } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("deactivate-gps error:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
