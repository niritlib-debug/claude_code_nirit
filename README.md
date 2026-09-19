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
- A **Download CSV** button that saves the mock data as a CSV file

## The data

Every number comes from one CSV file, [`data/employees.csv`](data/employees.csv): one row per employee. It holds **mock data** (fictional people): 140 rows, of which 136 are full-time employees and 4 are contractors or interns that the dashboard ignores. The columns and rules are in [SPEC.md §6.2](SPEC.md).

### Download the data: Download CSV

Press **Download CSV** at the top of the page to save that file to your computer as `urban-employees-mock.csv`. It is always the whole file, the same for every time range. You can open it in Excel or any text editor.

To use other data, replace `data/employees.csv` with a file that has the same columns. **Do not put real employee data in this public repo.**

## Run it on your own computer

No install and no build step. From this folder:

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173 in a browser. (Double-clicking `index.html` does not work, because browsers do not let a page read the CSV file that way. The page shows a message if you try.)

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
