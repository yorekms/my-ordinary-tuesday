(function () {
  'use strict';

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function loadData() {
    if (window.OT_BUNDLE && window.OT_BUNDLE.catalog && window.OT_BUNDLE.stories) {
      // Try live fetch if served over HTTP so edits to JSON reflect immediately without rebuilding bundle.js
      if (location.protocol.startsWith('http')) {
        try {
          const [catRes, stoRes] = await Promise.all([
            fetch('data/catalog.json', { cache: 'no-store' }),
            fetch('data/stories.json', { cache: 'no-store' })
          ]);
          if (catRes.ok && stoRes.ok) {
            return { catalog: await catRes.json(), stories: await stoRes.json() };
          }
        } catch (e) {}
      }
      return window.OT_BUNDLE;
    }
    const [catRes, stoRes] = await Promise.all([
      fetch('data/catalog.json'),
      fetch('data/stories.json')
    ]);
    return { catalog: await catRes.json(), stories: await stoRes.json() };
  }

  /* ========================================================================
     SHARED VARIABLE-SPEED AUDIO PLAYER
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
    });
    audioEl.addEventListener('timeupdate', function () {
      curEl.textContent = fmt(audioEl.currentTime);
      if (isFinite(audioEl.duration) && audioEl.duration > 0) {
        totEl.textContent = fmt(audioEl.duration);
        seekEl.value = String(Math.round((audioEl.currentTime / audioEl.duration) * 1000));
      }
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

    return {
      playCase: function (c) {
        currentCase = c;
        triedProxy = false;
        dock.classList.add('open');
        titleEl.textContent = 'FILE № ' + c.fileNo + ' — ' + c.title + ' (' + c.ep + ')';
        transLink.href = c.transcriptUrl || '#';
        transLink.style.display = c.transcriptUrl ? 'inline-block' : 'none';
        if (meta.transcriptStudioUrl) studioLink.href = meta.transcriptStudioUrl;
        loadNative(c, false);
      }
    };
  }

  /* ========================================================================
     INDEX PAGE RENDERER
     ======================================================================== */
  function renderIndex(data, player) {
    const catalog = data.catalog;
    const liveCases = catalog.cases.filter(function (c) { return c.status === 'live'; });
    const totalWords = catalog.cases.reduce(function (s, c) { return s + (c.spokenWords || 0); }, 0);

    const updatedEl = document.getElementById('meta-updated');
    if (updatedEl) updatedEl.textContent = 'UPDATED ' + catalog.meta.updated;

    const navCatLink = document.getElementById('nav-catalog-link');
    if (navCatLink) navCatLink.textContent = 'All ' + catalog.cases.length + ' Stories';
    const catHeading = document.getElementById('catalog-heading');
    if (catHeading) catHeading.textContent = 'All ' + catalog.cases.length + ' Stories — Browse by Danger Zone';

    const statsEl = document.getElementById('masthead-stats');
    if (statsEl) {
      statsEl.innerHTML =
        '<span class="ot-stat-chip crimson">' + liveCases.length + ' Stories Live</span>' +
        '<span class="ot-stat-chip">' + catalog.parts.length + ' Everyday Danger Zones</span>' +
        '<span class="ot-stat-chip">' + Math.round(totalWords / 1000) + 'k+ Transcribed Words Linked</span>' +
        '<button type="button" class="ot-btn primary small" id="random-case-btn" style="border-radius:999px;">🎲 Random Case</button>';
      const randBtn = document.getElementById('random-case-btn');
      if (randBtn && liveCases.length) {
        randBtn.addEventListener('click', function () {
          const pick = liveCases[Math.floor(Math.random() * liveCases.length)];
          location.href = 'story.html?case=' + encodeURIComponent(pick.slug);
        });
      }
    }

    // Featured Front-Page Spread
    const spreadEl = document.getElementById('featured-spread');
    if (spreadEl && liveCases.length) {
      function featureCard(c, isLead) {
        const st = data.stories[c.slug];
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
                '<span class="ot-stamp live">LIVE DISPATCH · ' + esc(c.verdictBadge) + '</span>' +
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
      const featuredSlugs = ['fractal-wood-burning', 'wire-behind-the-pain', 'chocolate-brown-blood'];
      const picked = featuredSlugs
        .map(function (sl) { return liveCases.find(function (c) { return c.slug === sl; }); })
        .filter(Boolean);
      const show = picked.length >= 3 ? picked : liveCases.slice(0, 3);
      const lead = show[0];
      const sides = show.slice(1, 3);
      spreadEl.innerHTML =
        featureCard(lead, true) +
        '<div class="ot-spread-side">' + sides.map(function (c) { return featureCard(c, false); }).join('') + '</div>';
    }

    // Filter Pills
    const pillsEl = document.getElementById('filter-pills');
    const searchEl = document.getElementById('search-input');
    const containerEl = document.getElementById('catalog-container');
    const countEl = document.getElementById('catalog-count-label');
    let activeFilter = 'all';

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
    ].concat(liveCases.length < catalog.cases.length ? [{ id: 'live', label: '★ Live Stories (' + liveCases.length + ')', extraClass: 'live-pill' }] : []).concat(catalog.parts.map(function (p) {
      const n = catalog.cases.filter(function (c) { return c.part === p.id; }).length;
      return { id: p.id, label: (shortPart[p.id] || p.stamp) + ' (' + n + ')' };
    }));

    pillsEl.innerHTML = pillDefs.map(function (p) {
      return '<button type="button" class="ot-pill ' + (p.extraClass || '') + (p.id === 'all' ? ' active' : '') + '" data-filter="' + esc(p.id) + '">' + esc(p.label) + '</button>';
    }).join('');

    function renderGrid() {
      const q = (searchEl.value || '').trim().toLowerCase();
      const filtered = catalog.cases.filter(function (c) {
        if (activeFilter === 'live' && c.status !== 'live') return false;
        if (activeFilter !== 'all' && activeFilter !== 'live' && c.part !== activeFilter) return false;
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
                return (
                  '<article class="ot-card' + (isLive ? ' is-live' : '') + '">' +
                    '<div class="ot-tag-row">' +
                      '<span class="ot-file-no"><span class="ot-rivet"></span>CASE ' + esc(c.fileNo) + '</span>' +
                      '<span class="ot-stamp ' + (isLive ? 'live' : 'dark') + '">' + esc(c.verdictBadge || (isLive ? 'Live Story' : 'Queued')) + '</span>' +
                    '</div>' +
                    '<h4>' + (isLive ? '<a href="story.html?case=' + encodeURIComponent(c.slug) + '">' + esc(c.title) + '</a>' : esc(c.title)) + '</h4>' +
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
                      (isLive
                        ? '<a class="ot-btn primary small" href="story.html?case=' + encodeURIComponent(c.slug) + '">Read Story →</a>'
                        : '<span class="ot-btn small" style="opacity:0.65;cursor:default;">Text Queue</span>') +
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

    pillsEl.addEventListener('click', function (e) {
      const btn = e.target.closest('.ot-pill');
      if (!btn) return;
      activeFilter = btn.dataset.filter;
      pillsEl.querySelectorAll('.ot-pill').forEach(function (b) { b.classList.toggle('active', b === btn); });
      renderGrid();
    });
    searchEl.addEventListener('input', renderGrid);
    renderGrid();

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
     STORY READER PAGE RENDERER
     ======================================================================== */
  function renderStory(data, player) {
    const params = new URLSearchParams(location.search);
    const reqSlug = params.get('case') || 'fractal-wood-burning';
    const story = data.stories[reqSlug] || data.stories['fractal-wood-burning'];
    const catCase = data.catalog.cases.find(function (c) { return c.slug === story.slug; }) || data.catalog.cases[0];

    document.title = story.title + ' — How Not to Die on an Ordinary Tuesday';

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

    const topAllLink = document.getElementById('story-top-all-link');
    if (topAllLink) topAllLink.textContent = '← All ' + data.catalog.cases.length + ' Case Files';

    root.innerHTML =
      '<div class="ot-back-bar">' +
        '<a href="index.html">← Back to The Morgue Gazette (' + data.catalog.cases.length + ' Case Files)</a>' +
        '<span>FILE № ' + esc(story.fileNo) + ' · ' + esc(story.readTime) + '</span>' +
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

      // Inline Companion Audio Launcher
      '<section class="ot-inline-audio ot-no-print">' +
        '<div class="ot-inline-audio-top">' +
          '<div>' +
            '<div class="ot-inline-audio-label">Companion Deep Dive Podcast Audio</div>' +
            '<div class="ot-inline-audio-title">' + esc(catCase.ep) + ': ' + esc(catCase.episodeTitle || catCase.title) + '</div>' +
            '<div class="ot-inline-audio-meta">' + esc(catCase.duration) + ' · ' + (catCase.spokenWords ? catCase.spokenWords.toLocaleString() + ' spoken words' : '') + ' · 1.0×–2.0× Variable Speed</div>' +
          '</div>' +
          '<div class="ot-btn-row">' +
            '<button type="button" class="ot-btn primary" id="story-play-audio">▶ Play Episode Audio</button>' +
            (catCase.transcriptUrl ? '<a class="ot-btn" href="' + esc(catCase.transcriptUrl) + '" target="_blank" rel="noopener">Full Transcript ↗</a>' : '') +
            '<a class="ot-btn" href="' + esc(data.catalog.meta.transcriptStudioUrl) + '" target="_blank" rel="noopener">Sync Studio ↗</a>' +
          '</div>' +
        '</div>' +
      '</section>' +

      // Looks Like vs Actually Is
      '<div class="ot-verdict-box">' +
        '<div class="ot-verdict-col"><span class="ot-verdict-lbl">Looks Like on Tuesday</span><span class="ot-verdict-val">' + esc(story.looksLike) + '</span></div>' +
        '<div class="ot-verdict-col danger"><span class="ot-verdict-lbl">Actually Is Under the Microscope</span><span class="ot-verdict-val">' + esc(story.actuallyIs) + '</span></div>' +
      '</div>' +

      // Toe-Tag Summary Grid
      '<div class="ot-toetag-grid">' +
        '<div class="ot-toetag-cell"><strong>Cause</strong><span>' + esc(story.toeTag.cause) + '</span></div>' +
        '<div class="ot-toetag-cell"><strong>Mechanism</strong><span>' + esc(story.toeTag.mechanism) + '</span></div>' +
        '<div class="ot-toetag-cell"><strong>Manner / Outcome</strong><span>' + esc(story.toeTag.manner) + '</span></div>' +
        '<div class="ot-toetag-cell"><strong>Fatal False Reassurance</strong><span>' + esc(story.toeTag.falseReassurance) + '</span></div>' +
      '</div>' +

      // Prose Body
      '<article class="ot-prose">' +
        story.sections.map(function (sec) {
          return (
            '<section class="ot-prose-section">' +
              (sec.kicker ? '<div class="ot-prose-kicker">' + esc(sec.kicker) + '</div>' : '') +
              '<h2>' + esc(sec.heading) + '</h2>' +
              (sec.paragraphs ? sec.paragraphs.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') : '') +
              (sec.bullets ? '<ul class="ot-redflag-list">' + sec.bullets.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>' : '') +
            '</section>'
          );
        }).join('') +
      '</article>' +

      // Perforated Tear-Off Survival Card
      '<section class="ot-survival-card" id="survival-card">' +
        '<div class="ot-scissor-line">' +
          '<span>✂ TEAR ALONG DOTTED LINE — OR SCREENSHOT THIS CARD</span>' +
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
          '<button type="button" class="ot-btn primary" id="copy-card-btn">Copy Survival Checklist</button>' +
          '<button type="button" class="ot-btn" id="print-card-btn">Print / Save PDF Card</button>' +
        '</div>' +
      '</section>' +

      // Autopsy / Clinical Proof Ledger
      '<section class="ot-ledger-box">' +
        '<h3>The Autopsy &amp; Clinical Proof Ledger (Verbatim Facts Only)</h3>' +
        '<table class="ot-ledger-table"><tbody>' +
          story.ledger.map(function (row) {
            return '<tr><td>' + esc(row.label) + '</td><td>' + esc(row.value) + '</td></tr>';
          }).join('') +
        '</tbody></table>' +
      '</section>' +

      // Primary Peer-Reviewed Sources & Outbound Links
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

      // Sequential Book Prev/Next Navigation
      seqNavHtml +

      // Related Stories
      (relatedHtml ? (
        '<section class="ot-no-print" style="margin-top:26px;">' +
          '<div class="ot-section-head"><h2>More From This Room</h2><span class="ot-section-kicker">Continue Reading</span></div>' +
          '<div class="ot-related-grid">' + relatedHtml + '</div>' +
        '</section>'
      ) : '');

    // Wire story interactive buttons
    const playStoryBtn = document.getElementById('story-play-audio');
    if (playStoryBtn) {
      playStoryBtn.addEventListener('click', function () {
        player.playCase(catCase);
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
        })).concat(['', 'From: How Not to Die on an Ordinary Tuesday']);
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
     BOOTSTRAP
     ======================================================================== */
  loadData().then(function (data) {
    const player = initAudioPlayer(data.catalog.meta);
    if (document.body.dataset.page === 'story') {
      renderStory(data, player);
    } else {
      renderIndex(data, player);
    }
  }).catch(function (err) {
    console.error('Failed to load Ordinary Tuesday bundle:', err);
  });
})();
