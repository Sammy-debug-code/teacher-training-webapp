# Technical design — Bethel Teacher Training

Version 0.1 · 8 November 2026 · Owner: Sam Sanderson · Built with Claude

The app delivers short, interactive training modules to about 50 teachers at Bethel Mission School, on their phones. This document is the build plan: what the pieces are, what data we keep, and what each screen does. The *content* of Module 1 lives in the outline doc; this is the machinery.

## 1. Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Web app | Next.js 16 (App Router, TypeScript), Tailwind 4 | Same stack as the school website; one thing to learn |
| Hosting | Vercel, free tier | Auto-deploys from GitHub; `*.vercel.app` URL for now |
| Database + API | Supabase (Postgres), project `teacher-training-webapp`, Mumbai | Plain SQL, free tier, easy to inspect |
| Login | Username + 4-digit PIN, checked on the server, signed cookie | No emails, no password resets; Sam issues credentials |
| Content | JSON files in `content/`, versioned with the code | One module, one author; a CMS can come later |
| Fonts + colours | Bethel Design System tokens, fonts self-hosted in `public/fonts` | No Google Fonts calls; works on weak connections |
| Install | PWA manifest + icon | "Add to home screen", opens like an app |

## 2. Roles

- **Teacher** — logs in, takes sessions, earns coins, writes reflections. Sees only their own data.
- **Admin** (Sam) — everything a teacher sees, plus the admin dashboard: all teachers' progress, reflections, scenario choices, metrics. Can create teachers and reset PINs.

Admin is a flag on the teacher row, not a separate login system.

## 3. Data model (Supabase tables)

All tables live in the `public` schema with Row Level Security on. The browser never talks to the database directly with a teacher's identity; all reads and writes go through Next.js server code using the service-role key, after the signed cookie has been verified. This keeps the PIN scheme simple and the data private.

```
teachers
  id            uuid pk
  username      text unique        -- e.g. "priya.k" (lowercase, issued by Sam)
  display_name  text               -- "Priya Kumari"
  pin_hash      text               -- bcrypt of the 4-digit PIN
  section       text               -- 'junior' | 'senior'
  is_admin      bool default false
  is_active     bool default true
  created_at    timestamptz

module_progress            -- one row per teacher per module
  teacher_id    uuid fk
  module_id     text               -- 'm1-handling-children'
  started_at    timestamptz
  completed_at  timestamptz null
  current_day   int                -- which day of the 16-day rhythm they are on
  unlocked_until int               -- highest session number unlocked
  primary key (teacher_id, module_id)

card_events                -- append-only log of everything a teacher does
  id            bigserial pk
  teacher_id    uuid fk
  module_id     text
  session_id    text               -- 's1' … 's8', or 'd2' for a between-day
  card_id       text               -- 'a-choice-1'
  event_type    text               -- 'viewed' | 'chose' | 'rewound' | 'completed' | 'answered'
  payload       jsonb              -- { choice: 'c', attempt: 1 } etc.
  created_at    timestamptz

reflections                -- free-text answers, shown to Sam
  id            bigserial pk
  teacher_id    uuid fk
  module_id     text
  session_id    text
  prompt_id     text
  text          text
  created_at    timestamptz

coin_ledger                -- every coin change, so balances can be rebuilt
  id            bigserial pk
  teacher_id    uuid fk
  delta         int                -- +10, +50, -120
  reason        text               -- 'card' | 'session_bonus' | 'streak' | 'missed_day' | 'admin'
  ref           text null          -- card/session id
  created_at    timestamptz

daily_visits               -- one row per teacher per calendar day they opened the app
  teacher_id    uuid fk
  visit_date    date               -- in Asia/Kolkata
  primary key (teacher_id, visit_date)

holidays                   -- days that do not break a streak
  day           date pk
  label         text
```

Derived values (coin balance, current streak) are computed from `coin_ledger` and `daily_visits`, never stored separately, so they cannot drift.

## 4. Coins and streaks — the rules

- **Coins**: +10 for each card completed, +50 for finishing a session. Rewinding a scenario costs nothing; learning from a wrong choice is the point.
- **Streak**: counts consecutive calendar days (Asia/Kolkata) with a visit. Sundays and rows in `holidays` never break it and do not need a visit.
- **Missed day**: when a teacher opens the app after a missed working day, a `missed_day` entry of −50% of the current balance is written once, and a card explains it. The streak restarts at 1.
- **Unlocks**: one session per day. Session N+1 opens the calendar day after Session N is completed, never the same day. Eight sessions take eight school days (Sundays and holidays off). Each session from 2 onward opens with a one-card check-in on the previous task.
- **Leaderboard**: optional, per section, top five only, by coin balance. Off by default until the pilot says otherwise.

## 5. Content format

Each module is a folder:

```
content/
  m1-handling-children/
    module.json          -- id, title, sessions in order, section variants
    s1.json … s8.json    -- cards for each session
    between.json         -- nuggets + check-in prompts for the in-between days
```

A session is an ordered list of cards. Every card has an `id`, a `type`, and text fields that hold English, with optional Hindi (`en` / `hi`). The player shows `en` and offers a "हिंदी" tap wherever `hi` exists.

```json
{ "id": "a-scene-1", "type": "scene",
  "image": "class9-board.svg",
  "text": { "en": "Class 9. You are explaining a problem on the board…",
            "hi": "Class 9. Aap board par ek sawaal samjha rahe hain…" },
  "prompt": { "en": "What do you do?" } }

{ "id": "a-choice-1", "type": "choice", "scene": "a-scene-1",
  "options": [
    { "key": "a", "text": { "en": "“Rahul, stand up…”" }, "next": "a-cons-1a", "rung": 5 },
    { "key": "c", "text": { "en": "Keep teaching, walk toward the back row…" }, "next": "a-cons-1c", "rung": 2 }
  ] }

{ "id": "a-cons-1a", "type": "consequence", "outcome": "rewind",
  "text": { "en": "He says “Nothing, sir.” Two more boys laugh…" }, "back_to": "a-choice-1" }
```

Card types for Module 1: `scene`, `choice`, `consequence`, `why`, `nugget`, `reflection`, `grid` (sort statements into a 2×2), `yesno` (four-question test), `tiles` (build from tiles), `task` (classroom task for the week), `checkin` (between-day prompt), `complete`.

Section variants: a card may carry `"section": "junior" | "senior"`; the player skips cards for the other section. Everything without the field is shown to both.

## 6. Screens

| # | Screen | Route | What it does |
| --- | --- | --- | --- |
| 1 | Login | `/login` | Username + PIN keypad. Error text in words. Remembers the device for 30 days. |
| 2 | Home | `/` | Plum app bar with seal. Greeting, coin balance, streak flame, today's card: "Session 3 is ready" or "Today's nugget + check-in". Progress bar across 8 sessions. |
| 3 | Session player | `/m/[module]/[session]` | One card at a time, full-screen, swipe/tap. Language tap top-right. Progress dots. Auto-saves position. |
| 4 | How this works | `/start` | Shown once before Session 1: one a day, the task, coins and streak, no lecture. |
| 5 | Session complete | inside player | Coins earned, the classroom task restated, "See you day after tomorrow". |
| 6 | My notebook | `/notebook` | The teacher's own reflections and tasks, by session. |
| 7 | Missed-day card | inside Home | Shown once: what was lost, streak restarted, kind tone. |
| 8 | Admin: teachers | `/admin` | Table of all teachers: section, session reached, streak, coins, last seen. Add teacher, reset PIN, deactivate. |
| 9 | Admin: reflections | `/admin/reflections` | All reflections, newest first, filter by session/teacher. |
| 10 | Admin: metrics | `/admin/metrics` | First-attempt choices by rung per session; confidence ratings S1 vs S8; completion funnel. |
| 11 | Settings | `/settings` | Change language default, log out. |

## 7. Security notes

- PINs are stored as bcrypt hashes. Five wrong attempts lock the account for 15 minutes.
- The session cookie is signed (HMAC) with `SESSION_SECRET`, HttpOnly, Secure, 30 days.
- `SUPABASE_SERVICE_ROLE_KEY` and `SESSION_SECRET` exist only as Vercel environment variables (and in Sam's local `.env.local`, which git ignores). The browser only ever receives the publishable key, and even that is unused in v1 because all data access is server-side.
- Reflections are personal: only the teacher and the admin see them. The pilot should tell teachers this plainly in Session 1.

## 8. Build order

1. Brand shell: fonts, tokens, app bar, login screen (static).
2. Schema migration + PIN login working end to end.
3. Content engine + Session 1 fully playable.
4. Coins, streaks, unlock rhythm, Home screen.
5. Deploy to Vercel; Sam logs in on his phone.
6. Sessions 2–8 authored; admin pages; pilot.
