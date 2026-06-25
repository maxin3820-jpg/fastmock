# FAST PrepPro — University Mock Test Platform

A full-stack Next.js platform for FAST University entry test aspirants.

---

## 🚀 Quick Start

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the entire contents of `supabase-schema.sql`
3. In **Authentication → Settings**, disable "Confirm email" (for instant signups)
4. Copy your Project URL, Anon Key, and Service Role Key

### 2. Configure Environment

Rename `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_EMAIL=maxin3820@gmail.com
ADMIN_PASSWORD=admin12345
ADMIN_JWT_SECRET=generate_a_random_32_char_string_here
NEXT_PUBLIC_WHATSAPP_NUMBER=923036326202
```

### 3. Run Locally

```bash
cd fast-mock-test
npm install
npm run dev
```

### 4. Deploy to Netlify

1. Push this folder to a GitHub repo
2. Connect repo to Netlify
3. Set Build command: `npm run build`
4. Set Publish directory: `.next`
5. Add all environment variables in Netlify → Site settings → Environment variables
6. Install the **@netlify/plugin-nextjs** plugin (it's already in `netlify.toml`)

---

## 📋 Admin Panel

URL: `/admin/login`

**Credentials:**
- Email: `maxin3820@gmail.com`
- Password: `admin12345`

**Features:**
- Analytics overview (users, revenue)
- User CRM — search, filter, bulk approve
- Quick grant/revoke premium access by email
- Site content editor (headline, price, WhatsApp number)
- Bulk quiz upload via Excel/CSV

---

## 📊 Quiz Upload Format

Download the sample template from the Admin Panel → Quiz Upload tab.

Required columns:
| Column | Example |
|--------|---------|
| Question | If 2x+3=7, find x |
| Option A | 1 |
| Option B | 2 |
| Option C | 3 |
| Option D | 4 |
| Correct Answer | B |
| Subject | Advanced Math |

Valid subjects: `Advanced Math`, `Basic Math`, `Analytical Reasoning`, `English`

---

## 🎯 Negative Marking

| Section | Correct | Wrong | Skipped |
|---------|---------|-------|---------|
| Advanced Math | +1 | -0.25 | 0 |
| Basic Math | +1 | -0.25 | 0 |
| Analytical Reasoning | +1 | -0.25 | 0 |
| English | +1 | -0.0825 | 0 |

---

## 🏗 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/                # Student login
│   ├── register/             # Student signup
│   ├── dashboard/            # Student dashboard
│   ├── test/[testId]/
│   │   ├── start/            # Mode selection
│   │   ├── attempt/[id]/     # Quiz engine
│   │   └── results/          # Score analytics
│   ├── admin/
│   │   ├── login/            # Admin login
│   │   └── page.tsx          # Admin dashboard
│   └── api/
│       ├── auth/signout/
│       └── admin/
│           ├── login/
│           ├── logout/
│           ├── users/
│           ├── config/
│           └── quiz/upload/
├── components/
│   ├── Navbar.tsx
│   └── LeaderboardSection.tsx
├── lib/
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   ├── admin-auth.ts
│   ├── types.ts
│   └── utils.ts
└── middleware.ts
```
