import { NextRequest, NextResponse } from "next/server";
import { load } from "@/utils/storage";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Check in synced external doctors
    const doctors = load<any[]>("external_doctors", []);
    const doctor = doctors.find((d) => d.email === email);

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found or not registered by admin" }, { status: 404 });
    }

    if (doctor.status !== "APPROVED") {
      return NextResponse.json({ error: "Doctor is not approved yet" }, { status: 403 });
    }

    return NextResponse.json({ success: true, doctor });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

