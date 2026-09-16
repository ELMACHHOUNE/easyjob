# JobConnect AI — Plateforme Intelligente de Candidature Automatisée

## Vision Générale

JobConnect AI est une application web full-stack qui automatise et optimise le processus de recherche d'emploi et de candidature. L'application scrappe les offres d'emploi depuis les sites de recrutement (LinkedIn, Indeed, Welcome to the Jungle, etc.), les présente à l'utilisateur dans un tableau de bord interactif, et permet d'envoyer des emails de candidature personnalisés avec CV et portfolio en pièce jointe — le tout en quelques clics.

L'application inclut également une section "Explorateur de Recruteurs" qui identifie et présente les profils LinkedIn des responsables RH et recruteurs pour faciliter le networking ciblé.

---

## Stack Technique (identique à MedCare AI)

### Frontend
| Technologie | Version | Usage |
|---|---|---|
| React | 19.x | Framework UI |
| Vite | 8.x | Build tool + dev server |
| React Router DOM | 7.x | Routing client |
| Tailwind CSS | 4.x | Styling utility-first |
| TanStack React Query | 5.x | Gestion état serveur / data fetching |
| Axios | 1.x | Client HTTP (interceptors JWT) |
| Framer Motion | 12.x | Animations et transitions |
| Recharts | 3.x | Graphiques et visualisation |
| Lucide React | 1.x | Icônes |
| React Hook Form | 7.x | Gestion de formulaires |
| Zod | 4.x | Validation de schémas |
| React Hot Toast | 2.x | Notifications toast |
| date-fns | 4.x | Formatage de dates (locale fr) |
| Socket.IO Client | 4.x | Communication temps réel |

### Backend
| Technologie | Version | Usage |
|---|---|---|
| Express | 5.x | Serveur HTTP |
| Node.js | — | Runtime serveur |
| Mongoose | 9.x | ODM MongoDB |
| MongoDB | — | Base de données principale |
| Socket.IO | 4.x | WebSocket temps réel |
| JWT (jsonwebtoken) | 9.x | Authentification tokens |
| bcryptjs | 3.x | Hashage mots de passe |
| Helmet | 8.x | Sécurité headers HTTP |
| express-rate-limit | 8.x | Limitation de débit |
| Multer | 2.x | Upload de fichiers |
| node-cron | 4.x | Tâches planifiées (scrapping automatique) |
| nodemailer | 6.x | Envoi d'emails SMTP |
| Puppeteer | 22.x | Scrapping web (sites dynamiques) |
| Cheerio | 1.x | Parsing HTML (sites statiques) |

### Services Externes
| Service | Usage |
|---|---|
| Brevo (Sendinblue) | Envoi d'emails transactionnels (candidatures) |
| OpenAI API (GPT-4o-mini) | Génération de lettres de motivation personnalisées |
| Cloudinary | Stockage cloud des CV et portfolios |
| Redis | Cache des résultats de scrapping |

---

## Architecture du Projet

```
jobconnect-ai/
├── .env                          # Variables d'environnement (secrets, clés API)
├── .env.local
├── .gitignore
├── .oxlintrc.json                # Config OxLint (React + OXC)
├── .vercelignore
├── index.html                    # Point d'entrée Vite SPA (lang="fr")
├── package.json
├── vercel.json                   # Config déploiement Vercel
├── vite.config.js                # Config Vite (React + Tailwind)
├── README.md
│
├── api/
│   └── index.js                  # Express app wrappé pour Vercel serverless
│
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── assets/
│       ├── cv-exemple.pdf        # CV par défaut pour preview
│       └── templates/            # Templates d'emails HTML
│           ├── candidature.html
│           ├── relance.html
│           └── remerciement.html
│
├── backend/
│   ├── server.js                 # Serveur Express principal + Socket.IO + MongoDB + Cron
│   │
│   ├── middlewares/
│   │   ├── auth.js               # JWT protect, authorize()
│   │   └── audit.js              # Logging d'audit
│   │
│   ├── models/
│   │   ├── User.js               # Modèle utilisateur (candidat)
│   │   ├── UserProfile.js        # Profil candidat (CV, compétences, expériences)
│   │   ├── CV.js                 # Métadonnées du CV uploadé
│   │   ├── Portfolio.js          # Lien portfolio + projets
│   │   ├── JobOffer.js           # Offre d'emploi scrapée
│   │   ├── Application.js        # Candidature envoyée (email log, statut)
│   │   ├── EmailTemplate.js      # Templates d'emails personnalisés
│   │   ├── Recruiter.js          # Recruteur/RH identifié
│   │   ├── SearchProfile.js      # Profil de recherche (secteur, mots-clés, localisation)
│   │   ├── ScrapingLog.js        # Logs de scrapping (historique, erreurs)
│   │   ├── EmailLog.js           # Journal des emails envoyés
│   │   ├── Conversation.js       # Messages temps réel
│   │   ├── Message.js            # Messages du chat
│   │   ├── Notification.js       # Notifications
│   │   ├── ScheduledTask.js      # Tâches de scrapping planifiées
│   │   └── Analytics.js          # Statistiques et métriques
│   │
│   ├── routes/
│   │   ├── auth.js               # Login, register, refresh, reset password
│   │   ├── profile.js            # Profil candidat CRUD
│   │   ├── cv.js                 # Upload/gestion du CV
│   │   ├── portfolio.js          # Gestion du portfolio
│   │   ├── jobOffers.js          # Offres d'emploi CRUD + recherche
│   │   ├── scraping.js           # Contrôleur de scrapping
│   │   ├── applications.js       # Candidatures (envoi email, historique)
│   │   ├── emails.js             # Gestion templates + envoi emails
│   │   ├── recruiters.js         # Explorateur de recruteurs
│   │   ├── searchProfiles.js     # Profils de recherche CRUD
│   │   ├── dashboard.js          # Statistiques dashboard
│   │   ├── notifications.js      # Notifications CRUD
│   │   ├── analytics.js          # Métriques et graphiques
│   │   └── ai.js                 # Endpoints AI (génération lettres, analyse offres)
│   │
│   ├── services/
│   │   ├── scrapingService.js    # Logique de scrapping (LinkedIn, Indeed, WTJ)
│   │   ├── emailService.js       # Envoi d'emails (Brevo/SMTP + pièces jointes)
│   │   ├── aiService.js          # OpenAI GPT-4o-mini (lettres motiv, analyse)
│   │   ├── pdfParser.js          # Extraction texte du CV (PDF parsing)
│   │   ├── cronService.js        # Tâches planifiées (scrapping auto)
│   │   ├── notificationService.js # Création de notifications
│   │   └── cacheService.js       # Redis + fallback in-memory
│   │
│   └── utils/
│       ├── generateToken.js      # Génération JWT access + refresh tokens
│       ├── sendEmail.js          # Config Brevo/SMTP
│       ├── fileUpload.js         # Config Multer (memory storage, 10MB)
│       ├── scraperHelpers.js     # Helpers pour le scrapping (user-agent, delays)
│       └── emailRenderer.js      # Rendu de templates HTML avec variables
│
├── src/
│   ├── main.jsx                  # Point d'entrée : providers tree
│   ├── App.jsx                   # Définition des routes
│   ├── App.css
│   ├── index.css                 # Tailwind CSS v4 + tokens thème custom
│   │
│   ├── api/
│   │   └── axios.js              # Instance Axios avec intercepteurs JWT
│   │
│   ├── assets/
│   │   ├── hero.png    
│   │   ├── logo.svg
│   │   └── empty-states/
│   │       ├── no-jobs.svg
│   │       ├── no-applications.svg
│   │       └── no-recruiters.svg
│   │
│   ├── context/
│   │   ├── AuthContext.jsx        # État auth (session, login/logout, profile)
│   │   ├── ThemeContext.jsx       # Thème light/dark/system
│   │   ├── SidebarContext.jsx     # État sidebar (collapse, mobile)
│   │   └── SocketContext.jsx      # Connexion Socket.IO
│   │
│   ├── layouts/
│   │   ├── MainLayoutShell.jsx    # Layout partagé : sidebar + outlet + header mobile
│   │   └── AuthLayout.jsx        # Layout pages d'auth (login, register)
│   │
│   ├── components/
│   │   ├── SidebarShell.jsx       # Sidebar de base (animée, responsive)
│   │   ├── SidebarMain.jsx        # Sidebar navigation principale
│   │   ├── MobileHeader.jsx       # Header mobile hamburger
│   │   ├── ThemeToggle.jsx        # Toggle dark/light
│   │   ├── ProtectedRoute.jsx     # Garde de route basée sur le rôle
│   │   ├── NotificationBell.jsx   # Cloche notifications avec badge
│   │   ├── PasswordInput.jsx      # Input mot de passe avec visibilité
│   │   │
│   │   ├── JobOfferCard.jsx       # Carte d'offre d'emploi
│   │   ├── JobOfferModal.jsx      # Modale détaillée d'une offre
│   │   ├── JobOfferFilters.jsx    # Filtres de recherche
│   │   ├── JobOfferSkeleton.jsx   # Skeleton loading pour les offres
│   │   │
│   │   ├── ApplicationCard.jsx    # Carte de candidature envoyée
│   │   ├── ApplicationTimeline.jsx # Timeline des candidatures
│   │   ├── ApplicationStats.jsx   # Statistiques de candidatures
│   │   │
│   │   ├── EmailPreview.jsx       # Prévisualisation de l'email avant envoi
│   │   ├── EmailEditor.jsx        # Éditeur d'email personnalisé
│   │   ├── EmailTemplateCard.jsx  # Carte de template d'email
│   │   │
│   │   ├── RecruiterCard.jsx      # Carte de recruteur
│   │   ├── RecruiterFilters.jsx   # Filtres recruteurs
│   │   │
│   │   ├── CVUploader.jsx         # Upload du CV (drag & drop)
│   │   ├── CVPreview.jsx          # Preview du CV uploadé
│   │   │
│   │   ├── PortfolioLink.jsx      # Lien vers le portfolio
│   │   ├── SearchProfileCard.jsx  # Carte de profil de recherche
│   │   │
│   │   ├── StatsCard.jsx          # Carte de statistique réutilisable
│   │   ├── ChartsCard.jsx         # Carte de graphique réutilisable
│   │   ├── EmptyState.jsx         # État vide réutilisable
│   │   ├── LoadingSpinner.jsx     # Spinner de chargement
│   │   ├── ConfirmModal.jsx       # Modale de confirmation
│   │   └── TagInput.jsx           # Input de tags (mots-clés)
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   └── ResetPasswordPage.jsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   └── NotificationsPage.jsx
│   │   │
│   │   ├── profile/
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── CVPage.jsx
│   │   │   ├── PortfolioPage.jsx
│   │   │   └── SearchPreferencesPage.jsx
│   │   │
│   │   ├── jobOffers/
│   │   │   ├── JobOffersPage.jsx
│   │   │   ├── JobOfferDetailPage.jsx
│   │   │   ├── ScrapingConfigPage.jsx
│   │   │   └── SavedJobsPage.jsx
│   │   │
│   │   ├── applications/
│   │   │   ├── ApplicationsPage.jsx
│   │   │   ├── ApplicationDetailPage.jsx
│   │   │   ├── ComposeEmailPage.jsx
│   │   │   └── EmailTemplatesPage.jsx
│   │   │
│   │   ├── recruiters/
│   │   │   ├── RecruitersPage.jsx
│   │   │   ├── RecruiterDetailPage.jsx
│   │   │   └── NetworkPage.jsx
│   │   │
│   │   └── shared/
│   │       └── MessagesPage.jsx
│   │
│   └── utils/
│       ├── helpers.js
│       ├── constants.js
│       ├── emailHelpers.js
│       └── scraperConfig.js
│
├── dist/
├── node_modules/
└── .mongo/
```

---

## Modèles de Données (Mongoose Schemas)

### User.js
```javascript
{
  firstName: String,          // requis
  lastName: String,           // requis
  email: String,              // requis, unique, lowercase
  password: String,           // requis, hashé bcrypt 12 rounds
  phone: String,              // ex: +212 691 43 63 99
  role: String,               // enum: ['candidat', 'admin'], défaut: 'candidat'
  avatar: String,             // URL avatar (Cloudinary)
  isActive: Boolean,          // défaut: true
  isEmailVerified: Boolean,   // défaut: false
  refreshToken: String,       // JWT refresh token
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date,
  loginAttempts: Number,      // défaut: 0
  lockUntil: Date,
  preferences: {
    language: String,         // défaut: 'fr'
    theme: String,            // enum: ['light', 'dark', 'system']
    emailNotifications: Boolean,
    pushNotifications: Boolean,
  },
  timestamps: true
}
```

### UserProfile.js
```javascript
{
  userId: ObjectId (ref: 'User'),        // unique, 1:1
  title: String,                          // ex: "Ingénieur d'État en Génie Informatique"
  summary: String,                        // Résumé professionnel
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    description: String,
  }],
  experience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    isCurrent: Boolean,
    description: String,
    skills: [String],
  }],
  skills: [String],
  languages: [{
    language: String,
    level: String,                        // enum: ['Débutant', 'Intermédiaire', 'Avancé', 'Natif']
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    url: String,
  }],
  socialLinks: {
    linkedin: String,
    github: String,
    portfolio: String,
    website: String,
  },
  location: {
    city: String,
    country: String,
    isRemoteOpen: Boolean,
  },
  expectedSalary: {
    min: Number,
    max: Number,
    currency: String,                     // défaut: 'MAD'
  },
  jobTypes: [String],                     // enum: ['CDI', 'CDD', 'Stage', 'Freelance', 'Temps partiel']
  timestamps: true
}
```

### CV.js
```javascript
{
  userId: ObjectId (ref: 'User'),
  fileName: String,
  originalName: String,
  fileUrl: String,                        // URL Cloudinary
  fileSize: Number,
  mimeType: String,
  extractedText: String,                  // Texte extrait du PDF
  parsedData: {
    skills: [String],
    experience: [{ company, position, duration }],
    education: [{ institution, degree, field }],
    languages: [String],
    certifications: [String],
  },
  isActive: Boolean,
  version: Number,
  timestamps: true
}
```

### Portfolio.js
```javascript
{
  userId: ObjectId (ref: 'User'),        // unique, 1:1
  url: String,
  description: String,
  projects: [{
    name: String,
    description: String,
    url: String,
    imageUrl: String,
    technologies: [String],
  }],
  timestamps: true
}
```

### JobOffer.js
```javascript
{
  source: String,                         // enum: ['linkedin', 'indeed', 'welcometothejungle', 'manpower', 'rekrute', 'autre']
  sourceId: String,                       // ID unique sur la source (déduplication)
  sourceUrl: String,                      // URL originale de l'offre
  title: String,
  company: String,
  companyLogo: String,
  companyUrl: String,
  location: String,
  isRemote: Boolean,
  contractType: String,                   // enum: ['CDI', 'CDD', 'Stage', 'Freelance', 'Temps partiel']
  description: String,
  requirements: [String],
  responsibilities: [String],
  salary: {
    min: Number,
    max: Number,
    currency: String,
    period: String,                       // 'monthly', 'yearly'
  },
  postedAt: Date,
  expiresAt: Date,
  scrapedAt: Date,
  sector: String,
  keywords: [String],
  relevanceScore: Number,                 // Score de pertinence (0-100, calculé par AI)
  isSaved: Boolean,
  isActive: Boolean,
  applicationDeadline: Date,
  timestamps: true
}
```

### Application.js
```javascript
{
  userId: ObjectId (ref: 'User'),
  jobOfferId: ObjectId (ref: 'JobOffer'),
  status: String,                         // enum: ['brouillon', 'envoyee', 'ouverte', 'en_cours', 'acceptee', 'refusee', 'retiree']
  email: {
    to: String,
    subject: String,
    body: String,                         // Corps HTML
    templateId: ObjectId (ref: 'EmailTemplate'),
    sentAt: Date,
    openedAt: Date,
  },
  cvVersion: ObjectId (ref: 'CV'),
  portfolioUrl: String,
  coverLetter: String,
  notes: String,
  followUpDate: Date,
  followUpCount: Number,
  timestamps: true
}
```

### EmailTemplate.js
```javascript
{
  userId: ObjectId (ref: 'User'),        // null = template par défaut
  name: String,
  subject: String,                        // Avec variables: {{jobTitle}}, {{company}}
  body: String,                           // Corps HTML avec variables
  variables: [String],
  isDefault: Boolean,
  category: String,                       // enum: ['candidature', 'relance', 'remerciement', 'autre']
  usageCount: Number,
  timestamps: true
}
```

### Recruiter.js
```javascript
{
  userId: ObjectId (ref: 'User'),
  firstName: String,
  lastName: String,
  fullName: String,
  title: String,
  company: String,
  linkedinUrl: String,
  linkedinId: String,
  email: String,
  phone: String,
  location: String,
  sector: String,
  connectionDegree: String,               // 1st, 2nd, 3rd+
  profilePicture: String,
  lastActive: String,
  notes: String,
  tags: [String],
  interactionCount: Number,
  lastContactedAt: Date,
  isActive: Boolean,
  timestamps: true
}
```

### SearchProfile.js
```javascript
{
  userId: ObjectId (ref: 'User'),
  name: String,
  sectors: [String],
  keywords: [String],
  excludeKeywords: [String],
  locations: [String],
  contractTypes: [String],
  salaryMin: Number,
  salaryMax: Number,
  sourcesConfig: {                        // Configuration par source (mots-clés spécifiques par plateforme)
    linkedin: { enabled: Boolean, customKeywords: [String] },
    indeed: { enabled: Boolean, customKeywords: [String] },
    welcometothejungle: { enabled: Boolean, customKeywords: [String] },
    manpower: { enabled: Boolean, customKeywords: [String] },
    rekrute: { enabled: Boolean, customKeywords: [String] },
  },
  isActive: Boolean,
  lastSearchedAt: Date,
  frequency: String,                      // enum: ['quotidien', 'hebdomadaire', 'manuel']
  timestamps: true
}
```

### ScrapingLog.js
```javascript
{
  userId: ObjectId (ref: 'User'),
  searchProfileId: ObjectId (ref: 'SearchProfile'),
  status: String,                         // enum: ['running', 'success', 'partial', 'failed']
  sources: [{                             // Un log par source, tous exécutés en parallèle
    source: String,                       // 'linkedin', 'indeed', etc.
    status: String,                       // enum: ['success', 'partial', 'failed']
    offersFound: Number,
    newOffers: Number,
    duplicatesSkipped: Number,
    errors: [String],
    duration: Number,                     // en millisecondes
  }],
  totalOffersFound: Number,
  totalNewOffers: Number,
  totalDuplicatesSkipped: Number,
  startedAt: Date,
  completedAt: Date,
  timestamps: true
}
```

### EmailLog.js
```javascript
{
  userId: ObjectId (ref: 'User'),
  applicationId: ObjectId (ref: 'Application'),
  to: String,
  subject: String,
  status: String,                         // enum: ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed']
  provider: String,
  messageId: String,
  error: String,
  sentAt: Date,
  deliveredAt: Date,
  openedAt: Date,
  timestamps: true
}
```

### Notification.js
```javascript
{
  userId: ObjectId (ref: 'User'),
  type: String,                           // enum: ['nouvelle_offre', 'candidature', 'email', 'scrapping', 'rappel']
  title: String,
  message: String,
  data: Mixed,
  isRead: Boolean,
  actionUrl: String,
  timestamps: true
}
```

---

## Architecture des Routes (Frontend)

```javascript
// App.jsx
<Routes>
  {/* Routes publiques */}
  <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
  <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />
  <Route path="/forgot-password" element={<AuthLayout><ForgotPasswordPage /></AuthLayout>} />
  <Route path="/reset-password/:token" element={<AuthLayout><ResetPasswordPage /></AuthLayout>} />

  {/* Routes protégées */}
  <Route element={<ProtectedRoute />}>
    <Route element={<MainLayoutShell SidebarComponent={SidebarMain} />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/cv" element={<CVPage />} />
      <Route path="/profile/portfolio" element={<PortfolioPage />} />
      <Route path="/profile/search-preferences" element={<SearchPreferencesPage />} />
      <Route path="/jobs" element={<JobOffersPage />} />
      <Route path="/jobs/:id" element={<JobOfferDetailPage />} />
      <Route path="/jobs/scraping-config" element={<ScrapingConfigPage />} />
      <Route path="/jobs/saved" element={<SavedJobsPage />} />
      <Route path="/applications" element={<ApplicationsPage />} />
      <Route path="/applications/:id" element={<ApplicationDetailPage />} />
      <Route path="/applications/compose/:jobOfferId" element={<ComposeEmailPage />} />
      <Route path="/applications/templates" element={<EmailTemplatesPage />} />
      <Route path="/recruiters" element={<RecruitersPage />} />
      <Route path="/recruiters/:id" element={<RecruiterDetailPage />} />
      <Route path="/network" element={<NetworkPage />} />
      <Route path="/messages" element={<MessagesPage />} />
    </Route>
  </Route>
</Routes>
```

---

## Sidebar Navigation

```javascript
const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Briefcase, label: "Offres d'emploi", path: "/jobs" },
  { icon: Send, label: "Candidatures", path: "/applications" },
  { icon: FileText, label: "Templates Emails", path: "/applications/templates" },
  { icon: Users, label: "Explorateur Recruteurs", path: "/recruiters" },
  { icon: Network, label: "Réseau", path: "/network" },
  { icon: Bookmark, label: "Offres Sauvegardées", path: "/jobs/saved" },
  { icon: Search, label: "Profils de Recherche", path: "/profile/search-preferences" },
  { icon: Settings, label: "Profil & CV", path: "/profile" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: MessageSquare, label: "Messages", path: "/messages" },
];
```

---

## Fonctionnalités Détaillées

### 1. Tableau de Bord (Dashboard)
- **Statistiques clés** : Nombre d'offres trouvées, candidatures envoyées, taux de réponse, emails ouverts
- **Graphiques** : Candidatures par semaine (Recharts), répartition par secteur, sources les plus performantes
- **Activité récente** : Dernières offres scrapées, dernières candidatures envoyées
- **Alertes** : Nouvelles offres correspondant au profil, relances à effectuer
- **Quick Actions** : Lancer un scrapping (toutes plateformes), postuler rapidement à une offre recommandée

### 2. Offres d'Emploi
- **Liste des offres** : Cards avec titre, entreprise, localisation, type de contrat, salaire, date de publication
- **Filtres avancés** : Secteur, localisation, type de contrat, fourchette de salaire, date de publication, source (pour filtrer les résultats scrapés)
- **Recherche** : Recherche par mots-clés dans le titre et la description
- **Détail de l'offre** : Description complète, exigences, responsabilités, lien source
- **Score de pertinence** : Score AI (0-100) basé sur les compétences du profil et les exigences de l'offre
- **Bouton "Postuler"** : Ouvre l'éditeur d'email pré-rempli avec le template personnalisé
- **Sauvegarder** : Ajouter aux favoris pour postuler plus tard
- **Tri** : Par date, pertinence, salaire
- **Badge source** : Chaque offre affiche un badge avec la source d'origine (LinkedIn, Indeed, WTJ, etc.)

### 3. Système de Scrapping
- **Principe** : Le scrapping interroge **TOUTES les plateformes en parallèle** pour maximiser le nombre d'offres. Pas de sélection manuelle de source — tout est scrapé d'un seul clic.
- **Sources scappées simultanément** :
  - **LinkedIn** : Jobs search (via Puppeteer pour conteneurs dynamiques)
  - **Indeed** : Recherche d'emplois (via Cheerio pour HTML statique)
  - **Welcome to the Jungle** : Offres tech (via Puppeteer)
  - **Manpower Maroc** : Offres staffing
  - **Rekrute** : Plateforme marocaine
- **Exécution** :
  - Scrapping manuel (bouton "Lancer maintenant" → scrape TOUTES les plateformes d'un coup)
  - Scrapping automatique (node-cron selon la fréquence configurée → toutes les sources)
  - Progression en temps réel via Socket.IO (barre de progression par source + global)
  - Logs détaillés par source (offres trouvées, doublons ignorés, erreurs)
- **Parallélisme** : Les sources sont exécutées en parallèle (Promise.allSettled) pour minimiser le temps total
- **Déduplication** : Basée sur source + sourceId pour éviter les offres en double (cross-plateforme)
- **Rate limiting** : Délais aléatoires entre les requêtes par source pour éviter le blocage
- **Configuration** : Chaque source peut être activée/désactivée individuellement et avoir des mots-clés spécifiques, mais par défaut TOUTES sont activées

### 4. Système de Candidature (Email Automatisé)
- **Processus** :
  1. L'utilisateur clique "Postuler" sur une offre
  2. L'éditeur s'ouvre avec un email pré-rempli (template + variables de l'offre)
  3. L'utilisateur peut modifier/personnaliser l'email
  4. Prévisualisation de l'email
  5. Clique "Envoyer" → email envoyé avec CV + portfolio en pièce jointe
- **Email type** (exemple) :
  ```
  Subject: Candidature au poste de {{jobTitle}} chez {{company}}

  Madame/Monsieur {{recruiterName}},

  Je me permets de vous adresser ma candidature pour le poste de {{jobTitle}} au sein de {{company}}.

  {{userSummary}}

  Intégrer {{company}} représente pour moi une excellente opportunité d'évoluer dans {{sectorContext}}.

  Vous trouverez ci-joints mon CV ainsi que mon portfolio :
  🌐 Portfolio : {{portfolioUrl}}
  🔗 LinkedIn : {{linkedinUrl}}

  Je serais ravi d'avoir l'opportunité d'échanger avec vous afin de vous présenter plus en détail mon parcours et ma motivation.

  Je vous remercie pour votre temps et l'attention portée à ma candidature.

  Cordialement,

  {{userName}}
  📞 {{userPhone}}
  📧 {{userEmail}}
  ```
- **Pièces jointes** : CV (PDF) + lien portfolio
- **Templates** : Templates prédéfinis + templates personnalisés avec variables
- **Génération AI** : Option de générer une lettre de motivation personnalisée via OpenAI
- **Suivi** : Statut de l'email (envoyé, ouvert, réponse)
- **Relances** : Système de relance automatique après X jours

### 5. Explorateur de Recruteurs
- **Recherche** : Trouver des recruteurs LinkedIn par secteur, entreprise, localisation
- **Affichage** : Cards avec photo, nom, poste, entreprise, degré de connexion
- **Actions** :
  - Voir le profil LinkedIn (lien direct)
  - Ajouter aux favoris
  - Ajouter des notes personnelles
  - Voir l'historique des interactions
- **Filtres** : Par secteur, entreprise, localisation, degré de connexion
- **Networking** : Suggérer des recruteurs pertinents selon le profil de recherche

### 6. Profil Candidat
- **Informations personnelles** : Nom, email, téléphone, localisation
- **Formation** : Diplômes, institutions, dates
- **Expériences** : Postes, entreprises, descriptions, compétences utilisées
- **Compétences** : Liste de compétences techniques et soft skills
- **CV** : Upload PDF (drag & drop), extraction automatique du texte et des données structurées
- **Portfolio** : URL du portfolio + description des projets
- **Liens sociaux** : LinkedIn, GitHub, site web
- **Préférences de recherche** : Secteurs ciblés, mots-clés, localisations, types de contrat, fourchette de salaire

### 7. Templates d'Emails
- **Templates prédéfinis** :
  - "Candidature Standard"
  - "Candidature avec emphasys sur les compétences"
  - "Candidature pour stage/alternance"
  - "Relance après candidature"
  - "Remerciement après entretien"
- **Variables disponibles** : `{{jobTitle}}`, `{{company}}`, `{{recruiterName}}`, `{{sectorContext}}`, `{{userSummary}}`, `{{portfolioUrl}}`, `{{linkedinUrl}}`, `{{userName}}`, `{{userPhone}}`, `{{userEmail}}`
- **Création personnalisée** : Éditeur HTML avec prévisualisation
- **Génération AI** : Générer un email personnalisé basé sur l'offre et le profil

### 8. Notifications
- **Types** :
  - Nouvelles offres correspondant au profil
  - Statut des candidatures mis à jour
  - Emails envoyés/délivrés/ouverts
  - Résultats de scrapping
  - Rappels de relance
- **Canals** : In-app, email (optionnel)
- **Real-time** : Via Socket.IO

### 9. Analytics
- **Métriques** :
  - Total d'offres trouvées (par source, par secteur)
  - Candidatures envoyées (par semaine, par mois)
  - Taux de réponse (offres / candidatures)
  - Taux d'ouverture d'emails
  - Sources les plus performantes
  - Temps moyen de réponse
- **Graphiques** : Recharts (barres, lignes, secteurs, area)
- **Export** : Rapport PDF ou CSV

### 10. Messages / Chat
- **Messagerie temps réel** : Via Socket.IO
- **Conversations** : Liste des conversations avec preview du dernier message

---

## Endpoints API

### Auth
| Méthode | Route | Description |
|---|---|---|
| POST | /api/auth/register | Inscription candidat |
| POST | /api/auth/login | Connexion |
| POST | /api/auth/logout | Déconnexion |
| POST | /api/auth/refresh-token | Rafraîchir le token |
| POST | /api/auth/forgot-password | Demande de réinitialisation |
| POST | /api/auth/reset-password/:token | Réinitialiser le mot de passe |
| GET | /api/auth/me | Profil utilisateur connecté |

### Profil
| Méthode | Route | Description |
|---|---|---|
| GET | /api/profile | Récupérer le profil complet |
| PUT | /api/profile | Mettre à jour le profil |
| POST | /api/profile/cv | Upload du CV (multipart) |
| GET | /api/profile/cv | Récupérer les métadonnées du CV |
| DELETE | /api/profile/cv/:id | Supprimer un CV |
| PUT | /api/profile/portfolio | Mettre à jour le portfolio |
| GET | /api/profile/portfolio | Récupérer le portfolio |

### Offres d'emploi
| Méthode | Route | Description |
|---|---|---|
| GET | /api/jobs | Liste des offres (pagination, filtres) |
| GET | /api/jobs/:id | Détail d'une offre |
| POST | /api/jobs/:id/save | Sauvegarder une offre |
| DELETE | /api/jobs/:id/save | Retirer des sauvegardes |
| GET | /api/jobs/saved | Liste des offres sauvegardées |
| GET | /api/jobs/recommended | Offres recommandées (score ≥ 70) |

### Scrapping
| Méthode | Route | Description |
|---|---|---|
| POST | /api/scraping/run | Lancer un scrapping (TOUTES les plateformes en parallèle) |
| POST | /api/scraping/run/:profileId | Lancer pour un profil spécifique (toutes sources) |
| GET | /api/scraping/logs | Historique des scrappings |
| GET | /api/scraping/status | Statut du scrapping en cours (progression par source) |
| PUT | /api/scraping/sources/:source/toggle | Activer/désactiver une source spécifique |
| PUT | /api/scraping/sources/:source/keywords | Définir des mots-clés spécifiques par source |

### Candidatures
| Méthode | Route | Description |
|---|---|---|
| GET | /api/applications | Liste des candidatures |
| GET | /api/applications/:id | Détail d'une candidature |
| POST | /api/applications | Créer une candidature (brouillon) |
| POST | /api/applications/:id/send | Envoyer l'email de candidature |
| PUT | /api/applications/:id/status | Mettre à jour le statut |
| POST | /api/applications/:id/followup | Envoyer une relance |
| DELETE | /api/applications/:id | Supprimer une candidature |

### Emails
| Méthode | Route | Description |
|---|---|---|
| GET | /api/emails/templates | Liste des templates |
| POST | /api/emails/templates | Créer un template |
| PUT | /api/emails/templates/:id | Modifier un template |
| DELETE | /api/emails/templates/:id | Supprimer un template |
| POST | /api/emails/preview | Prévisualiser un email |
| POST | /api/emails/generate | Générer un email avec AI |

### Recruteurs
| Méthode | Route | Description |
|---|---|---|
| GET | /api/recruiters | Liste des recruteurs |
| GET | /api/recruiters/:id | Détail d'un recruteur |
| POST | /api/recruiters | Ajouter un recruteur |
| PUT | /api/recruiters/:id | Modifier un recruteur |
| DELETE | /api/recruiters/:id | Supprimer un recruteur |
| POST | /api/recruiters/search | Rechercher des recruteurs |

### Profils de Recherche
| Méthode | Route | Description |
|---|---|---|
| GET | /api/search-profiles | Liste des profils |
| POST | /api/search-profiles | Créer un profil |
| PUT | /api/search-profiles/:id | Modifier un profil |
| DELETE | /api/search-profiles/:id | Supprimer un profil |
| POST | /api/search-profiles/:id/activate | Activer/désactiver |

### Dashboard & Analytics
| Méthode | Route | Description |
|---|---|---|
| GET | /api/dashboard/stats | Statistiques globales |
| GET | /api/dashboard/activity | Activité récente |
| GET | /api/analytics/overview | Vue d'ensemble analytics |
| GET | /api/analytics/applications | Stats candidatures |
| GET | /api/analytics/sources | Performance par source |

### Notifications
| Méthode | Route | Description |
|---|---|---|
| GET | /api/notifications | Liste des notifications |
| PUT | /api/notifications/:id/read | Marquer comme lu |
| PUT | /api/notifications/read-all | Marquer toutes comme lues |

### AI
| Méthode | Route | Description |
|---|---|---|
| POST | /api/ai/generate-cover-letter | Générer une lettre de motivation |
| POST | /api/ai/analyze-job | Analyser une offre (score de pertinence) |
| POST | /api/ai/personalize-email | Personnaliser un email pour une offre |

---

## Services Backend Détaillés

### scrapingService.js
```javascript
// Fonctions principales :
// - scrapeLinkedIn(keywords, location, page) → [JobOffer]
// - scrapeIndeed(keywords, location, page) → [JobOffer]
// - scrapeWelcomeToTheJungle(keywords, location) → [JobOffer]
// - scrapeRekrute(keywords, location) → [JobOffer]
// - scrapeManpower(keywords, location) → [JobOffer]
// - runAllScrapers(searchProfileId) → ScrapingLog
//   → Lance TOUTES les sources en parallèle (Promise.allSettled)
//   → Retourne un ScrapingLog avec les résultats de chaque source
// - deduplicateOffers(offers) → [JobOffer]
// - calculateRelevanceScore(offer, userProfile) → Number (0-100)
//
// Implémentation :
// - Puppeteer pour sites dynamiques (LinkedIn, WTJ)
// - Cheerio + axios pour sites statiques (Indeed, Rekrute)
// - Exécution parallèle : Promise.allSettled pour ne pas bloquer si une source échoue
// - User-agent rotation pour éviter la détection
// - Délais aléatoires entre les requêtes (2-5 secondes) par source
// - Gestion des erreurs et retries (3 tentatives par source)
// - Rate limiting côté serveur
```

### emailService.js
```javascript
// Fonctions principales :
// - sendApplicationEmail(userId, applicationId, emailData) → EmailLog
// - sendFollowUpEmail(applicationId) → EmailLog
// - renderTemplate(templateId, variables) → { subject, body }
// - attachCV(cvUrl) → Buffer
// - trackEmailStatus(messageId) → status
//
// Implémentation :
// - Brevo API pour l'envoi (with attachment support)
// - Nodemailer comme fallback SMTP
// - Rendu de templates avec variables (Handlebars-like)
// - Pièce jointe CV (PDF) + lien portfolio
// - Tracking ouverture via pixel transparent
```

### aiService.js
```javascript
// Fonctions principales :
// - generateCoverLetter(userProfile, jobOffer) → String
// - analyzeJobRelevance(userProfile, jobOffer) → Number (0-100)
// - personalizeEmail(baseTemplate, userProfile, jobOffer) → String
// - extractJobKeywords(description) → [String]
//
// Implémentation :
// - OpenAI GPT-4o-mini via fetch natif
// - System prompts contextuels (FR)
// - Fallback : email basique sans AI si API indisponible
// - Cache des résultats (même offre + même profil = même score)
```

### pdfParser.js
```javascript
// Fonctions principales : 
// - extractTextFromPDF(pdfBuffer) → String
// - parseCVData(text) → { skills, experience, education, languages }
// - generateCVPreview(cvUrl) → Buffer (thumbnail)
//
// Implémentation :
// - pdf-parse pour extraction texte
// - OpenAI pour parsing structuré (skills, experience, etc.)
// - Cache du parsing (pas de re-extraction si même fichier)
```

### cronService.js
```javascript
// Tâches planifiées :
// - Scrapping automatique : selon la fréquence de chaque SearchProfile → lance TOUTES les sources
// - Relances automatiques : vérifier les followUpDate dépassées
// - Nettoyage des offres expirées : marquer comme inactives
// - Notifications : push nouvelles offres correspondant au profil
//
// Implémentation :
// - node-cron pour la planification
// - Vérification toutes les 15 minutes
// - Logs de chaque exécution
```

---

## Fonctionnalités Supplémentaires (Bonus)

### 1. Score de Pertinence AI
- Pour chaque offre scrapée, calculer un score de pertinence (0-100) basé sur :
  - Correspondance des compétences (poids: 40%)
  - Correspondance de la localisation (poids: 20%)
  - Type de contrat correspondant (poids: 15%)
  - Niveau de salaire correspondant (poids: 15%)
  - Expérience requise vs expérience réelle (poids: 10%)
- Trier les offres par score de pertinence décroissant

### 2. Génération de Lettre de Motivation AI
- Pour chaque candidature, option de générer une lettre de motivation personnalisée via OpenAI
- La lettre prend en compte :
  - Le profil complet de l'utilisateur
  - La description de l'offre
  - Les compétences requises
  - Le secteur d'activité
- La lettre est intégrée dans le corps de l'email

### 3. Suivi des Candidatures
- Timeline visuelle pour chaque candidature :
  - Brouillon → Envoyée → Ouverte → En cours → Acceptée/Refusée
- Rappels automatiques pour les relances
- Statistiques de suivi (temps moyen de réponse par entreprise)

### 4. Mode Hors-Ligne
- Cache des offres scrapées pour consultation hors-ligne
- Sync automatique quand la connexion est rétablie

### 5. Export et Rapports
- Export CSV de toutes les candidatures
- Rapport PDF hebdomadaire (offres trouvées, candidatures envoyées, réponses)
- Partage de rapport par email

### 6. Intégration LinkedIn Directe
- Lien direct vers le profil LinkedIn de chaque entreprise
- Suggestion de connections LinkedIn pertinentes
- Import automatique des informations de profil LinkedIn

### 7. Alertes Email
- Résumé quotidien des nouvelles offres par email
- Notification quand un email de candidature est ouvert
- Rappel hebdomadaire des relances à effectuer

### 8. Multi-Source Unifié
- Un seul bouton "Lancer le scrapping" interroge TOUTES les plateformes en parallèle
- Dashboard montrant les résultats par source (combien d'offres par plateforme)
- Tableau comparatif des performances par source (taux de nouveaux résultats)
- Recommandation de mots-clés optimisés par plateforme

---

## Configuration des Plateformes de Scrapping

> **Par défaut, TOUTES les plateformes sont scrapées en parallèle.** La configuration ci-dessous permet de définir les mots-clés spécifiques par plateforme et d'activer/désactiver une source si nécessaire.

### LinkedIn
```javascript
{
  baseUrl: 'https://www.linkedin.com/jobs/search',
  selectors: {
    jobCard: '.job-search-card',
    title: '.base-search-card__title',
    company: '.base-search-card__subtitle',
    location: '.job-search-card__location',
    link: '.base-card__full-link',
    date: 'time',
  },
  pagination: '?start={offset}',
  rateLimit: { min: 3000, max: 7000 },
}
```

### Indeed
```javascript
{
  baseUrl: 'https://www.indeed.com/jobs',
  selectors: {
    jobCard: '.jobsearch-ResultsList .result',
    title: '.jobTitle a',
    company: '.companyName',
    location: '.companyLocation',
    link: '.jobTitle a',
    date: '.date',
  },
  pagination: '&start={offset}',
  rateLimit: { min: 2000, max: 5000 },
}
```

### Welcome to the Jungle
```javascript
{
  baseUrl: 'https://www.welcometothejungle.com/fr/jobs',
  selectors: {
    jobCard: '[data-testid="job-card"]',
    title: 'h4',
    company: '[data-testid="company-name"]',
    location: '[data-testid="job-location"]',
    link: 'a',
  },
  rateLimit: { min: 4000, max: 8000 },
}
```

---

## Thème Visuel

### Palette de Couleurs
- **Primaire** : Bleu (#2563EB) — Confiance, professionnalisme
- **Secondaire** : Vert (#10B981) — Succès, croissance
- **Accent** : Orange (#F59E0B) — Énergie, action
- **Danger** : Rouge (#EF4444) — Erreur, suppression
- **Background** : Gris clair (#F8FAFC) / Dark (#0F172A)
- **Text** : Gris foncé (#1E293B) / Dark (#F1F5F9)

### Design System
- Cards avec ombres subtiles et bordures arrondies (rounded-xl)
- Transitions fluides avec Framer Motion
- Icônes Lucide React cohérentes
- Badges colorés pour les statuts (envoyée=bleu, ouverte=vert, relance=orange)
- Skeletons de chargement pour une UX fluide
- Responsive design (mobile-first)
- Mode dark/light avec toggle

---

## Déploiement

### Vercel (Production)
- Frontend : Build statique dans `dist/`
- Backend : Express wrappé en Vercel serverless function (`api/index.js`)
- MongoDB Atlas pour la base de données
- Redis (Upstash) pour le cache

### Développement Local
```bash
npm run dev:all     # Vite (port 5173) + Express (port 5000) en parallèle
npm run dev         # Frontend seul
npm run server      # Backend seul
npm run seed        # Peupler la base avec des données de test
npm run lint        # OxLint
npm run build       # Build production
```

### Variables d'environnement (.env)
```env
# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/jobconnect

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret

# OpenAI
OPENAI_API_KEY=your_openai_key

# Brevo (Email)
BREVO_API_KEY=your_brevo_key
EMAIL_FROM="JobConnect AI <noreply@jobconnect.ai>"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Redis
REDIS_URL=redis://localhost:6379

# App
PORT=5000
NODE_ENV=development
VITE_API_URL=http://localhost:5000/api
```

---

## Plan de Développement

### Phase 1 — Fondations (Semaine 1)
- Setup du projet (Vite + React + Tailwind + Express + MongoDB)
- Auth (login, register, JWT, protected routes)
- Modèles de données (User, UserProfile, CV, Portfolio)
- Layout (sidebar, header, routing)

### Phase 2 — Profil & CV (Semaine 2)
- Édition du profil candidat
- Upload et parsing du CV (extraction automatique)
- Gestion du portfolio
- Préférences de recherche

### Phase 3 — Scrapping (Semaine 3)
- Service de scrapping multi-sources (LinkedIn, Indeed, WTJ, Manpower, Rekrute)
- Exécution parallèle de toutes les sources
- Modèle JobOffer + ScrapingLog (avec logs par source)
- Configuration des sources (toggle + mots-clés spécifiques)
- Exécution manuelle et automatique
- Déduplication cross-plateforme et score de pertinence

### Phase 4 — Offres & Candidatures (Semaine 4)
- Liste des offres avec filtres
- Détail de l'offre
- Système de candidature (email)
- Templates d'emails
- Envoi d'emails avec pièces jointes
- Suivi des candidatures

### Phase 5 — Recruteurs & Dashboard (Semaine 5)
- Explorateur de recruteurs
- Dashboard et analytics
- Notifications
- Messages temps réel

### Phase 6 — AI & Polish (Semaine 6)
- Génération de lettres de motivation AI
- Score de pertinence AI
- Personnalisation d'emails AI
- Mode hors-ligne
- Export et rapports
- Tests et debugging
- Déploiement Vercel

---

## Conventions de Code

- **Langage** : JavaScript (JSX) — pas de TypeScript
- **Formatage** : 2 espaces d'indentation
- **Nommage** :
  - Components : PascalCase (`JobOfferCard.jsx`)
  - Fonctions : camelCase (`scrapeLinkedIn`)
  - Routes API : kebab-case (`/api/search-profiles`)
  - Modèles Mongoose : PascalCase (`JobOffer`)
- **Imports** : Alias `@/` pour `src/`
- **State management** : React Context + TanStack React Query
- **Forms** : React Hook Form + Zod validation
- **Styling** : Tailwind CSS utility-first
- **Animations** : Framer Motion
- **Langue UI** : Français

Tous les utilisateurs se connectent désormais avec 123456789.