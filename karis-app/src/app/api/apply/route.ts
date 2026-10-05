import { NextRequest, NextResponse } from 'next/server';
import { tailorCV } from '@/lib/ai';
import { getProfile, saveApplication, getApplications, updateApplicationStatus } from '@/lib/database';

// POST - tailor CV and create application
export async function POST(request: NextRequest) {
  try {
    const { job_id, job_title, company, description } = await request.json();

    const profile = getProfile();
    if (!profile) {
      return NextResponse.json({ success: false, error: 'No profile found' }, { status: 404 });
    }

    // Generate tailored CV
    const { tailored_cv, cover_letter } = await tailorCV(
      profile,
      description,
      job_title,
      company
    );

    // Save application
    const appId = saveApplication({
      job_id,
      profile_id: profile.id as number,
      tailored_cv,
      cover_letter,
      status: 'cv_ready',
    });

    return NextResponse.json({
      success: true,
      application_id: appId,
      tailored_cv,
      cover_letter,
    });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json({ success: false, error: 'Failed to tailor CV' }, { status: 500 });
  }
}

// GET - get all applications
export async function GET() {
  try {
    const applications = getApplications();
    return NextResponse.json({ success: true, applications });
  } catch (error) {
    console.error('Error getting applications:', error);
    return NextResponse.json({ success: false, error: 'Failed to get applications' }, { status: 500 });
  }
}

// PUT - update application status
export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    updateApplicationStatus(id, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json({ success: false, error: 'Failed to update application' }, { status: 500 });
  }
}
