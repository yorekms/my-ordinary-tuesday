/* ==========================================================================
   HOW NOT TO DIE ON AN ORDINARY TUESDAY — FORENSIC SVG INFOGRAPHICS ENGINE
   20 hand-crafted "Airline Safety Card meets NTSB" signature vector diagrams
   + Dynamic Case Mechanism Blueprint generator for every story
   + Interactive Architectural "House of Traps" Floorplan
   100% original & commercial-print safe. Zero external dependencies.
   ========================================================================== */
(function () {
  'use strict';

  function svgEsc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function wrapSvgLines(text, maxChars, maxLines) {
    var words = String(text || '').trim().split(/\s+/);
    var lines = [], cur = '';
    for (var i = 0; i < words.length; i++) {
      var test = cur ? (cur + ' ' + words[i]) : words[i];
      if (test.length > maxChars && cur) {
        lines.push(cur);
        cur = words[i];
        if (lines.length >= maxLines - 1) {
          var rest = words.slice(i).join(' ');
          if (rest.length > maxChars) rest = rest.slice(0, maxChars - 1).trim() + '…';
          lines.push(rest);
          return lines;
        }
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
    return lines.slice(0, maxLines);
  }

  function tspanLines(lines, x, y0, dy) {
    return lines.map(function (ln, idx) {
      return '<text x="' + x + '" y="' + (y0 + idx * dy) + '">' + svgEsc(ln) + '</text>';
    }).join('');
  }

  var DIAGRAMS = {
    /* ==================== PART I: GARAGE & YARD (5) ==================== */
    'fractal-wood-burning': {
      badge: 'FORENSIC INFOGRAPHIC · ELECTRICAL PHYSICS',
      title: 'Anatomy of a 15,000-Volt Craft Table',
      caption: 'Dry wood is an insulator in high-school physics. High-school physics did not bring a salvaged microwave transformer soaked in baking-soda water.',
      svg:
        '<svg viewBox="0 0 720 330" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagram comparing why touching an electrocuted victim creates a second circuit versus cutting the main breaker first">' +
        '<rect width="720" height="330" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<rect x="18" y="18" width="332" height="294" rx="8" fill="#FFF" stroke="#F5C6C6" stroke-width="1.5"/>' +
        '<rect x="18" y="18" width="332" height="30" rx="8" fill="#FDF2F2"/>' +
        '<text x="32" y="38" font-family="IBM Plex Mono,monospace" font-size="11" font-weight="700" fill="#B41C1C">✕ WHAT KILLS RESCUER #2</text>' +
        '<rect x="34" y="70" width="92" height="58" rx="5" fill="#181B20"/>' +
        '<text x="80" y="94" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FFF">SALVAGED</text>' +
        '<text x="80" y="108" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">2,000–15kV</text>' +
        '<text x="80" y="121" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#A1A8B3">NO FUSE / NO GFCI</text>' +
        '<rect x="148" y="84" width="110" height="38" rx="4" fill="#EFE7DA" stroke="#B41C1C" stroke-width="1.5"/>' +
        '<path d="M158 103 L176 96 L186 108 L206 94 L224 109 L246 98" fill="none" stroke="#B41C1C" stroke-width="2.2"/>' +
        '<text x="203" y="136" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" font-weight="600" fill="#44403C">Baking-Soda Wet Wood</text>' +
        '<text x="203" y="149" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="#B41C1C">(NOW A LIVE CONDUCTOR)</text>' +
        '<path d="M126 95 L148 95" stroke="#B41C1C" stroke-width="2.5" stroke-dasharray="4 2"/>' +
        '<circle cx="195" cy="184" r="11" fill="none" stroke="#18181B" stroke-width="2.2"/>' +
        '<line x1="195" y1="195" x2="195" y2="238" stroke="#18181B" stroke-width="2.2"/>' +
        '<line x1="195" y1="205" x2="178" y2="122" stroke="#B41C1C" stroke-width="2.4"/>' +
        '<line x1="195" y1="238" x2="180" y2="268" stroke="#18181B" stroke-width="2.2"/>' +
        '<line x1="195" y1="238" x2="210" y2="268" stroke="#18181B" stroke-width="2.2"/>' +
        '<text x="195" y="284" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#18181B">VICTIM #1</text>' +
        '<text x="195" y="296" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" fill="#78716C">60Hz locks grip</text>' +
        '<circle cx="288" cy="184" r="11" fill="none" stroke="#B41C1C" stroke-width="2.2"/>' +
        '<line x1="288" y1="195" x2="288" y2="238" stroke="#B41C1C" stroke-width="2.2"/>' +
        '<line x1="288" y1="205" x2="210" y2="205" stroke="#B41C1C" stroke-width="2.6" stroke-dasharray="4 3"/>' +
        '<line x1="288" y1="238" x2="274" y2="268" stroke="#B41C1C" stroke-width="2.2"/>' +
        '<line x1="288" y1="238" x2="302" y2="268" stroke="#B41C1C" stroke-width="2.2"/>' +
        '<text x="288" y="284" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#B41C1C">RESISTOR #2</text>' +
        '<text x="288" y="296" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" fill="#B41C1C">Current jumps arm-to-arm</text>' +
        '<text x="246" y="198" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="13" font-weight="700" fill="#B41C1C">⚡</text>' +
        '<rect x="370" y="18" width="332" height="294" rx="8" fill="#FFF" stroke="#D1CCC2" stroke-width="1.5"/>' +
        '<rect x="370" y="18" width="332" height="30" rx="8" fill="#181B20"/>' +
        '<text x="384" y="38" font-family="IBM Plex Mono,monospace" font-size="11" font-weight="700" fill="#FFF">✓ FIRST 60 SECONDS PROTOCOL</text>' +
        '<rect x="394" y="72" width="112" height="92" rx="6" fill="#F3F1EC" stroke="#18181B" stroke-width="1.8"/>' +
        '<text x="450" y="92" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#18181B">MAIN BREAKER</text>' +
        '<rect x="424" y="102" width="52" height="26" rx="4" fill="#B41C1C"/>' +
        '<text x="450" y="119" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="11" font-weight="700" fill="#FFF">OFF</text>' +
        '<text x="450" y="150" text-anchor="middle" font-family="Inter,sans-serif" font-size="9.5" fill="#44403C">Step 1: Kill power</text>' +
        '<path d="M514 118 L544 118" stroke="#18181B" stroke-width="2.2"/>' +
        '<rect x="552" y="72" width="128" height="92" rx="6" fill="#FDF2F2" stroke="#B41C1C" stroke-width="1.5"/>' +
        '<text x="616" y="96" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="11" font-weight="700" fill="#B41C1C">911 + CPR + AED</text>' +
        '<text x="616" y="116" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" fill="#18181B">Only touch victim</text>' +
        '<text x="616" y="131" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" fill="#18181B">AFTER power is</text>' +
        '<text x="616" y="146" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" font-weight="700" fill="#B41C1C">confirmed dead.</text>' +
        '<rect x="394" y="186" width="286" height="104" rx="6" fill="#FAF9F6" stroke="#E4E0D8"/>' +
        '<text x="408" y="208" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#B41C1C">THE BRUTAL ARITHMETIC</text>' +
        '<text x="408" y="229" font-family="Inter,sans-serif" font-size="11.5" fill="#18181B">• Estimated shock fatality rate: ~71%</text>' +
        '<text x="408" y="249" font-family="Inter,sans-serif" font-size="11.5" fill="#18181B">• Dry wooden dowel handles fail at &gt;2,000 V</text>' +
        '<text x="408" y="269" font-family="Inter,sans-serif" font-size="11.5" fill="#18181B">• Survival rule: Never build a home Lichtenberg rig.</text>' +
        '</svg>'
    },

    'driveway-ied-truck-tire': {
      badge: 'FORENSIC INFOGRAPHIC · BLAST GEOMETRY',
      title: 'The Blast Radius of a 110-PSI Commercial Tire',
      caption: 'A heavy-duty radial tire at 110 PSI stores the pneumatic energy of a hand grenade. Standing face-on to the sidewall puts your chest inside the fragmentation cone.',
      svg:
        '<svg viewBox="0 0 720 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Top-down blast geometry diagram of a commercial truck tire zipper failure">' +
        '<rect width="720" height="320" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<path d="M210 160 L58 60 A195 195 0 0 0 58 260 Z" fill="#FDF2F2" stroke="#F5C6C6" stroke-width="1.5"/>' +
        '<path d="M270 160 L422 60 A195 195 0 0 1 422 260 Z" fill="#FDF2F2" stroke="#F5C6C6" stroke-width="1.5"/>' +
        '<rect x="210" y="96" width="60" height="128" rx="12" fill="#181B20"/>' +
        '<rect x="222" y="112" width="36" height="96" rx="4" fill="#323944"/>' +
        '<text x="240" y="156" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#FFF">110 PSI</text>' +
        '<text x="240" y="170" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#FCA5A5">ZIPPER</text>' +
        '<text x="128" y="148" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#B41C1C">SIDEWALL</text>' +
        '<text x="128" y="164" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#B41C1C">BLAST CONE</text>' +
        '<text x="128" y="182" text-anchor="middle" font-family="Inter,sans-serif" font-size="9.5" fill="#44403C">0.5 m = ~265 PSI</text>' +
        '<text x="128" y="196" text-anchor="middle" font-family="Inter,sans-serif" font-size="9.5" fill="#44403C">overpressure shock</text>' +
        '<text x="352" y="154" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#B41C1C">✕ NEVER STAND</text>' +
        '<text x="352" y="170" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#B41C1C">FACING SIDEWALL</text>' +
        '<rect x="176" y="20" width="128" height="44" rx="6" fill="#ECFDF5" stroke="#10B981" stroke-width="1.5"/>' +
        '<text x="240" y="38" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#065F46">✓ SAFE STAND-OFF</text>' +
        '<text x="240" y="54" text-anchor="middle" font-family="Inter,sans-serif" font-size="9.5" fill="#065F46">≥ 2.5 m along tread line</text>' +
        '<line x1="240" y1="64" x2="240" y2="96" stroke="#10B981" stroke-width="2" stroke-dasharray="4 3"/>' +
        '<rect x="462" y="24" width="236" height="272" rx="8" fill="#FFF" stroke="#D1CCC2" stroke-width="1.5"/>' +
        '<rect x="462" y="24" width="236" height="30" rx="8" fill="#181B20"/>' +
        '<text x="476" y="44" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#FFF">OSHA / TIRE SURVIVAL CHECK</text>' +
        '<text x="476" y="78" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#B41C1C">1. STEEL RESTRAINING CAGE</text>' +
        '<text x="476" y="96" font-family="Inter,sans-serif" font-size="11" fill="#44403C">Required for any commercial</text>' +
        '<text x="476" y="111" font-family="Inter,sans-serif" font-size="11" fill="#44403C">or split-rim inflation.</text>' +
        '<text x="476" y="142" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#B41C1C">2. CLIP-ON REMOTE CHUCK</text>' +
        '<text x="476" y="160" font-family="Inter,sans-serif" font-size="11" fill="#44403C">Use an inline gauge + ≥2.5 m</text>' +
        '<text x="476" y="175" font-family="Inter,sans-serif" font-size="11" fill="#44403C">hose so your hands leave first.</text>' +
        '<text x="476" y="206" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#B41C1C">3. RUN-FLAT = SCRAP TIRE</text>' +
        '<text x="476" y="224" font-family="Inter,sans-serif" font-size="11" fill="#44403C">Steel sidewall cords fatigue</text>' +
        '<text x="476" y="239" font-family="Inter,sans-serif" font-size="11" fill="#44403C">invisibly when driven under-</text>' +
        '<text x="476" y="254" font-family="Inter,sans-serif" font-size="11" fill="#44403C">inflated—never just top it off.</text>' +
        '</svg>'
    },

    'dry-ice-riding-shotgun': {
      badge: 'FORENSIC INFOGRAPHIC · GAS STRATIFICATION',
      title: 'Why Dry Ice in the Back Seat Floods the Cabin First',
      caption: 'Solid CO₂ sublimates into gas 1.53× denser than air—odorless, colorless, and silently rising from the floorboard until oxygen drops below consciousness.',
      svg:
        '<svg viewBox="0 0 720 310" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cross-section of an SUV showing heavy carbon dioxide pooling inside a closed cabin">' +
        '<rect width="720" height="310" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<path d="M56 218 L66 150 L150 142 L222 86 L464 86 L508 148 L516 218 Z" fill="#FFF" stroke="#18181B" stroke-width="2.2"/>' +
        '<path d="M64 216 L68 158 L508 158 L514 216 Z" fill="#B41C1C" fill-opacity="0.16"/>' +
        '<path d="M168 158 L206 122 L494 122 L508 158 Z" fill="#B41C1C" fill-opacity="0.10"/>' +
        '<line x1="176" y1="122" x2="494" y2="122" stroke="#B41C1C" stroke-width="1.5" stroke-dasharray="5 4"/>' +
        '<rect x="404" y="156" width="76" height="54" rx="5" fill="#181B20"/>' +
        '<text x="442" y="180" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#FFF">DRY ICE</text>' +
        '<text x="442" y="195" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#FCA5A5">-78.5°C CO₂</text>' +
        '<path d="M442 152 Q442 130 390 138 T310 146" fill="none" stroke="#B41C1C" stroke-width="2" stroke-dasharray="3 2"/>' +
        '<circle cx="246" cy="134" r="14" fill="#FAF9F6" stroke="#18181B" stroke-width="2"/>' +
        '<line x1="246" y1="148" x2="246" y2="196" stroke="#18181B" stroke-width="2.2"/>' +
        '<text x="246" y="110" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#B41C1C">BREATHING ZONE</text>' +
        '<text x="246" y="176" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#B41C1C">CO₂ POOL (1.53× AIR)</text>' +
        '<circle cx="152" cy="222" r="28" fill="#181B20"/><circle cx="152" cy="222" r="12" fill="#E4E0D8"/>' +
        '<circle cx="430" cy="222" r="28" fill="#181B20"/><circle cx="430" cy="222" r="12" fill="#E4E0D8"/>' +
        '<rect x="536" y="24" width="166" height="260" rx="8" fill="#181B20"/>' +
        '<text x="550" y="48" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">TRANSPORT RULES</text>' +
        '<text x="550" y="76" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#FFF">✓ Separate Trunk</text>' +
        '<text x="550" y="93" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">Never share sealed</text>' +
        '<text x="550" y="107" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">cabin air with dry ice.</text>' +
        '<text x="550" y="138" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#FFF">✓ Windows Cracked</text>' +
        '<text x="550" y="155" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">Fresh-air intake ON,</text>' +
        '<text x="550" y="169" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">recirculate OFF.</text>' +
        '<text x="550" y="200" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#FCA5A5">✕ Never Lean Into</text>' +
        '<text x="550" y="216" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#FCA5A5">a Sealed Cooler Car</text>' +
        '<text x="550" y="234" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">Open ALL doors first</text>' +
        '<text x="550" y="248" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">before rescuing anyone.</text>' +
        '<text x="56" y="286" font-family="IBM Plex Mono,monospace" font-size="10" fill="#78716C">ZERO SMELL · ZERO SMOKE · 1 LB DRY ICE ≈ 250 LITERS OF CO₂ GAS</text>' +
        '</svg>'
    },

    'charger-between-phone-and-wall': {
      badge: 'FORENSIC INFOGRAPHIC · GALVANIC ISOLATION FAILURE',
      title: 'The Penny-Sized Capacitor Between Your Bathtub and 230 Volts',
      caption: 'Your smartphone battery is harmless at 5 volts DC. The danger lives inside counterfeit wall bricks whose missing insulation lets 230V/120V AC mains jump straight into wet metal charging cables.',
      svg:
        '<svg viewBox="0 0 720 295" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Circuit diagram comparing certified charger galvanic isolation versus counterfeit failed-closed capacitor dumping mains voltage into bathwater">' +
        '<rect width="720" height="295" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        /* Top row: Certified */
        '<rect x="20" y="20" width="680" height="114" rx="8" fill="#FFF" stroke="#A7F3D0" stroke-width="1.5"/>' +
        '<text x="36" y="42" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#065F46">✓ CERTIFIED CHARGER · GALVANIC ISOLATION INTACT</text>' +
        '<rect x="36" y="56" width="118" height="58" rx="6" fill="#181B20"/><text x="95" y="83" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#FFF">WALL OUTLET</text><text x="95" y="100" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" fill="#FCA5A5">120V / 230V AC</text>' +
        '<line x1="154" y1="85" x2="226" y2="85" stroke="#18181B" stroke-width="2.2"/>' +
        '<rect x="226" y="56" width="196" height="58" rx="6" fill="#ECFDF5" stroke="#10B981" stroke-width="1.6"/>' +
        '<text x="324" y="80" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#065F46">CERTIFIED AIR GAP</text>' +
        '<text x="324" y="97" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" fill="#065F46">Proper clearance + Y1 safety cap</text>' +
        '<line x1="422" y1="85" x2="496" y2="85" stroke="#10B981" stroke-width="2.2"/>' +
        '<rect x="496" y="56" width="184" height="58" rx="6" fill="#F3F1EC" stroke="#D1CCC2"/><text x="588" y="82" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#18181B">5V USB OUTPUT</text><text x="588" y="99" text-anchor="middle" font-family="Inter,sans-serif" font-size="9.5" fill="#57534E">Still never plug in by a tub!</text>' +
        /* Bottom row: Counterfeit */
        '<rect x="20" y="150" width="680" height="125" rx="8" fill="#FFF" stroke="#F5C6C6" stroke-width="1.8"/>' +
        '<text x="36" y="172" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#B41C1C">✕ COUNTERFEIT BRICK · FAILED-CLOSED CAPACITOR BRIDGE</text>' +
        '<rect x="36" y="186" width="118" height="64" rx="6" fill="#B41C1C"/><text x="95" y="214" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#FFF">LIVE MAINS</text><text x="95" y="232" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" fill="#FDE68A">230V / 50 Hz AC</text>' +
        '<line x1="154" y1="218" x2="226" y2="218" stroke="#B41C1C" stroke-width="3.2"/>' +
        '<rect x="226" y="186" width="196" height="64" rx="6" fill="#FDF2F2" stroke="#B41C1C" stroke-width="2" stroke-dasharray="5 3"/>' +
        '<text x="324" y="210" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#B41C1C">⚡ SHORTED CHEAP CAP</text>' +
        '<text x="324" y="227" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" fill="#7F1D1D">Fails CLOSED instead of open</text>' +
        '<text x="324" y="241" text-anchor="middle" font-family="Inter,sans-serif" font-size="9.5" fill="#7F1D1D">Fake CE stamp on plastic shell</text>' +
        '<line x1="422" y1="218" x2="496" y2="218" stroke="#B41C1C" stroke-width="3.2" stroke-dasharray="6 3"/>' +
        '<rect x="496" y="186" width="184" height="64" rx="6" fill="#181B20" stroke="#B41C1C" stroke-width="2"/>' +
        '<text x="588" y="210" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#FCA5A5">LIVE PHONE IN BATH</text>' +
        '<text x="588" y="227" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" fill="#FFF">Wet skin cuts resistance 100×</text>' +
        '<text x="588" y="242" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="#FCA5A5">RULE: BATTERY ONLY IN BATH</text>' +
        '</svg>'
    },

    'tank-after-the-collapse-h2s': {
      badge: 'FORENSIC INFOGRAPHIC · OLFACTORY PARALYSIS TRAP',
      title: 'The Hydrogen Sulfide Ladder: Why “No Smell” Means Instant Death',
      caption: 'At low concentrations, H₂S reeks of rotten eggs. Above ~100 ppm it paralyzes your olfactory nerve—tricking coworkers into climbing down to rescue someone because “the fumes cleared.”',
      svg:
        '<svg viewBox="0 0 720 295" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Concentration ladder of hydrogen sulfide from rotten egg odor to olfactory paralysis and instant knockdown">' +
        '<rect width="720" height="295" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<rect x="24" y="24" width="672" height="58" rx="7" fill="#ECFDF5" stroke="#A7F3D0"/>' +
        '<text x="40" y="48" font-family="IBM Plex Mono,monospace" font-size="11" font-weight="700" fill="#065F46">0.5 – 30 PPM · LOUD WARNING</text>' +
        '<text x="40" y="68" font-family="Inter,sans-serif" font-size="12" fill="#064E3B">Overpowering rotten-egg stench, eye irritation. Your nose is still working for you.</text>' +

        '<rect x="24" y="94" width="672" height="68" rx="7" fill="#FEF3C7" stroke="#F59E0B"/>' +
        '<text x="40" y="118" font-family="IBM Plex Mono,monospace" font-size="11" font-weight="700" fill="#92400E">100 – 150 PPM · THE SILENT LIE (OLFACTORY PARALYSIS)</text>' +
        '<text x="40" y="138" font-family="Inter,sans-serif" font-size="12" fill="#78350F">Smell vanishes within breaths. Rescuers think the tank ventilated—and climb straight into a lethal gas pocket.</text>' +

        '<rect x="24" y="174" width="672" height="96" rx="7" fill="#181B20" stroke="#B41C1C" stroke-width="2"/>' +
        '<text x="40" y="200" font-family="IBM Plex Mono,monospace" font-size="11.5" font-weight="700" fill="#FCA5A5">500 – 1,000+ PPM · ONE-BREATH KNOCKDOWN (CYTOCHROME C LOCK)</text>' +
        '<text x="40" y="222" font-family="Inter,sans-serif" font-size="12" fill="#FFF">Instant collapse inside a sludge tank, sewer, or manure pit. Over 60% of confined-space fatalities are would-be rescuers.</text>' +
        '<text x="40" y="250" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#4ADE80">FIRST 60 SECONDS: NEVER ENTER WITHOUT SCBA AIR PACK · CALL HAZMAT / 911 IMMEDIATELY.</text>' +
        '</svg>'
    },

    /* ==================== PART II: KITCHEN & TABLE (3) ==================== */
    'wire-behind-the-pain': {
      badge: 'FORENSIC INFOGRAPHIC · HIDDEN FOREIGN BODY',
      title: 'How a 2-cm Grill Bristle Walks Straight Past Standard X-Rays',
      caption: 'Stray stainless wire bristles from worn barbecue brushes are thin enough to hide behind spine shadows on plain X-rays—and stiff enough to spear straight through the small bowel wall.',
      svg:
        '<svg viewBox="0 0 720 290" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="4-step forensic timeline of an ingested wire grill bristle piercing the small intestine">' +
        '<rect width="720" height="290" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<rect x="20" y="26" width="156" height="196" rx="8" fill="#FFF" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<text x="34" y="50" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#B41C1C">01 · THE GRATE</text>' +
        '<line x1="42" y1="92" x2="150" y2="92" stroke="#18181B" stroke-width="4"/>' +
        '<line x1="42" y1="104" x2="150" y2="104" stroke="#18181B" stroke-width="4"/>' +
        '<line x1="76" y1="84" x2="122" y2="90" stroke="#B41C1C" stroke-width="2.4"/>' +
        '<text x="34" y="138" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#18181B">1 Shed Bristle</text>' +
        '<text x="34" y="156" font-family="Inter,sans-serif" font-size="10" fill="#57534E">Clings invisibly to a</text>' +
        '<text x="34" y="170" font-family="Inter,sans-serif" font-size="10" fill="#57534E">burger patty or bun.</text>' +
        '<text x="34" y="192" font-family="IBM Plex Mono,monospace" font-size="9" fill="#78716C">ZERO METALLIC TASTE</text>' +
        '<rect x="194" y="26" width="156" height="196" rx="8" fill="#FFF" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<text x="208" y="50" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#B41C1C">02 · SILENT TRANSIT</text>' +
        '<path d="M236 74 C236 104 308 104 308 122 C308 140 236 140 236 154" fill="none" stroke="#D1CCC2" stroke-width="14" stroke-linecap="round"/>' +
        '<line x1="278" y1="120" x2="314" y2="128" stroke="#B41C1C" stroke-width="2.5"/>' +
        '<text x="208" y="178" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#18181B">Perforates Small Bowel</text>' +
        '<text x="208" y="196" font-family="Inter,sans-serif" font-size="10" fill="#57534E">Omentum walls it off—no</text>' +
        '<text x="208" y="210" font-family="Inter,sans-serif" font-size="10" fill="#57534E">free air, normal stool.</text>' +
        '<rect x="368" y="26" width="156" height="196" rx="8" fill="#FFF" stroke="#F5C6C6" stroke-width="1.5"/>' +
        '<text x="382" y="50" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#B41C1C">03 · PLAIN X-RAY</text>' +
        '<rect x="394" y="68" width="104" height="72" rx="4" fill="#181B20"/>' +
        '<text x="446" y="102" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" fill="#94A3B8">“LOOKS CLEAR”</text>' +
        '<text x="446" y="118" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#FCA5A5">MISSES THIN WIRE</text>' +
        '<text x="382" y="164" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#18181B">Needs Thin-Slice CT</text>' +
        '<text x="382" y="182" font-family="Inter,sans-serif" font-size="10" fill="#57534E">Tell the ER explicitly:</text>' +
        '<text x="382" y="196" font-family="Inter,sans-serif" font-size="10" font-weight="700" fill="#B41C1C">“We grilled recently.”</text>' +
        '<rect x="542" y="26" width="158" height="196" rx="8" fill="#181B20"/>' +
        '<text x="556" y="50" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">04 · ZERO-RISK FIX</text>' +
        '<text x="556" y="88" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#FFF">Trash Wire Brushes</text>' +
        '<text x="556" y="112" font-family="Inter,sans-serif" font-size="10.5" fill="#D6D3D1">Switch to solid wood</text>' +
        '<text x="556" y="128" font-family="Inter,sans-serif" font-size="10.5" fill="#D6D3D1">scrapers, pumice blocks,</text>' +
        '<text x="556" y="144" font-family="Inter,sans-serif" font-size="10.5" fill="#D6D3D1">or coiled-loop bristleless</text>' +
        '<text x="556" y="160" font-family="Inter,sans-serif" font-size="10.5" fill="#D6D3D1">cleaners + wipe grates.</text>' +
        '<text x="556" y="196" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#4ADE80">AVOIDABILITY: 100%</text>' +
        '<text x="24" y="260" font-family="IBM Plex Mono,monospace" font-size="10" fill="#78716C">SOURCE MECHANISM: EP 2283 · WIRE BRISTLES DO NOT REQUIRE A RECALL TO BE DEADLY—THEY ARE DESIGNED TO FATIGUE.</text>' +
        '</svg>'
    },

    'room-not-safe-to-finish': {
      badge: 'FORENSIC INFOGRAPHIC · DOMESTIC CHEMICAL WARFARE',
      title: 'Under-Sink Alchemy: Three Bottles That Never Share a Bucket',
      caption: 'Sodium hypochlorite (bleach) plays well with cold water—and turns into World War I lung-searing chlorine or chloramine gas the instant you chase it with acid toilet cleaner, vinegar, or ammonia.',
      svg:
        '<svg viewBox="0 0 720 290" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Chemical hazard matrix showing bleach mixed with acids, ammonia, or alcohol creating toxic gases">' +
        '<rect width="720" height="290" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<rect x="20" y="24" width="212" height="178" rx="8" fill="#FFF" stroke="#F5C6C6" stroke-width="1.6"/>' +
        '<text x="36" y="48" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#B41C1C">BLEACH + ACID / VINEGAR</text>' +
        '<text x="36" y="84" font-family="Newsreader,Georgia,serif" font-size="22" font-weight="700" fill="#18181B">Chlorine Gas (Cl₂)</text>' +
        '<text x="36" y="108" font-family="Inter,sans-serif" font-size="11" fill="#44403C">Toilet descalers, lime removers,</text>' +
        '<text x="36" y="124" font-family="Inter,sans-serif" font-size="11" fill="#44403C">or plain white vinegar drop pH,</text>' +
        '<text x="36" y="140" font-family="Inter,sans-serif" font-size="11" fill="#44403C">liberating heavy green-yellow</text>' +
        '<text x="36" y="156" font-family="Inter,sans-serif" font-size="11" fill="#B41C1C" font-weight="700">acid-burning Cl₂ into airways.</text>' +

        '<rect x="254" y="24" width="212" height="178" rx="8" fill="#FFF" stroke="#F5C6C6" stroke-width="1.6"/>' +
        '<text x="270" y="48" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#B41C1C">BLEACH + AMMONIA / URINE</text>' +
        '<text x="270" y="84" font-family="Newsreader,Georgia,serif" font-size="22" font-weight="700" fill="#18181B">Chloramines</text>' +
        '<text x="270" y="108" font-family="Inter,sans-serif" font-size="11" fill="#44403C">Glass sprays, floor strippers, or</text>' +
        '<text x="270" y="124" font-family="Inter,sans-serif" font-size="11" fill="#44403C">pet-litter urea react with bleach</text>' +
        '<text x="270" y="140" font-family="Inter,sans-serif" font-size="11" fill="#44403C">to form delayed deep-lung</text>' +
        '<text x="270" y="156" font-family="Inter,sans-serif" font-size="11" fill="#B41C1C" font-weight="700">pulmonary-edema vapors.</text>' +

        '<rect x="488" y="24" width="212" height="178" rx="8" fill="#FFF" stroke="#F5C6C6" stroke-width="1.6"/>' +
        '<text x="504" y="48" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#B41C1C">BLEACH + RUBBING ALCOHOL</text>' +
        '<text x="504" y="84" font-family="Newsreader,Georgia,serif" font-size="22" font-weight="700" fill="#18181B">Chloroform</text>' +
        '<text x="504" y="108" font-family="Inter,sans-serif" font-size="11" fill="#44403C">Haloform chemistry turns DIY</text>' +
        '<text x="504" y="124" font-family="Inter,sans-serif" font-size="11" fill="#44403C">“double-sanitize” wipes into</text>' +
        '<text x="504" y="140" font-family="Inter,sans-serif" font-size="11" fill="#44403C">CNS-depressing chloroform &amp;</text>' +
        '<text x="504" y="156" font-family="Inter,sans-serif" font-size="11" fill="#B41C1C" font-weight="700">liver/kidney toxins.</text>' +

        '<rect x="20" y="218" width="680" height="52" rx="8" fill="#181B20"/>' +
        '<text x="36" y="240" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#FCA5A5">FIRST 60 SECONDS IF YOUR EYES OR THROAT STING:</text>' +
        '<text x="36" y="258" font-family="Inter,sans-serif" font-size="11.5" fill="#FFF">DROP THE SPONGE—NEVER “FINISH THE TUB.” Walk straight outside to fresh air; call Poison Control / 911 for wheezing or chest tightness.</text>' +
        '</svg>'
    },

    'reheated-rice-and-botulism': {
      badge: 'FORENSIC INFOGRAPHIC · THERMAL SURVIVAL LIMITS',
      title: 'Why Boiling the Leftovers Still Cannot Kill These Two Kitchen Toxins',
      caption: 'Standard reheating kills living bacteria—but Bacillus cereus emetic toxin (cereulide) laughs at 121°C, and Clostridium botulinum spores survive boiling water baths to bloom inside low-acid jars.',
      svg:
        '<svg viewBox="0 0 720 285" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Temperature comparison showing living bacteria dying at 74 C while B cereus cereulide toxin survives 121 C">' +
        '<rect width="720" height="285" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<rect x="24" y="24" width="328" height="190" rx="8" fill="#FFF" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<text x="40" y="48" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#B41C1C">TRAP 1 · COUNTERTOP RICE / PASTA</text>' +
        '<text x="40" y="74" font-family="Newsreader,Georgia,serif" font-size="19" font-weight="700" fill="#18181B">Bacillus cereus Cereulide</text>' +
        '<rect x="40" y="90" width="296" height="22" rx="4" fill="#ECFDF5"/><text x="48" y="105" font-family="IBM Plex Mono,monospace" font-size="9.5" fill="#065F46">74°C (165°F) Reheat → Kills bacteria only</text>' +
        '<rect x="40" y="118" width="296" height="22" rx="4" fill="#FDF2F2" stroke="#F5C6C6"/><text x="48" y="133" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#B41C1C">121°C (250°F) × 90 min → TOXIN SURVIVES!</text>' +
        '<text x="40" y="164" font-family="Inter,sans-serif" font-size="11" fill="#44403C">If cooked rice/pasta sat at room temp &gt;2 hrs,</text>' +
        '<text x="40" y="180" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#18181B">microwave nuking CANNOT make it safe.</text>' +
        '<text x="40" y="200" font-family="IBM Plex Mono,monospace" font-size="9.5" fill="#B41C1C">RULE: CHILL IN SHALLOW TRAYS WITHIN 2 HRS.</text>' +

        '<rect x="368" y="24" width="328" height="190" rx="8" fill="#FFF" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<text x="384" y="48" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#B41C1C">TRAP 2 · LOW-ACID HOME CANNING</text>' +
        '<text x="384" y="74" font-family="Newsreader,Georgia,serif" font-size="19" font-weight="700" fill="#18181B">Clostridium botulinum</text>' +
        '<rect x="384" y="90" width="296" height="22" rx="4" fill="#FDF2F2" stroke="#F5C6C6"/><text x="392" y="105" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#B41C1C">100°C Boiling Water Bath → SPORES SURVIVE</text>' +
        '<rect x="384" y="118" width="296" height="22" rx="4" fill="#ECFDF5"/><text x="392" y="133" font-family="IBM Plex Mono,monospace" font-size="9.5" fill="#065F46">116°C (240°F) Pressure Canner → Destroys spores</text>' +
        '<text x="384" y="164" font-family="Inter,sans-serif" font-size="11" fill="#44403C">Zero foul odor, zero bubbles, invisible poison.</text>' +
        '<text x="384" y="180" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#18181B">Droopy eyelids + slurred speech = ER antitoxin.</text>' +
        '<text x="384" y="200" font-family="IBM Plex Mono,monospace" font-size="9.5" fill="#B41C1C">RULE: WHEN IN DOUBT, NEVER “TASTE-TEST.”</text>' +

        '<rect x="24" y="226" width="672" height="40" rx="7" fill="#181B20"/>' +
        '<text x="360" y="251" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#FCA5A5">THE SNIFF TEST HAS A 0% DETECTION RATE AGAINST CEREULIDE AND BOTULINUM NEUROTOXIN.</text>' +
        '</svg>'
    },

    /* ==================== PART III: MEDICINE CABINET (3) ==================== */
    'chocolate-brown-blood': {
      badge: 'FORENSIC INFOGRAPHIC · THE OXIMETER LIE',
      title: 'Why Pulse Oximeters Freeze Near 85% While Your Blood Turns Brown',
      caption: 'Standard 2-wavelength finger probes assume only red oxy-Hb and blue deoxy-Hb exist. Methemoglobin absorbs both wavelengths equally—forcing the math to read ~85% no matter how low oxygen drops.',
      svg:
        '<svg viewBox="0 0 720 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagram comparing normal bright red arterial blood with chocolate-brown methemoglobinemia and the frozen 85% pulse oximeter reading">' +
        '<rect width="720" height="300" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<rect x="26" y="28" width="202" height="176" rx="8" fill="#FFF" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<circle cx="127" cy="94" r="40" fill="#C81E1E"/>' +
        '<text x="127" y="99" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="11" font-weight="700" fill="#FFF">Fe²⁺</text>' +
        '<text x="127" y="156" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#18181B">Normal Arterial Blood</text>' +
        '<text x="127" y="174" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" fill="#78716C">BRIGHT RED · RELEASES O₂</text>' +
        '<rect x="246" y="28" width="202" height="176" rx="8" fill="#FFF" stroke="#F5C6C6" stroke-width="1.8"/>' +
        '<circle cx="347" cy="94" r="40" fill="#4A2511"/>' +
        '<text x="347" y="99" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="11" font-weight="700" fill="#FDE68A">Fe³⁺</text>' +
        '<text x="347" y="156" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#B41C1C">Methemoglobinemia</text>' +
        '<text x="347" y="174" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" fill="#B41C1C">CHOCOLATE BROWN · LOCKED</text>' +
        '<text x="347" y="191" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" fill="#78716C">Stays brown even on 100% O₂</text>' +
        '<rect x="470" y="28" width="224" height="176" rx="10" fill="#181B20" stroke="#323944" stroke-width="2"/>' +
        '<text x="582" y="54" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#A1A8B3">STANDARD FINGER OXIMETER</text>' +
        '<rect x="492" y="66" width="180" height="72" rx="6" fill="#0B0E12" stroke="#323944"/>' +
        '<text x="582" y="114" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="40" font-weight="700" fill="#38BDF8">85%</text>' +
        '<text x="582" y="160" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#FCA5A5">FROZEN PLATEAU LIE</text>' +
        '<text x="582" y="177" text-anchor="middle" font-family="Inter,sans-serif" font-size="9.5" fill="#D6D3D1">Reads ~85% at 30% OR 70% MetHb</text>' +
        '<rect x="26" y="222" width="668" height="56" rx="8" fill="#FDF2F2" stroke="#F5C6C6"/>' +
        '<text x="42" y="245" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#B41C1C">THE DIAGNOSTIC TELL + 15-MINUTE FIX:</text>' +
        '<text x="42" y="264" font-family="Inter,sans-serif" font-size="11.5" fill="#18181B">High arterial PaO₂ + stubborn ~85% SpO₂ + brown blood = Demand CO-OXIMETRY + IV Methylene Blue (1–2 mg/kg).</text>' +
        '</svg>'
    },

    'hot-baths-fentanyl-patches-deadly': {
      badge: 'FORENSIC INFOGRAPHIC · THERMAL DOSE DUMPING',
      title: 'How a 106°F Bath Turns a 72-Hour Fentanyl Patch Into an Overdose',
      caption: 'Heat melts stratum corneum lipids and boosts skin blood flow 300–500%. Worse: even after paramedics peel the sticker off, the saturated skin depot keeps leaking fentanyl for up to 17 hours.',
      svg:
        '<svg viewBox="0 0 720 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Chart comparing normal 98.6 degree skin delivery versus 106 degree hot bath fentanyl patch dose dumping">' +
        '<rect width="720" height="300" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<rect x="24" y="24" width="420" height="252" rx="8" fill="#FFF" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<text x="42" y="48" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#18181B">SERUM FENTANYL FLUX OVER TIME</text>' +
        '<line x1="56" y1="234" x2="424" y2="234" stroke="#18181B" stroke-width="1.5"/>' +
        '<line x1="56" y1="68" x2="56" y2="234" stroke="#18181B" stroke-width="1.5"/>' +
        '<line x1="56" y1="112" x2="424" y2="112" stroke="#B41C1C" stroke-width="1.2" stroke-dasharray="5 4"/>' +
        '<text x="420" y="106" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#B41C1C">RESPIRATORY ARREST ZONE</text>' +
        '<path d="M56 212 Q180 198 416 198" fill="none" stroke="#10B981" stroke-width="2.6"/>' +
        '<text x="414" y="191" text-anchor="end" font-family="Inter,sans-serif" font-size="10" font-weight="700" fill="#065F46">98.6°F Normal Skin (Steady)</text>' +
        '<path d="M56 210 L118 202 Q156 196 184 82 Q204 72 224 98 Q276 138 416 154" fill="none" stroke="#B41C1C" stroke-width="3"/>' +
        '<circle cx="192" cy="80" r="5" fill="#B41C1C"/>' +
        '<text x="204" y="84" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#B41C1C">41°C BATH SPIKE (9.4 ng/mL)</text>' +
        '<line x1="238" y1="68" x2="238" y2="234" stroke="#78716C" stroke-width="1.2" stroke-dasharray="3 3"/>' +
        '<text x="244" y="168" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#44403C">PATCH PEELED OFF →</text>' +
        '<text x="244" y="180" font-family="Inter,sans-serif" font-size="9.5" font-weight="700" fill="#B41C1C">Skin depot STILL leaks</text>' +
        '<text x="244" y="192" font-family="Inter,sans-serif" font-size="9.5" fill="#44403C">for up to 17 hrs!</text>' +
        '<text x="240" y="256" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" fill="#78716C">HOURS AFTER HEAT EXPOSURE</text>' +
        '<rect x="462" y="24" width="234" height="252" rx="8" fill="#181B20"/>' +
        '<text x="478" y="50" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#FCA5A5">4 HEAT SOURCES THAT DUMP</text>' +
        '<text x="478" y="78" font-family="Inter,sans-serif" font-size="11.5" fill="#FFF">• Hot baths, jacuzzis &amp; saunas</text>' +
        '<text x="478" y="100" font-family="Inter,sans-serif" font-size="11.5" fill="#FFF">• Heating pads &amp; electric blankets</text>' +
        '<text x="478" y="122" font-family="Inter,sans-serif" font-size="11.5" fill="#FFF">• Direct sun / tanning beds</text>' +
        '<text x="478" y="144" font-family="Inter,sans-serif" font-size="11.5" fill="#FFF">• High fever (&gt;102°F / 39°C)</text>' +
        '<rect x="478" y="166" width="202" height="92" rx="6" fill="#22272F" stroke="#B41C1C"/>' +
        '<text x="490" y="186" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#FCA5A5">THE NARCAN TRAP</text>' +
        '<text x="490" y="204" font-family="Inter,sans-serif" font-size="10" fill="#E7E5E4">Naloxone wears off in 30–90</text>' +
        '<text x="490" y="218" font-family="Inter,sans-serif" font-size="10" fill="#E7E5E4">min; the skin depot keeps</text>' +
        '<text x="490" y="232" font-family="Inter,sans-serif" font-size="10" fill="#E7E5E4">pumping. Never refuse the ER</text>' +
        '<text x="490" y="246" font-family="Inter,sans-serif" font-size="10" fill="#E7E5E4">after waking up from Narcan.</text>' +
        '</svg>'
    },

    'battery-already-in-the-stomach': {
      badge: 'FORENSIC INFOGRAPHIC · ELECTROLYTIC TISSUE MELTING',
      title: 'The 2-Hour Lithium Coin Battery Clock (and the Stomach X-Ray Trap)',
      caption: 'A 3V CR2032 coin cell does not need to leak acid—wet saliva completes an external circuit that generates caustic hydroxide ions on the negative pole, liquefying esophageal tissue in as little as 2 hours.',
      svg:
        '<svg viewBox="0 0 720 290" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Timeline of lithium button battery esophageal necrosis and delayed aortic erosion">' +
        '<rect width="720" height="290" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<rect x="20" y="24" width="214" height="186" rx="8" fill="#FFF" stroke="#F5C6C6" stroke-width="1.5"/>' +
        '<circle cx="127" cy="90" r="34" fill="#E2E8F0" stroke="#475569" stroke-width="3"/>' +
        '<circle cx="127" cy="90" r="24" fill="none" stroke="#B41C1C" stroke-width="2" stroke-dasharray="4 3"/>' +
        '<text x="127" y="88" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#18181B">3V CR2032</text>' +
        '<text x="127" y="102" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#B41C1C">OH⁻ BURN POLE</text>' +
        '<text x="36" y="148" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#B41C1C">0–2 HRS · ESOPHAGUS</text>' +
        '<text x="36" y="166" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">Saliva conducts 3V → caustic</text>' +
        '<text x="36" y="182" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">pH 12–13 necrosis starts fast.</text>' +

        '<rect x="253" y="24" width="214" height="186" rx="8" fill="#FFF" stroke="#F5C6C6" stroke-width="1.5"/>' +
        '<text x="269" y="48" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#B41C1C">THE STOMACH X-RAY LIE</text>' +
        '<text x="269" y="76" font-family="Newsreader,Georgia,serif" font-size="18" font-weight="700" fill="#18181B">“It Passed Into the Stomach!”</text>' +
        '<text x="269" y="102" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">If a coin cell paused even</text>' +
        '<text x="269" y="118" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">briefly in the esophagus first,</text>' +
        '<text x="269" y="134" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">alkaline necrosis keeps chewing</text>' +
        '<text x="269" y="150" font-family="Inter,sans-serif" font-size="10.5" font-weight="700" fill="#B41C1C">toward the aorta for days/weeks</text>' +
        '<text x="269" y="166" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">AFTER the battery drops down.</text>' +

        '<rect x="486" y="24" width="214" height="186" rx="8" fill="#181B20"/>' +
        '<text x="502" y="48" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">FIRST 60 SECONDS</text>' +
        '<text x="502" y="76" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#FFF">1. ER X-Ray Immediately</text>' +
        '<text x="502" y="94" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">Do NOT wait for symptoms.</text>' +
        '<text x="502" y="118" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#FDE68A">2. Honey En Route (Age &gt;1 yr)</text>' +
        '<text x="502" y="136" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">2 tsp every 10 min (&lt;12 hrs)</text>' +
        '<text x="502" y="150" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">coats mucosa without delaying ER.</text>' +
        '<text x="502" y="176" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#FCA5A5">3. NEVER Induce Vomiting</text>' +
        '<text x="502" y="194" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">Watch for sentinel blood/tar stool.</text>' +

        '<rect x="20" y="224" width="680" height="44" rx="7" fill="#FDF2F2" stroke="#F5C6C6"/>' +
        '<text x="360" y="251" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#B41C1C">EVEN “DEAD” REMOTE BATTERIES HOLD ENOUGH RESIDUAL VOLTAGE TO BURN THROUGH ESOPHAGEAL WALLS.</text>' +
        '</svg>'
    },

    /* ==================== PART IV: GYM, TRAIL & VACATION (3) ==================== */
    'spin-class-rhabdo': {
      badge: 'FORENSIC INFOGRAPHIC · EXERTIONAL RHABDOMYOLYSIS',
      title: 'When “No Pain, No Gain” Turns Your Urine the Color of Iced Tea',
      caption: 'Extreme unaccustomed eccentric exercise ruptures skeletal muscle cells, dumping creatine kinase (CK) and myoglobin into the bloodstream—where myoglobin plugs kidney tubules like wet cement.',
      svg:
        '<svg viewBox="0 0 720 285" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Visual comparison of normal DOMS soreness versus exertional rhabdomyolysis dark tea urine kidney emergency">' +
        '<rect width="720" height="285" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<rect x="22" y="24" width="214" height="190" rx="8" fill="#FFF" stroke="#A7F3D0" stroke-width="1.5"/>' +
        '<circle cx="129" cy="82" r="28" fill="#FEF08A" stroke="#CA8A04" stroke-width="2"/>' +
        '<text x="129" y="132" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#065F46">NORMAL DOMS</text>' +
        '<text x="38" y="156" font-family="Inter,sans-serif" font-size="11" fill="#44403C">• Stiff muscles 24–48 hrs later</text>' +
        '<text x="38" y="174" font-family="Inter,sans-serif" font-size="11" fill="#44403C">• Pale-yellow urine</text>' +
        '<text x="38" y="192" font-family="Inter,sans-serif" font-size="11" fill="#44403C">• Full strength returns</text>' +

        '<rect x="253" y="24" width="214" height="190" rx="8" fill="#FFF" stroke="#F5C6C6" stroke-width="1.8"/>' +
        '<circle cx="360" cy="82" r="28" fill="#5C2D0C" stroke="#B41C1C" stroke-width="2.5"/>' +
        '<text x="360" y="132" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#B41C1C">RHABDOMYOLYSIS</text>' +
        '<text x="269" y="156" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#B41C1C">• Cola / iced-tea dark urine</text>' +
        '<text x="269" y="174" font-family="Inter,sans-serif" font-size="11" fill="#18181B">• Tight, board-hard swelling</text>' +
        '<text x="269" y="192" font-family="Inter,sans-serif" font-size="11" fill="#18181B">• CK surges to 50,000–200,000+</text>' +

        '<rect x="484" y="24" width="214" height="190" rx="8" fill="#181B20"/>' +
        '<text x="500" y="50" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">ER COUNTER-MOVE</text>' +
        '<text x="500" y="78" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#FFF">✓ ER for CK + IV Fluids</text>' +
        '<text x="500" y="96" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">Oral Gatorade cannot flush</text>' +
        '<text x="500" y="110" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">myoglobin casts fast enough.</text>' +
        '<text x="500" y="140" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#FCA5A5">✕ Skip NSAIDs (Ibuprofen)</text>' +
        '<text x="500" y="158" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">NSAIDs choke renal blood flow</text>' +
        '<text x="500" y="172" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">right when kidneys are under</text>' +
        '<text x="500" y="186" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">myoglobin siege.</text>' +

        '<text x="360" y="254" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" fill="#78716C">FIRST-TIME SPIN / CROSSFIT / RETURN AFTER BREAK = HIGHEST RISK WINDOW. RAMP UP GRADUALLY.</text>' +
        '</svg>'
    },

    'van-that-was-not-empty': {
      badge: 'FORENSIC INFOGRAPHIC · VEHICULAR GREENHOUSE PHYSICS',
      title: 'The +40°F Greenhouse Curve Inside a Parked Car',
      caption: 'Sunlight passes through glass as short-wave radiation, heats seats and dashboards, and traps long-wave infrared inside. 80% of the temperature surge hits in the first 30 minutes—even with cracked windows.',
      svg:
        '<svg viewBox="0 0 720 290" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Temperature curve showing cabin temperature rising 40 degrees Fahrenheit inside a parked car within 60 minutes">' +
        '<rect width="720" height="290" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<rect x="22" y="22" width="424" height="246" rx="8" fill="#FFF" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<text x="40" y="46" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#18181B">CABIN TEMPERATURE RISE (STARTING AT MILD 75°F)</text>' +
        '<line x1="58" y1="226" x2="424" y2="226" stroke="#18181B" stroke-width="1.5"/>' +
        '<line x1="58" y1="66" x2="58" y2="226" stroke="#18181B" stroke-width="1.5"/>' +
        '<line x1="58" y1="120" x2="424" y2="120" stroke="#B41C1C" stroke-width="1.2" stroke-dasharray="5 4"/>' +
        '<text x="420" y="114" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#B41C1C">LETHAL PEDIATRIC HEATSTROKE ZONE (&gt;104°F CORE)</text>' +
        '<path d="M58 214 Q145 142 242 104 T416 74" fill="none" stroke="#B41C1C" stroke-width="3.2"/>' +
        '<circle cx="118" cy="170" r="4.5" fill="#B41C1C"/><text x="128" y="176" font-family="IBM Plex Mono,monospace" font-size="9" fill="#18181B">10 min: +19°F (94°F)</text>' +
        '<circle cx="242" cy="104" r="4.5" fill="#B41C1C"/><text x="252" y="99" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#B41C1C">30 min: +34°F (109°F)</text>' +
        '<circle cx="410" cy="75" r="4.5" fill="#B41C1C"/><text x="406" y="68" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#B41C1C">60 min: +43°F (118°F)</text>' +
        '<text x="240" y="250" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" fill="#78716C">MINUTES PARKED (CRACKING WINDOWS BARELY HELPS)</text>' +

        '<rect x="464" y="22" width="234" height="246" rx="8" fill="#181B20"/>' +
        '<text x="480" y="48" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#FCA5A5">SYSTEMS BEAT MEMORY</text>' +
        '<text x="480" y="76" font-family="Inter,sans-serif" font-size="11" fill="#FFF" font-weight="700">1. Physical Back-Seat Anchor</text>' +
        '<text x="480" y="93" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">Put phone, purse, or left shoe</text>' +
        '<text x="480" y="107" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">in the back seat EVERY trip.</text>' +
        '<text x="480" y="136" font-family="Inter,sans-serif" font-size="11" fill="#FFF" font-weight="700">2. Name-to-Face Roll Call</text>' +
        '<text x="480" y="153" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">Daycare/van drivers walk to</text>' +
        '<text x="480" y="167" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">the very back row physically.</text>' +
        '<text x="480" y="196" font-family="Inter,sans-serif" font-size="11" fill="#FCA5A5" font-weight="700">3. See a Trapped Child/Pet?</text>' +
        '<text x="480" y="213" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">Call 911 immediately; get them</text>' +
        '<text x="480" y="227" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">out and start active cooling</text>' +
        '<text x="480" y="241" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">right away if unresponsive.</text>' +
        '</svg>'
    },

    'boots-in-the-snow-and-heatstroke': {
      badge: 'FORENSIC INFOGRAPHIC · THERMAL EXTREMES',
      title: 'Two Opposite Emergencies Where Intuition Picks the Wrong Move',
      caption: 'Severe hypothermia demands gentle horizontal handling (rough jostling triggers ventricular fibrillation), while exertional heatstroke demands immediate cold-water immersion BEFORE ambulance transport.',
      svg:
        '<svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Side-by-side protocol comparing gentle horizontal handling in severe hypothermia versus cold-water immersion first in exertional heatstroke">' +
        '<rect width="720" height="280" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<rect x="20" y="22" width="330" height="236" rx="8" fill="#FFF" stroke="#93C5FD" stroke-width="1.6"/>' +
        '<rect x="20" y="22" width="330" height="32" rx="8" fill="#1E3A8A"/>' +
        '<text x="36" y="43" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#FFF">❄ SEVERE HYPOTHERMIA (&lt;32°C)</text>' +
        '<text x="36" y="78" font-family="Inter,sans-serif" font-size="11.5" font-weight="700" fill="#18181B">• Handle Gently &amp; Keep Horizontal</text>' +
        '<text x="36" y="96" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">Cold hearts are electrically irritable—jerking</text>' +
        '<text x="36" y="111" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">or rubbing limbs can trigger rescue collapse.</text>' +
        '<text x="36" y="138" font-family="Inter,sans-serif" font-size="11.5" font-weight="700" fill="#18181B">• Insulate &amp; Warm the Core Slowly</text>' +
        '<text x="36" y="156" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">Cut wet clothes off; warm packs to armpits,</text>' +
        '<text x="36" y="171" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">chest &amp; groin—never hot baths for severe cases.</text>' +
        '<text x="36" y="206" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#1E40AF">“NOT DEAD UNTIL WARM AND DEAD.”</text>' +
        '<text x="36" y="224" font-family="Inter,sans-serif" font-size="10" fill="#44403C">Check pulse for a full 60 seconds; sustain CPR.</text>' +

        '<rect x="370" y="22" width="330" height="236" rx="8" fill="#FFF" stroke="#F5C6C6" stroke-width="1.6"/>' +
        '<rect x="370" y="22" width="330" height="32" rx="8" fill="#B41C1C"/>' +
        '<text x="386" y="43" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#FFF">☀ EXERTIONAL HEATSTROKE (&gt;40°C)</text>' +
        '<text x="386" y="78" font-family="Inter,sans-serif" font-size="11.5" font-weight="700" fill="#18181B">• Confusion / Collapse = Heatstroke</text>' +
        '<text x="386" y="96" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">Athletes often STILL SWEAT profusely—dry</text>' +
        '<text x="386" y="111" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">skin is NOT required for lethal brain cooking.</text>' +
        '<text x="386" y="138" font-family="Inter,sans-serif" font-size="11.5" font-weight="700" fill="#B41C1C">• COOL FIRST, TRANSPORT SECOND</text>' +
        '<text x="386" y="156" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">Ice-water immersion tub or tarp-taco dousing</text>' +
        '<text x="386" y="171" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">immediately drops core temp in minutes.</text>' +
        '<text x="386" y="206" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#B41C1C">EVERY MINUTE &gt;40.5°C COOKS ORGANS.</text>' +
        '<text x="386" y="224" font-family="Inter,sans-serif" font-size="10" fill="#44403C">Do not wait for an ER bed to start cold water.</text>' +
        '</svg>'
    },

    /* ==================== PART V: ER FAKEOUTS (3) ==================== */
    'one-finger-varicose-vein': {
      badge: 'FORENSIC INFOGRAPHIC · HYDROSTATIC HEMOSTASIS',
      title: 'The One-Finger, Leg-High Save for a Ruptured Varicose Vein',
      caption: 'Standing or sitting upright keeps a tall column of venous blood pushing straight out a tiny 2-mm ankle pinhole. Lying flat and hoisting the leg above the heart collapses that pressure instantaneously.',
      svg:
        '<svg viewBox="0 0 720 285" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Comparison showing why sitting upright with a loose towel fails for varicose vein bleeding versus lying flat with leg elevated and single-finger pinpoint pressure">' +
        '<rect width="720" height="285" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<rect x="20" y="22" width="330" height="240" rx="8" fill="#FFF" stroke="#F5C6C6" stroke-width="1.6"/>' +
        '<rect x="20" y="22" width="330" height="30" rx="8" fill="#FDF2F2"/>' +
        '<text x="36" y="42" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#B41C1C">✕ WHAT KEEPS IT SPRAYING</text>' +
        '<text x="36" y="78" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#18181B">Sitting Upright + Bulky Loose Towel</text>' +
        '<text x="36" y="100" font-family="Inter,sans-serif" font-size="11" fill="#44403C">• Standing/sitting keeps high venous column</text>' +
        '<text x="36" y="118" font-family="Inter,sans-serif" font-size="11" fill="#44403C">  pressure driving blood out the ankle breach.</text>' +
        '<text x="36" y="142" font-family="Inter,sans-serif" font-size="11" fill="#44403C">• Thick bath towels spread pressure too wide</text>' +
        '<text x="36" y="160" font-family="Inter,sans-serif" font-size="11" fill="#44403C">  and soak up 1–2 liters silently.</text>' +
        '<text x="36" y="186" font-family="Inter,sans-serif" font-size="11" fill="#B41C1C" font-weight="700">• Tight calf tourniquet above the leak can</text>' +
        '<text x="36" y="204" font-family="Inter,sans-serif" font-size="11" fill="#B41C1C" font-weight="700">  block venous return and WORSEN bleeding!</text>' +

        '<rect x="370" y="22" width="330" height="240" rx="8" fill="#181B20"/>' +
        '<text x="386" y="48" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#4ADE80">✓ THE 10-SECOND GRAVITY FIX</text>' +
        '<text x="386" y="82" font-family="Newsreader,Georgia,serif" font-size="19" font-weight="700" fill="#FFF">1. Lie Flat on Your Back</text>' +
        '<text x="386" y="102" font-family="Inter,sans-serif" font-size="11" fill="#D6D3D1">Eliminates gravity immediately.</text>' +
        '<text x="386" y="134" font-family="Newsreader,Georgia,serif" font-size="19" font-weight="700" fill="#FFF">2. Prop Leg HIGH Above Heart</text>' +
        '<text x="386" y="154" font-family="Inter,sans-serif" font-size="11" fill="#D6D3D1">On chair, wall, or stacked pillows.</text>' +
        '<text x="386" y="186" font-family="Newsreader,Georgia,serif" font-size="19" font-weight="700" fill="#FCA5A5">3. ONE Firm Finger on the Hole</text>' +
        '<text x="386" y="206" font-family="Inter,sans-serif" font-size="11" fill="#D6D3D1">Pinpoint direct pressure for 10+ continuous</text>' +
        '<text x="386" y="222" font-family="Inter,sans-serif" font-size="11" fill="#D6D3D1">minutes without peeking + call 911.</text>' +
        '</svg>'
    },

    'potassium-that-rose-in-the-tube': {
      badge: 'FORENSIC INFOGRAPHIC · PRE-ANALYTICAL LAB ARTIFACT',
      title: 'How a Hospital Pneumatic Tube Fakes Lethal Hyperkalemia',
      caption: 'Fragile white blood cells in chronic lymphocytic leukemia shear apart during high-G pneumatic tube transport, spilling intracellular potassium into the test tube—while the patient’s real blood is normal.',
      svg:
        '<svg viewBox="0 0 720 275" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagram comparing pneumatic tube WBC shear creating fake high potassium versus hand-walked blood gas syringe showing normal potassium">' +
        '<rect width="720" height="275" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<rect x="20" y="22" width="680" height="104" rx="8" fill="#FFF" stroke="#F5C6C6" stroke-width="1.6"/>' +
        '<text x="36" y="45" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#B41C1C">✕ PNEUMATIC TUBE + HEPARIN PLASMA (HIGH-G SHEAR TRAP)</text>' +
        '<text x="36" y="72" font-family="Inter,sans-serif" font-size="12" fill="#18181B"><tspan font-weight="700">Fragile Leukemia WBCs</tspan>  →  Vacuum tube impacts rupture cells  →  K⁺ floods plasma  →  <tspan font-weight="700" fill="#B41C1C">Lab prints K⁺ 8.0+ mmol/L!</tspan></text>' +
        '<text x="36" y="98" font-family="Inter,sans-serif" font-size="11" fill="#7F1D1D">Danger: Treating fake hyperkalemia with IV insulin + diuretics crashes the patient’s REAL potassium into fatal arrhythmia.</text>' +

        '<rect x="20" y="142" width="680" height="110" rx="8" fill="#181B20"/>' +
        '<text x="36" y="166" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#4ADE80">✓ THE 2-STEP REALITY CHECK (REVERSE PSEUDOHYPERKALEMIA)</text>' +
        '<text x="36" y="194" font-family="Inter,sans-serif" font-size="12" fill="#FFF">1. <tspan font-weight="700" fill="#FCA5A5">Check the ECG first:</tspan> Completely normal ECG with K⁺ 7.5–9.0 in a patient with sky-high WBCs is a giant red flag.</text>' +
        '<text x="36" y="222" font-family="Inter,sans-serif" font-size="12" fill="#FFF">2. <tspan font-weight="700" fill="#4ADE80">Hand-walk a whole-blood gas syringe</tspan> gently to the analyzer (skip the pneumatic chute) before giving potassium-lowering drugs.</text>' +
        '</svg>'
    },

    'anesthetic-that-triggered-the-furnace': {
      badge: 'FORENSIC INFOGRAPHIC · RYR1 CALCIUM FURNACE',
      title: 'Malignant Hyperthermia: Why Rising CO₂ Beats Fever as Alarm #1',
      caption: 'In susceptible RyR1 variants, volatile anesthetics or succinylcholine jam muscle calcium gates wide open—turning skeletal muscle into a runaway metabolic furnace that only IV dantrolene can shut down.',
      svg:
        '<svg viewBox="0 0 720 275" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mechanism flowchart of RyR1 malignant hyperthermia showing early end-tidal CO2 spike and IV dantrolene rescue">' +
        '<rect width="720" height="275" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<rect x="20" y="24" width="154" height="176" rx="8" fill="#FFF" stroke="#E4E0D8"/><text x="34" y="48" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#B41C1C">01 · TRIGGER</text><text x="34" y="76" font-family="Inter,sans-serif" font-size="11.5" font-weight="700" fill="#18181B">Volatile Gas /</text><text x="34" y="92" font-family="Inter,sans-serif" font-size="11.5" font-weight="700" fill="#18181B">Succinylcholine</text><text x="34" y="122" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">Hits mutant RyR1</text><text x="34" y="138" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">channel on muscle</text><text x="34" y="154" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">calcium stores.</text>' +

        '<rect x="192" y="24" width="154" height="176" rx="8" fill="#FFF" stroke="#F5C6C6"/><text x="206" y="48" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#B41C1C">02 · ALARM #1</text><text x="206" y="76" font-family="Inter,sans-serif" font-size="11.5" font-weight="700" fill="#B41C1C">End-Tidal CO₂</text><text x="206" y="92" font-family="Inter,sans-serif" font-size="11.5" font-weight="700" fill="#B41C1C">Skyrockets First</text><text x="206" y="122" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">High fever is a LATE</text><text x="206" y="138" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">sign—jaw rigidity &amp;</text><text x="206" y="154" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">tachycardia hit first.</text>' +

        '<rect x="364" y="24" width="154" height="176" rx="8" fill="#181B20"/><text x="378" y="48" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#4ADE80">03 · THE KEY</text><text x="378" y="76" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#FFF">IV Dantrolene</text><text x="378" y="94" font-family="IBM Plex Mono,monospace" font-size="9.5" fill="#FCA5A5">2.5 mg/kg STAT</text><text x="378" y="122" font-family="Inter,sans-serif" font-size="10.5" fill="#D6D3D1">Binds RyR1 directly</text><text x="378" y="138" font-family="Inter,sans-serif" font-size="10.5" fill="#D6D3D1">and slams the</text><text x="378" y="154" font-family="Inter,sans-serif" font-size="10.5" fill="#D6D3D1">calcium gate shut.</text>' +

        '<rect x="536" y="24" width="164" height="176" rx="8" fill="#ECFDF5" stroke="#A7F3D0"/><text x="550" y="48" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#065F46">04 · FAMILY RULE</text><text x="550" y="76" font-family="Inter,sans-serif" font-size="11.5" font-weight="700" fill="#064E3B">Tell Every</text><text x="550" y="92" font-family="Inter,sans-serif" font-size="11.5" font-weight="700" fill="#064E3B">Anesthesiologist</text><text x="550" y="122" font-family="Inter,sans-serif" font-size="10.5" fill="#065F46">Autosomal dominant:</text><text x="550" y="138" font-family="Inter,sans-serif" font-size="10.5" fill="#065F46">one relative’s MH</text><text x="550" y="154" font-family="Inter,sans-serif" font-size="10.5" fill="#065F46">puts the whole tree</text><text x="550" y="170" font-family="Inter,sans-serif" font-size="10.5" fill="#065F46">on trigger-free care.</text>' +

        '<text x="360" y="240" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" fill="#78716C">DANTROLENE CUT MALIGNANT HYPERTHERMIA MORTALITY FROM ~80% DOWN TO &lt;5%.</text>' +
        '</svg>'
    },

    /* ==================== PART VI: PETS / ONE MEDICINE (3) ==================== */
    'hair-treatment-reached-the-cat': {
      badge: 'FORENSIC INFOGRAPHIC · ONE MEDICINE TRANSFER CHAIN',
      title: 'How One Drop of Human Minoxidil Reaches a Cat Without Spilling the Bottle',
      caption: 'Cats lack the hepatic glucuronidation machinery to clear topical minoxidil. Trace residue transferred from your scalp to a pillowcase—or from unwashed fingers to a cat’s coat—can cause fatal heart and lung fluid overload.',
      svg:
        '<svg viewBox="0 0 720 270" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="4-step contamination pathway showing topical minoxidil moving from human scalp to pillowcase to cat fur and causing emergency feline toxicity">' +
        '<rect width="720" height="270" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<rect x="20" y="24" width="154" height="162" rx="8" fill="#FFF" stroke="#E4E0D8"/><text x="34" y="48" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#B41C1C">01 · APPLICATION</text><text x="34" y="78" font-family="Inter,sans-serif" font-size="11.5" font-weight="700" fill="#18181B">5% Foam / Dropper</text><text x="34" y="102" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">Applied to scalp or</text><text x="34" y="118" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">beard before bed.</text>' +
        '<rect x="194" y="24" width="154" height="162" rx="8" fill="#FFF" stroke="#F5C6C6"/><text x="208" y="48" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#B41C1C">02 · TRANSFER</text><text x="208" y="78" font-family="Inter,sans-serif" font-size="11.5" font-weight="700" fill="#18181B">Pillow / Sink / Hand</text><text x="208" y="102" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">Cat sleeps on pillow</text><text x="208" y="118" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">or licks damp sink</text><text x="208" y="134" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">residue off paws.</text>' +
        '<rect x="368" y="24" width="154" height="162" rx="8" fill="#FDF2F2" stroke="#B41C1C"/><text x="382" y="48" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#B41C1C">03 · NO BRAKE</text><text x="382" y="78" font-family="Inter,sans-serif" font-size="11.5" font-weight="700" fill="#B41C1C">Feline Cardiotoxicity</text><text x="382" y="102" font-family="Inter,sans-serif" font-size="10.5" fill="#7F1D1D">Severe hypotension +</text><text x="382" y="118" font-family="Inter,sans-serif" font-size="10.5" fill="#7F1D1D">pulmonary edema can</text><text x="382" y="134" font-family="Inter,sans-serif" font-size="10.5" fill="#7F1D1D">strike within hours.</text>' +
        '<rect x="542" y="24" width="158" height="162" rx="8" fill="#181B20"/><text x="556" y="48" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#4ADE80">04 · ZERO-RISK FIX</text><text x="556" y="78" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#FFF">• Scrub hands well</text><text x="556" y="100" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#FFF">• Bonnet / no cats</text><text x="556" y="116" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">  on treated pillows</text><text x="556" y="140" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#FCA5A5">• Contact? Wash fur</text><text x="556" y="156" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">  + Vet ER NOW.</text>' +
        '<rect x="20" y="204" width="680" height="44" rx="7" fill="#181B20"/>' +
        '<text x="360" y="231" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#FCA5A5">NEVER WAIT FOR OPEN-MOUTH BREATHING IN A CAT—ANY SUSPECTED MINOXIDIL EXPOSURE IS A VET ER CALL.</text>' +
        '</svg>'
    },

    'super-rat-bait-and-vitamin-k-trap': {
      badge: 'FORENSIC INFOGRAPHIC · COAGULATION DELAY TRAP',
      title: 'Why Dogs Look Fine on Day 1 After Rat Bait—and Why OTC Vitamin K₃ Fails',
      caption: 'Second-generation anticoagulant rodenticides lock VKORC1 shut for weeks. Existing clotting factors keep the dog looking completely normal for 2–5 days—until silent hemorrhage floods the chest.',
      svg:
        '<svg viewBox="0 0 720 275" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Timeline showing silent clotting factor depletion from Day 1 to Day 4 after rat bait and why prescription Vitamin K1 works while K3 fails">' +
        '<rect width="720" height="275" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<rect x="20" y="24" width="212" height="168" rx="8" fill="#FFF" stroke="#E4E0D8"/><text x="36" y="48" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#78716C">DAY 0–2 · THE FAKE CALM</text><text x="36" y="76" font-family="Newsreader,Georgia,serif" font-size="18" font-weight="700" fill="#18181B">Dog Acts 100% Normal</text><text x="36" y="102" font-family="Inter,sans-serif" font-size="11" fill="#44403C">Pre-made clotting factors still</text><text x="36" y="118" font-family="Inter,sans-serif" font-size="11" fill="#44403C">circulate, masking a completely</text><text x="36" y="134" font-family="Inter,sans-serif" font-size="11" fill="#44403C">shut-down liver VKORC1 engine.</text><text x="36" y="164" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#065F46">BEST DECONTAMINATION WINDOW</text>' +

        '<rect x="254" y="24" width="212" height="168" rx="8" fill="#FDF2F2" stroke="#B41C1C"/><text x="270" y="48" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#B41C1C">DAY 3–5 · CHEST BLEED</text><text x="270" y="76" font-family="Newsreader,Georgia,serif" font-size="18" font-weight="700" fill="#B41C1C">Factors Hit Zero</text><text x="270" y="102" font-family="Inter,sans-serif" font-size="11" fill="#7F1D1D">Coughing, pale gums, labored</text><text x="270" y="118" font-family="Inter,sans-serif" font-size="11" fill="#7F1D1D">breathing from silent blood</text><text x="270" y="134" font-family="Inter,sans-serif" font-size="11" fill="#7F1D1D">pooling inside the chest cavity.</text><text x="270" y="164" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#B41C1C">NEEDS PLASMA + VET ER NOW</text>' +

        '<rect x="488" y="24" width="212" height="168" rx="8" fill="#181B20"/><text x="504" y="48" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#4ADE80">ANTIDOTE RULE</text><text x="504" y="78" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#4ADE80">✓ Rx Vitamin K₁ (30 Days)</text><text x="504" y="96" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">Phytonadione restores clotting.</text><text x="504" y="126" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#FCA5A5">✕ NEVER OTC Vitamin K₃</text><text x="504" y="144" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">Menadione fails in anticoagulant</text><text x="504" y="158" font-family="Inter,sans-serif" font-size="10" fill="#D6D3D1">bait toxicity + can harm RBCs.</text>' +

        '<text x="360" y="236" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" fill="#78716C">ALWAYS BRING THE EXACT BAIT BOX TO THE VET—BROMETHALIN &amp; VITAMIN D₃ BAITS NEED COMPLETELY DIFFERENT TREATMENT.</text>' +
        '</svg>'
    },

    'puppy-with-the-twisted-stomach-gdv': {
      badge: 'FORENSIC INFOGRAPHIC · CANINE VOLVULUS (GDV)',
      title: 'The 180° Stomach Twist: Why Dry Retching Means Drive to Vet ER Now',
      caption: 'Gastric dilatation-volvulus doesn’t just strike giant senior dogs—even a two-month-old puppy can twist. Once the stomach rotates, gas traps inside and pinches off blood return to the heart.',
      svg:
        '<svg viewBox="0 0 720 270" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Comparison of normal canine stomach versus twisted GDV volvulus obstructing venous return">' +
        '<rect width="720" height="270" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<rect x="20" y="24" width="330" height="222" rx="8" fill="#FFF" stroke="#F5C6C6" stroke-width="1.6"/>' +
        '<text x="36" y="48" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#B41C1C">THE 4 CLASSIC GDV ALARMS (ANY AGE)</text>' +
        '<text x="36" y="82" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#18181B">1. Unproductive Dry Retching</text>' +
        '<text x="36" y="100" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">Heaving repeatedly with only white foam—exit is twisted shut.</text>' +
        '<text x="36" y="128" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#18181B">2. Tight, Drum-Like Swollen Belly</text>' +
        '<text x="36" y="146" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">Rapidly expanding gas traps behind a 180–360° twist.</text>' +
        '<text x="36" y="174" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#18181B">3. Restless Pacing, Drooling &amp; Pale Gums</text>' +
        '<text x="36" y="192" font-family="Inter,sans-serif" font-size="10.5" fill="#44403C">Ballooning stomach crushes the vena cava → obstructive shock.</text>' +
        '<text x="36" y="222" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#B41C1C">4. NEVER “WAIT UNTIL MORNING” — HOURS = FATAL</text>' +

        '<rect x="370" y="24" width="330" height="222" rx="8" fill="#181B20"/>' +
        '<text x="386" y="48" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#4ADE80">FIRST 60 SECONDS PROTOCOL</text>' +
        '<text x="386" y="84" font-family="Newsreader,Georgia,serif" font-size="19" font-weight="700" fill="#FFF">Call Ahead &amp; Drive Straight</text>' +
        '<text x="386" y="106" font-family="Newsreader,Georgia,serif" font-size="19" font-weight="700" fill="#FCA5A5">to a 24-Hr Surgical Vet ER</text>' +
        '<text x="386" y="138" font-family="Inter,sans-serif" font-size="11" fill="#D6D3D1">• Tell them: “Possible bloat / GDV en route”</text>' +
        '<text x="386" y="156" font-family="Inter,sans-serif" font-size="11" fill="#D6D3D1">  so triage &amp; right-lateral X-ray are ready.</text>' +
        '<text x="386" y="182" font-family="Inter,sans-serif" font-size="11" fill="#FCA5A5" font-weight="700">• ZERO home Gas-X, oils, or forced water—</text>' +
        '<text x="386" y="200" font-family="Inter,sans-serif" font-size="11" fill="#D6D3D1">  only decompression + surgery untwists it.</text>' +
        '<text x="386" y="226" font-family="IBM Plex Mono,monospace" font-size="9.5" fill="#94A3B8">X-RAY SIGN: “POPEYE ARM” / DOUBLE BUBBLE</text>' +
        '</svg>'
    }
  };

  /* ========================================================================
     DYNAMIC FORENSIC CASE MECHANISM BLUEPRINT (FOR EVERY OTHER STORY!)
     Guarantees 100% of all 136 stories has a crisp, tailored vector visual!
     ======================================================================== */
  var PART_META = {
    garage:   { tag: 'WORKSHOP PHYSICS BLUEPRINT', accent: '#B41C1C', icon: '⚡' },
    kitchen:  { tag: 'DOMESTIC CHEMISTRY BLUEPRINT', accent: '#B41C1C', icon: '🧪' },
    medicine: { tag: 'TOXICOLOGY MECHANISM BLUEPRINT', accent: '#B41C1C', icon: '💊' },
    outdoors: { tag: 'FIELD HAZARD BLUEPRINT', accent: '#B41C1C', icon: '🧭' },
    hospital: { tag: 'DIAGNOSTIC TRAP BLUEPRINT', accent: '#B41C1C', icon: '🩺' },
    pets:     { tag: 'ONE MEDICINE PET SAFETY BLUEPRINT', accent: '#B41C1C', icon: '🐾' }
  };

  function renderCaseBlueprint(story, catCase) {
    var pm = PART_META[story.partId] || PART_META.hospital;
    var looksLines = wrapSvgLines(story.looksLike, 26, 3);
    var mechLines = wrapSvgLines((story.toeTag && story.toeTag.mechanism) || story.actuallyIs, 28, 4);
    var ruleLines = wrapSvgLines((catCase && catCase.goldenRule) || (story.survivalCard && story.survivalCard.steps[0] ? story.survivalCard.steps[0].detail : ''), 28, 4);
    var lieLines = wrapSvgLines((story.toeTag && story.toeTag.falseReassurance) || '', 84, 2);

    var svg =
      '<svg viewBox="0 0 720 278" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Forensic mechanism blueprint for ' + svgEsc(story.title) + '">' +
      '<rect width="720" height="278" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
      /* Column 1: The Disguise */
      '<rect x="18" y="20" width="212" height="168" rx="8" fill="#FFF" stroke="#E4E0D8" stroke-width="1.5"/>' +
      '<rect x="18" y="20" width="212" height="28" rx="8" fill="#F3F1EC"/>' +
      '<text x="30" y="38" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#57534E">01 · TUESDAY DISGUISE</text>' +
      '<g font-family="Inter,sans-serif" font-size="12" font-weight="600" fill="#18181B">' + tspanLines(looksLines, 30, 74, 18) + '</g>' +
      '<text x="30" y="172" font-family="IBM Plex Mono,monospace" font-size="9" fill="#78716C">FILE № ' + svgEsc(story.fileNo) + ' · ' + svgEsc((catCase && catCase.ep) || '') + '</text>' +

      /* Arrow 1 -> 2 */
      '<text x="242" y="108" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="16" font-weight="700" fill="#B41C1C">→</text>' +

      /* Column 2: Hidden Mechanism */
      '<rect x="254" y="20" width="212" height="168" rx="8" fill="#FDF2F2" stroke="#F5C6C6" stroke-width="1.6"/>' +
      '<rect x="254" y="20" width="212" height="28" rx="8" fill="#B41C1C"/>' +
      '<text x="266" y="38" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#FFF">02 · HIDDEN MECHANISM</text>' +
      '<g font-family="Inter,sans-serif" font-size="11.5" font-weight="600" fill="#7F1D1D">' + tspanLines(mechLines, 266, 72, 17) + '</g>' +
      '<text x="266" y="172" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#B41C1C">AVOIDABILITY: ' + svgEsc((story.toeTag && story.toeTag.avoidability) || 'HIGH').slice(0, 18) + '</text>' +

      /* Arrow 2 -> 3 */
      '<text x="478" y="108" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="16" font-weight="700" fill="#181B20">→</text>' +

      /* Column 3: 60-Second Counter-Move */
      '<rect x="490" y="20" width="212" height="168" rx="8" fill="#181B20"/>' +
      '<text x="502" y="42" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#4ADE80">03 · 60-SECOND COUNTER</text>' +
      '<g font-family="Inter,sans-serif" font-size="11.5" fill="#F5F4F0">' + tspanLines(ruleLines, 502, 72, 17) + '</g>' +
      '<text x="502" y="172" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#FCA5A5">' + svgEsc(pm.icon) + ' SURVIVAL PROTOCOL</text>' +

      /* Bottom Strip: Fatal False Reassurance */
      '<rect x="18" y="202" width="684" height="58" rx="8" fill="#FFF" stroke="#D1CCC2" stroke-dasharray="4 3"/>' +
      '<text x="32" y="222" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#B41C1C">THE FALSE REASSURANCE THAT GETS PEOPLE KILLED:</text>' +
      '<g font-family="Newsreader,Georgia,serif" font-style="italic" font-size="12.5" fill="#18181B">' + tspanLines(lieLines, 32, 242, 16) + '</g>' +
      '</svg>';

    return {
      badge: pm.tag,
      title: 'How This Tuesday Escalates — And Where to Break the Chain',
      caption: 'Visual summary grounded strictly in ' + ((catCase && catCase.ep) || 'this case file') + ': separating what looks reassuring on the surface from the underlying physiology.',
      svg: svg
    };
  }

  /* Interactive Clickable "House of Traps" SVG Floorplan for index.html */
  function renderHouseMap(counts) {
    var c = counts || {};
    function cnt(k) { return c[k] ? ' (' + c[k] + ')' : ''; }
    return (
      '<svg viewBox="0 0 960 310" xmlns="http://www.w3.org/2000/svg" class="ot-floorplan-svg" role="img" aria-label="Interactive floorplan of six everyday danger zones">' +
      '<rect width="960" height="310" rx="14" fill="#181B20"/>' +
      '<defs><pattern id="ot-bp" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="#252B34" stroke-width="1"/></pattern></defs>' +
      '<rect width="960" height="310" rx="14" fill="url(#ot-bp)"/>' +
      '<text x="24" y="30" font-family="IBM Plex Mono,monospace" font-size="11" font-weight="700" letter-spacing="1.2" fill="#FCA5A5">ARCHITECTURAL HAZARD MAP · CLICK ANY ROOM TO INSPECT ITS TRAPS</text>' +
      '<text x="936" y="30" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="10.5" fill="#94A3B8">SCALE: 1 TUESDAY = 136 WAYS OUT</text>' +

      '<g class="ot-room-hotspot" data-room="garage" tabindex="0" role="button" aria-label="Filter Garage and Yard">' +
        '<rect x="24" y="48" width="292" height="114" rx="9" fill="#22272F" stroke="#475569" stroke-width="1.5"/>' +
        '<text x="40" y="72" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">PART I · GARAGE &amp; YARD' + cnt('garage') + '</text>' +
        '<text x="40" y="96" font-family="Newsreader,Georgia,serif" font-size="18" font-weight="700" fill="#FFF">Workshop Physics</text>' +
        '<text x="40" y="116" font-family="Inter,sans-serif" font-size="11.5" fill="#CBD5E1">15,000V craft tables, truck tires, HF acid,</text>' +
        '<text x="40" y="132" font-family="Inter,sans-serif" font-size="11.5" fill="#CBD5E1">dry ice, bungee hooks &amp; wet 120V circuits.</text>' +
        '<text x="298" y="148" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">ENTER →</text>' +
      '</g>' +

      '<g class="ot-room-hotspot" data-room="kitchen" tabindex="0" role="button" aria-label="Filter Kitchen">' +
        '<rect x="334" y="48" width="292" height="114" rx="9" fill="#22272F" stroke="#475569" stroke-width="1.5"/>' +
        '<text x="350" y="72" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">PART II · KITCHEN &amp; TABLE' + cnt('kitchen') + '</text>' +
        '<text x="350" y="96" font-family="Newsreader,Georgia,serif" font-size="18" font-weight="700" fill="#FFF">Domestic Chemistry</text>' +
        '<text x="350" y="116" font-family="Inter,sans-serif" font-size="11.5" fill="#CBD5E1">Grill wires, bleach mixes, reef fish, mad</text>' +
        '<text x="350" y="132" font-family="Inter,sans-serif" font-size="11.5" fill="#CBD5E1">honey, leaded pitchers &amp; reheated rice.</text>' +
        '<text x="608" y="148" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">ENTER →</text>' +
      '</g>' +

      '<g class="ot-room-hotspot" data-room="medicine" tabindex="0" role="button" aria-label="Filter Medicine Cabinet">' +
        '<rect x="644" y="48" width="292" height="114" rx="9" fill="#22272F" stroke="#475569" stroke-width="1.5"/>' +
        '<text x="660" y="72" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">PART III · MED CABINET' + cnt('medicine') + '</text>' +
        '<text x="660" y="96" font-family="Newsreader,Georgia,serif" font-size="18" font-weight="700" fill="#FFF">OTC &amp; Counter Roulette</text>' +
        '<text x="660" y="116" font-family="Inter,sans-serif" font-size="11.5" fill="#CBD5E1">Toothache gel, hot-bath patches, gas-station</text>' +
        '<text x="660" y="132" font-family="Inter,sans-serif" font-size="11.5" fill="#CBD5E1">honey/kratom, XL pills &amp; silent kidney herbs.</text>' +
        '<text x="918" y="148" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">ENTER →</text>' +
      '</g>' +

      '<g class="ot-room-hotspot" data-room="outdoors" tabindex="0" role="button" aria-label="Filter Outdoors">' +
        '<rect x="24" y="178" width="292" height="114" rx="9" fill="#22272F" stroke="#475569" stroke-width="1.5"/>' +
        '<text x="40" y="202" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">PART IV · GYM &amp; TRAIL' + cnt('outdoors') + '</text>' +
        '<text x="40" y="226" font-family="Newsreader,Georgia,serif" font-size="18" font-weight="700" fill="#FFF">Field Hazards</text>' +
        '<text x="40" y="246" font-family="Inter,sans-serif" font-size="11.5" fill="#CBD5E1">Spin-class rhabdo, tap-water contacts,</text>' +
        '<text x="40" y="262" font-family="Inter,sans-serif" font-size="11.5" fill="#CBD5E1">jumping mackerel, hot vans &amp; cold water.</text>' +
        '<text x="298" y="278" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">ENTER →</text>' +
      '</g>' +

      '<g class="ot-room-hotspot" data-room="hospital" tabindex="0" role="button" aria-label="Filter ER Fakeouts">' +
        '<rect x="334" y="178" width="292" height="114" rx="9" fill="#2A1C1E" stroke="#B41C1C" stroke-width="1.8"/>' +
        '<text x="350" y="202" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">PART V · ER FAKEOUTS' + cnt('hospital') + '</text>' +
        '<text x="350" y="226" font-family="Newsreader,Georgia,serif" font-size="18" font-weight="700" fill="#FFF">“The First Test Looked Normal”</text>' +
        '<text x="350" y="246" font-family="Inter,sans-serif" font-size="11.5" fill="#E7E5E4">Negative scans, lying oximeters, tube-sheared</text>' +
        '<text x="350" y="262" font-family="Inter,sans-serif" font-size="11.5" fill="#E7E5E4">potassium, clear CTs &amp; one-finger saves.</text>' +
        '<text x="608" y="278" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">ENTER →</text>' +
      '</g>' +

      '<g class="ot-room-hotspot" data-room="pets" tabindex="0" role="button" aria-label="Filter Pets">' +
        '<rect x="644" y="178" width="292" height="114" rx="9" fill="#22272F" stroke="#475569" stroke-width="1.5"/>' +
        '<text x="660" y="202" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">PART VI · PETS (ONE MEDICINE)' + cnt('pets') + '</text>' +
        '<text x="660" y="226" font-family="Newsreader,Georgia,serif" font-size="18" font-weight="700" fill="#FFF">Four-Legged Roommates</text>' +
        '<text x="660" y="246" font-family="Inter,sans-serif" font-size="11.5" fill="#CBD5E1">Lilies, minoxidil pillows, xylitol gum, sago</text>' +
        '<text x="660" y="262" font-family="Inter,sans-serif" font-size="11.5" fill="#CBD5E1">palms, puppy bloat &amp; super-rat bait.</text>' +
        '<text x="918" y="278" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">ENTER →</text>' +
      '</g>' +
      '</svg>'
    );
  }

  window.OT_DIAGRAMS = DIAGRAMS;
  window.OT_RENDER_CASE_BLUEPRINT = renderCaseBlueprint;
  window.OT_RENDER_HOUSE_MAP = renderHouseMap;
})();
