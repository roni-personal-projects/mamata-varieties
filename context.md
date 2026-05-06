# Mamta Varieties — Project Context & Documentation

## 1. Brand Identity
**Brand Name:** Mamta Varieties
**One-Line Purpose:** A premium lifestyle retail destination in Yavatmal, offering curated style essentials like sunglasses, watches, perfumes, and accessories since 2000.
**Design Aesthetic:** **Brutalist Signal (Preset C)** — Raw precision, high information density, and industrial elegance.
- **Palette:** Paper (`#E8E4DD`), Celestial Blue (`#38B6E8` - Accent), Off-white (`#F5F3EE`), Black (`#111111`).
- **Typography:** Space Grotesk (Bold Sans) + DM Serif Display (Drama Italic) + Space Mono (Data).

## 2. Technology Stack
- **Core:** React 19, Vite
- **Styling:** Tailwind CSS v3.4.17
- **Animations:** GSAP 3 (ScrollTrigger, Context API)
- **Icons:** Lucide React
- **Hosting:** Optimized for production builds (`npm run build`)

## 3. Component Architecture
### A. Navbar ("The Floating Island")
- **Pill Shape:** Fixed centered container.
- **Responsive Logic:** Switches from Hero-integrated (transparent) to Floating Pill (glassmorphism) on scroll.
- **Tablet Fix:** Breakpoint increased to `lg` to ensure the menu doesn't overcrowd on mid-sized screens.

### B. Hero Section ("The Opening Shot")
- **Headline:** "The Finest Essentials." (Sans bold + massive Serif Italic).
- **Responsive Imagery:** 
  - **Desktop:** High-end sunglasses (`photo-1572635196237-14b3f281503f`).
  - **Mobile:** Vertical premium watch shot (`photo-1523275335684-37898b6baf30`).
- **GSAP Entrances:** Staggered fade-up for text and CTA.

### C. Features ("Interactive Artifacts")
- **Diagnostic Shuffler:** Cards cycling with a spring-bounce transition.
- **Telemetry Typewriter:** Monospace live-text feed about quality and pricing.
- **Cursor Protocol Scheduler:** Weekly grid with animated status indicator.

### D. Store Experience ("The physical Sanctuary")
- **Layout:** High-impact service cards (Eyewear Fitting, Style Specialists).
- **Image:** Boutique flat-lay (`/summer_essentials_flatlay.png`).
- **Optimization:** Balanced padding and heights for mobile (`py-12`, `h-250px`).

### E. Connect & Locate
- **Dynamic Status Component:**
  - Real-time opening/closing logic.
  - Special Tuesday schedule (10:00 AM - 4:00 PM).
  - High-urgency "Closes In" countdown timer (e.g., "IN 2h 15m") in Signal Red.
- **Integrated Map:** Google Maps embed with custom rounded styling.
- **Contact Cards:** WhatsApp and Voice links with interactive magnetic buttons.

### F. Footer
- **Layout:** 4-column premium grid (Brand, Navigation, Contact, Hours).
- **Status Indicator:** System operational heartbeat.

## 4. Key Implementation Log (Recent Changes)
- **Responsive Optimization:** Comprehensive pass for Mobile, Tablet, and Desktop.
- **Bug Fix:** Resolved "Identifier already declared" error by removing duplicate components.
- **Accessibility:** Improved color contrast for WhatsApp/Voice links.
- **Performance:** Implemented `<picture>` tag for native mobile/desktop image switching.

## 5. Future Roadmap
- [ ] **Lazy Loading:** Implement lazy-loading for the Google Maps iframe to improve initial page load.
- [ ] **Contact Integration:** Replace placeholder WhatsApp and phone links with actual business numbers.
- [ ] **Deployment:** Ready for static hosting on Vercel/Netlify.
