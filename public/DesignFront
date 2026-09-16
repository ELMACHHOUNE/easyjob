# MISSION : Refonte UI/UX Complète de JobConnect AI

Tu es un Senior Product Designer + Frontend Engineer avec 10+ ans d'expérience
chez Stripe, Linear, Vercel et Notion. Tu vas transformer JobConnect AI en une
application SaaS premium de niveau international.

RÈGLES ABSOLUES :
- Ne JAMAIS casser la logique métier, les routes, les API, les models existants
- Conserver React 19 + Vite + Tailwind CSS v4 + React Router 7
- Conserver TanStack Query, Axios, Framer Motion, Lucide React, React Hook Form, Zod
- Tout le code doit rester en JavaScript (JSX), pas de TypeScript
- UI 100% en français
- Respecter une architecture de composants réutilisables et scalables
- Zéro style "généré par IA" : pas de gradients violets génériques, pas de
  glassmorphism excessif, pas de rounded-full partout, pas de shadows lourdes

=====================================================================
ÉTAPE 0 — INSTALLATION & SETUP DU DESIGN SYSTEM
=====================================================================

1. Installer shadcn/ui (version CLI moderne compatible Tailwind v4) :
   npx shadcn@latest init

2. Composants shadcn à installer obligatoirement :
   button, input, label, textarea, select, checkbox, radio-group, switch,
   card, badge, avatar, dialog, sheet, drawer, dropdown-menu, popover,
   tooltip, tabs, accordion, alert, alert-dialog, toast, sonner, skeleton,
   progress, separator, scroll-area, table, pagination, breadcrumb,
   command, calendar, form, slider, toggle, toggle-group, sidebar,
   navigation-menu, hover-card, context-menu, resizable, collapsible

3. Installer dépendances supplémentaires :
   npm i sonner cmdk vaul next-themes class-variance-authority clsx
   tailwind-merge tailwindcss-animate @radix-ui/react-icons embla-carousel-react
   react-day-picker input-otp react-resizable-panels

=====================================================================
ÉTAPE 1 — DESIGN TOKENS (index.css / globals.css)
=====================================================================

Remplacer complètement le fichier `src/index.css` par un design system
professionnel inspiré de Linear + Stripe + Vercel.

PALETTE OFFICIELLE (à respecter strictement) :

LIGHT MODE :
--background: 0 0% 100%              /* #FFFFFF */
--foreground: 222 47% 11%            /* #0F172A - slate-900 */
--card: 0 0% 100%
--card-foreground: 222 47% 11%
--popover: 0 0% 100%
--popover-foreground: 222 47% 11%
--primary: 221 83% 53%               /* #2563EB - bleu confiance */
--primary-foreground: 210 40% 98%
--secondary: 210 40% 96%
--secondary-foreground: 222 47% 11%
--muted: 210 40% 96%
--muted-foreground: 215 16% 47%
--accent: 160 84% 39%                /* #10B981 - vert succès */
--accent-foreground: 0 0% 100%
--destructive: 0 84% 60%             /* #EF4444 */
--destructive-foreground: 210 40% 98%
--warning: 38 92% 50%                /* #F59E0B */
--border: 214 32% 91%
--input: 214 32% 91%
--ring: 221 83% 53%
--radius: 0.75rem

DARK MODE :
--background: 222 47% 5%             /* #050813 - plus profond que slate-950 */
--foreground: 210 40% 98%
--card: 222 47% 8%                   /* #0B1120 */
--card-foreground: 210 40% 98%
--popover: 222 47% 8%
--popover-foreground: 210 40% 98%
--primary: 217 91% 60%               /* #3B82F6 - plus lumineux en dark */
--primary-foreground: 222 47% 5%
--secondary: 217 33% 17%
--secondary-foreground: 210 40% 98%
--muted: 217 33% 14%
--muted-foreground: 215 20% 65%
--accent: 160 84% 45%
--accent-foreground: 222 47% 5%
--destructive: 0 72% 51%
--border: 217 33% 17%
--input: 217 33% 17%
--ring: 217 91% 60%

TYPOGRAPHIE :
- Font principale : "Inter" (via @fontsource/inter ou Google Fonts)
- Font display (titres hero) : "Cal Sans" ou "Geist" (fallback Inter)
- Font mono : "JetBrains Mono" (pour codes/logs)
- Tailles : text-xs (11px) → text-9xl pour hero
- Line-height serré sur les titres (leading-tight = 1.15)
- Letter-spacing négatif sur titres : tracking-tight (-0.02em)

SHADOWS (subtiles, façon Linear) :
--shadow-xs: 0 1px 2px rgba(0,0,0,0.04)
--shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)
--shadow-md: 0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)
--shadow-lg: 0 12px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)
--shadow-xl: 0 24px 48px rgba(0,0,0,0.10)
Ne JAMAIS dépasser ces intensités.

BORDER RADIUS :
- Boutons & inputs : rounded-lg (8px)
- Cards : rounded-xl (12px)
- Modales : rounded-2xl (16px)
- Badges : rounded-md (6px) ou rounded-full UNIQUEMENT pour avatars/pills

=====================================================================
ÉTAPE 2 — LANDING PAGE (nouvelle page à créer)
=====================================================================

Créer une landing page publique accessible sur `/` avec les sections suivantes,
dans cet ordre, en respectant un scroll fluide et storytelling :

SECTION 1 — NAVBAR STICKY
- Logo JobConnect AI (SVG custom, pas d'emoji)
- Liens : Fonctionnalités, Comment ça marche, Tarifs, Témoignages
- Bouton "Se connecter" (ghost) + "Commencer gratuitement" (primary)
- Backdrop blur léger au scroll (transition douce)
- Menu mobile via Sheet shadcn

SECTION 2 — HERO
- Badge "Nouveau • Scraping multi-plateformes" en haut (pill avec point vert animé)
- Titre principal : "Trouvez votre prochain emploi. Automatiquement."
  avec animation de texte mot par mot (Framer Motion staggered children)
- Sous-titre : 2 lignes max, ton pro, promesse claire
- Double CTA : "Démarrer maintenant" (primary, avec arrow-right qui glisse au hover)
  + "Voir la démo" (outline, avec icône play)
- Mockup produit flottant : capture du dashboard avec perspective 3D subtile
  et animation parallax au scroll
- Fond : grille subtile (grid pattern SVG) + radial gradient bleu discret
  + noise texture légère (opacity 0.03)

SECTION 3 — LOGOS PARTENAIRES / SOURCES
- "Nous agrégeons les offres de :" + row de logos (LinkedIn, Indeed, WTJ, etc.)
- Défilement infini automatique (marquee CSS)
- Opacité 60%, hover 100% avec transition

SECTION 4 — FONCTIONNALITÉS (Bento Grid)
- Grille asymétrique style Linear/Apple :
  * 1 grande card "Scraping multi-sources" avec mockup animé
  * 2 petites cards : "Candidature 1-clic", "Score de pertinence AI"
  * 1 card moyenne : "Explorateur de recruteurs" avec avatars empilés
  * 1 card large : "Suivi en temps réel" avec mini-graphique animé
- Chaque card : icône Lucide dans un carré arrondi bg-primary/10,
  titre, description, hover = lift + border-primary/30
- Animations : fade-up au scroll (viewport once, stagger 0.1s)

SECTION 5 — COMMENT ÇA MARCHE
- Timeline horizontale en 4 étapes avec numéros dans cercles
- Ligne pointillée animée qui se remplit au scroll
- Icônes : Search → Sparkles → Send → Trophy
- Chaque étape : titre court + description 1 ligne

SECTION 6 — STATISTIQUES / SOCIAL PROOF
- 4 stats en gros chiffres avec Counter animé au scroll :
  "50 000+ offres scrapées/mois", "12 000+ candidatures envoyées",
  "78% taux d'ouverture", "5 plateformes connectées"
- Chiffres en text-5xl font-bold, label en muted-foreground

SECTION 7 — TÉMOIGNAGES
- Carousel Embla avec 3-5 témoignages
- Cards avec avatar, nom, poste, entreprise, quote
- Auto-play 5s, dots de navigation custom

SECTION 8 — TARIFS (Pricing)
- 3 plans : Découverte (gratuit), Pro (recommandé), Équipe
- Card Pro surélevée avec badge "Populaire" et border-primary
- Toggle mensuel/annuel avec animation slide
- Liste features avec Check icons verts

SECTION 9 — FAQ
- Accordion shadcn, 6-8 questions
- Chevron rotatif smooth

SECTION 10 — CTA FINAL
- Grande card avec gradient subtil (primary → accent) en dark
- Titre + sous-titre + bouton primary XL
- Fond : motif de points animés

SECTION 11 — FOOTER
- 4 colonnes : Produit, Ressources, Entreprise, Légal
- Newsletter input + bouton
- Réseaux sociaux (icônes Lucide)
- Copyright + "Fait avec ❤️ au Maroc"

ANIMATIONS GLOBALES DE LA LANDING :
- Scroll-triggered : Framer Motion `whileInView` avec `viewport={{ once: true, margin: "-100px" }}`
- Parallax léger sur hero mockup (useScroll + useTransform)
- Sticky reveal pour navbar (useScroll)
- Smooth scroll natif (scroll-behavior: smooth)
- Curseur custom (point + circle) desktop uniquement — optionnel, désactivable
- Prefers-reduced-motion respecté partout

=====================================================================
ÉTAPE 3 — PAGE DE LOGIN / AUTH
=====================================================================

Créer un layout split-screen (2 colonnes) :

COLONNE GAUCHE (55%) — Formulaire
- Fond : background pur, padding généreux
- Logo en haut à gauche (link vers /)
- Titre : "Bon retour parmi nous" (text-3xl font-semibold tracking-tight)
- Sous-titre muted
- Form :
  * Input email avec icône Mail à gauche (Lucide)
  * Input password avec icône Lock + bouton eye/eye-off toggle
  * Checkbox "Se souvenir de moi" + link "Mot de passe oublié ?"
  * Bouton primary full-width "Se connecter" (loading state avec spinner)
  * Separator "ou continuer avec"
  * Boutons sociaux : Google, LinkedIn (outline, icônes officielles)
- Lien bas : "Pas encore de compte ? S'inscrire"
- Validation Zod + React Hook Form
- Toast sonner en cas d'erreur (variant destructive)

COLONNE DROITE (45%) — Visuel
- Fond : gradient subtil primary/5 → accent/5 + grille + blobs flous
- Citation rotative (3-4 témoignages) avec animation fade
- Mini dashboard mockup ou illustrations abstraites
- En bas : "© 2025 JobConnect AI"

RESPONSIVE : Sur mobile, colonne droite cachée, formulaire plein écran.

PAGES ASSOCIÉES (même design) :
- RegisterPage : ajouter champs firstName, lastName, + indicateur de force du mot de passe
- ForgotPasswordPage : simplifiée, centrée
- ResetPasswordPage : idem

=====================================================================
ÉTAPE 4 — LAYOUT PRINCIPAL (MainLayoutShell)
=====================================================================

SIDEBAR (refonte complète) :
- Largeur : 260px expanded / 72px collapsed
- Fond : card avec border-r subtile
- Sections groupées avec labels muted uppercase text-xs
  * PRINCIPAL : Dashboard, Offres, Candidatures, Recruteurs
  * OUTILS : Templates, Profils de recherche, Analytics
  * AUTRE : Messages, Notifications, Profil
- Item actif : bg-primary/10, text-primary, border-l-2 border-primary
- Hover : bg-muted/50 transition
- Badge count sur Messages/Notifications
- Bouton collapse en bas (icon PanelLeftClose / PanelLeftOpen)
- User menu en bas : avatar + nom + email + dropdown (Profil, Paramètres, Déconnexion)
- Animation collapse : Framer Motion layout + width transition 0.2s ease

HEADER (top) :
- Height 64px, sticky, border-b, backdrop-blur
- Fil d'Ariane (Breadcrumb shadcn)
- Barre de recherche globale (Command K) — ouvre CommandDialog avec Cmd+K
- Bouton thème toggle (Sun/Moon avec rotation)
- NotificationBell avec badge rouge animé (pulse)
- Avatar dropdown

MOBILE :
- Sidebar en Sheet (drawer gauche)
- Header réduit avec hamburger + logo + cloche

=====================================================================
ÉTAPE 5 — DASHBOARD
=====================================================================

STRUCTURE :

1. Header de page :
   - "Bonjour, {firstName} 👋" (text-3xl font-semibold)
   - Sous-titre : date du jour en français + résumé
   - Actions : bouton "Lancer un scraping" (primary, icône Zap) +
     "Nouvelle candidature" (outline)

2. Grid de 4 StatsCards :
   - Icône dans carré coloré (bg-primary/10, bg-accent/10, etc.)
   - Label muted, valeur en text-3xl font-bold
   - Trend (+12% vs semaine dernière) avec flèche up/down verte/rouge
   - Sparkline mini-graphique en bas de card
   - Hover : shadow-md + translate-y-[-2px]

3. Graphique principal (Recharts) :
   - Area chart "Candidatures par semaine" avec gradient primary
   - Tooltip custom stylé (card shadcn)
   - Légende épurée

4. Deux colonnes :
   - Gauche : "Dernières offres" (liste de 5 JobOfferCard compactes)
   - Droite : "Activité récente" (timeline verticale avec icônes)
   - En bas : "Offres recommandées" (carousel horizontal)

Animations : fade-in + stagger des cards au mount.

=====================================================================
ÉTAPE 6 — PAGE OFFRES D'EMPLOI
=====================================================================

- Barre de filtres sticky en haut (JobOfferFilters refondu) :
  * Recherche input avec icône
  * Select source (multi)
  * Select contrat
  * Select localisation
  * Slider salaire
  * Bouton "Filtres avancés" ouvre Sheet
  * Chips des filtres actifs (avec X pour retirer)

- Vue toggle : Grid / Liste (icônes LayoutGrid / List)
- Grid : 3 colonnes desktop, 2 tablette, 1 mobile
- JobOfferCard :
  * Header : logo entreprise (rounded-lg) + titre + company
  * Badges : source (couleur par plateforme), contrat, remote
  * Localisation avec MapPin
  * Salaire avec badge accent
  * Footer : date relative (formatDistanceToNow fr) + score pertinence
    (cercle SVG animé avec % au centre)
  * Hover : lift + border-primary/40 + bouton "Postuler" apparaît
  * Actions : save (Bookmark), share (Share2), postuler (primary)

- Skeletons : JobOfferSkeleton en grid pendant chargement
- Empty state : illustration SVG custom + CTA

=====================================================================
ÉTAPE 7 — MODALES, ALERTES, TOASTS
=====================================================================

TOASTS (remplacer react-hot-toast par sonner) :
- Position : top-right
- Variants : success (accent), error (destructive), warning (warning),
  info (primary), loading (spinner)
- Style : card avec icône colorée à gauche, titre bold, description muted
- Animation : slide-in depuis la droite + fade
- Durée : 4s par défaut

ALERT DIALOGS (ConfirmModal refondu) :
- Icône dans cercle coloré (destructive/primary)
- Titre + description claire
- Actions : Annuler (outline) + Confirmer (destructive/primary)
- Animation : scale + fade (Radix)

DIALOGS :
- Overlay : bg-black/60 backdrop-blur-sm
- Content : rounded-2xl, shadow-xl, animation zoom-in-95
- Header avec titre + description + close X
- Footer avec actions alignées à droite

=====================================================================
ÉTAPE 8 — BOUTONS & INTERACTIONS
=====================================================================

VARIANTS DE BOUTONS (via CVA) :
- default : bg-primary text-primary-foreground, hover:bg-primary/90
- secondary : bg-secondary text-secondary-foreground
- outline : border bg-background hover:bg-accent hover:text-accent-foreground
- ghost : hover:bg-accent hover:text-accent-foreground
- destructive : bg-destructive text-destructive-foreground
- link : text-primary underline-offset-4 hover:underline
- success : bg-accent text-white (custom)

SIZES : sm (h-8), default (h-9), lg (h-10), icon (h-9 w-9)

MICRO-INTERACTIONS :
- Tous les boutons : active:scale-[0.98] transition-transform
- Icônes dans boutons : translate-x-0.5 au hover (arrow-right)
- Loading : spinner Loader2 animé + texte "Chargement..."
- Disabled : opacity-50 cursor-not-allowed

INPUTS :
- h-10, rounded-lg, border, focus:ring-2 focus:ring-ring/20
- Label au-dessus (text-sm font-medium)
- Erreur : border-destructive + texte rouge en dessous
- Icône optionnelle à gauche (avec padding-left adapté)

=====================================================================
ÉTAPE 9 — REFONTE DES PAGES RESTANTES
=====================================================================

Appliquer le même design system à :
- ProfilePage : tabs (Infos, Expériences, Formation, Compétences)
- CVPage : dropzone drag&drop animée + preview PDF
- PortfolioPage : cards projets en grid
- SearchPreferencesPage : formulaire multi-étapes avec progress
- ScrapingConfigPage : cards par source avec Switch + badges statut
- ApplicationsPage : table shadcn avec tri, filtres, pagination
- ApplicationDetailPage : timeline verticale + panel email
- ComposeEmailPage : éditeur split (form gauche, preview droite)
- EmailTemplatesPage : grid de cards avec preview hover
- RecruitersPage : grid de RecruiterCard (avatar, nom, entreprise, degré)
- RecruiterDetailPage : profil détaillé + notes + historique
- NetworkPage : graphe de connexions (react-force-graph optionnel)
- MessagesPage : layout 2 colonnes (liste conversations + chat)
- NotificationsPage : liste groupée par date
- AnalyticsPage : grille de charts Recharts + export
- SavedJobsPage : grid similaire à JobOffersPage

=====================================================================
ÉTAPE 10 — DÉTAILS QUI FONT LA DIFFÉRENCE [✓]
=====================================================================

- [✓] Cursor pointer sur tous les éléments cliquables (button, a, [role=button], select, summary)
- [✓] Focus visible partout (ring-2 ring-ring ring-offset-2) pour accessibilité
- [✓] Loading states sur TOUTES les actions async (boutons, tables, cards)
- [✓] Skeleton loaders (jamais de spinner plein écran sauf auth) — NetworkPage, RecruiterDetailPage, EmailTemplatesPage
- [✓] Empty states illustrés (SVG custom, pas d'emojis)
- [✓] Error boundaries avec fallback UI propre — ErrorBoundary.jsx + wired in main.jsx
- [✓] 404 page custom — NotFoundPage.jsx + catch-all route dans App.jsx
- [✓] Transitions de page : fade + slide (Framer Motion AnimatePresence) — MainLayoutShell.jsx
- [✓] Scrollbar custom (webkit) fine et discrète — index.css
- [✓] Selection color : bg-primary/20 — index.css
- [✓] Favicon + meta tags + OG image + theme-color — index.html + og-image.svg
- [✓] Responsive parfait du 320px au 4K

=====================================================================
ÉTAPE 11 — CHECKLIST FINALE
=====================================================================

Avant de considérer la refonte terminée, vérifier :
[ ] Aucun composant n'utilise de style inline hardcodé
[ ] Toutes les couleurs viennent des tokens CSS
[ ] Dark mode testé sur CHAQUE page
[ ] Responsive testé sur mobile/tablette/desktop
[ ] Animations respectent prefers-reduced-motion
[ ] Tous les textes sont en français
[ ] Aucun console.log oublié
[ ] Lighthouse > 90 sur Performance, Accessibilité, Best Practices, SEO
[ ] Toutes les interactions ont un feedback visuel
[ ] Cohérence des espacements (échelle 4/8/12/16/24/32/48/64)

=====================================================================
EXÉCUTION
=====================================================================

Exécute cette refonte ÉTAPE PAR ÉTAPE. Après chaque étape :
1. Montre-moi les fichiers créés/modifiés
2. Attends ma validation avant de passer à la suivante
3. Si un fichier existant doit être modifié, montre le diff
4. Ne touche JAMAIS à la logique backend ou aux appels API

 Étape 0 — Installation & setup du design system (shadcn/ui + deps)
[✓] Étape 1 — Design tokens (index.css)
[✓] Étape 2 — Landing page
[✓] Étape 3 — Page Login/Auth
[✓] Étape 4 — MainLayoutShell (sidebar + header)
[✓] Étape 5 — Dashboard
[✓] Étape 6 — Page Offres d'emploi
[✓] Étape 7 — Modales, alertes, toastseta
[✓] Étape 8 — Boutons & interactions
[✓] Étape 9 — Refonte des pages restantes
[✓] Étape 10 — Détails qui font la différence
[✓] Étape 11 — Checklist finale