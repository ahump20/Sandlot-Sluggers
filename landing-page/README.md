# Sandlot Sluggers Landing Page

A modern, responsive landing page for the Sandlot Sluggers baseball game, built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Hero Section** - Eye-catching introduction with game overview
- **Live Stats Dashboard** - Real-time statistics from the game API
- **Interactive Character Roster** - Showcase all 12 unique characters with detailed stats
- **Stadium Showcase** - Explore 5 unique stadiums with dimensions and themes
- **Leaderboard** - Top 10 players with wins, home runs, and win rates
- **Features Section** - Highlight key game features and tech stack
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Server-Side Rendering** - Fast page loads with Next.js App Router
- **Type Safety** - Full TypeScript implementation

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide Icons** - Beautiful, consistent icons
- **Server Components** - Optimized performance with RSC

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:

```bash
cd landing-page
npm install
```

2. Create environment file:

```bash
cp .env.example .env.local
```

3. Update the API URL in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8788
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
landing-page/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with metadata
│   │   ├── page.tsx         # Main page component
│   │   └── globals.css      # Global styles with Tailwind
│   ├── components/
│   │   ├── Hero.tsx         # Hero section
│   │   ├── LiveStats.tsx    # Stats dashboard
│   │   ├── Leaderboard.tsx  # Top players
│   │   ├── CharacterRoster.tsx  # Character showcase
│   │   ├── StadiumShowcase.tsx  # Stadium explorer
│   │   ├── Features.tsx     # Features grid
│   │   └── Footer.tsx       # Site footer
│   ├── lib/
│   │   ├── api.ts           # API client functions
│   │   └── characters.ts    # Character data
│   └── types/
│       └── api.ts           # TypeScript interfaces
├── public/                  # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## API Integration

The landing page fetches data from the Sandlot Sluggers API:

- `GET /api/stats/global` - Overall game statistics
- `GET /api/stats/leaderboard` - Top players
- `GET /api/stats/characters` - Character usage stats
- `GET /api/stats/stadiums` - Stadium popularity

### Data Caching

- Server-side data fetching with 60-second revalidation
- API responses cached with appropriate TTL
- Optimistic fallback data for offline/error states

## Deployment Options

### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy

### Option 2: Cloudflare Pages

```bash
npm run build
npx wrangler pages deploy out
```

### Option 3: Custom Server

```bash
npm run build
npm start
```

## Configuring for blazesportsintel.com/sandlot-sluggers

To deploy to a subdirectory, update `next.config.js`:

```javascript
module.exports = {
  basePath: '/sandlot-sluggers',
  assetPrefix: '/sandlot-sluggers',
}
```

Then configure your web server to route `/sandlot-sluggers` to this Next.js app.

### Apache Configuration

```apache
<VirtualHost *:443>
  ServerName blazesportsintel.com

  ProxyPass /sandlot-sluggers http://localhost:3001/sandlot-sluggers
  ProxyPassReverse /sandlot-sluggers http://localhost:3001/sandlot-sluggers
</VirtualHost>
```

### Nginx Configuration

```nginx
server {
  listen 443 ssl;
  server_name blazesportsintel.com;

  location /sandlot-sluggers {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

## Customization

### Colors

Edit `tailwind.config.ts` to customize the baseball-themed color palette:

```typescript
colors: {
  baseball: {
    red: '#CC0000',
    green: '#228B22',
    yellow: '#FFD700',
    gray: '#4A4A4A',
    cream: '#F5F5DC',
  },
}
```

### Fonts

Update Google Fonts import in `src/app/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=...');
```

### Metadata

Edit SEO metadata in `src/app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: 'Your Title',
  description: 'Your description',
  // ...
}
```

## Performance Optimization

- Server-side rendering for initial page load
- Image optimization with Next.js Image component
- Code splitting for optimal bundle sizes
- CSS purging via Tailwind for minimal CSS
- API response caching with revalidation

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Sandlot Sluggers game. See main repository for license information.

## Support

For issues or questions:
- GitHub Issues: [Sandlot-Sluggers/issues](https://github.com/ahump20/Sandlot-Sluggers/issues)
- Email: contact@blazesportsintel.com

## Roadmap

- [ ] Add video trailer section
- [ ] Implement blog/news section
- [ ] Add player testimonials
- [ ] Create admin dashboard for content management
- [ ] Add internationalization (i18n)
- [ ] Implement dark mode toggle
- [ ] Add accessibility improvements (WCAG 2.1 AA)
