import { NextRequest, NextResponse } from "next/server"
import { load, save } from "@/utils/storage"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, verifiedBy } = await request.json()

    if (!status || !["PENDING", "APPROVED", "REJECTED", "SUSPENDED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const doctors = load<any[]>('external_doctors', [])
    const doctorIndex = doctors.findIndex(d => d.id === params.id)

    if (doctorIndex === -1) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    // Update the doctor
    doctors[doctorIndex] = {
      ...doctors[doctorIndex],
      status,
      verifiedBy,
      verifiedAt: new Date().toISOString(),
    }

    save('external_doctors', doctors)

    // Log the update
    const audits = load<any[]>('audits', [])
    audits.push({
      id: `audit_${Date.now()}`,
      actor: { system: 'ADMIN', action: 'DOCTOR_STATUS_UPDATE' },
      action: 'DOCTOR_STATUS_CHANGE',
      target: { doctorId: params.id, newStatus: status },
      at: new Date().toISOString()
    })
    save('audits', audits)

    return NextResponse.json({
      success: true,
      message: `Doctor updated to ${status}`,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}


