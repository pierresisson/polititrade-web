# PolitiTrades - Product Documentation

## Vision & Pitch

**PolitiTrades : Investissez comme ceux qui font les lois.**

Une plateforme qui démocratise l'accès aux insider trades des politiciens et cadres dirigeants, transformant des données publiques complexes en insights actionnables.

---

## Le Problème

### Asymétrie d'information

Les politiciens et dirigeants ont accès à des informations privilégiées qui influencent leurs décisions d'investissement :
- **Législations à venir** avant leur annonce publique
- **Contrats gouvernementaux** en négociation
- **Régulations sectorielles** en préparation

### Données publiques mais inaccessibles

Ces transactions sont légalement déclarées (SEC EDGAR, HATVP...) mais :
- Formats bruts et techniques (XML, PDF)
- Dispersées sur plusieurs sources
- Aucune agrégation ni analyse disponible
- Temps de recherche prohibitif pour l'investisseur retail

### Constat chiffrant

Les portefeuilles des membres du Congrès US surperforment le S&P 500 de manière statistiquement significative.

---

## La Solution

### PolitiTrades transforme

| Avant | Après |
|-------|-------|
| Données brutes SEC | Feed temps réel lisible |
| PDF éparpillés | Profils consolidés |
| Recherche manuelle | Alertes automatiques |
| Analyse complexe | Scores et tendances |

### Proposition de valeur

1. **Agrégation** - Toutes les sources en un seul endroit
2. **Traduction** - Données techniques → insights compréhensibles
3. **Timing** - Alertes dès publication officielle
4. **Analyse** - Historique, performance, patterns

---

## Public Cible

### Persona primaire : L'investisseur retail actif

- **Âge** : 25-45 ans
- **Profil** : Investit activement, suit les marchés
- **Comportement** : Utilise déjà des apps finance (Robinhood, Trading 212, eToro)
- **Motivation** : Edge informationnel, curiosité politique
- **Pain point** : Manque de temps pour rechercher ces données

### Persona secondaire : Le curieux politique

- Intéressé par la transparence politique
- Veut savoir "ce que font vraiment les élus"
- Potentiel viral sur réseaux sociaux

### Marché adressable

- **TAM** : 50M+ investisseurs retail actifs (US + EU)
- **SAM** : 10M intéressés par les données alternatives
- **SOM** : 100K utilisateurs Year 1 (objectif)

---

## Business Model

### Freemium → Premium

#### Free Tier
- Feed des 10 derniers trades
- Profils basiques (top 5 politiciens)
- Délai de 48h sur les données

#### Premium - €14.90/mois ou €149/an

- **Temps réel** : Alertes push dès publication
- **Accès complet** : Tous les politiciens et dirigeants
- **Historique illimité** : Analyse sur plusieurs années
- **Filtres avancés** : Par secteur, parti, montant
- **Export données** : CSV pour analyse personnelle
- **Watchlists** : Suivi personnalisé

#### Essai gratuit
- 7 jours Premium complet
- Carte requise (réduction friction abandon)

### Projections

| Métrique | Year 1 | Year 2 |
|----------|--------|--------|
| Users gratuits | 100K | 500K |
| Conversion premium | 3% | 5% |
| Abonnés payants | 3K | 25K |
| ARR | ~€450K | ~€3.7M |

---

## Fonctionnalités Core (MVP)

### 1. Authentification
- Sign up email/password
- OAuth (Google, Apple)
- Onboarding simplifié (3 écrans max)

### 2. Feed des Trades
- Liste chronologique des transactions
- Filtres : type (achat/vente), montant, date
- Pull-to-refresh
- Infinite scroll avec pagination

### 3. Profils Politiciens
- Photo, nom, parti, état/circonscription
- Statistiques clés (volume tradé, performance estimée)
- Historique des transactions
- Positions actuelles (portefeuille reconstitué)

### 4. Système d'Alertes
- Push notifications nouvelles transactions
- Alertes personnalisées (politicien suivi, seuil montant)
- Gestion préférences notification

### 5. Paywall & Abonnement
- Écran upgrade clair
- Intégration Stripe (web) / IAP (mobile)
- Gestion abonnement (cancel, upgrade)
- Restore purchases

### 6. Détail Transaction
- Ticker, entreprise, secteur
- Type : achat, vente, exercice options
- Montant et nombre d'actions
- Date transaction vs date déclaration
- Lien source officielle (SEC)

---

## Sources de Données

### Phase 1 - US (MVP)
- **SEC EDGAR Form 4** : Insider trades dirigeants
- **Periodic Transaction Reports (PTR)** : Membres du Congrès
- **eFile** : Déclarations Sénat

### Phase 2 - Expansion EU
- **France** : HATVP (Haute Autorité pour la Transparence)
- **Allemagne** : Bundestag declarations
- **UK** : Parliament register of interests

### Pipeline technique
```
Source officielle → Scraping/API → Parsing → Normalisation → Base de données → API → App
```

---

## Roadmap Simplifiée

### Phase 1 : MVP (Mois 1-3)
- [ ] Auth + onboarding
- [ ] Feed trades US
- [ ] Profils politiciens basiques
- [ ] Paywall Stripe
- [ ] Landing page + SEO

### Phase 2 : Growth (Mois 4-6)
- [ ] Alertes push temps réel
- [ ] Watchlists personnalisées
- [ ] Partage social (Twitter cards)
- [ ] Amélioration SEO/ASO

### Phase 3 : Expansion (Mois 7-12)
- [ ] Ajout données EU (France d'abord)
- [ ] Analytics avancés (performance tracking)
- [ ] API publique (tier entreprise)
- [ ] App mobile native (si web-first)

### Phase 4 : Scale (Year 2)
- [ ] AI insights (patterns, prédictions)
- [ ] Intégration brokers
- [ ] Version B2B (hedge funds, médias)

---

## Métriques de Succès

### North Star Metric
**Weekly Active Users (WAU)** qui consultent au moins 3 trades

### Métriques clés

| Catégorie | Métrique | Objectif M6 |
|-----------|----------|-------------|
| Acquisition | Sign-ups/semaine | 2,000 |
| Activation | Onboarding complet | 70% |
| Engagement | DAU/MAU ratio | 25% |
| Rétention | D7 retention | 40% |
| Rétention | D30 retention | 20% |
| Revenue | Trial → Paid | 15% |
| Revenue | Monthly churn | <5% |

### KPIs techniques
- Latence feed < 2s
- Délai publication SEC → app < 1h
- Uptime > 99.5%

---

## Stack Technique (Web App)

### Frontend
- **Framework** : Next.js 14+ (App Router)
- **Styling** : Tailwind CSS + shadcn/ui
- **State** : React Query (TanStack)

### Backend
- **API** : Next.js API Routes / tRPC
- **Database** : PostgreSQL (Supabase)
- **Auth** : Supabase Auth ou NextAuth

### Infrastructure
- **Hosting** : Vercel
- **Payments** : Stripe
- **Analytics** : Mixpanel / PostHog

### Data Pipeline
- **Scraping** : Python workers
- **Queue** : Redis / BullMQ
- **Cron** : Vercel Cron ou externe

---

## Différenciateurs Concurrentiels

1. **UX/UI Premium** - Design soigné vs interfaces austères concurrents
2. **Mobile-first** - Expérience optimisée smartphone
3. **Données EU** - Seul à couvrir France/Allemagne/UK
4. **Prix accessible** - €14.90 vs $30-50 concurrents US
5. **Transparence** - Sources toujours citées, méthodologie expliquée

---

## Risques & Mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Changement réglementation SEC | Haut | Diversifier sources (EU) |
| Concurrence (Quiver, Unusual Whales) | Moyen | Différenciation UX + EU |
| Données incorrectes | Haut | Validation multi-sources |
| Faible conversion free→paid | Moyen | A/B test paywall, ajuster tier gratuit |

---

## Liens & Ressources

- **SEC EDGAR** : https://www.sec.gov/cgi-bin/browse-edgar
- **House PTR** : https://disclosures-clerk.house.gov/
- **Senate eFile** : https://efdsearch.senate.gov/
- **HATVP France** : https://www.hatvp.fr/

---

*Document créé le 5 février 2026 - Version 1.0*
