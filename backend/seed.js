import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User.js'
import UserProfile from './models/UserProfile.js'
import RecruiterProfile from './models/RecruiterProfile.js'
import JobOffer from './models/JobOffer.js'
import Application from './models/Application.js'
import Notification from './models/Notification.js'
import Recruiter from './models/Recruiter.js'
import EmailTemplate from './models/EmailTemplate.js'
import CompanyEmail from './models/CompanyEmail.js'
import companyEmailsData from './data/companyEmails.js'

dotenv.config()

const PASSWORD = 'Tahtah2002@'

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60), 0, 0)
  return d
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ─── CANDIDATES DATA ───────────────────────────────────────────
const candidatesData = [
  {
    firstName: 'Youssef', lastName: 'El Fassi', email: 'youssef.elfassi@gmail.com', phone: '+212 6 61 23 45 67',
    jobSearchStatus: 'actively_looking',
    profile: {
      title: 'Développeur Full Stack',
      presentation: 'Développeur Full Stack passionné par les technologies web modernes avec 3 ans d\'expérience. Je maîtrise React, Node.js et PostgreSQL et je recherche un poste stimulant dans une équipe dynamique où je pourrai contribuer à des projets innovants tout en continuant à monter en compétences.',
      domains: ['Technologie / IT'],
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Git', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'],
      searchKeywords: ['Full Stack', 'React', 'Node.js', 'TypeScript', 'Remote'],
      jobTypes: ['CDI', 'Freelance'],
      preferredLocations: ['Casablanca', 'Rabat', 'Remote'],
      languages: [{ language: 'Arabe', level: 'Natif' }, { language: 'Français', level: 'Avancé' }, { language: 'Anglais', level: 'Avancé' }],
      location: { city: 'Casablanca', country: 'Maroc', isRemoteOpen: true },
      education: [
        { institution: 'EMSI', degree: 'Ingénieur d\'État', field: 'Génie Logiciel', startDate: daysAgo(1200), endDate: daysAgo(100) },
        { institution: 'Université Hassan II', degree: 'Licence', field: 'Informatique', startDate: daysAgo(1600), endDate: daysAgo(1200) },
      ],
      experience: [
        { company: 'TechMaroc Solutions', position: 'Développeur Full Stack Senior', startDate: daysAgo(400), endDate: null, isCurrent: true, description: 'Développement d\'applications web React/Node.js, architecture microservices, code review.', skills: ['React', 'Node.js', 'TypeScript'] },
        { company: 'DigitalCraft', position: 'Développeur Frontend', startDate: daysAgo(800), endDate: daysAgo(400), isCurrent: false, description: 'Intégration d\'interfaces React responsive, collaboration avec l\'équipe UX.', skills: ['React', 'JavaScript', 'CSS'] },
      ],
    },
    cv: {
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Git', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS', 'REST API', 'Express.js', 'MongoDB', 'Redis'],
      experience: [
        { title: 'Développeur Full Stack Senior', company: 'TechMaroc Solutions', period: 'Jan 2025 - Présent', description: 'Architecture microservices, React, Node.js, PostgreSQL. Migration vers Docker.' },
        { title: 'Développeur Frontend', company: 'DigitalCraft', period: 'Mar 2023 - Jan 2025', description: 'Intégration React, responsive design, optimisation performance.' },
        { title: 'Stagiaire Développeur Web', company: 'WebAgency', period: 'Jun 2022 - Sep 2022', description: 'Développement WordPress et React pour des clients PME.' },
      ],
      education: [
        { degree: 'Ingénieur d\'État en Génie Logiciel', institution: 'EMSI', year: '2020 - 2023' },
        { degree: 'Licence en Informatique', institution: 'Université Hassan II', year: '2017 - 2020' },
      ],
      languages: ['Arabe (Natif)', 'Français (Avancé)', 'Anglais (Avancé)'],
      score: 78,
    },
  },
  {
    firstName: 'Salma', lastName: 'Bennani', email: 'salma.bennani@outlook.com', phone: '+212 6 72 34 56 78',
    jobSearchStatus: 'open_to_offers',
    profile: {
      title: 'Data Analyst',
      presentation: 'Data Analyst avec une solide formation en statistiques et 2 ans d\'expérience en analyse de données business. Je suis spécialisée dans Python, SQL et la visualisation de données avec Power BI. Mon objectif est de transformer des données brutes en insights actionables pour guider les décisions stratégiques.',
      domains: ['Technologie / IT', 'Finance / Banque'],
      skills: ['Python', 'SQL', 'Power BI', 'Excel', 'Pandas', 'Machine Learning', 'Statistics'],
      searchKeywords: ['Data Analysis', 'Python', 'SQL', 'Power BI', 'Business Intelligence'],
      jobTypes: ['CDI'],
      preferredLocations: ['Casablanca', 'Rabat'],
      languages: [{ language: 'Arabe', level: 'Natif' }, { language: 'Français', level: 'Courant' }, { language: 'Anglais', level: 'Avancé' }, { language: 'Espagnol', level: 'Intermédiaire' }],
      location: { city: 'Rabat', country: 'Maroc', isRemoteOpen: false },
      education: [
        { institution: 'ENSIAS', degree: 'Master', field: 'Data Science', startDate: daysAgo(1100), endDate: daysAgo(365) },
        { institution: 'Université Mohammed V', degree: 'Licence', field: 'Mathématiques Appliquées', startDate: daysAgo(1500), endDate: daysAgo(1100) },
      ],
      experience: [
        { company: 'BankAssafa', position: 'Data Analyst', startDate: daysAgo(365), endDate: null, isCurrent: true, description: 'Tableaux de bord Power BI, analyse SQL, reporting automatisé.', skills: ['SQL', 'Power BI', 'Python'] },
        { company: 'DataVision', position: 'Stagiaire Data Analyst', startDate: daysAgo(700), endDate: daysAgo(365), isCurrent: false, description: 'Nettoyage de données, création de dashboards, analyse exploratoire.', skills: ['Python', 'Pandas', 'Excel'] },
      ],
    },
    cv: {
      skills: ['Python', 'SQL', 'Power BI', 'Excel', 'Pandas', 'NumPy', 'Scikit-learn', 'Tableau', 'Jupyter'],
      experience: [
        { title: 'Data Analyst', company: 'BankAssafa', period: 'Mar 2025 - Présent', description: 'Dashboards Power BI, requêtes SQL complexes, automatisation reporting.' },
        { title: 'Stagiaire Data Analyst', company: 'DataVision', period: 'Sep 2023 - Mar 2025', description: 'Analyse exploratoire, nettoyage de données, visualisation.' },
      ],
      education: [
        { degree: 'Master Data Science', institution: 'ENSIAS', year: '2022 - 2024' },
        { degree: 'Licence Mathématiques Appliquées', institution: 'Université Mohammed V', year: '2019 - 2022' },
      ],
      languages: ['Arabe (Natif)', 'Français (Courant)', 'Anglais (Avancé)', 'Espagnol (Intermédiaire)'],
      score: 72,
    },
  },
  {
    firstName: 'Amine', lastName: 'Chaoui', email: 'amine.chaoui@gmail.com', phone: '+212 6 63 45 67 89',
    jobSearchStatus: 'actively_looking',
    profile: {
      title: 'Ingénieur DevOps',
      presentation: 'Ingénieur DevOps expérimenté avec 4 ans d\'expérience en infrastructure cloud et automatisation. Certifié AWS et expert Docker/Kubernetes. Je cherche à rejoindre une entreprise innovante où je pourrai mettre en pratique mes compétences en CI/CD et infrastructure as code.',
      domains: ['Technologie / IT'],
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Linux', 'Python', 'Bash', 'Ansible', 'Git'],
      searchKeywords: ['DevOps', 'AWS', 'Cloud', 'Kubernetes', 'CI/CD', 'Infrastructure'],
      jobTypes: ['CDI'],
      preferredLocations: ['Casablanca', 'Rabat', 'Remote'],
      languages: [{ language: 'Arabe', level: 'Natif' }, { language: 'Français', level: 'Avancé' }, { language: 'Anglais', level: 'Courant' }],
      location: { city: 'Casablanca', country: 'Maroc', isRemoteOpen: true },
      education: [
        { institution: 'EMI', degree: 'Ingénieur d\'État', field: 'Télécommunications et Réseaux', startDate: daysAgo(1800), endDate: daysAgo(700) },
      ],
      experience: [
        { company: 'CloudAfrica', position: 'Ingénieur DevOps', startDate: daysAgo(700), endDate: null, isCurrent: true, description: 'Administration AWS, migration Kubernetes, pipeline CI/CD Jenkins.', skills: ['AWS', 'Kubernetes', 'Jenkins'] },
        { company: 'SecuNet', position: 'Administrateur Système', startDate: daysAgo(1100), endDate: daysAgo(700), isCurrent: false, description: 'Administration Linux, gestion des serveurs, sécurité réseau.', skills: ['Linux', 'Ansible', 'Networking'] },
      ],
    },
    cv: {
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Linux', 'Python', 'Bash', 'Ansible', 'Git', 'CI/CD', 'Nginx', 'Prometheus', 'Grafana'],
      experience: [
        { title: 'Ingénieur DevOps', company: 'CloudAfrica', period: 'Jan 2024 - Présent', description: 'AWS EKS, Docker, Terraform, Jenkins CI/CD. Migration cloud 100%.' },
        { title: 'Administrateur Système', company: 'SecuNet', period: 'Mar 2022 - Jan 2024', description: 'Linux administration, Ansible, monitoring Prometheus/Grafana.' },
        { title: 'Stagiaire Réseau', company: 'MarocTelecom', period: 'Jun 2021 - Sep 2021', description: 'Configuration réseau, support technique.' },
      ],
      education: [
        { degree: 'Ingénieur d\'État Télécommunications et Réseaux', institution: 'EMI', year: '2018 - 2021' },
      ],
      languages: ['Arabe (Natif)', 'Français (Avancé)', 'Anglais (Courant)'],
      score: 85,
    },
  },
  {
    firstName: 'Nadia', lastName: 'Idrissi', email: 'nadia.idrissi@yahoo.fr', phone: '+212 6 54 56 78 90',
    jobSearchStatus: 'open_to_offers',
    profile: {
      title: 'Designer UX/UI',
      presentation: 'Designer UX/UI créative avec 3 ans d\'expérience dans la conception d\'interfaces utilisateur intuitives. Je maîtrise Figma et Adobe XD et j\'ai travaillé pour des startups et des entreprises établies. Mon approche centrée sur l\'utilisateur permet de créer des expériences digitales engageantes.',
      domains: ['Design / Créatif', 'Technologie / IT'],
      skills: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Prototyping', 'User Research', 'Wireframing'],
      searchKeywords: ['UX Design', 'UI Design', 'Figma', 'Prototyping', 'Design System'],
      jobTypes: ['CDI', 'Freelance'],
      preferredLocations: ['Casablanca', 'Marrakech', 'Remote'],
      languages: [{ language: 'Arabe', level: 'Natif' }, { language: 'Français', level: 'Courant' }, { language: 'Anglais', level: 'Avancé' }],
      location: { city: 'Marrakech', country: 'Maroc', isRemoteOpen: true },
      education: [
        { institution: 'ENCG Casablanca', degree: 'Master', field: 'Design Numérique', startDate: daysAgo(1300), endDate: daysAgo(500) },
      ],
      experience: [
        { company: 'CreativeStudio', position: 'Designer UX/UI Senior', startDate: daysAgo(500), endDate: null, isCurrent: true, description: 'Conception de Design System, prototypage Figma, tests utilisateurs.', skills: ['Figma', 'Prototyping', 'User Research'] },
        { company: 'StartupXYZ', position: 'Designer UI', startDate: daysAgo(900), endDate: daysAgo(500), isCurrent: false, description: 'Design d\'interfaces mobile et web, création de maquettes.', skills: ['Figma', 'Adobe XD', 'Photoshop'] },
      ],
    },
    cv: {
      skills: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Sketch', 'InVision', 'Protopie', 'HTML', 'CSS'],
      experience: [
        { title: 'Designer UX/UI Senior', company: 'CreativeStudio', period: 'Jun 2024 - Présent', description: 'Design System entreprise, prototypage avancé, user testing.' },
        { title: 'Designer UI', company: 'StartupXYZ', period: 'Oct 2022 - Jun 2024', description: 'Interfaces mobile et web, maquettes haute fidélité.' },
      ],
      education: [
        { degree: 'Master Design Numérique', institution: 'ENCG Casablanca', year: '2020 - 2022' },
      ],
      languages: ['Arabe (Natif)', 'Français (Courant)', 'Anglais (Avancé)'],
      score: 70,
    },
  },
  {
    firstName: 'Omar', lastName: 'Tazi', email: 'omar.tazi@gmail.com', phone: '+212 6 66 67 78 89',
    jobSearchStatus: 'urgent',
    profile: {
      title: 'Développeur Mobile Flutter',
      application: 'Développeur Mobile Flutter avec 2 ans d\'expérience en développement d\'applications mobiles multiplateformes. Passionné par l\'innovation mobile, je crée des applications performantes et élégantes avec Flutter et Dart. En recherche urgente d\'un nouveau défi.',
      domains: ['Technologie / IT'],
      skills: ['Flutter', 'Dart', 'Firebase', 'React Native', 'Swift', 'Kotlin', 'Git'],
      searchKeywords: ['Mobile', 'Flutter', 'Dart', 'Firebase', 'iOS', 'Android'],
      jobTypes: ['CDI', 'CDD', 'Freelance'],
      preferredLocations: ['Casablanca', 'Tanger', 'Remote'],
      languages: [{ language: 'Arabe', level: 'Natif' }, { language: 'Français', level: 'Avancé' }, { language: 'Anglais', level: 'Intermédiaire' }],
      location: { city: 'Tanger', country: 'Maroc', isRemoteOpen: true },
      education: [
        { institution: 'ENSET Tanger', degree: 'Licence', field: 'Développement Mobile', startDate: daysAgo(1200), endDate: daysAgo(300) },
      ],
      experience: [
        { company: 'AppWorks', position: 'Développeur Mobile Flutter', startDate: daysAgo(300), endDate: null, isCurrent: true, description: 'Développement d\'applications Flutter, intégration Firebase, publication sur stores.', skills: ['Flutter', 'Firebase', 'Dart'] },
        { company: 'MobTech', position: 'Stagiaire Développeur Mobile', startDate: daysAgo(600), endDate: daysAgo(300), isCurrent: false, description: 'Développement React Native, tests unitaires.', skills: ['React Native', 'JavaScript'] },
      ],
    },
    cv: {
      skills: ['Flutter', 'Dart', 'Firebase', 'React Native', 'Swift', 'Kotlin', 'Git', 'REST API', 'Provider', 'GetX'],
      experience: [
        { title: 'Développeur Mobile Flutter', company: 'AppWorks', period: 'Oct 2024 - Présent', description: 'Apps e-commerce et fintech, Firebase, publication Play Store/App Store.' },
        { title: 'Stagiaire Développeur Mobile', company: 'MobTech', period: 'Nov 2023 - Oct 2024', description: 'React Native, tests, CI/CD mobile.' },
      ],
      education: [
        { degree: 'Licence Développement Mobile', institution: 'ENSET Tanger', year: '2021 - 2024' },
      ],
      languages: ['Arabe (Natif)', 'Français (Avancé)', 'Anglais (Intermédiaire)'],
      score: 65,
    },
  },
  {
    firstName: 'Khadija', lastName: 'Moussaid', email: 'khadija.moussaid@gmail.com', phone: '+212 6 77 78 89 90',
    jobSearchStatus: 'actively_looking',
    profile: {
      title: 'Chef de Projet Digital',
      presentation: 'Chef de Projet Digital rigoureux avec 5 ans d\'expérience en gestion de projets web et mobile. Certifiée PMP et practitioner Scrum, je pilote des équipes de 5 à 12 personnes avec méthode agile. Je recherche un poste de responsabilité dans le digital.',
      domains: ['Technologie / IT', 'Digital'],
      skills: ['Gestion de projet', 'Agile', 'Scrum', 'JIRA', 'Trello', 'UML', 'Communication', 'Leadership'],
      searchKeywords: ['Chef de projet', 'Project Manager', 'Agile', 'Scrum', 'Digital'],
      jobTypes: ['CDI'],
      preferredLocations: ['Casablanca', 'Rabat'],
      languages: [{ language: 'Arabe', level: 'Natif' }, { language: 'Français', level: 'Courant' }, { language: 'Anglais', level: 'Courant' }],
      location: { city: 'Rabat', country: 'Maroc', isRemoteOpen: false },
      education: [
        { institution: 'ENSIAS', degree: 'Ingénieur d\'État', field: 'Systèmes d\'Information', startDate: daysAgo(2200), endDate: daysAgo(1200) },
        { institution: 'ISCAE', degree: 'Master', field: 'Management de Projets', startDate: daysAgo(1200), endDate: daysAgo(800) },
      ],
      experience: [
        { company: 'DigitalCraft', position: 'Chef de Projet Digital', startDate: daysAgo(800), endDate: null, isCurrent: true, description: 'Pilotage projets e-commerce, gestion équipe agile, relation client.', skills: ['Agile', 'JIRA', 'Leadership'] },
        { company: 'WebAgency', position: 'Chef de Projet Junior', startDate: daysAgo(1200), endDate: daysAgo(800), isCurrent: false, description: 'Coordination projets web, suivi planning, réunions client.', skills: ['Trello', 'UML', 'Communication'] },
      ],
    },
    cv: {
      skills: ['JIRA', 'Trello', 'Agile', 'Scrum', 'UML', 'MS Project', 'Confluence', 'Slack', 'Notion'],
      experience: [
        { title: 'Chef de Projet Digital', company: 'DigitalCraft', period: 'Jan 2023 - Présent', description: '12 projets livrés, équipe de 8, budget 2M MAD.' },
        { title: 'Chef de Projet Junior', company: 'WebAgency', period: 'Jan 2022 - Jan 2023', description: '6 projets web, coordination multi-équipes.' },
        { title: 'Stagiaire PMO', company: 'ERP Maroc', period: 'Jun 2021 - Dec 2021', description: 'Support gestion de projet, reporting.' },
      ],
      education: [
        { degree: 'Ingénieur d\'État Systèmes d\'Information', institution: 'ENSIAS', year: '2018 - 2021' },
        { degree: 'Master Management de Projets', institution: 'ISCAE', year: '2021 - 2023' },
      ],
      languages: ['Arabe (Natif)', 'Français (Courant)', 'Anglais (Courant)'],
      score: 82,
    },
  },
  {
    firstName: 'Hamza', lastName: 'Berrada', email: 'hamza.berrada@outlook.com', phone: '+212 6 88 89 90 01',
    jobSearchStatus: 'seeking_internship',
    profile: {
      title: 'Étudiant en Informatique',
      presentation: 'Étudiant en 3ème année à l\'EMSI, je recherche un stage de fin d\'études en développement web ou mobile. Motivé et curieux, j\'ai des bases solides en JavaScript et React et je souhaite mettre en pratique mes connaissances dans un environnement professionnel.',
      domains: ['Technologie / IT'],
      skills: ['JavaScript', 'React', 'HTML', 'CSS', 'PHP', 'MySQL', 'Git'],
      searchKeywords: ['Stage', 'Développeur Web', 'React', 'JavaScript', 'Frontend'],
      jobTypes: ['Stage', 'Alternance'],
      preferredLocations: ['Casablanca', 'Rabat'],
      languages: [{ language: 'Arabe', level: 'Natif' }, { language: 'Français', level: 'Avancé' }, { language: 'Anglais', level: 'Intermédiaire' }],
      location: { city: 'Casablanca', country: 'Maroc', isRemoteOpen: false },
      education: [
        { institution: 'EMSI', degree: 'Ingénieur d\'État', field: 'Génie Logiciel', startDate: daysAgo(800), endDate: null },
      ],
      experience: [
        { company: 'TechStartup', position: 'Stagiaire Développeur Web', startDate: daysAgo(100), endDate: null, isCurrent: true, description: 'Développement React pour une application SaaS.', skills: ['React', 'JavaScript'] },
      ],
    },
    cv: {
      skills: ['JavaScript', 'React', 'HTML', 'CSS', 'PHP', 'MySQL', 'Git', 'Bootstrap', 'jQuery'],
      experience: [
        { title: 'Stagiaire Développeur Web', company: 'TechStartup', period: 'Mar 2026 - Présent', description: 'Application SaaS React + Node.js.' },
        { title: 'Projet Académique', company: 'EMSI', period: 'Sep 2025 - Dec 2025', description: 'Plateforme e-commerce React, MySQL.' },
      ],
      education: [
        { degree: 'Ingénieur d\'État Génie Logiciel (en cours)', institution: 'EMSI', year: '2023 - 2026' },
      ],
      languages: ['Arabe (Natif)', 'Français (Avancé)', 'Anglais (Intermédiaire)'],
      score: 45,
    },
  },
  {
    firstName: 'Fatima Zahra', lastName: 'Chakir', email: 'fz.chakir@gmail.com', phone: '+212 6 99 90 01 12',
    jobSearchStatus: 'open_to_offers',
    profile: {
      title: 'Développeuse Python/Django',
      presentation: 'Développeuse Python/Django avec 3 ans d\'expérience dans le développement d\'applications web backend robustes. Je suis passionnée par le code propre et les API RESTful. Je cherche un environnement où je pourrai travailler sur des projets à fort impact technique.',
      domains: ['Technologie / IT'],
      skills: ['Python', 'Django', 'REST API', 'PostgreSQL', 'Redis', 'Docker', 'Git', 'Linux'],
      searchKeywords: ['Python', 'Django', 'Backend', 'API', 'PostgreSQL'],
      jobTypes: ['CDI'],
      preferredLocations: ['Fès', 'Casablanca', 'Remote'],
      languages: [{ language: 'Arabe', level: 'Natif' }, { language: 'Français', level: 'Courant' }, { language: 'Anglais', level: 'Avancé' }],
      location: { city: 'Fès', country: 'Maroc', isRemoteOpen: true },
      education: [
        { institution: 'Université Cadi Ayyad', degree: 'Master', field: 'Intelligence Artificielle', startDate: daysAgo(1400), endDate: daysAgo(500) },
      ],
      experience: [
        { company: 'WebAgency', position: 'Développeuse Python/Django', startDate: daysAgo(500), endDate: null, isCurrent: true, description: 'API REST Django, optimisation PostgreSQL, déploiement Docker.', skills: ['Python', 'Django', 'PostgreSQL'] },
        { company: 'DataVision', position: 'Stagiaire Développeuse Backend', startDate: daysAgo(800), endDate: daysAgo(500), isCurrent: false, description: 'Développement API Flask, tests unitaires.', skills: ['Python', 'Flask'] },
      ],
    },
    cv: {
      skills: ['Python', 'Django', 'Flask', 'REST API', 'PostgreSQL', 'Redis', 'Docker', 'Git', 'Linux', 'Celery', 'pytest'],
      experience: [
        { title: 'Développeuse Python/Django', company: 'WebAgency', period: 'Jun 2024 - Présent', description: 'API REST Django, PostgreSQL, Docker, Celery workers.' },
        { title: 'Stagiaire Backend', company: 'DataVision', period: 'Oct 2023 - Jun 2024', description: 'Flask API, tests pytest, documentation Swagger.' },
      ],
      education: [
        { degree: 'Master Intelligence Artificielle', institution: 'Université Cadi Ayyad', year: '2021 - 2023' },
      ],
      languages: ['Arabe (Natif)', 'Français (Courant)', 'Anglais (Avancé)'],
      score: 75,
    },
  },
  {
    firstName: 'Rachid', lastName: 'Filali', email: 'rachid.filali@gmail.com', phone: '+212 6 10 01 12 23',
    jobSearchStatus: 'actively_looking',
    profile: {
      title: 'Responsable Sécurité Informatique',
      presentation: 'Expert en cybersécurité avec 6 ans d\'expérience en protection des systèmes d\'information. Certifié CISSP et CEH, je mets en place des politiques de sécurité complètes et je forme les équipes aux bonnes pratiques. Je recherche un poste de leadership en sécurité.',
      domains: ['Technologie / IT'],
      skills: ['CISSP', 'Firewalls', 'SIEM', 'Kali Linux', 'Pentesting', 'ISO 27001', 'Risk Assessment'],
      searchKeywords: ['Cybersécurité', 'Security', 'CISSP', 'Pentesting', 'ISO 27001'],
      jobTypes: ['CDI'],
      preferredLocations: ['Casablanca', 'Rabat'],
      languages: [{ language: 'Arabe', level: 'Natif' }, { language: 'Français', level: 'Courant' }, { language: 'Anglais', level: 'Courant' }],
      location: { city: 'Rabat', country: 'Maroc', isRemoteOpen: false },
      education: [
        { institution: 'ENSIAS', degree: 'Ingénieur d\'État', field: 'Sécurité Informatique', startDate: daysAgo(2500), endDate: daysAgo(1500) },
      ],
      experience: [
        { company: 'SecuNet', position: 'Responsable Sécurité Informatique', startDate: daysAgo(800), endDate: null, isCurrent: true, description: 'Politique sécurité ISO 27001, audits, formation équipes.', skills: ['ISO 27001', 'SIEM', 'Firewalls'] },
        { company: 'BankAssafa', position: 'Analyste Sécurité', startDate: daysAgo(1500), endDate: daysAgo(800), isCurrent: false, description: 'Monitoring sécurité, analyse de vulnérabilités, pentesting.', skills: ['Kali Linux', 'Pentesting', 'SIEM'] },
      ],
    },
    cv: {
      skills: ['CISSP', 'CEH', 'Firewalls', 'SIEM', 'Kali Linux', 'Pentesting', 'ISO 27001', 'Wireshark', 'Nessus', 'Metasploit'],
      experience: [
        { title: 'Responsable Sécurité Informatique', company: 'SecuNet', period: 'Jan 2023 - Présent', description: 'ISO 27001, audits sécurité, gestion SOC.' },
        { title: 'Analyste Sécurité', company: 'BankAssafa', period: 'Mar 2021 - Jan 2023', description: 'Pentesting, SIEM, réponse aux incidents.' },
        { title: 'Stagiaire Sécurité', company: 'MarocTelecom', period: 'Jun 2020 - Sep 2020', description: 'Monitoring réseau, analyse vulnérabilités.' },
      ],
      education: [
        { degree: 'Ingénieur d\'État Sécurité Informatique', institution: 'ENSIAS', year: '2017 - 2020' },
      ],
      languages: ['Arabe (Natif)', 'Français (Courant)', 'Anglais (Courant)'],
      score: 88,
    },
  },
  {
    firstName: 'Aicha', lastName: 'Guerfi', email: 'aicha.guerfi@outlook.com', phone: '+212 6 21 12 23 34',
    jobSearchStatus: 'open_to_offers',
    profile: {
      title: 'Ingénieure Qualité Logiciel',
      presentation: 'Ingénieure Quality Assurance avec 4 ans d\'expérience en automatisation de tests et assurance qualité logiciel. Je maîtrise Selenium, Jest et les méthodologies agiles. Mon objectif est de garantir la fiabilité et la performance des applications.',
      domains: ['Technologie / IT'],
      skills: ['Selenium', 'Jest', 'Cypress', 'Python', 'Java', 'SQL', 'JIRA', 'Git'],
      searchKeywords: ['QA', 'Testing', 'Automation', 'Selenium', 'Cypress'],
      jobTypes: ['CDI'],
      preferredLocations: ['Casablanca', 'Tanger', 'Remote'],
      languages: [{ language: 'Arabe', level: 'Natif' }, { language: 'Français', level: 'Courant' }, { language: 'Anglais', level: 'Avancé' }],
      location: { city: 'Casablanca', country: 'Maroc', isRemoteOpen: true },
      education: [
        { institution: 'INPT', degree: 'Ingénieur d\'État', field: 'Génie Logiciel', startDate: daysAgo(1800), endDate: daysAgo(900) },
      ],
      experience: [
        { company: 'TechMaroc Solutions', position: 'Ingénieure QA', startDate: daysAgo(900), endDate: null, isCurrent: true, description: 'Automatisation tests Selenium/Cypress, pipeline CI/CD, reporting qualité.', skills: ['Selenium', 'Cypress', 'Jenkins'] },
        { company: 'DigitalCraft', position: 'Stagiaire QA', startDate: daysAgo(1200), endDate: daysAgo(900), isCurrent: false, description: 'Tests manuels, rédaction de cas de test, suivi de bugs.', skills: ['JIRA', 'SQL', 'Testing'] },
      ],
    },
    cv: {
      skills: ['Selenium', 'Jest', 'Cypress', 'Playwright', 'Python', 'Java', 'SQL', 'Git', 'Jenkins', 'Postman'],
      experience: [
        { title: 'Ingénieure QA', company: 'TechMaroc Solutions', period: 'Jul 2022 - Présent', description: 'Automatisation 200+ tests, Cypress E2E, couverture 85%.' },
        { title: 'Stagiaire QA', company: 'DigitalCraft', period: 'Oct 2021 - Jul 2022', description: 'Tests manuels, JIRA, documentation.' },
      ],
      education: [
        { degree: 'Ingénieur d\'État Génie Logiciel', institution: 'INPT', year: '2019 - 2022' },
      ],
      languages: ['Arabe (Natif)', 'Français (Courant)', 'Anglais (Avancé)'],
      score: 76,
    },
  },
  // ─── NOUVEAUX CANDIDATS (9 à 20) ─────────────────────────────
  {
    firstName: 'Youssef', lastName: 'Amrani', email: 'youssef.amrani@gmail.com', phone: '+212 6 32 12 34 56',
    jobSearchStatus: 'actively_looking',
    profile: {
      title: 'Développeur Backend Java/Spring',
      presentation: 'Développeur Backend avec 4 ans d\'expérience en Java et Spring Boot. Spécialisé dans les architectures microservices et les API REST. Je recherche un poste dans une grande entreprise avec des défis techniques stimulants.',
      domains: ['Technologie / IT'],
      skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Docker', 'Kubernetes', 'Redis', 'Kafka'],
      searchKeywords: ['Java', 'Spring', 'Backend', 'Microservices', 'API'],
      jobTypes: ['CDI'],
      preferredLocations: ['Casablanca', 'Rabat', 'Remote'],
      languages: [{ language: 'Arabe', level: 'Natif' }, { language: 'Français', level: 'Avancé' }, { language: 'Anglais', level: 'Avancé' }],
      location: { city: 'Casablanca', country: 'Maroc', isRemoteOpen: true },
      education: [
        { institution: 'ENSIAS', degree: 'Ingénieur d\'État', field: 'Génie Logiciel', startDate: daysAgo(2000), endDate: daysAgo(1100) },
      ],
      experience: [
        { company: 'OCP Group', position: 'Développeur Backend Java', startDate: daysAgo(1100), endDate: null, isCurrent: true, description: 'Développement d\'applications enterprise avec Spring Boot, Kafka, microservices.', skills: ['Java', 'Spring Boot', 'Kafka'] },
        { company: 'Telnet', position: 'Développeur Junior Java', startDate: daysAgo(1500), endDate: daysAgo(1100), isCurrent: false, description: 'Développement d\'applications web Java EE, tests unitaires.', skills: ['Java', 'SQL', 'Git'] },
      ],
    },
    cv: {
      skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Docker', 'Kubernetes', 'Redis', 'Kafka', 'Maven', 'Git'],
      experience: [
        { title: 'Développeur Backend Java', company: 'OCP Group', period: 'Jan 2022 - Présent', description: 'Architecture microservices, Spring Boot, Kafka, Docker.' },
        { title: 'Développeur Junior Java', company: 'Telnet', period: 'Mar 2021 - Jan 2022', description: 'Applications Java EE, SQL, tests unitaires.' },
      ],
      education: [
        { degree: 'Ingénieur d\'État Génie Logiciel', institution: 'ENSIAS', year: '2018 - 2021' },
      ],
      languages: ['Arabe (Natif)', 'Français (Avancé)', 'Anglais (Avancé)'],
      score: 74,
    },
  },
  {
    firstName: 'Sara', lastName: 'Tahiri', email: 'sara.tahiri@outlook.com', phone: '+212 6 43 23 45 67',
    jobSearchStatus: 'open_to_offers',
    profile: {
      title: 'Chef de Projet Marketing Digital',
      presentation: 'Chef de projet marketing digital avec 3 ans d\'expérience en stratégie digitale et gestion de campagnes. Maîtrise SEO, SEM et analytics. Je recherche un poste dans une entreprise innovante.',
      domains: ['Marketing / Communication', 'Digital'],
      skills: ['SEO', 'Google Ads', 'Social Media', 'Analytics', 'Content Marketing', 'Email Marketing'],
      searchKeywords: ['Marketing Digital', 'SEO', 'Google Ads', 'Social Media', 'Content'],
      jobTypes: ['CDI'],
      preferredLocations: ['Casablanca', 'Marrakech'],
      languages: [{ language: 'Arabe', level: 'Natif' }, { language: 'Français', level: 'Courant' }, { language: 'Anglais', level: 'Avancé' }],
      location: { city: 'Casablanca', country: 'Maroc', isRemoteOpen: false },
      education: [
        { institution: 'ISCAE', degree: 'Master', field: 'Marketing Digital', startDate: daysAgo(1400), endDate: daysAgo(600) },
      ],
      experience: [
        { company: 'MarocTelecom', position: 'Chef de Projet Marketing Digital', startDate: daysAgo(600), endDate: null, isCurrent: true, description: 'Gestion des campagnes digitales, SEO, Google Ads, analytics.', skills: ['SEO', 'Google Ads', 'Analytics'] },
        { company: 'L\'Oréal Maroc', position: 'Stagiaire Marketing', startDate: daysAgo(900), endDate: daysAgo(600), isCurrent: false, description: 'Assistance gestion campagnes, community management.', skills: ['Social Media', 'Content Marketing'] },
      ],
    },
    cv: {
      skills: ['SEO', 'Google Ads', 'Social Media', 'Analytics', 'Content Marketing', 'Email Marketing', 'HubSpot', 'WordPress'],
      experience: [
        { title: 'Chef de Projet Marketing Digital', company: 'MarocTelecom', period: 'Jun 2024 - Présent', description: 'Campagnes digitales, SEO +40% trafic, ROI Google Ads.' },
        { title: 'Stagiaire Marketing', company: 'L\'Oréal Maroc', period: 'Sep 2023 - Jun 2024', description: 'Community management, contenu digtal.' },
      ],
      education: [
        { degree: 'Master Marketing Digital', institution: 'ISCAE', year: '2021 - 2023' },
      ],
      languages: ['Arabe (Natif)', 'Français (Courant)', 'Anglais (Avancé)'],
      score: 68,
    },
  },
  {
    firstName: 'Ahmed', lastName: 'Bouzid', email: 'ahmed.bouzid@gmail.com', phone: '+212 6 54 34 56 78',
    jobSearchStatus: 'actively_looking',
    profile: {
      title: 'Ingénieur Cloud & Infrastructure',
      presentation: 'Ingénieur Cloud certifié AWS et Azure avec 5 ans d\'expérience. Expert en infrastructure as code, Terraform et automatisation. Je pilote des migrations cloud à grande échelle.',
      domains: ['Technologie / IT', 'Cloud'],
      skills: ['AWS', 'Azure', 'Terraform', 'Docker', 'Kubernetes', 'Ansible', 'Linux', 'Bash', 'Python'],
      searchKeywords: ['Cloud', 'AWS', 'Azure', 'Terraform', 'Infrastructure'],
      jobTypes: ['CDI'],
      preferredLocations: ['Casablanca', 'Remote'],
      languages: [{ language: 'Arabe', level: 'Natif' }, { language: 'Français', level: 'Courant' }, { language: 'Anglais', level: 'Courant' }],
      location: { city: 'Casablanca', country: 'Maroc', isRemoteOpen: true },
      education: [
        { institution: 'EMI', degree: 'Ingénieur d\'État', field: 'Réseaux et Systèmes', startDate: daysAgo(2200), endDate: daysAgo(1300) },
      ],
      experience: [
        { company: 'ONCF', position: 'Ingénieur Cloud', startDate: daysAgo(1300), endDate: null, isCurrent: true, description: 'Migration AWS, Terraform, Kubernetes, automatisation Ansible.', skills: ['AWS', 'Terraform', 'Kubernetes'] },
        { company: 'IBM Maroc', position: 'Admin Système Linux', startDate: daysAgo(1800), endDate: daysAgo(1300), isCurrent: false, description: 'Administration serveurs Linux, monitoring Nagios.', skills: ['Linux', 'Nagios', 'Bash'] },
      ],
    },
    cv: {
      skills: ['AWS', 'Azure', 'Terraform', 'Docker', 'Kubernetes', 'Ansible', 'Linux', 'Bash', 'Python', 'Nagios'],
      experience: [
        { title: 'Ingénieur Cloud', company: 'ONCF', period: 'Mar 2022 - Présent', description: 'Migration cloud AWS, Terraform IaC, Kubernetes.' },
        { title: 'Admin Système Linux', company: 'IBM Maroc', period: 'Jun 2020 - Mar 2022', description: 'Linux admin, monitoring, scripting Bash.' },
      ],
      education: [
        { degree: 'Ingénieur d\'État Réseaux et Systèmes', institution: 'EMI', year: '2017 - 2020' },
      ],
      languages: ['Arabe (Natif)', 'Français (Courant)', 'Anglais (Courant)'],
      score: 82,
    },
  },
  {
    firstName: 'Malika', lastName: 'El Ouahbi', email: 'malika.ouahbi@yahoo.fr', phone: '+212 6 65 45 67 89',
    jobSearchStatus: 'open_to_offers',
    profile: {
      title: 'Comptable Senior',
      presentation: 'Comptable certifiée avec 6 ans d\'expérience en cabinet comptable. Maîtrise la comptabilité générale, fiscale et sociale. Diplômée DECG, je recherche un poste en entreprise ou en cabinet.',
      domains: ['Finance / Banque', 'Comptabilité'],
      skills: ['Comptabilité', 'Sage', 'QuickBooks', 'Fiscalité', 'Paie', 'Excel', 'IFRS'],
      searchKeywords: ['Comptable', 'Comptabilité', 'Fiscalité', 'Paie', 'Sage'],
      jobTypes: ['CDI'],
      preferredLocations: ['Casablanca', 'Rabat'],
      languages: [{ language: 'Arabe', level: 'Natif' }, { language: 'Français', level: 'Courant' }, { language: 'Anglais', level: 'Intermédiaire' }],
      location: { city: 'Rabat', country: 'Maroc', isRemoteOpen: false },
      education: [
        { institution: 'ISCAE', degree: 'DECG', field: 'Comptabilité et Gestion', startDate: daysAgo(2400), endDate: daysAgo(1800) },
      ],
      experience: [
        { company: 'KPMG Maroc', position: 'Comptable Senior', startDate: daysAgo(1200), endDate: null, isCurrent: true, description: 'Gestion portefeuille clients, bilans fiscaux, audit.', skills: ['Comptabilité', 'Fiscalité', 'Audit'] },
        { company: 'PwC Maroc', position: 'Comptable Junior', startDate: daysAgo(1800), endDate: daysAgo(1200), isCurrent: false, description: 'Tenue comptable, déclarations fiscales, paie.', skills: ['Sage', 'Paie', 'Excel'] },
      ],
    },
    cv: {
      skills: ['Comptabilité', 'Sage', 'QuickBooks', 'Fiscalité', 'Paie', 'Excel', 'IFRS', 'Audit'],
      experience: [
        { title: 'Comptable Senior', company: 'KPMG Maroc', period: 'Jan 2023 - Présent', description: 'Portefeuille 30+ clients, bilans IFRS, fiscalité.' },
        { title: 'Comptable Junior', company: 'PwC Maroc', period: 'Jan 2021 - Jan 2023', description: 'Tenue comptable, déclarations fiscales, Sage.' },
      ],
      education: [
        { degree: 'DECG Comptabilité et Gestion', institution: 'ISCAE', year: '2018 - 2021' },
      ],
      languages: ['Arabe (Natif)', 'Français (Courant)', 'Anglais (Intermédiaire)'],
      score: 71,
    },
  },
  {
    firstName: 'Othman', lastName: 'Chraibi', email: 'othman.chraibi@gmail.com', phone: '+212 6 76 56 78 90',
    jobSearchStatus: 'urgent',
    profile: {
      title: 'Développeur Frontend Vue.js',
      presentation: 'Développeur Frontend passionné par les interfaces utilisateur modernes avec 3 ans d\'expérience en Vue.js et Nuxt.js. En recherche urgente, disponible immédiatement.',
      domains: ['Technologie / IT'],
      skills: ['Vue.js', 'Nuxt.js', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS', 'Vuetify'],
      searchKeywords: ['Vue.js', 'Frontend', 'Nuxt.js', 'JavaScript', 'TypeScript'],
      jobTypes: ['CDI', 'CDD', 'Freelance'],
      preferredLocations: ['Casablanca', 'Tanger', 'Remote'],
      languages: [{ language: 'Arabe', level: 'Natif' }, { language: 'Français', level: 'Avancé' }, { language: 'Anglais', level: 'Intermédiaire' }],
      location: { city: 'Tanger', country: 'Maroc', isRemoteOpen: true },
      education: [
        { institution: 'ENSA Tanger', degree: 'Licence', field: 'Informatique', startDate: daysAgo(1200), endDate: daysAgo(500) },
      ],
      experience: [
        { company: 'Vermeg', position: 'Développeur Frontend Vue.js', startDate: daysAgo(500), endDate: null, isCurrent: true, description: 'Développement d\'interfaces avec Vue.js/Vuetify, optimisation performance.', skills: ['Vue.js', 'Vuetify', 'JavaScript'] },
        { company: 'Sofrecom', position: 'Stagiaire Développeur Web', startDate: daysAgo(800), endDate: daysAgo(500), isCurrent: false, description: 'Intégration HTML/CSS, développement JavaScript.', skills: ['HTML', 'CSS', 'JavaScript'] },
      ],
    },
    cv: {
      skills: ['Vue.js', 'Nuxt.js', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS', 'Vuetify', 'Pinia', 'Vuex'],
      experience: [
        { title: 'Développeur Frontend Vue.js', company: 'Vermeg', period: 'Jun 2024 - Présent', description: 'Vue.js 3, Vuetify 3, Pinia, composition API.' },
        { title: 'Stagiaire Développeur Web', company: 'Sofrecom', period: 'Sep 2023 - Jun 2024', description: 'HTML/CSS/JS, intégration responsive.' },
      ],
      education: [
        { degree: 'Licence Informatique', institution: 'ENSA Tanger', year: '2021 - 2024' },
      ],
      languages: ['Arabe (Natif)', 'Français (Avancé)', 'Anglais (Intermédiaire)'],
      score: 62,
    },
  },
  {
    firstName: 'Houda', lastName: 'Benkirane', email: 'houda.benkirane@gmail.com', phone: '+212 6 87 67 89 01',
    jobSearchStatus: 'actively_looking',
    profile: {
      title: 'Data Scientist',
      presentation: 'Data Scientist avec Master en Intelligence Artificielle et 2 ans d\'expérience. Spécialisée en machine learning et deep learning avec Python. Passionnée par l\'innovation data-driven.',
      domains: ['Technologie / IT', 'Data / Intelligence Artificielle'],
      skills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'SQL', 'Pandas', 'NLP', 'Deep Learning'],
      searchKeywords: ['Data Science', 'Machine Learning', 'Deep Learning', 'Python', 'AI'],
      jobTypes: ['CDI', 'Freelance'],
      preferredLocations: ['Casablanca', 'Rabat', 'Remote'],
      languages: [{ language: 'Arabe', level: 'Natif' }, { language: 'Français', level: 'Courant' }, { language: 'Anglais', level: 'Courant' }],
      location: { city: 'Casablanca', country: 'Maroc', isRemoteOpen: true },
      education: [
        { institution: 'ENSIAS', degree: 'Master', field: 'Intelligence Artificielle', startDate: daysAgo(1000), endDate: daysAgo(300) },
      ],
      experience: [
        { company: 'Procter & Gamble', position: 'Data Scientist', startDate: daysAgo(300), endDate: null, isCurrent: true, description: 'Modèles de prédiction ventes, NLP pour analyse feedback client.', skills: ['Python', 'TensorFlow', 'NLP'] },
        { company: 'UM6P', position: 'Stagiaire Research', startDate: daysAgo(500), endDate: daysAgo(300), isCurrent: false, description: 'Recherche deep learning, publication article scientifique.', skills: ['PyTorch', 'Deep Learning', 'Python'] },
      ],
    },
    cv: {
      skills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'SQL', 'Pandas', 'NLP', 'Deep Learning', 'Spark'],
      experience: [
        { title: 'Data Scientist', company: 'Procter & Gamble', period: 'Oct 2024 - Présent', description: 'Modèles ML prédictifs, NLP, pipeline de données.' },
        { title: 'Stagiaire Research', company: 'UM6P', period: 'Jun 2024 - Oct 2024', description: 'Deep learning, CNN, publication scientifique.' },
      ],
      education: [
        { degree: 'Master Intelligence Artificielle', institution: 'ENSIAS', year: '2022 - 2024' },
      ],
      languages: ['Arabe (Natif)', 'Français (Courant)', 'Anglais (Courant)'],
      score: 79,
    },
  },
  {
    firstName: 'Karim', lastName: 'El Mansouri', email: 'karim.mansouri@outlook.com', phone: '+212 6 98 78 90 12',
    jobSearchStatus: 'open_to_offers',
    profile: {
      title: 'Responsable RH',
      presentation: 'Professionnel RH avec 7 ans d\'expérience en gestion des ressources humaines. Spécialisé en recrutement, administration du personnel et droit du travail. Certifié SHRM.',
      domains: ['Ressources Humaines', 'Administration'],
      skills: ['Recrutement', 'Gestion des talents', 'Droit du travail', 'Payroll', 'SIRH', 'Formation', 'RH'],
      searchKeywords: ['RH', 'Recrutement', 'Gestion des talents', 'SIRH', 'DRH'],
      jobTypes: ['CDI'],
      preferredLocations: ['Casablanca', 'Rabat'],
      languages: [{ language: 'Arabe', level: 'Natif' }, { language: 'Français', level: 'Courant' }, { language: 'Anglais', level: 'Courant' }],
      location: { city: 'Rabat', country: 'Maroc', isRemoteOpen: false },
      education: [
        { institution: 'ISCAE', degree: 'Master', field: 'Gestion des Ressources Humaines', startDate: daysAgo(2800), endDate: daysAgo(2000) },
      ],
      experience: [
        { company: 'BMCE Bank', position: 'Responsable RH', startDate: daysAgo(1400), endDate: null, isCurrent: true, description: 'Pilote RH pour 500+ employés, recrutement, formation, administration.', skills: ['Recrutement', 'SIRH', 'Formation'] },
        { company: 'CIH Bank', position: 'Chargé de Recrutement', startDate: daysAgo(2000), endDate: daysAgo(1400), isCurrent: false, description: 'Gestion processus de recrutement, entretiens, onboarding.', skills: ['Recrutement', 'Onboarding', 'Droit du travail'] },
      ],
    },
    cv: {
      skills: ['Recrutement', 'Gestion des talents', 'Droit du travail', 'Payroll', 'SIRH', 'Formation', 'Talent Acquisition'],
      experience: [
        { title: 'Responsable RH', company: 'BMCE Bank', period: 'Jan 2022 - Présent', description: '500+ employés, recrutement annuel 50+, plan formation.' },
        { title: 'Chargé de Recrutement', company: 'CIH Bank', period: 'Jan 2020 - Jan 2022', description: 'Processus recrutement complet, entretiens, tests.' },
      ],
      education: [
        { degree: 'Master GRH', institution: 'ISCAE', year: '2017 - 2019' },
      ],
      languages: ['Arabe (Natif)', 'Français (Courant)', 'Anglais (Courant)'],
      score: 73,
    },
  },
  {
    firstName: 'Najlae', lastName: 'Roudani', email: 'najlae.roudani@gmail.com', phone: '+212 7 09 89 01 23',
    jobSearchStatus: 'seeking_internship',
    profile: {
      title: 'Étudiante Ingénieure en Informatique',
      presentation: 'Étudiante en 4ème année à l\'ENSIAS, à la recherche d\'un stage PFE en développement web ou intelligence artificielle. Bonnes bases en Python, JavaScript et bases de données.',
      domains: ['Technologie / IT'],
      skills: ['Python', 'JavaScript', 'React', 'Django', 'SQL', 'Git', 'HTML', 'CSS'],
      searchKeywords: ['Stage', 'PFE', 'Développeur', 'Python', 'React'],
      jobTypes: ['Stage', 'Alternance'],
      preferredLocations: ['Casablanca', 'Rabat'],
      languages: [{ language: 'Arabe', level: 'Natif' }, { language: 'Français', level: 'Courant' }, { language: 'Anglais', level: 'Avancé' }],
      location: { city: 'Rabat', country: 'Maroc', isRemoteOpen: false },
      education: [
        { institution: 'ENSIAS', degree: 'Ingénieur d\'État', field: 'Génie Logiciel', startDate: daysAgo(1000), endDate: null },
      ],
      experience: [
        { company: 'MarocTelecom', position: 'Stagiaire Data', startDate: daysAgo(80), endDate: null, isCurrent: true, description: 'Stage d\'été en data analytics, dashboards Power BI.', skills: ['Python', 'SQL', 'Power BI'] },
      ],
    },
    cv: {
      skills: ['Python', 'JavaScript', 'React', 'Django', 'SQL', 'Git', 'HTML', 'CSS', 'Pandas', 'Power BI'],
      experience: [
        { title: 'Stagiaire Data', company: 'MarocTelecom', period: 'Jul 2025 - Présent', description: 'Data analytics, Power BI, Python.' },
        { title: 'Projet Académique', company: 'ENSIAS', period: 'Sep 2024 - Jun 2025', description: 'Application web React + Django, gestion de projets.' },
      ],
      education: [
        { degree: 'Ingénieur d\'État Génie Logiciel (en cours)', institution: 'ENSIAS', year: '2022 - 2026' },
      ],
      languages: ['Arabe (Natif)', 'Français (Courant)', 'Anglais (Avancé)'],
      score: 52,
    },
  },
  {
    firstName: 'Zakaria', lastName: 'Ait Brahim', email: 'zakaria.aitbrahim@gmail.com', phone: '+212 6 10 11 22 33',
    jobSearchStatus: 'actively_looking',
    profile: {
      title: 'Développeur Mobile iOS/Swift',
      presentation: 'Développeur iOS natif avec 3 ans d\'expérience en Swift et UIKit. Apps publiées sur l\'App Store. Je maîtrise aussi SwiftUI et Firebase. Je cherche un poste de développeur iOS dans une équipe produit.',
      domains: ['Technologie / IT', 'Mobile'],
      skills: ['Swift', 'SwiftUI', 'UIKit', 'Firebase', 'CoreData', 'REST API', 'Git', 'Xcode'],
      searchKeywords: ['iOS', 'Swift', 'Mobile', 'SwiftUI', 'Xcode'],
      jobTypes: ['CDI', 'Freelance'],
      preferredLocations: ['Casablanca', 'Tanger', 'Remote'],
      languages: [{ language: 'Arabe', level: 'Natif' }, { language: 'Français', level: 'Avancé' }, { language: 'Anglais', level: 'Avancé' }],
      location: { city: 'Casablanca', country: 'Maroc', isRemoteOpen: true },
      education: [
        { institution: '1337 (42 Network)', degree: 'Formation', field: 'Développement iOS', startDate: daysAgo(1500), endDate: daysAgo(800) },
      ],
      experience: [
        { company: 'Involys', position: 'Développeur iOS', startDate: daysAgo(800), endDate: null, isCurrent: true, description: 'Développement d\'applications iOS Swift, architecture MVVM, CI/CD.', skills: ['Swift', 'MVVM', 'CI/CD'] },
        { company: 'Freelance', position: 'Développeur iOS Freelance', startDate: daysAgo(1100), endDate: daysAgo(800), isCurrent: false, description: 'Applications iOS pour clients PME, SwiftUI.', skills: ['SwiftUI', 'Firebase'] },
      ],
    },
    cv: {
      skills: ['Swift', 'SwiftUI', 'UIKit', 'Firebase', 'CoreData', 'REST API', 'Git', 'Xcode', 'Core Animation', 'Combine'],
      experience: [
        { title: 'Développeur iOS', company: 'Involys', period: 'Jan 2023 - Présent', description: 'Apps iOS enterprise, MVVM, SwiftUI, CI/CD Xcode Cloud.' },
        { title: 'Développeur iOS Freelance', company: 'Freelance', period: 'Oct 2022 - Jan 2023', description: '3 apps iOS publiées App Store.' },
      ],
      education: [
        { degree: 'Formation Développement iOS', institution: '1337 (42 Network)', year: '2020 - 2022' },
      ],
      languages: ['Arabe (Natif)', 'Français (Avancé)', 'Anglais (Avancé)'],
      score: 77,
    },
  },
  {
    firstName: 'Amina', lastName: 'El Ghalbouni', email: 'amina.ghalbouni@yahoo.fr', phone: '+212 6 21 22 33 44',
    jobSearchStatus: 'open_to_offers',
    profile: {
      title: 'Architecte Logiciel',
      presentation: 'Architecte logiciel avec 8 ans d\'expérience en conception et développement d\'applications distribuées. Expert Java/Cloud, je conçois des architectures scalables et résilientes pour des systèmes critiques.',
      domains: ['Technologie / IT'],
      skills: ['Java', 'Spring Cloud', 'AWS', 'Microservices', 'Domain-Driven Design', 'Event Sourcing', 'Kubernetes'],
      searchKeywords: ['Architecte', 'Software Architecture', 'Java', 'Cloud', 'Microservices'],
      jobTypes: ['CDI'],
      preferredLocations: ['Casablanca', 'Remote'],
      languages: [{ language: 'Arabe', level: 'Natif' }, { language: 'Français', level: 'Courant' }, { language: 'Anglais', level: 'Courant' }],
      location: { city: 'Casablanca', country: 'Maroc', isRemoteOpen: true },
      education: [
        { institution: 'EMI', degree: 'Ingénieur d\'État', field: 'Informatique', startDate: daysAgo(3200), endDate: daysAgo(2300) },
      ],
      experience: [
        { company: 'Attijariwafa Bank', position: 'Architecte Logiciel', startDate: daysAgo(1400), endDate: null, isCurrent: true, description: 'Architecture microservices, cloud AWS, modernisation legacy.', skills: ['Java', 'AWS', 'Microservices'] },
        { company: 'Sogeti', position: 'Lead Developer Java', startDate: daysAgo(2300), endDate: daysAgo(1400), isCurrent: false, description: 'Leadership technique, conception d\'architecture, code review.', skills: ['Java', 'Spring', 'Architecture'] },
      ],
    },
    cv: {
      skills: ['Java', 'Spring Cloud', 'AWS', 'Microservices', 'Domain-Driven Design', 'Event Sourcing', 'Kubernetes', 'RabbitMQ', 'MongoDB'],
      experience: [
        { title: 'Architecte Logiciel', company: 'Attijariwafa Bank', period: 'Mar 2022 - Présent', description: 'Migration 50+ services vers microservices, AWS.' },
        { title: 'Lead Developer Java', company: 'Sogeti', period: 'Jun 2019 - Mar 2022', description: 'Leadership équipe 8 devs, architecture Spring Cloud.' },
      ],
      education: [
        { degree: 'Ingénieur d\'État Informatique', institution: 'EMI', year: '2015 - 2018' },
      ],
      languages: ['Arabe (Natif)', 'Français (Courant)', 'Anglais (Courant)'],
      score: 90,
    },
  },
  {
    firstName: 'Mehdi', lastName: 'Lamrani', email: 'mehdi.lamrani@gmail.com', phone: '+212 6 32 33 44 55',
    jobSearchStatus: 'actively_looking',
    profile: {
      title: 'Technicien Support IT',
      presentation: 'Technicien support IT avec 2 ans d\'expérience en support utilisateurs et administration réseau. Compétent en Windows Server, Active Directory et Help Desk. Cherche un poste en support IT ou administration système.',
      domains: ['Technologie / IT', 'Support'],
      skills: ['Windows Server', 'Active Directory', 'Networking', 'Help Desk', 'ITIL', 'Troubleshooting', 'Linux'],
      searchKeywords: ['Support IT', 'Help Desk', 'Admin Réseau', 'Windows Server', 'ITIL'],
      jobTypes: ['CDI', 'CDD'],
      preferredLocations: ['Casablanca', 'Rabat'],
      languages: [{ language: 'Arabe', level: 'Natif' }, { language: 'Français', level: 'Avancé' }, { language: 'Anglais', level: 'Intermédiaire' }],
      location: { city: 'Casablanca', country: 'Maroc', isRemoteOpen: false },
      education: [
        { institution: 'ISTA', degree: 'Technicien Spécialisé', field: 'Réseaux Informatiques', startDate: daysAgo(1000), endDate: daysAgo(400) },
      ],
      experience: [
        { company: 'MarocTelecom', position: 'Technicien Support N2', startDate: daysAgo(400), endDate: null, isCurrent: true, description: 'Support utilisateurs N2, Active Directory, résolution incidents.', skills: ['Windows Server', 'Active Directory', 'Help Desk'] },
        { company: 'Orange Maroc', position: 'Stagiaire Support', startDate: daysAgo(600), endDate: daysAgo(400), isCurrent: false, description: 'Support N1, ticketing, documentation procédures.', skills: ['Help Desk', 'ITIL'] },
      ],
    },
    cv: {
      skills: ['Windows Server', 'Active Directory', 'Networking', 'Help Desk', 'ITIL', 'Troubleshooting', 'Linux', 'VMware'],
      experience: [
        { title: 'Technicien Support N2', company: 'MarocTelecom', period: 'May 2025 - Présent', description: 'Support N2, AD, DHCP/DNS, Group Policy.' },
        { title: 'Stagiaire Support', company: 'Orange Maroc', period: 'Nov 2024 - May 2025', description: 'Support N1, ticketing ServiceNow.' },
      ],
      education: [
        { degree: 'Technicien Spécialisé Réseaux', institution: 'ISTA', year: '2022 - 2024' },
      ],
      languages: ['Arabe (Natif)', 'Français (Avancé)', 'Anglais (Intermédiaire)'],
      score: 55,
    },
  },
  {
    firstName: 'Imane', lastName: 'Ziani', email: 'imane.ziani@outlook.com', phone: '+212 6 43 44 55 66',
    jobSearchStatus: 'open_to_offers',
    profile: {
      title: 'Traffic Manager',
      presentation: 'Traffic Manager digital avec 3 ans d\'expérience en gestion de campagnes publicitaires et optimisation conversion. Expertise Google Ads, Meta Ads et Analytics. Je vise l\'optimisation du ROI digital.',
      domains: ['Marketing / Communication', 'E-commerce'],
      skills: ['Google Ads', 'Meta Ads', 'Google Analytics', 'SEO', 'CRO', 'A/B Testing', 'Hotjar', 'Google Tag Manager'],
      searchKeywords: ['Traffic Manager', 'Google Ads', 'Meta Ads', 'PPC', 'Conversion'],
      jobTypes: ['CDI', 'Freelance'],
      preferredLocations: ['Casablanca', 'Marrakech', 'Remote'],
      languages: [{ language: 'Arabe', level: 'Natif' }, { language: 'Français', level: 'Courant' }, { language: 'Anglais', level: 'Avancé' }, { language: 'Espagnol', level: 'Intermédiaire' }],
      location: { city: 'Marrakech', country: 'Maroc', isRemoteOpen: true },
      education: [
        { institution: 'ENCG Casablanca', degree: 'Master', field: 'Marketing Digital', startDate: daysAgo(1400), endDate: daysAgo(600) },
      ],
      experience: [
        { company: 'Jumia Maroc', position: 'Traffic Manager', startDate: daysAgo(600), endDate: null, isCurrent: true, description: 'Gestion budget pub 500k MAD/mois, Google Ads, Meta Ads, CRO.', skills: ['Google Ads', 'Meta Ads', 'CRO'] },
        { company: 'VoguePay', position: 'Growth Hacker', startDate: daysAgo(900), endDate: daysAgo(600), isCurrent: false, description: 'Stratégie d\'acquisition, SEO, A/B testing, analytics.', skills: ['SEO', 'Google Analytics', 'A/B Testing'] },
      ],
    },
    cv: {
      skills: ['Google Ads', 'Meta Ads', 'Google Analytics', 'SEO', 'CRO', 'A/B Testing', 'Hotjar', 'Google Tag Manager', 'Data Studio'],
      experience: [
        { title: 'Traffic Manager', company: 'Jumia Maroc', period: 'Jun 2024 - Présent', description: 'Budget 500k/mois, ROAS x4, 15k conversions/mois.' },
        { title: 'Growth Hacker', company: 'VoguePay', period: 'Sep 2023 - Jun 2024', description: 'Acquisition +60%, SEO top 3 keywords.' },
      ],
      education: [
        { degree: 'Master Marketing Digital', institution: 'ENCG Casablanca', year: '2021 - 2023' },
      ],
      languages: ['Arabe (Natif)', 'Français (Courant)', 'Anglais (Avancé)', 'Espagnol (Intermédiaire)'],
      score: 72,
    },
  },
]

// ─── RECRUITERS DATA ───────────────────────────────────────────
const recruitersData = [
  {
    firstName: 'Khalid', lastName: 'Senhaji', email: 'khalid.senhaji@techmaroc.ma', phone: '+212 6 50 10 20 30',
    company: {
      companyName: 'TechMaroc Solutions',
      companyDescription: 'Leader marocain du développement logiciel et des solutions digitales. 200+ employés, clients internationaux.',
      industry: 'Technologie / IT',
      companySize: '201-500',
      companyLocation: 'Casablanca',
      companyWebsite: 'https://techmaroc.ma',
      position: 'DRH',
      linkedinUrl: 'https://www.linkedin.com/in/khalid-senhaji/',
    },
    hiringDomains: ['Technologie / IT', 'Digital'],
  },
  {
    firstName: 'Meriem', lastName: 'Fassi-Fihri', email: 'meriem.ff@cloudafrica.com', phone: '+212 6 60 20 30 40',
    company: {
      companyName: 'CloudAfrica',
      companyDescription: 'Startup cloud computing spécialisée en infrastructure AWS et migration cloud pour entreprises africaines.',
      industry: 'Technologie / IT',
      companySize: '51-200',
      companyLocation: 'Rabat',
      companyWebsite: 'https://cloudafrica.com',
      position: 'CTO & Co-fondatrice',
      linkedinUrl: 'https://www.linkedin.com/in/meriem-ff/',
    },
    hiringDomains: ['Technologie / IT', 'Cloud', 'DevOps'],
  },
  {
    firstName: 'Abdellah', lastName: 'Omari', email: 'abdellah.omari@digitalcraft.ma', phone: '+212 6 70 30 40 50',
    company: {
      companyName: 'DigitalCraft',
      companyDescription: 'Agence digitale complète : design, développement, marketing digital. Basée à Marrakech avec des clients au niveau international.',
      industry: 'Marketing / Communication',
      companySize: '51-200',
      companyLocation: 'Marrakech',
      companyWebsite: 'https://digitalcraft.ma',
      position: 'Directeur Commercial',
      linkedinUrl: 'https://www.linkedin.com/in/abdellah-omari/',
    },
    hiringDomains: ['Design / Créatif', 'Technologie / IT', 'Marketing / Communication'],
  },
  {
    firstName: 'Samira', lastName: 'Bennani', email: 'samira.bennani@appworks.ma', phone: '+212 6 80 40 50 60',
    company: {
      companyName: 'AppWorks',
      companyDescription: 'Studio de développement mobile spécialisé dans les applications iOS et Android pour le marché africain.',
      industry: 'Technologie / IT',
      companySize: '11-50',
      companyLocation: 'Tanger',
      companyWebsite: 'https://appworks.ma',
      position: 'Head of Engineering',
      linkedinUrl: 'https://www.linkedin.com/in/samira-bennani/',
    },
    hiringDomains: ['Technologie / IT', 'Mobile'],
  },
  {
    firstName: 'Younes', lastName: 'Alaoui', email: 'younes.alaoui@secunet.ma', phone: '+212 6 90 50 60 70',
    company: {
      companyName: 'SecuNet',
      companyDescription: 'Cabinet de conseil en cybersécurité pour grandes entreprises et institutions publiques au Maroc.',
      industry: 'Technologie / IT',
      companySize: '11-50',
      companyLocation: 'Rabat',
      companyWebsite: 'https://secunet.ma',
      position: 'Directeur Général',
      linkedinUrl: 'https://www.linkedin.com/in/younes-alaoui/',
    },
    hiringDomains: ['Technologie / IT', 'Cybersécurité'],
  },
  // ─── NOUVEAUX RECRUTEURS (6 à 10) ─────────────────────────────
  {
    firstName: 'Rachid', lastName: 'Mouline', email: 'rachid.mouline@oci.ma', phone: '+212 6 11 60 70 80',
    company: {
      companyName: 'OCP Digital',
      companyDescription: 'Branche digitale du groupe OCP, leader mondial de l\'engrais. Innovation et transformation digitale à grande échelle.',
      industry: 'Technologie / IT',
      companySize: '501-1000',
      companyLocation: 'Casablanca',
      companyWebsite: 'https://ocp.ma',
      position: 'Directeur Innovation Digitale',
      linkedinUrl: 'https://www.linkedin.com/in/rachid-mouline/',
    },
    hiringDomains: ['Technologie / IT', 'Data / Intelligence Artificielle', 'Cloud'],
  },
  {
    firstName: 'Fatima', lastName: 'Zerhouni', email: 'fatima.zerhouni@carenet.ma', phone: '+212 6 22 70 80 90',
    company: {
      companyName: 'CareNet Health',
      companyDescription: 'Startup HealthTech proposant des solutions digitales pour le secteur de la santé au Maroc et en Afrique.',
      industry: 'Santé',
      companySize: '11-50',
      companyLocation: 'Casablanca',
      companyWebsite: 'https://carenet.ma',
      position: 'CEO & Fondatrice',
      linkedinUrl: 'https://www.linkedin.com/in/fatima-zerhouni/',
    },
    hiringDomains: ['Technologie / IT', 'Santé', 'Mobile'],
  },
  {
    firstName: 'Hassan', lastName: 'Bennani', email: 'hassan.bennani@bassacapital.ma', phone: '+212 6 33 80 90 01',
    company: {
      companyName: 'Bassa Capital Technologies',
      companyDescription: 'Fintech marocaine offrant des solutions de paiement digital et de finance participative.',
      industry: 'Finance / Banque',
      companySize: '51-200',
      companyLocation: 'Casablanca',
      companyWebsite: 'https://bassacapital.ma',
      position: 'CTO',
      linkedinUrl: 'https://www.linkedin.com/in/hassan-bennani/',
    },
    hiringDomains: ['Technologie / IT', 'Finance / Banque', 'Fintech'],
  },
  {
    firstName: 'Nadia', lastName: 'Filali', email: 'nadia.filali@edua.ma', phone: '+212 6 44 90 01 12',
    company: {
      companyName: 'EduTech Maroc',
      companyDescription: 'Plateforme d\'éducation en ligne pour les étudiants marocains. EdTech en forte croissance.',
      industry: 'Éducation',
      companySize: '11-50',
      companyLocation: 'Rabat',
      companyWebsite: 'https://edua.ma',
      position: 'Directrice des Opérations',
      linkedinUrl: 'https://www.linkedin.com/in/nadia-filali/',
    },
    hiringDomains: ['Éducation', 'Technologie / IT', 'Content'],
  },
  {
    firstName: 'Mohammed', lastName: 'Chaoui', email: 'mohammed.chaoui@logisticsma.ma', phone: '+212 6 55 01 12 23',
    company: {
      companyName: 'LogisticsMa',
      companyDescription: 'Solutions logistiques et supply chain pour le e-commerce au Maroc. Partenaire de grandes plateformes.',
      industry: 'Logistique / Transport',
      companySize: '201-500',
      companyLocation: 'Tanger',
      companyWebsite: 'https://logisticsma.ma',
      position: 'Directeur Général',
      linkedinUrl: 'https://www.linkedin.com/in/mohammed-chaoui/',
    },
    hiringDomains: ['Logistique / Transport', 'E-commerce', 'Technologie / IT'],
  },
]

// ─── JOB OFFERS (posted by recruiters) ─────────────────────────
const recruiterJobs = [
  {
    title: 'Développeur Full Stack React/Node.js', company: 'TechMaroc Solutions', location: 'Casablanca',
    isRemote: true, contractType: 'CDI', domain: 'Technologie / IT', sector: 'Tech',
    description: 'Rejoignez notre équipe pour développer des applications web performantes avec React, Node.js et PostgreSQL. Projets variés pour des clients internationaux.',
    requirements: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Docker'],
    salary: { min: 15000, max: 25000, currency: 'MAD' },
  },
  {
    title: 'Ingénieur DevOps Senior', company: 'CloudAfrica', location: 'Rabat',
    isRemote: false, contractType: 'CDI', domain: 'Technologie / IT', sector: 'Cloud',
    description: 'Pilotez notre infrastructure cloud AWS, mettez en place des pipelines CI/CD et optimisez nos environnements de production.',
    requirements: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins'],
    salary: { min: 20000, max: 30000, currency: 'MAD' },
  },
  {
    title: 'Designer UX/UI Senior', company: 'DigitalCraft', location: 'Marrakech',
    isRemote: true, contractType: 'CDI', domain: 'Design / Créatif', sector: 'Design',
    description: 'Concevez des expériences utilisateur exceptionnelles pour nos clients internationaux. Leadership du design system.',
    requirements: ['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Design System'],
    salary: { min: 14000, max: 22000, currency: 'MAD' },
  },
  {
    title: 'Développeur Flutter Senior', company: 'AppWorks', location: 'Tanger',
    isRemote: true, contractType: 'CDI', domain: 'Technologie / IT', sector: 'Mobile',
    description: 'Développez des applications mobiles innovantes pour le marché africain avec Flutter. Projets e-commerce et fintech.',
    requirements: ['Flutter', 'Dart', 'Firebase', 'iOS', 'Android'],
    salary: { min: 16000, max: 24000, currency: 'MAD' },
  },
  {
    title: 'Consultant Cybersécurité', company: 'SecuNet', location: 'Rabat',
    isRemote: false, contractType: 'CDI', domain: 'Technologie / IT', sector: 'Cybersécurité',
    description: 'Audit de sécurité, pentesting et conseil en protection des systèmes d\'information pour nos clients grands comptes.',
    requirements: ['CISSP', 'Pentesting', 'ISO 27001', 'SIEM', 'Firewalls'],
    salary: { min: 22000, max: 35000, currency: 'MAD' },
  },
  {
    title: 'Chef de Projet Digital', company: 'DigitalCraft', location: 'Casablanca',
    isRemote: false, contractType: 'CDI', domain: 'Technologie / IT', sector: 'Digital',
    description: 'Pilotez des projets web et mobile de A à Z pour nos clients. Gestion d\'équipes agiles et relation client.',
    requirements: ['Gestion de projet', 'Agile', 'Scrum', 'JIRA', 'Communication'],
    salary: { min: 15000, max: 23000, currency: 'MAD' },
  },
  {
    title: 'Data Engineer', company: 'TechMaroc Solutions', location: 'Casablanca',
    isRemote: true, contractType: 'CDI', domain: 'Technologie / IT', sector: 'Data',
    description: 'Concevez et maintenez nos pipelines de données. Architecture data lake et ETL sur AWS.',
    requirements: ['Python', 'SQL', 'AWS', 'Spark', 'Airflow'],
    salary: { min: 18000, max: 28000, currency: 'MAD' },
  },
  {
    title: 'Développeur Backend Python/Django', company: 'CloudAfrica', location: 'Rabat',
    isRemote: true, contractType: 'CDI', domain: 'Technologie / IT', sector: 'Tech',
    description: 'Développez des API REST robustes et scalables avec Django pour notre plateforme cloud.',
    requirements: ['Python', 'Django', 'REST API', 'PostgreSQL', 'Docker'],
    salary: { min: 14000, max: 22000, currency: 'MAD' },
  },
  {
    title: 'Chef de Projet IT', company: 'SecuNet', location: 'Rabat',
    isRemote: false, contractType: 'CDI', domain: 'Technologie / IT', sector: 'Cybersécurité',
    description: 'Gérez des projets d\'audit sécurité et de transformation digitale pour nos clients institutionnels.',
    requirements: ['Gestion de projet', 'PMP', 'ITIL', 'Agile', 'Sécurité'],
    salary: { min: 18000, max: 28000, currency: 'MAD' },
  },
  {
    title: 'Stage Développeur Frontend React', company: 'DigitalCraft', location: 'Casablanca',
    isRemote: true, contractType: 'Stage', domain: 'Technologie / IT', sector: 'Tech',
    description: 'Stage de 6 mois en développement React. Intégration dans une équipe agile, projets clients.',
    requirements: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
    salary: { min: 3000, max: 5000, currency: 'MAD' },
  },
  {
    title: 'Ingénieur QA Automation', company: 'AppWorks', location: 'Tanger',
    isRemote: true, contractType: 'CDD', domain: 'Technologie / IT', sector: 'Tech',
    description: 'Automatisation de tests E2E pour applications mobiles. Cypress, Playwright, CI/CD.',
    requirements: ['Cypress', 'Selenium', 'Python', 'Java', 'Git'],
    salary: { min: 12000, max: 18000, currency: 'MAD' },
  },
  {
    title: 'Développeur Mobile React Native', company: 'TechMaroc Solutions', location: 'Casablanca',
    isRemote: true, contractType: 'CDI', domain: 'Technologie / IT', sector: 'Mobile',
    description: 'Développez des applications mobiles cross-platform avec React Native pour nos clients enterprise.',
    requirements: ['React Native', 'JavaScript', 'TypeScript', 'Firebase', 'Git'],
    salary: { min: 14000, max: 22000, currency: 'MAD' },
  },
  {
    title: 'Architecte Cloud AWS', company: 'CloudAfrica', location: 'Casablanca',
    isRemote: true, contractType: 'CDI', domain: 'Technologie / IT', sector: 'Cloud',
    description: 'Concevez et pilotez l\'architecture cloud de nos clients sur AWS. Infrastructure as code, microservices.',
    requirements: ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'Microservices'],
    salary: { min: 25000, max: 40000, currency: 'MAD' },
  },
  {
    title: 'Responsable Marketing Digital', company: 'DigitalCraft', location: 'Marrakech',
    isRemote: false, contractType: 'CDI', domain: 'Marketing / Communication', sector: 'Marketing',
    description: 'Pilotez la stratégie marketing digital de l\'agence. SEO, SEM, réseaux sociaux, content marketing.',
    requirements: ['SEO', 'Google Ads', 'Social Media', 'Analytics', 'Content Marketing'],
    salary: { min: 13000, max: 20000, currency: 'MAD' },
  },
  {
    title: 'Stagiaire DevOps', company: 'CloudAfrica', location: 'Rabat',
    isRemote: true, contractType: 'Stage', domain: 'Technologie / IT', sector: 'Cloud',
    description: 'Stage de 6 mois en DevOps. Découvrez Docker, Kubernetes, CI/CD et l\'infrastructure cloud.',
    requirements: ['Linux', 'Docker', 'Git', 'Python', 'Bash'],
    salary: { min: 3500, max: 5500, currency: 'MAD' },
  },
  // ─── OFFRES DES NOUVEAUX RECRUTEURS ─────────────────────────
  {
    title: 'Data Engineer Senior', company: 'OCP Digital', location: 'Casablanca',
    isRemote: true, contractType: 'CDI', domain: 'Technologie / IT', sector: 'Data',
    description: 'Concevez et pilotez nos pipelines de données Big Data pour optimiser la production et la logistique du groupe OCP.',
    requirements: ['Python', 'Spark', 'AWS', 'Airflow', 'SQL', 'Kafka'],
    salary: { min: 22000, max: 35000, currency: 'MAD' },
  },
  {
    title: 'Développeur Full Stack React/Node.js', company: 'OCP Digital', location: 'Casablanca',
    isRemote: true, contractType: 'CDI', domain: 'Technologie / IT', sector: 'Tech',
    description: 'Développez des applications web innovantes pour les plateformes digitales du groupe OCP.',
    requirements: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
    salary: { min: 16000, max: 26000, currency: 'MAD' },
  },
  {
    title: 'Développeur Mobile Flutter', company: 'CareNet Health', location: 'Casablanca',
    isRemote: true, contractType: 'CDI', domain: 'Technologie / IT', sector: 'Mobile',
    description: 'Développez une application mobile santé révolutionnaire pour les patients et médecins marocains.',
    requirements: ['Flutter', 'Dart', 'Firebase', 'REST API', 'Git'],
    salary: { min: 13000, max: 20000, currency: 'MAD' },
  },
  {
    title: 'Backend Developer PHP/Laravel', company: 'CareNet Health', location: 'Casablanca',
    isRemote: false, contractType: 'CDI', domain: 'Technologie / IT', sector: 'Tech',
    description: 'Développez le backend de notre plateforme HealthTech avec Laravel et MySQL.',
    requirements: ['PHP', 'Laravel', 'MySQL', 'REST API', 'Docker'],
    salary: { min: 12000, max: 18000, currency: 'MAD' },
  },
  {
    title: 'Développeur Backend Java', company: 'Bassa Capital Technologies', location: 'Casablanca',
    isRemote: true, contractType: 'CDI', domain: 'Technologie / IT', sector: 'Fintech',
    description: 'Développez des microservices Java pour notre plateforme de paiement digital. Sécurité et performance.',
    requirements: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Redis'],
    salary: { min: 18000, max: 28000, currency: 'MAD' },
  },
  {
    title: 'Ingénieur Sécurité Informatique', company: 'Bassa Capital Technologies', location: 'Casablanca',
    isRemote: false, contractType: 'CDI', domain: 'Technologie / IT', sector: 'Fintech',
    description: 'Sécurisez nos systèmes de paiement et assurez la conformité PCI-DSS.',
    requirements: ['Sécurité', 'PCI-DSS', 'OWASP', 'Pentesting', 'SIEM'],
    salary: { min: 20000, max: 32000, currency: 'MAD' },
  },
  {
    title: 'Développeur Full Stack Vue.js/Laravel', company: 'EduTech Maroc', location: 'Rabat',
    isRemote: true, contractType: 'CDI', domain: 'Technologie / IT', sector: 'EdTech',
    description: 'Développez notre plateforme d\'e-learning avec Vue.js et Laravel. Fonctionnalités interactives et gamification.',
    requirements: ['Vue.js', 'Laravel', 'MySQL', 'JavaScript', 'REST API'],
    salary: { min: 12000, max: 18000, currency: 'MAD' },
  },
  {
    title: 'UX/UI Designer', company: 'EduTech Maroc', location: 'Rabat',
    isRemote: true, contractType: 'CDI', domain: 'Design / Créatif', sector: 'EdTech',
    description: 'Concevez des expériences d\'apprentissage engageantes et intuitives pour nos étudiants.',
    requirements: ['Figma', 'Prototyping', 'User Research', 'Design System', 'Accessibility'],
    salary: { min: 11000, max: 17000, currency: 'MAD' },
  },
  {
    title: 'Développeur Backend Python', company: 'LogisticsMa', location: 'Tanger',
    isRemote: false, contractType: 'CDI', domain: 'Technologie / IT', sector: 'Logistique',
    description: 'Développez des API REST pour notre plateforme de gestion logistique et de tracking en temps réel.',
    requirements: ['Python', 'Django', 'PostgreSQL', 'Docker', 'REST API'],
    salary: { min: 13000, max: 20000, currency: 'MAD' },
  },
  {
    title: 'Ingénieur DevOps', company: 'LogisticsMa', location: 'Tanger',
    isRemote: true, contractType: 'CDI', domain: 'Technologie / IT', sector: 'Logistique',
    description: 'Automatisez et pilotez notre infrastructure cloud. CI/CD, monitoring, scalabilité.',
    requirements: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins'],
    salary: { min: 16000, max: 25000, currency: 'MAD' },
  },
]

// ─── RECRUITER CONTACTS (for candidate network) ────────────────
const recruiterContacts = [
  { firstName: 'Fatima', lastName: 'Benali', title: 'HR Manager', company: 'TechMaroc Solutions', email: 'f.benali@techmaroc.ma', location: 'Casablanca', sector: 'Tech', connectionDegree: '1st', tags: ['tech', 'recrutement', 'CDI'] },
  { firstName: 'Mohammed', lastName: 'Alami', title: 'CTO', company: 'CloudAfrica', email: 'm.alami@cloudafrica.com', location: 'Rabat', sector: 'Tech', connectionDegree: '2nd', tags: ['devops', 'cloud', 'startup'] },
  { firstName: 'Sophia', lastName: 'Tazi', title: 'Talent Acquisition', company: 'DigitalCraft', email: 's.tazi@digitalcraft.ma', location: 'Marrakech', sector: 'Digital', connectionDegree: '1st', tags: ['digital', 'design', 'recrutement'] },
  { firstName: 'Hassan', lastName: 'Bouzekri', title: 'Recruiter', company: 'AppWorks', email: 'h.bouzekri@appworks.ma', location: 'Tanger', sector: 'Mobile', connectionDegree: '1st', tags: ['mobile', 'flutter', 'startup'] },
  { firstName: 'Najat', lastName: 'Chraibi', title: 'HR Director', company: 'SecuNet', email: 'n.chraibi@secunet.ma', location: 'Rabat', sector: 'Cybersécurité', connectionDegree: '2nd', tags: ['sécurité', 'recrutement'] },
  { firstName: 'Othman', lastName: 'Kettani', title: 'Tech Lead', company: 'WebAgency', email: 'o.kettani@webagency.ma', location: 'Fès', sector: 'Tech', connectionDegree: '3rd+', tags: ['web', 'django', 'python'] },
  { firstName: 'Laila', lastName: 'Mansouri', title: 'Head of HR', company: 'BankAssafa', email: 'l.mansouri@bankassafa.ma', location: 'Casablanca', sector: 'Finance', connectionDegree: '1st', tags: ['finance', 'banque', 'data'] },
  { firstName: 'Rida', lastName: 'Benjelloun', title: 'Directeur Technique', company: 'DataVision', email: 'r.benjelloun@datavision.ma', location: 'Casablanca', sector: 'Data', connectionDegree: '2nd', tags: ['data', 'AI', 'analytics'] },
]

// ─── NOTIFICATION TEMPLATES ────────────────────────────────────
const notifTemplates = [
  { type: 'nouvelle_offre', title: 'Nouvelle offre correspondante', messages: [
    'Un nouveau poste de Développeur Full Stack a été trouvé sur LinkedIn.',
    'Offre Alert: Ingénieur DevOps chez CloudAfrica — 20-30k MAD/mois.',
    'Stage Développeur Frontend chez DigitalCraft — candidature possible.',
    'Nouvelle offre Flutter Senior chez AppWorks à Tanger.',
    'Poste Chef de Projet Digital disponible chez DigitalCraft.',
  ]},
  { type: 'candidature', title: 'Candidature envoyée', messages: [
    'Votre candidature pour Développeur Full Stack a été envoyée avec succès.',
    'Candidature pour Ingénieur DevOps bien reçue par le recruteur.',
    'Votre candidature pour Designer UX/UI est en cours de traitement.',
    'Le recruteur chez AppWorks a bien reçu votre candidature.',
    'Candidature Stage Développeur Frontend envoyée à DigitalCraft.',
  ]},
  { type: 'email', title: 'Email ouvert', messages: [
    'Le recruteur chez TechMaroc a ouvert votre email de candidature.',
    'Email de candidature lu par le CTO de CloudAfrica.',
    'Votre message a été consulté par le responsable RH de SecuNet.',
  ]},
  { type: 'scrapping', title: 'Scraping terminé', messages: [
    '12 nouvelles offres ont été collectées depuis LinkedIn.',
    '8 offres Indeed et 5 offres Rekrute ont été ajoutées.',
    'Scraping terminé : 15 nouvelles offres correspondant à votre profil.',
    'Nouvelles offres Welcome to the Jungle disponibles.',
  ]},
  { type: 'rappel', title: 'Rappel de suivi', messages: [
    'N\'oubliez pas de relancer le recruteur chez TechMaroc.',
    'Relance recommandée pour votre candidature chez DigitalCraft.',
    'Il y a 5 jours que vous n\'avez pas vérifié vos candidatures.',
    'Nouveau message de suivi de la part de CloudAfrica.',
  ]},
]

// ─── CV SUMMARIES (auto-generated style) ──────────────────────
function generateCvSummary(candidate) {
  const p = candidate.profile
  const cv = candidate.cv
  const parts = []
  parts.push(`${candidate.firstName} est titulaire d'un diplôme en ${p.education[0]?.field || 'Informatique'}`)
  if (p.experience.length > 0) {
    const titles = p.experience.filter(e => !e.description?.includes('Stage') && !e.description?.includes('stagiaire')).map(e => e.position)
    if (titles.length > 0) parts.push(`Il/elle a occupé le(s) poste(s) : ${titles.join(', ')}`)
  }
  if (cv.skills.length > 0) parts.push(`Ses compétences techniques incluent ${cv.skills.slice(0, 6).join(', ')}`)
  if (p.languages?.length > 0) parts.push(`Il/elle parle ${p.languages.slice(0, 3).map(l => l.language).join(', ')}`)
  return parts.join('. ') + '.'
}

// ─── MAIN SEED ─────────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('📦 Connecté à MongoDB Atlas')

    // Clean existing data
    await Promise.all([
      User.deleteMany({}),
      UserProfile.deleteMany({}),
      RecruiterProfile.deleteMany({}),
      JobOffer.deleteMany({}),
      Application.deleteMany({}),
      Notification.deleteMany({}),
      Recruiter.deleteMany({}),
      EmailTemplate.deleteMany({}),
    ])
    console.log('🗑️ Toutes les anciennes données supprimées')

    // ─── 1. CREATE CANDIDATE USERS ───────────────────────────
    const candidateUsers = []
    for (const c of candidatesData) {
      const user = await User.create({
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        password: PASSWORD,
        phone: c.phone,
        role: 'candidat',
        isEmailVerified: true,
        jobSearchStatus: c.jobSearchStatus,
        onboardingCompleted: true,
        lastLogin: daysAgo(randomBetween(0, 3)),
      })
      candidateUsers.push({ user, data: c })
      console.log(`  ✅ Candidat: ${c.firstName} ${c.lastName} (${c.email})`)
    }

    // ─── 2. CREATE RECRUITER USERS + PROFILES ────────────────
    const recruiterUsers = []
    for (const r of recruitersData) {
      const user = await User.create({
        firstName: r.firstName,
        lastName: r.lastName,
        email: r.email,
        password: PASSWORD,
        phone: r.phone,
        role: 'recruiter',
        isEmailVerified: true,
        lastLogin: daysAgo(randomBetween(0, 2)),
      })
      await RecruiterProfile.create({
        userId: user._id,
        ...r.company,
        hiringDomains: r.hiringDomains,
        jobPostingsCount: 0,
        totalApplications: 0,
      })
      recruiterUsers.push({ user, data: r })
      console.log(`  ✅ Recruteur: ${r.firstName} ${r.lastName} (${r.email})`)
    }

    // ─── 3. CREATE CANDIDATE PROFILES ─────────────────────────
    for (const { user, data } of candidateUsers) {
      await UserProfile.findOneAndUpdate(
        { userId: user._id },
        { userId: user._id, ...data.profile },
        { upsert: true, new: true }
      )
    }
    console.log(`✅ ${candidateUsers.length} profils candidats créés`)

    // ─── 4. CREATE CVs (inline model) ─────────────────────────
    const CV = mongoose.models.CV || mongoose.model('CV', new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      fileName: String, originalName: String, fileData: String, fileSize: Number, mimeType: String,
      extractedText: { type: String, default: '' },
      parsedData: {
        skills: [String],
        experience: [{ title: String, company: String, period: String, description: String }],
        education: [{ degree: String, institution: String, year: String }],
        languages: [String], email: String, phone: String, location: String,
      },
      analysis: { score: { type: Number, default: 0 }, strengths: [String], improvements: [String], suggestions: [String] },
      candidateSummary: { type: String, default: '' },
      keywords: [String],
      isActive: { type: Boolean, default: true },
      version: { type: Number, default: 1 },
    }, { timestamps: true }))

    for (const { user, data } of candidateUsers) {
      const summary = generateCvSummary(data)
      const keywords = [...new Set([...data.cv.skills, ...data.profile.searchKeywords, ...data.profile.domains])]
      await CV.create({
        userId: user._id,
        fileName: `cv_${data.firstName.toLowerCase()}_${data.lastName.toLowerCase()}.pdf`,
        originalName: `CV_${data.firstName}_${data.lastName}.pdf`,
        fileSize: randomBetween(80000, 300000),
        mimeType: 'application/pdf',
        extractedText: `CV de ${data.firstName} ${data.lastName} - ${data.profile.title}`,
        parsedData: {
          skills: data.cv.skills,
          experience: data.cv.experience,
          education: data.cv.education,
          languages: data.cv.languages,
          email: data.email,
          phone: data.phone,
          location: data.profile.location.city,
        },
        analysis: {
          score: data.cv.score,
          strengths: [
            `${data.cv.skills.length} compétences techniques identifiées`,
            data.cv.experience.length >= 2 ? 'Parcours professionnel documenté' : 'Profil en développement',
            data.cv.score >= 70 ? 'CV de bonne qualité' : 'CV à enrichir',
          ],
          improvements: data.cv.score < 70 ? ['Ajoutez plus de détails sur vos réalisations', 'Enrichissez la section compétences'] : [],
          suggestions: ['Personnalisez votre CV pour chaque offre', 'Ajoutez des réalisations chiffrées'],
        },
        candidateSummary: summary,
        keywords,
        version: 1,
      })
    }
    console.log(`✅ ${candidateUsers.length} CVs créés`)

    // ─── 5. CREATE RECRUITER JOB OFFERS ───────────────────────
    const createdJobs = []
    for (let i = 0; i < recruiterJobs.length; i++) {
      const job = recruiterJobs[i]
      const recruiter = recruiterUsers[i % recruiterUsers.length]
      const created = await JobOffer.create({
        ...job,
        postedBy: recruiter.user._id,
        source: 'recruiter',
        sourceId: `recruiter-seed-${Date.now()}-${i}`,
        postedAt: daysAgo(randomBetween(1, 14)),
        scrapedAt: daysAgo(randomBetween(1, 14)),
        isActive: true,
        applicationsCount: 0,
        keywords: job.requirements,
        viewsCount: randomBetween(20, 200),
      })
      createdJobs.push(created)
    }

    // Update recruiter job counts
    for (const r of recruiterUsers) {
      const count = createdJobs.filter(j => j.postedBy.toString() === r.user._id.toString()).length
      await RecruiterProfile.findOneAndUpdate({ userId: r.user._id }, { jobPostingsCount: count })
    }
    console.log(`✅ ${createdJobs.length} offres d'emploi créées par les recruteurs`)

    // ─── 6. CREATE APPLICATIONS ───────────────────────────────
    const statuses = ['envoyee', 'ouverte', 'en_cours', 'acceptee', 'refusee', 'brouillon']
    const applications = []
    for (const { user } of candidateUsers) {
      // Each candidate applies to 4-8 random jobs
      const numApps = randomBetween(4, 8)
      const shuffledJobs = [...createdJobs].sort(() => Math.random() - 0.5).slice(0, numApps)
      for (const job of shuffledJobs) {
        const existing = applications.find(a => a.userId.toString() === user._id.toString() && a.jobOfferId.toString() === job._id.toString())
        if (existing) continue
        const status = randomFrom(statuses)
        const daysOffset = randomBetween(1, 14)
        const app = await Application.create({
          userId: user._id,
          jobOfferId: job._id,
          status,
          coverLetter: `Madame, Monsieur,\n\nJe vous soumets ma candidature pour le poste de ${job.title} chez ${job.company}. Mes compétences en ${job.requirements.slice(0, 3).join(', ')} correspondent parfaitement à vos besoins.\n\nCordialement`,
          email: {
            to: `recruteur@${job.company.toLowerCase().replace(/\s+/g, '')}.ma`,
            subject: `Candidature ${job.title}`,
            body: `Candidature en ligne pour ${job.title}`,
            sentAt: status !== 'brouillon' ? daysAgo(daysOffset) : undefined,
            openedAt: ['ouverte', 'en_cours', 'acceptee'].includes(status) ? daysAgo(Math.max(0, daysOffset - randomBetween(1, 3))) : undefined,
          },
          followUpDate: status === 'en_cours' ? daysAgo(randomBetween(-2, 2)) : undefined,
          followUpCount: randomBetween(0, 3),
        })
        applications.push(app)
        // Update application count on job
        await JobOffer.findByIdAndUpdate(job._id, { $inc: { applicationsCount: 1 } })
      }
    }
    console.log(`✅ ${applications.length} candidatures créées`)

    // Update recruiter total applications
    for (const r of recruiterUsers) {
      const jobIds = createdJobs.filter(j => j.postedBy.toString() === r.user._id.toString()).map(j => j._id)
      const totalApps = await Application.countDocuments({ jobOfferId: { $in: jobIds } })
      await RecruiterProfile.findOneAndUpdate({ userId: r.user._id }, { totalApplications: totalApps })
    }

    // ─── 7. CREATE NOTIFICATIONS ──────────────────────────────
    let totalNotifs = 0
    for (const { user } of candidateUsers) {
      const numNotifs = randomBetween(6, 12)
      for (let i = 0; i < numNotifs; i++) {
        const template = randomFrom(notifTemplates)
        await Notification.create({
          userId: user._id,
          type: template.type,
          title: template.title,
          message: randomFrom(template.messages),
          isRead: Math.random() > 0.4,
          createdAt: daysAgo(randomBetween(0, 14)),
        })
        totalNotifs++
      }
    }
    console.log(`✅ ${totalNotifs} notifications créées`)

    // ─── 8. CREATE RECRUITER CONTACTS (for candidates) ────────
    const targetCandidate = candidateUsers[0] // Youssef gets most contacts
    for (const rec of recruiterContacts.slice(0, 4)) {
      await Recruiter.findOneAndUpdate(
        { userId: targetCandidate.user._id, email: rec.email },
        { ...rec, userId: targetCandidate.user._id, isActive: true },
        { upsert: true, new: true }
      )
    }
    // Give 2-3 contacts to other candidates
    for (const { user } of candidateUsers.slice(1, 5)) {
      const subset = recruiterContacts.slice(randomBetween(0, 3), randomBetween(4, 6))
      for (const rec of subset) {
        await Recruiter.findOneAndUpdate(
          { userId: user._id, email: rec.email },
          { ...rec, userId: user._id, isActive: true },
          { upsert: true, new: true }
        )
      }
    }
    console.log(`✅ Réseaux recruteurs créés pour les candidats`)

    // ─── 9. EMAIL TEMPLATES ───────────────────────────────────
    const templates = [
      {
        name: 'Candidature Standard',
        subject: 'Candidature au poste de {{jobTitle}} chez {{company}}',
        body: 'Madame, Monsieur,\n\nJe me permets de vous adresser ma candidature pour le poste de {{jobTitle}} au sein de {{company}}.\n\nTitulaire d\'un parcours en {{studyField}} et fort de {{experienceYears}} années d\'expérience, je suis convaincu(e) de pouvoir contribuer activement aux objectifs de votre entreprise.\n\nJe reste à votre disposition pour un entretien à votre convenance.\n\nDans cette attente, je vous prie d\'agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.\n\n{{userName}}\n{{applicationDate}}',
        variables: ['jobTitle', 'company', 'studyField', 'experienceYears', 'userName', 'applicationDate'],
        isDefault: true, category: 'Candidature',
      },
      {
        name: 'Relance après candidature',
        subject: 'Relance — Candidature {{jobTitle}}',
        body: 'Madame, Monsieur,\n\nJe me permets de revenir vers vous concernant ma candidature au poste de {{jobTitle}} envoyée le {{applicationDate}}.\n\nMon profil vous a-t-il été présenté ? Je reste très motivé(e) par cette opportunité au sein de {{company}} et me tiens à votre disposition pour tout complément d\'information ou un entretien.\n\nCordialement,\n{{userName}}',
        variables: ['jobTitle', 'applicationDate', 'company', 'userName'],
        isDefault: true, category: 'Relance',
      },
      {
        name: 'Remerciement après entretien',
        subject: 'Remerciement — Entretien {{jobTitle}}',
        body: 'Bonjour {{recruiterName}},\n\nJe tenais à vous remercier pour le temps que vous m\'avez accordé lors de notre entretien pour le poste de {{jobTitle}}.\n\nNotre échange a renforcé mon intérêt pour rejoindre {{company}}. N\'hésitez pas à me solliciter si vous avez besoin de précisions supplémentaires.\n\nDans l\'attente de votre retour,\nCordialement,\n{{userName}}',
        variables: ['recruiterName', 'jobTitle', 'company', 'userName'],
        isDefault: true, category: 'Remerciement',
      },
    ]
    for (const t of templates) {
      await EmailTemplate.create(t)
    }
    console.log(`✅ ${templates.length} templates d'emails créés`)

    // ─── 10. COMPANY EMAILS ──────────────────────────────────
    await CompanyEmail.deleteMany({})
    for (const c of companyEmailsData) {
      await CompanyEmail.findOneAndUpdate(
        { email: c.email },
        { ...c, isActive: true },
        { upsert: true, new: true }
      )
    }
    console.log(`✅ ${companyEmailsData.length} entreprises ajoutées à l'annuaire`)

    // ─── SUMMARY ──────────────────────────────────────────────
    console.log('\n' + '═'.repeat(50))
    console.log('🎉 SEED TERMINÉ AVEC SUCCÈS!')
    console.log('═'.repeat(50))
    console.log(`\n📊 RÉSUMÉ:`)
    console.log(`   👤 ${candidateUsers.length} candidats créés`)
    console.log(`   👔 ${recruiterUsers.length} recruteurs créés`)
    console.log(`   💼 ${createdJobs.length} offres d'emploi`)
    console.log(`   📝 ${applications.length} candidatures`)
    console.log(`   🔔 ${totalNotifs} notifications`)
    console.log(`   📧 ${templates.length} templates d'emails`)
    console.log(`   🏢 ${companyEmailsData.length} entreprises (annuaire)`)
    console.log(`\n🔑 COMPTE DE CONNEXION (tous les comptes):`)
    console.log(`   Mot de passe: ${PASSWORD}`)
    console.log(`\n   👤 CANDIDATS:`)
    for (const c of candidatesData) {
      console.log(`      ${c.email} (${c.profile.title})`)
    }
    console.log(`\n   👔 RECRUTEURS:`)
    for (const r of recruitersData) {
      console.log(`      ${r.email} (${r.company.companyName})`)
    }
    console.log('')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur seed:', error)
    process.exit(1)
  }
}

seed()
