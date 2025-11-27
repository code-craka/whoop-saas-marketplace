# UI Design Skill - Whop SaaS Marketplace

## Overview
This skill helps build distinctive, creative UI designs that avoid generic aesthetics. Each design should feel unique, purposeful, and contextually appropriate.

## Core Principles

### 1. Typography - Be Bold & Distinctive
**AVOID:** Inter, Roboto, Arial, System Fonts, Space Grotesk (overused)

**USE:** Distinctive font combinations:
- **Cyberpunk/Tech:** JetBrains Mono, IBM Plex Mono, Fira Code
- **Editorial/Premium:** Newsreader, Crimson Pro, Spectral
- **Modern/Bold:** Sora, Plus Jakarta Sans, Outfit
- **Playful/Unique:** Lexend, Manrope, DM Sans
- **Brutalist:** Work Sans, Archivo, Rubik

### 2. Color Themes - Commit to Aesthetic

**Theme Options:**
1. **Neon Nights** (Dark base + Electric accents)
   - Base: `#0a0a0f` → `#12121a`
   - Primary: `#00ff9d` (Electric mint)
   - Accent: `#ff006e` (Hot magenta)
   - Glow effects with CSS filters

2. **Retro Terminal** (Amber/Green monochrome)
   - Base: `#0d1117` → `#161b22`
   - Primary: `#39ff14` (Terminal green) or `#ffb000` (Amber)
   - Monospace everything
   - Scanline effects

3. **Brutalist Concrete** (Raw, unpolished)
   - Base: `#e8e8e8` → `#f5f5f5`
   - Primary: `#000000`
   - Accent: `#ff0000`
   - Heavy borders, no shadows, sharp corners

4. **Deep Ocean** (Blue gradients, depth)
   - Base: `#0a192f` → `#112240`
   - Primary: `#64ffda` (Aqua)
   - Accent: `#f97316` (Coral)
   - Layered gradients, glass morphism

5. **Sunset Marketplace** (Warm, inviting)
   - Base: `#fef3c7` → `#fde68a`
   - Primary: `#dc2626` (Deep red)
   - Accent: `#7c2d12` (Brown)
   - Organic shapes, warm shadows

6. **Matrix Code** (Green on black)
   - Base: `#000000` → `#0d0d0d`
   - Primary: `#00ff41` (Matrix green)
   - Accent: `#003b00`
   - Digital rain effects, monospace

### 3. Motion & Animation

**High-Impact Moments:**
```css
/* Staggered page load reveals */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stagger-1 { animation: slideInUp 0.6s ease-out 0.1s backwards; }
.stagger-2 { animation: slideInUp 0.6s ease-out 0.2s backwards; }
.stagger-3 { animation: slideInUp 0.6s ease-out 0.3s backwards; }

/* Glitch effect */
@keyframes glitch {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
}

/* Glow pulse */
@keyframes glow {
  0%, 100% { filter: drop-shadow(0 0 2px currentColor); }
  50% { filter: drop-shadow(0 0 8px currentColor); }
}

/* Neon flicker */
@keyframes flicker {
  0%, 100% { opacity: 1; }
  41% { opacity: 1; }
  42% { opacity: 0.8; }
  43% { opacity: 1; }
  45% { opacity: 0.9; }
  46% { opacity: 1; }
}
```

### 4. Backgrounds - Create Atmosphere

```css
/* Gradient mesh */
.bg-mesh {
  background:
    radial-gradient(at 0% 0%, #00ff9d33 0, transparent 50%),
    radial-gradient(at 100% 100%, #ff006e33 0, transparent 50%),
    radial-gradient(at 50% 50%, #3b82f633 0, transparent 50%);
}

/* Grid pattern */
.bg-grid {
  background-image:
    linear-gradient(to right, #80808012 1px, transparent 1px),
    linear-gradient(to bottom, #80808012 1px, transparent 1px);
  background-size: 24px 24px;
}

/* Noise texture */
.bg-noise {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.03;
}

/* Radial spotlight */
.bg-spotlight {
  background: radial-gradient(circle at 50% 0%, #ffffff22, transparent 60%);
}
```

## Component Patterns

### Landing Page (Homepage)

**Hero Variants:**

1. **Terminal Style:**
```tsx
<section className="min-h-screen bg-[#0d1117] text-[#39ff14] font-mono p-8">
  <div className="max-w-4xl mx-auto">
    <div className="border-2 border-[#39ff14] p-8 relative">
      <div className="absolute -top-3 left-4 bg-[#0d1117] px-2 text-sm">
        system.whop.marketplace
      </div>

      <div className="space-y-4 text-lg">
        <p className="stagger-1">$ initializing marketplace protocol...</p>
        <p className="stagger-2 text-[#00ff41]">✓ loaded: digital_products.wasm</p>
        <p className="stagger-3 text-[#00ff41]">✓ loaded: stripe_connect.so</p>
        <p className="stagger-4">
          <span className="text-white">{'>'}</span> Build your SaaS empire
        </p>
      </div>

      <div className="mt-8 flex gap-4">
        <button className="px-6 py-3 bg-[#39ff14] text-black font-bold hover:shadow-[0_0_20px_#39ff14] transition-shadow">
          [DEPLOY_NOW]
        </button>
        <button className="px-6 py-3 border-2 border-[#39ff14] hover:bg-[#39ff14] hover:text-black transition-colors">
          [VIEW_DOCS]
        </button>
      </div>
    </div>
  </div>
</section>
```

2. **Neon Cyberpunk:**
```tsx
<section className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
  {/* Animated gradient background */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#00ff9d11,transparent_50%)] animate-pulse" />
  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

  <div className="relative z-10 max-w-6xl mx-auto px-8 py-24">
    <h1 className="text-7xl font-black text-white mb-4 stagger-1" style={{ fontFamily: 'Sora, sans-serif' }}>
      DIGITAL
      <br />
      <span className="text-[#00ff9d] [text-shadow:0_0_30px_#00ff9d]">
        MARKETPLACE
      </span>
    </h1>

    <p className="text-2xl text-gray-400 mb-8 max-w-2xl stagger-2">
      The infrastructure for building premium SaaS products.
      <span className="text-[#ff006e]"> Zero friction.</span> Maximum revenue.
    </p>

    <div className="flex gap-4 stagger-3">
      <button className="group relative px-8 py-4 bg-[#00ff9d] text-black font-bold overflow-hidden">
        <span className="relative z-10">Start Building</span>
        <div className="absolute inset-0 bg-gradient-to-r from-[#00ff9d] to-[#00d4ff] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
      </button>

      <button className="px-8 py-4 border-2 border-[#00ff9d] text-[#00ff9d] hover:shadow-[0_0_20px_#00ff9d,inset_0_0_20px_#00ff9d33] transition-shadow">
        View Demo
      </button>
    </div>
  </div>
</section>
```

3. **Brutalist Concrete:**
```tsx
<section className="min-h-screen bg-[#e8e8e8] border-8 border-black p-4">
  <div className="max-w-5xl mx-auto">
    <div className="bg-white border-4 border-black p-12 shadow-[8px_8px_0_0_#000]">
      <h1 className="text-8xl font-black mb-6 stagger-1" style={{ fontFamily: 'Archivo Black, sans-serif' }}>
        WHOP
        <br />
        MARKET
      </h1>

      <div className="w-32 h-2 bg-[#ff0000] mb-8 stagger-2" />

      <p className="text-2xl font-bold mb-8 max-w-2xl stagger-3" style={{ fontFamily: 'Work Sans, sans-serif' }}>
        SELL DIGITAL PRODUCTS.
        <br />
        GET PAID.
        <br />
        NO BULLSHIT.
      </p>

      <button className="px-8 py-4 bg-black text-white text-xl font-black border-4 border-black hover:bg-[#ff0000] hover:border-[#ff0000] transition-colors transform hover:translate-x-1 hover:translate-y-1 shadow-[4px_4px_0_0_#000] hover:shadow-none stagger-4">
        GET STARTED →
      </button>
    </div>

    {/* Stats grid */}
    <div className="grid grid-cols-3 gap-4 mt-4">
      <div className="bg-black text-white p-6 border-4 border-black stagger-5">
        <div className="text-5xl font-black mb-2">2.7%</div>
        <div className="text-sm font-bold">PLATFORM FEE</div>
      </div>
      <div className="bg-[#ff0000] text-white p-6 border-4 border-black stagger-6">
        <div className="text-5xl font-black mb-2">$400M</div>
        <div className="text-sm font-bold">PROCESSED</div>
      </div>
      <div className="bg-white p-6 border-4 border-black stagger-7">
        <div className="text-5xl font-black mb-2">24/7</div>
        <div className="text-sm font-bold">SUPPORT</div>
      </div>
    </div>
  </div>
</section>
```

### Dashboard Design Variants

1. **Command Center (Dark):**
```tsx
<div className="min-h-screen bg-[#0a192f]">
  <nav className="border-b border-[#64ffda33] bg-[#112240] backdrop-blur-sm">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="text-2xl font-bold text-[#64ffda]" style={{ fontFamily: 'JetBrains Mono' }}>
          {'<WHOP/>'}
        </div>

        <div className="flex gap-1 text-sm">
          <a href="#" className="px-4 py-2 text-[#64ffda] bg-[#64ffda22] border border-[#64ffda]">
            OVERVIEW
          </a>
          <a href="#" className="px-4 py-2 text-gray-400 hover:text-[#64ffda] transition-colors">
            PRODUCTS
          </a>
          <a href="#" className="px-4 py-2 text-gray-400 hover:text-[#64ffda] transition-colors">
            ANALYTICS
          </a>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-[#64ffda] text-sm font-mono">$12,547.00</span>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#64ffda] to-[#f97316]" />
      </div>
    </div>
  </nav>

  {/* Stats with glass morphism */}
  <div className="max-w-7xl mx-auto px-6 py-8">
    <div className="grid grid-cols-4 gap-4 mb-8">
      {[
        { label: 'Revenue', value: '$12.5K', change: '+23%' },
        { label: 'Members', value: '1,247', change: '+12%' },
        { label: 'Products', value: '8', change: '0%' },
        { label: 'Conversion', value: '3.2%', change: '+0.8%' },
      ].map((stat, i) => (
        <div
          key={i}
          className={`bg-[#112240] border border-[#64ffda33] p-6 backdrop-blur-sm stagger-${i + 1}`}
        >
          <div className="text-gray-400 text-sm mb-2 font-mono">{stat.label}</div>
          <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
          <div className={`text-sm ${stat.change.startsWith('+') ? 'text-[#64ffda]' : 'text-gray-400'}`}>
            {stat.change}
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
```

2. **Warm Marketplace:**
```tsx
<div className="min-h-screen bg-gradient-to-br from-[#fef3c7] via-[#fde68a] to-[#fcd34d]">
  <nav className="bg-white/80 backdrop-blur-md border-b border-[#dc262622]">
    <div className="max-w-7xl mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-[#dc2626]" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Whop
        </h1>

        <div className="flex gap-6 text-sm font-semibold">
          <a href="#" className="text-[#7c2d12] hover:text-[#dc2626] transition-colors">
            Dashboard
          </a>
          <a href="#" className="text-[#7c2d12] hover:text-[#dc2626] transition-colors">
            Products
          </a>
          <a href="#" className="text-[#7c2d12] hover:text-[#dc2626] transition-colors">
            Settings
          </a>
        </div>
      </div>
    </div>
  </nav>

  <div className="max-w-7xl mx-auto px-6 py-12">
    {/* Welcome banner with organic shape */}
    <div className="bg-white rounded-3xl p-8 mb-8 shadow-lg stagger-1" style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', border: '3px solid #dc2626' }}>
      <h2 className="text-4xl font-black text-[#dc2626] mb-2">
        Good morning! ☀️
      </h2>
      <p className="text-[#7c2d12] text-lg">
        Your marketplace is thriving. Here's what's happening today.
      </p>
    </div>

    {/* Stat cards with playful shadows */}
    <div className="grid grid-cols-3 gap-6">
      {[
        { icon: '💰', label: 'Total Revenue', value: '$45,231', bg: '#fee2e2' },
        { icon: '👥', label: 'Active Users', value: '2,847', bg: '#fef3c7' },
        { icon: '📦', label: 'Products Sold', value: '1,293', bg: '#dbeafe' },
      ].map((card, i) => (
        <div
          key={i}
          className={`p-8 rounded-2xl shadow-[8px_8px_0_0_#7c2d12] hover:shadow-[12px_12px_0_0_#7c2d12] hover:-translate-x-1 hover:-translate-y-1 transition-all stagger-${i + 2}`}
          style={{ backgroundColor: card.bg }}
        >
          <div className="text-5xl mb-4">{card.icon}</div>
          <div className="text-sm font-bold text-[#7c2d12] mb-1">{card.label}</div>
          <div className="text-3xl font-black text-[#dc2626]">{card.value}</div>
        </div>
      ))}
    </div>
  </div>
</div>
```

### Product Cards

**Variants:**

1. **Neon Hover Effect:**
```tsx
<div className="group relative bg-[#12121a] border border-[#00ff9d33] p-6 cursor-pointer overflow-hidden">
  {/* Glow on hover */}
  <div className="absolute inset-0 bg-gradient-to-br from-[#00ff9d22] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

  <div className="relative z-10">
    <div className="flex items-start justify-between mb-4">
      <h3 className="text-xl font-bold text-white group-hover:text-[#00ff9d] transition-colors">
        Premium SaaS Kit
      </h3>
      <span className="px-3 py-1 bg-[#00ff9d] text-black text-xs font-bold">
        LIVE
      </span>
    </div>

    <p className="text-gray-400 text-sm mb-6">
      Complete toolkit for building and scaling SaaS products
    </p>

    <div className="flex items-center justify-between">
      <div>
        <div className="text-2xl font-bold text-[#00ff9d]">$49.99</div>
        <div className="text-xs text-gray-500">per month</div>
      </div>

      <button className="px-4 py-2 border border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d] hover:text-black transition-colors text-sm font-bold">
        VIEW →
      </button>
    </div>
  </div>

  {/* Animated border */}
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00ff9d] to-transparent animate-[shimmer_2s_infinite]" />
  </div>
</div>
```

2. **Brutalist Card:**
```tsx
<div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0_0_#000] hover:shadow-[8px_8px_0_0_#ff0000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer">
  <div className="flex items-start justify-between mb-4">
    <div className="w-16 h-16 bg-black flex items-center justify-center text-white text-2xl font-black">
      📦
    </div>
    <div className="px-3 py-1 bg-[#ff0000] text-white text-xs font-black">
      HOT
    </div>
  </div>

  <h3 className="text-2xl font-black mb-2" style={{ fontFamily: 'Archivo Black' }}>
    STARTER KIT
  </h3>

  <p className="text-sm mb-6 font-bold">
    Everything you need to launch your digital product business today.
  </p>

  <div className="flex items-center justify-between">
    <div>
      <div className="text-3xl font-black">$29</div>
      <div className="text-xs font-bold text-gray-600">ONE-TIME</div>
    </div>

    <button className="px-6 py-3 bg-black text-white font-black hover:bg-[#ff0000] transition-colors">
      BUY →
    </button>
  </div>
</div>
```

## Page-Specific Designs

### Login/Auth Pages

**Cyberpunk Login:**
```tsx
<div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden">
  {/* Animated background */}
  <div className="absolute inset-0">
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00ff9d] rounded-full blur-[120px] opacity-20 animate-pulse" />
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ff006e] rounded-full blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
  </div>

  <div className="relative z-10 w-full max-w-md px-6">
    <div className="bg-[#12121a] border border-[#00ff9d] p-8 backdrop-blur-sm">
      <div className="mb-8 stagger-1">
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Sora' }}>
          Access Terminal
        </h1>
        <p className="text-gray-400 text-sm font-mono">
          {'>'} Enter credentials to continue_
        </p>
      </div>

      <form className="space-y-6">
        <div className="stagger-2">
          <label className="block text-[#00ff9d] text-sm font-mono mb-2">
            EMAIL_ADDRESS
          </label>
          <input
            type="email"
            className="w-full bg-[#0a0a0f] border border-[#00ff9d33] px-4 py-3 text-white focus:border-[#00ff9d] focus:outline-none font-mono"
            placeholder="user@whop.com"
          />
        </div>

        <div className="stagger-3">
          <label className="block text-[#00ff9d] text-sm font-mono mb-2">
            PASSWORD
          </label>
          <input
            type="password"
            className="w-full bg-[#0a0a0f] border border-[#00ff9d33] px-4 py-3 text-white focus:border-[#00ff9d] focus:outline-none font-mono"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#00ff9d] text-black py-3 font-bold hover:shadow-[0_0_20px_#00ff9d] transition-shadow stagger-4"
        >
          [AUTHENTICATE]
        </button>
      </form>

      <div className="mt-6 text-center text-sm stagger-5">
        <a href="#" className="text-gray-400 hover:text-[#00ff9d] transition-colors">
          Forgot password? →
        </a>
      </div>
    </div>
  </div>
</div>
```

## Implementation Strategy

When building UI designs:

1. **Choose a Theme** - Select one aesthetic and commit to it fully
2. **Pick Distinctive Fonts** - Use Google Fonts or system fonts, but avoid common ones
3. **Create CSS Variables** - Define theme in globals.css using @theme
4. **Build Components** - Create reusable components with the chosen aesthetic
5. **Add Micro-Interactions** - Use CSS animations for delight moments
6. **Test Contrast** - Ensure accessibility while maintaining visual impact

## Font Import Examples

Add to `app/layout.tsx`:

```tsx
import { Sora, JetBrains_Mono, Outfit, Archivo_Black, Work_Sans } from 'next/font/google';

const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const archivo = Archivo_Black({ subsets: ['latin'], weight: '400', variable: '--font-archivo' });
const work = Work_Sans({ subsets: ['latin'], variable: '--font-work' });

// In HTML:
<html className={`${sora.variable} ${jetbrains.variable} ${outfit.variable} ${archivo.variable} ${work.variable}`}>
```

## Current Codebase Context

**Existing Features:**
- Multi-tenant SaaS platform (B2B dashboard + B2C experiences)
- Stripe Connect payments
- Whop SDK integration
- License key validation
- Webhook system with Bull queues

**Pages to Design:**
1. Landing page (app/page.tsx) - Currently generic
2. Dashboard (app/dashboard/[companyId]/page.tsx) - Basic stats layout
3. Products page (app/dashboard/[companyId]/products/page.tsx)
4. Settings page (app/dashboard/[companyId]/settings/page.tsx)
5. Experience page (app/experiences/[experienceId]/page.tsx) - B2C user view
6. Login/Register pages (need to create)
7. Checkout flow (need to create)

**Design Requirements:**
- Must work with Tailwind v4 (configured in globals.css)
- TypeScript strict mode (no `any` types)
- Server components by default (Next.js 15)
- Responsive design (mobile-first)
- Dark mode support optional but encouraged

## Usage

To use this skill, specify:
1. Which page/component to design
2. Preferred aesthetic (or request a creative choice)
3. Any specific functionality requirements

Example:
```
Build a landing page with a cyberpunk/neon aesthetic that showcases:
- Hero section with CTA
- Feature grid (3 columns)
- Pricing cards
- Footer with links
```

The skill will generate complete, production-ready components with:
- Full TypeScript types
- Responsive design
- CSS animations
- Distinctive typography
- Creative color schemes
- No generic "AI slop" aesthetics
