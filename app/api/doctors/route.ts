import { NextRequest, NextResponse } from 'next/server'
import { load, save } from '@/utils/storage'

// GET /api/doctors - Get all external doctors
export async function GET() {
  try {
    const doctors = load<any[]>('external_doctors', [])
    return NextResponse.json({ doctors })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    )
  }
}

// POST /api/doctors - Sync external doctor data
export async function POST(request: NextRequest) {
  try {
    const doctorData = await request.json()
    
    // Validate required fields
    if (!doctorData.id || !doctorData.email || !doctorData.name) {
      return NextResponse.json(
        { error: 'Missing required fields: id, email, name' },
        { status: 400 }
      )
    }

    const doctors = load<any[]>('external_doctors', [])
    const existingIndex = doctors.findIndex(d => d.id === doctorData.id)
    
    if (existingIndex !== -1) {
      // Update existing doctor
      doctors[existingIndex] = { 
        ...doctors[existingIndex], 
        ...doctorData,
        updatedAt: new Date().toISOString()
      }
    } else {
      // Add new doctor
      doctors.push({
        ...doctorData,
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      })
    }
    
    save('external_doctors', doctors)
    
    // Log the sync operation
    const audits = load<any[]>('audits', [])
    audits.push({
      id: `audit_${Date.now()}`,
      actor: { system: 'EXTERNAL_API', action: 'DOCTOR_SYNC' },
      action: existingIndex !== -1 ? 'DOCTOR_UPDATE' : 'DOCTOR_CREATE',
      target: { doctorId: doctorData.id },
      at: new Date().toISOString()
    })
    save('audits', audits)
    
    return NextResponse.json({ 
      success: true, 
      message: existingIndex !== -1 ? 'Doctor updated' : 'Doctor created',
      doctorId: doctorData.id
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to sync doctor data' },
      { status: 500 }
    )
  }
}




