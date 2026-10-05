import { NextRequest, NextResponse } from 'next/server';
import { parseCV } from '@/lib/ai';
import {
  createProfile,
  getProfile,
  updateProfile,
  addSkill,
  addExperience,
  addEducation,
  addProject,
  addCertification,
} from '@/lib/database';

// GET - get current profile
export async function GET() {
  try {
    const profile = getProfile();
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Error getting profile:', error);
    return NextResponse.json({ success: false, error: 'Failed to get profile' }, { status: 500 });
  }
}

// POST - upload and parse CV
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('cv') as File;
    const manualText = formData.get('text') as string;

    let cvText = manualText || '';

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      
      if (file.name.endsWith('.pdf')) {
        // Dynamic import for pdf-parse (use require to bypass default export issues)
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(buffer);
        cvText = pdfData.text;
      } else if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        cvText = buffer.toString('utf-8');
      } else {
        // Try to read as text
        cvText = buffer.toString('utf-8');
      }
    }

    if (!cvText.trim()) {
      return NextResponse.json({ success: false, error: 'No CV text provided' }, { status: 400 });
    }

    // Parse with AI
    const parsed = await parseCV(cvText);

    // Save to database
    const profileId = createProfile({
      full_name: parsed.full_name,
      email: parsed.email,
      phone: parsed.phone,
      location: parsed.location,
      summary: parsed.summary,
      linkedin_url: parsed.linkedin_url,
      portfolio_url: parsed.portfolio_url,
      raw_cv_text: cvText,
    });

    const pid = Number(profileId);

    // Save skills
    for (const skill of parsed.skills || []) {
      addSkill(pid, skill.skill_name, skill.proficiency, skill.category);
    }

    // Save experience
    for (const exp of parsed.experience || []) {
      addExperience(pid, exp);
    }

    // Save education
    for (const edu of parsed.education || []) {
      addEducation(pid, edu);
    }

    // Save projects
    for (const proj of parsed.projects || []) {
      addProject(pid, proj);
    }

    // Save certifications
    for (const cert of parsed.certifications || []) {
      addCertification(pid, cert);
    }

    const profile = getProfile();
    return NextResponse.json({ success: true, profile, message: 'CV parsed and profile created!' });
  } catch (error) {
    console.error('Error parsing CV:', error);
    return NextResponse.json({ success: false, error: 'Failed to parse CV' }, { status: 500 });
  }
}

// PUT - update profile manually
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const profile = getProfile();
    
    if (!profile) {
      return NextResponse.json({ success: false, error: 'No profile found' }, { status: 404 });
    }

    updateProfile(profile.id as number, data);
    const updated = getProfile();
    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
  }
}
