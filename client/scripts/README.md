# Testing SSR API Locally

Il y a deux façons de tester votre fonction SSR localement :

## Option 1: Utiliser Vercel CLI (Recommandé)

C'est la méthode la plus proche de l'environnement de production Vercel.

### Prérequis
```bash
npm i -g vercel
```

### Utilisation
```bash
# 1. Build l'application
pnpm build

# 2. Lancer le serveur de développement Vercel
pnpm dev:vercel
```

Le serveur sera disponible sur `http://localhost:3000` et la fonction SSR sera accessible via `/api/ssr?id=5`.

## Option 2: Script de développement personnalisé

Un script Node.js simple qui simule l'environnement Vercel.

### Utilisation
```bash
# 1. Build l'application (une seule fois, ou quand vous modifiez le code React)
pnpm build

# 2. Lancer le serveur de développement (avec auto-reload)
pnpm dev:ssr
```

Le serveur sera disponible sur `http://localhost:3000` avec :
- Test endpoint: `http://localhost:3000/test`
- SSR endpoint: `http://localhost:3000/api/ssr?id=5`
- Image endpoint: `http://localhost:3000/api/image?id=5`

### Notes importantes

- **Vous devez builder l'application une fois** avant de lancer le serveur SSR car il a besoin du fichier `dist/index.html`
- **Le serveur se recharge automatiquement** quand vous modifiez les fichiers dans `src/api/` (grâce à `tsx watch`)
- Le script cherche `index.html` dans `dist/` ou `.vercel/output/static/`
- Pour tester différents jeux, modifiez le paramètre `id` : `/api/ssr?id=123`
- Si aucun `id` n'est fourni, les meta tags par défaut seront utilisés
- **Rebuilder uniquement si nécessaire** : si vous modifiez le code React/frontend, vous devrez rebuilder pour mettre à jour `dist/index.html`

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
