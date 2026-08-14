# Clearcheck

## What's in here
- `public/index.html` — the whole website (landing page, pricing, login flow, checker tool)
- `api/check.js` — the serverless function that safely calls the Anthropic API. This is the ONLY place your API key ever lives.

## Deploy this to Vercel (step by step)

### 1. Get an Anthropic API key
Go to https://console.anthropic.com → API Keys → Create Key. Copy it — you'll need it in step 4. Load some prepaid credit on the account so the API works (a few dollars is plenty to start testing).

### 2. Put this project on GitHub
- Create a new repo on GitHub (e.g. "clearcheck")
- Upload this whole folder to it (or use `git init`, `git add .`, `git commit -m "first version"`, `git push`)

### 3. Import into Vercel
- Go to vercel.com → Add New → Project
- Select your GitHub repo
- Leave the default settings — Vercel auto-detects this project type

### 4. Add your API key (critical step — do this before deploying)
- In the Vercel project → Settings → Environment Variables
- Add a new variable:
  - Name: `ANTHROPIC_API_KEY`
  - Value: (paste the key from step 1)
- Save, then redeploy if it already deployed once

### 5. You're live
Vercel gives you a free `.vercel.app` URL immediately. To use your own domain (e.g. clearcheck.app), go to Settings → Domains and follow the prompts once you've bought the domain from Namecheap or similar.

## What's still missing (not covered in this version)
- **Real accounts** — login/signup currently only simulates a session in the browser (resets on refresh). Next step: Supabase or Clerk.
- **Real payments** — pricing is displayed but nothing charges a card yet. Next step: Stripe (with PayPal enabled inside it).
- **Rate limiting** — nothing currently stops one person from spamming checks. Worth adding once you have real users, so nobody can run up your API bill.

## Local testing (optional)
If you want to test on your own computer before deploying:
```
npm install -g vercel
vercel dev
```
It'll ask you to log in and will pick up your env variable if you add it to a `.env.local` file locally (never commit that file — it's already in .gitignore).
