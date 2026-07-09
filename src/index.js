// reg-konomi SDK · sovereign single-file library · MIT · AI-Native Solutions
// Extracted from reg-konomi/index.html · 5767 bytes of source logic
// Public-safe: no primes/glyphs/dyad references

'use strict';
const STATE = {
  data: null,
  entries: [],   // normalized [{name, kind, category, purpose, url, source, tier, status, prime, domain, version, shipped}]
  filterKind: null,
  q: '',
};
const CATEGORY_ORDER = ['apps','apis','sdks','research','infra','plugins'];
const CATEGORY_LABEL = {
  apps: 'Apps',
  apis: 'APIs',
  sdks: 'SDKs',
  research: 'Research substrate',
  infra: 'Infrastructure',
  plugins: 'Plugins',
};
async function loadRegistry() {
  try {
    const r = await fetch('index.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    STATE.data = data;
    // flatten into entries
    const entries = [];
    for (const cat of CATEGORY_ORDER) {
      const arr = data[cat];
      if (!Array.isArray(arr)) continue;
      for (const e of arr) {
        entries.push({ ...e, _section: cat });
      }
    }
    STATE.entries = entries;
    // meta line
    const updated = data.updatedAt ? new Date(data.updatedAt).toISOString().split('T')[0] : '?';
    $('#meta-line').textContent = `registry v${data.registryVersion || '?'} · ${entries.length} entries · last updated ${updated}`;
    $('#loading').style.display = 'none';
    renderChips();
    render();
  } catch (e) {
    $('#loading').textContent = '✗ could not load registry: ' + e.message;
    console.error(e);
  }
}
function renderChips() {
  const counts = {};
  for (const e of STATE.entries) counts[e._section] = (counts[e._section] || 0) + 1;
  const wrap = $('#kind-chips');
  wrap.innerHTML = '';
  const all = document.createElement('button');
  all.className = 'chip' + (STATE.filterKind === null ? ' on' : '');
  all.innerHTML = `all <span class="n">${STATE.entries.length}</span>`;
  all.onclick = () => { STATE.filterKind = null; renderChips(); render(); };
  wrap.appendChild(all);
  for (const cat of CATEGORY_ORDER) {
    if (!counts[cat]) continue;
    const c = document.createElement('button');
    c.className = 'chip' + (STATE.filterKind === cat ? ' on' : '');
    c.innerHTML = `${cat} <span class="n">${counts[cat]}</span>`;
    c.onclick = () => { STATE.filterKind = STATE.filterKind === cat ? null : cat; renderChips(); render(); };
    wrap.appendChild(c);
  }
}
function matchesQuery(e, q) {
  if (!q) return true;
  const hay = `${e.name || ''} ${e.purpose || ''} ${e.domain || ''} ${e.category || ''} ${e.prime || ''} ${e.url || ''} ${e.tier || ''}`.toLowerCase();
  return q.toLowerCase().split(/\s+/).every(tok => hay.includes(tok));
}
function render() {
  const filtered = STATE.entries.filter(e => {
    if (STATE.filterKind && e._section !== STATE.filterKind) return false;
    if (!matchesQuery(e, STATE.q)) return false;
    return true;
  });
  $('#totals').textContent = `showing ${filtered.length} of ${STATE.entries.length} organs${STATE.q ? ` matching "${STATE.q}"` : ''}${STATE.filterKind ? ` in ${STATE.filterKind}` : ''}`;
  const target = $('#results');
  target.innerHTML = '';
  if (!filtered.length) {
    const e = document.createElement('div');
    e.className = 'empty';
    e.textContent = '/nothing matches/ · try a different search';
    target.appendChild(e);
    return;
  }
  // Group by _section when no filter; flat when filtered
  const groups = {};
  for (const e of filtered) {
    const k = STATE.filterKind ? '_' : e._section;
    groups[k] = groups[k] || [];
    groups[k].push(e);
  }
  for (const cat of (STATE.filterKind ? ['_'] : CATEGORY_ORDER)) {
    const arr = groups[cat];
    if (!arr) continue;
    if (!STATE.filterKind) {
      const h = document.createElement('div');
      h.className = 'section-head';
      h.innerHTML = `${CATEGORY_LABEL[cat] || cat} <span class="n">${arr.length}</span>`;
      target.appendChild(h);
    }
    const grid = document.createElement('div');
    grid.className = 'grid';
    // sort by prime asc, then name asc
    arr.sort((a,b) => (a.prime||9999) - (b.prime||9999) || (a.name||'').localeCompare(b.name||''));
    for (const e of arr) {
      grid.appendChild(card(e));
    }
    target.appendChild(grid);
  }
}
function card(e) {
  const c = document.createElement('div');
  c.className = 'card';
  c.innerHTML = `
    <h3 class="name">${escapeHtml(e.name || '?')}</h3>
    <div class="purpose">${escapeHtml(e.purpose || e.description || '')}</div>
    <div class="meta">
      ${e.kind ? `<span class="tag kind">${escapeHtml(e.kind)}</span>` : ''}
      ${e.tier ? `<span class="tag tier ${e.tier}">tier ${escapeHtml(e.tier)}</span>` : ''}
      ${e.status === 'live' ? '<span class="tag live">live</span>' : ''}
      ${e.status === 'private' ? '<span class="tag private">private</span>' : ''}
      ${e.prime ? `<span class="tag prime">prime ${e.prime}</span>` : ''}
      ${e.shipped ? `<span class="tag">shipped ${escapeHtml(String(e.shipped).slice(0,10))}</span>` : ''}
    </div>
    <div class="links">
      ${e.url ? `<a class="primary" href="${escapeAttr(e.url)}" target="_blank" rel="noopener">open →</a>` : ''}
      ${e.source ? `<a href="${escapeAttr(e.source)}" target="_blank" rel="noopener">repo</a>` : ''}
    </div>
  `;
  return c;
}
function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escapeAttr(s) { return escapeHtml(s); }
  $('#q').addEventListener('input', (e) => {
    STATE.q = e.target.value.trim();
    render();
  });
  loadRegistry();
});

// Named exports for the primary API surface
export { loadRegistry };
export { renderChips };
export { matchesQuery };
export { card };
export { escapeHtml };
export { escapeAttr };
export { $ };
export { $$ };

export { STATE };
export { CATEGORY_ORDER };
export { CATEGORY_LABEL };
