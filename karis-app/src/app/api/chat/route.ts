import { NextRequest, NextResponse } from 'next/server';
import { processUpdate } from '@/lib/ai';
import {
  getProfile,
  addSkill,
  addExperience,
  addEducation,
  addProject,
  addCertification,
  updateProfile,
  addChatEntry,
  getChatHistory,
} from '@/lib/database';

// POST - send a message to update profile
export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ success: false, error: 'No message provided' }, { status: 400 });
    }

    const profile = getProfile();
    if (!profile) {
      return NextResponse.json({ success: false, error: 'No profile found. Please upload your CV first.' }, { status: 404 });
    }

    // Process with AI
    const result = await processUpdate(profile, message);
    const updates = result.updates || {};
    const changesSummary: string[] = [];

    const pid = profile.id as number;

    // Apply new skills
    if (updates.new_skills && Array.isArray(updates.new_skills)) {
      for (const skill of updates.new_skills) {
        const s = skill as { skill_name: string; proficiency?: string; category?: string };
        addSkill(pid, s.skill_name, s.proficiency, s.category);
        changesSummary.push(`Added skill: ${s.skill_name}`);
      }
    }

    // Apply new experience
    if (updates.new_experience && Array.isArray(updates.new_experience)) {
      for (const exp of updates.new_experience) {
        addExperience(pid, exp as { company: string; title: string; location?: string; start_date?: string; end_date?: string; is_current?: boolean; description?: string });
        changesSummary.push(`Added experience: ${(exp as { title: string }).title}`);
      }
    }

    // Apply new education
    if (updates.new_education && Array.isArray(updates.new_education)) {
      for (const edu of updates.new_education) {
        addEducation(pid, edu as { institution: string; degree: string; field_of_study?: string; start_date?: string; end_date?: string; gpa?: string });
        changesSummary.push(`Added education: ${(edu as { degree: string }).degree}`);
      }
    }

    // Apply new projects
    if (updates.new_projects && Array.isArray(updates.new_projects)) {
      for (const proj of updates.new_projects) {
        addProject(pid, proj as { name: string; description?: string; technologies?: string; url?: string });
        changesSummary.push(`Added project: ${(proj as { name: string }).name}`);
      }
    }

    // Apply new certifications
    if (updates.new_certifications && Array.isArray(updates.new_certifications)) {
      for (const cert of updates.new_certifications) {
        addCertification(pid, cert as { name: string; issuer?: string; date?: string });
        changesSummary.push(`Added certification: ${(cert as { name: string }).name}`);
      }
    }

    // Apply profile updates
    if (updates.profile_updates && typeof updates.profile_updates === 'object' && Object.keys(updates.profile_updates).length > 0) {
      updateProfile(pid, updates.profile_updates as Record<string, string>);
      changesSummary.push('Updated profile info');
    }

    // Save chat history
    addChatEntry(pid, message, result.response, changesSummary.join('; '));

    const updatedProfile = getProfile();
    return NextResponse.json({
      success: true,
      response: result.response,
      changes: changesSummary,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Error processing chat:', error);
    return NextResponse.json({ success: false, error: 'Failed to process message' }, { status: 500 });
  }
}

// GET - get chat history
export async function GET() {
  try {
    const profile = getProfile();
    if (!profile) {
      return NextResponse.json({ success: true, history: [] });
    }
    const history = getChatHistory(profile.id as number);
    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error('Error getting chat history:', error);
    return NextResponse.json({ success: false, error: 'Failed to get chat history' }, { status: 500 });
  }
}
