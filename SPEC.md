# Urban — HR Onboarding Dashboard — Spec

**Company:** Urban (tech company)
**Audience:** HR / People team
**Status:** v1 built; data read from a CSV file (mock data), which the Download CSV button saves · spec last updated 2026-09-19
**Language:** English

## 1. Purpose

Show, at a glance, **how many new employees joined the company each week**, and where they landed (department), so HR can spot hiring waves and plan onboarding capacity.

The main question the dashboard answers: *"How many people did we onboard this week, and is that more or less than usual?"*

**Definition of a "new hire":** a **full-time employee**, counted in the week of their **start date** (weeks run Monday–Sunday). Contractors and interns are not counted.

## 2. Scope

**In scope**
- One dashboard page that works on **desktop and mobile** (responsive web app; installable as a PWA so it feels like an app on a phone).
- **Company-wide view only** (no per-site or per-team filter).
- Data is read from a **CSV file**, `data/employees.csv` (§6.2). It holds mock data for now; real data can replace it later. No backend, no login.
- A **Download CSV button** that saves the mock data as a CSV file to the user's computer (§4.6).
- Urban branding: logo and company name in the header (§5.4).
- Read-only: choose a time range and explore, no editing.

**Out of scope (v1)**
- Real HR system integration (Workday, BambooHR, etc.)
- Uploading or picking a CSV from the page (the file is part of the site; the button only **downloads**)
- Choosing what goes into the download (it is always the whole mock data file: no filters, no per-range export)
- Per-site or per-team filters
- Authentication / roles
- Native iOS / Android store apps
- Exporting, notifications, editing employee records

## 3. Users & key tasks

| User | Task |
|---|---|
| HR manager | See this week's new-hire count and the trend |
| Onboarding coordinator | See who is joining and their onboarding progress |
| Head of People | Compare departments and time ranges |

## 4. Dashboard content

### 4.1 Header
- Brand block: **Urban logo + the name "Urban"**, with a small pink tag "People team dashboard" under the name
- Title: **"New Hires Onboarding"**
- Subtitle: date range shown, e.g. "Jun 29 – Sep 20, 2026"
- Time-range buttons (big, segmented): **4 weeks · 8 weeks · 12 weeks** (default: 12)
- **Download CSV** button under the range buttons (§4.6)

### 4.2 KPI cards (3)
| Card | Value | Detail line |
|---|---|---|
| **New hires this week** | count for the latest week (hero card, largest) | change vs. last week, e.g. "▲ 8% vs last week" |
| **Last 4 weeks** | total for the latest 4 weeks | change vs. the 4 weeks before |
| **Weekly average** | mean per week over the selected range | "Best week: 18 (W36)" |

### 4.3 Weekly new hires chart (main visual)
- **Bar chart**, one bar per week, x-axis = week label (`W27` … `W38`, with the Monday date on hover/tap).
- Each bar shows its value label on top (big, dark).
- Latest week's bar is highlighted in the brightest pink; other bars in purple.
- Tap/hover on a bar → tooltip with week dates, total, and the per-department split.
- On mobile: show every 2nd x-axis label if space is tight, but keep all bars and all value labels.

### 4.4 Hires by department
- **Horizontal bars** (one per department) for the selected range, sorted high → low. An **Other** row appears only if the CSV has a department name that is not one of the six.
- Each row: department name, bar, count, and % of total.

### 4.5 Recent joiners list
- The 8 most recent starters: name, role, department, start date, onboarding progress bar (0–100 %), status chip (**Pre-boarding / In progress / Completed**).
- Desktop: table. Mobile: stacked cards.

### 4.6 Download CSV

Purpose: let the user take the mock data away as a CSV file (for example to open it in Excel or to see the format the dashboard reads).

- **Download CSV** is a big pink button (with a download icon) under the range buttons.
- Pressing it saves the file **`urban-employees-mock.csv`** to the user's computer.
- The file is **exactly** `data/employees.csv` (§6.2): the header row plus 140 employee rows (136 full-time, 4 contractors or interns). It does not change with the 4 / 8 / 12-week buttons.
- It is a normal link with the `download` attribute pointing at `data/employees.csv`, so it needs no script, and it works whenever the page can reach the file.
- Nothing is uploaded, and nothing changes on the page when it is pressed.

## 5. Visual design

**Mood:** bright, friendly, energetic, "tech-startup" — lots of purple and pink.

### 5.1 Color palette

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#1E0B36` | **All text** (very dark purple) |
| `--bg` | `#FBF5FF` | Page background |
| `--card` | `#FFFFFF` | Card surface |
| `--violet-100` | `#F0E1FF` | Soft fills, table stripes |
| `--violet-300` | `#C9A0FF` | Secondary buttons, chart series |
| `--violet-400` | `#B47CFF` | Primary buttons, bars |
| `--violet-500` | `#9B5CFF` | Bars, borders, icons (not for text backgrounds) |
| `--violet-700` | `#6A1FD0` | Chart series, accents (fills only) |
| `--pink-100` | `#FFE0F1` | Soft fills, highlights |
| `--pink-300` | `#FFA6DA` | Secondary buttons, chart series |
| `--pink-400` | `#FF7AC6` | Primary buttons, active state |
| `--pink-500` | `#FF4DAF` | Highlight bar (latest week), hero card |
| `--magenta-600` | `#D6187F` | Chart series, accents (fills only) |

**Rules**
- Text is **always `--ink`** — never white or gray. Text sits only on `--bg`, `--card`, or the light/mid fills marked above for buttons and cards.
- Contrast of `--ink` on fills (WCAG): on `--card` 18.2:1, on `--violet-400` 6.3:1, on `--pink-400` 7.7:1, on `--pink-500` 6.0:1. All pass AA for large and normal text. Do **not** put text on `--violet-500`, `--violet-700` or `--magenta-600`.
- Cards get a soft purple gradient or tinted shadow; hero card uses a pink→violet gradient with `--ink` text.
- Purple and pink chart series are close in hue, so **never rely on color alone**: always show labels and values next to bars.

### 5.2 Typography
- Font: **Poppins** (Google Fonts; weights 500, 700, 800), fallback `system-ui, sans-serif`.
- Color: `--ink`.

| Element | Mobile | Desktop |
|---|---|---|
| Page title | 32 px / 800 | 44 px / 800 |
| KPI number (hero) | 64 px / 800 | 88 px / 800 |
| KPI number (other) | 48 px / 800 | 56 px / 800 |
| Section heading | 24 px / 700 | 30 px / 700 |
| Body / labels / chart labels | 18 px / 500 | 20 px / 500 |
| Minimum text size anywhere | 16 px | 16 px |

### 5.3 Buttons & controls
- **Big**: minimum height **56 px** (64 px on desktop), minimum tap target 48 × 48 px, pill shape (`border-radius: 999px`), 3 px `--ink` outline is optional but consistent.
- Font 20 px / 700, `--ink` text (18 px on phones narrower than 480 px so "12 weeks" stays on one line).
- Default: `--violet-300` fill. **Selected**: `--pink-400` fill with a slightly raised shadow.
- Hover/press: lift 2 px, brighten fill; visible focus ring (4 px `--violet-700`).
- Time-range buttons are full-width segmented on mobile, inline on desktop.
- **Download CSV** uses the same big pill style (56 / 64 px tall, 20 px text, `--ink` outline and text) in `--pink-300` (hover `--pink-400`). Full width on phones; on desktop it sits under the range buttons, right-aligned.

### 5.4 Branding (Urban)
- **Logo:** a rounded square with the pink→violet gradient, a dark **"U"** and a small dot above its right stem (a new arrival). File: `icons/icon.svg`.
- Shown at 56 px (mobile) / 64 px (desktop) in the header, next to the name **Urban** (28 / 32 px, weight 800).
- The same file is the browser-tab icon and the home-screen (PWA) icon.
- The logo is a **placeholder designed for this dashboard**. To use Urban's official logo, replace `icons/icon.svg` (keep the same file name) and no code changes are needed.
- Page title: "Urban New Hires Onboarding". App name on a phone's home screen: "Urban Hires".

### 5.5 Layout

**Desktop (≥ 1024 px)** — max content width 1280 px, 24 px gaps
```
[ Urban logo + name, title, date range      Range buttons ]
[ KPI hero (2 cols) ][ KPI 4-week ][ KPI average          ]
[ Weekly bar chart (2/3 width) ][ Departments (1/3 width) ]
[ Recent joiners table (full width)                       ]
```

**Tablet (640–1023 px)** — hero KPI on its own full-width row, the other two KPIs side by side; chart and departments stacked; recent joiners as two-column cards.

**Mobile (< 640 px)** — single column, 16 px side gutters, no horizontal page scroll:
1. Urban logo + name, title, range buttons
2. Hero KPI, then the two other KPIs
3. Weekly chart
4. Departments
5. Recent joiners as cards

## 6. Data

### 6.1 Mock data (v1)

The mock data is a CSV file, `data/employees.csv` (format in §6.2). It has **140 rows**: 136 fictional full-time employees, plus 4 contractors and interns who must be **ignored** (to prove that only full-time employees are counted). The dashboard computes the numbers below from that file.

Weeks start on Monday; `W38` is the current week (Sep 14–20, 2026). Departments: Engineering (Eng), Product & Design (P&D), Sales, Marketing (Mkt), Customer Success (CS), G&A.

| Week | Starts | Eng | P&D | Sales | Mkt | CS | G&A | **Total** |
|---|---|---|---|---|---|---|---|---|
| W27 | Jun 29 | 3 | 1 | 1 | 0 | 1 | 0 | **6** |
| W28 | Jul 6 | 4 | 1 | 2 | 1 | 1 | 0 | **9** |
| W29 | Jul 13 | 3 | 1 | 1 | 1 | 0 | 1 | **7** |
| W30 | Jul 20 | 5 | 2 | 2 | 1 | 1 | 0 | **11** |
| W31 | Jul 27 | 3 | 1 | 2 | 1 | 1 | 0 | **8** |
| W32 | Aug 3 | 6 | 2 | 3 | 1 | 1 | 1 | **14** |
| W33 | Aug 10 | 5 | 2 | 2 | 1 | 1 | 1 | **12** |
| W34 | Aug 17 | 4 | 1 | 2 | 1 | 1 | 0 | **9** |
| W35 | Aug 24 | 6 | 3 | 3 | 1 | 1 | 1 | **15** |
| W36 | Aug 31 | 8 | 3 | 3 | 2 | 1 | 1 | **18** |
| W37 | Sep 7 | 5 | 2 | 3 | 1 | 1 | 1 | **13** |
| W38 | Sep 14 | 6 | 2 | 3 | 1 | 1 | 1 | **14** |
| **12-wk total** | | 58 | 21 | 27 | 12 | 11 | 7 | **136** |

**Derived numbers the UI must show for the default 12-week view**
- New hires this week: **14** (▲ 8% vs. W37's 13)
- Last 4 weeks (W35–W38): **60**, vs. 43 in W31–W34 (▲ 40%)
- Weekly average: **11.3**; best week: **18** (W36)

**Recent joiners the UI must show** (fictional people; the contractor who started Sep 16 and the intern who started Sep 17 are correctly left out)

| Name | Role | Dept | Start | Progress | Status |
|---|---|---|---|---|---|
| Yonatan Biton | Recruiter | G&A | Sep 18 | 0 % | Pre-boarding |
| Or Gabay | Growth Marketer | Marketing | Sep 17 | 7 % | In progress |
| Lihi Uzan | Solutions Engineer | Sales | Sep 16 | 15 % | In progress |
| Lena Sasson | Solutions Engineer | Sales | Sep 16 | 14 % | In progress |
| Shahar Uzan | DevOps Engineer | Engineering | Sep 15 | 16 % | In progress |
| Noa Mizrahi | Product Designer | Product & Design | Sep 15 | 35 % | In progress |
| Aviv Ivri | UX Researcher | Product & Design | Sep 15 | 19 % | In progress |
| Omar Haddad | Account Executive | Sales | Sep 15 | 0 % | Pre-boarding |

The UI reads the data only through `getWeeklyHires()`, so the source can be swapped without touching the rest of the UI.

### 6.2 CSV file

All numbers come from a **CSV file**, one row per employee. Today it holds the mock data; real data can replace it later (see §12 for the privacy rule).

- File: `data/employees.csv`, UTF-8, comma-separated, first row = column names, dates as `YYYY-MM-DD`.

| Column | Required | Example | Meaning |
|---|---|---|---|
| `employee_id` | yes | `U-1042` | Unique ID (kept for the future; the dashboard does not display it) |
| `full_name` | yes | `Maya Cohen` | Shown in Recent joiners |
| `role` | yes | `Backend Engineer` | Shown in Recent joiners |
| `department` | yes | `Engineering` | One of the six departments above; any other value is grouped as **Other** |
| `employment_type` | yes | `full-time` | Only `full-time` (any capitalization) is counted; every other value is ignored |
| `start_date` | yes | `2026-09-14` | Decides the week (Monday–Sunday) the person is counted in |
| `onboarding_progress` | no | `20` | 0–100, default 0; values outside the range are cut to 0 or 100 |
| `onboarding_status` | no | `in-progress` | `pre-boarding`, `in-progress` or `completed`. If empty: start date in the future → pre-boarding, progress 100 → completed, otherwise in-progress |

Rules
- The dashboard groups rows by start-date week in the browser; no other processing is needed.
- Column names are matched ignoring capitalization and extra spaces; `department` and `employment_type` values are also matched ignoring capitalization.
- The chart covers the **last 12 weeks** ending with the current week. Weeks with no hires show `0`. Rows outside those 12 weeks are not counted.
- **Current week:** the week that contains the "as of" date. For the mock file this date is frozen at **2026-09-19** (constant `AS_OF` at the top of `app.js`) so the dashboard looks the same whenever it is opened. Set `AS_OF` to `null` to use today's date, which is what real data needs.
- Rows with a start date after the current week are not counted yet.
- **Recent joiners** = the 8 full-time employees with the latest start date up to the end of the current week; people with the same start date keep their order in the file.
- A row with a missing or invalid `start_date` is skipped and reported in the browser console, with its row number.
- Reading a CSV needs the page to be served over http(s) (GitHub Pages or `python3 -m http.server`). A page opened straight from disk cannot read files, so it shows a pink message that says what to do.
- **Privacy:** a real employee CSV must **not** be committed to a public GitHub repo. Keep it out of git (`.gitignore`) or use a private repo. The CSV in this repo is fictional.

Example
```csv
employee_id,full_name,role,department,employment_type,start_date,onboarding_progress,onboarding_status
U-1042,Maya Cohen,Backend Engineer,Engineering,full-time,2026-09-14,20,in-progress
U-1043,Omar Haddad,Account Executive,Sales,full-time,2026-09-15,0,pre-boarding
U-1044,Dana Rosen,Freelance Designer,Product & Design,contractor,2026-09-14,10,in-progress
```
(The third row is ignored: not full-time.)

## 7. Behavior

- Changing the range button updates all KPIs, the chart, and the department breakdown instantly (no page reload).
- KPI "change" arrows: ▲ for increase, ▼ for decrease, ▬ for no change; always with a number and the words "vs last week / vs prior 4 weeks".
- Empty or zero weeks still render a bar slot with the label `0`.
- The CSV is loaded once when the page opens, through one function (`getWeeklyHires()`). If it cannot be loaded, a pink message explains why and what to do (§6.2).

## 8. Technical approach

- Static site, **no build step and no backend**: `index.html`, `styles.css`, `app.js`, `data/employees.csv`, `icons/icon.svg` (Urban logo).
- Charts: hand-drawn **inline SVG** (no chart library, zero dependencies).
- CSS custom properties for the palette and type scale in §5; CSS Grid for the layout, breakpoints at 640 px and 1024 px.
- PWA: `manifest.webmanifest` + simple service worker so it can be added to a phone's home screen and opened like an app.
- Supported: latest Chrome, Safari (iOS 16+), Edge, Firefox.

## 9. Accessibility

- Text contrast ≥ 4.5:1 (see §5.1).
- Every chart has a text alternative: a visually hidden table with the same weekly numbers.
- Buttons are real `<button>` elements, keyboard reachable, with visible focus.
- Respect `prefers-reduced-motion` (no animations when set).

## 10. Acceptance criteria

Checked in the browser on 2026-09-19 (v1).

- [x] Opens with the 12-week view and shows exactly the derived numbers in §6.1.
- [x] Weekly bar chart shows 12 bars with value labels; the latest week is highlighted.
- [x] 4 / 8 / 12-week buttons change every widget consistently.
- [x] All text is `#1E0B36`; body text is at least 18 px, KPI numbers at least 48 px.
- [x] All buttons are at least 56 px tall.
- [x] Layout is usable at 375 px width with no horizontal page scroll, and uses the full width nicely at 1440 px.
- [x] Purple **and** pink shades are clearly visible in cards, buttons, and charts.
- [x] Reads every number from `data/employees.csv`, with no calls to any API.
- [x] The Urban logo and name appear in the header on desktop and mobile.
- [x] Download CSV: the button points at `data/employees.csv` with the download name `urban-employees-mock.csv`; that file has the 8 columns, 140 rows (136 full-time), and is served as `text/csv`.
- [x] Download CSV: pressing it leaves the dashboard unchanged; the button is 56 px tall (64 px on desktop) and full width on a 375 px phone, with no horizontal scroll.
- [x] Download CSV: pressing it in the browser saved a file named `urban-employees-mock.csv` that is identical, byte for byte, to `data/employees.csv`.
- [x] Contractors and interns in the CSV are not counted, and do not appear in Recent joiners.
- [x] The CSV reader handles quoted commas and quotes, Windows line endings, a byte-order mark, an unknown department (goes to Other), out-of-range progress, future start dates, and bad or missing dates (row skipped and reported).
- [x] If the CSV cannot be loaded, a clear message is shown instead of a blank page.

## 11. Decisions

Confirmed 2026-09-19:

1. **Platform:** one responsive web app (PWA) for desktop and mobile. **Not native.**
2. **What counts as "added":** the employee's **start date**.
3. **Who is counted:** **full-time employees only** (no contractors or interns).
4. **Scope of the view:** **company-wide only**; no per-site or per-team filter.
5. **Data source:** a **CSV file** (format in §6.2). The mock data is also a CSV, so real data can replace it without code changes.
6. **Language:** **English** only (no Hebrew / right-to-left version).
7. **Branding:** company name **Urban**, with a logo in the header (§5.4).
8. **Delivery:** the code is committed and pushed to the GitHub repo, and the repo link is shared with the teacher (§12).
9. **CSV button direction:** the button **downloads** the mock data as a CSV file. It is not an upload button. (An Upload CSV button was built first by mistake and removed the same day.)

## 12. Delivery

- Repository: https://github.com/niritlib-debug/claude_code_nirit (**public**, so the teacher can open it without an invite)
- Live dashboard (GitHub Pages, served from the `main` branch, root folder): https://niritlib-debug.github.io/claude_code_nirit/
- Every push to `main` republishes the live dashboard automatically (about a minute).
- Only fictional data is in the repo, and it is public. **Never commit real employee data** (see §6.2); once a real CSV is used, the dashboard must be hosted somewhere private instead of on public GitHub Pages.

## 13. Next steps

1. Replace the mock CSV with real data, and set `AS_OF` to `null` in `app.js` (§6.2). Keep the real file out of public GitHub (§12).
2. Replace the placeholder logo with Urban's official logo (§5.4).
3. Before real employee data is used, decide where the dashboard is hosted privately (public GitHub Pages is only suitable for mock data).

**Open questions:** none for v1.

## 14. Change log

| Date | Change |
|---|---|
| 2026-09-19 | First spec: purpose, scope, design system, mock data. |
| 2026-09-19 | Decisions confirmed: web app (not native), start date, full-time only. Dashboard v1 built and checked. |
| 2026-09-19 | Added Urban branding and logo (§5.4), CSV data format (§6.2), delivery via GitHub (§12), company-wide scope, English only. Layout notes brought in line with the built dashboard. |
| 2026-09-19 | Repo made public and the dashboard published with GitHub Pages; live link added (§12). Checked live on desktop and mobile. |
| 2026-09-19 | Added `Practice.md`: every change is committed and pushed right away (working agreement, no change to the dashboard). |
| 2026-09-19 | Mock data moved into `data/employees.csv` (140 rows) and the dashboard now reads and parses the CSV (§6). Removed `data/mock.js`. Added the frozen "as of" date, the Other department, the load-error message, and the new Recent joiners list. Numbers are unchanged. |
| 2026-09-19 | An Upload CSV button was added, then removed the same day: the request was for a **Download** button. Added **Download CSV**, which saves the mock data as `urban-employees-mock.csv` (§4.6, §5.3). |
| 2026-09-19 | `Practice.md` changed from working instructions to a **change log**: every change is written there after each commit and push (no change to the dashboard). |
