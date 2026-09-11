// Internationalization dictionary with authentic producer slang
export const translations = {
  en: {
    seo: {
      title: "CTRL by Napbak | Free Online LUFS Meter, Loudness Penalty Checker & Speaker Simulator",
      description: "Free online LUFS meter and mastering analyzer. Measure integrated loudness (EBU R128), true peak (dBTP), dynamic range (LRA), and simulate how your mix sounds on Spotify, Apple Music, and phone speakers."
    },
    nav: {
      subtitle: "SPOTIFY LOUDNESS CHECKER",
      analyzer: "ANALYZER",
      piano: "CONCERT PIANO",
      getPro: "GET PRO",
      proActive: "PRO ACTIVE"
    },
    comparator: {
      badge: "A/B REFERENCE COMPARATOR",
      title: "Compare two",
      titleAccent: "masters",
      titleSuffix: "side-by-side",
      subtitle: "Drop your mix in Slot A and your reference in Slot B. Audition in real-time with the A/B crossfader.",
      slotA: "SLOT A: TRACK / MIX 1",
      slotB: "SLOT B: REFERENCE / MASTER 2",
      dropA: "DROP TRACK A HERE",
      dropB: "DROP REFERENCE / TRACK B HERE",
      dropFormats: ".WAV, .MP3, .M4A, .OGG",
      analyzing: "ANALYZING LUFS & PEAKS...",
      playingSync: "PLAYING TRACKS IN SYNC",
      readyAudition: "READY TO AUDITION",
      matchLufs: "MATCH LUFS",
      soloA: "[ ◄ SOLO TRACK A ]",
      soloB: "[ SOLO TRACK B ► ]",
      listenA: "LISTENING TO 100% TRACK A",
      listenB: "LISTENING TO 100% TRACK B",
      blend: "A/B BLEND",
      dragNotice: "◄ DRAG FADER TO HEAR THE DIFFERENCE IN REAL-TIME ►",
      differentialTitle: "DIFFERENTIAL SUMMARY (TRACK B vs TRACK A):",
      lufsDiff: "LOUDNESS DIFFERENCE",
      peakDiff: "PEAK DIFFERENCE",
      dynamicsDiff: "DYNAMICS SPREAD",
      louder: "louder (B)",
      quieter: "quieter (B)",
      higherPeak: "higher peak",
      lowerPeak: "lower peak",
      moreDynamic: "more dynamic",
      moreCompressed: "more compressed"
    },
    features: {
      tag: "02. ENGINE FEATURES",
      title: "Precision technology for your",
      titleAccent: "masters",
      subtitle: "Monitor the behavior of your mastering according to international standards",
      f1_title: "Integrated Loudness (EBU R128)",
      f1_desc: "Calculate the real cumulative integrated loudness of your track. Prevent platforms from dynamically compressing your audio in an undesirable way.",
      f2_title: "True Peak Estimator (4x Oversampling)",
      f2_desc: "Detect inter-sample peaks that cause clipping distortion when encoding your digital audio into compressed streaming formats (Ogg, AAC, MP3).",
      f3_title: "Dynamic Range (LRA)",
      f3_desc: "Evaluate the real volume difference in LU units between the most expressive and lowest intensity moments to balance your mix.",
      f4_title: "Platform & Device Simulation",
      f4_desc: "Listen in real-time to how streaming normalization changes your volume, and audition your mix on simulated phone speakers, car EQs, and more."
    },
    pricing: {
      tag: "03. MEMBERSHIP",
      title: "Simple, transparent",
      titleAccent: "plans",
      subtitle: "Unleash the true potential of your music without limits",
      freeTitle: "FREE",
      freeStatus: "(Status: Active)",
      monthlyTitle: "PRO",
      monthlyPeriod: "(Monthly)",
      lifetimeTitle: "LIFETIME",
      lifetimePeriod: "(One-Time)",
      bestValue: "BEST VALUE",
      analysesLimitFree: "3 Analyses / Week",
      analysesUnlimited: "Unlimited Analyses",
      dynamicsFeature: "Dynamic Range (LRA)",
      clientSideFeature: "100% Client-Side Processing",
      simulationFeature: "Platform & Device Simulation",
      webPianoOnly: "Web Piano Workstation",
      vstBonusIncluded: "🎹 Concert Grand VST Plugin (Mac/Win)",
      freePrice: "$0",
      monthlyPrice: "$9.99",
      monthlySuffix: " / mo",
      lifetimePrice: "$79",
      lifetimeSuffix: "(One-Time)",
      activeFreeBtn: "Active Free Plan",
      subscribeMonthlyBtn: "Subscribe Monthly",
      getLifetimeBtn: "Get Lifetime Access",
      // Upsell Card
      upsellBadge: "DONE-FOR-YOU: HANDCRAFTED MASTERING",
      upsellTitle: "Tired of automated limiters? Send your -6dB mix and let a real producer take CTRL.",
      upsellDesc: "Custom EQ, dynamic balance, and human ears. Delivered in 48 hours.",
      upsellBtn: "[ GET PRO MASTER FOR $20 ]"
    },
    ecosystem: {
      tag: "NAPBAK LAB ECOSYSTEM",
      badge: "FREE IN LIFETIME BUNDLE",
      title: "Napbak",
      titleAccent: "Concert Grand Piano",
      desc: "Experience an acoustic Steinway in your browser with dynamic velocity, studio convolution reverb, and MIDI keyboard support. Included as a native VST3/AU download for FL Studio & Ableton with your CTRL Lifetime pass.",
      b1: "✓ 100% Free Browser Workstation",
      b2: "✓ MIDI Controller Plug & Play",
      b3: "✓ VST3 / AU for Mac & Windows",
      openBtn: "OPEN PIANO WORKSTATION"
    },
    faq: {
      tag: "04. FAQ",
      title: "Everything you need to know about",
      titleAccent: "loudness"
    },
    footer: {
      desc: "Free offline EBU R128 loudness compliance meter, true peak estimator, and streaming platform simulation.",
      quickLinks: "QUICK LINKS",
      contact: "GET IN TOUCH",
      contactBtn: "[ Contact & Support ]"
    },
    piano: {
      backBtn: "← BACK TO MASTER ANALYZER",
      tag: "01.5 INSTRUMENT LAB // REALTIME DSP & RECORDER",
      title: "Napbak",
      titleAccent: "Concert Grand",
      subtitle: "Free Acoustic Grand • Zero Latency • FL Studio Transport & MIDI Dropzone",
      midiReady: "MIDI READY (USB AUTO)",
      chord: "CHORD:",
      tabPlay: "PIANO WORKSTATION",
      tabDrop: "DROP MIDI",
      tabLoaded: "MIDI LOADED",
      rec: "REC",
      recording: "RECORDING",
      play: "PLAY",
      pause: "PAUSE",
      playMidi: "PLAY MIDI",
      stopReset: "Stop & Reset",
      transportTimecode: "TRANSPORT",
      recTimecode: "REC TIMECODE",
      playhead: "PLAYHEAD",
      click: "CLICK",
      bpmDec: "Decrease BPM",
      bpmInc: "Increase BPM",
      downloadWavTitle: "Download 16-bit 44.1kHz Studio WAV",
      downloadMidiTitle: "Export standard MIDI (.mid) for FL Studio / Ableton",
      wav: "WAV",
      midi: "MIDI",
      midiTrackLoaded: "MIDI TRACK LOADED",
      notes: "NOTES",
      timelinePosition: "TIMELINE POSITION",
      dropTitle: "Drop your Piano MIDI File here",
      dropDesc: "Drag & Drop .mid / .midi to test with Napbak Concert Acoustic DSP",
      browseComputer: "OR BROWSE FROM COMPUTER",
      octave: "OCTAVE (Z / X)",
      octaveDown: "Octave Down (Z)",
      octaveUp: "Octave Up (X)",
      reverb: "CONCERT REVERB",
      toneFelt: "TONE / FELT",
      masterVol: "MASTER VOL",
      sustain: "SUSTAIN [SPACE]",
      keyGuideQwerty: "QWERTY: Keys [A - ;]",
      keyGuideBlack: "Black Keys: [W E T Y U O P]",
      keyGuideSustain: "Sustain: [SPACE]",
      vstPillTitle: "NATIVE VST3 PLUGIN FOR FL STUDIO & DAWS",
      vstPillSubtitle: "Windows 64-bit VST3 • 88-Key Acoustic Grand • Reverb & Felt DSP",
      getVst3: "GET VST3",
      errNoNotes: "The uploaded MIDI file contains no piano note events.",
      errParse: "Could not parse MIDI file. Ensure it is a valid SMF 0 or 1 file."
    },
    pianoVst: {
      badge: "STUDIO GRADE VIRTUAL INSTRUMENT",
      heroTitle1: "Bred for ",
      heroAccent1: "translation",
      heroTitle2: ". Voiced for ",
      heroAccent2: "pure emotion",
      heroDesc: "Say goodbye to 80-Gigabyte bloatware libraries that take 5 minutes to load and disappear inside a modern mix. Napbak Concert Grand delivers the velvety warmth, intimate felt damping, and dynamic authority of a world-class concert piano—in a featherweight architecture built for modern production.",
      ram: "RAM Footprint",
      latency: "Latency",
      latencyVal: "0 Samples",
      format: "Format",
      formatVal: "VST3 • AU • SFZ",
      license: "License",
      royaltyFree: "100% Royalty-Free",
      sec1Tag: "01. ACOUSTIC ENGINEERING",
      sec1Title: "Surgical sound design, ",
      sec1TitleAccent: "effortless mix fit",
      c1Title: "Dynamic Velocity Curve",
      c1Desc: "Smooth, non-linear velocity curve modeled after acoustic hammer escapement. Responsive from delicate, whispered pianissimo to striking fortissimos that cut through 808s and heavy drum grooves.",
      c2Title: "Felt Warmth Acoustic Filter",
      c2Desc: "Tired of harsh high-frequency clatter? Our dedicated Warmth circuit attenuates abrasive hammer transients while enriching mid-body fundamentals, instantly dialing in that moody, cinematic felt piano timbre.",
      c3Title: "Stereo Impulse Hall Reverb",
      c3Desc: "Convolution-modeled concert hall space tailored specifically for piano acoustics. The dry signal remains locked at unity gain, guaranteeing the piano never loses punch or body as you add spatial depth.",
      c4Title: "Zero-Bloat C++ Engine",
      c4Desc: "Native C++ architecture built with JUCE and lightweight Decent Sampler framework. Stack 20 instances across your project with near-zero CPU load and load your DAW sessions in under two seconds.",
      c5Title: "Mono-Safe Phase Coherence",
      c5Desc: "Auditioned across phone speakers and club sound systems. Phase-aligned microphone imaging ensures your chords stay punchy and present in mono summing without catastrophic comb filtering.",
      c6Title: "Full 88-Key Expressive Span",
      c6Desc: "From thunderous subsonic bass notes on C0 to crystalline, glassy bell tones at C8. Full octave shifting and comprehensive MIDI CC64 sustain pedal modeling included.",
      sec2Tag: "02. INSTANT DOWNLOAD VAULT",
      sec2Title: "Get the Napbak Concert Grand for your DAW",
      sec2Desc: "No account required. No registration wall. 100% Free and ready to drop into your tracks today.",
      winBadge: "WINDOWS 64-BIT VST3",
      winTitle: "Native Windows VST3 Plugin",
      winDesc: "Compiled C++ VST3 binary for FL Studio, Ableton, Reaper, Cubase, and Studio One on Windows 10/11. Direct standalone installation with custom Napbak skin and onboard controls.",
      winB1: "Drop into Common Files\\VST3\\",
      winB2: "Instant scan in FL Studio, Ableton & Reaper",
      winBtn: "DOWNLOAD WINDOWS VST3",
      uniBadge: "UNIVERSAL MULTI-DAW PACK",
      uniTitle: "Universal Mac & Windows Pack",
      uniDesc: "Includes Decent Sampler .dspreset (with custom UI skin, volume, reverb, warmth & release) plus native .sfz for FL Studio DirectWave and Logic Pro.",
      uniB1: "Works on macOS (Apple Silicon M1-M4 & Intel), Win, Linux",
      uniB2: "1-Click drag & drop onto FL Studio Channel Rack",
      uniBtn: "DOWNLOAD UNIVERSAL PACK (MAC & WIN)",
      sec3Tag: "03. QUICK-START HUB",
      sec3Title: "Installation & setup in 60 seconds",
      sec3Desc: "Select your DAW to see step-by-step instructions and one-click copyable plugin paths.",
      supportedWorkstation: "SUPPORTED WORKSTATION",
      recommended: "Recommended:",
      winPathLabel: "Windows VST3 Folder",
      macPathLabel: "macOS Component / VST3 Folder",
      copyTitle: "Copy path to clipboard",
      sec4Tag: "04. SPECIFICATIONS",
      sec4Title: "Studio grade technical matrix",
      sec5Tag: "05. PRODUCER QUESTIONS",
      sec5Title: "Frequently asked questions",
      footerNote: "Handcrafted acoustic modeling tools for bedroom producers and audio engineers worldwide."
    },
    secretDeal: {
      badge: "⚡ EXCLUSIVE REELS & TIKTOK CREATOR PASS",
      heroTitle: "The Swiss Army Knife Your DAW is Missing",
      heroTitleAccent: "Stop Guessing Your Masters.",
      heroSubtitle: "Integrated EBU R128 LUFS Meter, Dual Reference A/B Crossfader with real-time loudness differential, and Concert Grand Piano VST3/AU — 100% in your browser and on your desktop.",
      previewBadge: "LIVE DSP AUDIO PREVIEW",
      featuresTitle: "EVERYTHING INCLUDED IN YOUR LIFETIME PASS",
      item1Title: "Full EBU R128 LUFS & True Peak Meter",
      item1Desc: "Spotify, Apple Music & YouTube normalization penalty preview + 8 real device speaker acoustic profiles.",
      item1Value: "$49 Value",
      item2Title: "Dual Reference A/B Audio Comparator",
      item2Desc: "Instant seamless crossfader with synchronized playheads & differential loudness metrics (LUFS, True Peak, RMS).",
      item2Value: "$80 Value",
      item3Title: "Napbak Concert Grand Piano VST3 / AU",
      item3Desc: "Acoustic grand piano plugin with 0 samples latency, dynamic velocity sensitivity & zero-phase DSP felt filter for FL Studio & Ableton.",
      item3Value: "$49 Value",
      totalValueLabel: "TOTAL VALUE SEPARATELY:",
      totalValueAmount: "$178 USD",
      officialPriceLabel: "Official Website Price:",
      officialPriceAmount: "$79",
      secretPriceLabel: "Secret Community Pass:",
      secretPriceAmount: "$39",
      secretPricePeriod: "(One-time payment • Lifetime access)",
      savingsBadge: "SAVE $40 TODAY (50% OFF)",
      ctaBtn: "Claim Lifetime Access for $39 ➔",
      ctaSub: "Instant Gumroad checkout • Lifetime updates included • 0 subscriptions",
      guarantee: "14-Day Money-Back Guarantee • Instant License Delivery",
      mobileTitle: "Browsing on mobile? Send it to your PC",
      mobileSubtitle: "Leave your email and we'll immediately send your direct access link + the free Napbak Producer Sound Pack to your inbox so you have it ready when you open your DAW.",
      emailPlaceholder: "your.producer.email@gmail.com",
      sendBtn: "Send Link to My PC",
      sendingBtn: "Sending...",
      successTitle: "Access link & sound pack sent!",
      successDesc: "Check your inbox. We sent your desktop link and sound vault access.",
      faqTitle: "Frequently Asked Questions",
      faq1Q: "Is this compatible with FL Studio, Ableton Live and Logic?",
      faq1A: "Yes! The CTRL suite runs directly in any web browser without installation, and the Napbak Piano VST3/AU loads natively in FL Studio, Ableton Live, Logic Pro, Cubase, and Reaper.",
      faq2Q: "Is this a monthly subscription or a one-time purchase?",
      faq2A: "It is a 100% one-time payment of $39. You get permanent lifetime access to all tools, the VST plugin, and all future updates without monthly recurring fees.",
      faq3Q: "Why should I use this instead of stock meters in my DAW?",
      faq3A: "Stock DAW meters don't let you crossfade seamlessly between two masters without clicking, nor do they calculate exact real-time delta LUFS or simulate how Spotify's compression and iPhone speakers alter your sound.",
      backToStudio: "← Go to Studio Web App"
    }
  },

  es: {
    seo: {
      title: "CTRL by Napbak | Medidor de LUFS Online Gratis, True Peak & Simulador de Altavoces",
      description: "Medidor de LUFS y analizador de mastering online gratis. Mide loudness integrado (EBU R128), True Peak (dBTP), rango dinámico (LRA) y simula cómo suena tu mezcla en Spotify, Apple Music y altavoces de teléfono."
    },
    nav: {
      subtitle: "ANALIZADOR DE LOUDNESS PARA SPOTIFY",
      analyzer: "ANALIZADOR",
      piano: "CONCERT PIANO",
      getPro: "OBTENER PRO",
      proActive: "PRO ACTIVO"
    },
    comparator: {
      badge: "COMPARADOR DE REFERENCIA A/B",
      title: "Compara dos",
      titleAccent: "masters",
      titleSuffix: "lado a lado",
      subtitle: "Suelta tu mezcla en el Slot A y tu referencia en el Slot B. Escucha en tiempo real con el crossfader A/B.",
      slotA: "SLOT A: PISTA / MIX 1",
      slotB: "SLOT B: REFERENCIA / MASTER 2",
      dropA: "ARRASTRA TU PISTA A AQUÍ",
      dropB: "ARRASTRA TU REFERENCIA / PISTA B AQUÍ",
      dropFormats: ".WAV, .MP3, .M4A, .OGG",
      analyzing: "ANALIZANDO LUFS Y PEAKS...",
      playingSync: "REPRODUCIENDO EN SINCRONÍA",
      readyAudition: "LISTO PARA ESCUCHAR",
      matchLufs: "MATCH LUFS",
      soloA: "[ ◄ SOLO PISTA A ]",
      soloB: "[ SOLO PISTA B ► ]",
      listenA: "ESCUCHANDO 100% PISTA A",
      listenB: "ESCUCHANDO 100% PISTA B",
      blend: "MEZCLA A/B",
      dragNotice: "◄ DESLIZA EL FADER PARA ESCUCHAR LA DIFERENCIA EN TIEMPO REAL ►",
      differentialTitle: "RESUMEN DIFERENCIAL (PISTA B vs PISTA A):",
      lufsDiff: "DIFERENCIA DE LOUDNESS",
      peakDiff: "DIFERENCIA DE PEAK",
      dynamicsDiff: "RANGO DINÁMICO",
      louder: "más fuerte (B)",
      quieter: "más bajo (B)",
      higherPeak: "peak más alto",
      lowerPeak: "peak más bajo",
      moreDynamic: "más dinámico",
      moreCompressed: "más comprimido"
    },
    features: {
      tag: "02. ENGINE FEATURES",
      title: "Tecnología de precisión para tus",
      titleAccent: "masters",
      subtitle: "Monitorea el comportamiento de tu mastering según los estándares internacionales de la industria",
      f1_title: "Integrated Loudness (EBU R128)",
      f1_desc: "Calcula el loudness integrado acumulado real de tu track. Evita que las plataformas de streaming compriman tu audio de manera indeseada.",
      f2_title: "True Peak Estimator (4x Oversampling)",
      f2_desc: "Detecta picos inter-sample que causan distorsión por clipping al codificar tu audio digital en formatos comprimidos de streaming (Ogg, AAC, MP3).",
      f3_title: "Dynamic Range (LRA)",
      f3_desc: "Evalúa la diferencia real de volumen en unidades LU entre los momentos más dinámicos y los más suaves para balancear tu mezcla sin aplastarla.",
      f4_title: "Simulación de Plataformas y Altavoces",
      f4_desc: "Escucha en tiempo real cómo la normalización de streaming altera tu volumen, y prueba tu mezcla en altavoces simulados de teléfono, coche y clubes."
    },
    pricing: {
      tag: "03. PLANES & MEMBRESÍA",
      title: "Planes simples y",
      titleAccent: "transparentes",
      subtitle: "Desbloquea el verdadero potencial de tu música sin límites",
      freeTitle: "FREE",
      freeStatus: "(Estado: Activo)",
      monthlyTitle: "PRO",
      monthlyPeriod: "(Mensual)",
      lifetimeTitle: "LIFETIME",
      lifetimePeriod: "(Pago Único)",
      bestValue: "MEJOR OPCIÓN",
      analysesLimitFree: "3 Análisis / Semana",
      analysesUnlimited: "Análisis Ilimitados",
      dynamicsFeature: "Dynamic Range (LRA)",
      clientSideFeature: "Procesamiento 100% en tu Navegador",
      simulationFeature: "Simulación de Plataformas y Altavoces",
      webPianoOnly: "Web Piano Workstation",
      vstBonusIncluded: "🎹 Concert Grand VST Plugin (Mac/Win)",
      freePrice: "$0",
      monthlyPrice: "$9.99",
      monthlySuffix: " / mes",
      lifetimePrice: "$79",
      lifetimeSuffix: "(Pago Único)",
      activeFreeBtn: "Plan Free Activo",
      subscribeMonthlyBtn: "Suscribirse Mensual",
      getLifetimeBtn: "Obtener Pase Lifetime",
      // Upsell Card
      upsellBadge: "HECHO A MANO: MASTERING PROFESIONAL",
      upsellTitle: "¿Cansado de limitadores automáticos? Envía tu mezcla a -6dB y deja que un productor real tome el CTRL.",
      upsellDesc: "EQ personalizada, balance dinámico y oídos humanos entrenados. Entrega en 48 horas.",
      upsellBtn: "[ OBTÉN TU MASTER PRO POR $20 ]"
    },
    ecosystem: {
      tag: "ECOSISTEMA NAPBAK LAB",
      badge: "INCLUIDO EN EL PASE LIFETIME",
      title: "Napbak",
      titleAccent: "Concert Grand Piano",
      desc: "Experimenta un piano acústico Steinway en tu navegador con dynamic velocity, reverb convolutiva de estudio y soporte de teclado MIDI. Incluido como descarga nativa en plugin VST3/AU para FL Studio y Ableton con tu pase CTRL Lifetime.",
      b1: "✓ Workstation Web 100% Gratis",
      b2: "✓ Plug & Play con Teclados MIDI",
      b3: "✓ VST3 / AU para Mac y Windows",
      openBtn: "ABRIR PIANO WORKSTATION"
    },
    faq: {
      tag: "04. PREGUNTAS FRECUENTES (FAQ)",
      title: "Todo lo que necesitas saber sobre",
      titleAccent: "loudness"
    },
    footer: {
      desc: "Medidor offline de loudness EBU R128, estimador de True Peak y simulación de plataformas de streaming para productores.",
      quickLinks: "ENLACES RÁPIDOS",
      contact: "CONTACTO",
      contactBtn: "[ Contacto y Soporte ]"
    },
    piano: {
      backBtn: "← VOLVER AL ANALIZADOR",
      tag: "01.5 INSTRUMENT LAB // REALTIME DSP & RECORDER",
      title: "Napbak",
      titleAccent: "Concert Grand",
      subtitle: "Piano Acústico Gratis • Latencia Cero • Transporte FL Studio y Dropzone MIDI",
      midiReady: "MIDI LISTO (USB AUTO)",
      chord: "ACORDE:",
      tabPlay: "PIANO WORKSTATION",
      tabDrop: "CARGAR MIDI",
      tabLoaded: "MIDI CARGADO",
      rec: "REC",
      recording: "GRABANDO",
      play: "PLAY",
      pause: "PAUSA",
      playMidi: "PLAY MIDI",
      stopReset: "Detener y reiniciar",
      transportTimecode: "TRANSPORTE",
      recTimecode: "CÓDIGO DE REC",
      playhead: "PLAYHEAD",
      click: "CLICK",
      bpmDec: "Disminuir BPM",
      bpmInc: "Aumentar BPM",
      downloadWavTitle: "Descargar WAV de estudio a 16-bit 44.1kHz",
      downloadMidiTitle: "Exportar MIDI estándar (.mid) para FL Studio / Ableton",
      wav: "WAV",
      midi: "MIDI",
      midiTrackLoaded: "PISTA MIDI CARGADA",
      notes: "NOTAS",
      timelinePosition: "POSICIÓN EN TIMELINE",
      dropTitle: "Arrastra tu archivo MIDI de Piano aquí",
      dropDesc: "Arrastra y suelta .mid / .midi para probarlo con el motor DSP acústico de Napbak",
      browseComputer: "O BUSCAR EN TU DISPOSITIVO",
      octave: "OCTAVA (Z / X)",
      octaveDown: "Bajar octava (Z)",
      octaveUp: "Subir octava (X)",
      reverb: "CONCERT REVERB",
      toneFelt: "TONO / FELT",
      masterVol: "VOLUMEN MASTER",
      sustain: "SUSTAIN [ESPACIO]",
      keyGuideQwerty: "Teclas QWERTY: [A - ;]",
      keyGuideBlack: "Teclas Negras: [W E T Y U O P]",
      keyGuideSustain: "Sustain: [ESPACIO]",
      vstPillTitle: "PLUGIN VST3 NATIVO PARA FL STUDIO Y DAWS",
      vstPillSubtitle: "Windows 64-bit VST3 • Piano de 88 Teclas • Reverb y Felt DSP",
      getVst3: "DESCARGAR VST3",
      errNoNotes: "El archivo MIDI subido no contiene notas de piano.",
      errParse: "No se pudo leer el archivo MIDI. Asegúrate de que sea un archivo SMF 0 o 1 válido."
    },
    pianoVst: {
      badge: "INSTRUMENTO VIRTUAL DE ESTUDIO",
      heroTitle1: "Diseñado para ",
      heroAccent1: "traducir",
      heroTitle2: ". Afinado para ",
      heroAccent2: "transmitir emoción pura",
      heroDesc: "Dile adiós a librerías pesadas de 80 GB que tardan 5 minutos en cargar y desaparecen en una mezcla moderna. Napbak Concert Grand entrega la calidez aterciopelada, el amortiguado íntimo de fieltro (felt) y la autoridad dinámica de un piano de concierto mundial, en una arquitectura ultraligera creada para la producción actual.",
      ram: "Consumo de RAM",
      latency: "Latencia",
      latencyVal: "0 Samples",
      format: "Formatos",
      formatVal: "VST3 • AU • SFZ",
      license: "Licencia",
      royaltyFree: "100% Royalty-Free",
      sec1Tag: "01. INGENIERÍA ACÚSTICA",
      sec1Title: "Diseño sonoro quirúrgico, ",
      sec1TitleAccent: "encaje perfecto en la mezcla",
      c1Title: "Curva de Velocity Dinámica",
      c1Desc: "Curva de velocity suave y no lineal modelada sobre el mecanismo de escape de macillos acústicos. Responde desde un pianissimo suave y susurrado hasta fortissimos contundentes que cortan a través de 808s y baterías pesadas.",
      c2Title: "Filtro Acústico Felt Warmth",
      c2Desc: "¿Cansado de frecuencias altas estridentes? Nuestro circuito Warmth atenúa el impacto agresivo del macillo mientras enriquece los armónicos medios, logrando al instante ese timbre cinematográfico e íntimo de piano felt.",
      c3Title: "Stereo Impulse Hall Reverb",
      c3Desc: "Sala de concierto modelada por convolución y ajustada para la acústica del piano. La señal directa (dry) se mantiene fija a ganancia unitaria, garantizando que el piano nunca pierda pegada ni presencia al sumar espacialidad.",
      c4Title: "Motor C++ Cero Bloatware",
      c4Desc: "Arquitectura nativa en C++ desarrollada con JUCE y el framework ultraligero de Decent Sampler. Inserta 20 pistas en tu proyecto con carga de CPU casi nula y abre tus proyectos de DAW en menos de dos segundos.",
      c5Title: "Coherencia de Fase Mono-Safe",
      c5Desc: "Probado rigurosamente en altavoces de teléfono y sistemas de club. La captura estéreo en fase asegura que tus acordes conserven pegada y cuerpo en mono sin filtrado de peine destructivo.",
      c6Title: "Rango Completo de 88 Teclas",
      c6Desc: "Desde notas subsónicas arrolladoras en C0 hasta timbres cristalinos y percusivos en C8. Incluye transposición de octavas y soporte completo para pedales de sustain MIDI CC64.",
      sec2Tag: "02. DESCARGA DIRECTA",
      sec2Title: "Obtén Napbak Concert Grand para tu DAW",
      sec2Desc: "Sin cuentas ni registros obligatorios. 100% Gratis y listo para soltar en tus producciones hoy.",
      winBadge: "WINDOWS 64-BIT VST3",
      winTitle: "Plugin Nativo VST3 para Windows",
      winDesc: "Binario VST3 compilado en C++ para FL Studio, Ableton, Reaper, Cubase y Studio One en Windows 10/11. Instalación limpia con interfaz gráfica personalizada de Napbak y controles integrados.",
      winB1: "Colócalo en Common Files\\VST3\\",
      winB2: "Escaneo instantáneo en FL Studio, Ableton y Reaper",
      winBtn: "DESCARGAR VST3 PARA WINDOWS",
      uniBadge: "PACK MULTI-DAW UNIVERSAL",
      uniTitle: "Pack Universal para Mac y Windows",
      uniDesc: "Incluye preset para Decent Sampler .dspreset (con interfaz exclusiva, volumen, reverb, warmth y release) más archivo .sfz nativo para FL Studio DirectWave y Logic Pro.",
      uniB1: "Compatible con macOS (Apple Silicon M1-M4 e Intel), Windows y Linux",
      uniB2: "Arrastra y suelta directamente al Channel Rack de FL Studio",
      uniBtn: "DESCARGAR PACK UNIVERSAL (MAC & WIN)",
      sec3Tag: "03. GUÍA RÁPIDA DE INSTALACIÓN",
      sec3Title: "Instalación y configuración en 60 segundos",
      sec3Desc: "Selecciona tu DAW para ver instrucciones paso a paso y rutas de plugins copiables en un clic.",
      supportedWorkstation: "ESTACIÓN DE TRABAJO",
      recommended: "Recomendado:",
      winPathLabel: "Carpeta VST3 en Windows",
      macPathLabel: "Carpeta VST3 / Component en macOS",
      copyTitle: "Copiar ruta al portapapeles",
      sec4Tag: "04. ESPECIFICACIONES TÉCNICAS",
      sec4Title: "Matriz técnica de grado de estudio",
      sec5Tag: "05. PREGUNTAS DE PRODUCTORES",
      sec5Title: "Preguntas frecuentes sobre el plugin",
      footerNote: "Herramientas artesanales de modelado acústico para productores de estudio y bedroom producers en todo el mundo."
    },
    secretDeal: {
      badge: "⚡ PASE EXCLUSIVO PARA CREADORES & SEGUIDORES",
      heroTitle: "La navaja suiza que tu DAW no tiene",
      heroTitleAccent: "Deja de adivinar tus masters.",
      heroSubtitle: "Medidor LUFS EBU R128, Comparador Dual Referencia A/B con delta de loudness en tiempo real y Piano Acústico de Concierto VST3/AU — 100% en tu navegador y en tu DAW.",
      previewBadge: "VISTA PREVIA DSP EN VIVO",
      featuresTitle: "TODO LO QUE INCLUYE TU PASE LIFETIME",
      item1Title: "Medidor Completo de LUFS (EBU R128) & True Peak",
      item1Desc: "Simulador de penalización para Spotify, Apple Music y YouTube + 8 modelos acústicos de altavoces reales.",
      item1Value: "Valor: $49",
      item2Title: "Comparador Dual de Referencia A/B",
      item2Desc: "Crossfader continuo en tiempo real con formas de onda sincronizadas y métricas diferenciales de LUFS, True Peak y RMS.",
      item2Value: "Valor: $80",
      item3Title: "Napbak Concert Grand Piano VST3 / AU",
      item3Desc: "Plugin de piano acústico con 0 samples de latencia, respuesta de velocity dinámica y filtro DSP de fieltro (Felt) para FL Studio y Ableton.",
      item3Value: "Valor: $49",
      totalValueLabel: "VALOR TOTAL POR SEPARADO:",
      totalValueAmount: "$178 USD",
      officialPriceLabel: "Precio Oficial en la Web:",
      officialPriceAmount: "$79",
      secretPriceLabel: "Pase Secreto de Comunidad:",
      secretPriceAmount: "$39",
      secretPricePeriod: "(Pago único • Acceso de por vida)",
      savingsBadge: "AHORRAS $40 HOY (50% OFF)",
      ctaBtn: "Obtener Pase Lifetime por $39 ➔",
      ctaSub: "Checkout seguro vía Gumroad • Actualizaciones de por vida • 0 suscripciones",
      guarantee: "Garantía de Satisfacción • Entrega Inmediata de Licencia",
      mobileTitle: "¿Estás en el móvil? Mándalo a tu PC",
      mobileSubtitle: "Déjanos tu correo y te enviamos de inmediato el enlace de acceso directo + el Pack de Sonidos Exclusivo de Napbak para que lo tengas listo cuando abras tu DAW.",
      emailPlaceholder: "tu.email.productor@gmail.com",
      sendBtn: "Enviar Acceso a mi PC",
      sendingBtn: "Enviando...",
      successTitle: "¡Enlace y pack enviados con éxito!",
      successDesc: "Revisa tu bandeja de entrada. Te enviamos el link de escritorio y el acceso al Sound Vault.",
      faqTitle: "Preguntas Frecuentes",
      faq1Q: "¿Es compatible con FL Studio, Ableton Live y Logic Pro?",
      faq1A: "¡Sí! La suite CTRL corre directamente en cualquier navegador web sin instalar nada pesado, y el Napbak Piano VST3/AU carga de forma nativa en FL Studio, Ableton Live, Logic Pro, Cubase y Reaper.",
      faq2Q: "¿Es una suscripción mensual o un solo pago?",
      faq2A: "Es un pago 100% único de $39. Obtienes acceso permanente de por vida a todas las herramientas, al plugin VST y a todas las futuras actualizaciones sin cuotas mensuales.",
      faq3Q: "¿Por qué usar esto en lugar de los medidores nativos de mi DAW?",
      faq3A: "Los medidores nativos de los DAWs no permiten hacer crossfade continuo entre dos masters sin chasquidos, no calculan el delta diferencial de LUFS en vivo, ni simulan en 1 clic la compresión de Spotify o los altavoces de un iPhone.",
      backToStudio: "← Ir a la App del Estudio"
    }
  }
};

export const faqDataByLang = {
  en: [
    {
      question: "My track is -8 LUFS, what does this mean?",
      answer: "Excellent! A master at -8 LUFS is powerful, dense, and competitive. You are in the ideal zone for modern commercial music. When you measure loudness, you'll see that while platforms normalize playback to around -14 LUFS, a master at -8 LUFS retains the energy, body, and punch needed for clubs, festivals, car audio, and download platforms.\n\nThink of major hits from Skrillex (-8 LUFS), the synthwave grooves of The Midnight (-8 to -9 LUFS), or even my own masters as Napbak, where I regularly master at -7, -8, or -9 LUFS to protect transient weight. We prioritize dynamic impact over arbitrary streaming targets to ensure your track sounds massive on any sound system."
    },
    {
      question: "Is -14 LUFS a must for streaming platforms?",
      answer: "Absolutely not! -14 LUFS is simply an alignment target for streaming services, not a creative rule for audio production. Music is meant to be enjoyed across many formats—vinyl, CDs, DJ pools, club sound systems, and direct digital downloads—each requiring its own energy level.\n\nMost modern commercial masters sit comfortably between -6 and -12 LUFS integrated. Artists master louder because the compression and saturation are essential to the sound's character. Focus on mix dynamics and overall translation rather than chasing a single loudness target."
    },
    {
      question: "Why do streaming platforms normalize audio levels?",
      answer: "Normalization is designed to provide a consistent listening experience across playlists, preventing listeners from constantly adjusting their volume. However, normalization is a simple gain reduction, not dynamic compression.\n\nIf your master is loud, it retains all its saturation, transient details, and punch even when turned down by the playback software. Furthermore, many listeners turn normalization off, and it does not apply to physical formats or download sites."
    },
    {
      question: "What's the loudness war and should I care?",
      answer: "The loudness war was the industry-wide race to make tracks as loud as possible to stand out on the radio, peaking in the 2000s. Some albums reached a crushed -4 or -3 LUFS, sacrificing all dynamics. Today, we focus on a much better balance.\n\nModern mastering values both loudness and dynamics. With CTRL by Napbak, you can preview exactly how your mix translates. While a heavy Rammstein track might sit at a dense -6 or -7 LUFS (e.g. 'Du Hast' or 'Deutschland'), a melodic acoustic song might sound best at -12 LUFS. It is entirely genre and vibe dependent."
    },
    {
      question: "How loud are popular songs really?",
      answer: "Usually much louder than the streaming targets! Modern electronic music regularly hits -6 to -8 LUFS, hip-hop averages -8 to -9 LUFS, and rock releases sit between -7 and -9 LUFS. Only highly acoustic, classical, or jazz genres sit closer to -16 or -20 LUFS.\n\nThe average commercial upload is around -10 LUFS. Artists choose loudness for artistic reasons, not platform guidelines. Use CTRL to analyze your favorite reference tracks and check their actual levels to match the energy that fits your vision."
    },
    {
      question: "How can I make my track louder while staying LUFS-safe?",
      answer: "To increase loudness while keeping your mix clear and transient-heavy:\n\n1. Use saturation to add harmonics and increase perceived loudness without raising peak levels.\n2. Apply compression in stages (small gain reduction across multiple plugins in your DAW).\n3. Control the sub-bass frequencies and low-end build-up that eat up headroom.\n4. Always leave a ceiling of -1.0 dBTP on your final limiter to prevent distortion when converting your WAV to lossy streaming formats (AAC/Ogg)."
    }
  ],

  es: [
    {
      question: "Mi track está a -8 LUFS, ¿qué significa esto?",
      answer: "¡Excelente! Un master a -8 LUFS es potente, denso y competitivo. Estás en la zona ideal para la música comercial moderna. Aunque plataformas como Spotify normalizan la reproducción a cerca de -14 LUFS, un master a -8 LUFS retiene toda la energía, pegada y peso necesarios para clubes, festivales, sonido de coche y descargas directas.\n\nPiensa en los éxitos de Skrillex (-8 LUFS), el sonido synthwave de The Midnight (-8 a -9 LUFS), o mis propios masters como Napbak, donde frecuentemente masterizo a -7, -8 o -9 LUFS para proteger el impacto de los transitorios. Priorizamos el impacto dinámico sobre metas arbitrarias de streaming para que tu track suene masivo en cualquier sistema."
    },
    {
      question: "¿Es obligatorio masterizar a -14 LUFS para streaming?",
      answer: "¡Para nada! Los -14 LUFS son solo un punto de referencia de volumen de las plataformas, no una regla creativa de producción musical. La música se disfruta en muchos formatos: vinilo, club sound systems, sets de DJs y archivos WAV/MP3, y cada uno requiere su propio nivel de energía.\n\nLa gran mayoría de los masters comerciales modernos se sitúan entre -6 y -11 LUFS integrados. Se masteriza más fuerte porque la saturación y la compresión aportan el color característico del género. Enfócate en la dinámica de tu mezcla y en cómo traduce en diferentes altavoces, no en obsesionarte con un número fijo."
    },
    {
      question: "¿Por qué las plataformas de streaming normalizan el volumen?",
      answer: "La normalización existe para que el oyente tenga una experiencia auditiva constante en las playlists y no tenga que subir o bajar el volumen entre canción y canción. Sin embargo, la normalización es una simple reducción de ganancia (un fader digital bajando), NO es compresión dinámica.\n\nSi tu master suena potente y tiene buena pegada, conservará toda su saturación y transitorios intactos aunque la aplicación le baje 4 dB de volumen. Además, muchos oyentes y audiófilos desactivan la normalización en los ajustes de Spotify."
    },
    {
      question: "¿Qué fue la 'Guerra del Loudness' y debería importarme?",
      answer: "La guerra del loudness fue la carrera de los años 2000 en la que sellos e ingenieros intentaban que sus temas sonaran más fuertes que los demás en la radio, llegando a extremos de -4 o -3 LUFS y destruyendo toda la dinámica del tema. Hoy en día buscamos un balance mucho más musical.\n\nEl mastering actual premia tanto el volumen como la pegada de la batería. Con CTRL puedes comprobar exactamente cómo traduce tu mezcla. Mientras un tema de Trap o EDM puede sonar impecable a -7 u -8 LUFS, una balada acústica o R&B brillará mejor a -12 LUFS. Todo depende del estilo y la intención artística."
    },
    {
      question: "¿A qué volumen suenan realmente las canciones famosas?",
      answer: "¡Mucho más fuerte que las recomendaciones de streaming! El género urbano, trap y reggaeton comercial promedia entre -7 y -9 LUFS. La electrónica pesada suele estar entre -6 y -8 LUFS, y el rock/pop moderno entre -8 y -10 LUFS. Solo la música clásica, el jazz puro o acústicos vintage rondan los -14 a -18 LUFS.\n\nEl promedio de lanzamientos comerciales exitosos ronda los -9 LUFS. Los productores eligen el volumen por estética musical, no por lo que diga un algoritmo. Usa CTRL para analizar tus temas de referencia favoritos y ver sus niveles reales."
    },
    {
      question: "¿Cómo hago que mi track suene más fuerte sin distorsionar?",
      answer: "Para ganar volumen percibido manteniendo tu mezcla limpia y con transitorios definidos:\n\n1. Usa saturación armónica (clipping suave o cinta) para engrosar el sonido sin disparar los picos en dB.\n2. Aplica compresión en etapas sutiles en lugar de forzar un solo compresor al final.\n3. Controla las frecuencias sub-bajas innecesarias por debajo de 30Hz en tus instrumentos para no robar headroom al limitador.\n4. Deja siempre un ceiling de -1.0 dBTP en tu limitador final para prevenir distorsión por True Peak cuando las plataformas conviertan tu WAV a formatos comprimidos (AAC / Ogg)."
    }
  ]
};

export const dawGuidesByLang = {
  en: [
    {
      id: 'flstudio',
      name: 'FL STUDIO',
      version: 'FL 20 / 21 / 24+',
      recommendedMethod: 'DirectWave (SFZ) or Native VST3',
      steps: [
        {
          title: 'Option A: Instant Drag & Drop (DirectWave - 100% Free)',
          desc: 'Unzip the Universal Pack. Drag the "Napbak_Concert_Grand.sfz" file directly onto the FL Studio Channel Rack. DirectWave loads the samples instantly with zero configuration.'
        },
        {
          title: 'Option B: Native VST3 Plugin',
          desc: 'Download the Windows VST3 binary. Extract "Napbak Concert Grand.vst3" and place it inside your Common VST3 directory. Open FL Studio > Manage Plugins > Find Installed Plugins.'
        },
        {
          title: 'Automation & Piano Roll Ready',
          desc: 'Works with FL Studio Velocity curve, slide notes, native automation clips, and the Fruity Limiter / Soundgoodizer chain seamlessly.'
        }
      ],
      pathWin: 'C:\\Program Files\\Common Files\\VST3\\',
      pathMac: '~/Library/Audio/Plug-Ins/VST3/'
    },
    {
      id: 'ableton',
      name: 'ABLETON LIVE',
      version: 'Live 10 / 11 / 12 (Suite / Standard / Intro)',
      recommendedMethod: 'Decent Sampler (VST3 / AU)',
      steps: [
        {
          title: '1. Load Decent Sampler into a MIDI Track',
          desc: 'Download the free Decent Sampler plugin. Insert Decent Sampler onto any MIDI track in Ableton Live.'
        },
        {
          title: '2. Drag & Drop the Preset File',
          desc: 'Drag "Napbak_Concert_Grand.dspreset" from the Universal Pack straight into the Decent Sampler interface (or click File -> Load).'
        },
        {
          title: '3. Ableton Push & Macro Integration',
          desc: 'Map Volume, Warmth, Reverb, and Release to your Ableton Rack Macros for live performance and automation recording.'
        }
      ],
      pathWin: 'C:\\Program Files\\Common Files\\VST3\\',
      pathMac: '/Library/Audio/Plug-Ins/VST3/'
    },
    {
      id: 'logic',
      name: 'LOGIC PRO / GARAGEBAND',
      version: 'Logic Pro X / 11 & GarageBand (macOS)',
      recommendedMethod: 'Audio Units (AU) via Decent Sampler',
      steps: [
        {
          title: '1. Free Decent Sampler AU Host',
          desc: 'Install the free Decent Sampler Audio Unit (AU) component on your Mac (fully optimized for Apple Silicon M1/M2/M3/M4 & Intel).'
        },
        {
          title: '2. Open AU Instrument in Logic',
          desc: 'Create an Instrument Track > AU Instruments > Decent Samples > Decent Sampler > Stereo.'
        },
        {
          title: '3. Load the Napbak Acoustic Model',
          desc: 'Open "Napbak_Concert_Grand.dspreset". Enjoy native CoreAudio low-latency performance and macOS MIDI pedal integration.'
        }
      ],
      pathWin: 'N/A (macOS Exclusive)',
      pathMac: '/Library/Audio/Plug-Ins/Components/'
    },
    {
      id: 'reaper',
      name: 'REAPER / CUBASE / STUDIO ONE',
      version: 'All Modern 64-bit DAWs',
      recommendedMethod: 'VST3 (Win/Mac) or SFZ Player',
      steps: [
        {
          title: '1. Standard VST3 Location',
          desc: 'Place the VST3 bundle into your system VST3 directory. All modern DAWs monitor this universal path automatically.'
        },
        {
          title: '2. Rescan Plugin Database',
          desc: 'In Cubase (Studio > VST Plug-in Manager) or Reaper (Preferences > VST > Rescan), trigger a quick plugin refresh.'
        },
        {
          title: '3. Insert & Play',
          desc: 'Insert "Napbak Concert Grand" as a virtual instrument. Zero sample-loading time, instant session loading.'
        }
      ],
      pathWin: 'C:\\Program Files\\Common Files\\VST3\\',
      pathMac: '/Library/Audio/Plug-Ins/VST3/'
    }
  ],
  es: [
    {
      id: 'flstudio',
      name: 'FL STUDIO',
      version: 'FL 20 / 21 / 24+',
      recommendedMethod: 'DirectWave (SFZ) o VST3 Nativo',
      steps: [
        {
          title: 'Opción A: Arrastrar y Soltar Instantáneo (DirectWave - 100% Gratis)',
          desc: 'Descomprime el Pack Universal. Arrastra el archivo "Napbak_Concert_Grand.sfz" directamente al Channel Rack de FL Studio. DirectWave carga las muestras de inmediato sin necesidad de configuración.'
        },
        {
          title: 'Opción B: Plugin VST3 Nativo',
          desc: 'Descarga el binario VST3 para Windows. Extrae "Napbak Concert Grand.vst3" y colócalo dentro de tu directorio común de VST3. Abre FL Studio > Manage Plugins > Find Installed Plugins.'
        },
        {
          title: 'Listo para Piano Roll y Automatización',
          desc: 'Funciona nativamente con las curvas de Velocity de FL Studio, slide notes, clips de automatización y la cadena Fruity Limiter / Soundgoodizer sin fisuras.'
        }
      ],
      pathWin: 'C:\\Program Files\\Common Files\\VST3\\',
      pathMac: '~/Library/Audio/Plug-Ins/VST3/'
    },
    {
      id: 'ableton',
      name: 'ABLETON LIVE',
      version: 'Live 10 / 11 / 12 (Suite / Standard / Intro)',
      recommendedMethod: 'Decent Sampler (VST3 / AU)',
      steps: [
        {
          title: '1. Carga Decent Sampler en una pista MIDI',
          desc: 'Descarga el plugin gratuito Decent Sampler. Insértalo en cualquier pista MIDI dentro de Ableton Live.'
        },
        {
          title: '2. Arrastra y Suelta el Preset',
          desc: 'Arrastra "Napbak_Concert_Grand.dspreset" del Pack Universal directo a la interfaz de Decent Sampler (o haz clic en File -> Load).'
        },
        {
          title: '3. Integración con Ableton Push y Macros',
          desc: 'Mapea Volumen, Warmth, Reverb y Release a los Macros de tu Instrument Rack para tocar en vivo o grabar automatizaciones.'
        }
      ],
      pathWin: 'C:\\Program Files\\Common Files\\VST3\\',
      pathMac: '/Library/Audio/Plug-Ins/VST3/'
    },
    {
      id: 'logic',
      name: 'LOGIC PRO / GARAGEBAND',
      version: 'Logic Pro X / 11 y GarageBand (macOS)',
      recommendedMethod: 'Audio Units (AU) vía Decent Sampler',
      steps: [
        {
          title: '1. Host AU Gratuito Decent Sampler',
          desc: 'Instala el componente Audio Unit (AU) gratuito de Decent Sampler en tu Mac (optimizado para Apple Silicon M1/M2/M3/M4 e Intel).'
        },
        {
          title: '2. Abre el Instrumento AU en Logic',
          desc: 'Crea una Pista de Instrumento > AU Instruments > Decent Samples > Decent Sampler > Stereo.'
        },
        {
          title: '3. Carga el Modelo Acústico Napbak',
          desc: 'Abre "Napbak_Concert_Grand.dspreset". Disfruta del rendimiento de bajísima latencia de CoreAudio y la integración del pedal MIDI de macOS.'
        }
      ],
      pathWin: 'N/A (Exclusivo de macOS)',
      pathMac: '/Library/Audio/Plug-Ins/Components/'
    },
    {
      id: 'reaper',
      name: 'REAPER / CUBASE / STUDIO ONE',
      version: 'Todos los DAWs modernos de 64 bits',
      recommendedMethod: 'VST3 (Win/Mac) o Reproductor SFZ',
      steps: [
        {
          title: '1. Ubicación Estándar VST3',
          desc: 'Coloca el archivo VST3 en el directorio VST3 de tu sistema. Todos los DAWs modernos monitorean esta ruta universal automáticamente.'
        },
        {
          title: '2. Re-escanear Base de Datos de Plugins',
          desc: 'En Cubase (Studio > VST Plug-in Manager) o Reaper (Preferences > VST > Rescan), ejecuta un refresco rápido de plugins.'
        },
        {
          title: '3. Insertar y Tocar',
          desc: 'Inserta "Napbak Concert Grand" como instrumento virtual. Cero tiempo de espera de carga de muestras, apertura instantánea de sesión.'
        }
      ],
      pathWin: 'C:\\Program Files\\Common Files\\VST3\\',
      pathMac: '/Library/Audio/Plug-Ins/VST3/'
    }
  ]
};

export const specsDataByLang = {
  en: [
    { label: 'Acoustic Model', val: 'Concert Grand Piano (Steinway Soundboard Voicing)' },
    { label: 'Engine Architecture', val: 'Hybrid Sample-Modeling & Algorithmic DSP' },
    { label: 'Plugin Formats', val: 'VST3 (64-bit), AU, AAX (Decent Sampler), SFZ' },
    { label: 'Operating Systems', val: 'Windows 10 / 11 (64-bit), macOS 10.13+ (Apple Silicon & Intel)' },
    { label: 'Sample Rates Supported', val: '44.1 kHz, 48 kHz, 88.2 kHz, 96 kHz, 192 kHz (32-bit Float)' },
    { label: 'Memory (RAM) Footprint', val: '~45 MB loaded (98% lighter than traditional 4GB sample packs)' },
    { label: 'Latency & Performance', val: '0 Samples (Sample-accurate zero-latency real-time performance)' },
    { label: 'Dynamic Layers', val: 'Expressive Multi-Velocity with Smooth Dampening Interpolation' },
    { label: 'Onboard DSP Processors', val: 'Master Gain, Warmth Felt Filter, Convolving Hall Reverb, Release' },
    { label: 'MIDI Control', val: 'CC64 (Sustain Pedal), CC1 (Modulation), CC7 (Master Gain), Pitch Bend' },
    { label: 'License & Rights', val: '100% Free & Royalty-Free for Commercial Streaming & Music Releases' }
  ],
  es: [
    { label: 'Modelo Acústico', val: 'Piano de Concierto Grand (Voicing armónico estilo Steinway)' },
    { label: 'Arquitectura del Motor', val: 'Modelado Híbrido de Muestras y DSP Algorítmico' },
    { label: 'Formatos de Plugin', val: 'VST3 (64-bit), AU, AAX (Decent Sampler), SFZ' },
    { label: 'Sistemas Operativos', val: 'Windows 10 / 11 (64-bit), macOS 10.13+ (Apple Silicon e Intel)' },
    { label: 'Frecuencias de Muestreo', val: '44.1 kHz, 48 kHz, 88.2 kHz, 96 kHz, 192 kHz (32-bit Float)' },
    { label: 'Consumo de Memoria RAM', val: '~45 MB cargado (98% más ligero que librerías pesadas de 4GB)' },
    { label: 'Latencia y Rendimiento', val: '0 Samples (Respuesta inmediata en tiempo real a muestra exacta)' },
    { label: 'Capas Dinámicas', val: 'Multi-Velocity Expresiva con interpolación suave de apagado' },
    { label: 'Procesadores DSP Integrados', val: 'Master Gain, Filtro Warmth Felt, Reverb Hall por Convolución, Release' },
    { label: 'Control MIDI', val: 'CC64 (Pedal Sustain), CC1 (Modulación), CC7 (Volumen Master), Pitch Bend' },
    { label: 'Licencia y Derechos', val: '100% Gratis y Royalty-Free para lanzamientos comerciales y streaming' }
  ]
};

export const vstFaqsByLang = {
  en: [
    {
      q: 'Do I need iLok, serial numbers or an internet activation?',
      a: 'None whatsoever. We believe nothing should stand between your creative impulse and your DAW. Napbak Concert Grand is 100% installer-free, dongle-free, and DRM-free. You download it, drop it into your plugin folder, and it works immediately.'
    },
    {
      q: 'Why is the file size so small (~4MB) compared to 80GB piano libraries?',
      a: 'Traditional libraries record 50 layers of room noise, mechanical creaks, and microphone positions you rarely need in a modern mix, which hogs your SSD and slows session loading. Napbak uses an intelligent hybrid engine: surgically sampled attack transients coupled with procedural harmonic resonance and algorithmic convolution reverb. The result is pure acoustic clarity that sits effortlessly in dense mixes without lagging your DAW.'
    },
    {
      q: 'How does the "Warmth" control work?',
      a: 'The Warmth parameter is modeled after vintage felt-piano damping systems. When set to maximum (100%), it simulates a thick piece of wool felt placed between the hammers and the strings, softening aggressive high frequencies and bringing out rich, intimate fundamental tones beloved in neoclassical and lo-fi productions.'
    },
    {
      q: 'Can I release music commercially on Spotify, Apple Music, and YouTube?',
      a: 'Yes, 100% royalty-free. Whether you are producing a billboard-charting pop hit, an indie film score, or background music for YouTube videos, you retain complete ownership of your recordings.'
    },
    {
      q: 'Does it support external MIDI keyboards and sustain pedals?',
      a: 'Absolutely. Both the online web workstation and the downloadable VST plugins natively respond to MIDI keyboard velocity, pitch wheels, and standard hardware sustain pedals (MIDI CC64).'
    }
  ],
  es: [
    {
      q: '¿Necesito iLok, números de serie o activación por internet?',
      a: 'Ninguno en absoluto. Creemos que nada debe interponerse entre tu inspiración creativa y tu DAW. Napbak Concert Grand es 100% libre de instaladores invasivos, llaves dongle y sistemas DRM. Lo descargas, lo colocas en tu carpeta de plugins y suena al instante.'
    },
    {
      q: '¿Por qué el archivo es tan ligero (~4MB) frente a librerías de 80GB?',
      a: 'Las librerías tradicionales graban 50 capas de ruido de sala, crujidos mecánicos y múltiples micrófonos que rara vez necesitas en una mezcla moderna, saturando tu SSD y ralentizando la carga del DAW. Napbak utiliza un motor híbrido inteligente: transitorios de ataque muestreados quirúrgicamente combinados con resonancia armónica procedural y reverb algorítmica de convolución. El resultado es un sonido acústico claro que encaja en mezclas densas sin consumir CPU.'
    },
    {
      q: '¿Cómo funciona el control "Warmth" (Felt)?',
      a: 'El parámetro Warmth está modelado a partir de los sistemas acústicos de amortiguación con fieltro (felt piano). Al subirlo, simula una tira de fieltro de lana colocada entre los macillos y las cuerdas, suavizando los agudos cortantes y resaltando los tonos fundamentales cálidos e íntimos, ideales para producciones neoclásicas, trap melódico o lo-fi.'
    },
    {
      q: '¿Puedo lanzar música comercialmente en Spotify, Apple Music y YouTube?',
      a: 'Sí, es 100% Royalty-Free. Ya sea que estés produciendo un hit comercial, la banda sonora de un cortometraje o música instrumental para YouTube, conservas el 100% de los derechos de autor de tus grabaciones.'
    },
    {
      q: '¿Es compatible con teclados MIDI externos y pedales de sustain?',
      a: 'Totalmente. Tanto la workstation web en el navegador como los plugins VST descargables responden de forma nativa al velocity de tu teclado MIDI, ruedas de pitch bend y pedales de sustain físicos estándar (MIDI CC64).'
    }
  ]
};
