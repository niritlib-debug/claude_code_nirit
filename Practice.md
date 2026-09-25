# Practice

**Every change to this project is committed and pushed to GitHub right away.**

- One change = one commit, followed by `git push origin main`.
- Repository: https://github.com/niritlib-debug/claude_code_nirit

**While the dashboard is connected to Airtable, it refreshes the data every 5 minutes.**

- Connected = "Connect Airtable" was used and the button reads "Airtable connected ✓".
- Every 5 minutes the dashboard reads the Airtable table again and updates everything on screen, keeping the chosen range. The data-source line shows the time of the last update.
- If a refresh fails, the data on screen stays and a pink message explains why.
