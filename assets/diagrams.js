/* ==========================================================================
   HOW NOT TO DIE ON AN ORDINARY TUESDAY — BESPOKE FORENSIC SVG DIAGRAMS
   Original vector graphics ("Airline Safety Card meets NTSB Crash Report")
   100% original & commercial-print safe. Zero external dependencies.
   ========================================================================== */
(function () {
  'use strict';

  var DIAGRAMS = {
    'fractal-wood-burning': {
      badge: 'FORENSIC DIAGRAM · ELECTRICAL PHYSICS',
      title: 'Anatomy of a 15,000-Volt Craft Table',
      caption: 'Dry wood is an insulator in high-school physics. High-school physics did not bring a salvaged microwave transformer soaked in baking-soda water.',
      svg:
        '<svg viewBox="0 0 720 330" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagram comparing why touching an electrocuted victim creates a second circuit versus cutting the main breaker first">' +
        '<rect width="720" height="330" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        /* Left panel: Fatal circuit */
        '<rect x="18" y="18" width="332" height="294" rx="8" fill="#FFF" stroke="#F5C6C6" stroke-width="1.5"/>' +
        '<rect x="18" y="18" width="332" height="30" rx="8" fill="#FDF2F2"/>' +
        '<text x="32" y="38" font-family="IBM Plex Mono,monospace" font-size="11" font-weight="700" fill="#B41C1C">✕ WHAT KILLS RESCUER #2</text>' +
        /* Microwave transformer box */
        '<rect x="34" y="70" width="92" height="58" rx="5" fill="#181B20"/>' +
        '<text x="80" y="94" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FFF">SALVAGED</text>' +
        '<text x="80" y="108" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">2,000–15kV</text>' +
        '<text x="80" y="121" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#A1A8B3">NO FUSE / NO GFCI</text>' +
        /* Wet cutting board */
        '<rect x="148" y="84" width="110" height="38" rx="4" fill="#EFE7DA" stroke="#B41C1C" stroke-width="1.5"/>' +
        '<path d="M158 103 L176 96 L186 108 L206 94 L224 109 L246 98" fill="none" stroke="#B41C1C" stroke-width="2.2"/>' +
        '<text x="203" y="136" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" font-weight="600" fill="#44403C">Baking-Soda Wet Wood</text>' +
        '<text x="203" y="149" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="#B41C1C">(NOW A LIVE CONDUCTOR)</text>' +
        /* Wire from transformer to wood */
        '<path d="M126 95 L148 95" stroke="#B41C1C" stroke-width="2.5" stroke-dasharray="4 2"/>' +
        /* Stick figure 1 (locked hand) + Stick figure 2 (grabbing) */
        '<circle cx="195" cy="184" r="11" fill="none" stroke="#18181B" stroke-width="2.2"/>' +
        '<line x1="195" y1="195" x2="195" y2="238" stroke="#18181B" stroke-width="2.2"/>' +
        '<line x1="195" y1="205" x2="178" y2="122" stroke="#B41C1C" stroke-width="2.4"/>' +
        '<line x1="195" y1="238" x2="180" y2="268" stroke="#18181B" stroke-width="2.2"/>' +
        '<line x1="195" y1="238" x2="210" y2="268" stroke="#18181B" stroke-width="2.2"/>' +
        '<text x="195" y="284" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#18181B">VICTIM #1</text>' +
        '<text x="195" y="296" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" fill="#78716C">60Hz locks grip</text>' +
        /* Rescuer #2 touching */
        '<circle cx="288" cy="184" r="11" fill="none" stroke="#B41C1C" stroke-width="2.2"/>' +
        '<line x1="288" y1="195" x2="288" y2="238" stroke="#B41C1C" stroke-width="2.2"/>' +
        '<line x1="288" y1="205" x2="210" y2="205" stroke="#B41C1C" stroke-width="2.6" stroke-dasharray="4 3"/>' +
        '<line x1="288" y1="238" x2="274" y2="268" stroke="#B41C1C" stroke-width="2.2"/>' +
        '<line x1="288" y1="238" x2="302" y2="268" stroke="#B41C1C" stroke-width="2.2"/>' +
        '<text x="288" y="284" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#B41C1C">RESISTOR #2</text>' +
        '<text x="288" y="296" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" fill="#B41C1C">Current jumps arm-to-arm</text>' +
        '<text x="246" y="198" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="13" font-weight="700" fill="#B41C1C">⚡</text>' +
        /* Right panel: Survival move */
        '<rect x="370" y="18" width="332" height="294" rx="8" fill="#FFF" stroke="#D1CCC2" stroke-width="1.5"/>' +
        '<rect x="370" y="18" width="332" height="30" rx="8" fill="#181B20"/>' +
        '<text x="384" y="38" font-family="IBM Plex Mono,monospace" font-size="11" font-weight="700" fill="#FFF">✓ FIRST 60 SECONDS PROTOCOL</text>' +
        /* Step 1 breaker box */
        '<rect x="394" y="72" width="112" height="92" rx="6" fill="#F3F1EC" stroke="#18181B" stroke-width="1.8"/>' +
        '<text x="450" y="92" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#18181B">MAIN BREAKER</text>' +
        '<rect x="424" y="102" width="52" height="26" rx="4" fill="#B41C1C"/>' +
        '<text x="450" y="119" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="11" font-weight="700" fill="#FFF">OFF</text>' +
        '<text x="450" y="150" text-anchor="middle" font-family="Inter,sans-serif" font-size="9.5" fill="#44403C">Step 1: Kill power</text>' +
        /* Arrow */
        '<path d="M514 118 L544 118" stroke="#18181B" stroke-width="2.2" marker-end="url(#ot-arr)"/>' +
        '<defs><marker id="ot-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 1L10 5L0 9z" fill="#18181B"/></marker></defs>' +
        /* Step 2 AED + CPR */
        '<rect x="552" y="72" width="128" height="92" rx="6" fill="#FDF2F2" stroke="#B41C1C" stroke-width="1.5"/>' +
        '<text x="616" y="96" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="11" font-weight="700" fill="#B41C1C">911 + CPR + AED</text>' +
        '<text x="616" y="116" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" fill="#18181B">Only touch victim</text>' +
        '<text x="616" y="131" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" fill="#18181B">AFTER power is</text>' +
        '<text x="616" y="146" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" font-weight="700" fill="#B41C1C">confirmed dead.</text>' +
        /* Stat callout */
        '<rect x="394" y="186" width="286" height="104" rx="6" fill="#FAF9F6" stroke="#E4E0D8"/>' +
        '<text x="408" y="208" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#B41C1C">THE BRUTAL ARITHMETIC</text>' +
        '<text x="408" y="229" font-family="Inter,sans-serif" font-size="11.5" fill="#18181B">• Estimated shock fatality rate: ~71%</text>' +
        '<text x="408" y="249" font-family="Inter,sans-serif" font-size="11.5" fill="#18181B">• Dry wooden dowel handles fail at &gt;2,000 V</text>' +
        '<text x="408" y="269" font-family="Inter,sans-serif" font-size="11.5" fill="#18181B">• Survival rule: Never build a home Lichtenberg rig.</text>' +
        '</svg>'
    },

    'driveway-ied-truck-tire': {
      badge: 'FORENSIC DIAGRAM · BLAST GEOMETRY',
      title: 'The Blast Radius of a 110-PSI Commercial Tire',
      caption: 'A heavy-duty radial tire at 110 PSI stores the pneumatic energy of a hand grenade. Standing face-on to the sidewall puts your chest inside the fragmentation cone.',
      svg:
        '<svg viewBox="0 0 720 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Top-down blast geometry diagram of a commercial truck tire zipper failure">' +
        '<rect width="720" height="320" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        /* Danger cones left & right of tire */
        '<path d="M210 160 L58 60 A195 195 0 0 0 58 260 Z" fill="#FDF2F2" stroke="#F5C6C6" stroke-width="1.5"/>' +
        '<path d="M270 160 L422 60 A195 195 0 0 1 422 260 Z" fill="#FDF2F2" stroke="#F5C6C6" stroke-width="1.5"/>' +
        /* Tire cross section (top down) */
        '<rect x="210" y="96" width="60" height="128" rx="12" fill="#181B20"/>' +
        '<rect x="222" y="112" width="36" height="96" rx="4" fill="#323944"/>' +
        '<text x="240" y="156" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#FFF">110 PSI</text>' +
        '<text x="240" y="170" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#FCA5A5">ZIPPER</text>' +
        /* Blast labels */
        '<text x="128" y="148" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#B41C1C">SIDEWALL</text>' +
        '<text x="128" y="164" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#B41C1C">BLAST CONE</text>' +
        '<text x="128" y="182" text-anchor="middle" font-family="Inter,sans-serif" font-size="9.5" fill="#44403C">0.5 m = ~265 PSI</text>' +
        '<text x="128" y="196" text-anchor="middle" font-family="Inter,sans-serif" font-size="9.5" fill="#44403C">overpressure shock</text>' +
        '<text x="352" y="154" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#B41C1C">✕ NEVER STAND</text>' +
        '<text x="352" y="170" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#B41C1C">FACING SIDEWALL</text>' +
        /* Safe zone in tread axis */
        '<rect x="176" y="20" width="128" height="44" rx="6" fill="#ECFDF5" stroke="#10B981" stroke-width="1.5"/>' +
        '<text x="240" y="38" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#065F46">✓ SAFE STAND-OFF</text>' +
        '<text x="240" y="54" text-anchor="middle" font-family="Inter,sans-serif" font-size="9.5" fill="#065F46">≥ 2.5 m along tread line</text>' +
        '<line x1="240" y1="64" x2="240" y2="96" stroke="#10B981" stroke-width="2" stroke-dasharray="4 3"/>' +
        /* Right info panel */
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
      badge: 'FORENSIC DIAGRAM · GAS STRATIFICATION',
      title: 'Why Dry Ice in the Back Seat Floods the Cabin First',
      caption: 'Solid CO₂ sublimates into gas 1.53× denser than air—odorless, colorless, and silently rising from the floorboard until oxygen drops below consciousness.',
      svg:
        '<svg viewBox="0 0 720 310" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cross-section of an SUV showing heavy carbon dioxide pooling inside a closed cabin">' +
        '<rect width="720" height="310" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        /* SUV Silhouette */
        '<path d="M56 218 L66 150 L150 142 L222 86 L464 86 L508 148 L516 218 Z" fill="#FFF" stroke="#18181B" stroke-width="2.2"/>' +
        /* Rising CO2 pool inside cabin */
        '<path d="M64 216 L68 158 L508 158 L514 216 Z" fill="#B41C1C" fill-opacity="0.16"/>' +
        '<path d="M168 158 L206 122 L494 122 L508 158 Z" fill="#B41C1C" fill-opacity="0.10"/>' +
        '<line x1="176" y1="122" x2="494" y2="122" stroke="#B41C1C" stroke-width="1.5" stroke-dasharray="5 4"/>' +
        /* Cooler in back */
        '<rect x="404" y="156" width="76" height="54" rx="5" fill="#181B20"/>' +
        '<text x="442" y="180" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#FFF">DRY ICE</text>' +
        '<text x="442" y="195" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#FCA5A5">-78.5°C CO₂</text>' +
        /* Sublimation arrows */
        '<path d="M442 152 Q442 130 390 138 T310 146" fill="none" stroke="#B41C1C" stroke-width="2" stroke-dasharray="3 2"/>' +
        /* Driver head right at rising CO2 line */
        '<circle cx="246" cy="134" r="14" fill="#FAF9F6" stroke="#18181B" stroke-width="2"/>' +
        '<line x1="246" y1="148" x2="246" y2="196" stroke="#18181B" stroke-width="2.2"/>' +
        '<text x="246" y="110" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#B41C1C">BREATHING ZONE</text>' +
        '<text x="246" y="176" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#B41C1C">CO₂ POOL (1.53× AIR)</text>' +
        /* Wheels */
        '<circle cx="152" cy="222" r="28" fill="#181B20"/><circle cx="152" cy="222" r="12" fill="#E4E0D8"/>' +
        '<circle cx="430" cy="222" r="28" fill="#181B20"/><circle cx="430" cy="222" r="12" fill="#E4E0D8"/>' +
        /* Warning callout right */
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

    'chocolate-brown-blood': {
      badge: 'FORENSIC DIAGRAM · THE OXIMETER LIE',
      title: 'Why Pulse Oximeters Freeze Near 85% While Your Blood Turns Brown',
      caption: 'Standard 2-wavelength finger probes assume only red oxy-Hb and blue deoxy-Hb exist. Methemoglobin absorbs both wavelengths equally—forcing the math to read ~85% no matter how low oxygen drops.',
      svg:
        '<svg viewBox="0 0 720 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagram comparing normal bright red arterial blood with chocolate-brown methemoglobinemia and the frozen 85% pulse oximeter reading">' +
        '<rect width="720" height="300" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        /* Blood swatch 1 */
        '<rect x="26" y="28" width="202" height="176" rx="8" fill="#FFF" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<circle cx="127" cy="94" r="40" fill="#C81E1E"/>' +
        '<text x="127" y="99" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="11" font-weight="700" fill="#FFF">Fe²⁺</text>' +
        '<text x="127" y="156" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#18181B">Normal Arterial Blood</text>' +
        '<text x="127" y="174" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" fill="#78716C">BRIGHT RED · RELEASES O₂</text>' +
        /* Blood swatch 2 */
        '<rect x="246" y="28" width="202" height="176" rx="8" fill="#FFF" stroke="#F5C6C6" stroke-width="1.8"/>' +
        '<circle cx="347" cy="94" r="40" fill="#4A2511"/>' +
        '<text x="347" y="99" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="11" font-weight="700" fill="#FDE68A">Fe³⁺</text>' +
        '<text x="347" y="156" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#B41C1C">Methemoglobinemia</text>' +
        '<text x="347" y="174" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" fill="#B41C1C">CHOCOLATE BROWN · LOCKED</text>' +
        '<text x="347" y="191" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" fill="#78716C">Stays brown even on 100% O₂</text>' +
        /* Smug Oximeter Display */
        '<rect x="470" y="28" width="224" height="176" rx="10" fill="#181B20" stroke="#323944" stroke-width="2"/>' +
        '<text x="582" y="54" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#A1A8B3">STANDARD FINGER OXIMETER</text>' +
        '<rect x="492" y="66" width="180" height="72" rx="6" fill="#0B0E12" stroke="#323944"/>' +
        '<text x="582" y="114" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="40" font-weight="700" fill="#38BDF8">85%</text>' +
        '<text x="582" y="160" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#FCA5A5">FROZEN PLATEAU LIE</text>' +
        '<text x="582" y="177" text-anchor="middle" font-family="Inter,sans-serif" font-size="9.5" fill="#D6D3D1">Reads ~85% at 30% OR 70% MetHb</text>' +
        /* Bottom bar: The Antidote */
        '<rect x="26" y="222" width="668" height="56" rx="8" fill="#FDF2F2" stroke="#F5C6C6"/>' +
        '<text x="42" y="245" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#B41C1C">THE DIAGNOSTIC TELL + 15-MINUTE FIX:</text>' +
        '<text x="42" y="264" font-family="Inter,sans-serif" font-size="11.5" fill="#18181B">High arterial PaO₂ + stubborn ~85% SpO₂ + brown blood = Demand CO-OXIMETRY + IV Methylene Blue (1–2 mg/kg).</text>' +
        '</svg>'
    },

    'wire-behind-the-pain': {
      badge: 'FORENSIC DIAGRAM · HIDDEN FOREIGN BODY',
      title: 'How a 2-cm Grill Bristle Walks Straight Past Standard X-Rays',
      caption: 'Stray stainless wire bristles from worn barbecue brushes are thin enough to hide behind spine shadows on plain X-rays—and stiff enough to spear straight through the small bowel wall.',
      svg:
        '<svg viewBox="0 0 720 290" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="4-step forensic timeline of an ingested wire grill bristle piercing the small intestine">' +
        '<rect width="720" height="290" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        /* 4 horizontal step cards */
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
        /* Bottom note */
        '<text x="24" y="260" font-family="IBM Plex Mono,monospace" font-size="10" fill="#78716C">SOURCE MECHANISM: EP 2283 · WIRE BRISTLES DO NOT REQUIRE A RECALL TO BE DEADLY—THEY ARE DESIGNED TO FATIGUE.</text>' +
        '</svg>'
    },

    'hot-baths-fentanyl-patches-deadly': {
      badge: 'FORENSIC DIAGRAM · THERMAL DOSE DUMPING',
      title: 'How a 106°F Bath Turns a 72-Hour Fentanyl Patch Into an Overdose',
      caption: 'Heat melts stratum corneum lipids and boosts skin blood flow 300–500%. Worse: even after paramedics peel the sticker off, the saturated skin depot keeps leaking fentanyl for up to 17 hours.',
      svg:
        '<svg viewBox="0 0 720 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Chart comparing normal 98.6 degree skin delivery versus 106 degree hot bath fentanyl patch dose dumping and post-removal depot release">' +
        '<rect width="720" height="300" rx="10" fill="#FAF9F6" stroke="#E4E0D8" stroke-width="1.5"/>' +
        /* Graph axes */
        '<rect x="24" y="24" width="420" height="252" rx="8" fill="#FFF" stroke="#E4E0D8" stroke-width="1.5"/>' +
        '<text x="42" y="48" font-family="IBM Plex Mono,monospace" font-size="10.5" font-weight="700" fill="#18181B">SERUM FENTANYL FLUX OVER TIME</text>' +
        '<line x1="56" y1="234" x2="424" y2="234" stroke="#18181B" stroke-width="1.5"/>' +
        '<line x1="56" y1="68" x2="56" y2="234" stroke="#18181B" stroke-width="1.5"/>' +
        /* Lethal threshold dashed line */
        '<line x1="56" y1="112" x2="424" y2="112" stroke="#B41C1C" stroke-width="1.2" stroke-dasharray="5 4"/>' +
        '<text x="420" y="106" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#B41C1C">RESPIRATORY ARREST ZONE</text>' +
        /* Normal curve */
        '<path d="M56 212 Q180 198 416 198" fill="none" stroke="#10B981" stroke-width="2.6"/>' +
        '<text x="414" y="191" text-anchor="end" font-family="Inter,sans-serif" font-size="10" font-weight="700" fill="#065F46">98.6°F Normal Skin (Steady)</text>' +
        /* Hot bath spike + long depot tail */
        '<path d="M56 210 L118 202 Q156 196 184 82 Q204 72 224 98 Q276 138 416 154" fill="none" stroke="#B41C1C" stroke-width="3"/>' +
        '<circle cx="192" cy="80" r="5" fill="#B41C1C"/>' +
        '<text x="204" y="84" font-family="IBM Plex Mono,monospace" font-size="9.5" font-weight="700" fill="#B41C1C">41°C BATH SPIKE (9.4 ng/mL)</text>' +
        /* Patch removed marker */
        '<line x1="238" y1="68" x2="238" y2="234" stroke="#78716C" stroke-width="1.2" stroke-dasharray="3 3"/>' +
        '<text x="244" y="168" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#44403C">PATCH PEELED OFF →</text>' +
        '<text x="244" y="180" font-family="Inter,sans-serif" font-size="9.5" font-weight="700" fill="#B41C1C">Skin depot STILL leaks</text>' +
        '<text x="244" y="192" font-family="Inter,sans-serif" font-size="9.5" fill="#44403C">for up to 17 hrs!</text>' +
        '<text x="240" y="256" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" fill="#78716C">HOURS AFTER HEAT EXPOSURE</text>' +
        /* Right panel: Rules */
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
    }
  };

  /* Interactive Clickable "House of Traps" SVG Floorplan for index.html */
  function renderHouseMap(counts) {
    var c = counts || {};
    function cnt(k) { return c[k] ? ' (' + c[k] + ')' : ''; }
    return (
      '<svg viewBox="0 0 960 310" xmlns="http://www.w3.org/2000/svg" class="ot-floorplan-svg" role="img" aria-label="Interactive floorplan of six everyday danger zones">' +
      '<rect width="960" height="310" rx="14" fill="#181B20"/>' +
      /* Subtle blueprint grid lines */
      '<defs><pattern id="ot-bp" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="#252B34" stroke-width="1"/></pattern></defs>' +
      '<rect width="960" height="310" rx="14" fill="url(#ot-bp)"/>' +
      '<text x="24" y="30" font-family="IBM Plex Mono,monospace" font-size="11" font-weight="700" letter-spacing="1.2" fill="#FCA5A5">ARCHITECTURAL HAZARD MAP · CLICK ANY ROOM TO INSPECT ITS TRAPS</text>' +
      '<text x="936" y="30" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="10.5" fill="#94A3B8">SCALE: 1 TUESDAY = 136 WAYS OUT</text>' +

      /* 6 Interactive Room Blueprint Tiles */
      /* 1. Garage & Yard */
      '<g class="ot-room-hotspot" data-room="garage" tabindex="0" role="button" aria-label="Filter Garage and Yard">' +
        '<rect x="24" y="48" width="292" height="114" rx="9" fill="#22272F" stroke="#475569" stroke-width="1.5"/>' +
        '<text x="40" y="72" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">PART I · GARAGE &amp; YARD' + cnt('garage') + '</text>' +
        '<text x="40" y="96" font-family="Newsreader,Georgia,serif" font-size="18" font-weight="700" fill="#FFF">Workshop Physics</text>' +
        '<text x="40" y="116" font-family="Inter,sans-serif" font-size="11.5" fill="#CBD5E1">15,000V craft tables, truck tires, HF acid,</text>' +
        '<text x="40" y="132" font-family="Inter,sans-serif" font-size="11.5" fill="#CBD5E1">dry ice, bungee hooks &amp; wet 120V circuits.</text>' +
        '<text x="298" y="148" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">ENTER →</text>' +
      '</g>' +

      /* 2. Kitchen */
      '<g class="ot-room-hotspot" data-room="kitchen" tabindex="0" role="button" aria-label="Filter Kitchen">' +
        '<rect x="334" y="48" width="292" height="114" rx="9" fill="#22272F" stroke="#475569" stroke-width="1.5"/>' +
        '<text x="350" y="72" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">PART II · KITCHEN &amp; TABLE' + cnt('kitchen') + '</text>' +
        '<text x="350" y="96" font-family="Newsreader,Georgia,serif" font-size="18" font-weight="700" fill="#FFF">Domestic Chemistry</text>' +
        '<text x="350" y="116" font-family="Inter,sans-serif" font-size="11.5" fill="#CBD5E1">Grill wires, bleach mixes, reef fish, mad</text>' +
        '<text x="350" y="132" font-family="Inter,sans-serif" font-size="11.5" fill="#CBD5E1">honey, leaded pitchers &amp; reheated rice.</text>' +
        '<text x="608" y="148" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">ENTER →</text>' +
      '</g>' +

      /* 3. Medicine Cabinet */
      '<g class="ot-room-hotspot" data-room="medicine" tabindex="0" role="button" aria-label="Filter Medicine Cabinet">' +
        '<rect x="644" y="48" width="292" height="114" rx="9" fill="#22272F" stroke="#475569" stroke-width="1.5"/>' +
        '<text x="660" y="72" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">PART III · MED CABINET' + cnt('medicine') + '</text>' +
        '<text x="660" y="96" font-family="Newsreader,Georgia,serif" font-size="18" font-weight="700" fill="#FFF">OTC &amp; Counter Roulette</text>' +
        '<text x="660" y="116" font-family="Inter,sans-serif" font-size="11.5" fill="#CBD5E1">Toothache gel, hot-bath patches, gas-station</text>' +
        '<text x="660" y="132" font-family="Inter,sans-serif" font-size="11.5" fill="#CBD5E1">honey/kratom, XL pills &amp; silent kidney herbs.</text>' +
        '<text x="918" y="148" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">ENTER →</text>' +
      '</g>' +

      /* 4. Gym, Trail & Vacation */
      '<g class="ot-room-hotspot" data-room="outdoors" tabindex="0" role="button" aria-label="Filter Outdoors">' +
        '<rect x="24" y="178" width="292" height="114" rx="9" fill="#22272F" stroke="#475569" stroke-width="1.5"/>' +
        '<text x="40" y="202" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">PART IV · GYM &amp; TRAIL' + cnt('outdoors') + '</text>' +
        '<text x="40" y="226" font-family="Newsreader,Georgia,serif" font-size="18" font-weight="700" fill="#FFF">Field Hazards</text>' +
        '<text x="40" y="246" font-family="Inter,sans-serif" font-size="11.5" fill="#CBD5E1">Spin-class rhabdo, tap-water contacts,</text>' +
        '<text x="40" y="262" font-family="Inter,sans-serif" font-size="11.5" fill="#CBD5E1">jumping mackerel, hot vans &amp; cold water.</text>' +
        '<text x="298" y="278" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">ENTER →</text>' +
      '</g>' +

      /* 5. ER Fakeouts */
      '<g class="ot-room-hotspot" data-room="hospital" tabindex="0" role="button" aria-label="Filter ER Fakeouts">' +
        '<rect x="334" y="178" width="292" height="114" rx="9" fill="#2A1C1E" stroke="#B41C1C" stroke-width="1.8"/>' +
        '<text x="350" y="202" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">PART V · ER FAKEOUTS' + cnt('hospital') + '</text>' +
        '<text x="350" y="226" font-family="Newsreader,Georgia,serif" font-size="18" font-weight="700" fill="#FFF">“The First Test Looked Normal”</text>' +
        '<text x="350" y="246" font-family="Inter,sans-serif" font-size="11.5" fill="#E7E5E4">Negative scans, lying oximeters, tube-sheared</text>' +
        '<text x="350" y="262" font-family="Inter,sans-serif" font-size="11.5" fill="#E7E5E4">potassium, clear CTs &amp; one-finger saves.</text>' +
        '<text x="608" y="278" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#FCA5A5">ENTER →</text>' +
      '</g>' +

      /* 6. Pets (One Medicine) */
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
  window.OT_RENDER_HOUSE_MAP = renderHouseMap;
})();
