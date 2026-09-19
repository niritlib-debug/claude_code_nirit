// HR Onboarding Dashboard — rendering and interaction. See SPEC.md.
(function () {
  'use strict';

  const DATA = window.HR_DATA;
  const DEPTS = DATA.departments;
  const DAY = 24 * 60 * 60 * 1000;
  const STATUS = {
    pre: { label: 'Pre-boarding', cls: 'chip--pre' },
    progress: { label: 'In progress', cls: 'chip--progress' },
    done: { label: 'Completed', cls: 'chip--done' }
  };

  const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const state = { weeks: 12 };
  let allWeeks = [];
  let lastChartWidth = 0;

  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sum = (arr) => arr.reduce((a, b) => a + b, 0);
  const deptName = (key) => DEPTS.find((d) => d.key === key).name;

  // Single entry point for the data. Swap the body for an API call later.
  function getWeeklyHires() {
    return DATA.weeks.map((w) => {
      const start = new Date(w.start + 'T00:00:00Z');
      const end = new Date(start.getTime() + 6 * DAY);
      return {
        id: w.id,
        counts: w.counts,
        total: sum(DEPTS.map((d) => w.counts[d.key] || 0)),
        label: shortDate.format(start) + ' – ' + shortDate.format(end)
      };
    });
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
    const H = compact ? 300 : 360;
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
    const people = DATA.joiners.map((p) => ({
      ...p,
      startLabel: shortDate.format(new Date(p.start + 'T00:00:00Z'))
    }));

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
    $('#range-label').textContent = startText + ' – ' + endText + ', 2026 · ' + weeks.length + ' weeks';
  }

  function renderAccessibleTable(weeks) {
    $('#chart-table tbody').innerHTML = weeks.map((w) =>
      '<tr><th scope="row">' + w.id + '</th><td>' + esc(w.label) + '</td><td>' + w.total + '</td></tr>'
    ).join('');
  }

  function render() {
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

  function init() {
    allWeeks = getWeeklyHires();
    document.querySelectorAll('.seg button').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.weeks = Math.min(Number(btn.dataset.weeks), allWeeks.length);
        render();
      });
    });
    bindChart();
    renderJoiners();
    render();

    if ('ResizeObserver' in window) {
      new ResizeObserver(() => {
        const w = Math.floor($('#chart').clientWidth);
        if (w && w !== lastChartWidth) renderChart(allWeeks.slice(-state.weeks));
      }).observe($('#chart'));
    } else {
      window.addEventListener('resize', () => renderChart(allWeeks.slice(-state.weeks)));
    }

    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  init();
})();
