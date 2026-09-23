# Practice.md: change log

Every change made to this project, oldest first. Each entry says what changed, in which files, and how it was checked.

**How this log is kept**
- After every commit and push, a new entry is added at the bottom with the commit link.
- The entry is saved by a small follow-up commit named `Log: ...`. Those log-only commits are not logged themselves.
- Times are the computer's local time. Repository: https://github.com/niritlib-debug/claude_code_nirit · Live dashboard: https://niritlib-debug.github.io/claude_code_nirit/

---

## 2026-09-19

### 1 · 10:15 · [`a1e05df`](https://github.com/niritlib-debug/claude_code_nirit/commit/a1e05df) · Add README
- The starting point: a README with one line saying the repo is a workspace for projects built with Claude Code.
- Files: `README.md`

### 2 · 11:35 · [`1b2a987`](https://github.com/niritlib-debug/claude_code_nirit/commit/1b2a987) · Add Urban HR onboarding dashboard (v1, mock data)
The first version of the project, built in this order: the spec was written, three decisions were confirmed, the dashboard was built and checked, and the Urban logo was added.

- **Spec (`SPEC.md`):** purpose, scope, design rules, mock data, behavior, accessibility, acceptance checks, decisions, change log.
- **Decisions confirmed:** a responsive web app (PWA), **not** native; a hire is counted by **start date**; **full-time employees only**. Later in the same session: company-wide view only, English only, company name **Urban**, and a CSV file as the data format.
- **Dashboard:** KPI cards (new hires this week 14 ▲8%, last 4 weeks 60 ▲40%, weekly average 11.3 with best week 18), a weekly bar chart with a tooltip per bar, hires by department, recent joiners (table on desktop, cards on phones), and 4 / 8 / 12-week buttons.
- **Look:** purple and pink palette, all text dark `#1E0B36`, Poppins font (18–20 px body, KPI numbers up to 88 px), big buttons (56 px tall, 64 px on desktop).
- **Branding:** Urban name and a placeholder "U" logo (`icons/icon.svg`) in the header; the same file is the tab and home-screen icon.
- **Data:** mock data in `data/mock.js` (12 weeks, 136 hires, 6 departments, 8 fictional recent joiners).
- **App feel:** `manifest.webmanifest` and `sw.js` so it can be added to a phone's home screen.
- **Other:** README rewritten; `.claude/launch.json` to start a preview server.
- **Checked:** in the browser at 1440 px and 375 px wide. Numbers match the spec, all text is `#1E0B36`, buttons are at least 56 px, and there is no sideways scrolling. Three fixes came out of the checks: the tooltip moves beside tall bars, department percentages always add up to 100%, and the phone range buttons stay on one line.
- Files: `SPEC.md`, `README.md`, `index.html`, `styles.css`, `app.js`, `data/mock.js`, `icons/icon.svg`, `manifest.webmanifest`, `sw.js`, `.claude/launch.json`

### 3 · no commit · GitHub settings (done by Nirit on github.com)
- The repo was made **public** and **GitHub Pages** was switched on (branch `main`, root folder), so the dashboard has a live link: https://niritlib-debug.github.io/claude_code_nirit/
- Claude tried to do this from the command line but the permission check blocked it, so Nirit did it by hand.
- **Checked:** the live site loaded and showed the correct numbers on desktop and phone widths.

### 4 · 11:56 · [`67e5695`](https://github.com/niritlib-debug/claude_code_nirit/commit/67e5695) · Add live dashboard link (GitHub Pages) to README and SPEC
- README: new "See it live" section with the link.
- SPEC: the delivery section now lists the public repo and live link, says every push republishes the site (about a minute), and warns that real employee data must never go on public GitHub; next steps and change log updated.
- Files: `README.md`, `SPEC.md`

### 5 · 12:06 · [`ccf76a6`](https://github.com/niritlib-debug/claude_code_nirit/commit/ccf76a6) · Add Practice.md: commit and push after every change
- First version of `Practice.md`: written in Hebrew as working instructions (commit and push after every change, message format, what never to commit). It was a mistake: the file was meant to be a **log**, and it was replaced by this file (entry 10).
- README file table and SPEC change log got a row for it.
- Files: `Practice.md`, `README.md`, `SPEC.md`

### 6 · 16:41 · [`622d316`](https://github.com/niritlib-debug/claude_code_nirit/commit/622d316) · Move mock data into data/employees.csv and load it in the dashboard
- **New data file:** `data/employees.csv`, one row per employee, 140 rows: 136 full-time employees (same weekly and department totals as before) plus 4 contractors and interns that the dashboard must ignore.
- **`app.js` now reads the CSV:** handles quoted commas and quotes, Windows line endings and a byte-order mark; counts only full-time employees; groups by start-date week (Monday to Sunday) over the last 12 weeks; unknown departments go to an "Other" row; bad or missing start dates are skipped and reported in the console.
- **Frozen date:** the sample is counted "as of" 2026-09-19 (`AS_OF` in `app.js`) so the dashboard looks the same whenever it is opened.
- **Recent joiners** are now the 8 latest full-time starters from the CSV (new names).
- **If the CSV can't be loaded** (for example, `index.html` opened straight from disk), a pink message explains what to do.
- `data/mock.js` was deleted; `sw.js` caches the CSV instead.
- README and SPEC updated (data section, acceptance checks, change log).
- **Checked:** all numbers unchanged; the reader was stress-tested with a deliberately messy CSV; the error message and phone layout were checked; the live site was verified after publishing.
- Files: `data/employees.csv` (new), `data/mock.js` (deleted), `app.js`, `index.html`, `styles.css`, `sw.js`, `README.md`, `SPEC.md`

### 7 · 17:01 · [`d811333`](https://github.com/niritlib-debug/claude_code_nirit/commit/d811333) · Add Upload CSV button to look at different data
- Added an **Upload CSV** button, a "Use sample data" button, a line showing which data is on screen, and a privacy note. The chosen file was read in the browser only.
- It included checks and messages for bad files (wrong type, empty, over 5 MB, missing columns, no full-time rows).
- **This was the wrong feature.** The request was for a *download* button; this commit was undone in the next entry.
- Files: `app.js`, `index.html`, `styles.css`, `README.md`, `SPEC.md`

### 8 · 17:12 · [`0e4aeec`](https://github.com/niritlib-debug/claude_code_nirit/commit/0e4aeec) · Replace Upload CSV with a Download CSV button
- The Upload commit (entry 7) was undone completely, then a **Download CSV** button was added: a big pink button under the range buttons that saves the mock data as `urban-employees-mock.csv`.
- It is a plain link with the `download` attribute pointing at `data/employees.csv`, so it needs no script. The file is always the whole file (140 rows), whatever time range is chosen.
- README and SPEC updated (new section 4.6, button style, acceptance checks, decisions, change log).
- **Checked:** pressing the button saved a file identical, byte for byte, to `data/employees.csv`; on a 375 px phone the button is full width and 56 px tall with no sideways scrolling; verified again on the live site.
- Files: `index.html`, `styles.css`, `app.js` (upload code removed), `README.md`, `SPEC.md`

### 9 · 17:13 · [`d637fe7`](https://github.com/niritlib-debug/claude_code_nirit/commit/d637fe7) · SPEC: record that the Download CSV file was verified
- One line in the SPEC acceptance checks changed from "not seen" to "checked": the downloaded file matches the original byte for byte.
- Files: `SPEC.md`

### 10 · 17:24 · [`f301216`](https://github.com/niritlib-debug/claude_code_nirit/commit/f301216) · Turn Practice.md into a change log with all changes so far
- `Practice.md` was rewritten. The first version (entry 5) was Hebrew working instructions, which was a mistake: the file is meant to be a **log**. It now lists every change from the start (entries 1–9, with commit links, files and how each was checked) and explains that a new entry is added after every commit and push.
- The old Hebrew instructions were removed. The rule they described still applies: commit and push every change, then log it here.
- README file table and the SPEC change log were updated to describe the file as a change log.
- Files: `Practice.md`, `README.md`, `SPEC.md`

### 11 · 17:36 · [`3cccfe1`](https://github.com/niritlib-debug/claude_code_nirit/commit/3cccfe1) · Give the 8 weeks button a different purple
- The **8 weeks** button is now a deeper purple (`#B47CFF`, the palette's `--violet-400`) when it is not selected. Before, all three range buttons were the same lavender (`#C9A0FF`). The hover color of that button is the lighter lavender.
- When 8 weeks is selected it still turns pink like the other two, and the text stays dark `#1E0B36` (contrast 6.3:1).
- SPEC section 5.3 and the SPEC change log updated.
- **Checked:** in the browser the three buttons show lavender, deeper purple and pink (12 weeks selected); selecting 8 weeks turns it pink; all buttons are still 64 px tall.
- Files: `styles.css`, `SPEC.md`

## 2026-09-23

### 12 · no commit · Airtable connection (not finished)
- Nirit asked to connect Claude to Airtable and create a table from `data/employees.csv`. The Airtable connector is on her account and she signed in, but in this long-running session it stayed "pending" and its tools never loaded, so no table was created.
- Next: create the table directly in Airtable (Import → CSV file), or open a new Claude session where the connector loads.

### 13 · 20:21 · [`6c7888f`](https://github.com/niritlib-debug/claude_code_nirit/commit/6c7888f) · Replace the Download CSV button with Import CSV
- The **Download CSV** button was removed and the file-import feature came back, now called **Import CSV** (it was first built as "Upload CSV" in entry 7).
- Import CSV opens the file picker for a `.csv` file; the whole dashboard (KPIs, chart, departments, recent joiners, date range) switches to that file. **Use sample data** goes back. A line under the date shows which data is on screen, and a note says the file stays in the browser and is not sent anywhere.
- Bad files (not `.csv`, empty, over 5 MB, missing columns, semicolon-separated, no full-time rows) show a pink message and keep the current data.
- The **8 weeks** purple from entry 11 was kept.
- README and SPEC updated (4.6, 5.3, acceptance checks, decisions, change log).
- **Checked:** the button reads "Import CSV" and is 64 px tall on desktop and full width, 56 px tall, on a 375 px phone with no sideways scrolling; importing a test file changed the dashboard and ignored a contractor; an `.xlsx` file showed the error and kept the data; Use sample data brought back the original 14 / 136; the Download button is gone.
- Files: `app.js`, `index.html`, `styles.css`, `README.md`, `SPEC.md`
