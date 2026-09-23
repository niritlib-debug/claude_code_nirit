// HR Onboarding Dashboard — rendering and interaction. See SPEC.md.
(function () {
  'use strict';

  const CSV_URL = 'data/employees.csv';

  // The mock CSV is frozen at this date so the dashboard looks the same whenever it is opened.
  // Set to null to use today's date instead (for real data).
  const AS_OF = '2026-09-19';

  const MAX_WEEKS = 12;
  const RECENT_COUNT = 8;
  const DAY = 24 * 60 * 60 * 1000;
  const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
  const REQUIRED_COLUMNS = ['full_name', 'role', 'department', 'employment_type', 'start_date'];

  const DEPTS = [
    { key: 'engineering', name: 'Engineering', color: '#9B5CFF' },
    { key: 'product & design', name: 'Product & Design', color: '#FF4DAF' },
    { key: 'sales', name: 'Sales', color: '#C9A0FF' },
    { key: 'marketing', name: 'Marketing', color: '#FFA6DA' },
    { key: 'customer success', name: 'Customer Success', color: '#6A1FD0' },
    { key: 'g&a', name: 'G&A', color: '#D6187F' },
    { key: 'other', name: 'Other', color: '#FF7AC6' } // any department name not listed above
  ];
  const OTHER = 'other';

  const STATUS = {
    pre: { label: 'Pre-boarding', cls: 'chip--pre' },
    progress: { label: 'In progress', cls: 'chip--progress' },
    done: { label: 'Completed', cls: 'chip--done' }
  };
  const STATUS_FROM_CSV = { 'pre-boarding': 'pre', 'in-progress': 'progress', completed: 'done' };

  const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const state = { weeks: 12 };
  let allWeeks = [];
  let recentJoiners = [];
  let sampleDataset = null;
  let lastChartWidth = 0;

  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sum = (arr) => arr.reduce((a, b) => a + b, 0);
  const deptName = (key) => DEPTS.find((d) => d.key === key).name;

  /* ---------- Data: CSV -> employees -> weeks ---------- */

  // Minimal CSV parser: quoted fields, "" escapes, commas/newlines inside quotes, CRLF, BOM.
  function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = '';
    let quoted = false;
    const endRow = () => {
      row.push(field);
      field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    };
    text = text.replace(/^﻿/, '');
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (c === '"') quoted = false;
        else field += c;
      } else if (c === '"') quoted = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        endRow();
      } else field += c;
    }
    if (field !== '' || row.length) endRow();
    return rows;
  }

  function parseDate(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
    const date = new Date(iso + 'T00:00:00Z');
    return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso ? null : date;
  }

  const mondayOf = (date) => new Date(date.getTime() - ((date.getUTCDay() + 6) % 7) * DAY);

  function isoWeekNumber(date) {
    const t = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return Math.ceil(((t - yearStart) / DAY + 1) / 7);
  }

  // A problem with the data that is worth showing to the person as-is.
  class DataError extends Error {}

  // Turns CSV text into employee objects.
  // Throws a DataError when a needed column is missing. Rows without a valid start_date are skipped.
  function toEmployees(csvText) {
    const [header, ...lines] = parseCsv(csvText);
    if (!header) throw new DataError('The file is empty. It needs a first row with the column names.');
    const col = header.map((h) => h.trim().toLowerCase());

    const missing = REQUIRED_COLUMNS.filter((name) => !col.includes(name));
    if (missing.length) {
      const semicolons = header.length === 1 && header[0].includes(';');
      throw new DataError(
        'These columns are missing: ' + missing.join(', ') + '.' +
        (semicolons ? ' The file looks separated by semicolons; save it as a comma-separated CSV.' : '')
      );
    }

    const employees = [];
    const skipped = [];

    lines.forEach((cells, i) => {
      const get = (name) => (cells[col.indexOf(name)] || '').trim();
      const start = parseDate(get('start_date'));
      if (!start) { skipped.push('row ' + (i + 2) + ': invalid or missing start_date'); return; }

      const deptKey = get('department').toLowerCase();
      employees.push({
        name: get('full_name'),
        role: get('role'),
        dept: DEPTS.some((d) => d.key === deptKey) ? deptKey : OTHER,
        fullTime: get('employment_type').toLowerCase() === 'full-time',
        start,
        progress: Math.min(100, Math.max(0, parseInt(get('onboarding_progress'), 10) || 0)),
        csvStatus: STATUS_FROM_CSV[get('onboarding_status').toLowerCase()] || null
      });
    });

    if (skipped.length) console.warn('Skipped ' + skipped.length + ' CSV row(s):\n' + skipped.join('\n'));
    return { employees, skipped: skipped.length };
  }

  // Only full-time employees count. "Now" is the `today` date that is passed in.
  function buildModel(employees, today) {
    const fullTime = employees.filter((e) => e.fullTime);
    const thisMonday = mondayOf(today);

    const weeks = [];
    for (let i = MAX_WEEKS - 1; i >= 0; i--) {
      const start = new Date(thisMonday.getTime() - i * 7 * DAY);
      const end = new Date(start.getTime() + 6 * DAY);
      const counts = {};
      DEPTS.forEach((d) => { counts[d.key] = 0; });
      fullTime.forEach((e) => {
        if (e.start >= start && e.start <= end) counts[e.dept] += 1;
      });
      weeks.push({
        id: 'W' + String(isoWeekNumber(start)).padStart(2, '0'),
        counts,
        total: sum(DEPTS.map((d) => counts[d.key])),
        label: shortDate.format(start) + ' – ' + shortDate.format(end),
        year: end.getUTCFullYear()
      });
    }

    // Latest starters who have already joined (start date up to the end of the current week).
    const endOfThisWeek = new Date(thisMonday.getTime() + 6 * DAY);
    const recent = fullTime
      .filter((e) => e.start <= endOfThisWeek)
      .map((e, i) => ({ e, i }))
      .sort((a, b) => b.e.start - a.e.start || a.i - b.i)
      .slice(0, RECENT_COUNT)
      .map((x) => ({
        ...x.e,
        // A status in the CSV wins; otherwise work it out from the dates and progress.
        status: x.e.csvStatus || (x.e.start > today ? 'pre' : x.e.progress >= 100 ? 'done' : 'progress')
      }));

    return { weeks, recent };
  }

  const todayUtc = () => parseDate(new Date().toISOString().slice(0, 10));

  // Everything the page shows, worked out from CSV text.
  // The built-in sample is frozen at AS_OF; an imported file uses today's date.
  function makeDataset(csvText, { name, isSample }) {
    const { employees, skipped } = toEmployees(csvText);
    const fullTime = employees.filter((e) => e.fullTime);
    if (!fullTime.length) {
      throw new DataError('No full-time employees with a valid start date were found. ' +
        'Check the employment_type column (it must say full-time) and the start_date column (YYYY-MM-DD).');
    }

    let today = isSample && AS_OF ? parseDate(AS_OF) : todayUtc();
    let model = buildModel(employees, today);
    let note = '';

    // An older file would show an empty dashboard, so show the 12 weeks up to its latest start date instead.
    if (!isSample && sum(model.weeks.map((w) => w.total)) === 0) {
      const started = fullTime.filter((e) => e.start <= today).map((e) => e.start.getTime());
      if (started.length) {
        today = new Date(Math.max(...started));
        model = buildModel(employees, today);
        note = 'There are no hires in the 12 weeks before today, so this shows the 12 weeks up to ' +
          shortDate.format(today) + ', ' + today.getUTCFullYear() + ', the latest start date in the file.';
      }
    }

    return {
      ...model,
      source: { name, isSample, fullTime: fullTime.length, notFullTime: employees.length - fullTime.length, skipped, note }
    };
  }

  // Single entry point for the built-in data. Swap the body for an API call later.
  async function getWeeklyHires() {
    const response = await fetch(CSV_URL, { cache: 'no-cache' });
    if (!response.ok) throw new Error(CSV_URL + ' returned HTTP ' + response.status);
    return makeDataset(await response.text(), { name: CSV_URL, isSample: true });
  }

  function deltaText(current, previous, suffix) {
    if (previous == null) return '';
    const diff = current - previous;
    const arrow = diff > 0 ? '▲' : diff < 0 ? '▼' : '▬';
    if (previous === 0) return arrow + ' ' + (diff > 0 ? '+' : '') + diff + ' ' + suffix;
    return arrow + ' ' + Math.round((Math.abs(diff) / previous) * 100) + '% ' + suffix;
  }

  /* ---------- KPIs ---------- */

  function renderKpis(weeks) {
    const latest = allWeeks[allWeeks.length - 1];
    const prev = allWeeks[allWeeks.length - 2];
    $('#kpi-week').textContent = latest.total;
    $('#kpi-week-delta').textContent = deltaText(latest.total, prev && prev.total, 'vs last week');
    $('#kpi-week-note').textContent = latest.id + ' · ' + latest.label + ' (this week)';

    const lastFour = allWeeks.slice(-4);
    const priorFour = allWeeks.slice(-8, -4);
    const fourTotal = sum(lastFour.map((w) => w.total));
    $('#kpi-four').textContent = fourTotal;
    $('#kpi-four-delta').textContent = priorFour.length === 4
      ? deltaText(fourTotal, sum(priorFour.map((w) => w.total)), 'vs prior 4 weeks')
      : '';
    $('#kpi-four-note').textContent = lastFour[0].id + ' – ' + latest.id;

    const avg = sum(weeks.map((w) => w.total)) / weeks.length;
    const best = weeks.reduce((a, b) => (b.total > a.total ? b : a));
    $('#kpi-avg').textContent = avg.toFixed(1);
    $('#kpi-avg-note').textContent = 'Best week: ' + best.total + ' (' + best.id + ') · last ' + weeks.length + ' weeks';
  }

  /* ---------- Weekly bar chart (inline SVG) ---------- */

  function renderChart(weeks) {
    const host = $('#chart');
    const W = Math.floor(host.clientWidth);
    if (!W) return;
    lastChartWidth = W;
    hideTip();

    const compact = W < 520;
    // Shorter on short screens (a phone held sideways) so the whole chart fits on screen.
    const H = Math.min(compact ? 300 : 360, Math.max(220, Math.round(window.innerHeight * 0.6)));
    const m = { top: 34, bottom: 44 };
    const innerH = H - m.top - m.bottom;
    const base = m.top + innerH;
    const n = weeks.length;
    const slot = W / n;
    const barW = Math.min(slot * 0.68, 64);
    const max = Math.max(1, ...weeks.map((w) => w.total));
    const valSize = slot < 30 ? 16 : compact ? 18 : 20;
    const everyOther = slot < 48;

    let svg = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="group" aria-label="Bar chart of new hires per week">';

    [0.5, 1].forEach((f) => {
      const y = base - innerH * f;
      svg += '<line class="grid-line" x1="0" x2="' + W + '" y1="' + y + '" y2="' + y + '"/>';
    });

    weeks.forEach((w, i) => {
      const cx = slot * i + slot / 2;
      const x = cx - barW / 2;
      const h = (w.total / max) * innerH;
      const top = base - h;
      const latest = i === n - 1;
      const showAxis = !everyOther || (n - 1 - i) % 2 === 0;
      const label = w.id + ', ' + w.label + ': ' + w.total + ' new hires';

      svg += '<g class="col" data-i="' + i + '" tabindex="0" role="img" aria-label="' + esc(label) + '">' +
        '<rect class="hit" x="' + slot * i + '" y="0" width="' + slot + '" height="' + H + '" fill="transparent"/>' +
        '<rect class="slot" x="' + x + '" y="' + m.top + '" width="' + barW + '" height="' + innerH + '" rx="10"/>' +
        (h > 0
          ? '<rect class="bar' + (latest ? ' bar--latest' : '') + '" x="' + x + '" y="' + top + '" width="' + barW +
            '" height="' + h + '" rx="' + Math.min(10, h / 2) + '"/>'
          : '') +
        '<text class="val" x="' + cx + '" y="' + (top - 10) + '" font-size="' + valSize + '">' + w.total + '</text>' +
        (showAxis
          ? '<text class="axis' + (latest ? ' axis--latest' : '') + '" x="' + cx + '" y="' + (base + 30) + '">' + w.id + '</text>'
          : '') +
        '</g>';
    });

    svg += '<line class="baseline" x1="0" x2="' + W + '" y1="' + base + '" y2="' + base + '"/></svg>';
    host.innerHTML = svg;

    host._geometry = { slot, barW, base, innerH, max, weeks };
  }

  /* ---------- Tooltip ---------- */

  const tip = $('#tip');
  let activeCol = null;

  function showTip(col) {
    const host = $('#chart');
    const g = host._geometry;
    if (!g) return;
    const week = g.weeks[Number(col.dataset.i)];
    const rows = DEPTS
      .map((d) => ({ d, n: week.counts[d.key] || 0 }))
      .filter((r) => r.n > 0)
      .sort((a, b) => b.n - a.n);

    tip.innerHTML =
      '<strong>' + esc(week.id) + ' · ' + esc(week.label) + '</strong>' +
      '<span class="tip__total">' + week.total + ' new hire' + (week.total === 1 ? '' : 's') + '</span>' +
      '<ul>' + rows.map((r) =>
        '<li><span class="swatch" style="background:' + r.d.color + '"></span>' + esc(r.d.name) + '<b>' + r.n + '</b></li>'
      ).join('') + '</ul>';
    tip.hidden = false;

    if (activeCol) activeCol.classList.remove('is-active');
    activeCol = col;
    col.classList.add('is-active');

    const i = Number(col.dataset.i);
    const cx = g.slot * i + g.slot / 2;
    const barTop = g.base - (week.total / g.max) * g.innerH;
    const wrap = host.getBoundingClientRect();
    const card = tip.offsetParent ? tip.offsetParent.getBoundingClientRect() : wrap;
    const offsetX = wrap.left - card.left;
    const offsetY = wrap.top - card.top;
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    const hostW = host.clientWidth;
    const gap = 12;
    let left = Math.min(Math.max(cx - tw / 2, 0), hostW - tw);
    let top = barTop - th - 34;
    if (top < 0) {
      // Tall bar: not enough room above, so sit beside it (right first, then left).
      top = 0;
      if (cx + g.barW / 2 + gap + tw <= hostW) left = cx + g.barW / 2 + gap;
      else if (cx - g.barW / 2 - gap - tw >= 0) left = cx - g.barW / 2 - gap - tw;
    }
    tip.style.left = left + offsetX + 'px';
    tip.style.top = top + offsetY + 'px';
  }

  function hideTip() {
    tip.hidden = true;
    if (activeCol) activeCol.classList.remove('is-active');
    activeCol = null;
  }

  function bindChart() {
    const host = $('#chart');
    const colOf = (e) => (e.target.closest ? e.target.closest('.col') : null);

    host.addEventListener('mouseover', (e) => {
      const col = colOf(e);
      if (col && col !== activeCol) showTip(col);
    });
    host.addEventListener('mouseleave', hideTip);
    host.addEventListener('focusin', (e) => {
      const col = colOf(e);
      if (col) showTip(col);
    });
    host.addEventListener('focusout', hideTip);
    host.addEventListener('click', (e) => {
      const col = colOf(e);
      if (col) showTip(col);
    });
    host.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && colOf(e)) {
        e.preventDefault();
        showTip(colOf(e));
      }
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.col')) hideTip();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hideTip();
    });
  }

  /* ---------- Departments ---------- */

  // Whole-number percentages that always add up to 100 (largest-remainder rounding).
  function percentages(counts, total) {
    if (!total) return counts.map(() => 0);
    const exact = counts.map((n) => (n / total) * 100);
    const result = exact.map(Math.floor);
    let left = 100 - sum(result);
    exact
      .map((v, i) => ({ i, frac: v - Math.floor(v) }))
      .sort((a, b) => b.frac - a.frac)
      .forEach((x) => { if (left > 0) { result[x.i] += 1; left -= 1; } });
    return result;
  }

  function renderDepartments(weeks) {
    const rows = DEPTS
      .map((d) => ({ d, n: sum(weeks.map((w) => w.counts[d.key] || 0)) }))
      .filter((r) => r.d.key !== OTHER || r.n > 0)
      .sort((a, b) => b.n - a.n);
    const total = sum(rows.map((r) => r.n));
    const max = Math.max(1, rows[0].n);
    const pcts = percentages(rows.map((r) => r.n), total);

    $('#dept-hint').textContent = total + ' hires in the last ' + weeks.length + ' weeks';
    $('#dept-list').innerHTML = rows.map((r, i) => {
      const pct = pcts[i];
      return '<li>' +
        '<div class="dept__top"><span class="swatch" style="background:' + r.d.color + '"></span>' +
        '<span class="dept__name">' + esc(r.d.name) + '</span>' +
        '<span class="dept__num"><b>' + r.n + '</b> · ' + pct + '%</span></div>' +
        '<div class="dept__track" aria-hidden="true"><div class="dept__fill" style="width:' + (r.n / max) * 100 +
        '%;background:' + r.d.color + '"></div></div></li>';
    }).join('');
  }

  /* ---------- Recent joiners ---------- */

  function progressCell(p) {
    return '<div class="prog"><div class="prog__bar" aria-hidden="true"><span style="width:' + p + '%"></span></div><b>' + p + '%</b></div>';
  }

  function chip(status) {
    const s = STATUS[status];
    return '<span class="chip ' + s.cls + '">' + s.label + '</span>';
  }

  function renderJoiners() {
    const people = recentJoiners.map((p) => ({ ...p, startLabel: shortDate.format(p.start) }));

    $('#joiners-table').innerHTML =
      '<table class="people"><thead><tr>' +
      '<th scope="col">Name</th><th scope="col">Role</th><th scope="col">Department</th>' +
      '<th scope="col">Start</th><th scope="col">Progress</th><th scope="col">Status</th>' +
      '</tr></thead><tbody>' +
      people.map((p) =>
        '<tr><td class="person">' + esc(p.name) + '</td><td>' + esc(p.role) + '</td><td>' + esc(deptName(p.dept)) +
        '</td><td>' + p.startLabel + '</td><td>' + progressCell(p.progress) + '</td><td>' + chip(p.status) + '</td></tr>'
      ).join('') +
      '</tbody></table>';

    $('#joiners-cards').innerHTML = people.map((p) =>
      '<li class="person-card">' +
      '<div><div class="person">' + esc(p.name) + '</div>' +
      '<div class="meta">' + esc(p.role) + ' · ' + esc(deptName(p.dept)) + '</div></div>' +
      '<div class="row">' + chip(p.status) + '<span class="meta">Started ' + p.startLabel + '</span></div>' +
      progressCell(p.progress) +
      '</li>'
    ).join('');
  }

  /* ---------- Page ---------- */

  function renderHeader(weeks) {
    const first = weeks[0];
    const last = weeks[weeks.length - 1];
    const startText = first.label.split(' – ')[0];
    const endText = last.label.split(' – ')[1];
    $('#range-label').textContent = startText + ' – ' + endText + ', ' + last.year + ' · ' + weeks.length + ' weeks';
  }

  function renderAccessibleTable(weeks) {
    $('#chart-table tbody').innerHTML = weeks.map((w) =>
      '<tr><th scope="row">' + w.id + '</th><td>' + esc(w.label) + '</td><td>' + w.total + '</td></tr>'
    ).join('');
  }

  function render() {
    if (!allWeeks.length) return;
    const weeks = allWeeks.slice(-state.weeks);
    document.querySelectorAll('.seg button').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(Number(btn.dataset.weeks) === state.weeks));
    });
    renderHeader(weeks);
    renderKpis(weeks);
    renderChart(weeks);
    renderAccessibleTable(weeks);
    renderDepartments(weeks);
  }

  /* ---------- Data source: sample file or an imported file ---------- */

  const plural = (n, word) => n + ' ' + word + (n === 1 ? '' : 's');

  function renderSource(source) {
    const parts = [
      source.isSample ? 'Sample data (' + source.name + ')' : 'Your file: ' + source.name,
      plural(source.fullTime, 'full-time employee')
    ];
    if (source.notFullTime) parts.push(source.notFullTime + ' not full-time (ignored)');
    if (source.skipped) parts.push(plural(source.skipped, 'row') + ' skipped (invalid start date)');
    $('#source-label').textContent = parts.join(' · ');

    const note = $('#source-note');
    note.textContent = source.note;
    note.hidden = !source.note;
    $('#reset-btn').hidden = source.isSample;
  }

  function showNotice(title, detail) {
    const notice = $('#notice');
    const strong = document.createElement('strong');
    strong.textContent = title;
    notice.replaceChildren(strong, ' ' + detail);
    notice.hidden = false;
  }

  const hideNotice = () => { $('#notice').hidden = true; };

  function applyDataset(dataset) {
    allWeeks = dataset.weeks;
    recentJoiners = dataset.recent;
    renderJoiners();
    render();
    renderSource(dataset.source);
  }

  async function onFileChosen(event) {
    const input = event.target;
    const file = input.files && input.files[0];
    input.value = ''; // lets the same file be chosen again
    if (!file) return;

    try {
      if (!/\.csv$/i.test(file.name) && !/csv/i.test(file.type)) {
        throw new DataError('Please choose a .csv file. An Excel file (.xlsx) must be saved as CSV first.');
      }
      if (file.size > MAX_UPLOAD_BYTES) throw new DataError('That file is larger than 5 MB.');
      // The file is read here in the browser. It is never sent anywhere.
      applyDataset(makeDataset(await file.text(), { name: file.name, isSample: false }));
      hideNotice();
    } catch (error) {
      console.error(error);
      showNotice('That file could not be used.',
        error instanceof DataError ? error.message : 'It could not be read as a CSV file.');
    }
  }

  function showLoadError(error) {
    console.error(error);
    const notice = $('#notice');
    notice.hidden = false;
    notice.innerHTML =
      '<strong>The dashboard could not load its sample data.</strong> ' +
      'It needs <code>' + esc(CSV_URL) + '</code>, and browsers only allow that when the page is opened from a web server ' +
      '(not by double-clicking <code>index.html</code>). Open the live link, or run ' +
      '<code>python3 -m http.server 5173</code> in the project folder and visit <code>http://localhost:5173</code>. ' +
      'You can also press <strong>Import CSV</strong> and choose a file.';
  }

  async function init() {
    document.querySelectorAll('.seg button').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!allWeeks.length) return;
        state.weeks = Math.min(Number(btn.dataset.weeks), allWeeks.length);
        render();
      });
    });
    $('#upload-btn').addEventListener('click', () => $('#file-input').click());
    $('#file-input').addEventListener('change', onFileChosen);
    $('#reset-btn').addEventListener('click', () => {
      if (!sampleDataset) return;
      applyDataset(sampleDataset);
      hideNotice();
    });
    bindChart();

    if ('ResizeObserver' in window) {
      new ResizeObserver(() => {
        const w = Math.floor($('#chart').clientWidth);
        if (allWeeks.length && w && w !== lastChartWidth) renderChart(allWeeks.slice(-state.weeks));
      }).observe($('#chart'));
    } else {
      window.addEventListener('resize', () => { if (allWeeks.length) renderChart(allWeeks.slice(-state.weeks)); });
    }

    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }

    try {
      sampleDataset = await getWeeklyHires();
      applyDataset(sampleDataset);
    } catch (error) {
      showLoadError(error); // Import CSV still works
    }
  }

  init();
})();
