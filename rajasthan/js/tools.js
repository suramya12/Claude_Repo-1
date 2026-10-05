/* TOOL archetype: planner, phrasebook (with quiz), know before you go, saved places, credits. */
(function () {
  'use strict';
  const { h, svg, store } = U;
  const ARCH = (window.ARCH = window.ARCH || {});
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const SEASON = { best: 'Best season: dry, warm days and cool nights', shoulder: 'Shoulder season: warming up', hot: 'Hot season: 40 °C and more in the desert; Mount Abu is cooler', monsoon: 'Monsoon: green and humid; lakes fill; some parks close' };

  function shell(node, ctx) {
    const left = h('div.col', { 'data-inert': '' });
    const right = h('div.col.scroll', { 'data-inert': '', tabindex: '0', 'aria-label': `${node.title}: results` });
    const h1 = h('h1.display', { tabindex: '-1', text: node.title });
    left.append(h('p.mono-label', { text: node.eyebrow }), h1, h('p.lede', { text: node.line }));
    const wrap = h('div.tool-wrap', null, left, right);
    return { wrap, left, right, h1 };
  }
  const srcLinks = (ctx, ids) => ids.length ? h('p.mono-label.dim', null, 'Sources: ', ...ids.flatMap((id, i) => { const s = ctx.D.sources.find((x) => x.id === id); return s ? [i ? ' · ' : '', h('a', { href: s.u, target: '_blank', rel: 'noopener', text: s.t })] : []; })) : null;

  ARCH.tool = function (node, el, ctx) {
    const { wrap, left, right, h1 } = shell(node, ctx);
    el.append(h('div.scene-bg', { 'data-empty': '' }), wrap);
    const make = { planner, phrasebook, kbyg, saved, credits }[node.tool];
    const inst = make ? make(node, ctx, left, right) || {} : {};
    return { focusStart: () => h1.focus({ preventScroll: true }), ...inst };
  };

  // ---------------- planner ----------------
  function planner(node, ctx, left, right) {
    const D = ctx.D;
    const now = new Date();
    const saved = store.get('rj.planner', {});
    const st = { passport: saved.passport || 'evisa', month: saved.month ?? (now.getMonth() + 1) % 12, days: saved.days || 7, people: saved.people || 2, interests: saved.interests || ['forts', 'lakes'] };
    const sel = (id, label, opts, val, on) => {
      const s = h('select', { id }, opts.map(([v, t]) => h('option', { value: v, selected: String(v) === String(val) ? 'selected' : null, text: t })));
      s.addEventListener('change', () => { on(s.value); update(); });
      return h('div.field', null, h('label', { for: id, text: label }), s);
    };
    const form = h('form', { onsubmit: (e) => e.preventDefault(), 'aria-label': 'Trip details' },
      sel('pl-pass', 'Passport', Object.entries(D.visa).map(([k, v]) => [k, v.label]), st.passport, (v) => (st.passport = v)),
      sel('pl-month', 'Month of travel', MONTHS.map((m, i) => [i, m]), st.month, (v) => (st.month = +v)));
    const daysOut = h('output', { for: 'pl-days', text: `${st.days} days` });
    const days = h('input', { type: 'range', id: 'pl-days', min: '4', max: '21', value: String(st.days), 'aria-valuetext': `${st.days} days` });
    days.addEventListener('input', () => { st.days = +days.value; daysOut.textContent = `${st.days} days`; days.setAttribute('aria-valuetext', `${st.days} days`); update(); });
    const people = h('input', { type: 'number', id: 'pl-people', min: '1', max: '12', value: String(st.people), inputmode: 'numeric' });
    people.addEventListener('input', () => { st.people = U.clamp(+people.value || 1, 1, 12); update(); });
    const ints = ['forts', 'desert', 'lakes', 'wildlife', 'temples', 'crafts'];
    const fs = h('fieldset.field', null, h('legend', { text: 'Interests' }), h('div.checks', null, ints.map((k) => {
      const c = h('input', { type: 'checkbox', value: k, checked: st.interests.includes(k) ? 'checked' : null });
      c.addEventListener('change', () => { st.interests = [...fs.querySelectorAll('input:checked')].map((x) => x.value); update(); });
      return h('label', null, c, k);
    })));
    form.append(h('div.field', null, h('label', { for: 'pl-days' }, 'Days ', daysOut), days), h('div.field', null, h('label', { for: 'pl-people', text: 'Travellers' }), people), fs);
    left.append(form);

    function update() {
      store.set('rj.planner', st);
      const route = D.routes.filter((r) => r.days <= st.days).sort((a, b) => b.days - a.days)[0] || D.routes[0];
      const spare = st.days - route.stops.reduce((s, x) => s + x.nights, 0);
      const vis = D.visa[st.passport];
      const indianRate = st.passport === 'india';
      const asiIndian = indianRate || vis.saarc;
      // route card
      const routeCard = h('div.card', null, h('p.mono-label', { text: `${route.days}-day route · ${route.stops.length} stops` }), h('h3', { text: route.title }));
      let day = 1;
      for (const s of route.stops) {
        const d0 = day; day += s.nights;
        const row = h('div.route-day', null, h('b', { text: s.nights > 1 ? `D${d0}–${day - 1}` : `D${d0}` }), h('div', null,
          h('strong', { text: s.at }), s.leg ? h('div.mono-label.dim', { text: s.leg }) : null,
          h('div', null, s.see.map((id, i) => [i ? ', ' : '', h('button', { type: 'button', onclick: () => ctx.go(id), text: ctx.get(id).title })]).flat())));
        routeCard.append(row);
      }
      if (spare > 0) routeCard.append(h('p', { style: { marginTop: '10px' }, text: `${spare} spare day${spare > 1 ? 's' : ''}: add stops from your interests below, or slow down.` }));
      // interests
      const extra = [...new Set(st.interests.flatMap((k) => D.interestStops[k] || []))].filter((id) => !route.stops.some((s) => s.see.includes(id)) && ctx.get(id));
      const extraCard = extra.length ? h('div.card', null, h('h3', { text: 'Add for your interests' }), h('p', null, extra.map((id, i) => [i ? ' · ' : '', h('button.btn.ghost.small', { type: 'button', onclick: () => ctx.go(id), text: ctx.get(id).title })]).flat())) : null;
      // season
      const fests = D.festivals.filter((f) => { const a = new Date(f.start), b = new Date(f.end || f.start); return a.getMonth() === st.month || b.getMonth() === st.month; });
      const seasonCard = h('div.card', null, h('h3', { text: MONTHS[st.month] }), h('p', { text: SEASON[D.seasons[st.month]] }),
        fests.length ? h('ul.tips', null, fests.map((f) => h('li', null, `${f.name}, ${new Date(f.start + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}${f.approx ? ' (approx.)' : ''} · ${f.place}`))) : h('p.dim', { text: 'No major festival in our calendar this month.' }),
        h('button.btn.ghost.small', { type: 'button', onclick: () => ctx.go('seasons'), text: 'Open the festival dial' }));
      // costs
      const rows = []; let inr = 0;
      const feeIds = route.stops.flatMap((s) => s.fees);
      const counted = {};
      for (const id of feeIds) counted[id] = (counted[id] || 0) + 1;
      for (const [id, n] of Object.entries(counted)) {
        const f = D.fees[id]; if (!f) continue;
        const rateIndian = id === 'kumbhalgarh' || id === 'chittorgarh' ? asiIndian : indianRate;
        const per = rateIndian ? f.in : f.fo;
        const amt = per * n * st.people; inr += amt;
        rows.push(h('tr', null, h('td', null, `${f.name}${n > 1 ? ` × ${n}` : ''}`, f.note ? h('small', { text: f.note }) : null, f.approx ? h('small', { text: 'approx.' }) : null), h('td', { text: U.money(amt) })));
      }
      let visaLine;
      if (vis.usd === 0) visaLine = 'No visa fee';
      else if (vis.usd == null) visaLine = 'See official fee table';
      else { const m = st.month; const usd = m >= 3 && m <= 5 ? vis.usdLow : vis.usd; visaLine = `US$${usd} × ${st.people} = US$${usd * st.people} (30-day e-Visa, ${m >= 3 && m <= 5 ? 'Apr–Jun rate' : 'Jul–Mar rate'}) + bank charge`; }
      const costCard = h('div.card', null, h('h3', { text: 'Entry fees we could verify' }), h('p.stamp', { text: `Confirm before booking · checked ${D.CHECKED}` }),
        h('p', { text: vis.text }),
        h('table.cost-table', null, h('tbody', null,
          h('tr', null, h('td', null, 'Visa', h('small', { text: vis.label })), h('td', { text: visaLine.startsWith('US$') ? visaLine.split(' (')[0] : visaLine })),
          ...rows,
          h('tr.total', null, h('td', { text: `Entry fees, ${st.people} traveller${st.people > 1 ? 's' : ''}, ${indianRate ? 'Indian' : 'foreign'} rates` }), h('td', { text: U.money(inr) })))),
        h('p.dim', { style: { marginTop: '8px', fontSize: '13px' }, text: 'Excludes transport, stays, food, guides and camera fees. Some sites on the route (Jaisalmer Fort, Pushkar, Ranakpur, Ajmer Sharif) are free to enter or charge small fees we could not verify.' }),
        srcLinks(ctx, ['evisa', 'embassy-us', 'fees-2026', 'fees-composite', 'ranthambore', 'keoladeo-fee']));
      U.fill(right, routeCard, extraCard, seasonCard, costCard);
      ctx.announce(`${route.title}: ${route.days}-day route. Entry fees ${U.money(inr)}.`);
    }
    update();
  }

  // ---------------- phrasebook ----------------
  function phrasebook(node, ctx, left, right) {
    const P = ctx.D.phrases;
    const canSpeak = 'speechSynthesis' in window;
    const say = (text) => { try { const u = new SpeechSynthesisUtterance(text); const v = speechSynthesis.getVoices().find((x) => /hi[-_]IN/i.test(x.lang)); if (v) u.voice = v; u.lang = 'hi-IN'; u.rate = 0.85; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) { /* speech unavailable */ } };
    const modeBtn = h('button.btn', { type: 'button', 'aria-pressed': 'false', text: 'Quiz me' });
    left.append(h('div.head-actions', null, modeBtn), h('p.mono-label.dim', { style: { marginTop: '14px' }, text: canSpeak ? 'Audio uses your device’s Hindi voice, if it has one.' : 'Your browser has no speech voice; pronunciation is written out.' }));
    function list() {
      right.replaceChildren(...P.map((p) => h('div.card.phrase', null,
        h('div', null, h('div.ph-deva', { lang: 'hi', text: p.deva }), h('div.ph-roman', { text: p.roman }), h('div.ph-say', { text: `say: ${p.say} · ${p.lang}` })),
        canSpeak ? h('button.hbtn', { type: 'button', 'aria-label': `Hear ${p.roman}`, onclick: () => say(p.deva) }, svg('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }, svg('path', { d: 'M4 9.5h3.5L12 5v14l-4.5-4.5H4z' }), svg('path', { d: 'M15.5 9a4.5 4.5 0 0 1 0 6' }))) : h('span'),
        h('p.ph-mean', { text: p.mean }))), h('p.mono-label.dim', null, 'Source for “Khamma ghani”: ', h('a', { href: ctx.D.sources.find((s) => s.id === 'khamma').u, target: '_blank', rel: 'noopener', text: 'Rajasthan Tourism' })));
    }
    let score = 0, asked = 0, order = [];
    function quiz() {
      if (!order.length) order = P.map((_, i) => i).sort(() => Math.random() - 0.5);
      const qi = order.pop(); const q = P[qi];
      const opts = [qi, ...P.map((_, i) => i).filter((i) => i !== qi).sort(() => Math.random() - 0.5).slice(0, 3)].sort(() => Math.random() - 0.5);
      const live = h('p', { 'aria-live': 'polite', text: asked ? `Score: ${score} of ${asked}` : 'Pick the meaning.' });
      const box = h('div.quiz-opts', { role: 'group', 'aria-label': 'Answers' }, opts.map((i) => {
        const b = h('button', { type: 'button', text: P[i].mean.split('.')[0].replace(/^“|”$/g, '') });
        b.addEventListener('click', () => {
          asked++; const right_ = i === qi; if (right_) score++;
          [...box.children].forEach((x, j) => { x.disabled = true; if (opts[j] === qi) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
          live.textContent = `${right_ ? 'Right.' : `Not quite: ${q.roman} means “${q.mean.split('.')[0]}”.`} Score: ${score} of ${asked}`;
          next.hidden = false; next.focus();
        });
        return b;
      }));
      const next = h('button.btn.small', { type: 'button', hidden: true, text: 'Next phrase', onclick: quiz });
      U.fill(right, h('div.card', null, h('p.mono-label', { text: 'What does this mean?' }), h('div.quiz-q', { lang: 'hi', text: q.deva }), h('p.ph-say', { text: `${q.roman} · say: ${q.say}` }),
        canSpeak ? h('button.btn.ghost.small', { type: 'button', onclick: () => say(q.deva), text: 'Hear it' }) : null), h('div.card', null, box, live, next));
      box.querySelector('button').focus();
    }
    modeBtn.addEventListener('click', () => { const on = modeBtn.getAttribute('aria-pressed') !== 'true'; modeBtn.setAttribute('aria-pressed', String(on)); modeBtn.textContent = on ? 'Back to the list' : 'Quiz me'; on ? quiz() : list(); });
    list();
  }

  // ---------------- know before you go ----------------
  function kbyg(node, ctx, left, right) {
    left.append(h('p.stamp', { text: `Confirm before booking · checked ${ctx.D.CHECKED}` }),
      h('div.card', null, h('h3', { text: 'Advisory, in one line' }), h('p', { text: 'Avoid the 10 km strip along the India–Pakistan border (UK FCDO and US State Department). The rest of Rajasthan is at standard caution for India.' })),
      h('button.btn.ghost', { type: 'button', onclick: () => ctx.go('plan'), text: 'Open the planner' }));
    right.append(h('div.kb-grid', null, ctx.D.kbyg.map((k) => h('div.card', null, h('h3', { text: k.h }), ...k.p.map((p) => h('p', { text: p })), srcLinks(ctx, k.src)))));
    const ft = h('table.cost-table', null, h('tbody', null, Object.values(ctx.D.fees).map((f) => h('tr', null, h('td', null, f.name, f.note ? h('small', { text: f.note }) : null), h('td', { text: `₹${f.in.toLocaleString('en-IN')} / ₹${f.fo.toLocaleString('en-IN')}${f.approx ? ' ≈' : ''}` })))));
    right.append(h('div.card', { style: { marginTop: '12px' } }, h('h3', { text: 'Entry fees (Indian / foreign)' }), ft, srcLinks(ctx, ['fees-2026', 'fees-composite', 'ranthambore', 'keoladeo-fee'])));
  }

  // ---------------- saved places ----------------
  function saved(node, ctx, left, right) {
    function render() {
      const ids = ctx.saved();
      if (!ids.length) { right.replaceChildren(h('div.card', null, h('p.empty', { text: 'Nothing saved yet. Press “Save” on any place to keep it here.' }), h('button.btn.ghost.small', { type: 'button', onclick: () => ctx.go('wonders'), text: 'Start with the seven wonders' }))); return; }
      right.replaceChildren(h('ul.nearby', null, ids.map((id) => {
        const n = ctx.get(id); const path = ctx.pathOf(id).slice(1, -1).map((p) => ctx.get(p).crumb || ctx.get(p).title).join(' › ');
        const rm = h('button.btn.ghost.small', { type: 'button', 'aria-label': `Remove ${n.title}`, text: 'Remove', onclick: () => { ctx.toggleSave(id); render(); } });
        return h('li', { style: { display: 'flex', gap: '8px', alignItems: 'center' } }, h('button', { type: 'button', onclick: () => ctx.go(id) }, h('span.nb-name', { text: n.title }), h('span.nb-meta', { text: path })), rm);
      })));
    }
    left.append(h('p.mono-label.dim', { text: 'Saved in this browser only. If storage is blocked, the list lasts until you close the tab.' }));
    render();
  }

  // ---------------- credits ----------------
  function credits(node, ctx, left, right) {
    const P = window.RJ_PHOTOS || {};
    const items = ctx.D.gallery().filter((g) => P[g.slot]);
    left.append(h('div.card', null, h('h3', { text: 'How this was made' }),
      h('p', { text: 'Every photo is from Wikimedia Commons under CC0, public domain, CC BY or CC BY-SA, resized and bundled with the site. Map outlines are Natural Earth (public domain). Sound is synthesised in your browser.' }),
      h('p', { text: `Facts were checked on ${ctx.D.CHECKED}. Fees and dates change: confirm before booking.` })));
    right.append(h('h2.title', { style: { fontSize: '22px' }, text: `Photographs (${items.length})` }),
      h('ul.credit-list', null, items.map((g) => { const p = P[g.slot]; return h('li', null, h('img', { src: `img/${g.slot}-800.jpg`, alt: '', loading: 'lazy', width: 64, height: 44 }),
        h('div', null, h('strong', { text: g.caption }), h('br'), h('a', { href: p.source, target: '_blank', rel: 'noopener', text: p.author }), ' · ', p.licenseUrl ? h('a', { href: p.licenseUrl, target: '_blank', rel: 'noopener', text: p.license }) : p.license)); })),
      h('h2.title', { style: { fontSize: '22px', marginTop: '24px' }, text: 'Sources' }),
      h('ol.source-list', null, ctx.D.sources.map((s) => h('li', null, h('a', { href: s.u, target: '_blank', rel: 'noopener', text: s.t })))));
  }
})();
