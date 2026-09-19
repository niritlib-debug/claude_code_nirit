// Mock data for the HR Onboarding Dashboard (see SPEC.md §6).
// Full-time employees only, counted in the week (Mon–Sun) of their start date.
// To go live later, replace this file with a real API call that returns the same shape.
window.HR_DATA = {
  departments: [
    { key: 'eng',   name: 'Engineering',       color: '#9B5CFF' },
    { key: 'pd',    name: 'Product & Design',  color: '#FF4DAF' },
    { key: 'sales', name: 'Sales',             color: '#C9A0FF' },
    { key: 'mkt',   name: 'Marketing',         color: '#FFA6DA' },
    { key: 'cs',    name: 'Customer Success',  color: '#6A1FD0' },
    { key: 'ga',    name: 'G&A',               color: '#D6187F' }
  ],

  // W38 is the current week (Sep 14–20, 2026).
  weeks: [
    { id: 'W27', start: '2026-06-29', counts: { eng: 3, pd: 1, sales: 1, mkt: 0, cs: 1, ga: 0 } },
    { id: 'W28', start: '2026-07-06', counts: { eng: 4, pd: 1, sales: 2, mkt: 1, cs: 1, ga: 0 } },
    { id: 'W29', start: '2026-07-13', counts: { eng: 3, pd: 1, sales: 1, mkt: 1, cs: 0, ga: 1 } },
    { id: 'W30', start: '2026-07-20', counts: { eng: 5, pd: 2, sales: 2, mkt: 1, cs: 1, ga: 0 } },
    { id: 'W31', start: '2026-07-27', counts: { eng: 3, pd: 1, sales: 2, mkt: 1, cs: 1, ga: 0 } },
    { id: 'W32', start: '2026-08-03', counts: { eng: 6, pd: 2, sales: 3, mkt: 1, cs: 1, ga: 1 } },
    { id: 'W33', start: '2026-08-10', counts: { eng: 5, pd: 2, sales: 2, mkt: 1, cs: 1, ga: 1 } },
    { id: 'W34', start: '2026-08-17', counts: { eng: 4, pd: 1, sales: 2, mkt: 1, cs: 1, ga: 0 } },
    { id: 'W35', start: '2026-08-24', counts: { eng: 6, pd: 3, sales: 3, mkt: 1, cs: 1, ga: 1 } },
    { id: 'W36', start: '2026-08-31', counts: { eng: 8, pd: 3, sales: 3, mkt: 2, cs: 1, ga: 1 } },
    { id: 'W37', start: '2026-09-07', counts: { eng: 5, pd: 2, sales: 3, mkt: 1, cs: 1, ga: 1 } },
    { id: 'W38', start: '2026-09-14', counts: { eng: 6, pd: 2, sales: 3, mkt: 1, cs: 1, ga: 1 } }
  ],

  // Fictional people. status: 'pre' | 'progress' | 'done'
  joiners: [
    { name: 'Maya Cohen',    role: 'Backend Engineer',         dept: 'eng',   start: '2026-09-14', progress: 20,  status: 'progress' },
    { name: 'Daniel Levi',   role: 'Frontend Engineer',        dept: 'eng',   start: '2026-09-14', progress: 20,  status: 'progress' },
    { name: 'Noa Mizrahi',   role: 'Product Designer',         dept: 'pd',    start: '2026-09-15', progress: 35,  status: 'progress' },
    { name: 'Omar Haddad',   role: 'Account Executive',        dept: 'sales', start: '2026-09-15', progress: 0,   status: 'pre' },
    { name: 'Lior Peretz',   role: 'Data Engineer',            dept: 'eng',   start: '2026-09-14', progress: 45,  status: 'progress' },
    { name: 'Tamar Katz',    role: 'Customer Success Manager', dept: 'cs',    start: '2026-09-14', progress: 30,  status: 'progress' },
    { name: 'Yael Shapiro',  role: 'Content Marketer',         dept: 'mkt',   start: '2026-09-08', progress: 100, status: 'done' },
    { name: 'Avi Ben-David', role: 'Finance Analyst',          dept: 'ga',    start: '2026-09-08', progress: 100, status: 'done' }
  ]
};
