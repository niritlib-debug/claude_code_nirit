# Urban — HR Onboarding Dashboard

A dashboard for the People team at **Urban** that shows **how many new full-time employees joined the company each week**, and in which departments.

Built with Claude Code from a written spec. It works on desktop and on a phone, in bright purple and pink with large dark text and big buttons.

## What it shows

- **New hires this week**, with the change vs. last week
- **Last 4 weeks** total, with the change vs. the 4 weeks before
- **Weekly average** and the best week
- A **bar chart** of new hires per week (tap or hover a bar for the department split)
- **Hires by department**
- **Recent joiners** with onboarding progress
- Time-range buttons: 4, 8 or 12 weeks

The data is **mock data** (fictional people). A CSV format for real data is defined in the spec and planned for the next version.

## Run it

No install and no build step. From this folder:

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173 in a browser.

## Files

| File | What it is |
|---|---|
| [SPEC.md](SPEC.md) | The full specification: goals, design rules, data, decisions, acceptance checks |
| `index.html` | The page |
| `styles.css` | Colors, fonts, layout |
| `app.js` | Charts, numbers and interaction |
| `data/mock.js` | The mock data |
| `icons/icon.svg` | The Urban logo (placeholder) |
| `manifest.webmanifest`, `sw.js` | Let the dashboard be added to a phone's home screen |
