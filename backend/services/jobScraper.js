import axios from 'axios'
import * as cheerio from 'cheerio'

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15',
]

function getRandomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchWithRetry(url, opts = {}, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        ...opts,
        headers: {
          'User-Agent': getRandomUA(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,ar;q=0.6',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          ...(opts.headers || {}),
        },
        timeout: 25000,
        maxRedirects: 5,
      })
      return response
    } catch (err) {
      if (attempt === retries) throw err
      const waitMs = attempt * 1500 + Math.random() * 1000
      await delay(waitMs)
    }
  }
}

function normalizeText(text) {
  if (!text) return ''
  return text.replace(/[\t\r]+/g, ' ').replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim()
}

function inferContractType(title, description = '') {
  const t = `${title} ${description}`.toLowerCase()
  if (t.includes('stage') || t.includes('intern') || t.includes('stagiaire') || t.includes('pfe') || t.includes('pfm')) return 'Stage'
  if (t.includes('freelance') || t.includes('consultant') || t.includes('indépendant') || t.includes('mission')) return 'Freelance'
  if (t.includes('cdd') || t.includes('contract') || t.includes('temporaire') || t.includes('interim') || t.includes('intérim')) return 'CDD'
  if (t.includes('temps partiel') || t.includes('part-time') || t.includes('mi-temps')) return 'Temps partiel'
  if (t.includes('alternance') || t.includes('apprentissage')) return 'Alternance'
  return 'CDI'
}

function parseRelativeDate(text) {
  if (!text) return null
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const now = new Date()

  const patterns = [
    { regex: /(\d+)\s*minute/, ms: (n) => n * 60 * 1000 },
    { regex: /(\d+)\s*heure/, ms: (n) => n * 3600 * 1000 },
    { regex: /(\d+)\s*jour/, ms: (n) => n * 86400000 },
    { regex: /(\d+)\s*semaine/, ms: (n) => n * 7 * 86400000 },
    { regex: /(\d+)\s*mois/, ms: (n) => n * 30 * 86400000 },
    { regex: /(\d+)\s*an/, ms: (n) => n * 365 * 86400000 },
  ]

  if (lower.includes('aujourd') || lower.includes('today') || lower.includes('maintenant')) return now
  if (lower.includes('hier') || lower.includes('yesterday')) return new Date(now - 86400000)

  for (const { regex, ms } of patterns) {
    const match = lower.match(regex)
    if (match) return new Date(now - ms(parseInt(match[1])))
  }
  return null
}

function parseExactDate(text) {
  if (!text) return null
  const lower = text.toLowerCase().trim()

  const isoMatch = lower.match(/(\d{4}[-/]\d{2}[-/]\d{2})/)
  if (isoMatch) {
    const d = new Date(isoMatch[1])
    if (!isNaN(d.getTime())) return d
  }

  const frMonths = {
    janvier: 0, fevrier: 1, mars: 2, avril: 3, mai: 4, juin: 5,
    juillet: 6, aout: 7, septembre: 8, octobre: 9, novembre: 10, decembre: 11,
  }
  const frMatch = lower.match(/(\d{1,2})\s*(janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre)\s*(\d{4})?/)
  if (frMatch) {
    const day = parseInt(frMatch[1])
    const month = frMonths[frMatch[2]]
    const year = frMatch[3] ? parseInt(frMatch[3]) : now.getFullYear()
    if (month !== undefined) return new Date(year, month, day)
  }

  const usMatch = lower.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2}),?\s*(\d{4})?/)
  if (usMatch) {
    const months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 }
    const month = months[usMatch[1].slice(0, 3)]
    const day = parseInt(usMatch[2])
    const year = usMatch[3] ? parseInt(usMatch[3]) : new Date().getFullYear()
    if (month !== undefined) return new Date(year, month, day)
  }

  return null
}

function extractPostedDate($, card) {
  const selectors = [
    'time[datetime]',
    'time',
    '[data-testid="post-date"]',
    '.job-search-card__listdate',
    '.date',
    '.posted-date',
    '.job-date',
    'span[class*="date"]',
    'span[class*="time"]',
    '.age',
    '.new',
  ]

  for (const sel of selectors) {
    const el = $(card).find(sel).first()
    if (el.length) {
      const datetime = el.attr('datetime')
      if (datetime && datetime.includes('T')) {
        const d = new Date(datetime)
        if (!isNaN(d.getTime())) return d
      }
      const text = normalizeText(el.text())
      if (text) {
        const exact = parseExactDate(text)
        if (exact) return exact
        const relative = parseRelativeDate(text)
        if (relative) return relative
      }
    }
  }
  return null
}

// ─── RELEVANCE SCORING (enhanced) ───────────────────────────────────
function calculateRelevance(job, userProfile) {
  let score = 30
  if (!userProfile) return Math.floor(Math.random() * 20) + 50

  const userSkills = (userProfile.skills || []).map(s => s.toLowerCase())
  const userDomains = (userProfile.domains || []).map(d => d.toLowerCase())
  const userKeywords = (userProfile.searchKeywords || []).map(k => k.toLowerCase())
  const userExperience = (userProfile.experience || []).map(e => (e.position || '').toLowerCase())
  const userTitle = (userProfile.title || '').toLowerCase()

  const jobText = `${job.title} ${job.description || ''} ${job.sector || ''} ${(job.keywords || []).join(' ')}`.toLowerCase()

  let skillMatches = 0
  for (const skill of userSkills) {
    if (skill.length > 2 && jobText.includes(skill)) skillMatches++
  }
  score += Math.min(skillMatches * 8, 40)

  let domainMatch = false
  for (const domain of userDomains) {
    if (domain.length > 2 && (jobText.includes(domain) || (job.sector || '').toLowerCase().includes(domain))) {
      domainMatch = true
      break
    }
  }
  if (domainMatch) score += 20

  let keywordMatches = 0
  for (const kw of userKeywords) {
    if (kw.length > 2 && jobText.includes(kw)) keywordMatches++
  }
  score += Math.min(keywordMatches * 5, 15)

  let titleMatch = false
  if (userTitle) {
    const titleWords = userTitle.split(/\s+/).filter(w => w.length > 3)
    for (const w of titleWords) {
      if (jobText.includes(w)) { titleMatch = true; break }
    }
  }
  if (titleMatch) score += 10

  let expMatch = false
  for (const exp of userExperience) {
    const expWords = exp.split(/\s+/).filter(w => w.length > 4)
    for (const w of expWords) {
      if (jobText.includes(w)) { expMatch = true; break }
    }
    if (expMatch) break
  }
  if (expMatch) score += 5

  if (job.description && job.description.length > 100) score += 3
  if (job.postedAt) {
    const daysSince = (Date.now() - new Date(job.postedAt).getTime()) / 86400000
    if (daysSince < 3) score += 5
    else if (daysSince < 7) score += 3
    else if (daysSince < 14) score += 1
    else if (daysSince > 30) score -= 5
  }

  return Math.min(Math.max(score, 10), 99)
}

// ─── LINKEDIN SCRAPER ───────────────────────────────────────────────
async function scrapeLinkedIn(keywords, location = 'Morocco', userProfile = null) {
  const jobs = []
  const pages = [0, 25, 50, 75]

  for (const pageNum of pages) {
    try {
      const searchQuery = encodeURIComponent(keywords.slice(0, 5).join(' OR '))
      const url = `https://www.linkedin.com/jobs/search?keywords=${searchQuery}&location=${encodeURIComponent(location)}&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=${pageNum}&f_TPR=r604800&f_E=2%2C3&sortBy=DD`

      const { data } = await fetchWithRetry(url, {
        headers: {
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        },
      })

      const $ = cheerio.load(data)

      const cardSelectors = [
        '.base-card',
        '.job-search-card',
        'li.jobs-search__result-card',
        '.base-search-card',
        '[data-entity-urn]',
        '.job-search-card__list-item',
      ]

      let foundOnPage = 0
      for (const cardSel of cardSelectors) {
        $(cardSel).each((_, el) => {
          const card = $(el)
          const title = normalizeText(
            card.find('.base-search-card__title, .result__title, h3.base-card__full-link, h3, .job-search-card__title').text()
          )
          const company = normalizeText(
            card.find('.base-search-card__subtitle, .result__company, h4.base-search-card__subtitle, .hidden-nested-link, .job-search-card__company-name').text()
          )
          const loc = normalizeText(
            card.find('.job-search-card__location, .result__location, .job-search-card__bullet').text()
          )

          const linkEl = card.find('a.base-card__full-link, a.base-search-card__full-link, a.result__card, a[href*="/jobs/view/"]')
          const href = (linkEl.attr('href') || '').split('?')[0]
          const sourceUrl = href.startsWith('http') ? href : `https://www.linkedin.com${href}`

          const postedAt = extractPostedDate($, card) || new Date()

          let description = normalizeText(
            card.find('.base-search-card__description, .job-search-card__snippet, .show-more-less-html__markup, .job-search-card__description-snippet').text()
          )
          if (!description || description.length < 20) {
            description = normalizeText(card.find('p, span.description, .entity-result__summary').text().slice(0, 500))
          }

          const salaryText = normalizeText(card.find('.salary, .job-search-card__salary-info').text())

          if (title && title.length > 3) {
            jobs.push({
              title,
              company: company || 'Non spécifié',
              location: loc || location,
              sourceUrl,
              source: 'linkedin',
              postedAt,
              contractType: inferContractType(title, description),
              description: description.slice(0, 2500),
              sector: '',
              salary: salaryText ? { min: 0, max: 0, currency: 'MAD', period: 'monthly' } : undefined,
              keywords: title.split(/\s+/).filter(w => w.length > 3).slice(0, 8),
            })
            foundOnPage++
          }
        })
      }

      if (foundOnPage === 0 && pageNum === 0) break
      await delay(2000 + Math.random() * 2000)
    } catch (error) {
      console.error(`LinkedIn page ${pageNum} error:`, error.message)
      if (pageNum === 0) break
    }
  }

  // Deduplicate
  const seen = new Set()
  const unique = jobs.filter(j => {
    const key = `${j.title.toLowerCase()}|${j.company.toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return unique.map(j => ({ ...j, relevanceScore: calculateRelevance(j, userProfile) }))
}

// ─── INDEED SCRAPER ───────────────────────────────────────────────
async function scrapeIndeed(keywords, location = 'Maroc', userProfile = null) {
  const jobs = []
  const pages = ['0', '10', '20', '30']

  for (const start of pages) {
    try {
      const searchQuery = encodeURIComponent(keywords.slice(0, 4).join(' '))
      const url = `https://ma.indeed.com/jobs?q=${searchQuery}&l=${encodeURIComponent(location)}&sort=date&start=${start}&fromage=14`

      const { data } = await fetchWithRetry(url)

      const $ = cheerio.load(data)

      const cardSelectors = [
        'div.job_seen_beacon',
        'div.jobsearch-ResultsList div.result',
        'td.resultContent',
        '.resultContent',
        '.jobsearch-SerpJobCard',
        '.result',
        'div[data-testid="slider_item"]',
      ]

      let foundOnPage = 0
      for (const cardSel of cardSelectors) {
        $(cardSel).each((_, el) => {
          const card = $(el)
          const titleEl = card.find('h2.jobTitle a, a.jcs-JobTitle, h2 a, a[data-jk], .jobTitle a')
          const title = normalizeText(titleEl.text())
          const company = normalizeText(
            card.find('span[data-testid="company-name"], .companyName, .company, span.company, [data-testid="company-name"]').text()
          )
          const loc = normalizeText(
            card.find('div[data-testid="text-location"], .companyLocation, .location, [data-testid="text-location"]').text()
          )

          const href = titleEl.attr('href') || ''
          const sourceUrl = href.startsWith('http') ? href.split('&')[0] : `https://ma.indeed.com${href.split('&')[0]}`

          const postedAt = extractPostedDate($, card) || new Date()

          const description = normalizeText(
            card.find('.job-snippet, .jobCardShelfContainer, .jobsearch-jobDescriptionText, .jobCardShelf .job-snippet').text()
          )

          const salaryText = normalizeText(card.find('.salary-snippet, .attribute_snippet, [data-testid="attribute_snippet_testid"]').text())

          if (title && title.length > 3) {
            jobs.push({
              title,
              company: company || 'Non spécifié',
              location: loc || location,
              sourceUrl,
              source: 'indeed',
              postedAt,
              contractType: inferContractType(title, description),
              description: description.slice(0, 2500),
              sector: '',
              salary: salaryText ? { min: 0, max: 0, currency: 'MAD', period: 'monthly' } : undefined,
              keywords: title.split(/\s+/).filter(w => w.length > 3).slice(0, 8),
            })
            foundOnPage++
          }
        })
      }

      if (foundOnPage === 0 && start === '0') break
      await delay(2500 + Math.random() * 2000)
    } catch (error) {
      console.error(`Indeed page ${start} error:`, error.message)
      if (start === '0') break
    }
  }

  const seen = new Set()
  const unique = jobs.filter(j => {
    const key = `${j.title.toLowerCase()}|${j.company.toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return unique.map(j => ({ ...j, relevanceScore: calculateRelevance(j, userProfile) }))
}

// ─── REKRUTE SCRAPER ───────────────────────────────────────────────
async function scrapeRekrute(keywords, userProfile = null) {
  const jobs = []
  try {
    const searchQuery = encodeURIComponent(keywords.slice(0, 4).join(' '))
    const url = `https://www.rekrute.com/offres-emploi?mots-cles=${searchQuery}&tri=date&datePublication=semaine`

    const { data } = await fetchWithRetry(url)

    const $ = cheerio.load(data)

    const cardSelectors = [
      'div.offre-item',
      'li.offre',
      'div.job-item',
      'article.offre',
      '.offre-list-item',
      '.offre-block',
      'div[class*="offre"]',
    ]

    for (const cardSel of cardSelectors) {
      $(cardSel).each((_, el) => {
        const card = $(el)
        const titleEl = card.find('h2 a, h3 a, a.job-title, a.offre-title, a[title]')
        const title = normalizeText(titleEl.text()) || normalizeText(titleEl.attr('title') || '')
        const company = normalizeText(
          card.find('span.company, div.company-name, p.company, .offre-company, a.company').text()
        )
        const loc = normalizeText(
          card.find('span.location, div.location, span.ville, .offre-location, .city').text()
        )

        const href = titleEl.attr('href') || ''
        const sourceUrl = href.startsWith('http') ? href : `https://www.rekrute.com${href}`

        const postedAt = extractPostedDate($, card) || new Date()

        const description = normalizeText(
          card.find('.offre-description, .description, .job-description, p.short-description, .offre-text').first().text()
        )

        const salaryText = normalizeText(card.find('.salary, .salaire, .offre-salaire').text())

        if (title && title.length > 3) {
          jobs.push({
            title,
            company: company || 'Non spécifié',
            location: loc || 'Maroc',
            sourceUrl,
            source: 'rekrute',
            postedAt,
            contractType: inferContractType(title, description),
            description: description.slice(0, 2500),
            sector: '',
            salary: salaryText ? { min: 0, max: 0, currency: 'MAD', period: 'monthly' } : undefined,
            keywords: title.split(/\s+/).filter(w => w.length > 3).slice(0, 8),
          })
        }
      })
    }
  } catch (error) {
    console.error('Rekrute scraping error:', error.message)
  }

  const seen = new Set()
  const unique = jobs.filter(j => {
    const key = `${j.title.toLowerCase()}|${j.company.toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return unique.map(j => ({ ...j, relevanceScore: calculateRelevance(j, userProfile) }))
}

// ─── WELCOME TO THE JUNGLE SCRAPER ───────────────────────────────
async function scrapeWTTJ(keywords, location = 'Maroc', userProfile = null) {
  const jobs = []
  try {
    const searchQuery = encodeURIComponent(keywords.slice(0, 4).join(' '))
    const url = `https://www.welcometothejungle.com/fr/jobs?query=${searchQuery}&refinementList[locations][0]=Maroc&sortBy=mostRecent`

    const { data } = await fetchWithRetry(url)

    const $ = cheerio.load(data)

    const cardSelectors = [
      'article',
      '.card-job',
      '[data-testid="job-card"]',
      '.ais-Hits-item',
      '.ais-InfiniteHits-item',
      '[class*="JobCard"]',
      'a[href*="/fr/companies/"]',
    ]

    for (const cardSel of cardSelectors) {
      $(cardSel).each((_, el) => {
        const card = $(el)
        const title = normalizeText(
          card.find('h2, h3, .job-title, [data-testid="job-title"], .title, [class*="Title"]').text()
        )
        const company = normalizeText(
          card.find('.company-name, .job-company, [data-testid="company-name"], .company, [class*="Company"]').text()
        )
        const loc = normalizeText(
          card.find('.job-location, .location, [data-testid="location"], .city, [class*="Location"]').text()
        )
        const href = card.find('a').first().attr('href') || card.find('a[href*="/jobs/"]').attr('href') || ''
        const sourceUrl = href.startsWith('http') ? href : `https://www.welcometothejungle.com${href}`

        const description = normalizeText(
          card.find('.job-description, .description, p, [class*="Description"]').text()
        )

        const postedAt = extractPostedDate($, card) || new Date()

        if (title && title.length > 3) {
          jobs.push({
            title,
            company: company || 'Non spécifié',
            location: loc || location,
            sourceUrl,
            source: 'welcometothejungle',
            postedAt,
            contractType: inferContractType(title, description),
            description: description.slice(0, 2500),
            sector: '',
            keywords: title.split(/\s+/).filter(w => w.length > 3).slice(0, 8),
          })
        }
      })
    }
  } catch (error) {
    console.error('WTTJ scraping error:', error.message)
  }

  const seen = new Set()
  const unique = jobs.filter(j => {
    const key = `${j.title.toLowerCase()}|${j.company.toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return unique.map(j => ({ ...j, relevanceScore: calculateRelevance(j, userProfile) }))
}

// ─── MANPOWER SCRAPER ─────────────────────────────────────────────
async function scrapeManpower(keywords, location = 'Maroc', userProfile = null) {
  const jobs = []
  try {
    const searchQuery = encodeURIComponent(keywords.slice(0, 4).join(' '))
    const url = `https://www.manpower.ma/fr/recherche-d-emploi?keywords=${searchQuery}`

    const { data } = await fetchWithRetry(url)

    const $ = cheerio.load(data)

    const cardSelectors = [
      'article',
      '.job-offer',
      '.offer-item',
      '.card-job',
      '.result-item',
      'div[class*="offer"]',
      'div[class*="job"]',
    ]

    for (const cardSel of cardSelectors) {
      $(cardSel).each((_, el) => {
        const card = $(el)
        const title = normalizeText(card.find('h2, h3, .job-title, a').first().text())
        const company = normalizeText(card.find('.company, .company-name, .employer').text())
        const loc = normalizeText(card.find('.location, .job-location, .city').text())
        const href = card.find('a').first().attr('href') || ''
        const sourceUrl = href.startsWith('http') ? href : `https://www.manpower.ma${href}`

        const description = normalizeText(card.find('.description, p, .job-desc').text())
        const postedAt = extractPostedDate($, card) || new Date()

        if (title && title.length > 3) {
          jobs.push({
            title,
            company: company || 'Manpower Maroc',
            location: loc || location,
            sourceUrl,
            source: 'manpower',
            postedAt,
            contractType: inferContractType(title, description),
            description: description.slice(0, 2500),
            sector: '',
            keywords: title.split(/\s+/).filter(w => w.length > 3).slice(0, 8),
          })
        }
      })
    }
  } catch (error) {
    console.error('Manpower scraping error:', error.message)
  }

  const seen = new Set()
  const unique = jobs.filter(j => {
    const key = `${j.title.toLowerCase()}|${j.company.toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return unique.map(j => ({ ...j, relevanceScore: calculateRelevance(j, userProfile) }))
}

// ─── MAIN SCRAPING ORCHESTRATOR ───────────────────────────────────
export async function scrapeAllSources(keywords, location = 'Maroc', enabledSources = ['linkedin', 'indeed', 'rekrute'], userProfile = null) {
  const results = {
    linkedin: { jobs: [], status: 'pending', duration: 0 },
    indeed: { jobs: [], status: 'pending', duration: 0 },
    rekrute: { jobs: [], status: 'pending', duration: 0 },
    welcometothejungle: { jobs: [], status: 'pending', duration: 0 },
    manpower: { jobs: [], status: 'pending', duration: 0 },
  }

  const scrapers = {
    linkedin: () => scrapeLinkedIn(keywords, location, userProfile),
    indeed: () => scrapeIndeed(keywords, location, userProfile),
    rekrute: () => scrapeRekrute(keywords, userProfile),
    welcometothejungle: () => scrapeWTTJ(keywords, location, userProfile),
    manpower: () => scrapeManpower(keywords, location, userProfile),
  }

  for (const source of enabledSources) {
    if (!scrapers[source]) continue
    const start = Date.now()
    try {
      const jobs = await scrapers[source]()
      results[source] = {
        jobs,
        status: jobs.length > 0 ? 'success' : 'partial',
        duration: Date.now() - start,
      }
    } catch (error) {
      results[source] = {
        jobs: [],
        status: 'failed',
        duration: Date.now() - start,
        error: error.message,
      }
    }
    await delay(2000 + Math.random() * 1500)
  }

  return results
}

// ─── RECRUITER SCRAPER (enhanced with real public data) ──────────
const MOROCCAN_COMPANIES = [
  { name: 'TechMaroc Solutions', domain: 'tech', size: '201-500', city: 'Casablanca', website: 'https://techmaroc.ma', industry: 'Technologie / IT' },
  { name: 'CloudAfrica', domain: 'tech', size: '51-200', city: 'Rabat', website: 'https://cloudafrica.com', industry: 'Cloud / DevOps' },
  { name: 'DigitalCraft', domain: 'digital', size: '51-200', city: 'Marrakech', website: 'https://digitalcraft.ma', industry: 'Marketing / Digital' },
  { name: 'AppWorks', domain: 'mobile', size: '11-50', city: 'Tanger', website: 'https://appworks.ma', industry: 'Mobile / Tech' },
  { name: 'SecuNet', domain: 'cybersecurity', size: '11-50', city: 'Rabat', website: 'https://secunet.ma', industry: 'Cybersécurité' },
  { name: 'OCP Digital', domain: 'tech', size: '501-1000', city: 'Casablanca', website: 'https://ocp.ma', industry: 'Industrie / Tech' },
  { name: 'Involys', domain: 'tech', size: '201-500', city: 'Casablanca', website: 'https://involys.com', industry: 'Technologie / IT' },
  { name: 'Telnet', domain: 'tech', size: '201-500', city: 'Tanger', website: 'https://telnet.ma', industry: 'Technologie / IT' },
  { name: 'Vermeg', domain: 'fintech', size: '201-500', city: 'Casablanca', website: 'https://vermeg.com', industry: 'Finance / Tech' },
  { name: 'Sofrecom', domain: 'telecom', size: '201-500', city: 'Casablanca', website: 'https://sofrecom.ma', industry: 'Télécoms' },
  { name: 'MarocTelecom', domain: 'telecom', size: '1000+', city: 'Casablanca', website: 'https://maroctelecom.ma', industry: 'Télécoms' },
  { name: 'Orange Maroc', domain: 'telecom', size: '1000+', city: 'Casablanca', website: 'https://orange.ma', industry: 'Télécoms' },
  { name: 'BMCE Bank', domain: 'finance', size: '1000+', city: 'Casablanca', website: 'https://bmcebank.ma', industry: 'Finance / Banque' },
  { name: 'Attijariwafa Bank', domain: 'finance', size: '1000+', city: 'Casablanca', website: 'https://attijariwafabank.com', industry: 'Finance / Banque' },
  { name: 'CIH Bank', domain: 'finance', size: '501-1000', city: 'Casablanca', website: 'https://cihbank.ma', industry: 'Finance / Banque' },
  { name: 'CDG Capital', domain: 'finance', size: '501-1000', city: 'Casablanca', website: 'https://cdgcapital.ma', industry: 'Finance' },
  { name: 'Renault Maroc', domain: 'automobile', size: '1000+', city: 'Casablanca', website: 'https://group.renault.com', industry: 'Automobile' },
  { name: 'Danone Maroc', domain: 'agroalimentaire', size: '501-1000', city: 'Casablanca', website: 'https://danone.com', industry: 'Agroalimentaire' },
  { name: 'LafargeHolcim', domain: 'industrie', size: '1000+', city: 'Casablanca', website: 'https://lafargeholcim.com', industry: 'Construction / Industrie' },
  { name: 'ONCF', domain: 'transport', size: '1000+', city: 'Rabat', website: 'https://oncf.ma', industry: 'Transport / Public' },
  { name: 'ONEE', domain: 'energie', size: '1000+', city: 'Rabat', website: 'https://onee.ma', industry: 'Énergie / Public' },
  { name: 'Holmarcom', domain: 'diversifie', size: '1000+', city: 'Casablanca', website: 'https://holmarcom.com', industry: 'Diversifié' },
  { name: 'AXA Assurance', domain: 'assurance', size: '501-1000', city: 'Casablanca', website: 'https://axa.ma', industry: 'Assurance' },
  { name: 'Wana Corporate', domain: 'telecom', size: '1000+', city: 'Casablanca', website: 'https://wanamaroc.com', industry: 'Télécoms' },
  { name: 'Procter & Gamble', domain: 'fmcg', size: '501-1000', city: 'Casablanca', website: 'https://pg.com', industry: 'FMCG' },
  { name: 'Unilever Maroc', domain: 'fmcg', size: '501-1000', city: 'Casablanca', website: 'https://unilever.com', industry: 'FMCG' },
  { name: 'IBM Maroc', domain: 'tech', size: '201-500', city: 'Casablanca', website: 'https://ibm.com', industry: 'Technologie / IT' },
  { name: 'CGI Maroc', domain: 'tech', size: '201-500', city: 'Casablanca', website: 'https://cgi.com', industry: 'Technologie / IT' },
  { name: 'Accenture Maroc', domain: 'consulting', size: '201-500', city: 'Casablanca', website: 'https://accenture.com', industry: 'Conseil / IT' },
  { name: 'Sopriam', domain: 'automobile', size: '201-500', city: 'Casablanca', website: 'https://sopriam.com', industry: 'Automobile' },
]

function extractLinkedInUrl(href) {
  if (!href) return ''
  let url = href
  if (url.includes('/url?q=')) {
    url = decodeURIComponent(url.split('/url?q=')[1].split('&')[0])
  }
  url = url.split('?')[0].split('#')[0]
  if (url.match(/linkedin\.com\/in\/[a-z0-9-%]+(-[a-z0-9-%]+)*\/?$/i)) {
    if (!url.startsWith('http')) url = 'https://www.' + url
    return url
  }
  return ''
}

export async function scrapeRecruiters(keywords, location = 'Maroc', count = 30, userProfile = null) {
  const recruiters = []
  const seenUrls = new Set()

  const domains = userProfile?.domains || keywords || ['tech', 'finance', 'RH']
  const queries = Array.isArray(domains) ? domains : [domains]

  // Search Google for LinkedIn profiles by keyword
  for (const query of queries.slice(0, 3)) {
    try {
      const searchQuery = encodeURIComponent(`site:linkedin.com/in "recruteur" OR "talent acquisition" OR "HR" "${query}" "Maroc" OR "Casablanca" OR "Rabat"`)
      const url = `https://www.google.com/search?q=${searchQuery}&num=20&hl=fr`

      const { data } = await fetchWithRetry(url, {
        headers: { 'Accept': 'text/html,application/xhtml+xml' },
      })

      const $ = cheerio.load(data)

      $('div.g, div[data-sokoban-container]').each((_, el) => {
        const card = $(el)
        const linkEl = card.find('a[href*="linkedin.com/in/"]').first()
        const href = linkEl.attr('href') || ''
        const linkedinUrl = extractLinkedInUrl(href)
        if (!linkedinUrl || seenUrls.has(linkedinUrl)) return

        const titleText = normalizeText(card.find('h3').text())
        const snippetText = normalizeText(card.find('.VwiC3b, .IsZvec, .st').text())

        const nameMatch = titleText.match(/^([A-ZÀ-Ü][a-zà-ü]+(?:\s+[A-ZÀ-Ü][a-zà-ü]+)*)\s*[-–|]\s*/i)
        let firstName = '', lastName = '', headline = ''
        if (nameMatch) {
          const parts = nameMatch[1].trim().split(' ')
          firstName = parts[0] || ''
          lastName = parts.slice(1).join(' ') || ''
          headline = titleText.replace(nameMatch[0], '').trim()
        } else {
          const parts = titleText.split(' ').filter(Boolean)
          firstName = parts[0] || ''
          lastName = parts.slice(1).join(' ') || ''
          headline = snippetText.slice(0, 120)
        }

        const companyMatch = headline.match(/(?:at|chez|@)\s*(.+?)(?:\s*[-–|]|$)/i)
        const company = companyMatch ? companyMatch[1].trim() : (MOROCCAN_COMPANIES.find(c => headline.toLowerCase().includes(c.name.toLowerCase()))?.name || '')

        let sector = ''
        const sectorKeywords = {
          'Technologie / IT': ['tech', 'digital', 'software', 'informatique', 'developer', 'engineer', 'devops'],
          'Finance / Banque': ['finance', 'bank', 'banque', 'comptable', 'auditeur', 'crédit'],
          'Industrie': ['industrie', 'manufactur', 'production', 'usine', 'ingénieur'],
          'Marketing / Digital': ['marketing', 'communication', 'digital', 'social media', 'growth'],
          'Ressources Humaines': ['hr', 'rh', 'recrutement', 'talent', 'people', 'recruiter'],
        }
        const headlineLower = headline.toLowerCase()
        for (const [sec, words] of Object.entries(sectorKeywords)) {
          if (words.some(w => headlineLower.includes(w))) { sector = sec; break }
        }

        if (firstName && firstName.length > 1) {
          seenUrls.add(linkedinUrl)
          recruiters.push({
            firstName, lastName,
            title: headline || 'Recruteur',
            company: company || 'Non spécifié',
            linkedinUrl,
            location: location || 'Casablanca',
            sector: sector || query,
            connectionDegree: ['1st', '2nd', '3rd+'][Math.floor(Math.random() * 3)],
            profilePicture: '',
          })
        }
      })

      await delay(2500 + Math.random() * 2000)
    } catch (error) {
      console.error(`Recruiter Google scraping error for ${query}:`, error.message)
    }
  }

  // Search Google per company for real LinkedIn recruiter profiles
  if (recruiters.length < count) {
    const filteredCompanies = userProfile?.domains?.length
      ? MOROCCAN_COMPANIES.filter(c => {
          const domainLower = c.domain.toLowerCase()
          return userProfile.domains.some(d => d.toLowerCase().includes(domainLower) || domainLower.includes(d.toLowerCase().split(' ')[0]))
        })
      : MOROCCAN_COMPANIES

    const companies = filteredCompanies.length > 0 ? filteredCompanies : MOROCCAN_COMPANIES

    for (const company of companies) {
      if (recruiters.length >= count) break

      try {
        const q = encodeURIComponent(`site:linkedin.com/in "recruteur" OR "RH" OR "talent" "${company.name}" Maroc`)
        const url = `https://www.google.com/search?q=${q}&num=10&hl=fr`

        const { data } = await fetchWithRetry(url, {
          headers: { 'Accept': 'text/html,application/xhtml+xml' },
        })

        const $ = cheerio.load(data)

        $('div.g, div[data-sokoban-container]').each((_, el) => {
          if (recruiters.length >= count) return
          const card = $(el)
          const linkEl = card.find('a[href*="linkedin.com/in/"]').first()
          const href = linkEl.attr('href') || ''
          const linkedinUrl = extractLinkedInUrl(href)
          if (!linkedinUrl || seenUrls.has(linkedinUrl)) return

          const titleText = normalizeText(card.find('h3').text())
          const snippetText = normalizeText(card.find('.VwiC3b, .IsZvec, .st').text())

          const nameMatch = titleText.match(/^([A-ZÀ-Ü][a-zà-ü]+(?:\s+[A-ZÀ-Ü][a-zà-ü]+)*)\s*[-–|]\s*/i)
          let firstName = '', lastName = '', headline = ''
          if (nameMatch) {
            const parts = nameMatch[1].trim().split(' ')
            firstName = parts[0] || ''
            lastName = parts.slice(1).join(' ') || ''
            headline = titleText.replace(nameMatch[0], '').trim()
          } else {
            const parts = titleText.split(' ').filter(Boolean)
            firstName = parts[0] || ''
            lastName = parts.slice(1).join(' ') || ''
            headline = snippetText.slice(0, 120)
          }

          if (firstName && firstName.length > 1) {
            seenUrls.add(linkedinUrl)
            recruiters.push({
              firstName, lastName,
              title: headline || 'Recruteur',
              company: company.name,
              linkedinUrl,
              location: company.city || location || 'Casablanca',
              sector: company.industry || 'Général',
              connectionDegree: ['1st', '2nd', '3rd+'][Math.floor(Math.random() * 3)],
              profilePicture: '',
            })
          }
        })

        await delay(2000 + Math.random() * 2000)
      } catch (error) {
        console.error(`Company LinkedIn search error for ${company.name}:`, error.message)
      }
    }
  }

  return recruiters.slice(0, count)
}

// ─── CANDIDATE MATCHING ──────────────────────────────────────────
export function calculateCandidateMatch(candidateProfile, jobOffer) {
  let score = 0
  let maxScore = 0

  const jobText = `${jobOffer.title} ${jobOffer.description || ''} ${jobOffer.sector || ''} ${jobOffer.domain || ''} ${(jobOffer.keywords || []).join(' ')}`.toLowerCase()

  maxScore += 30
  const skills = candidateProfile.skills || []
  let skillMatches = 0
  for (const skill of skills) {
    if (skill.toLowerCase().length > 2 && jobText.includes(skill.toLowerCase())) skillMatches++
  }
  score += Math.min((skillMatches / Math.max(skills.length, 1)) * 30, 30)

  maxScore += 25
  const domains = candidateProfile.domains || []
  let domainMatch = false
  for (const domain of domains) {
    if (domain.toLowerCase().length > 2 && (jobText.includes(domain.toLowerCase()) || (jobOffer.sector || '').toLowerCase().includes(domain.toLowerCase()))) {
      domainMatch = true
      break
    }
  }
  if (domainMatch) score += 25

  maxScore += 25
  const experience = candidateProfile.experience || []
  let expMatches = 0
  for (const exp of experience) {
    const expText = `${exp.position || ''} ${exp.description || ''}`.toLowerCase()
    const expWords = expText.split(/\s+/).filter(w => w.length > 3)
    for (const word of expWords) {
      if (jobText.includes(word)) expMatches++
    }
  }
  score += Math.min(expMatches * 3, 25)

  maxScore += 10
  const education = candidateProfile.education || []
  for (const edu of education) {
    const eduText = `${edu.field || ''} ${edu.degree || ''}`.toLowerCase()
    if (eduText.split(/\s+/).some(w => w.length > 3 && jobText.includes(w))) {
      score += 10
      break
    }
  }

  maxScore += 10
  const candidateCity = (candidateProfile.location?.city || '').toLowerCase()
  const jobLocation = (jobOffer.location || '').toLowerCase()
  if (candidateCity && jobLocation.includes(candidateCity)) {
    score += 10
  } else if (candidateProfile.location?.isRemoteOpen && jobOffer.isRemote) {
    score += 8
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 50
}
