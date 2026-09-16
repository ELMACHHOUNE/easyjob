import express from 'express'
import mongoose from 'mongoose'
import { protect } from '../middlewares/auth.js'
import { upload } from '../utils/fileUpload.js'
import CV from '../models/CV.js'

const router = express.Router()

function analyzeCV(text, parsedData) {
  let score = 0
  const strengths = []
  const improvements = []
  const suggestions = []
  const textLower = text.toLowerCase()

  // === 1. COORDONNÉES (10 pts) ===
  let coordScore = 0
  if (parsedData.email) {
    coordScore += 3
    strengths.push('Email de contact présent — essentiel pour le recruteur')
  } else {
    improvements.push('Email manquant — un recruteur doit pouvoir vous contacter immédiatement')
  }
  if (parsedData.phone) {
    coordScore += 3
    strengths.push('Numéro de téléphone présent')
  } else {
    improvements.push('Téléphone manquant — ajoutez un numéro avec indicatif (+212)')
  }
  if (parsedData.location) {
    coordScore += 2
    strengths.push('Localisation renseignée — aide le recruteur à cerner la mobilité')
  } else {
    improvements.push('Localisation absente — le recruteur doit savoir votre ville')
  }
  const hasLinkedIn = textLower.includes('linkedin.com')
  if (hasLinkedIn) {
    coordScore += 2
    strengths.push('Profil LinkedIn référencé — signe de professionnalisme')
  } else {
    suggestions.push('Ajoutez votre profil LinkedIn — 87% des recruteurs le consultent')
  }
  score += coordScore

  // === 2. COMPÉTENCES TECHNIQUES (20 pts) ===
  if (parsedData.skills.length > 0) {
    const skillScore = Math.min(15, parsedData.skills.length * 2)
    score += skillScore
    strengths.push(`${parsedData.skills.length} compétence(s) technique(s) identifiée(s)`)
    if (parsedData.skills.length >= 5) {
      score += 3
      strengths.push('Bon panel de compétences techniques')
    }
    if (parsedData.skills.length >= 10) {
      score += 2
      strengths.push('Large éventail de compétences — profil polyvalent')
    }
    // Check for trending skills
    const trendingSkills = ['react', 'typescript', 'docker', 'kubernetes', 'aws', 'graphql', 'next.js', 'flutter']
    const foundTrending = parsedData.skills.filter(s => trendingSkills.includes(s.toLowerCase()))
    if (foundTrending.length >= 3) {
      score += 2
      strengths.push(`Compétences tendance détectées : ${foundTrending.slice(0, 3).join(', ')}`)
    }
  } else {
    improvements.push('Aucune compétence technique identifiée — c\'est le point N°1 que les recruteurs scrutent')
    suggestions.push('Créez une section "Compétences" claire avec les technologies maîtrisées')
  }

  // === 3. EXPÉRIENCE PROFESSIONNELLE (25 pts) ===
  if (parsedData.experience.length > 0) {
    const expScore = Math.min(20, parsedData.experience.length * 6)
    score += expScore
    strengths.push(`${parsedData.experience.length} expérience(s) professionnelle(s) documentée(s)`)
    if (parsedData.experience.length >= 3) {
      score += 5
      strengths.push('Parcours professionnel riche et progressif')
    }
    // Check for duration
    const hasPresent = parsedData.experience.some(e => /présent|present|courant|aujourd/i.test(e.period))
    if (hasPresent) {
      score += 2
      strengths.push('Poste actuel identifié — montre la continuité')
    }
  } else {
    improvements.push('Aucune expérience professionnelle détectée — c\'est le critère N°1 en embauche')
    suggestions.push('Même les stages, projets freelance et bénévolat comptent — décrivez-les')
    suggestions.push('Utilisez le format : Poste | Entreprise | Période | Réalisations chiffrées')
  }

  // === 4. FORMATION (10 pts) ===
  if (parsedData.education.length > 0) {
    score += 8
    strengths.push('Parcours académique documenté')
    const hasMaster = textLower.includes('master') || textLower.includes('mba')
    const hasEngineer = textLower.includes('ingénieur') || textLower.includes('engineer')
    if (hasMaster || hasEngineer) {
      score += 2
      strengths.push('Formation supérieure de niveau Master/Ingénieur')
    }
  } else {
    improvements.push('Formation non détectée — ajoutez diplômes et certifications')
    suggestions.push('Placez la section Formation après Expérience (sauf profil junior)')
  }

  // === 5. LANGUES (5 pts) ===
  if (parsedData.languages.length >= 3) {
    score += 5
    strengths.push(`${parsedData.languages.length} langues mentionnées — profil multilingue attractif`)
  } else if (parsedData.languages.length === 2) {
    score += 3
    strengths.push('Bilinguisme mentionné')
  } else if (parsedData.languages.length === 1) {
    score += 1
    suggestions.push('Ajoutez au moins 2 langues — le bilinguisme est un atout majeur au Maroc')
  } else {
    improvements.push('Aucune langue mentionnée — le bilinguisme est indispensable')
    suggestions.push('Minimum : Français + Anglais. L\'Arabe et l\'Espagnol sont des plus')
  }

  // === 6. STRUCTURE & FORME (15 pts) ===
  if (text.length > 2000) {
    score += 8
    strengths.push('CV détaillé et complet (>2000 caractères)')
  } else if (text.length > 1000) {
    score += 5
    strengths.push('CV de longueur correcte')
  } else if (text.length > 500) {
    score += 2
    suggestions.push('CV trop concis — enrichissez avec des réalisations chiffrées')
  } else {
    improvements.push('CV trop court (<500 car.) — les recruteurs en moyenne passent 7 secondes, mais cherchent du contenu')
  }

  // Structure checks
  const hasSummary = textLower.includes('résumé') || textLower.includes('profil') || textLower.includes('summary') || textLower.includes('objectif')
  if (hasSummary) {
    score += 4
    strengths.push('Section profil/résumé présente — accroche le recruteur en 3 secondes')
  } else {
    suggestions.push('Ajoutez un "Profil" en 2-3 lignes : qui vous êtes, votre valeur ajoutée, votre objectif')
  }

  const hasBulletPoints = text.includes('•') || text.includes('-') || text.includes('*') || text.includes('▸') || text.includes('→')
  if (hasBulletPoints) {
    score += 3
    strengths.push('Utilisation de bullet points — lisibilité optimale pour le scanning')
  } else {
    suggestions.push('Utilisez des bullet points (•) pour chaque réalisation — les recruteurs scannent, ne lisent pas')
  }

  // === 7. MOTS-CLÉS TECHNIQUES (5 pts) ===
  const techKeywords = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'html', 'css', 'php', 'angular', 'vue', 'typescript', 'docker', 'kubernetes', 'aws', 'azure', 'git', 'linux', 'api', 'rest', 'graphql', 'flutter', 'swift', 'kotlin']
  const foundKeywords = techKeywords.filter(kw => textLower.includes(kw))
  if (foundKeywords.length >= 5) {
    score += 5
    strengths.push(`${foundKeywords.length} mots-clés techniques détectés — excellent pour le ATS`)
  } else if (foundKeywords.length >= 2) {
    score += 3
    strengths.push(`${foundKeywords.length} mots-clés techniques détectés`)
  } else {
    suggestions.push('Ajoutez plus de mots-clés techniques pertinents pour le filtrage ATS')
  }

  // === 8. RÉALISATIONS & IMPACT (bonus) ===
  const hasNumbers = /\d+%|\d+\s*(ans|ans|mois|k€|MAD|dh)|\d+\s*(projets?|clients?|équipes?)/i.test(text)
  if (hasNumbers) {
    score += 3
    strengths.push('Résultats chiffrés détectés — les recruteurs adorent les métriques')
  } else {
    suggestions.push('Ajoutez des réalisations chiffrées : "Augmenté les ventes de 25%", "Géré une équipe de 8"')
  }

  // === FINAL SCORE ===
  score = Math.min(100, Math.max(0, score))

  // === EXPERT ASSESSMENT ===
  if (score >= 85) {
    strengths.unshift('EXCELLENT CV — Profil hautement qualifié, prêt pour les postes senior')
  } else if (score >= 70) {
    strengths.unshift('TRÈS BON CV — Profil solide avec quelques ajustements possibles')
  } else if (score >= 55) {
    strengths.unshift('BON CV — Base solide, mais des améliorations ciblées le rendront compétitif')
  } else if (score >= 40) {
    strengths.unshift('CV MOYEN — Nécessite des améliorations significatives pour se démarquer')
  } else {
    strengths.unshift('CV À REFAIRE — Reprise complète recommandée pour maximiser vos chances')
  }

  // Always add expert tips
  if (suggestions.length < 4) {
    suggestions.push('Personnalisez votre CV pour chaque offre — les mots-clés de l\'annonce doivent apparaître')
    suggestions.push('Limitez-vous à 1-2 pages maximum, sauf profils très expérimentés')
  }

  return { score, strengths, improvements, suggestions }
}

function generateCandidateSummary(text, parsedData, userProfile) {
  const parts = []
  const firstName = userProfile?.userId?.firstName || 'Le candidat'

  const experiences = (parsedData.experience || []).filter(e => e.title && e.title.length > 3)
  const stages = experiences.filter(e => e.isStage)
  const nonStages = experiences.filter(e => !e.isStage)
  const educations = (parsedData.education || []).filter(e => e.degree && e.degree.length > 3)
  const firstEdu = educations[0] || null
  const skills = (parsedData.skills || []).filter(s => s.length > 1 && s.length < 50)
  const languages = (parsedData.languages || []).filter(l => l.length > 1 && l.length < 40)

  let profileType = 'unknown'
  if (stages.length > 0 && nonStages.length === 0) profileType = 'student_intern'
  else if (nonStages.length > 0 && nonStages.length <= 2) profileType = 'junior'
  else if (nonStages.length > 2) profileType = 'experienced'
  else if (educations.length > 0 && experiences.length === 0) profileType = 'student_noexp'

  function cleanDegree(deg) {
    if (!deg) return ''
    return deg.replace(/\d{4}\s*[-–]\s*\d{4}/g, '').split(/\s*[-–|]/)[0].trim().substring(0, 120)
  }

  function cleanCompany(c) {
    if (!c) return ''
    return c.replace(/\|.*$/g, '').replace(/\d{4}/g, '').replace(/Casablanca.*$/i, '').trim().substring(0, 60)
  }

  function stageLine(s) {
    const title = s.title.replace(/[-–—|]/g, '').trim().substring(0, 80)
    const company = cleanCompany(s.company)
    const projMatch = (s.description || '').match(/(?:Projet|Plateforme|Application|Site)\s*:\s*([^.]+)/i)
    const project = projMatch ? projMatch[1].trim().substring(0, 60) : ''
    let line = title
    if (company) line += ` chez ${company}`
    if (project) line += ` (${project})`
    return line
  }

  if (profileType === 'student_intern') {
    if (firstEdu) {
      const deg = cleanDegree(firstEdu.degree)
      const inst = firstEdu.institution.trim().substring(0, 80)
      if (deg.length > 3) {
        let t = `Diplome d'ingenieur en ${deg}`
        if (inst.length > 2) t += `, ${inst}`
        parts.push(t)
      }
    } else {
      parts.push(`${firstName} est un profil junior`)
    }

    if (stages.length === 1) {
      parts.push(`Il/elle a effectue un stage en tant que ${stageLine(stages[0])}`)
    } else if (stages.length > 1) {
      parts.push(`Il/elle a realize ${stages.length} stages, notamment ${stages.map(stageLine).join(', ')}`)
    }
  } else if (profileType === 'junior') {
    if (firstEdu) {
      const deg = cleanDegree(firstEdu.degree)
      const inst = firstEdu.institution.trim().substring(0, 80)
      if (deg.length > 3) {
        let t = deg
        if (inst.length > 2) t += `, ${inst}`
        parts.push(`${firstName} est titulaire d'un diplome en ${t}`)
      }
    } else {
      parts.push(`${firstName} est un(e) professionnel(le) junior`)
    }
    const nd = nonStages.map(s => {
      const title = s.title.replace(/[-–—|]/g, '').trim().substring(0, 80)
      const company = cleanCompany(s.company)
      return `${title}${company ? ` chez ${company}` : ''}`
    }).filter(s => s.length > 3)
    if (nd.length > 0) parts.push(`Il/elle a occupe le(s) poste(s) : ${nd.join(', ')}`)
    if (stages.length > 0) parts.push(`Par ailleurs, il/elle a realize ${stages.length} stage(s)`)
  } else if (profileType === 'experienced') {
    if (firstEdu) {
      const deg = cleanDegree(firstEdu.degree)
      if (deg.length > 3) parts.push(`${firstName} est titulaire d'un diplome en ${deg}`)
    }
    const nd = nonStages.map(s => {
      const title = s.title.replace(/[-–—|]/g, '').trim().substring(0, 80)
      const company = cleanCompany(s.company)
      return `${title}${company ? ` chez ${company}` : ''}`
    }).filter(s => s.length > 3)
    parts.push(`Il/elle dispose de ${nd.length} experiences professionnelles${nd.length > 0 ? `, notamment ${nd.slice(0, 3).join(', ')}` : ''}`)
  } else if (profileType === 'student_noexp') {
    if (firstEdu) {
      const deg = cleanDegree(firstEdu.degree)
      const inst = firstEdu.institution.trim().substring(0, 80)
      if (deg.length > 3) {
        let t = deg
        if (inst.length > 2) t += `, ${inst}`
        parts.push(`${firstName} est actuellement etudiant(e) en ${t}`)
      }
    }
    parts.push(`Aucune experience professionnelle n'est mentionnee dans son CV`)
  } else {
    if (firstEdu) {
      const deg = cleanDegree(firstEdu.degree)
      if (deg.length > 3) parts.push(`${firstName} est titulaire d'un diplome en ${deg}`)
    }
    if (experiences.length > 0) parts.push(`Il/elle dispose de ${experiences.length} experiences`)
    else parts.push(`${firstName} presente un profil a analyser`)
  }

  if (skills.length > 0) {
    const frameworks = skills.filter(s => /react|angular|vue|spring|django|laravel|next|node|thymeleaf|flutter/i.test(s))
    const langs = skills.filter(s => /java|python|php|javascript|c\+|c#|typescript|ruby|go|rust/i.test(s))
    const tools = skills.filter(s => /git|docker|linux|jira|agile|scrum|uml|ci\/cd|intellij|vs code|ollama|llm/i.test(s))
    const db = skills.filter(s => /mysql|postgres|oracle|mongo|redis|sql server|sqlite/i.test(s))

    const categories = []
    if (langs.length > 0) categories.push(`Langages (${langs.slice(0, 5).join(', ')})`)
    if (frameworks.length > 0) categories.push(`Frameworks (${frameworks.slice(0, 4).join(', ')})`)
    if (db.length > 0) categories.push(`Bases de donnees (${db.slice(0, 3).join(', ')})`)
    if (tools.length > 0) categories.push(`Outils (${tools.slice(0, 4).join(', ')})`)

    if (categories.length > 0) {
      parts.push(`Ses competences techniques : ${categories.join('; ')}`)
    } else {
      parts.push(`Ses competences techniques incluent ${skills.slice(0, 6).join(', ')}`)
    }
  }

  if (languages.length > 0) {
    parts.push(`Il/elle parle ${languages.slice(0, 5).join(', ')}`)
  }

  if (parts.length === 0) return 'Resume non disponible.'
  return parts.join('. ').replace(/\.\./g, '.') + '.'
}

function extractKeywords(text, parsedData) {
  const keywords = new Set()

  for (const skill of parsedData.skills) {
    keywords.add(skill)
  }

  const softSkills = [
    'Leadership', 'Communication', 'Travail en equipe', 'Gestion de projet',
    'Problem solving', 'Creativite', 'Adaptabilite', 'Autonomie',
    'Rigueur', 'Organisation', 'Prise de decision', 'Negociation',
    'Management', 'Mentorat', 'Formations', 'Presentation',
  ]
  const textLower = text.toLowerCase()
  for (const ss of softSkills) {
    if (textLower.includes(ss.toLowerCase())) {
      keywords.add(ss)
    }
  }

  const techPatterns = [
    'CI/CD', 'REST API', 'Microservices', 'Agile', 'Scrum',
    'Kanban', 'Test Driven', 'TDD', 'DevOps', 'Clean Code',
    'Design Patterns', 'MVC', 'OOP', 'SOLID',
  ]
  for (const tp of techPatterns) {
    if (textLower.includes(tp.toLowerCase())) {
      keywords.add(tp)
    }
  }

  return [...keywords].slice(0, 20)
}

const KNOWN_SCHOOLS = [
  'EMSI', 'EMI', 'ENSIAS', 'INPT', 'ENSET', 'ENAM', 'ISCAE', 'ENCG', 'ENSA',
  'ENSM', 'ENIC', 'ENIT', 'ENI', 'FST', 'FSJES', 'FP', 'ISI', 'ISGM',
  "Sup'Management", 'ESSEC', 'ENCG', 'UM5', 'UH2C', 'UM6P', 'UM5A', 'UM5P',
  'Université Hassan II', 'Université Mohammed V', 'Université Cadi Ayyad',
  'Université Ibn Tofail', 'Université Mohammed Premier',
  'école marocaine des sciences', "marocaine des sciences de l'ingénieur",
  'Faculté', 'Institut National',
]

const EXP_TITLE_RE = /(?:Stagiaire|Développeur(?:euse)?|Ingénieur(?:eure)?|Chef|Manager|Directeur(?:trice)?|Responsable|Consultant(?:e)?|Analyste|Designer|Architecte|Lead|Engineer|Developer|Technicien(?:ne)?|Administrateur?|Administrateur|Full Stack|Web|Mobile|Front[\s-]?End|Back[\s-]?End)/i

function splitConcatenatedHeaders(text) {
  const knownHeaders = [
    'EXPERIENCES PROFESSIONELLES', 'EXPERIENCE PROFESSIONNELLE',
    'ETUDE ET FORMATION', 'FORMATION', 'EDUCATION',
    'COMPETENCES', 'COMPÉTENCES', 'TECHNOLOGIES',
    'LANGUES', 'LANGUE',
    'CERTIFICATIONS', 'CERTIFICATION',
    'PROJETS', 'SOFT SKILLS', 'QUALITÉS', 'QUALITES',
    'CONTACT', 'COORDONNEES',
    'CENTRES D', 'LOISIRS', 'INTERETS',
  ]
  let result = text
  for (const header of knownHeaders) {
    const escaped = header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`([A-ZÀ-Ÿ]{2,})(${escaped})`, 'gi')
    result = result.replace(regex, '$1\n$2')
  }
  return result
}

function normalizeText(text) {
  return text
    .replace(/\r/g, '')
    .replace(/'/g, "'")
    .replace(/'/g, "'")
    .replace(/"/g, '"')
    .replace(/"/g, '"')
}

function parseCVData(text) {
  const normalized = normalizeText(splitConcatenatedHeaders(text))
  const textLower = normalized.toLowerCase()

  const emailMatch = normalized.match(/[\w.+-]+@[\w.-]+\.\w{2,}/)
  const phoneMatch = normalized.match(/(\+212|0)[\s.-]?[67]\d[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}/)
  const locationMatch = normalized.match(/(?:Casablanca|Rabat|Marrakech|Tanger|Fès|Meknès|Agadir|Oujda|Kénitra|Tétouan|Nador|Safi|Mohammedia)/i)

  const lines = normalized.split('\n').map(l => l.trim()).filter(Boolean)

  const HEADER_RE = /^(?:CONTACT|EXPERIENCES?\s+PROFESSIONELLES?|ETUDE\s+ET\s+FORMATION|FORMATION|EDUCATION|ETUDES|PARCOURS\s+ACADEMIQUE|COMPETENCES?|COMPÉTENCES?|TECHNOLOGIES|STACK\s+TECHNIQUE|LANGUES?|CERTIFICATIONS?|PROJETS?\s*(?:ACADEMIQUE)?|SOFT\s+SKILLS|QUALITÉS?|COORDONNEES|LOISIRS|INTERETS|CENTRES\s+D)/i

  const skills = []
  const knownSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'PHP', 'C#', '.NET', 'Ruby', 'Go', 'Rust',
    'React', 'ReactJS', 'React JS', 'Angular', 'Vue.js', 'Vue', 'Node.js', 'Express.js', 'Django', 'Flask',
    'Laravel', 'Spring Boot', 'Spring', 'FastAPI', 'Next.js', 'NextJS', 'Nuxt.js',
    'HTML', 'CSS', 'Tailwind CSS', 'Tailwind', 'SASS', 'Bootstrap', 'Material UI',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'GitHub', 'GitLab',
    'Linux', 'Nginx', 'Apache', 'Jenkins', 'CI/CD', 'Terraform',
    'REST API', 'GraphQL', 'Microservices',
    'Figma', 'Photoshop', 'Illustrator', 'Adobe XD',
    'Excel', 'Word', 'PowerPoint', 'SAP',
    'Agile', 'Scrum', 'Jira', 'Trello', 'UML',
    'Machine Learning', 'TensorFlow', 'PyTorch', 'LLM', 'Ollama',
    'Flutter', 'React Native', 'Swift', 'Kotlin',
    'Firebase', 'Supabase', 'Stripe',
    'Thymeleaf', 'IntelliJ', 'VS Code',
    'C/C++', 'OOP',
  ]

  for (const skill of knownSkills) {
    if (textLower.includes(skill.toLowerCase())) {
      skills.push(skill)
    }
  }
  const dedupSkills = [...new Set(skills)]

  const experience = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (HEADER_RE.test(line)) continue

    const titleMatch = line.match(/^(.+?)\s*[-–—|]\s*(.+)$/)
    if (!titleMatch) continue

    const leftSide = titleMatch[1].trim()
    const rightSide = titleMatch[2].trim()

    if (!EXP_TITLE_RE.test(leftSide)) continue
    if (leftSide.length > 120 || leftSide.length < 5) continue
    if (/^\d{4}/.test(leftSide)) continue
    if (rightSide.length < 2 || rightSide.length > 100) continue
    if (KNOWN_SCHOOLS.some(s => rightSide.toLowerCase().includes(s.toLowerCase()))) continue
    if (/(?:école|universit|institut|faculté|school|university)/i.test(rightSide)) continue
    if (/(?:spécialisé|specialise|passionné|passionne|expérimenté|experimente|reconnu)/i.test(leftSide)) continue
    if (/(?:Spring Boot|React|Java|Python|JavaScript|Angular|Django)/i.test(rightSide) && !/\.com|\.fr|SARL|SA|Groupe|Group/i.test(rightSide)) continue

    const title = leftSide
    let company = rightSide.replace(/\|.*$/, '').replace(/\s*\d{4}.*$/, '').trim()

    let period = ''
    const nextLine = i + 1 < lines.length ? lines[i + 1] : ''
    const periodFromNext = nextLine.match(/((?:Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre|Jan|Févr|Mar|Avr|Jun|Jul|Aout|Sept|Oct|Nov|Déc)\w*\s+\d{4}\s*[-–]\s*(?:(?:Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre|Jan|Févr|Mar|Avr|Jun|Jul|Aout|Sept|Oct|Nov|Déc)\w*\s+)?\d{4})/i)
    const periodFromLine = line.match(/((?:Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre|Jan|Févr|Mar|Avr|Jun|Jul|Aout|Sept|Oct|Nov|Déc)\w*\s+\d{4}\s*[-–]\s*(?:(?:Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre|Jan|Févr|Mar|Avr|Jun|Jul|Aout|Sept|Oct|Nov|Déc)\w*\s+)?\d{4})/i)
    period = (periodFromNext && !HEADER_RE.test(nextLine)) ? periodFromNext[0] : (periodFromLine ? periodFromLine[0] : '')

    let descriptionLines = []
    for (let j = i + 2; j < Math.min(i + 12, lines.length); j++) {
      const dl = lines[j]
      if (EXP_TITLE_RE.test(dl) && dl.includes('-')) break
      if (/^\d{4}\s*[-–]/.test(dl)) break
      if (HEADER_RE.test(dl)) break
      if (/^(?:Tâches?|Projet|Sujet)\s*:/i.test(dl)) continue
      if (dl === 'Stack :' || dl.startsWith('Stack')) {
        const stackLine = dl.replace(/^Stack\s*:\s*/i, '')
        if (stackLine.length > 3) descriptionLines.push('Stack: ' + stackLine)
        continue
      }
      if (dl.length > 5 && descriptionLines.length < 3) descriptionLines.push(dl)
    }

    const isStage = /stagiaire|stage|intern/i.test(title)
    experience.push({
      title: title.substring(0, 150),
      company: company.substring(0, 100),
      period,
      description: descriptionLines.join(' ').substring(0, 300),
      isStage,
    })
  }

  const education = []
  const HEADER_EDU_RE = /^(?:ETUDE\s+ET\s+FORMATION|FORMATION|EDUCATION|ETUDES|PARCOURS\s+ACADEMIQUE)/i

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!/^\d{4}\s*[-–]\s*\d{4}/.test(line)) continue
    if (HEADER_EDU_RE.test(line)) continue

    const yearMatch = line.match(/(\d{4}\s*[-–]\s*\d{4})/)
    const year = yearMatch ? yearMatch[0] : ''
    let fullText = line.replace(/^\d{4}\s*[-–]\s*\d{4}\s*[:-]?\s*/, '').trim()

    for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
      const next = lines[j]
      if (/^\d{4}\s*[-–]\s*\d{4}/.test(next)) break
      if (HEADER_RE.test(next)) break
      if (EXP_TITLE_RE.test(next) && next.includes('-')) break
      if (/(?:Arabe|Français|Anglais|Espagnol|Allemand)\s*:/i.test(next)) break
      if (next.length > 3) fullText += ' ' + next
    }

    let degree = fullText
    let institution = ''

    const sortedSchools = [...KNOWN_SCHOOLS].sort((a, b) => b.length - a.length)
    const matchedSchools = sortedSchools.filter(s => fullText.toLowerCase().includes(s.toLowerCase()))
    if (matchedSchools.length > 0) {
      const abbr = matchedSchools.find(s => s.length <= 6) || matchedSchools[matchedSchools.length - 1]
      institution = abbr
      for (const school of matchedSchools) {
        degree = degree.replace(new RegExp(school.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '')
      }
    }
    degree = degree.replace(/\(\s*\)/g, '').replace(/\[\s*\]/g, '')
      .replace(/au\s+sein\s+d[eu]\s+/gi, '')
      .replace(/l['']\s*école\b/gi, '')
      .replace(/^[\s,\-–:]+/, '').replace(/[\s,\-–:]+$/, '').trim()
    degree = degree.replace(/\s{2,}/g, ' ').trim()

    if (!institution) {
      const instMatch = fullText.match(/(?:école|universit|institut|faculté|school|university)\s+(?:[^\n]+)/i)
      if (instMatch) institution = instMatch[0].trim()
    }

    if (degree.length > 2) {
      education.push({
        degree: degree.substring(0, 200),
        institution: institution.substring(0, 200),
        year,
      })
    }
  }

  const languages = []
  const knownLangs = ['Arabe', 'Français', 'Anglais', 'Espagnol', 'Allemand', 'Chinois', 'Italien', 'Portugais', 'Turc', 'Russe']
  const langLevels = ['Langue maternelle', 'Bilingue', 'Courant', 'Avancé', 'Intermédiaire', 'Opérationnel', 'Notions']

  for (const lang of knownLangs) {
    if (!textLower.includes(lang.toLowerCase())) continue
    let level = ''
    for (const lv of langLevels) {
      if (normalized.toLowerCase().includes(lang.toLowerCase() + ' : ' + lv.toLowerCase()) ||
          normalized.toLowerCase().includes(lang.toLowerCase() + ':' + lv.toLowerCase())) {
        level = lv
        break
      }
    }
    languages.push(level ? `${lang} (${level})` : lang)
  }

  return {
    skills: dedupSkills,
    experience,
    education,
    languages,
    certifications: [],
    projects: [],
    email: emailMatch?.[0] || '',
    phone: phoneMatch?.[0] || '',
    location: locationMatch?.[0] || '',
  }
}

// GET /api/profile/cv
router.get('/', protect, async (req, res) => {
  try {
    const cv = await CV.findOne({ userId: req.user._id, isActive: true })
    res.json({ cv })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// POST /api/profile/cv - upload and analyze CV
router.post('/', protect, upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier fourni' })

    // Deactivate old CVs
    await CV.updateMany({ userId: req.user._id, isActive: true }, { isActive: false })

    let extractedText = ''
    if (req.file.mimetype === 'application/pdf') {
      try {
        const { PDFParse } = await import('pdf-parse')
        const pdfParser = new PDFParse({ data: new Uint8Array(req.file.buffer) })
        const textResult = await pdfParser.getText()
        extractedText = (textResult.text || '').trim()
        await pdfParser.destroy()
      } catch (pdfErr) {
        console.error('PDF parsing error:', pdfErr.message)
      }
    }

    const parsedData = parseCVData(extractedText)
    const analysis = analyzeCV(extractedText, parsedData)
    const candidateSummary = generateCandidateSummary(extractedText, parsedData, {})
    const keywords = extractKeywords(extractedText, parsedData)

    const cv = await CV.create({
      userId: req.user._id,
      fileName: `cv_${Date.now()}`,
      originalName: req.file.originalname,
      fileData: req.file.buffer.toString('base64'),
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      extractedText,
      parsedData,
      analysis,
      candidateSummary,
      keywords,
      version: 1,
    })

    res.json({
      cv,
      message: 'CV uploadé et analysé avec succès',
      analysis,
      parsedData,
      extractedText,
    })
  } catch (error) {
    console.error('Erreur upload CV:', error)
    res.status(500).json({ error: 'Erreur lors de l\'upload' })
  }
})

// POST /api/profile/cv/analyze-text - analyze without file upload
router.post('/analyze-text', protect, async (req, res) => {
  try {
    const { text } = req.body
    if (!text) return res.status(400).json({ error: 'Aucun texte fourni' })

    const parsedData = parseCVData(text)
    const analysis = analyzeCV(text, parsedData)

    res.json({ analysis, parsedData })
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'analyse' })
  }
})

// POST /api/profile/cv/match-jobs - match CV against job offers
router.post('/match-jobs', protect, async (req, res) => {
  try {
    const { keywords } = req.body || {}
    const cv = await CV.findOne({ userId: req.user._id, isActive: true })
    if (!cv) return res.status(404).json({ error: 'Aucun CV trouvé' })

    const JobOffer = mongoose.model('JobOffer')
    const query = { userId: req.user._id, isActive: true }

    const allJobs = await JobOffer.find(query)

    const cvSkills = (cv.parsedData?.skills || []).map(s => s.toLowerCase())
    const cvText = (cv.extractedText || '').toLowerCase()
    const searchKeywords = (keywords || []).map(k => k.toLowerCase())

    const matchedJobs = allJobs.map(job => {
      const jobText = `${job.title} ${job.company} ${job.description} ${(job.keywords || []).join(' ')}`.toLowerCase()
      let matchScore = 0
      let matchReasons = []

      // Skill matching
      for (const skill of cvSkills) {
        if (jobText.includes(skill.toLowerCase())) {
          matchScore += 10
          matchReasons.push(`Compétence: ${skill}`)
        }
      }

      // Keyword matching
      for (const kw of searchKeywords) {
        if (jobText.includes(kw)) {
          matchScore += 8
          matchReasons.push(`Mot-clé: ${kw}`)
        }
      }

      // Title relevance
      if (cvText.includes(job.title.toLowerCase().split(' ')[0])) {
        matchScore += 15
        matchReasons.push('Titre pertinent')
      }

      // Experience relevance
      const expYears = cv.parsedData?.experience?.length || 0
      if (expYears > 0 && job.contractType === 'Stage') {
        matchScore -= 5
      }
      if (expYears >= 2 && (job.title.toLowerCase().includes('senior') || job.title.toLowerCase().includes('lead'))) {
        matchScore += 10
        matchReasons.push('Niveau d\'expérience adapté')
      }

      matchScore = Math.min(100, Math.max(0, matchScore + (job.relevanceScore || 0) * 0.3))

      return {
        ...job.toObject(),
        matchScore: Math.round(matchScore),
        matchReasons: matchReasons.slice(0, 5),
      }
    })

    matchedJobs.sort((a, b) => b.matchScore - a.matchScore)

    res.json({
      jobs: matchedJobs.slice(0, 50),
      total: matchedJobs.length,
      cvSkills,
      searchKeywords,
    })
  } catch (error) {
    console.error('Erreur matching:', error)
    res.status(500).json({ error: 'Erreur lors du matching' })
  }
})

// DELETE /api/profile/cv/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await CV.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    res.json({ message: 'CV supprimé' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// PUT /api/profile/cv/:id — update parsed data or re-analyze
router.put('/:id', protect, async (req, res) => {
  try {
    const cv = await CV.findOne({ _id: req.params.id, userId: req.user._id })
    if (!cv) return res.status(404).json({ error: 'CV non trouvé' })

    if (req.body.reanalyze) {
      if (!cv.fileData) return res.status(400).json({ error: 'Aucune donnée de CV stockée' })

      let extractedText = ''
      try {
        const rawBase64 = cv.fileData.startsWith('data:')
          ? cv.fileData.split(',')[1]
          : cv.fileData
        const buffer = Buffer.from(rawBase64, 'base64')
        const { PDFParse } = await import('pdf-parse')
        const pdfParser = new PDFParse({ data: new Uint8Array(buffer) })
        const textResult = await pdfParser.getText()
        extractedText = (textResult.text || '').trim()
        await pdfParser.destroy()
      } catch (pdfErr) {
        console.error('PDF re-parse error:', pdfErr.message)
      }

      if (!extractedText) {
        return res.status(400).json({ error: 'Impossible d\'extraire le texte du CV. Le fichier pourrait être scanné ou protégé.' })
      }

      const parsedData = parseCVData(extractedText)
      const analysis = analyzeCV(extractedText, parsedData)

      cv.extractedText = extractedText
      cv.parsedData = parsedData
      cv.analysis = analysis
      cv.version = (cv.version || 1) + 1
      await cv.save()

      return res.json({ cv, message: 'CV analysé avec succès', analysis, parsedData, extractedText })
    }

    const { parsedData } = req.body
    if (parsedData) {
      cv.parsedData = { ...cv.parsedData, ...parsedData }
      cv.version = (cv.version || 1) + 1
    }
    await cv.save()

    res.json({ cv, message: 'CV mis à jour' })
  } catch (error) {
    console.error('Erreur update CV:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// POST /api/profile/cv/backfill-summaries - generate summaries for existing CVs
router.post('/backfill-summaries', protect, async (req, res) => {
  try {
    const cvs = await CV.find({ isActive: true })
    let updated = 0
    for (const cv of cvs) {
      cv.candidateSummary = generateCandidateSummary(cv.extractedText || '', cv.parsedData || {}, {})
      cv.keywords = extractKeywords(cv.extractedText || '', cv.parsedData || {})
      await cv.save()
      updated++
    }
    res.json({ message: `${updated} CV(s) mis a jour avec resume`, updated })
  } catch (error) {
    console.error('Backfill error:', error)
    res.status(500).json({ error: 'Erreur backfill' })
  }
})

export default router
