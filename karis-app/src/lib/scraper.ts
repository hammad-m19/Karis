import puppeteer, { Browser, Page } from 'puppeteer';

export interface ScrapedJob {
  external_id: string;
  platform: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  work_mode: string;
  description: string;
  requirements: string;
  salary: string;
  url: string;
  posted_date: string;
}

interface SearchFilters {
  keywords: string;
  location: string;
  job_type: string; // full-time, part-time, internship, contract
  work_mode: string; // remote, hybrid, onsite
  date_posted: string; // 1, 3, 7, 14, 30
  platform: string; // linkedin, indeed, both
}

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.connected) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
      ],
    });
  }
  return browser;
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// LinkedIn job type mapping
function getLinkedInJobType(type: string): string {
  const map: Record<string, string> = {
    'full-time': 'F',
    'part-time': 'P',
    'contract': 'C',
    'internship': 'I',
    'temporary': 'T',
  };
  return map[type] || '';
}

// LinkedIn date filter mapping
function getLinkedInDateFilter(days: string): string {
  const map: Record<string, string> = {
    '1': 'r86400',
    '3': 'r259200',
    '7': 'r604800',
    '14': 'r1209600',
    '30': 'r2592000',
  };
  return map[days] || '';
}

// LinkedIn work mode mapping
function getLinkedInWorkMode(mode: string): string {
  const map: Record<string, string> = {
    'onsite': '1',
    'remote': '2',
    'hybrid': '3',
  };
  return map[mode] || '';
}

export async function searchLinkedIn(filters: SearchFilters): Promise<ScrapedJob[]> {
  const b = await getBrowser();
  const page = await b.newPage();
  
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  try {
    // Build LinkedIn job search URL
    const params = new URLSearchParams();
    params.set('keywords', filters.keywords);
    if (filters.location) params.set('location', filters.location);
    
    const jobType = getLinkedInJobType(filters.job_type);
    if (jobType) params.set('f_JT', jobType);
    
    const dateFilter = getLinkedInDateFilter(filters.date_posted);
    if (dateFilter) params.set('f_TPR', dateFilter);
    
    const workMode = getLinkedInWorkMode(filters.work_mode);
    if (workMode) params.set('f_WT', workMode);

    const searchUrl = `https://www.linkedin.com/jobs/search/?${params.toString()}`;
    
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);

    // Scroll to load more jobs
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, 1000));
      await delay(1000);
    }

    // Scrape job listings
    const jobs = await page.evaluate(() => {
      const jobCards = document.querySelectorAll('.base-card, .job-search-card, [data-entity-urn]');
      const results: {
        external_id: string;
        title: string;
        company: string;
        location: string;
        url: string;
        posted_date: string;
      }[] = [];

      jobCards.forEach((card) => {
        const titleEl = card.querySelector('.base-search-card__title, .job-search-card__title, h3');
        const companyEl = card.querySelector('.base-search-card__subtitle, .job-search-card__subtitle, h4');
        const locationEl = card.querySelector('.job-search-card__location, .base-search-card__metadata');
        const linkEl = card.querySelector('a[href*="/jobs/view/"], a[href*="linkedin.com/jobs"]') as HTMLAnchorElement;
        const dateEl = card.querySelector('time, .job-search-card__listdate');

        if (titleEl && companyEl && linkEl) {
          const url = linkEl.href || '';
          const idMatch = url.match(/\/jobs\/view\/(\d+)/);
          results.push({
            external_id: idMatch ? idMatch[1] : `li-${Date.now()}-${Math.random()}`,
            title: titleEl.textContent?.trim() || '',
            company: companyEl.textContent?.trim() || '',
            location: locationEl?.textContent?.trim() || '',
            url: url,
            posted_date: dateEl?.getAttribute('datetime') || dateEl?.textContent?.trim() || '',
          });
        }
      });

      return results;
    });

    // Get job descriptions for first 5 jobs
    const detailedJobs: ScrapedJob[] = [];
    for (const job of jobs.slice(0, 10)) {
      try {
        await page.goto(job.url, { waitUntil: 'networkidle2', timeout: 15000 });
        await delay(1500);

        // Click "Show more" if present
        const showMore = await page.$('.show-more-less-html__button, [aria-label="Show more"]');
        if (showMore) await showMore.click();
        await delay(500);

        const description = await page.evaluate(() => {
          const descEl = document.querySelector('.show-more-less-html__markup, .description__text, .jobs-description__content');
          return descEl?.textContent?.trim() || '';
        });

        detailedJobs.push({
          ...job,
          platform: 'linkedin',
          job_type: filters.job_type || '',
          work_mode: filters.work_mode || '',
          description: description,
          requirements: '',
          salary: '',
        });
      } catch {
        detailedJobs.push({
          ...job,
          platform: 'linkedin',
          job_type: filters.job_type || '',
          work_mode: filters.work_mode || '',
          description: '',
          requirements: '',
          salary: '',
        });
      }
    }

    await page.close();
    return detailedJobs;
  } catch (error) {
    console.error('LinkedIn scraping error:', error);
    await page.close();
    return [];
  }
}

export async function searchIndeed(filters: SearchFilters): Promise<ScrapedJob[]> {
  const b = await getBrowser();
  const page = await b.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  try {
    // Build Indeed search URL
    const params = new URLSearchParams();
    params.set('q', filters.keywords);
    if (filters.location) params.set('l', filters.location);
    
    // Date filter
    const dateMap: Record<string, string> = {
      '1': '1', '3': '3', '7': '7', '14': '14', '30': '30',
    };
    if (dateMap[filters.date_posted]) {
      params.set('fromage', dateMap[filters.date_posted]);
    }

    // Job type
    const typeMap: Record<string, string> = {
      'full-time': 'fulltime',
      'part-time': 'parttime',
      'contract': 'contract',
      'internship': 'internship',
      'temporary': 'temporary',
    };
    if (typeMap[filters.job_type]) {
      params.set('jt', typeMap[filters.job_type]);
    }

    // Remote filter
    if (filters.work_mode === 'remote') {
      params.set('remotejob', '032b3046-06a3-4876-8dfd-474eb5e7ed11');
    }

    const searchUrl = `https://www.indeed.com/jobs?${params.toString()}`;
    
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);

    // Scrape job listings
    const jobs = await page.evaluate(() => {
      const jobCards = document.querySelectorAll('.job_seen_beacon, .jobsearch-ResultsList > li, [data-jk]');
      const results: {
        external_id: string;
        title: string;
        company: string;
        location: string;
        salary: string;
        url: string;
        posted_date: string;
        description: string;
      }[] = [];

      jobCards.forEach((card) => {
        const titleEl = card.querySelector('.jobTitle a, h2.jobTitle a, [data-jk] a') as HTMLAnchorElement;
        const companyEl = card.querySelector('.companyName, [data-testid="company-name"], .company');
        const locationEl = card.querySelector('.companyLocation, [data-testid="text-location"]');
        const salaryEl = card.querySelector('.salary-snippet-container, .metadata.salary-snippet-container');
        const dateEl = card.querySelector('.date, .myJobsState');
        const snippetEl = card.querySelector('.job-snippet, .underShelfFooter');

        if (titleEl) {
          const jk = card.getAttribute('data-jk') || titleEl.getAttribute('data-jk') || `ind-${Date.now()}-${Math.random()}`;
          results.push({
            external_id: jk,
            title: titleEl.textContent?.trim() || '',
            company: companyEl?.textContent?.trim() || '',
            location: locationEl?.textContent?.trim() || '',
            salary: salaryEl?.textContent?.trim() || '',
            url: titleEl.href ? titleEl.href : `https://www.indeed.com/viewjob?jk=${jk}`,
            posted_date: dateEl?.textContent?.trim() || '',
            description: snippetEl?.textContent?.trim() || '',
          });
        }
      });

      return results;
    });

    // Get detailed descriptions for first 10 jobs
    const detailedJobs: ScrapedJob[] = [];
    for (const job of jobs.slice(0, 10)) {
      try {
        const jobUrl = job.url.startsWith('http') ? job.url : `https://www.indeed.com${job.url}`;
        await page.goto(jobUrl, { waitUntil: 'networkidle2', timeout: 15000 });
        await delay(1500);

        const description = await page.evaluate(() => {
          const descEl = document.querySelector('#jobDescriptionText, .jobsearch-jobDescriptionText');
          return descEl?.textContent?.trim() || '';
        });

        detailedJobs.push({
          external_id: job.external_id,
          platform: 'indeed',
          title: job.title,
          company: job.company,
          location: job.location,
          job_type: filters.job_type || '',
          work_mode: filters.work_mode || '',
          description: description || job.description,
          requirements: '',
          salary: job.salary,
          url: jobUrl,
          posted_date: job.posted_date,
        });
      } catch {
        detailedJobs.push({
          external_id: job.external_id,
          platform: 'indeed',
          title: job.title,
          company: job.company,
          location: job.location,
          job_type: filters.job_type || '',
          work_mode: filters.work_mode || '',
          description: job.description,
          requirements: '',
          salary: job.salary,
          url: job.url,
          posted_date: job.posted_date,
        });
      }
    }

    await page.close();
    return detailedJobs;
  } catch (error) {
    console.error('Indeed scraping error:', error);
    await page.close();
    return [];
  }
}

export async function searchJobs(filters: SearchFilters): Promise<ScrapedJob[]> {
  const results: ScrapedJob[] = [];

  if (filters.platform === 'linkedin' || filters.platform === 'both') {
    const linkedInJobs = await searchLinkedIn(filters);
    results.push(...linkedInJobs);
  }

  if (filters.platform === 'indeed' || filters.platform === 'both') {
    const indeedJobs = await searchIndeed(filters);
    results.push(...indeedJobs);
  }

  return results;
}

export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}
