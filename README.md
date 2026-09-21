# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## Deploying the September 2026 changes

**1. Rotate secrets first.** `.env` used to be committed (it held `SUPABASE_DB_PASSWORD`). It is now git-ignored; rotate the DB password in Supabase and use `.env.example` as the template.

**2. Apply the migration:** `supabase db push` (file: `supabase/migrations/20260921000000_security_hardening_and_funnel.sql`).
Watch the output for the two `NOTICE`s about unique indexes (`uq_consultation_slot`, `uq_waitlist_email`): if duplicates already exist the index is skipped — de-duplicate and re-run.

**3. Deploy edge functions** (`supabase functions deploy <name>`):
`intake-project`, `invite-client`, `send-first-response` (new) and `notify-admin`, `book-consultation`, `automated-reminders`, `anchor-event`, `delete-account`, `batch-verify`, `generate-certificate`, `generate-compliance-report` (changed).

**4. Function secrets** (`supabase secrets set …`):

| Secret | Needed for |
| --- | --- |
| `RESEND_API_KEY` | all emails (request confirmation, quote replies, booking, alerts). Without it emails are skipped; the page tells the visitor their quote will still arrive. |
| `ANTHROPIC_API_KEY` | **Optional and NOT recommended unless you want to pay for it.** Leave unset: the funnel then uses free keyword matching and a template reply draft. If you ever set it, visitors' project text is sent to Anthropic — update the privacy policy first. |
| `CRON_SECRET` | `automated-reminders` now rejects callers without `x-cron-secret`. Schedule it with pg_cron/`net.http_post` sending that header. |
| `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET` | Zoom links (booking still works without; the team is told to send a link). |
| `SITE_URL`, `ADMIN_NOTIFY_EMAIL` | optional overrides (defaults: https://teevexa.com, teevexa@gmail.com). |
| `POLYGON_RPC_URL`, `POLYGON_PRIVATE_KEY` | blockchain anchoring (still disabled until set). |

**5. Optional:** set `VITE_PLAUSIBLE_DOMAIN` to enable consent-gated analytics.

**Pricing is internal only.** Visitors never see prices: they submit a request and you email the real quote within 24 hours. `supabase/functions/_shared/estimate.ts` only produces an *internal price guide* shown to your team in admin Leads (placeholder numbers — tune freely).

`npm run build` regenerates `public/sitemap.xml` (static routes + published posts, case studies and jobs).
