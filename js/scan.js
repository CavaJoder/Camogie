/* ============================================================
   scan.js  –  Drill Image Scanner via Gemini Vision API
   ============================================================ */

(function () {
  'use strict';

  // Models tried in order — falls back automatically on rate limit
  // Use only models confirmed available in v1beta API (June 2025+)
  const GEMINI_MODELS = [
    'gemini-2.0-flash',        // primary — fast, free tier
    'gemini-2.0-flash-lite',   // lighter quota, separate rate limit
  ];
  const KEY_STORE = 'gk_gemini_api_key';

  const scanState = { base64: null, mimeType: null };

  /* ════════════════════════════════════════
     OPEN / RESET MODAL
  ════════════════════════════════════════ */
  window.openScanModal = function () {
    const saved = localStorage.getItem(KEY_STORE);
    if (saved) {
      document.getElementById('scan-api-key').value = saved;
      document.getElementById('scan-save-key').checked = true;
    }
    resetScan();
    document.getElementById('scan-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  function resetScan() {
    scanState.base64   = null;
    scanState.mimeType = null;

    const img  = document.getElementById('scan-preview-img');
    const zone = document.getElementById('scan-drop-zone');
    const res  = document.getElementById('scan-result-section');
    const btn  = document.getElementById('scan-analyse-btn');

    img.src              = '';
    img.style.display    = 'none';
    zone.style.display   = 'flex';
    res.style.display    = 'none';
    res.innerHTML        = '';
    btn.disabled         = true;
    btn.innerHTML        = '<span>🔍</span> Analyse Drill';
    setScanStatus('', '');
    document.getElementById('scan-file-input').value = '';
  }

  window.resetScanModal = resetScan;

  /* ════════════════════════════════════════
     DROP ZONE / FILE PICK
  ════════════════════════════════════════ */
  function setupDropZone() {
    const zone  = document.getElementById('scan-drop-zone');
    const input = document.getElementById('scan-file-input');

    zone.addEventListener('click', () => input.click());

    zone.addEventListener('dragover', e => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });
    ['dragleave','dragend'].forEach(ev =>
      zone.addEventListener(ev, () => zone.classList.remove('drag-over'))
    );
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });

    input.addEventListener('change', () => {
      if (input.files[0]) handleFile(input.files[0]);
    });
  }

  function handleFile(file) {
    if (!file.type.startsWith('image/')) {
      setScanStatus('❌ Please upload an image (JPG, PNG, WEBP)', 'error');
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      setScanStatus('❌ Image too large (max 30 MB). Please use a smaller photo.', 'error');
      return;
    }

    scanState.mimeType = 'image/jpeg'; // always send as JPEG after compression

    const reader = new FileReader();
    reader.onload = e => {
      const original = e.target.result;

      // Show preview immediately from original
      const img  = document.getElementById('scan-preview-img');
      const zone = document.getElementById('scan-drop-zone');
      img.src            = original;
      img.style.display  = 'block';
      zone.style.display = 'none';
      setScanStatus('⏳ Compressing image…', 'info');

      // Resize + compress on a canvas so Gemini gets a small, fast payload
      const image = new Image();
      image.onload = () => {
        const MAX  = 1024; // max dimension in px
        let { width, height } = image;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width);  width  = MAX; }
          else                { width  = Math.round(width  * MAX / height); height = MAX; }
        }

        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(image, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        scanState.base64  = compressed.split(',')[1];

        const kbOrig = Math.round(file.size / 1024);
        const kbComp = Math.round(scanState.base64.length * 0.75 / 1024);

        document.getElementById('scan-analyse-btn').disabled = false;
        setScanStatus(
          `✅ Ready (${width}×${height}px, ~${kbComp} KB compressed from ${kbOrig} KB) — click Analyse.`,
          'success'
        );
      };
      image.onerror = () => {
        // Fallback: send original if canvas fails (e.g. HEIC)
        scanState.base64 = original.split(',')[1];
        scanState.mimeType = file.type || 'image/jpeg';
        document.getElementById('scan-analyse-btn').disabled = false;
        setScanStatus('✅ Image ready — click Analyse to extract drill details.', 'success');
      };
      image.src = original;
    };
    reader.readAsDataURL(file);
  }

  /* ════════════════════════════════════════
     ANALYSE — CALL GEMINI
  ════════════════════════════════════════ */
  async function analyseImage() {
    const apiKey = document.getElementById('scan-api-key').value.trim();
    if (!apiKey) {
      setScanStatus('❌ Please enter your Gemini API key first.', 'error');
      document.getElementById('scan-api-key').focus();
      return;
    }
    if (!scanState.base64) {
      setScanStatus('❌ Please upload an image first.', 'error');
      return;
    }

    if (document.getElementById('scan-save-key').checked) {
      localStorage.setItem(KEY_STORE, apiKey);
    } else {
      localStorage.removeItem(KEY_STORE);
    }

    const btn = document.getElementById('scan-analyse-btn');
    btn.disabled  = true;
    btn.innerHTML = '<span class="scan-spin">⏳</span> Analysing…';

    const kb = Math.round((scanState.base64 || '').length * 0.75 / 1024);
    setScanStatus(`📤 Sending ~${kb} KB image to Gemini…`, 'info');

    try {
      const drill = await callGeminiDirect(apiKey);
      showResult(drill);
    } catch (err) {
      // Show full diagnostic error — not a custom message
      setScanStatus(`❌ ${err.message}`, 'error');
      document.getElementById('scan-debug').textContent = err.debug || '';
      document.getElementById('scan-debug').style.display = err.debug ? 'block' : 'none';
      btn.disabled  = false;
      btn.innerHTML = '<span>🔍</span> Try Again';
    }
  }

  const GEMINI_PROMPT = `You are a sports coaching assistant specialising in GAA Gaelic games (Camogie and Hurling). 
Analyse this image which may show a drill card, coaching whiteboard, handwritten notes, printed session plan, or photograph of a training drill.

Extract all available information and return ONLY a single valid JSON object — no markdown, no code fences, just raw JSON.

Use these exact fields (empty string "" or empty array [] for anything not visible in the image):

{
  "title": "drill name or title",
  "subtitle": "brief one-line description",
  "category": "best match from: Shot Stopping | Puckout & Distribution | Footwork & Positioning | Handling & Ball Control | 1v1 & Breakaway | Communication & Organisation | Custom",
  "sport": "Camogie | Hurling | Both",
  "ageGroup": "U14 | U16 | Senior",
  "difficulty": "Easier | Standard | Harder",
  "duration": "e.g. 20 mins",
  "players": "e.g. 4-8",
  "space": "e.g. Half Pitch",
  "objective": ["what players will learn 1", "point 2", "point 3"],
  "equipment": ["item 1", "item 2"],
  "phases": ["<strong>Phase name (duration):</strong> Full description of what happens in this phase.", "<strong>Phase 2:</strong> Description."],
  "coachingCues": ["\"Cue phrase 1\"", "\"Cue phrase 2\""],
  "safety": "Safety reminders as a single paragraph string.",
  "successCriteria": ["measurable success point 1", "point 2"],
  "prog_easier": "Single sentence on how to make this drill easier.",
  "prog_harder": "Single sentence on how to make this drill harder."
}

If the image does not appear to contain any drill, session plan, or coaching content, return exactly: {"error": "Not a drill image — please upload a drill card, whiteboard, or session plan photo."}`;

  /* ────────────────────────────────────────
     TEST API KEY
  ──────────────────────────────────────── */
  window.testApiKey = async function () {
    const apiKey = document.getElementById('scan-api-key').value.trim();
    if (!apiKey) {
      setScanStatus('❌ Enter your API key first.', 'error');
      return;
    }
    const btn = document.getElementById('test-key-btn');
    btn.disabled = true;
    btn.textContent = 'Testing…';
    setScanStatus('🔑 Checking API key…', 'info');

    const isHF = apiKey.startsWith('hf_');

    try {
      let resp;
      if (isHF) {
        // Hugging Face token CORS check via whoami
        let url = 'https://huggingface.co/api/whoami';
        resp = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
      } else {
        // Gemini API check
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Reply with the single word OK.' }] }],
            generationConfig: { max_output_tokens: 5 }
          })
        });
      }

      if (resp.ok) {
        const provider = isHF ? 'Hugging Face' : 'Gemini';
        setScanStatus(`✅ ${provider} token is valid and working! Upload an image and click Analyse.`, 'success');
      } else {
        const e = await resp.json().catch(() => ({}));
        const msg = e?.error?.message || e?.error || `HTTP ${resp.status}`;
        if (resp.status === 401 || resp.status === 403) {
          setScanStatus(`❌ Token rejected by ${isHF ? 'Hugging Face' : 'Gemini'}. Please check for typos.`, 'error');
        } else {
          setScanStatus(`❌ API Error: ${msg}`, 'error');
        }
      }
    } catch (err) {
      setScanStatus(`❌ Network error: ${err.message}`, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '🔑 Test Key';
    }
  };

  /* ────────────────────────────────────────
     CLEAR API KEY
  ──────────────────────────────────────── */
  window.clearApiKey = function () {
    localStorage.removeItem(KEY_STORE);
    document.getElementById('scan-api-key').value = '';
    document.getElementById('scan-save-key').checked = false;
    setScanStatus('🗑️ API key cleared from memory and local storage.', 'info');
  };

  /* ────────────────────────────────────────
     SINGLE DIRECT CALL — full error transparency
  ──────────────────────────────────────── */
  async function callGeminiDirect(apiKey) {
    const isHF = apiKey.startsWith('hf_');
    const model = isHF ? 'Llama-3.2-11B-Vision' : 'gemini-2.0-flash';
    
    let url, headers, body;

    if (isHF) {
      // Serverless Inference API allows browser CORS requests
      url = 'https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-11B-Vision-Instruct';
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };
      // Format payload according to Hugging Face serverless image-to-text specifications
      body = {
        inputs: `data:image/jpeg;base64,${scanState.base64}`,
        parameters: {
          max_new_tokens: 1200,
          temperature: 0.1
        },
        // We pass the prompt as context instructions
        context: `${GEMINI_PROMPT}\nReturn ONLY raw valid JSON text matching the schema.`
      };
    } else {
      // Gemini Endpoint
      url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      headers = { 'Content-Type': 'application/json' };
      body = {
        contents: [{
          parts: [
            { inline_data: { mime_type: scanState.mimeType, data: scanState.base64 } },
            { text: GEMINI_PROMPT }
          ]
        }],
        generationConfig: { temperature: 0.1, max_output_tokens: 2048 }
      };
    }

    let resp;
    try {
      resp = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      });
    } catch (netErr) {
      const err = new Error(`Network error — could not reach ${isHF ? 'Hugging Face' : 'Google'} API. ${netErr.message}`);
      err.debug = `This is a network/CORS error, not an API error. Check your internet connection.`;
      throw err;
    }

    // Always read the raw response body for diagnostics
    const rawText = await resp.text();
    let parsed;
    try { parsed = JSON.parse(rawText); } catch { parsed = null; }

    if (!resp.ok) {
      const status  = resp.status;
      const apiMsg  = isHF 
        ? (parsed?.error?.message || parsed?.error || rawText.slice(0, 300))
        : (parsed?.error?.message || rawText.slice(0, 300));
      const apiCode = parsed?.error?.status || '';

      const err = new Error(
        `HTTP ${status} ${apiCode ? '(' + apiCode + ')' : ''}: ${apiMsg}`
      );
      err.debug = [
        `HTTP Status : ${status}`,
        `Error Code  : ${apiCode || 'n/a'}`,
        `Message     : ${apiMsg}`,
        `Model       : ${model}`,
        `Image size  : ~${Math.round((scanState.base64||'').length*0.75/1024)} KB`,
        `Provider    : ${isHF ? 'Hugging Face' : 'Gemini'}`
      ].join('\n');
      throw err;
    }

    // Success — extract response text
    let text = '';
    if (isHF) {
      // HF Serverless image-to-text returns [{ generated_text: "..." }]
      text = parsed?.[0]?.generated_text || parsed?.generated_text || rawText;
    } else {
      text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    if (!text) {
      const err = new Error('API returned an empty response. Try again.');
      err.debug = `Raw response: ${rawText.slice(0, 500)}`;
      throw err;
    }

    let drill;
    try {
      drill = JSON.parse(text);
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (m) { try { drill = JSON.parse(m[0]); } catch { /* fall through */ } }
    }
    if (!drill) {
      const err = new Error('Could not parse Gemini response as JSON. Try a clearer image.');
      err.debug = `Raw text from model: ${text.slice(0, 500)}`;
      throw err;
    }
    if (drill.error) throw new Error(drill.error);
    return drill;
  }


  /* ════════════════════════════════════════
     SHOW EXTRACTED RESULT
  ════════════════════════════════════════ */
  function showResult(drill) {
    setScanStatus('✅ Drill extracted! Review the details below and click "Use This Drill".', 'success');

    const btn = document.getElementById('scan-analyse-btn');
    btn.innerHTML = '<span>🔍</span> Analyse Again';
    btn.disabled  = false;

    const section = document.getElementById('scan-result-section');
    section.style.display = 'block';

    const meta = [
      ['📂 Category',   drill.category],
      ['🏑 Sport',      drill.sport],
      ['👶 Age Group',  drill.ageGroup],
      ['⚠️ Difficulty', drill.difficulty],
      ['⏱️ Duration',   drill.duration],
      ['👥 Players',    drill.players],
      ['📐 Space',      drill.space],
    ].filter(([,v]) => v);

    const metaHtml = meta.map(([k,v]) => `
      <div class="sr-meta-item">
        <span class="sr-meta-label">${k}</span>
        <span class="sr-meta-val">${v}</span>
      </div>`).join('');

    const listHtml = (items, icon) =>
      (items && items.length)
        ? items.map(i => `<div class="sr-list-item"><span>${icon}</span><span>${i}</span></div>`).join('')
        : '';

    section.innerHTML = `
      <div class="scan-result-card">
        <div class="scan-result-header">
          <div class="scan-result-icon">📋</div>
          <div>
            <div class="scan-result-title">${drill.title || 'Untitled Drill'}</div>
            ${drill.subtitle ? `<div class="scan-result-subtitle">${drill.subtitle}</div>` : ''}
          </div>
        </div>

        <div class="sr-meta-grid">${metaHtml}</div>

        ${drill.objective?.length ? `
        <div class="sr-section">
          <div class="sr-section-title">🎯 Objectives</div>
          ${listHtml(drill.objective, '→')}
        </div>` : ''}

        ${drill.equipment?.length ? `
        <div class="sr-section">
          <div class="sr-section-title">🎒 Equipment</div>
          ${listHtml(drill.equipment, '✓')}
        </div>` : ''}

        ${drill.phases?.length ? `
        <div class="sr-section">
          <div class="sr-section-title">▶️ Phases</div>
          ${drill.phases.map((p,i) => `<div class="sr-phase"><span class="sr-phase-num">${i+1}</span><span>${p}</span></div>`).join('')}
        </div>` : ''}

        ${drill.coachingCues?.length ? `
        <div class="sr-section">
          <div class="sr-section-title">💬 Coaching Cues</div>
          <div class="sr-cues">${drill.coachingCues.map(c=>`<span class="cue-tag">${c}</span>`).join('')}</div>
        </div>` : ''}

        ${drill.safety ? `
        <div class="sr-section sr-safety">
          <div class="sr-section-title">⛑️ Safety</div>
          <p>${drill.safety}</p>
        </div>` : ''}

        <div class="scan-result-actions">
          <button class="btn-save" onclick="useExtractedDrill()">✅ Use This Drill</button>
          <button class="btn-cancel" onclick="resetScanModal()">🔄 Try Different Image</button>
        </div>
      </div>`;

    window._scannedDrill = drill;
    section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ════════════════════════════════════════
     TRANSFER TO ADD FORM
  ════════════════════════════════════════ */
  window.useExtractedDrill = function () {
    const d = window._scannedDrill;
    if (!d) return;

    closeModal('scan-modal');

    setTimeout(() => {
      document.getElementById('add-modal').classList.add('open');
      document.body.style.overflow = 'hidden';
    }, 200);

    setTimeout(() => {
      setF('f-title',       d.title);
      setF('f-subtitle',    d.subtitle);
      setF('f-duration',    d.duration);
      setF('f-players',     d.players);
      setF('f-space',       d.space);
      setF('f-safety',      d.safety);
      setF('f-objective',   arr(d.objective));
      setF('f-equipment',   arr(d.equipment));
      setF('f-phases',      arr(d.phases));
      setF('f-cues',        arr(d.coachingCues));
      setF('f-success',     arr(d.successCriteria));
      setF('f-prog-easier', d.prog_easier);
      setF('f-prog-harder', d.prog_harder);

      setSel('f-category',   d.category);
      setSel('f-sport',      d.sport);
      setSel('f-age',        d.ageGroup);
      setSel('f-difficulty', d.difficulty);

      showToast('📸 Form pre-filled from scanned image — review and save!');
    }, 500);
  };

  function arr(a) { return (a && a.length) ? a.join('\n') : ''; }

  function setF(id, val) {
    const el = document.getElementById(id);
    if (el && val) el.value = val;
  }

  function setSel(id, val) {
    if (!val) return;
    const el = document.getElementById(id);
    if (!el) return;
    const v = val.toLowerCase();
    const opt = [...el.options].find(o =>
      o.value.toLowerCase() === v ||
      o.value.toLowerCase().includes(v) ||
      v.includes(o.value.toLowerCase())
    );
    if (opt) el.value = opt.value;
  }

  /* ════════════════════════════════════════
     STATUS HELPER
  ════════════════════════════════════════ */
  function setScanStatus(msg, type) {
    const el = document.getElementById('scan-status');
    if (!el) return;
    el.textContent = msg;
    el.className   = 'scan-status' + (type ? ` scan-status-${type}` : '');
  }

  /* ════════════════════════════════════════
     INIT
  ════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    setupDropZone();
    document.getElementById('scan-analyse-btn')
      ?.addEventListener('click', analyseImage);
  });

})();
