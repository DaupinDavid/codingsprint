# Wikipedia Learn — Next.js

> **Liens du projet en ligne :** 🔗 [![Déployé sur Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://codingsprintnextjs-ebp5q9yxx-dds-projects-c7c1e9b8.vercel.app/) &nbsp; 🔗 [![Déployé sur Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://codingsprint.netlify.app/)

**Wikipedia Learn** est une application web interactive conçue pour gamifier l'apprentissage.

Développée avec **Next.js** et **Tailwind CSS**, elle propose des parcours d'apprentissage chronométrés, un système d'expérience (XP) persistant via **Zustand**, et une interface utilisateur moderne basée sur **shadcn/ui**. <br>Ce projet démontre ma capacité à concevoir des architectures frontend robustes, à gérer des états complexes et à déployer des applications performantes en production (CI/CD via Vercel & Netlify).

## Installation & lancement

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Structure du projet

```
wikipedia-learn/
├── next.config.mjs        ← Config Next.js
├── package.json           ← Dépendances
├── tsconfig.json          ← TypeScript
├── tailwind.config.js     ← Tailwind CSS
├── postcss.config.js      ← PostCSS
│
└── src/
    ├── app/               ← NEXT.JS APP ROUTER
    │   ├── layout.tsx     ← Remplace index.html + main.tsx
    │   ├── page.tsx       ← Remplace App.tsx
    │   └── globals.css    ← Styles globaux
    │
    ├── sections/          ← Les 4 pages (tous "use client")
    │   ├── Home.tsx       ← Accueil + niveaux
    │   ├── Course.tsx     ← Contenu du cours
    │   ├── Quiz.tsx       ← Quiz interactif (timer 45s)
    │   └── Exam.tsx       ← Examen final (3 séries)
    │
    ├── store/
    │   └── gameStore.ts   ← État global Zustand (XP, badges, progression)
    │
    ├── data/
    │   ├── questions.ts   ← Toutes les questions
    │   └── courses.ts     ← Contenu des cours
    │
    ├── types/
    │   └── index.ts       ← Types TypeScript
    │
    ├── lib/
    │   └── utils.ts       ← Fonction cn() pour Tailwind
    │
    └── components/
        └── ui/            ← Composants shadcn/ui
            ├── button.tsx
            ├── card.tsx
            ├── badge.tsx
            ├── progress.tsx
            ├── dialog.tsx
            └── scroll-area.tsx
```

## Différences Vite → Next.js

| Vite (avant)        | Next.js (maintenant)      |
|---------------------|---------------------------|
| `index.html`        | `src/app/layout.tsx`      |
| `src/main.tsx`      | `src/app/layout.tsx`      |
| `src/App.tsx`       | `src/app/page.tsx`        |
| `src/index.css`     | `src/app/globals.css`     |
| `vite.config.ts`    | `next.config.mjs`         |
| port `:5173`        | port `:3000`              |
| pas de directive    | `"use client"` requis     |

## Déploiement Vercel

```bash
npx vercel --prod
```
