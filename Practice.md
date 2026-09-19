# נוהל עבודה: שמירת שינויים (Commit ו-Push)

## הכלל

**אחרי כל שינוי בפרויקט: commit, ואז push ל-GitHub.**
שינוי אחד = commit אחד. לא מצטברים שינויים "לסוף".

למה זה חשוב:
- כל שינוי נשמר בהיסטוריה, ואפשר לחזור אחורה אם משהו נשבר.
- המורה יכולה לראות את ההתקדמות צעד אחר צעד.
- האתר החי מתעדכן לבד אחרי כל push.

## פרטי הפרויקט

| | |
|---|---|
| Repo | https://github.com/niritlib-debug/claude_code_nirit |
| Branch | `main` |
| אתר חי | https://niritlib-debug.github.io/claude_code_nirit/ (מתעדכן כדקה אחרי push) |

## הצעדים לכל שינוי

1. **לבדוק שהשינוי עובד.** להריץ בדפדפן (מחשב וטלפון) לפני שמירה.
2. **לעדכן תיעוד אם צריך.** אם השתנתה החלטה או התנהגות: לעדכן את `SPEC.md` (כולל שורה בטבלת ה-Change log בסופו), ובמידת הצורך את `README.md`. הם נכנסים לאותו commit של השינוי.
3. **לראות מה השתנה:**
   ```bash
   git status
   ```
4. **להוסיף רק את הקבצים הרלוונטיים** (בלי `git add .` בלי לבדוק קודם מה בפנים):
   ```bash
   git add SPEC.md README.md app.js
   ```
5. **Commit** עם הודעה לפי הכללים למטה.
6. **Push:**
   ```bash
   git push origin main
   ```
7. **לוודא שזה עבר:**
   ```bash
   git status -sb
   ```
   צריך לראות `main...origin/main` בלי המילה `ahead`. אחרי כדקה אפשר לפתוח את האתר החי ולראות את השינוי.

## הודעת commit

- שורה ראשונה **באנגלית**, בלשון ציווי, עד כ-70 תווים: `Add ...`, `Fix ...`, `Update ...`
- אחריה (אם צריך) פסקה קצרה שמסבירה **למה** השינוי נעשה.
- כשקלוד כתב את השינוי, השורה האחרונה בהודעה היא:
  `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`

דוגמה:
```bash
git commit -m "Add CSV loader for employee data

Reads data/employees.csv and groups full-time hires by start-date week.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

## זהות המחברת ב-commit

כדי שהאימייל האישי לא יתפרסם בריפו הציבורי, ה-commits נעשים עם כתובת ה-no-reply של GitHub:

```bash
git -c user.name="Nirit Liberman" \
    -c user.email="257557811+niritlib-debug@users.noreply.github.com" \
    commit -m "..."
```

## מה לא מעלים לריפו

הריפו והאתר **ציבוריים**, לכן אסור להעלות:
- מידע אמיתי על עובדים (למשל קובץ CSV אמיתי)
- סיסמאות, מפתחות API, טוקנים
- טלפון, אימייל אישי או כל מידע פרטי אחר

## אם משהו משתבש

- **ה-push נדחה (`rejected`):** לרענן ולנסות שוב:
  ```bash
  git pull --rebase origin main
  git push origin main
  ```
- **שכחתי קובץ ב-commit שכבר נשלח:** להוסיף אותו ב-commit חדש ולעשות push. לא משכתבים היסטוריה.
- **רוצים לבטל שינוי שכבר נשלח:** `git revert <מזהה-commit>` ואז push.
- **אף פעם לא** `git push --force` בלי לשאול קודם.
