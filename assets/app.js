(function () {
  'use strict';

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ========================================================================
     LOCAL STORAGE HELPERS (SURVIVED TRACKER & AUDIO POSITION RESUME)
     ======================================================================== */
  function getSurvivedSet() {
    try {
      const arr = JSON.parse(localStorage.getItem('ot_survived') || '[]');
      return new Set(Array.isArray(arr) ? arr : []);
    } catch (e) { return new Set(); }
  }
  function saveSurvivedSet(set) {
    try { localStorage.setItem('ot_survived', JSON.stringify(Array.from(set))); } catch (e) {}
  }
  function getAudioPosMap() {
    try {
      return JSON.parse(localStorage.getItem('ot_audio_pos') || '{}') || {};
    } catch (e) { return {}; }
  }
  function saveAudioPos(slug, sec) {
    try {
      const m = getAudioPosMap();
      if (sec > 5) m[slug] = Math.floor(sec);
      else delete m[slug];
      localStorage.setItem('ot_audio_pos', JSON.stringify(m));
    } catch (e) {}
  }

  /* ========================================================================
     DATA LOADER (CATALOG + STORIES + EXHIBITS)
     ======================================================================== */
  async function loadData() {
    const emptyEx = { meta: {}, stories: {}, exam: [], starterPacks: [] };
    if (window.OT_BUNDLE && window.OT_BUNDLE.catalog && window.OT_BUNDLE.stories) {
      if (location.protocol.startsWith('http')) {
        try {
          const [catRes, stoRes, exRes] = await Promise.all([
            fetch('data/catalog.json', { cache: 'no-store' }),
            fetch('data/stories.json', { cache: 'no-store' }),
            fetch('data/exhibits.json', { cache: 'no-store' })
          ]);
          if (catRes.ok && stoRes.ok) {
            return {
              catalog: await catRes.json(),
              stories: await stoRes.json(),
              exhibits: exRes.ok ? await exRes.json() : (window.OT_BUNDLE.exhibits || emptyEx)
            };
          }
        } catch (e) {}
      }
      return {
        catalog: window.OT_BUNDLE.catalog,
        stories: window.OT_BUNDLE.stories,
        exhibits: window.OT_BUNDLE.exhibits || emptyEx
      };
    }
    const [catRes, stoRes, exRes] = await Promise.all([
      fetch('data/catalog.json'),
      fetch('data/stories.json'),
      fetch('data/exhibits.json').catch(function () { return { ok: false }; })
    ]);
    return {
      catalog: await catRes.json(),
      stories: await stoRes.json(),
      exhibits: exRes.ok ? await exRes.json() : emptyEx
    };
  }

  /* ========================================================================
     SHARED VARIABLE-SPEED AUDIO PLAYER (WITH RESUME & iOS AUDIO SESSION)
     ======================================================================== */
  function initAudioPlayer(meta) {
    const dock = document.getElementById('ot-player');
    if (!dock) return { playCase: function () {} };

    const audioEl = document.getElementById('otp-audio');
    const titleEl = document.getElementById('otp-title');
    const statusEl = document.getElementById('otp-status');
    const playBtn = document.getElementById('otp-play');
    const rewBtn = document.getElementById('otp-rew');
    const fwdBtn = document.getElementById('otp-fwd');
    const seekEl = document.getElementById('otp-seek');
    const curEl = document.getElementById('otp-cur');
    const totEl = document.getElementById('otp-tot');
    const modeBtn = document.getElementById('otp-mode');
    const nativeWrap = document.getElementById('otp-native');
    const iframeWrap = document.getElementById('otp-iframe-wrap');
    const iframeEl = document.getElementById('otp-iframe');
    const closeBtn = document.getElementById('otp-close');
    const transLink = document.getElementById('otp-transcript');
    const studioLink = document.getElementById('otp-studio');
    const spdBtns = dock.querySelectorAll('.otp-spd');

    let currentCase = null;
    let usingFallback = false;
    let triedProxy = false;
    let savedRate = 1.0;
    let lastSaveTick = 0;

    try {
      const r = parseFloat(localStorage.getItem('ot_rate') || '1');
      if (!isNaN(r) && r >= 0.75 && r <= 2.5) savedRate = r;
    } catch (e) {}

    function fmt(sec) {
      if (!isFinite(sec) || sec < 0) return '0:00';
      sec = Math.floor(sec);
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      const ss = s < 10 ? '0' + s : '' + s;
      if (h > 0) return h + ':' + (m < 10 ? '0' + m : m) + ':' + ss;
      return m + ':' + ss;
    }

    function applyRate(r) {
      savedRate = r;
      try { localStorage.setItem('ot_rate', String(r)); } catch (e) {}
      audioEl.playbackRate = r;
      audioEl.defaultPlaybackRate = r;
      spdBtns.forEach(function (b) {
        b.classList.toggle('active', Math.abs(parseFloat(b.dataset.spd) - r) < 0.01);
      });
    }

    function enablePlaybackAudioSession() {
      try {
        if (navigator.audioSession) navigator.audioSession.type = 'playback';
      } catch (e) {}
    }

    function showFallback(reason) {
      if (!currentCase || !currentCase.audioDriveId) {
        statusEl.textContent = reason || 'Audio unavailable offline';
        return;
      }
      usingFallback = true;
      try { audioEl.pause(); audioEl.removeAttribute('src'); audioEl.load(); } catch (e) {}
      nativeWrap.style.display = 'none';
      iframeWrap.style.display = 'block';
      iframeEl.src = 'https://drive.google.com/file/d/' + currentCase.audioDriveId + '/preview';
      modeBtn.textContent = 'Speed Player';
      statusEl.textContent = reason || 'Google Drive Backup Stream';
    }

    function loadNative(c, preferProxy) {
      enablePlaybackAudioSession();
      usingFallback = false;
      iframeEl.src = 'about:blank';
      iframeWrap.style.display = 'none';
      nativeWrap.style.display = 'block';
      modeBtn.textContent = 'Backup Player';

      const proxyUrl = c.audioDriveId ? (meta.audioStreamProxyBase + encodeURIComponent(c.audioDriveId)) : '';
      const src = (!preferProxy && c.audioDirectUrl) ? c.audioDirectUrl : (proxyUrl || c.audioDirectUrl);
      if (!src) {
        showFallback('Opening Drive preview...');
        return;
      }
      statusEl.textContent = (!preferProxy && c.audioDirectUrl) ? 'Connecting direct 256 kbps stream...' : 'Connecting Drive proxy stream...';
      audioEl.src = src;
      audioEl.load();
      applyRate(savedRate);

      // Resume from saved position if available
      const savedSec = getAudioPosMap()[c.slug] || 0;
      if (savedSec > 5) {
        audioEl.addEventListener('loadedmetadata', function onMeta() {
          audioEl.removeEventListener('loadedmetadata', onMeta);
          if (isFinite(audioEl.duration) && savedSec < audioEl.duration - 15) {
            audioEl.currentTime = savedSec;
          }
        });
      }

      const p = audioEl.play();
      if (p && p.catch) {
        p.catch(function () {
          statusEl.textContent = 'Press ▶ to start playback';
        });
      }
    }

    audioEl.addEventListener('playing', function () {
      playBtn.textContent = '❚❚';
      statusEl.textContent = (currentCase ? (currentCase.ep + ' · ' + currentCase.duration) : 'Playing') + ' · ' + savedRate + '×';
    });
    audioEl.addEventListener('pause', function () {
      playBtn.textContent = '▶';
      if (currentCase && audioEl.currentTime > 5) saveAudioPos(currentCase.slug, audioEl.currentTime);
    });
    audioEl.addEventListener('timeupdate', function () {
      curEl.textContent = fmt(audioEl.currentTime);
      if (isFinite(audioEl.duration) && audioEl.duration > 0) {
        totEl.textContent = fmt(audioEl.duration);
        seekEl.value = String(Math.round((audioEl.currentTime / audioEl.duration) * 1000));
        const now = Date.now();
        if (currentCase && now - lastSaveTick > 5000) {
          lastSaveTick = now;
          saveAudioPos(currentCase.slug, audioEl.currentTime);
        }
      }
    });
    audioEl.addEventListener('ended', function () {
      if (currentCase) saveAudioPos(currentCase.slug, 0);
    });
    audioEl.addEventListener('error', function () {
      if (usingFallback || !currentCase) return;
      if (!triedProxy && currentCase.audioDriveId && currentCase.audioDirectUrl) {
        triedProxy = true;
        loadNative(currentCase, true);
      } else {
        showFallback('Switched to Google Drive backup player');
      }
    });

    playBtn.addEventListener('click', function () {
      enablePlaybackAudioSession();
      if (audioEl.paused) audioEl.play(); else audioEl.pause();
    });
    rewBtn.addEventListener('click', function () {
      audioEl.currentTime = Math.max(0, (audioEl.currentTime || 0) - 15);
    });
    fwdBtn.addEventListener('click', function () {
      if (isFinite(audioEl.duration)) audioEl.currentTime = Math.min(audioEl.duration, (audioEl.currentTime || 0) + 30);
    });
    seekEl.addEventListener('input', function () {
      if (isFinite(audioEl.duration) && audioEl.duration > 0) {
        audioEl.currentTime = (parseFloat(seekEl.value) / 1000) * audioEl.duration;
      }
    });
    spdBtns.forEach(function (b) {
      b.addEventListener('click', function () { applyRate(parseFloat(b.dataset.spd)); });
    });
    modeBtn.addEventListener('click', function () {
      if (!currentCase) return;
      if (usingFallback) { triedProxy = false; loadNative(currentCase, false); }
      else showFallback('Google Drive Backup Stream');
    });
    closeBtn.addEventListener('click', function () {
      try { audioEl.pause(); } catch (e) {}
      iframeEl.src = 'about:blank';
      dock.classList.remove('open');
    });

    applyRate(savedRate);

    function buildStudioUrl(base, c) {
      const root = (base || 'https://yorekms.github.io/deep-dive-podcasts/resonance').replace(/\/+$/, '');
      if (c && c.audioDriveId) {
        return root + '/?view=listen&driveId=' + encodeURIComponent(c.audioDriveId) + '&hub=forensic-medicine&title=' + encodeURIComponent(c.episodeTitle || c.title || '') + '&autoplay=1';
      }
      return root + '/?view=listen&hub=forensic-medicine';
    }

    return {
      playCase: function (c) {
        currentCase = c;
        triedProxy = false;
        dock.classList.add('open');
        titleEl.textContent = 'FILE № ' + c.fileNo + ' — ' + c.title + ' (' + c.ep + ')';
        transLink.href = c.transcriptUrl || '#';
        transLink.style.display = c.transcriptUrl ? 'inline-block' : 'none';
        studioLink.href = buildStudioUrl(meta.transcriptStudioUrl, c);
        loadNative(c, false);
      }
    };
  }

  /* ========================================================================
     STANDALONE 10-QUESTION "WOULD YOU SURVIVE TUESDAY?" EXAM MODAL
     ======================================================================== */
  function initExamModal(examItems) {
    const modal = document.getElementById('ot-exam-modal');
    const panel = document.getElementById('ot-exam-panel');
    if (!modal || !panel || !examItems || !examItems.length) return { open: function () {} };

    let deck = [];
    let idx = 0;
    let score = 0;
    let answered = false;

    function drawDeck() {
      const pool = examItems.slice();
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
      }
      deck = pool.slice(0, Math.min(10, pool.length));
      idx = 0; score = 0; answered = false;
    }

    function getVerdict(sc, tot) {
      const pct = sc / tot;
      if (pct >= 0.9) return { title: 'Certified Ordinary Tuesday Survivor', sub: 'Physics tried hard. You read the fine print, killed the breaker, and asked for co-oximetry.' };
      if (pct >= 0.7) return { title: 'Survived Until Wednesday (Singed Eyebrows)', sub: 'Solid instincts—though one or two smug household appliances nearly got your name on a case report.' };
      if (pct >= 0.4) return { title: 'Frequent Flyer at Urgent Care', sub: 'You fell for a couple of “looks normal” traps. Recommend bookmarking the Lying Lab Test poster immediately.' };
      return { title: 'Featured Case at Friday Morbidity & Mortality Rounds', sub: 'Good news: you took this quiz instead of testing 15,000 volts on wet pine. Read a few more chapters!' };
    }

    function renderStep() {
      if (idx >= deck.length) {
        const v = getVerdict(score, deck.length);
        panel.innerHTML =
          '<div class="ot-exam-top"><span>TUESDAY SURVIVAL EXAM · OFFICIAL VERDICT</span><button type="button" class="ot-btn small" id="ot-exam-close">Close ×</button></div>' +
          '<div class="ot-exam-score-card">' +
            '<div class="ot-exam-score-num">' + score + ' / ' + deck.length + '</div>' +
            '<h3 class="ot-exam-verdict">' + esc(v.title) + '</h3>' +
            '<p style="color:var(--ink-soft);margin:0 0 20px;font-size:14.5px;line-height:1.55;">' + esc(v.sub) + '</p>' +
            '<div class="ot-btn-row" style="justify-content:center;">' +
              '<button type="button" class="ot-btn primary" id="ot-exam-share">Copy Score to Share</button>' +
              '<button type="button" class="ot-btn" id="ot-exam-retry">🎲 Draw 10 New Scenarios</button>' +
              '<a class="ot-btn" href="poster.html">Open Lying Lab Poster ↗</a>' +
            '</div>' +
          '</div>';
        document.getElementById('ot-exam-close').onclick = close;
        document.getElementById('ot-exam-retry').onclick = function () { drawDeck(); renderStep(); };
        document.getElementById('ot-exam-share').onclick = function () {
          const txt = 'I scored ' + score + '/' + deck.length + ' on the "How Not to Die on an Ordinary Tuesday" Survival Exam — Verdict: ' + v.title + '. Try it: https://yorekms.github.io/my-ordinary-tuesday/?exam=1';
          navigator.clipboard.writeText(txt).then(function () {
            const b = document.getElementById('ot-exam-share');
            if (b) b.textContent = '✓ Score Copied!';
          });
        };
        return;
      }

      answered = false;
      const item = deck[idx];
      panel.innerHTML =
        '<div class="ot-exam-top">' +
          '<span>QUESTION ' + (idx + 1) + ' OF ' + deck.length + ' (POOL: ' + examItems.length + ') · SCORE: ' + score + '</span>' +
          '<button type="button" class="ot-btn small" id="ot-exam-close">Close ×</button>' +
        '</div>' +
        '<div class="ot-quiz-prompt">' + esc(item.q) + '</div>' +
        '<div class="ot-quiz-opts">' +
          item.options.map(function (op, i) {
            return '<button type="button" class="ot-quiz-opt" data-ex-opt="' + i + '">' + esc(op.label) + '</button>';
          }).join('') +
        '</div>' +
        '<div class="ot-quiz-feedback" id="ot-exam-fb"></div>' +
        '<div class="ot-btn-row" id="ot-exam-next-row" style="display:none;margin-top:14px;justify-content:space-between;align-items:center;">' +
          '<a class="ot-btn small" href="story.html?case=' + encodeURIComponent(item.caseSlug) + '" target="_blank" rel="noopener">Read ' + esc(item.caseRef) + ' ↗</a>' +
          '<button type="button" class="ot-btn primary" id="ot-exam-next">' + (idx + 1 < deck.length ? 'Next Scenario →' : 'See Final Verdict →') + '</button>' +
        '</div>';

      document.getElementById('ot-exam-close').onclick = close;
      panel.querySelectorAll('[data-ex-opt]').forEach(function (btn) {
        btn.onclick = function () {
          if (answered) return;
          answered = true;
          const pick = parseInt(btn.getAttribute('data-ex-opt'), 10);
          const chosen = item.options[pick];
          if (chosen.ok) score++;
          panel.querySelectorAll('[data-ex-opt]').forEach(function (b, bi) {
            b.disabled = true;
            if (item.options[bi].ok) b.classList.add('correct');
            else if (bi === pick) b.classList.add('wrong');
          });
          const fb = document.getElementById('ot-exam-fb');
          fb.className = 'ot-quiz-feedback show ' + (chosen.ok ? 'ok' : 'bad');
          fb.textContent = (chosen.ok ? '✓ ' : '✕ ') + chosen.why;
          document.getElementById('ot-exam-next-row').style.display = 'flex';
          document.getElementById('ot-exam-next').onclick = function () { idx++; renderStep(); };
        };
      });
    }

    function open() {
      drawDeck();
      modal.classList.add('open');
      renderStep();
    }
    function close() {
      modal.classList.remove('open');
    }
    modal.addEventListener('click', function (e) {
      if (e.target === modal) close();
    });
    return { open: open, close: close };
  }

  /* ========================================================================
     CLIENT-SIDE CANVAS PNG SURVIVAL CARD EXPORTER (ALL 136 STORIES!)
     ======================================================================== */
  function downloadSurvivalCardPng(story) {
    const W = 1200;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    function wrapLines(text, maxW, font) {
      ctx.font = font;
      const words = String(text || '').split(/\s+/);
      const lines = [];
      let cur = '';
      words.forEach(function (w) {
        const test = cur ? cur + ' ' + w : w;
        if (ctx.measureText(test).width > maxW && cur) {
          lines.push(cur);
          cur = w;
        } else {
          cur = test;
        }
      });
      if (cur) lines.push(cur);
      return lines;
    }

    // First pass: measure dynamic height
    const titleLines = wrapLines(story.title, W - 120, 'bold 44px Georgia, serif');
    const subLines = wrapLines(story.survivalCard.subhead, W - 120, 'italic 23px Georgia, serif');
    const stepBlocks = story.survivalCard.steps.map(function (st, i) {
      const aLines = wrapLines('0' + (i + 1) + ' · ' + st.action, W - 160, 'bold 21px monospace');
      const dLines = wrapLines(st.detail, W - 160, '21px sans-serif');
      return { aLines: aLines, dLines: dLines, h: aLines.length * 28 + dLines.length * 29 + 34 };
    });

    const totalStepH = stepBlocks.reduce(function (s, b) { return s + b.h + 16; }, 0);
    const H = 260 + titleLines.length * 52 + subLines.length * 32 + totalStepH + 115;
    canvas.width = W;
    canvas.height = H;

    // Background gallery ivory + dashed tear border
    ctx.fillStyle = '#181B20';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#FAF9F6';
    ctx.fillRect(28, 28, W - 56, H - 56);

    // Crimson top accent bar
    ctx.fillStyle = '#B41C1C';
    ctx.fillRect(28, 28, W - 56, 12);

    // Dotted scissor frame
    ctx.strokeStyle = '#B41C1C';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([10, 8]);
    ctx.strokeRect(44, 54, W - 88, H - 108);
    ctx.setLineDash([]);

    let y = 98;
    ctx.fillStyle = '#B41C1C';
    ctx.font = 'bold 19px monospace';
    ctx.fillText('✂ FIRST 60 SECONDS SURVIVAL CARD  ·  FILE № ' + story.fileNo, 68, y);

    y += 48;
    ctx.fillStyle = '#18181B';
    ctx.font = 'bold 44px Georgia, serif';
    titleLines.forEach(function (ln) { ctx.fillText(ln, 68, y); y += 52; });

    y += 4;
    ctx.fillStyle = '#44403C';
    ctx.font = 'italic 23px Georgia, serif';
    subLines.forEach(function (ln) { ctx.fillText(ln, 68, y); y += 32; });

    // Looks Like vs Actually Is strip
    y += 14;
    ctx.fillStyle = '#FDF2F2';
    ctx.fillRect(68, y, W - 136, 72);
    ctx.fillStyle = '#B41C1C';
    ctx.fillRect(68, y, 6, 72);
    ctx.fillStyle = '#18181B';
    ctx.font = 'bold 19px sans-serif';
    ctx.fillText('LOOKS LIKE: ' + String(story.looksLike || '').slice(0, 76), 88, y + 29);
    ctx.fillStyle = '#B41C1C';
    ctx.fillText('ACTUALLY IS: ' + String(story.actuallyIs || '').slice(0, 74), 88, y + 57);
    y += 96;

    // Steps
    stepBlocks.forEach(function (blk) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(68, y, W - 136, blk.h);
      ctx.strokeStyle = '#E4E0D8';
      ctx.lineWidth = 2;
      ctx.strokeRect(68, y, W - 136, blk.h);

      let sy = y + 32;
      ctx.fillStyle = '#B41C1C';
      ctx.font = 'bold 21px monospace';
      blk.aLines.forEach(function (ln) { ctx.fillText(ln, 90, sy); sy += 28; });

      ctx.fillStyle = '#292524';
      ctx.font = '21px sans-serif';
      blk.dLines.forEach(function (ln) { ctx.fillText(ln, 90, sy); sy += 29; });

      y += blk.h + 16;
    });

    // Footer watermark
    ctx.fillStyle = '#78716C';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('HOW NOT TO DIE ON AN ORDINARY TUESDAY  ·  my-ordinary-tuesday.carrd.co', 68, H - 72);

    const a = document.createElement('a');
    a.download = 'Ordinary_Tuesday_Case_' + story.fileNo + '_' + story.slug + '.png';
    a.href = canvas.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /* ========================================================================
     INDEX PAGE RENDERER
     ======================================================================== */
  function renderIndex(data, player) {
    const catalog = data.catalog;
    const exhibits = data.exhibits || { stories: {}, exam: [], starterPacks: [] };
    const liveCases = catalog.cases.filter(function (c) { return c.status === 'live'; });
    const totalWords = catalog.cases.reduce(function (s, c) { return s + (c.spokenWords || 0); }, 0);
    const survivedSet = getSurvivedSet();
    const exam = initExamModal(exhibits.exam);

    const updatedEl = document.getElementById('meta-updated');
    if (updatedEl) updatedEl.textContent = 'UPDATED ' + catalog.meta.updated;

    const navCatLink = document.getElementById('nav-catalog-link');
    if (navCatLink) navCatLink.textContent = 'All ' + catalog.cases.length + ' Stories';
    const catHeading = document.getElementById('catalog-heading');
    if (catHeading) catHeading.textContent = 'All ' + catalog.cases.length + ' Stories — Browse by Danger Zone';

    const navExam = document.getElementById('nav-exam-link');
    if (navExam) {
      navExam.addEventListener('click', function (e) {
        e.preventDefault();
        exam.open();
      });
    }

    const statsEl = document.getElementById('masthead-stats');
    if (statsEl) {
      const exStories = (exhibits.meta && exhibits.meta.ccByClinicalExhibitStories) || 0;
      statsEl.innerHTML =
        '<span class="ot-stat-chip crimson">' + liveCases.length + ' Stories Live</span>' +
        (exStories ? '<span class="ot-stat-chip">🩻 ' + exStories + ' Clinical Exhibits</span>' : '') +
        '<span class="ot-stat-chip">📐 ' + liveCases.length + ' Illustrated</span>' +
        '<span class="ot-stat-chip" id="survived-counter-chip">✓ ' + survivedSet.size + ' / ' + liveCases.length + ' Survived</span>' +
        '<button type="button" class="ot-btn primary small" id="open-exam-btn" style="border-radius:999px;">🧪 Take Survival Exam</button>' +
        '<button type="button" class="ot-btn small" id="random-case-btn" style="border-radius:999px;">🎲 Random Case</button>' +
        '<a class="ot-btn small" href="cards.html" style="border-radius:999px;">🪪 Fridge 6-Pack</a>' +
        '<a class="ot-btn small" href="poster.html" style="border-radius:999px;">🖨 Lying Lab Poster</a>';

      const randBtn = document.getElementById('random-case-btn');
      if (randBtn && liveCases.length) {
        randBtn.addEventListener('click', function () {
          const pick = liveCases[Math.floor(Math.random() * liveCases.length)];
          location.href = 'story.html?case=' + encodeURIComponent(pick.slug);
        });
      }
      const examBtn = document.getElementById('open-exam-btn');
      if (examBtn) examBtn.addEventListener('click', function () { exam.open(); });
    }

    // Featured Front-Page Spread
    const spreadEl = document.getElementById('featured-spread');
    if (spreadEl && liveCases.length) {
      function featureCard(c, isLead) {
        const st = data.stories[c.slug];
        const ex = (exhibits.stories || {})[c.slug];
        const hasVis = ex && ((ex.clinicalFigures && ex.clinicalFigures.length) || ex.diagramId);
        const leadExcerpt = (isLead && st && st.sections && st.sections[0] && st.sections[0].paragraphs)
          ? '<p class="ot-lead-excerpt" style="font-family:var(--font-serif);font-size:1.02rem;line-height:1.65;color:#2C2824;border-left:3px solid var(--crimson);padding-left:14px;margin:0 0 16px;">' + esc(st.sections[0].paragraphs[0]) + '</p>' +
            '<p class="ot-lead-excerpt" style="font-family:var(--font-serif);font-size:0.98rem;line-height:1.62;color:var(--ink-soft);margin:0 0 16px;">' + esc(st.sections[0].paragraphs[1]) + '</p>'
          : '';
        const leadLedger = (isLead && st && st.toeTag)
          ? '<div class="ot-toetag-grid" style="margin-bottom:16px;">' +
              '<div class="ot-toetag-cell"><strong>Cause</strong><span>' + esc(st.toeTag.cause) + '</span></div>' +
              '<div class="ot-toetag-cell"><strong>Fatal False Reassurance</strong><span>' + esc(st.toeTag.falseReassurance) + '</span></div>' +
            '</div>'
          : '';
        return (
          '<article class="ot-feature-card' + (isLead ? ' lead' : '') + '">' +
            '<div>' +
              '<div class="ot-tag-row">' +
                '<span class="ot-file-no"><span class="ot-rivet"></span>FILE № ' + esc(c.fileNo) + ' · ' + esc(c.ep) + '</span>' +
                '<span class="ot-stamp live">' + (hasVis ? '🔬 VISUAL · ' : 'LIVE · ') + esc(c.verdictBadge) + '</span>' +
              '</div>' +
              '<h3><a href="story.html?case=' + encodeURIComponent(c.slug) + '">' + esc(c.title) + '</a></h3>' +
              '<p class="ot-deck">' + esc(c.subtitle) + '</p>' +
              '<div class="ot-verdict-box">' +
                '<div class="ot-verdict-col"><span class="ot-verdict-lbl">Looks Like</span><span class="ot-verdict-val">' + esc(c.looksLike) + '</span></div>' +
                '<div class="ot-verdict-col danger"><span class="ot-verdict-lbl">Actually Is</span><span class="ot-verdict-val">' + esc(c.actuallyIs) + '</span></div>' +
              '</div>' +
              leadExcerpt +
              leadLedger +
              (isLead ? '<div class="ot-golden-strip"><strong>First 60 Seconds Rule</strong>' + esc(c.goldenRule) + '</div>' : '') +
            '</div>' +
            '<div class="ot-btn-row">' +
              '<a class="ot-btn primary" href="story.html?case=' + encodeURIComponent(c.slug) + '">Read ' + esc(c.readTime) + ' →</a>' +
              '<button type="button" class="ot-btn steel" data-play-slug="' + esc(c.slug) + '">▶ Listen (' + esc(c.duration || 'Audio') + ')</button>' +
            '</div>' +
          '</article>'
        );
      }
      const featuredSlugs = ['chocolate-brown-blood', 'pressure-washer-pinhole', 'fractal-wood-burning'];
      const picked = featuredSlugs
        .map(function (sl) { return liveCases.find(function (c) { return c.slug === sl; }); })
        .filter(Boolean);
      const show = picked.length >= 3 ? picked : liveCases.slice(0, 3);
      spreadEl.innerHTML =
        featureCard(show[0], true) +
        '<div class="ot-spread-side">' + show.slice(1, 3).map(function (c) { return featureCard(c, false); }).join('') + '</div>';
    }

    // Room Counts & Interactive House Map
    const roomCounts = {};
    catalog.cases.forEach(function (c) { roomCounts[c.part] = (roomCounts[c.part] || 0) + 1; });

    const mapRoot = document.getElementById('house-map-root');
    if (mapRoot && typeof window.OT_RENDER_HOUSE_MAP === 'function') {
      mapRoot.innerHTML = window.OT_RENDER_HOUSE_MAP(roomCounts);
    }

    // Filter Pills, Starter Packs, and Search
    const pillsEl = document.getElementById('filter-pills');
    const searchEl = document.getElementById('search-input');
    const containerEl = document.getElementById('catalog-container');
    const countEl = document.getElementById('catalog-count-label');
    const packsRoot = document.getElementById('starter-packs-root');
    let activeFilter = 'all';
    let activePackId = '';

    const shortPart = {
      garage: 'Garage & Yard',
      kitchen: 'Kitchen',
      medicine: 'Med Cabinet',
      outdoors: 'Outdoors',
      hospital: 'ER Fakeouts',
      pets: 'Pets'
    };
    const pillDefs = [
      { id: 'all', label: 'All Rooms (' + catalog.cases.length + ')' }
    ].concat(catalog.parts.map(function (p) {
      return { id: p.id, label: (shortPart[p.id] || p.stamp) + ' (' + (roomCounts[p.id] || 0) + ')' };
    }));

    pillsEl.innerHTML = pillDefs.map(function (p) {
      return '<button type="button" class="ot-pill ' + (p.id === 'all' ? 'active' : '') + '" data-filter="' + esc(p.id) + '">' + esc(p.label) + '</button>';
    }).join('');

    function syncPillHighlight() {
      pillsEl.querySelectorAll('.ot-pill').forEach(function (b) {
        b.classList.toggle('active', !activePackId && b.dataset.filter === activeFilter);
      });
      if (packsRoot) {
        packsRoot.querySelectorAll('.ot-pack-pill').forEach(function (b) {
          b.classList.toggle('active', b.dataset.pack === activePackId);
        });
      }
    }

    function renderStarterPacks() {
      if (!packsRoot || !exhibits.starterPacks || !exhibits.starterPacks.length) return;
      const activePack = exhibits.starterPacks.find(function (p) { return p.id === activePackId; });
      packsRoot.innerHTML =
        '<div class="ot-packs-wrap">' +
          '<div class="ot-packs-label">' +
            '<span>CURATED STARTER PACKS &amp; DEEP-LINKABLE BUNDLES</span>' +
            (activePack ? '<button type="button" class="ot-btn small" id="clear-pack-btn">Show All ' + catalog.cases.length + ' ×</button>' : '<span>Click any pack to filter &amp; copy a direct link</span>') +
          '</div>' +
          '<div class="ot-packs-row">' +
            exhibits.starterPacks.map(function (pk) {
              return '<button type="button" class="ot-pack-pill' + (pk.id === activePackId ? ' active' : '') + '" data-pack="' + esc(pk.id) + '">' + esc(pk.label) + '</button>';
            }).join('') +
          '</div>' +
          (activePack ? (
            '<div class="ot-pack-banner">' +
              '<span><strong>' + esc(activePack.label) + ':</strong> ' + esc(activePack.tagline) + '</span>' +
              '<button type="button" class="ot-btn small" id="copy-pack-link-btn">Copy Direct Pack Link</button>' +
            '</div>'
          ) : '') +
        '</div>';

      const clearBtn = document.getElementById('clear-pack-btn');
      if (clearBtn) {
        clearBtn.onclick = function () {
          activePackId = '';
          activeFilter = 'all';
          renderStarterPacks();
          syncPillHighlight();
          renderGrid();
        };
      }
      const copyPackBtn = document.getElementById('copy-pack-link-btn');
      if (copyPackBtn && activePack) {
        copyPackBtn.onclick = function () {
          const shareUrl = (catalog.meta.readerBaseUrl || (location.origin + location.pathname)) + '?pack=' + encodeURIComponent(activePack.id);
          navigator.clipboard.writeText(shareUrl).then(function () {
            copyPackBtn.textContent = '✓ Link Copied!';
            setTimeout(function () { copyPackBtn.textContent = 'Copy Direct Pack Link'; }, 2000);
          });
        };
      }
    }

    function renderGrid() {
      const q = (searchEl.value || '').trim().toLowerCase();
      const activePack = activePackId ? (exhibits.starterPacks || []).find(function (p) { return p.id === activePackId; }) : null;
      const packSlugSet = (activePack && activePack.slugs) ? new Set(activePack.slugs) : null;

      const filtered = catalog.cases.filter(function (c) {
        if (activePack) {
          if (packSlugSet && !packSlugSet.has(c.slug)) return false;
          if (activePack.partFilter && c.part !== activePack.partFilter) return false;
        } else if (activeFilter !== 'all' && c.part !== activeFilter) {
          return false;
        }
        if (q) {
          const hay = (c.fileNo + ' ' + c.title + ' ' + c.subtitle + ' ' + c.abstract + ' ' + c.ep + ' ' + c.looksLike + ' ' + c.actuallyIs + ' ' + c.goldenRule).toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });

      countEl.textContent = 'Showing ' + filtered.length + ' of ' + catalog.cases.length + ' Case Files';

      if (!filtered.length) {
        containerEl.innerHTML = '<div style="padding:30px;text-align:center;font-family:var(--font-mono);border:1px dashed var(--rule);">No case files match that query. (Honestly, good for your odds of surviving Tuesday.)</div>';
        return;
      }

      const htmlParts = [];
      catalog.parts.forEach(function (part) {
        const partCases = filtered.filter(function (c) { return c.part === part.id; });
        if (!partCases.length) return;
        htmlParts.push(
          '<div class="ot-part-block">' +
            '<div class="ot-part-banner">' +
              '<h3><span class="roman">' + esc(part.roman) + '</span>' + esc(part.title) + '</h3>' +
              '<p>' + esc(part.tagline) + '</p>' +
            '</div>' +
            '<div class="ot-grid">' +
              partCases.map(function (c) {
                const isLive = c.status === 'live';
                const isSurv = survivedSet.has(c.slug);
                const ex = (exhibits.stories || {})[c.slug];
                const hasFig = ex && ex.clinicalFigures && ex.clinicalFigures.length;
                const hasDiag = ex && ex.diagramId;
                const visTag = (hasFig || hasDiag)
                  ? '<span class="ot-exhibit-pill">' + (hasFig && hasDiag ? '🔬 Photo + Diagram' : (hasFig ? '🩻 Clinical Exhibit' : '📐 Forensic Diagram')) + '</span>'
                  : '';
                return (
                  '<article class="ot-card' + (isLive ? ' is-live' : '') + '">' +
                    '<div class="ot-tag-row">' +
                      '<span class="ot-file-no"><span class="ot-rivet"></span>CASE ' + esc(c.fileNo) + '</span>' +
                      '<span class="ot-stamp ' + (isLive ? 'live' : 'dark') + '">' + esc(c.verdictBadge || 'Live Story') + '</span>' +
                    '</div>' +
                    ((visTag || isSurv) ? '<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:-2px;">' + visTag + (isSurv ? '<span class="ot-survived-badge">✓ SURVIVED</span>' : '') + '</div>' : '') +
                    '<h4><a href="story.html?case=' + encodeURIComponent(c.slug) + '">' + esc(c.title) + '</a></h4>' +
                    '<div class="ot-card-mini-verdict">' +
                      '<div><strong>Looks like:</strong> ' + esc(c.looksLike) + '</div>' +
                      '<div><span class="red">Actually is:</span> ' + esc(c.actuallyIs) + '</div>' +
                    '</div>' +
                    '<p class="ot-card-abs">' + esc(c.abstract) + '</p>' +
                    '<div class="ot-golden-strip" style="margin-bottom:4px;"><strong>60-Second Rule</strong>' + esc(c.goldenRule) + '</div>' +
                    '<div class="ot-card-meta">' +
                      '<span>' + esc(c.ep) + '</span> · ' +
                      '<span>' + esc(c.duration || 'Audio') + '</span> · ' +
                      '<span>Avoidability: ' + esc(c.avoidability) + '</span>' +
                    '</div>' +
                    '<div class="ot-btn-row">' +
                      '<a class="ot-btn primary small" href="story.html?case=' + encodeURIComponent(c.slug) + '">Read Story →</a>' +
                      '<button type="button" class="ot-btn steel small" data-play-slug="' + esc(c.slug) + '">▶ Audio</button>' +
                      (c.transcriptUrl ? '<a class="ot-btn small" href="' + esc(c.transcriptUrl) + '" target="_blank" rel="noopener">Transcript ↗</a>' : '') +
                    '</div>' +
                  '</article>'
                );
              }).join('') +
            '</div>' +
          '</div>'
        );
      });
      containerEl.innerHTML = htmlParts.join('');
    }

    function activateRoom(roomId, shouldScroll) {
      activePackId = '';
      activeFilter = roomId || 'all';
      renderStarterPacks();
      syncPillHighlight();
      renderGrid();
      if (shouldScroll) {
        const catEl = document.getElementById('catalog');
        if (catEl) catEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    // Wire House Map room clicks
    if (mapRoot) {
      mapRoot.addEventListener('click', function (e) {
        const g = e.target.closest('[data-room]');
        if (!g) return;
        activateRoom(g.getAttribute('data-room'), true);
      });
      mapRoot.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const g = e.target.closest('[data-room]');
        if (!g) return;
        e.preventDefault();
        activateRoom(g.getAttribute('data-room'), true);
      });
    }

    // Wire Starter Packs clicks
    if (packsRoot) {
      packsRoot.addEventListener('click', function (e) {
        const btn = e.target.closest('.ot-pack-pill');
        if (!btn) return;
        const pid = btn.getAttribute('data-pack');
        activePackId = (activePackId === pid) ? '' : pid;
        if (!activePackId) activeFilter = 'all';
        renderStarterPacks();
        syncPillHighlight();
        renderGrid();
      });
    }

    pillsEl.addEventListener('click', function (e) {
      const btn = e.target.closest('.ot-pill');
      if (!btn) return;
      activateRoom(btn.dataset.filter, false);
    });
    searchEl.addEventListener('input', renderGrid);

    // Apply URL query deep-links (?pack=..., ?room=..., ?exam=1)
    const qParams = new URLSearchParams(location.search);
    if (qParams.get('pack')) {
      activePackId = qParams.get('pack');
    } else if (qParams.get('room')) {
      activeFilter = qParams.get('room');
    }
    renderStarterPacks();
    syncPillHighlight();
    renderGrid();

    if (qParams.get('pack') || qParams.get('room')) {
      setTimeout(function () {
        const catEl = document.getElementById('catalog');
        if (catEl) catEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
    if (qParams.get('exam') === '1') {
      setTimeout(function () { exam.open(); }, 180);
    }

    // Watchlist
    const watchEl = document.getElementById('watchlist-container');
    if (watchEl && catalog.watchlist) {
      watchEl.innerHTML = catalog.watchlist.map(function (w) {
        return (
          '<div class="ot-watch-row">' +
            '<div class="ot-watch-batch">' + esc(w.batch) + '<br /><span style="color:var(--ink-muted);font-weight:500;">' + esc(w.suggestedPart) + '</span></div>' +
            '<div><strong>' + esc(w.title) + '</strong> — ' + esc(w.hook) + '<div style="font-family:var(--font-mono);font-size:10.5px;color:var(--ink-muted);margin-top:2px;">' + esc(w.primarySource) + '</div></div>' +
            '<div><a class="ot-btn small" href="' + esc(w.driveUrl) + '" target="_blank" rel="noopener">Open in Drive ↗</a></div>' +
          '</div>'
        );
      }).join('');
    }

    // Play audio clicks (delegated)
    document.body.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-play-slug]');
      if (!btn) return;
      const slug = btn.dataset.playSlug;
      const found = catalog.cases.find(function (c) { return c.slug === slug; });
      if (found) player.playCase(found);
    });
  }

  /* ========================================================================
     STORY READER PAGE RENDERER (TRACKS 1–4 INTEGRATED)
     ======================================================================== */
  function renderStory(data, player) {
    const params = new URLSearchParams(location.search);
    const reqSlug = params.get('case') || 'fractal-wood-burning';
    const story = data.stories[reqSlug] || data.stories['fractal-wood-burning'];
    const catCase = data.catalog.cases.find(function (c) { return c.slug === story.slug; }) || data.catalog.cases[0];
    const ex = ((data.exhibits && data.exhibits.stories) || {})[story.slug] || {};
    const survivedSet = getSurvivedSet();
    const isSurvived = survivedSet.has(story.slug);

    document.title = story.title + ' — How Not to Die on an Ordinary Tuesday';

    const topAllLink = document.getElementById('story-top-all-link');
    if (topAllLink) topAllLink.textContent = '← All ' + data.catalog.cases.length + ' Case Files';

    // Track 2: Bespoke Forensic SVG Diagram (20 hand-crafted signature infographics + dynamic blueprint for all remaining stories!)
    let diagObj = null;
    if (window.OT_DIAGRAMS && (window.OT_DIAGRAMS[ex.diagramId] || window.OT_DIAGRAMS[story.slug])) {
      diagObj = window.OT_DIAGRAMS[ex.diagramId] || window.OT_DIAGRAMS[story.slug];
    } else if (typeof window.OT_RENDER_CASE_BLUEPRINT === 'function') {
      diagObj = window.OT_RENDER_CASE_BLUEPRINT(story, catCase);
    }
    const diagramHtml = diagObj ? (
      '<figure class="ot-diagram-card">' +
        '<div class="ot-diagram-badge">' + esc(diagObj.badge) + '</div>' +
        '<h3>' + esc(diagObj.title) + '</h3>' +
        '<div class="ot-diagram-svg-wrap">' + diagObj.svg + '</div>' +
        '<figcaption class="ot-diagram-cap">' + esc(diagObj.caption) + '</figcaption>' +
      '</figure>'
    ) : '';

    // Track 1: Verified CC-BY Clinical Exhibits HTML (with opt-in blur shield!)
    const exhibitsHtml = (ex.clinicalFigures && ex.clinicalFigures.length) ? (
      '<div class="ot-exhibits-stack">' +
        ex.clinicalFigures.map(function (fig, fi) {
          const blur = !!fig.blurredByDefault;
          return (
            '<figure class="ot-exhibit-card" data-exhibit-idx="' + fi + '">' +
              '<div class="ot-exhibit-head">' +
                '<span>' + esc(fig.exhibitCode || ('EXHIBIT ' + (fi + 1))) + ' · PRIMARY PEER-REVIEWED EVIDENCE</span>' +
                '<span class="ot-exhibit-head-right">' +
                  '<button type="button" class="ot-zoom-btn ot-no-print" data-zoom-btn="' + fi + '" title="Inspect full-resolution exhibit">🔍 Zoom</button>' +
                  '<a class="ot-lic-pill" href="' + esc(fig.licenseUrl || '#') + '" target="_blank" rel="noopener">✓ ' + esc(fig.license || 'CC BY') + '</a>' +
                '</span>' +
              '</div>' +
              '<div class="ot-exhibit-media">' +
                '<img src="' + esc(fig.src) + '" alt="' + esc(fig.caption) + '" loading="lazy" class="' + (blur ? 'is-blurred' : '') + '" />' +
                (blur ? (
                  '<div class="ot-unseal-overlay">' +
                    '<button type="button" class="ot-unseal-stamp" data-unseal-btn>[ UNSEAL CLINICAL EXHIBIT ]</button>' +
                    '<div class="ot-unseal-note">' + esc(fig.spoilerNote || 'Contains real medical photography from the primary journal report.') + '</div>' +
                  '</div>' +
                  '<button type="button" class="ot-reseal-btn" data-reseal-btn style="display:none;">Re-Seal</button>'
                ) : '') +
              '</div>' +
              '<figcaption class="ot-exhibit-foot">' +
                '<p class="ot-exhibit-caption">' + esc(fig.caption) + '</p>' +
                '<div class="ot-exhibit-cite">' +
                  '<span>' + esc(fig.citation) + '</span>' +
                  '<a href="' + esc(fig.sourceUrl) + '" target="_blank" rel="noopener">Open Primary Article on PMC ↗</a>' +
                '</div>' +
              '</figcaption>' +
            '</figure>'
          );
        }).join('') +
      '</div>'
    ) : '';

    // Track 1 (Copyright Firewall): External NC-ND / Restricted Figure Link-Outs
    const extFigHtml = (ex.externalFigureLinks && ex.externalFigureLinks.length) ? (
      '<section class="ot-ext-fig-bar ot-no-print">' +
        '<div class="ot-ext-fig-kicker">EXTERNAL CLINICAL EVIDENCE LOCKER · NON-COMMERCIAL JOURNAL FIGURES (LINK-OUT ONLY)</div>' +
        '<div class="ot-ext-fig-links">' +
          ex.externalFigureLinks.map(function (lf) {
            return '<a href="' + esc(lf.url) + '" target="_blank" rel="noopener"><span>🩻 ' + esc(lf.label) + '</span><span>↗</span></a>';
          }).join('') +
        '</div>' +
      '</section>'
    ) : '';

    // Track 3: Per-Story 1-Question "Before You Peek" Gut-Check Quiz
    const quizHtml = ex.quiz ? (
      '<section class="ot-quiz-box ot-no-print" id="story-quiz">' +
        '<div class="ot-quiz-kicker">BEFORE YOU PEEK · 60-SECOND GUT CHECK</div>' +
        '<div class="ot-quiz-prompt">' + esc(ex.quiz.prompt) + '</div>' +
        '<div class="ot-quiz-opts">' +
          ex.quiz.options.map(function (op, oi) {
            return '<button type="button" class="ot-quiz-opt" data-sq-opt="' + oi + '">' + esc(op.label) + '</button>';
          }).join('') +
        '</div>' +
        '<div class="ot-quiz-feedback" id="story-quiz-fb"></div>' +
      '</section>'
    ) : '';

    // Interleave Diagram after section 0 and Clinical Exhibits after section 1 for editorial magazine pacing!
    const proseSectionsHtml = story.sections.map(function (sec, idx) {
      let block =
        '<section class="ot-prose-section">' +
          (sec.kicker ? '<div class="ot-prose-kicker">' + esc(sec.kicker) + '</div>' : '') +
          '<h2>' + esc(sec.heading) + '</h2>' +
          (sec.paragraphs ? sec.paragraphs.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') : '') +
          (sec.bullets ? '<ul class="ot-redflag-list">' + sec.bullets.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>' : '') +
        '</section>';
      if (idx === 0 && diagramHtml) block += diagramHtml;
      if (idx === 1 && exhibitsHtml) block += exhibitsHtml;
      return block;
    }).join('');
    // Fallback if a story has fewer than 2 sections
    const trailingExhibits = (story.sections.length < 2 && exhibitsHtml) ? exhibitsHtml : '';

    const root = document.getElementById('story-root');
    const catIdx = data.catalog.cases.findIndex(function (c) { return c.slug === story.slug; });
    const prevCase = catIdx > 0 ? data.catalog.cases[catIdx - 1] : null;
    const nextCase = (catIdx >= 0 && catIdx < data.catalog.cases.length - 1) ? data.catalog.cases[catIdx + 1] : null;
    const seqNavHtml =
      '<nav class="ot-no-print" style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;margin:28px 0 8px;padding-top:18px;border-top:1px solid var(--rule);">' +
        (prevCase && data.stories[prevCase.slug]
          ? '<a class="ot-btn" href="story.html?case=' + encodeURIComponent(prevCase.slug) + '">← Case ' + esc(prevCase.fileNo) + ': ' + esc(prevCase.title) + '</a>'
          : '<span></span>') +
        (nextCase && data.stories[nextCase.slug]
          ? '<a class="ot-btn primary" href="story.html?case=' + encodeURIComponent(nextCase.slug) + '">Next: Case ' + esc(nextCase.fileNo) + ': ' + esc(nextCase.title) + ' →</a>'
          : '') +
      '</nav>';

    const relatedHtml = (story.relatedSlugs || []).map(function (rslug) {
      const rc = data.catalog.cases.find(function (c) { return c.slug === rslug; });
      if (!rc) return '';
      return (
        '<article class="ot-card is-live">' +
          '<div class="ot-tag-row">' +
            '<span class="ot-file-no"><span class="ot-rivet"></span>CASE ' + esc(rc.fileNo) + '</span>' +
            '<span class="ot-stamp live">' + esc(rc.verdictBadge || 'Live Story') + '</span>' +
          '</div>' +
          '<h4><a href="story.html?case=' + encodeURIComponent(rc.slug) + '">' + esc(rc.title) + '</a></h4>' +
          '<p class="ot-card-abs">' + esc(rc.subtitle) + '</p>' +
          '<div class="ot-btn-row"><a class="ot-btn primary small" href="story.html?case=' + encodeURIComponent(rc.slug) + '">Read Story →</a></div>' +
        '</article>'
      );
    }).join('');

    root.innerHTML =
      '<div class="ot-back-bar">' +
        '<a href="index.html">← Back to The Morgue Gazette (' + data.catalog.cases.length + ' Case Files)</a>' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<button type="button" class="ot-survive-toggle' + (isSurvived ? ' done' : '') + '" id="survive-toggle-btn">' + (isSurvived ? '✓ SURVIVED TUESDAY' : '○ Mark Case Survived') + '</button>' +
          '<span>FILE № ' + esc(story.fileNo) + ' · ' + esc(story.readTime) + '</span>' +
        '</div>' +
      '</div>' +

      '<header class="ot-article-header">' +
        '<div class="ot-article-kicker">' +
          '<span>' + esc(story.partLabel) + '</span>' +
          '<span class="ot-stamp live">AVOIDABILITY: ' + esc(story.toeTag.avoidability) + '</span>' +
        '</div>' +
        '<h1>' + esc(story.title) + '</h1>' +
        '<p class="ot-article-deck">' + esc(story.deck) + '</p>' +
        '<div class="ot-article-byline">' + esc(story.byline) + '</div>' +
      '</header>' +

      '<section class="ot-inline-audio ot-no-print">' +
        '<div class="ot-inline-audio-top">' +
          '<div>' +
            '<div class="ot-inline-audio-label">Companion Deep Dive Podcast Audio</div>' +
            '<div class="ot-inline-audio-title">' + esc(catCase.ep) + ': ' + esc(catCase.episodeTitle || catCase.title) + '</div>' +
            '<div class="ot-inline-audio-meta">' + esc(catCase.duration) + ' · ' + (catCase.spokenWords ? catCase.spokenWords.toLocaleString() + ' spoken words' : '') + ' · 1.0×–2.0× Speed + Auto-Resume</div>' +
          '</div>' +
          '<div class="ot-btn-row">' +
            '<button type="button" class="ot-btn primary" id="story-play-audio">▶ Play Episode Audio</button>' +
            (catCase.transcriptUrl ? '<a class="ot-btn" href="' + esc(catCase.transcriptUrl) + '" target="_blank" rel="noopener">Full Transcript ↗</a>' : '') +
            '<a class="ot-btn" href="' + esc(
              (data.catalog.meta.transcriptStudioUrl || 'https://yorekms.github.io/deep-dive-podcasts/resonance').replace(/\/+$/, '') +
              '/?view=listen' + (catCase.audioDriveId ? '&driveId=' + encodeURIComponent(catCase.audioDriveId) : '') +
              '&hub=forensic-medicine&title=' + encodeURIComponent(catCase.episodeTitle || catCase.title || '') + '&autoplay=1'
            ) + '" target="_blank" rel="noopener" title="Open this episode in the Deep Dive Pocket App (Resonance) with offline downloads &amp; synced transcripts">Pocket App ↗</a>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<div class="ot-verdict-box">' +
        '<div class="ot-verdict-col"><span class="ot-verdict-lbl">Looks Like on Tuesday</span><span class="ot-verdict-val">' + esc(story.looksLike) + '</span></div>' +
        '<div class="ot-verdict-col danger"><span class="ot-verdict-lbl">Actually Is Under the Microscope</span><span class="ot-verdict-val">' + esc(story.actuallyIs) + '</span></div>' +
      '</div>' +

      '<div class="ot-toetag-grid">' +
        '<div class="ot-toetag-cell"><strong>Cause</strong><span>' + esc(story.toeTag.cause) + '</span></div>' +
        '<div class="ot-toetag-cell"><strong>Mechanism</strong><span>' + esc(story.toeTag.mechanism) + '</span></div>' +
        '<div class="ot-toetag-cell"><strong>Manner / Outcome</strong><span>' + esc(story.toeTag.manner) + '</span></div>' +
        '<div class="ot-toetag-cell"><strong>Fatal False Reassurance</strong><span>' + esc(story.toeTag.falseReassurance) + '</span></div>' +
      '</div>' +

      '<article class="ot-prose">' + proseSectionsHtml + trailingExhibits + '</article>' +

      quizHtml +

      '<section class="ot-survival-card" id="survival-card">' +
        '<div class="ot-scissor-line">' +
          '<span>✂ TEAR ALONG DOTTED LINE — OR DOWNLOAD AS PNG CARD</span>' +
          '<span>FILE № ' + esc(story.fileNo) + '</span>' +
        '</div>' +
        '<h3>' + esc(story.survivalCard.headline) + '</h3>' +
        '<p class="ot-survival-sub">' + esc(story.survivalCard.subhead) + '</p>' +
        '<div class="ot-survival-steps">' +
          story.survivalCard.steps.map(function (st, idx) {
            return (
              '<div class="ot-step">' +
                '<div class="ot-step-num">STEP 0' + (idx + 1) + '</div>' +
                '<div class="ot-step-action">' + esc(st.action) + '</div>' +
                '<div class="ot-step-detail">' + esc(st.detail) + '</div>' +
              '</div>'
            );
          }).join('') +
        '</div>' +
        '<div class="ot-btn-row ot-no-print">' +
          '<button type="button" class="ot-btn primary" id="png-card-btn">⬇ Download PNG Card</button>' +
          '<button type="button" class="ot-btn" id="copy-card-btn">Copy Survival Checklist</button>' +
          '<button type="button" class="ot-btn" id="print-card-btn">Print / Save PDF</button>' +
        '</div>' +
      '</section>' +

      '<section class="ot-ledger-box">' +
        '<h3>The Autopsy &amp; Clinical Proof Ledger (Verbatim Facts Only)</h3>' +
        '<table class="ot-ledger-table"><tbody>' +
          story.ledger.map(function (row) {
            return '<tr><td>' + esc(row.label) + '</td><td>' + esc(row.value) + '</td></tr>';
          }).join('') +
        '</tbody></table>' +
      '</section>' +

      extFigHtml +

      '<section class="ot-sources-box" id="sources">' +
        '<h3>Primary Peer-Reviewed Sources, Official Guidance &amp; Audio Links</h3>' +
        '<div class="ot-source-list">' +
          story.sources.map(function (s) {
            return (
              '<a class="ot-source-item" href="' + esc(s.url) + '" target="_blank" rel="noopener">' +
                '<span class="ot-source-type">' + esc(s.type) + '</span>' +
                '<span class="ot-source-label">' + esc(s.label) + '</span>' +
                '<span style="font-family:var(--font-mono);font-size:12px;">↗</span>' +
              '</a>'
            );
          }).join('') +
        '</div>' +
      '</section>' +

      seqNavHtml +

      (relatedHtml ? (
        '<section class="ot-no-print" style="margin-top:26px;">' +
          '<div class="ot-section-head"><h2>More From This Room</h2><span class="ot-section-kicker">Continue Reading</span></div>' +
          '<div class="ot-related-grid">' + relatedHtml + '</div>' +
        '</section>'
      ) : '');

    // Wire Unseal / Re-Seal Clinical Exhibit Blur Shields + Darkroom Full-Res Lightbox
    function openExhibitLightbox(fig) {
      let lb = document.getElementById('ot-lightbox');
      if (!lb) {
        lb = document.createElement('div');
        lb.id = 'ot-lightbox';
        lb.className = 'ot-lightbox ot-no-print';
        lb.setAttribute('role', 'dialog');
        lb.setAttribute('aria-modal', 'true');
        lb.innerHTML =
          '<div class="ot-lightbox-inner">' +
            '<div class="ot-lightbox-top"><span id="ot-lb-code"></span><button type="button" class="ot-zoom-btn" id="ot-lb-close">Close × (Esc)</button></div>' +
            '<div class="ot-lightbox-body"><img id="ot-lb-img" src="" alt="" /></div>' +
            '<div class="ot-lightbox-foot"><div id="ot-lb-cap"></div><div class="ot-lightbox-cite"><span id="ot-lb-cite"></span><a id="ot-lb-src" href="#" target="_blank" rel="noopener">Open Primary Article on PMC ↗</a></div></div>' +
          '</div>';
        document.body.appendChild(lb);
        lb.addEventListener('click', function (ev) { if (ev.target === lb) lb.classList.remove('open'); });
        document.getElementById('ot-lb-close').addEventListener('click', function () { lb.classList.remove('open'); });
        document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') lb.classList.remove('open'); });
      }
      document.getElementById('ot-lb-code').textContent = (fig.exhibitCode || 'CLINICAL EXHIBIT') + ' · ' + (fig.license || 'CC BY');
      const lbImg = document.getElementById('ot-lb-img');
      lbImg.src = fig.src;
      lbImg.alt = fig.caption || '';
      document.getElementById('ot-lb-cap').textContent = fig.caption || '';
      document.getElementById('ot-lb-cite').textContent = fig.citation || '';
      document.getElementById('ot-lb-src').href = fig.sourceUrl || '#';
      lb.classList.add('open');
    }

    root.querySelectorAll('.ot-exhibit-card').forEach(function (card) {
      const idx = parseInt(card.getAttribute('data-exhibit-idx'), 10);
      const figObj = (ex.clinicalFigures || [])[idx];
      const img = card.querySelector('img');
      const overlay = card.querySelector('.ot-unseal-overlay');
      const unsealBtn = card.querySelector('[data-unseal-btn]');
      const resealBtn = card.querySelector('[data-reseal-btn]');
      const zoomBtn = card.querySelector('[data-zoom-btn]');
      if (unsealBtn && img && overlay) {
        unsealBtn.addEventListener('click', function () {
          img.classList.remove('is-blurred');
          overlay.style.display = 'none';
          if (resealBtn) resealBtn.style.display = 'inline-block';
        });
      }
      if (resealBtn && img && overlay) {
        resealBtn.addEventListener('click', function () {
          img.classList.add('is-blurred');
          overlay.style.display = 'flex';
          resealBtn.style.display = 'none';
        });
      }
      if (img && figObj) {
        img.addEventListener('click', function () {
          if (!img.classList.contains('is-blurred')) openExhibitLightbox(figObj);
        });
      }
      if (zoomBtn && figObj) {
        zoomBtn.addEventListener('click', function () {
          if (img && img.classList.contains('is-blurred')) {
            img.classList.remove('is-blurred');
            if (overlay) overlay.style.display = 'none';
            if (resealBtn) resealBtn.style.display = 'inline-block';
          }
          openExhibitLightbox(figObj);
        });
      }
    });

    // Wire Per-Story Gut-Check Quiz
    if (ex.quiz) {
      let sqDone = false;
      root.querySelectorAll('[data-sq-opt]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (sqDone) return;
          sqDone = true;
          const pick = parseInt(btn.getAttribute('data-sq-opt'), 10);
          const chosen = ex.quiz.options[pick];
          root.querySelectorAll('[data-sq-opt]').forEach(function (b, bi) {
            b.disabled = true;
            if (ex.quiz.options[bi].correct) b.classList.add('correct');
            else if (bi === pick) b.classList.add('wrong');
          });
          const fb = document.getElementById('story-quiz-fb');
          if (fb) {
            fb.className = 'ot-quiz-feedback show ' + (chosen.correct ? 'ok' : 'bad');
            fb.textContent = (chosen.correct ? '✓ ' : '✕ ') + chosen.feedback;
          }
        });
      });
    }

    // Wire Survived Toggle Stamp
    const survBtn = document.getElementById('survive-toggle-btn');
    if (survBtn) {
      survBtn.addEventListener('click', function () {
        const set = getSurvivedSet();
        if (set.has(story.slug)) {
          set.delete(story.slug);
          survBtn.classList.remove('done');
          survBtn.textContent = '○ Mark Case Survived';
        } else {
          set.add(story.slug);
          survBtn.classList.add('done');
          survBtn.textContent = '✓ SURVIVED TUESDAY';
        }
        saveSurvivedSet(set);
      });
    }

    // Wire audio, PNG card, copy, and print
    const playStoryBtn = document.getElementById('story-play-audio');
    if (playStoryBtn) {
      playStoryBtn.addEventListener('click', function () { player.playCase(catCase); });
    }
    const pngBtn = document.getElementById('png-card-btn');
    if (pngBtn) {
      pngBtn.addEventListener('click', function () {
        downloadSurvivalCardPng(story);
        pngBtn.textContent = '✓ PNG Downloaded';
        setTimeout(function () { pngBtn.textContent = '⬇ Download PNG Card'; }, 2200);
      });
    }
    const copyBtn = document.getElementById('copy-card-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        const lines = [
          story.survivalCard.headline + ' (' + story.title + ')',
          story.survivalCard.subhead,
          ''
        ].concat(story.survivalCard.steps.map(function (st, i) {
          return (i + 1) + '. ' + st.action + ': ' + st.detail;
        })).concat(['', 'From: How Not to Die on an Ordinary Tuesday (my-ordinary-tuesday.carrd.co)']);
        navigator.clipboard.writeText(lines.join('\n')).then(function () {
          copyBtn.textContent = '✓ Copied to Clipboard';
          setTimeout(function () { copyBtn.textContent = 'Copy Survival Checklist'; }, 2200);
        });
      });
    }
    const printBtn = document.getElementById('print-card-btn');
    if (printBtn) {
      printBtn.addEventListener('click', function () { window.print(); });
    }
  }

  /* ========================================================================
     CROSS-SITE DEEP DIVE AUDIO NETWORK STRIP (index.html + story.html)
     ======================================================================== */
  function renderNetworkStrip(catalog) {
    const el = document.getElementById('network-strip');
    const hubs = (catalog && catalog.meta && catalog.meta.networkHubs) || [];
    const portal = (catalog && catalog.meta && catalog.meta.networkPortalUrl) || '';
    if (!el || !hubs.length) return;
    el.innerHTML =
      '<div class="ot-network-strip">' +
        '<div class="ot-network-head">' +
          '<span class="ot-network-kicker">EXPLORE THE DEEP DIVE AUDIO NETWORK · 16 COMPANION CARRD HUBS</span>' +
          (portal ? '<a class="ot-network-portal" href="' + esc(portal) + '" target="_blank" rel="noopener">All Hubs &amp; RSS Feeds ↗</a>' : '') +
        '</div>' +
        '<div class="ot-network-pills">' +
          hubs.map(function (h) {
            return '<a class="ot-network-pill' + (h.tier === 'primary' ? ' primary' : '') + '" href="' + esc(h.url) + '" target="_blank" rel="noopener">' + esc(h.label) + ' ↗</a>';
          }).join('') +
        '</div>' +
      '</div>';
  }

  /* ========================================================================
     BOOTSTRAP
     ======================================================================== */
  loadData().then(function (data) {
    const player = initAudioPlayer(data.catalog.meta);
    if (document.body.dataset.page === 'story') {
      renderStory(data, player);
    } else {
      renderIndex(data, player);
    }
    renderNetworkStrip(data.catalog);
  }).catch(function (err) {
    console.error('Failed to load Ordinary Tuesday bundle:', err);
  });
})();
