# Testing SSR API Locally

## Option 1: dev:ssr + Vite (recommandé pour le dev)

Lance deux serveurs : Vite pour les assets, dev:ssr pour le HTML avec meta OG.

### Utilisation
```bash
# Terminal 1 : Vite (port 1337)
pnpm dev

# Terminal 2 : SSR (port 3000)
pnpm dev:ssr
```

Puis visite **http://localhost:3000/** ou **http://localhost:3000/game?id=5**.

Le serveur SSR injecte les meta tags et proxifie les scripts/assets vers Vite.

## Option 2: Vercel CLI

Proche de la production Vercel.

```bash
pnpm build
pnpm dev:vercel
```

Le serveur sera sur `http://localhost:3000` avec les rewrites Vercel.

## Endpoints

- `http://localhost:3000/` — Page d'accueil avec meta OG
- `http://localhost:3000/game?id=5` — Page jeu avec meta OG dynamiques
- `http://localhost:3000/api/image?id=5` — Image OG
- `http://localhost:3000/test` — Infos sur les endpoints

## Structure des fichiers

```
client/
├── src/
│   └── api/
│       └── ssr.ts          # Fonction SSR principale
├── scripts/
│   ├── dev-ssr.ts         # Script de développement
│   └── README.md          # Ce fichier
└── dist/                  # Généré après `pnpm build`
    └── index.html         # Nécessaire pour le SSR
```
