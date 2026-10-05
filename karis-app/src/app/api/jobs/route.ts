import { NextRequest, NextResponse } from 'next/server';
import { searchJobs } from '@/lib/scraper';
import { saveJob, getJobs } from '@/lib/database';

// POST - search for jobs
export async function POST(request: NextRequest) {
  try {
    const filters = await request.json();

    if (!filters.keywords) {
      return NextResponse.json({ success: false, error: 'Keywords are required' }, { status: 400 });
    }

    const jobs = await searchJobs({
      keywords: filters.keywords || '',
      location: filters.location || '',
      job_type: filters.job_type || '',
      work_mode: filters.work_mode || '',
      date_posted: filters.date_posted || '7',
      platform: filters.platform || 'both',
    });

    // Save jobs to database
    for (const job of jobs) {
      saveJob(job);
    }

    return NextResponse.json({ success: true, jobs, count: jobs.length });
  } catch (error) {
    console.error('Error searching jobs:', error);
    return NextResponse.json({ success: false, error: 'Failed to search jobs' }, { status: 500 });
  }
}

// GET - get saved jobs with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobs = getJobs({
      platform: searchParams.get('platform') || undefined,
      job_type: searchParams.get('job_type') || undefined,
      work_mode: searchParams.get('work_mode') || undefined,
      search: searchParams.get('search') || undefined,
    });
    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    console.error('Error getting jobs:', error);
    return NextResponse.json({ success: false, error: 'Failed to get jobs' }, { status: 500 });
  }
}
