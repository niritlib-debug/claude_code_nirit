# Urban — HR Onboarding Dashboard

A dashboard for the People team at **Urban** that shows **how many new full-time employees joined the company each week**, and in which departments.

Built with Claude Code from a written spec. It works on desktop and on a phone, in bright purple and pink with large dark text and big buttons.

## See it live

**https://niritlib-debug.github.io/claude_code_nirit/**

Open the link in any browser, on a computer or a phone. Nothing to install.

## What it shows

- **New hires this week**, with the change vs. last week
- **Last 4 weeks** total, with the change vs. the 4 weeks before
- **Weekly average** and the best week
- A **bar chart** of new hires per week (tap or hover a bar for the department split)
- **Hires by department**
- **Recent joiners** with onboarding progress
- Time-range buttons: 4, 8 or 12 weeks
- An **Import CSV** button to look at your own data (see below)

## The data

By default every number comes from one CSV file, [`data/employees.csv`](data/employees.csv): one row per employee. It holds **mock data** (fictional people): 140 rows, of which 136 are full-time employees and 4 are contractors or interns that the dashboard ignores. The columns and rules are in [SPEC.md §6.2](SPEC.md).

### Look at different data: Import CSV

Press **Import CSV** at the top of the page and choose a CSV file with the same columns as `data/employees.csv`. The whole dashboard updates. Press **Use sample data** to go back.

- The file is read **in your browser only**. It is not uploaded anywhere and not saved; refreshing the page returns to the sample data.
- If the file cannot be used (not a `.csv`, missing columns, empty, over 5 MB), a pink message says what is wrong and nothing changes.
- An imported file is counted as of **today**. If the file has no hires in the last 12 weeks, the dashboard shows the 12 weeks up to the file's latest start date and says so.

**Do not put real employee data in this public repo.** Importing it in the browser is the safe way to look at it.

## Run it on your own computer

No install and no build step. From this folder:

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173 in a browser. (Double-clicking `index.html` does not load the sample data, because browsers do not let a page read the CSV file that way. The page shows a message if you try.)

## Files

| File | What it is |
|---|---|
| [SPEC.md](SPEC.md) | The full specification: goals, design rules, data, decisions, acceptance checks |
| [Practice.md](Practice.md) | The change log: every change made to the project, added after each commit and push |
| `index.html` | The page |
| `styles.css` | Colors, fonts, layout |
| `app.js` | Reads the CSV, works out the numbers, draws the charts |
| `data/employees.csv` | The mock data, one row per employee |
| `icons/icon.svg` | The Urban logo (placeholder) |
| `manifest.webmanifest`, `sw.js` | Let the dashboard be added to a phone's home screen |
