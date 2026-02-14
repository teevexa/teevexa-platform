
# TEEVEXA Corporate Website — Phase 1 Plan

## Overview
Build the core pages of TEEVEXA's corporate website with a premium dark-themed design, the brand color palette, and a Lovable Cloud backend for form submissions. This phase delivers the essential marketing pages and the multi-step project inquiry form.

**Note:** Built with React + Vite + React Router (Lovable's stack). CSS/Tailwind animations will be used for smooth transitions, glows, and reveals instead of Framer Motion.

---

## 1. Theme & Design System Setup
- Configure Tailwind with the TEEVEXA brand palette (Deep Teal #0F2A32, Cyan #1FA2C9, Electric Blue #2BB6E3, Steel Blue #5DA8C0, Charcoal #0B1418, Light #E6F4F8)
- Dark theme as default
- Custom glow effects, gradient utilities, and glassmorphism classes
- Professional typography with clean spacing

## 2. Global Layout
- **Sticky glassmorphism navbar** with logo, navigation links, animated underline hovers, and active route highlighting
- **Footer** with company info, social links, quick links, newsletter signup placeholder, and legal links
- Smooth scroll behavior and page transition animations

## 3. Home Page (/)
- **Hero:** Gradient background with animated network/connection pattern, headline "Building Digital Infrastructure for Africa's Future", two CTA buttons (Start a Project, Book Consultation)
- **Who We Are:** Mission, Vision, and Core Values grid (Integrity, Innovation, Empowerment, Sustainability, Transparency) with hover animations
- **What We Do:** Card grid for each service (icon, title, bullet points, Learn More link)
- **Industries:** Animated cards linking to industry pages (Agriculture, Export & Trade, Logistics, NGOs, SMEs)
- **Why Choose Teevexa:** Icon grid (Immutable systems, Scalable architecture, African-first, Secure infrastructure)
- **Portfolio Preview:** 3 featured case study cards with dark overlay hover
- **Teevexa Trace Teaser:** Blockchain traceability vision section with Join Waitlist button
- **Final CTA:** "Build With Confidence" section

## 4. About Page (/about)
- Company story, leadership team placeholders, timeline/milestones, and expanded mission/vision/values

## 5. Services Overview (/services)
- Grid of all services with links to individual service pages

## 6. Individual Service Pages (/services/web-development, etc.)
- Hero with gradient, service overview (Problem → Gap → Approach), feature list, development process timeline (Discovery → Deployment → Support), tech stack icons, and CTA

## 7. Contact Page (/contact)
- Contact form (name, email, subject, message), company address/email/phone, embedded map placeholder, and social links

## 8. Start a Project — Multi-Step Form (/start-project)
- **Step 1:** Identity (name, email, phone, company, country)
- **Step 2:** Project type radio cards (Website, Mobile, E-Commerce, Enterprise, Custom)
- **Step 3:** Dynamic feature checkboxes based on project type
- **Step 4:** Budget dropdown, timeline, urgency selector
- **Step 5:** File upload area (drag & drop UI)
- Zod validation on each step, animated step transitions, success confirmation screen
- **Backend:** Lovable Cloud database table to store submissions

## 9. Book Consultation Page (/book-consultation)
- Calendar-style UI for date selection, timezone display, time slot picker, meeting type selection (Zoom/Google Meet), and confirmation screen
- Submissions stored in database

## 10. Remaining Placeholder Pages
- Industries pages (/industries, /industries/agriculture, etc.) — basic hero + content layout
- Portfolio page (/portfolio) with grid layout and filter UI, case study detail template
- Insights/Blog page (/insights) with article grid and detail template
- Teevexa Trace page (/teevexa-trace) — product teaser with waitlist signup
- Legal pages (Privacy Policy, Terms of Service)
- Client Portal — sidebar layout mockup with Dashboard, Projects, Files, Messages, Invoices, Settings pages using placeholder data and charts

## 11. Backend (Lovable Cloud)
- Database tables for: project inquiries, consultation bookings, contact form submissions, newsletter signups
- Edge function for form submission handling

---

## What's Included
- All routing set up with React Router
- Fully responsive, mobile-first design
- Accessibility: high contrast, keyboard navigation, ARIA labels
- Reusable component library (cards, buttons, forms, section layouts)
- Sample/placeholder data throughout
- Clean, production-ready code structure
