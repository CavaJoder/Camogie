/* ============================================================
   app.js  –  GK Drills v2.0 Application Logic
   ============================================================ */

(function () {
  'use strict';

  /* ── State ── */
  const state = {
    filters: {
      search: '',
      category: 'All',
      sport: 'All',
      ageGroup: 'All',
      difficulty: 'All',
      rating: 'All'
    },
    editingDrillId: null,
    pendingDrillId: null // used when creating a session plan from the drill detail modal
  };

  /* ── DOM Refs ── */
  const drillGrid   = document.getElementById('drill-grid');
  const resultCount = document.getElementById('result-count');
  const searchInput = document.getElementById('search-input');
  const sessionsSection = document.getElementById('sessions-section');
  const drillsFilterBar = document.getElementById('drills-filter-bar');

  /* ── Get Category Icon ── */
  function getCategoryIcon(cat) {
    const icons = {
      'Shot Stopping': '🧤',
      'Puckout & Distribution': '🏑',
      'Footwork & Positioning': '👟',
      'Handling & Ball Control': '✋',
      '1v1 & Breakaway': '⚡',
      'Communication & Organisation': '📢'
    };
    return icons[cat] || '⭐';
  }

  /* ── Get All Drills (built-in + custom + edited + ratings from localStorage) ── */
  function getAllDrills() {
    const custom = JSON.parse(localStorage.getItem('gk_custom_drills') || '[]');
    const edited = JSON.parse(localStorage.getItem('gk_edited_drills') || '{}');
    const ratings = JSON.parse(localStorage.getItem('gk_drill_ratings') || '{}');

    const base = [...window.DRILLS, ...custom];
    return base.map(d => {
      let finalDrill = edited[d.id] ? { ...d, ...edited[d.id] } : d;
      finalDrill.rating = ratings[d.id] !== undefined ? ratings[d.id] : null;
      return finalDrill;
    });
  }

  /* ── Filter Logic ── */
  function filteredDrills() {
    const f = state.filters;
    return getAllDrills().filter(d => {
      const q = f.search.toLowerCase();
      if (q && !d.title.toLowerCase().includes(q)
            && !d.subtitle?.toLowerCase().includes(q)
            && !d.category.toLowerCase().includes(q)) return false;
      if (f.category !== 'All' && d.category !== f.category) return false;
      if (f.sport !== 'All' && d.sport !== 'Both' && d.sport !== f.sport) return false;
      if (f.ageGroup !== 'All' && d.ageGroup !== f.ageGroup) return false;
      if (f.difficulty !== 'All' && d.difficulty !== f.difficulty) return false;
      
      // Rating filter constraint
      if (f.rating !== 'All') {
        if (f.rating === 'Unrated') {
          if (d.rating !== null && d.rating !== undefined) return false;
        } else {
          const minRating = parseFloat(f.rating);
          if (!d.rating || d.rating < minRating) return false;
        }
      }
      return true;
    });
  }

  /* ── Render Drill Card ── */
  function renderCard(drill) {
    const card = document.createElement('article');
    card.className = 'drill-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Open ${drill.title} drill`);

    const obj0 = drill.objective[0] || {};
    const ratingHtml = drill.rating ? `<span class="dc-rating-badge">⭐ ${drill.rating}/10</span>` : '';

    card.innerHTML = `
      <div class="dc-header">
        <div class="dc-cat-row">
          <span class="dc-cat-badge">${drill.categoryIcon} ${drill.category}</span>
          <div>
            ${ratingHtml}
            <span class="dc-sport-tag">${drill.sport}</span>
          </div>
        </div>
        <h3>${drill.title}</h3>
        <p>${drill.subtitle || ''}</p>
      </div>
      <div class="dc-body">
        <div class="dc-meta">
          <div class="dc-meta-item"><span class="mi">⏱️</span> ${drill.duration}</div>
          <div class="dc-meta-item"><span class="mi">👥</span> ${drill.players}</div>
          <div class="dc-meta-item"><span class="mi">📐</span> ${drill.space}</div>
        </div>
        <div class="dc-objective">
          ${obj0.icon ? `<strong>${obj0.icon}</strong> ` : ''}${obj0.text || 'View drill details →'}
        </div>
      </div>
      <div class="dc-footer">
        <div style="display:flex;flex-direction:column;gap:4px;">
          <span class="dc-difficulty diff-${drill.difficulty.toLowerCase()}">${drill.difficulty}</span>
          <span class="dc-age-tag">👶 ${drill.ageGroup}</span>
        </div>
        <span class="dc-cta">View Drill →</span>
      </div>
    `;

    card.addEventListener('click', () => openDrillModal(drill));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openDrillModal(drill); });
    return card;
  }

  /* ── Render Grid ── */
  function renderGrid() {
    const drills = filteredDrills();
    resultCount.textContent = `${drills.length} drill${drills.length !== 1 ? 's' : ''} found`;

    drillGrid.innerHTML = '';

    if (drills.length === 0) {
      drillGrid.innerHTML = `
        <div class="empty-state">
          <div class="es-icon">🔍</div>
          <h3>No drills found</h3>
          <p>Try adjusting your filters or adding a custom drill.</p>
        </div>`;
      return;
    }

    // Group by category for visual organisation when default
    if (state.filters.category === 'All' &&
        state.filters.search === '' &&
        state.filters.sport === 'All' &&
        state.filters.ageGroup === 'All' &&
        state.filters.difficulty === 'All' &&
        state.filters.rating === 'All') {
      const categories = [...new Set(drills.map(d => d.category))];
      categories.forEach(cat => {
        const catDrills = drills.filter(d => d.category === cat);
        const catIcon = catDrills[0]?.categoryIcon || '';

        const section = document.createElement('div');
        section.className = 'category-section';
        section.innerHTML = `
          <div class="category-header">
            <div class="cat-icon-badge">${catIcon}</div>
            <span class="cat-name">${cat}</span>
            <span class="cat-count">${catDrills.length} drills</span>
          </div>
        `;

        const grid = document.createElement('div');
        grid.className = 'drill-grid';
        catDrills.forEach(d => grid.appendChild(renderCard(d)));
        section.appendChild(grid);
        drillGrid.appendChild(section);
      });
    } else {
      // Flat grid when filtered
      drillGrid.className = 'drill-grid';
      drills.forEach(d => drillGrid.appendChild(renderCard(d)));
    }
  }

  /* ── Open Drill Detail Modal ── */
  function openDrillModal(drill) {
    const overlay = document.getElementById('drill-modal');
    const body    = document.getElementById('drill-modal-body');

    const hasDiagram = drill.diagram && (drill.diagram.gk || drill.diagram.defenders?.length || drill.diagram.attackers?.length);

    // Build diagram
    let diagramHtml = '';
    if (hasDiagram) {
      const d = drill.diagram;
      let dots = '';
      if (d.gk) dots += `<div class="player-dot dot-gk" style="left:${d.gk.x}%;top:${d.gk.y}%" title="Goalkeeper">GK</div>`;
      (d.defenders || []).forEach(p => {
        dots += `<div class="player-dot dot-defender" style="left:${p.x}%;top:${p.y}%" title="${p.label || 'Defender'}">${p.label || 'D'}</div>`;
      });
      (d.attackers || []).forEach(p => {
        dots += `<div class="player-dot dot-attacker" style="left:${p.x}%;top:${p.y}%" title="${p.label || 'Attacker'}">${p.label || 'A'}</div>`;
      });
      (d.cones || []).forEach(p => {
        dots += `<div class="player-dot dot-cone" style="left:${p.x}%;top:${p.y}%" title="Cone"></div>`;
      });

      let legendHtml = `
        <div class="legend-item"><div class="legend-dot" style="background:#7c3aed;"></div> Goalkeeper</div>
      `;
      if ((d.defenders || []).length) legendHtml += `<div class="legend-item"><div class="legend-dot" style="background:#1a4fa8;"></div> Defenders</div>`;
      if ((d.attackers || []).length) legendHtml += `<div class="legend-item"><div class="legend-dot" style="background:#b91c1c;"></div> Attackers/Servers</div>`;
      if ((d.cones || []).length) legendHtml += `<div class="legend-item"><div class="legend-dot" style="background:#f5c518;border:1px solid #ccc;"></div> Cones/Targets</div>`;

      diagramHtml = `
        <div class="m-card">
          <div class="section-header">
            <div class="section-icon si-blue">📋</div>
            <div><div class="section-title">Pitch Setup</div><div class="section-subtitle">Approximate starting positions</div></div>
          </div>
          <div class="pitch-diagram" style="min-height:220px;">${dots}</div>
          <div class="pitch-legend" style="margin-top:12px;">${legendHtml}</div>
        </div>`;
    }

    // Build objectives
    const objHtml = (drill.objective || []).map(o =>
      `<div class="key-point"><span class="kp-icon">${o.icon || '🎯'}</span>${o.text || o}</div>`
    ).join('');

    // Build equipment
    const eqHtml = (drill.equipment || []).map(e =>
      `<li class="phase-item"><div class="phase-num check">✓</div><div class="phase-text">${e}</div></li>`
    ).join('');

    // Build phases
    const phaseHtml = (drill.phases || []).map((p, i) =>
      `<li class="phase-item"><div class="phase-num">${i+1}</div><div class="phase-text">${p.text || p}</div></li>`
    ).join('');

    // Build coaching cues
    const cueHtml = (drill.coachingCues || []).map(c =>
      `<span class="cue-tag">${c}</span>`
    ).join('');

    // Build progressions
    const progHtml = (drill.progressions || []).map((p, i) => {
      const cls = i === 0 ? 'lvl-1' : i === 1 ? 'lvl-2' : 'lvl-3';
      return `<tr><td><span class="level-pill ${cls}">${p.level}</span></td><td>${p.text}</td></tr>`;
    }).join('');

    // Build success criteria
    const successHtml = (drill.successCriteria || []).map(s =>
      `<div class="key-point success"><span class="kp-icon">✅</span>${s}</div>`
    ).join('');

    // Get Session Options
    const sessions = JSON.parse(localStorage.getItem('gk_session_plans') || '[]');
    const sessionOpts = sessions.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

    body.innerHTML = `
      <!-- HERO -->
      <div class="modal-hero">
        <button class="modal-close" onclick="closeModal('drill-modal')" aria-label="Close">✕</button>
        <div class="modal-badge print-hide">${drill.categoryIcon} ${drill.category}</div>
        <h2>${drill.title}</h2>
        <p>${drill.subtitle || ''}</p>
        <div class="modal-meta print-hide">
          <div class="modal-meta-pill"><span>👶</span>${drill.ageGroup}</div>
          <div class="modal-meta-pill"><span>⏱️</span>${drill.duration}</div>
          <div class="modal-meta-pill"><span>👥</span>${drill.players} Players</div>
          <div class="modal-meta-pill"><span>📐</span>${drill.space}</div>
          <div class="modal-meta-pill"><span>🏑</span>${drill.sport}</div>
          <div class="modal-meta-pill"><span>⚠️</span>Helmets Required</div>
        </div>
      </div>

      <!-- MODAL TOOLBAR: Ratings, Add to Session, Edit, Print -->
      <div class="modal-toolbar" style="background:#f4faf6; border-bottom:1.5px solid var(--border); padding:14px 32px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <!-- Star Selector -->
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:12px; font-weight:700; color:var(--text);">Rating:</span>
          <div class="rating-selector">
            ${Array.from({length: 10}, (_, idx) => {
              const starVal = idx + 1;
              const active = drill.rating >= starVal ? 'active' : 'inactive';
              const symbol = drill.rating >= starVal ? '★' : '☆';
              return `<button class="rating-star-btn ${active}" onclick="rateDrill('${drill.id}', ${starVal})" title="Rate ${starVal}/10">${symbol}</button>`;
            }).join('')}
          </div>
          ${drill.rating ? `<strong style="font-size:13px; color:var(--green);">${drill.rating}/10</strong>` : '<span style="font-size:11px; color:var(--muted);">Not Rated</span>'}
        </div>

        <!-- Toolbar Actions -->
        <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
          <!-- Add to Session plan list -->
          <select id="modal-session-select" class="form-select" style="padding:6px 12px; font-size:12px; width:160px; min-height:auto;" onchange="addDrillToSessionFromModal('${drill.id}', this)">
            <option value="">➕ Add to Session...</option>
            ${sessionOpts}
            <option value="NEW_PLAN">＋ Create New Plan...</option>
          </select>
          <button class="btn btn-ghost" onclick="editDrill('${drill.id}')" style="padding:6px 14px; font-size:12px; background:#fff; border-color:var(--border); color:var(--text);"><span class="btn-icon">✏️</span> Edit</button>
          <button class="btn btn-primary" onclick="window.print()" style="padding:6px 14px; font-size:12px; background:var(--green); box-shadow:none;"><span class="btn-icon">🖨️</span> Print PDF</button>
        </div>
      </div>

      <!-- BODY -->
      <div class="modal-body">

        <!-- Objective + Equipment -->
        <div class="two-col print-hide">
          <div class="m-card">
            <div class="section-header">
              <div class="section-icon si-green">🎯</div>
              <div><div class="section-title">Drill Objective</div><div class="section-subtitle">What players will learn</div></div>
            </div>
            ${objHtml}
          </div>
          <div class="m-card">
            <div class="section-header">
              <div class="section-icon si-gold">🎒</div>
              <div><div class="section-title">Equipment Needed</div><div class="section-subtitle">Set up before the session</div></div>
            </div>
            <ul class="phase-list">${eqHtml}</ul>
          </div>
        </div>

        <!-- Pitch Diagram -->
        ${diagramHtml}

        <!-- Drill Phases -->
        <div class="m-card">
          <div class="section-header">
            <div class="section-icon si-green">▶️</div>
            <div><div class="section-title">Drill Phases</div><div class="section-subtitle">Run each phase before adding the next</div></div>
          </div>
          <ul class="phase-list">${phaseHtml}</ul>
        </div>

        <!-- Cues + Progressions -->
        <div class="two-col">
          <div class="m-card">
            <div class="section-header">
              <div class="section-icon si-gold">💬</div>
              <div><div class="section-title">Coaching Cues</div><div class="section-subtitle">Phrases to use on the pitch</div></div>
            </div>
            <div class="cue-wrap">${cueHtml}</div>
          </div>
          <div class="m-card">
            <div class="section-header">
              <div class="section-icon si-purple">📈</div>
              <div><div class="section-title">Progressions</div><div class="section-subtitle">Make it easier or harder</div></div>
            </div>
            <table class="prog-table">
              <thead><tr><th>Level</th><th>Modification</th></tr></thead>
              <tbody>${progHtml}</tbody>
            </table>
          </div>
        </div>

        <!-- Safety -->
        <div class="safety-box print-hide">
          <span class="s-icon">⛑️</span>
          <div>
            <h3>Safety Reminders</h3>
            <p>${drill.safety || 'All players must wear helmets and gum shields at all times when a sliotar is in play. Warm up before any contact or diving work.'}</p>
          </div>
        </div>

        <!-- Success Criteria -->
        <div class="m-card print-hide">
          <div class="section-header">
            <div class="section-icon si-blue">🏆</div>
            <div><div class="section-title">Success Criteria</div><div class="section-subtitle">What good execution looks like</div></div>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            ${successHtml}
          </div>
        </div>

      </div>
    `;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  /* ── Rate Drill Callback ── */
  window.rateDrill = function (drillId, rating) {
    const ratings = JSON.parse(localStorage.getItem('gk_drill_ratings') || '{}');
    ratings[drillId] = rating;
    localStorage.setItem('gk_drill_ratings', JSON.stringify(ratings));

    // Re-load the updated drill object and refresh modal body
    const all = getAllDrills();
    const updated = all.find(d => d.id === drillId);
    if (updated) {
      openDrillModal(updated);
    }
    renderGrid();
    showToast(`⭐ Rated ${rating}/10!`);
  };

  /* ── Add to Session Handler from Modal dropdown ── */
  window.addDrillToSessionFromModal = function (drillId, selectEl) {
    const val = selectEl.value;
    if (!val) return;

    if (val === 'NEW_PLAN') {
      state.pendingDrillId = drillId;
      document.getElementById('session-form').reset();
      document.getElementById('s-date').value = new Date().toISOString().split('T')[0];
      closeModal('drill-modal');
      setTimeout(() => {
        document.getElementById('session-modal').classList.add('open');
        document.body.style.overflow = 'hidden';
      }, 250);
    } else {
      addDrillToSessionPlan(drillId, val);
      selectEl.value = '';
    }
  };

  /* ── Save Session Plan (Add from modal or create blank) ── */
  window.saveSessionPlan = function () {
    const name = document.getElementById('s-name').value.trim();
    const date = document.getElementById('s-date').value;
    const notes = document.getElementById('s-notes').value.trim();

    if (!name || !date) return;

    const newPlan = {
      id: 'session-' + Date.now(),
      name: name,
      date: date,
      notes: notes,
      drillIds: []
    };

    const sessions = JSON.parse(localStorage.getItem('gk_session_plans') || '[]');
    sessions.push(newPlan);
    localStorage.setItem('gk_session_plans', JSON.stringify(sessions));

    closeModal('session-modal');
    showToast('📅 Session plan created!');

    // If there was a pending drill, append it immediately
    if (state.pendingDrillId) {
      addDrillToSessionPlan(state.pendingDrillId, newPlan.id);
      state.pendingDrillId = null;
    } else {
      renderSessions();
    }
  };

  /* ── Append Drill to Session ── */
  function addDrillToSessionPlan(drillId, sessionId) {
    const sessions = JSON.parse(localStorage.getItem('gk_session_plans') || '[]');
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx === -1) return;

    if (!sessions[idx].drillIds.includes(drillId)) {
      sessions[idx].drillIds.push(drillId);
      localStorage.setItem('gk_session_plans', JSON.stringify(sessions));
      showToast(`✅ Drill added to ${sessions[idx].name}!`);
    } else {
      showToast(`⚠️ Drill is already in this session!`);
    }
    renderSessions();
  }

  /* ── Remove Drill from Session ── */
  window.removeDrillFromSession = function (drillId, sessionId) {
    const sessions = JSON.parse(localStorage.getItem('gk_session_plans') || '[]');
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx === -1) return;

    sessions[idx].drillIds = sessions[idx].drillIds.filter(id => id !== drillId);
    localStorage.setItem('gk_session_plans', JSON.stringify(sessions));
    showToast('🗑️ Drill removed from session plan.');
    renderSessions();
  };

  /* ── Delete Session Plan ── */
  window.deleteSessionPlan = function (sessionId) {
    if (!confirm('Are you sure you want to delete this session plan?')) return;
    let sessions = JSON.parse(localStorage.getItem('gk_session_plans') || '[]');
    sessions = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem('gk_session_plans', JSON.stringify(sessions));
    showToast('🗑️ Session plan deleted.');
    renderSessions();
  };

  /* ── Print Single Session Plan PDF ── */
  window.printSession = function(sessionId) {
    const cards = document.querySelectorAll('.session-plan-card');
    cards.forEach(c => {
      if (c.id === `session-card-${sessionId}`) {
        c.classList.remove('no-print');
      } else {
        c.classList.add('no-print');
      }
    });

    window.print();

    // Reset layout
    setTimeout(() => {
      cards.forEach(c => c.classList.remove('no-print'));
    }, 1000);
  };

  /* ── Render Sessions Section ── */
  function renderSessions() {
    const sessions = JSON.parse(localStorage.getItem('gk_session_plans') || '[]');
    const allDrills = getAllDrills();

    sessionsSection.innerHTML = `
      <div class="sessions-top-row">
        <h2 class="sessions-title">My Session Plans</h2>
        <button class="btn btn-primary" onclick="document.getElementById('session-modal').classList.add('open'); document.body.style.overflow='hidden'">
          <span class="btn-icon">＋</span> Create Plan
        </button>
      </div>
    `;

    if (sessions.length === 0) {
      sessionsSection.innerHTML += `
        <div class="empty-state" style="padding: 60px 0;">
          <div class="es-icon">📋</div>
          <h3>No session plans yet</h3>
          <p>Create a plan or select a drill in the library and add it to start organizing your training.</p>
        </div>
      `;
      return;
    }

    // Sort by date (newest first)
    sessions.sort((a,b) => new Date(b.date) - new Date(a.date));

    sessions.forEach(session => {
      const card = document.createElement('div');
      card.className = 'session-plan-card';
      card.id = `session-card-${session.id}`;

      // Build drill elements
      let drillsHtml = '';
      let drillsPrintHtml = '';

      if (session.drillIds.length === 0) {
        drillsHtml = `<p style="font-size:12px; color:var(--muted); padding:10px 0;">No drills added to this session yet.</p>`;
      } else {
        drillsHtml = session.drillIds.map(dId => {
          const drill = allDrills.find(d => d.id === dId);
          if (!drill) return '';
          return `
            <div class="session-drill-item">
              <div class="session-drill-info" onclick="openDrillModalById('${drill.id}')">
                <div>
                  <div class="session-drill-title">${drill.title}</div>
                  <div class="session-drill-cat">${drill.categoryIcon} ${drill.category} · ${drill.duration}</div>
                </div>
              </div>
              <button class="btn-cancel" style="padding:6px 12px; font-size:11px; margin-left:10px; min-height:auto;" onclick="removeDrillFromSession('${drill.id}', '${session.id}')">✕ Remove</button>
            </div>
          `;
        }).join('');

        // Build detailed printed list (Drill Name, Setup, Phases, Coaching Cues, and Progressions only)
        drillsPrintHtml = session.drillIds.map((dId, idx) => {
          const drill = allDrills.find(d => d.id === dId);
          if (!drill) return '';

          // Pitch Setup Diagram
          let diagramHtml = '';
          const hasDiagram = drill.diagram && (drill.diagram.gk || drill.diagram.defenders?.length || drill.diagram.attackers?.length);
          if (hasDiagram) {
            const d = drill.diagram;
            let dots = '';
            if (d.gk) dots += `<div class="player-dot dot-gk" style="left:${d.gk.x}%;top:${d.gk.y}%">GK</div>`;
            (d.defenders || []).forEach(p => {
              dots += `<div class="player-dot dot-defender" style="left:${p.x}%;top:${p.y}%">${p.label || 'D'}</div>`;
            });
            (d.attackers || []).forEach(p => {
              dots += `<div class="player-dot dot-attacker" style="left:${p.x}%;top:${p.y}%">${p.label || 'A'}</div>`;
            });
            (d.cones || []).forEach(p => {
              dots += `<div class="player-dot dot-cone" style="left:${p.x}%;top:${p.y}%"></div>`;
            });

            let legendHtml = `
              <div class="legend-item"><div class="legend-dot" style="background:#7c3aed;"></div> Goalkeeper</div>
            `;
            if ((d.defenders || []).length) legendHtml += `<div class="legend-item"><div class="legend-dot" style="background:#1a4fa8;"></div> Defenders</div>`;
            if ((d.attackers || []).length) legendHtml += `<div class="legend-item"><div class="legend-dot" style="background:#b91c1c;"></div> Attackers</div>`;

            diagramHtml = `
              <div class="m-card" style="margin-bottom: 12px; flex: 1; min-width: 280px;">
                <h5 style="font-size:11px; text-transform: uppercase; margin-bottom:8px; color:var(--green); letter-spacing: 0.8px;">Pitch Setup</h5>
                <div class="pitch-diagram" style="min-height:160px; height:160px;">${dots}</div>
                <div class="pitch-legend" style="margin-top: 8px;">${legendHtml}</div>
              </div>`;
          }

          // Phases
          const phaseHtml = (drill.phases || []).map((p, i) =>
            `<li class="phase-item"><div class="phase-num">${i+1}</div><div class="phase-text">${p.text || p}</div></li>`
          ).join('');

          // Coaching Cues
          const cueHtml = (drill.coachingCues || []).map(c =>
            `<span class="cue-tag" style="font-size:11px; padding:3px 8px;">${c}</span>`
          ).join('');

          // Progressions
          const progHtml = (drill.progressions || []).map((p, i) => {
            const cls = i === 0 ? 'lvl-1' : i === 1 ? 'lvl-2' : 'lvl-3';
            return `<tr><td><span class="level-pill ${cls}">${p.level}</span></td><td>${p.text}</td></tr>`;
          }).join('');

          return `
            <div class="print-drill-detail-block" style="page-break-before: always; margin-top: 25px; border-top: 1.5px dashed #ccc; padding-top: 20px;">
              <h3 style="font-size: 16px; font-weight: 800; color: var(--green); margin-bottom: 3px;">Drill ${idx + 1}: ${drill.title}</h3>
              <p style="font-size: 12px; color: var(--muted); margin-bottom: 12px;">${drill.subtitle || ''}</p>
              
              <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 12px;">
                ${diagramHtml}
                <div class="m-card" style="margin-bottom: 12px; flex: 1.2; min-width: 280px;">
                  <h5 style="font-size:11px; text-transform: uppercase; margin-bottom:8px; color:var(--green); letter-spacing: 0.8px;">Coaching Cues</h5>
                  <div class="cue-wrap" style="margin-bottom: 12px;">${cueHtml}</div>
                  
                  <h5 style="font-size:11px; text-transform: uppercase; margin-bottom:6px; color:var(--green); letter-spacing: 0.8px;">Progressions</h5>
                  <table class="prog-table">
                    <tbody>${progHtml}</tbody>
                  </table>
                </div>
              </div>

              <div class="m-card" style="margin-bottom: 12px;">
                <h5 style="font-size:11px; text-transform: uppercase; margin-bottom:8px; color:var(--green); letter-spacing: 0.8px;">Drill Phases</h5>
                <ul class="phase-list">${phaseHtml}</ul>
              </div>
            </div>
          `;
        }).join('');
      }

      card.innerHTML = `
        <div class="session-header-row">
          <div class="session-title-area">
            <h3>${session.name}</h3>
            <div class="session-date">📅 ${new Date(session.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          <div class="session-actions">
            <button class="btn btn-ghost" onclick="printSession('${session.id}')" style="padding:8px 14px; font-size:12px; background:#fff; border-color:var(--border);"><span class="btn-icon">🖨️</span> Print PDF</button>
            <button class="btn-cancel" onclick="deleteSessionPlan('${session.id}')" style="padding:8px 14px; font-size:12px; background:#fdecea; color:#b91c1c; border-color:#f8b4b4;">Delete Plan</button>
          </div>
        </div>

        ${session.notes ? `<div class="session-notes">${session.notes}</div>` : ''}

        <!-- Screen visible drill list outline -->
        <div class="session-drills-list">
          <h4 style="font-size:12px; text-transform:uppercase; color:var(--green); margin-bottom:8px; font-weight:700;">Drills Outline</h4>
          ${drillsHtml}
        </div>

        <!-- Print-only detailed drills sequence -->
        <div class="session-print-drills">
          ${drillsPrintHtml}
        </div>
      `;
      sessionsSection.appendChild(card);
    });
  }

  /* ── Open Drill Detail by ID ── */
  window.openDrillModalById = function (drillId) {
    const drill = getAllDrills().find(d => d.id === drillId);
    if (drill) openDrillModal(drill);
  };

  /* ── View Switcher ── */
  window.switchView = function (view) {
    const tabLib = document.getElementById('tab-library');
    const tabSes = document.getElementById('tab-sessions');
    
    if (view === 'library') {
      tabLib.classList.add('active');
      tabSes.classList.remove('active');
      drillsFilterBar.style.display = '';
      drillGrid.style.display = '';
      sessionsSection.style.display = 'none';
      renderGrid();
    } else {
      tabLib.classList.remove('active');
      tabSes.classList.add('active');
      drillsFilterBar.style.display = 'none';
      drillGrid.style.display = 'none';
      sessionsSection.style.display = 'block';
      renderSessions();
    }
  };

  /* ── Edit Drill Setup ── */
  window.editDrill = function (drillId) {
    closeModal('drill-modal');

    const drill = getAllDrills().find(d => d.id === drillId);
    if (!drill) return;

    state.editingDrillId = drillId;

    // Set Modal Form values
    document.getElementById('add-modal-title').textContent = 'Edit Drill Details';
    document.getElementById('f-title').value = drill.title || '';
    document.getElementById('f-subtitle').value = drill.subtitle || '';
    document.getElementById('f-category').value = drill.category || 'Custom';
    document.getElementById('f-sport').value = drill.sport || 'Both';
    document.getElementById('f-age').value = drill.ageGroup || 'Senior';
    document.getElementById('f-difficulty').value = drill.difficulty || 'Standard';
    document.getElementById('f-duration').value = drill.duration || '20 mins';
    document.getElementById('f-players').value = drill.players || '4–8';
    document.getElementById('f-space').value = drill.space || 'Half Pitch';

    document.getElementById('f-objective').value = (drill.objective || []).map(o => o.text || o).join('\n');
    document.getElementById('f-equipment').value = (drill.equipment || []).join('\n');
    document.getElementById('f-phases').value = (drill.phases || []).map(p => p.text || p).join('\n');
    document.getElementById('f-cues').value = (drill.coachingCues || []).join('\n');
    document.getElementById('f-safety').value = drill.safety || '';
    document.getElementById('f-success').value = (drill.successCriteria || []).join('\n');

    const progEasier = (drill.progressions || []).find(p => p.level === 'Easier')?.text || '';
    const progHarder = (drill.progressions || []).find(p => p.level === 'Harder')?.text || '';
    document.getElementById('f-prog-easier').value = progEasier;
    document.getElementById('f-prog-harder').value = progHarder;

    setTimeout(() => {
      document.getElementById('add-modal').classList.add('open');
      document.body.style.overflow = 'hidden';
    }, 250);
  };

  /* ── Close Modal Interceptor ── */
  window.closeModal = function(id) {
    document.getElementById(id).classList.remove('open');
    document.body.style.overflow = '';
    
    if (id === 'add-modal') {
      state.editingDrillId = null;
      document.getElementById('add-modal-title').textContent = 'Add a Custom Drill';
      document.getElementById('add-drill-form').reset();
    }
  };

  /* ── Chip Filter Setup ── */
  function setupChips(containerId, filterKey) {
    document.getElementById(containerId)?.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      document.querySelectorAll(`#${containerId} .chip`).forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.filters[filterKey] = chip.dataset.value;
      renderGrid();
    });
  }

  /* ── Save Custom / Edited Drill ── */
  function setupAddDrillForm() {
    const form = document.getElementById('add-drill-form');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(form);

      const phases = (fd.get('phases') || '').split('\n').filter(Boolean).map(t => ({ text: t.trim() }));
      const cues   = (fd.get('cues') || '').split('\n').filter(Boolean);
      const obj    = (fd.get('objective') || '').split('\n').filter(Boolean).map(t => ({ icon: '🏑', text: t.trim() }));
      const catVal = fd.get('category') || 'Custom';

      const drill = {
        category:      catVal,
        categoryIcon:  getCategoryIcon(catVal),
        sport:         fd.get('sport') || 'Both',
        ageGroup:      fd.get('ageGroup') || 'Senior',
        difficulty:    fd.get('difficulty') || 'Standard',
        title:         fd.get('title') || 'Custom Drill',
        subtitle:      fd.get('subtitle') || '',
        duration:      fd.get('duration') || '20 mins',
        players:       fd.get('players') || '4–8',
        space:         fd.get('space') || 'Half Pitch',
        objective:     obj,
        equipment:     (fd.get('equipment') || '').split('\n').filter(Boolean),
        phases:        phases,
        coachingCues:  cues,
        progressions: [
          { level: 'Easier',   text: fd.get('prog_easier')   || 'Reduce intensity.' },
          { level: 'Standard', text: 'As described above.' },
          { level: 'Harder',   text: fd.get('prog_harder')   || 'Increase difficulty.' }
        ],
        safety:         fd.get('safety') || 'Standard safety rules apply.',
        successCriteria: (fd.get('success') || '').split('\n').filter(Boolean),
        diagram: { gk: { x:50, y:12 }, defenders: [], attackers: [], cones: [] }
      };

      if (state.editingDrillId) {
        // We are editing an existing drill
        drill.id = state.editingDrillId;
        
        if (state.editingDrillId.startsWith('custom-')) {
          // Edit a custom drill
          let customs = JSON.parse(localStorage.getItem('gk_custom_drills') || '[]');
          customs = customs.map(c => c.id === state.editingDrillId ? { ...c, ...drill } : c);
          localStorage.setItem('gk_custom_drills', JSON.stringify(customs));
        } else {
          // Edit a built-in drill (save override in edited drills dictionary)
          const edited = JSON.parse(localStorage.getItem('gk_edited_drills') || '{}');
          edited[state.editingDrillId] = drill;
          localStorage.setItem('gk_edited_drills', JSON.stringify(edited));
        }

        state.editingDrillId = null;
        showToast('✅ Drill updated successfully!');
      } else {
        // Add a brand new custom drill
        drill.id = 'custom-' + Date.now();
        const customs = JSON.parse(localStorage.getItem('gk_custom_drills') || '[]');
        customs.push(drill);
        localStorage.setItem('gk_custom_drills', JSON.stringify(customs));
        showToast('✅ Custom drill created!');
      }

      form.reset();
      closeModal('add-modal');
      renderGrid();
      updateNavCount();
    });
  }

  /* ── Toast ── */
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }

  /* ── Install Banner ── */
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    const banner = document.getElementById('install-banner');
    if (banner) {
      setTimeout(() => banner.classList.add('show'), 3000);
    }
  });

  document.getElementById('install-btn')?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      document.getElementById('install-banner')?.classList.remove('show');
    }
    deferredPrompt = null;
  });

  document.getElementById('install-close')?.addEventListener('click', () => {
    document.getElementById('install-banner')?.classList.remove('show');
  });

  /* ── Service Worker ── */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SW error:', err));
  }

  /* ── Close modals on overlay click ── */
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  /* ── Close on Escape ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => {
        m.classList.remove('open');
        document.body.style.overflow = '';
      });
      state.editingDrillId = null;
      document.getElementById('add-modal-title').textContent = 'Add a Custom Drill';
    }
  });

  /* ── Search ── */
  searchInput?.addEventListener('input', e => {
    state.filters.search = e.target.value;
    renderGrid();
  });

  /* ── Update live count in nav ── */
  function updateNavCount() {
    const el = document.getElementById('nav-drill-count');
    if (el) el.textContent = getAllDrills().length;
  }

  /* ── Init ── */
  function init() {
    setupChips('filter-category', 'category');
    setupChips('filter-sport', 'sport');
    setupChips('filter-age', 'ageGroup');
    setupChips('filter-difficulty', 'difficulty');
    setupChips('filter-rating', 'rating');
    setupAddDrillForm();
    updateNavCount();
    renderGrid();
  }

  document.addEventListener('DOMContentLoaded', init);

})();
