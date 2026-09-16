# BUILDA — Esperienza Interattiva Non-Convenzionale
# Prompt Guide per Claude Code (VSCode)

---

## FILOSOFIA

Questo NON è un sito web tradizionale. Non ci sono header, navbar, bottoni classici, sezioni impilate.
Questo è un **ambiente digitale interattivo** — un'esperienza immersiva dove l'utente
esplora, scopre e interagisce. Pensa a: un museo digitale, un universo navigabile,
un portfolio che si comporta come un videogioco d'arte.

Riferimenti estetici: Active Theory, Resn, Immersive Garden, Lusion, Aristide Benoist,
i siti più sperimentali di Awwwards (SOTD/SOTY).

---

## Come usare questa guida

Copia ogni sezione IN ORDINE su Claude Code in VSCode.
Ogni sezione dipende dalle precedenti. Non saltare sezioni.

> **Stack:** Next.js 14 (App Router) + TypeScript + React Three Fiber + Drei +
> @react-three/postprocessing + GSAP (ScrollTrigger, SplitText, CustomEase) +
> Lenis + Tailwind CSS + custom GLSL shaders

---

## SEZIONE 0 — Setup progetto

```
Crea un progetto Next.js 14 con App Router e TypeScript.

Stack da installare:
- tailwindcss, postcss, autoprefixer
- gsap (con ScrollTrigger, SplitText come plugin)
- @studio-freight/lenis (smooth scroll)
- three, @react-three/fiber, @react-three/drei, @react-three/postprocessing
- glsl-noise (o includi simplex noise inline nei shader)
- framer-motion (per AnimatePresence nelle transizioni)

Struttura:
/app
  layout.tsx
  page.tsx
/components
  /experience (i "mondi" — le scene principali)
    IntroPortal.tsx
    UniverseScene.tsx
    ServiceOrbs.tsx
    ProjectTunnel.tsx
    AboutDNA.tsx
    ContactField.tsx
  /canvas
    MainCanvas.tsx (il canvas Three.js globale unico)
    ShaderBackground.tsx
    ParticleField.tsx
    CameraRig.tsx
  /interface (overlay 2D minimale)
    NavigationWhisper.tsx
    ScrollProgress.tsx
    CursorEntity.tsx
    LoadingRitual.tsx
    SoundToggle.tsx
  /dom (testo HTML sovrapposto al canvas)
    FloatingLabel.tsx
    RevealText.tsx
    MorphingTitle.tsx
/shaders
  background.vert
  background.frag
  blob.vert
  blob.frag
  particles.vert
  particles.frag
  tunnel.vert
  tunnel.frag
/lib
  store.ts (Zustand per stato globale: sezione attiva, progress, mouse, scroll)
  gsap-config.ts
  constants.ts
/hooks
  useScrollProgress.ts
  useMouse.ts
  useLerpedValue.ts
  useMediaQuery.ts

Installa anche zustand per stato globale reattivo.

Configura Tailwind con:
- Colori: void (#07070a), ash (#16161a), smoke (#2a2a2e), mist (rgba(255,255,255,0.06)),
  phantom (#6366f1), glow (#a78bfa), pulse (#ec4899)
- Font: "Neue Montreal" (o Syne come fallback) per display, "Suisse Intl" (o Inter fallback) per body
- Animazioni custom nel config

NON scrivere ancora i componenti. Solo struttura, configurazione, installazione.
```

---

## SEZIONE 1 — Canvas globale e shader background

```
Crea il sistema di rendering principale.

L'INTERO SITO è costruito su un <Canvas> Three.js fisso a schermo intero
con contenuto HTML sovrapposto in modo strategico. Il canvas non è un decorazione:
È IL SITO. L'HTML galleggia sopra come un layer trasparente.

FILE: /components/canvas/MainCanvas.tsx

- Un singolo <Canvas> React Three Fiber fisso (position: fixed, inset: 0)
- frameloop="always", dpr={[1, 2]}, gl={{ antialias: true, alpha: true }}
- Camera prospettica (fov: 45, near: 0.1, far: 1000)
- Contiene tutte le scene 3D come figli
- Usa <Suspense> per lazy loading
- Il canvas occupa sempre il 100% del viewport

FILE: /components/canvas/ShaderBackground.tsx

Lo sfondo NON è CSS. È un fullscreen quad con un fragment shader custom.

Vertex shader: un semplice plane che copre lo schermo.
Fragment shader:
- Gradiente diagonale (135°) da grigio cenere (#1e1e22) a nero assoluto (#07070a)
- Sovrapposto: 3-4 "blob" di colore sfocato che si muovono lentamente
  (usa simplex noise 3D con coordinate UV + time come input)
  Colori dei blob: viola scuro (#2d1b69, opacità 0.06), indigo (#312e81, opacità 0.04),
  magenta scuro (#4a1942, opacità 0.03)
  I blob si muovono con velocità diverse (time * 0.1, time * 0.07, time * 0.13)
- Sovrapposto: grain/noise statico (random per pixel, opacità 0.03-0.04) che si aggiorna ogni frame
  per dare texture cinematica
- Sovrapposto: leggera vignette (bordi più scuri)
- Uniforms: uTime (float), uMouse (vec2, normalizzato 0-1), uScroll (float, 0-1 progresso pagina)
  - Lo scroll influenza leggermente il colore dominante (shift hue sottile)
  - Il mouse influenza la posizione dei blob (attrazione leggera)

Questo shader crea uno sfondo vivo e respirante, non uno sfondo statico.
Il background deve sembrare uno spazio profondo e vivo, non una pagina web.

FILE: /components/canvas/ParticleField.tsx

Un campo di particelle GLOBALE che attraversa tutto il sito:
- 300-500 particelle (Points geometry in Three.js)
- Ogni particella ha:
  - Posizione random nello spazio 3D (distribuite in un volume largo)
  - Dimensione variabile (1px - 8px)
  - Opacità bassa (0.05 - 0.2)
  - Colore: bianco o leggerissimo viola
- Vertex shader custom:
  - Le particelle si muovono in un flusso lento diagonale (simula una corrente)
  - Velocità variabile per profondità (parallasse Z)
  - Leggera oscillazione sinusoidale (sine wave su X e Y)
  - Lo scroll della pagina le sposta in direzione opposta (effetto parallasse profondo)
  - Il mouse crea una zona di "repulsione" leggera: le particelle vicine al cursore
    si allontanano dolcemente (force field)
- Fragment shader:
  - Ogni particella è un cerchio sfumato (soft circle con smoothstep)
  - Le particelle grandi sono più sfocate (simulano bokeh / profondità di campo)
- Le particelle sono SEMPRE visibili, attraverso tutte le "sezioni"
  Sono il tessuto connettivo dell'esperienza.

Performance: usa BufferGeometry con attributi custom, aggiorna solo le uniforms per frame.
Mobile: riduci a 100-150 particelle, disabilita il mouse repulsion.
```

---

## SEZIONE 2 — Camera Rig e navigazione non-lineare

```
L'utente NON scrolla tra sezioni tradizionali.
Lo SCROLL muove la CAMERA attraverso uno spazio 3D.
È come navigare in un ambiente: lo scroll è il tuo veicolo.

FILE: /components/canvas/CameraRig.tsx

Concetto: il sito è un percorso nello spazio 3D. La camera si muove lungo una curva
(CatmullRomCurve3 o path custom) mentre l'utente scrolla.

Implementazione:
- Definisci un percorso 3D con 6 punti chiave (uno per ogni "mondo"):
  1. Intro Portal (z: 0)
  2. Universe Scene — chi siamo (z: -30)
  3. Service Orbs — servizi (z: -70)
  4. Project Tunnel — lavori (z: -120)
  5. About DNA — about (z: -170)
  6. Contact Field — contatto (z: -210)
  Il percorso non è solo lineare su Z: include curve, leggere rotazioni,
  cambi di altezza (Y) per dare varietà cinematica
- Lo scroll Lenis (0-1 normalizzato) mappa la posizione della camera lungo questa curva
- La camera guarda sempre verso un punto "lookAt" che si muove con leggero anticipo
- Transizioni fluide con lerp (fattore 0.05-0.08) per evitare movimenti bruschi
- Il mouse influenza la rotazione della camera (±3 gradi max, lerp lento)
  Effetto: guardare leggermente intorno muovendo il mouse

Usa Zustand store per:
- scrollProgress (0-1)
- activeWorld (0-5, basato su scrollProgress)
- mouseNormalized ({x, y} da -1 a 1)
- isTransitioning (boolean)

Il contenuto HTML (testi, label) appare e scompare in sincronia con la posizione
della camera (basato su scrollProgress ranges).

FILE: /hooks/useScrollProgress.ts
- Integra Lenis scroll con Zustand
- Normalizza lo scroll da 0 a 1
- Calcola activeWorld basato su ranges (0-0.15 = mondo 0, 0.15-0.3 = mondo 1, etc.)
- Espone anche velocity per effetti basati sulla velocità di scroll

FILE: /app/page.tsx
- Il contenuto scrollabile è un div alto ~600vh (abbastanza spazio per navigare)
- Il <MainCanvas> è position: fixed sotto
- Il contenuto HTML overlay è position: fixed, pointer-events: none (tranne elementi interattivi)
- Il div scrollabile è trasparente e serve solo a generare lo scroll event

Navigazione:
NON c'è una navbar tradizionale. Invece:
- In basso a destra: 6 piccoli cerchi/punti verticali che indicano la sezione attiva
  (quello attivo è più grande e luminoso). Cliccabili per saltare alle sezioni.
  Animati con GSAP, stile minimalissimo.
- A sinistra: il nome della sezione corrente appare e scompare con un'animazione
  di morphing/reveal (lettere che si dissolvono e ricompongono)
```

---

## SEZIONE 3 — Cursor Entity e Loading Ritual

```
FILE: /components/interface/CursorEntity.tsx

Il cursore NON è un cerchio che segue il mouse. È un'ENTITÀ viva.

Concetto: il cursore è una piccola forma organica che si muove, respira,
e REAGISCE al contesto.

Implementazione:
- Elemento base: un SVG o Canvas di ~40x40px che segue il mouse con lerp
- La forma è un cerchio che si DEFORMA continuamente con noise:
  usa 8-12 punti su un cerchio, ognuno spostato radialmente da simplex noise
  (basato su angolo + time). Il risultato è una forma organica che pulsa.
  Disegnata con un SVG path o Canvas bezier curves.
- Colore: bianco con opacità 0.7, mix-blend-mode: difference
- STATI del cursore (transizioni fluide tra stati):
  1. "default" — piccola forma organica (~20px), respira dolcemente
  2. "hover" — su elementi interattivi: si espande a ~60px, diventa più trasparente,
     la deformazione aumenta (più "eccitato")
  3. "text" — su blocchi di testo: si trasforma in una linea verticale sottile (text cursor)
  4. "drag" — durante lo scroll attivo: si allunga nella direzione dello scroll
  5. "explore" — su aree 3D interattive: emette 3-4 piccole particelle che orbitano
  6. "magnetic" — vicino a elementi cliccabili: viene attirato (posizione lerp verso il centro dell'elemento)
- Trail: il cursore lascia una scia di 5-8 copie sbiadite della forma, ritardate,
  che seguono con delay crescente (ogni copia ha opacità decrescente: 0.3, 0.15, 0.08...)
  Questo crea un effetto cometa/serpente ipnotico.
- Su mobile: il cursore non esiste, ovviamente. Sostituito da feedback tattili sugli elementi.

FILE: /components/interface/LoadingRitual.tsx

Il loading screen NON è una barra di progresso. È un RITUALE di ingresso.

Sequenza (orchestrata con GSAP timeline):
1. Schermo nero totale (0.5s)
2. Una singola linea orizzontale sottilissima appare al centro dello schermo
   e si espande lentamente da 0 a 100% width (1.5s, ease: power3.inOut)
3. La linea si "rompe" al centro e le due metà si allontanano verso l'alto e il basso,
   rivelando il logo "BUILDA" in mezzo
   Il logo appare lettera per lettera con effetto glitch/scramble:
   prima caratteri random, poi si stabilizzano nelle lettere corrette (come decriptazione)
   Font: Syne, weight 800, grande (8vw)
4. Il logo pulsa una volta con un flash di luce viola
5. Tutto il loading screen si dissolve con un effetto di particelle:
   il testo e le linee si frammentano in particelle che volano via
   (o un semplice fade out elegante con clip-path circolare che si espande)
6. L'esperienza inizia — la camera è al punto 0, il primo mondo si rivela

Durata totale: ~4 secondi. Deve sembrare un rituale, non un'attesa.
Precarica i font e le texture durante il ritual.
```

---

## SEZIONE 4 — Mondo 0: Intro Portal

```
FILE: /components/experience/IntroPortal.tsx

ScrollProgress range: 0 — 0.12

Questo è il primo "mondo" che l'utente vede dopo il loading.
La camera è ferma, frontale. L'utente vede un portale d'ingresso.

SCENA 3D:
- Un grande anello/torus al centro della scena (raggio 3, tube 0.02)
  - Materiale: wireframe luminoso, colore indigo (#6366f1), emissive
  - Ruota lentamente sull'asse Z
  - Pulse: scala oscillante (1.0 — 1.03) con sine
- All'interno dell'anello: un piano circolare con un shader che simula
  un "portale" — un vortice di noise che si muove verso il centro
  (come un buco nero silenzioso). Colori: nero al centro, sfumature viola/indigo ai bordi
- Intorno all'anello: 20-30 piccole sfere orbitanti a distanze diverse
  (particelle che fluttuano in orbite ellittiche lente)
  Materiale: piccole, luminose, bianche, leggero bloom

OVERLAY HTML (centrato):
- Il testo appare man mano che l'utente arriva (scrollProgress 0 — 0.05):
  - "BUILDA" in grande (Syne, 12vw, weight 800)
    Animazione: ogni lettera appare con un effetto di "materializzazione"
    (opacity 0 + blur(20px) → opacity 1 + blur(0), stagger 0.08s per lettera)
  - Sotto: "We don't build websites. We build experiences." in piccolo
    (Inter, 16px, weight 300, opacità 0.5)
    Appare con fade-up dopo il titolo

- Quando scrollProgress supera 0.06, il testo inizia a dissolversi
  (fade out + leggero scale up, come se volasse verso la camera)
- Il portale si "attiva": lo shader del vortice accelera,
  l'anello brilla di più, e la camera inizia a muoversi "dentro" il portale
  verso il prossimo mondo

Transizione: la camera attraversa il portale (effetto tunnel brevissimo,
flash di luce, poi si apre il Mondo 1)

Tutto deve comunicare: "stai per entrare in qualcosa di speciale"
```

---

## SEZIONE 5 — Mondo 1: Universe Scene (Chi Siamo)

```
FILE: /components/experience/UniverseScene.tsx

ScrollProgress range: 0.12 — 0.30

Dopo il portale, la camera emerge in uno SPAZIO APERTO.
L'utente si trova in un micro-universo: uno spazio nero con elementi che fluttuano.

SCENA 3D:
- La camera è ora in un punto più arretrato, guarda avanti
- Nello spazio ci sono 6-8 SFERE di dimensioni diverse distribuite in profondità
  Ogni sfera rappresenta un concetto core di BUILDA:
  - Sfera 1: "Intelligence" — viola, media, shader noise organico
  - Sfera 2: "Automation" — ciano, piccola, shader pulsante geometrico
  - Sfera 3: "Design" — rosa, media, shader gradient fluido
  - Sfera 4: "Engineering" — bianca, piccola, wireframe
  - Sfere extra: decorative, molto piccole, sparse

- Ogni sfera:
  - Ha un materiale shader unico (non tutte uguali)
  - Fluttua con movimento sinusoidale indipendente (ampiezza e frequenza diverse)
  - Ruota su assi diversi
  - Ha un piccolo label HTML che fluttua vicino (il nome del concetto)
    Il label è semi-trasparente e appare solo quando la sfera è "attiva"
  - Reagisce al mouse: se il cursore si avvicina (raycast), la sfera
    si illumina, si espande leggermente, e il label diventa opaco
  - Post-processing: ogni sfera ha un leggero glow (bloom selettivo)

- Connessioni: linee sottili e semi-trasparenti collegano alcune sfere tra loro
  (come una costellazione). Le linee pulsano leggermente.

OVERLAY HTML:
- Man mano che la camera avanza (scrollProgress 0.15 — 0.25):
  - Appare il testo a sinistra dello schermo:
    Riga 1: "We exist at" (piccolo, Inter, opacità 0.4)
    Riga 2: "the intersection" (grande, Syne, weight 700)
    Riga 3: "of AI & craft" (grande, gradiente animato)
  - Il testo è fisso nello spazio dello schermo ma si anima con la camera
  - Entra con RevealText (split chars, stagger)
  - Esce con dissolve quando scrollProgress > 0.27

- Opzionale: numeri/stats che appaiono vicino alle sfere quando si interagisce
  (es: hover sulla sfera "Engineering" → appare "150+ projects")

L'effetto totale: l'utente fluttua in un universo di competenze,
può esplorare con il mouse mentre scorre. Contemplativo e wow.
```

---

## SEZIONE 6 — Mondo 2: Service Orbs (Servizi)

```
FILE: /components/experience/ServiceOrbs.tsx

ScrollProgress range: 0.30 — 0.52

La camera avanza e arriva in una zona dove 4 GRANDI OGGETTI 3D
sono disposti nello spazio, ognuno rappresenta un servizio.

SCENA 3D:
- 4 oggetti principali disposti in un arco o in profondità con offset laterale:

  1. AI — Una SFERA ORGANICA (blob con vertex shader noise)
     Colore: viola profondo con riflessi, pulsante, "respira"
     Shader: vertex displacement con 3 octave di simplex noise,
     ampiezza che oscilla. Fragment: gradient noise viola/indigo.
     Dimensione: grande (raggio 2)

  2. Automation — Un SISTEMA DI ANELLI concentrici che ruotano su assi diversi
     3-4 torus di spessore diverso, tutti wireframe o semi-trasparenti
     Colore: ciano/teal, emissivo
     Ruotano a velocità diverse, creando un effetto gyroscopio
     Dimensione: media

  3. SaaS — Un CUBO che si SCOMPONE: un cubo fatto di piccoli cubi
     (instanced mesh, ~100-200 cubi piccoli disposti in una griglia 3D)
     Normalmente formano un cubo perfetto, ma respirano:
     ogni piccolo cubo oscilla leggermente fuori dalla griglia
     Colore: bianco/grigio con bordi luminosi
     Quando attivo: i cubi si espandono nello spazio (esplodono dolcemente)
     e poi ricompongono

  4. Web & Software — Una STRUTTURA DNA / HELIX
     Due spirali intrecciate fatte di sfere piccole collegate da linee
     Ruota sull'asse Y, le sfere pulsano in sequenza (wave animation)
     Colore: rosa/magenta, luminoso

- Ogni oggetto:
  - Appare quando la camera si avvicina (fade in + scale da 0.5 a 1)
  - Reagisce al mouse: rotazione aggiuntiva, deformazione, cambio di stato
  - Quando il cursor è sopra (raycast):
    l'oggetto "si attiva": animazione più intensa, glow aumenta
    Il cursore entra in stato "explore" (particelle orbitanti)
    Appare il testo descrittivo (vedi overlay)

OVERLAY HTML:
- Il testo NON è in una colonna laterale. Appare NELLO SPAZIO, vicino all'oggetto attivo.
- Per ogni servizio, quando attivato (hover o scroll range):
  - Titolo: Syne, grande, bianco — appare con effetto typewriter/scramble
  - Descrizione: Inter, piccolo, opacità 0.5 — fade in ritardato
  - Tags: piccole capsule glass che appaiono con stagger dal basso
- Quando si passa al prossimo oggetto: il testo precedente dissolve, il nuovo appare
- Transizione tra servizi: fluida, basata sullo scrollProgress
  (ogni servizio ha un sub-range: 0.30-0.36, 0.36-0.42, 0.42-0.48, 0.48-0.52)

Servizi:
1. "Artificial Intelligence" — Custom AI solutions. From LLMs to computer vision.
   Tags: LLM, Computer Vision, NLP, Predictive Models
2. "Automation" — Systems that scale without friction. End-to-end.
   Tags: Workflow, RPA, API Orchestration, CI/CD
3. "SaaS Products" — From zero to market. Built for growth.
   Tags: Product Strategy, Cloud, Subscriptions, Analytics
4. "Web & Software" — Pixel-perfect. Performance-obsessed.
   Tags: React/Next.js, Full-Stack, Mobile, DevOps

L'esperienza: l'utente naviga tra sculture digitali viventi,
ognuna è un servizio. Non una lista, un UNIVERSO di competenze.
```

---

## SEZIONE 7 — Mondo 3: Project Tunnel (Lavori)

```
FILE: /components/experience/ProjectTunnel.tsx

ScrollProgress range: 0.52 — 0.75

La camera entra in un TUNNEL. È il momento più cinematico.

SCENA 3D — IL TUNNEL:
- Geometria: un TubeGeometry generato da una curva che si estende in profondità (asse Z)
  La curva ha leggere ondulazioni (non perfettamente dritta)
  Raggio del tubo: ~8 unità (la camera è al centro)
- Materiale del tunnel:
  - Semi-trasparente, wireframe o con un pattern shader
  - Shader: linee che scorrono lungo il tunnel nella direzione opposta al movimento
    della camera (effetto velocità/warp)
    Le linee sono sottilissime, luminose (indigo/viola/bianco), su sfondo trasparente nero
  - Alternativa: il tunnel è fatto di anelli (torus piccoli) disposti lungo la curva,
    wireframe, che il camera attraversa — effetto ipnotico

- Lungo il tunnel, in 4 punti, ci sono i PROGETTI:
  Ogni progetto è rappresentato da un "portale laterale" o una "finestra" nel tunnel.

  Per ogni progetto:
  - Un piano (PlaneGeometry) inclinato che mostra un gradiente radiale col colore del progetto
    (simula una finestra/schermo nel tunnel)
  - Dimensione: ~4x6 unità
  - Il piano ha un shader con:
    - Il colore del progetto come base
    - Noise animato che simula un'immagine astratta in movimento
    - Un leggero effetto di rifrazione/distorsione
  - Quando la camera è allineata (scrollProgress nel sub-range del progetto):
    il piano si illumina, si avvicina leggermente, il glow aumenta

OVERLAY HTML — I PROGETTI:
- Quando la camera passa davanti a ogni "finestra":
  - Il titolo del progetto appare GRANDE al centro dello schermo
    Syne, clamp(48px, 10vw, 120px), weight 800
    Effetto: le lettere appaiono una per una con scramble/decode effect
  - Sotto: categoria + anno in Space Mono, piccolo, opacità 0.4
  - Il testo ha un leggero effetto parallasse (si muove più lentamente dello scroll)
  - Transizione out: le lettere si dissolvono/scramble di nuovo prima del progetto successivo

- Sub-ranges:
  Progetto 1 "NeuralFlow" (AI Platform, 2025, #6366f1): 0.54 — 0.60
  Progetto 2 "AutoScale" (Automation SaaS, 2025, #06b6d4): 0.60 — 0.66
  Progetto 3 "DataPulse" (Analytics, 2024, #8b5cf6): 0.66 — 0.72
  Progetto 4 "SynthOS" (OS, 2024, #ec4899): 0.72 — 0.75

INTERAZIONE:
- Se l'utente clicca su un progetto (o il cursore è in stato "explore" sulla finestra):
  potrebbe aprirsi un pannello modale con più dettagli (opzionale, fase avanzata)
- L'effetto del tunnel crea urgenza visiva e meraviglia: l'utente sta volando
  attraverso il portfolio

Effetto totale: stai attraversando un wormhole di creatività,
ogni progetto è una finestra su un altro universo.
```

---

## SEZIONE 8 — Mondo 4: About DNA

```
FILE: /components/experience/AboutDNA.tsx

ScrollProgress range: 0.75 — 0.88

La camera esce dal tunnel e arriva in uno spazio aperto e calmo.
L'atmosfera cambia: più intima, più umana.

SCENA 3D:
- Al centro: una struttura a DOPPIA ELICA (DNA) verticale, grande
  - Fatta di 2 spirali di sfere (40 sfere per spirale)
  - Sfere collegate da linee orizzontali (come i "pioli" del DNA)
  - Materiale sfere: bianco luminoso, piccole, bloom leggero
  - Materiale linee: sottilissime, opacità 0.15
  - Rotazione lenta sull'asse Y
  - Le sfere pulsano in sequenza (wave animation che sale dal basso)
  - Colore sfere: alternanza bianco / viola tenue

  Significato metaforico: il DNA di BUILDA, la doppia elica
  di tecnologia + design che forma il loro codice genetico.

- Intorno: particelle più dense e lente (aggiunta locale alle particelle globali)
  che creano un'atmosfera nebulosa

- Man mano che si scrolla, il DNA si "srotola" leggermente
  (le spirali si allargano, le connessioni si estendono)

OVERLAY HTML:
- I testi appaiono in punti diversi dello schermo (non centrati, asimmetria):

  ScrollProgress 0.76 — 0.80:
  - Grande testo: "Built different."
    Syne, 10vw, weight 800, appare con char-by-char reveal
    Posizione: leggermente a sinistra

  ScrollProgress 0.80 — 0.85:
  - Paragrafo che appare con fade-in linea per linea:
    "We're a digital studio where artificial intelligence meets exceptional craft.
    Every algorithm is purposeful. Every pixel is intentional.
    We partner with ambitious companies to build what's next."
    Inter, 18px, weight 300, opacità 0.5, max-width 500px

  ScrollProgress 0.83 — 0.88:
  - STATS che appaiono come numeri fluttuanti nello spazio (non in una griglia):
    Ogni numero ha una posizione diversa sullo schermo
    Il numero fa un count-up animato quando appare
    "150+" — "Projects"
    "98%" — "Retention"
    "40+" — "Team"
    "12" — "Countries"
    Font numeri: Syne, grandissimo (8vw), gradiente animato
    Font label: Space Mono, 10px, opacità 0.3
    Ogni stat appare con timing diverso (stagger 0.3s)
    E si dissolve quando si esce dal range
```

---

## SEZIONE 9 — Mondo 5: Contact Field (Finale)

```
FILE: /components/experience/ContactField.tsx

ScrollProgress range: 0.88 — 1.0

L'ultima "stanza". L'atmosfera è magnetica, intima, potente.
Qui l'utente deve sentire il desiderio di contattare BUILDA.

SCENA 3D:
- La camera rallenta e si ferma quasi del tutto
- Al centro della scena: un CAMPO DI FORZA visivo
  - Un grande cerchio di particelle (200+) disposte in un disco orizzontale
    che ruota lentamente
  - Le particelle si muovono verso il centro e poi spiraleggiano verso l'esterno
    (effetto galassia / campo magnetico visto dall'alto)
  - Colore: gradient dal bianco al centro → viola → indigo ai bordi
  - Le particelle reagiscono fortemente al mouse:
    quando il cursore si muove, le particelle vengono attratte/respinte
    creando pattern dinamici. L'utente può "giocare" con il campo.
  - Bloom intenso al centro (luce calda/viola)

- Dietro il disco: il portale iniziale (torus + shader) riappare in lontananza,
  creando un loop visivo (l'inizio è anche la fine)

OVERLAY HTML:
- ScrollProgress 0.89 — 0.92:
  Piccolo testo: "Ready?" — Syne, opacità 0.3, appare e scompare con pulse

- ScrollProgress 0.92 — 0.98:
  Titolo principale su 2 righe, centrato:
  "Let's create" (bianco)
  "something extraordinary." (gradiente animato viola)
  Syne, weight 800, clamp(36px, 8vw, 100px)
  Animazione: char-by-char con effetto onda (ogni carattere ha un leggero delay Y)

- Sotto il titolo:
  - Email "hello@builda.studio" — cliccabile, inter 18px, opacità 0.4
    Hover: l'email si illumina, il cursore entra in stato magnetic,
    le particelle del campo si agitano
  - Un elemento interattivo (non un bottone classico!):
    Un cerchio/orb interattivo con la scritta "Start" al centro
    Quando l'utente ci passa sopra: l'orb si espande, le particelle convergono verso di esso,
    un glow si intensifica. Al click: animazione di esplosione controllata
    (le particelle si espandono a raggiera) e poi redirect o apertura modale contatto.
    L'orb è implementato come un gruppo Three.js + HTML overlay.

- ScrollProgress 0.98 — 1.0:
  Footer minimale che appare con fade:
  "© 2025 BUILDA" a sinistra
  Social icons (solo testo: Tw · Li · Dr · Gh) a destra
  Space Mono, 11px, opacità 0.2
  Nessuna decorazione. Quasi invisibile. Eleganza totale.
```

---

## SEZIONE 10 — Navigation, Scroll Progress e Audio

```
FILE: /components/interface/NavigationWhisper.tsx

La navigazione è un SUSSURRO, non un grido.

- Position: fixed, destra, centrata verticalmente
- 6 indicatori (uno per mondo): piccoli cerchi di 6px
- Il cerchio attivo è 10px, bianco, ha un ring di pulse attorno (animazione)
- Gli altri sono 6px, opacità 0.2
- Hover su un cerchio: appare il nome del mondo con fade-in a sinistra del cerchio
  (tooltip delicato, Space Mono, 10px)
- Click: smooth scroll al range corrispondente
- I cerchi sono collegati da una linea verticale sottilissima (opacità 0.05)
- L'indicatore attivo si sposta fluidamente (non salta)

FILE: /components/interface/ScrollProgress.tsx

- Position: fixed, bottom, full width
- Una linea orizzontale di 1px in basso allo schermo
- Si riempie da sinistra a destra con il progresso dello scroll
- Colore: gradiente indigo → viola → magenta (mappa il colore ai mondi)
- Opacità: 0.3 (sottilissima, quasi impercettibile)
- Height: 2px, nessun glow o decorazione

FILE: /components/interface/SoundToggle.tsx (opzionale ma alto impatto)

- Position: fixed, bottom-left
- Un piccolo cerchio (24px) con un'icona di onda sonora (3 barrette animate)
- Al click: attiva/disattiva ambient sound
- Sound: un drone ambient sottilissimo (bassa frequenza, quasi subliminale)
  che cambia leggermente tono/texture per ogni mondo
  Usa Web Audio API con un oscillatore + filtro + gain molto basso
  Oppure un file audio ambient loop (royalty free)
- Di default: OFF (non auto-play mai)
- Le barrette dell'icona si animano quando il suono è attivo
- Questo eleva l'esperienza da "sito" a "installazione digitale"
  ed è un forte differenziatore su Awwwards

FILE: /components/dom/MorphingTitle.tsx

- Componente per il nome della sezione corrente (position: fixed, bottom-left o top-left)
- Mostra il nome del mondo attivo: "Portal", "Universe", "Services", "Projects", "DNA", "Contact"
- Quando cambia mondo: effetto di morphing tra le due parole
  Implementazione: le lettere della parola vecchia si scramblano
  (diventano caratteri random per 0.3s) e poi si stabilizzano nella nuova parola
  Se le parole hanno lunghezze diverse, le lettere extra appaiono/scompaiono
  Usa GSAP per animare il contenuto testuale di ogni <span>
- Font: Space Mono, 11px, opacità 0.25, uppercase, letter-spacing largo
- Sottilissimo, quasi subliminale
```

---

## SEZIONE 11 — Responsive, Performance e Polish

```
Applica queste migliorie finali a TUTTO il progetto:

RESPONSIVE / MOBILE (< 768px):
- Il canvas 3D si semplifica DRASTICAMENTE:
  - IntroPortal: solo l'anello e il vortice, meno particelle orbitanti
  - UniverseScene: solo 3 sfere invece di 8, no linee di connessione
  - ServiceOrbs: gli oggetti diventano più semplici (meno poligoni, no post-processing)
    Oppure: sostituisci con forme 2D animate in canvas (shader semplificati)
  - ProjectTunnel: il tunnel diventa un semplice scroll con piani che passano
    (no tube geometry)
  - AboutDNA: DNA con meno sfere (20 per spirale)
  - ContactField: meno particelle (80), no mouse interaction
- dpr={[1, 1.5]} su mobile (non 2)
- Disattiva post-processing (bloom, chromatic aberration)
- Il CursorEntity non esiste su touch devices
- La NavigationWhisper diventa horizontal in basso
- I testi overlay si ridimensionano con clamp() e si riposizionano (centrati)
- Il SoundToggle funziona uguale
- Touch: swipe verticale per scrollare (Lenis gestisce nativamente)
- Testa su iPhone Safari e Android Chrome

PERFORMANCE:
- Tutte le scene Three.js caricate con next/dynamic({ ssr: false })
- Usa <Suspense> con fallback gradient per ogni scena
- Le geometrie sono cachate (useMemo)
- Le uniforms sono aggiornate via ref (non re-render React)
- Textures: compresse, dimensioni minime necessarie
- requestAnimationFrame: un solo loop nel canvas, non multipli
- Monitora con r3f-perf in development, rimuovi in production
- Target: 60fps su MacBook Air M1, 30fps+ su mobile medio
- Lighthouse: punteggio performance 85+ (difficile con WebGL, ma necessario per Awwwards)

DETTAGLI DI POLISH:
- Tutte le transizioni tra mondi devono essere FLUIDE — nessun pop, nessuno stacco
  Usa lerp ovunque. I valori non devono mai "saltare".
- ::selection → background: rgba(99, 102, 241, 0.3)
- Scrollbar: nascosta (overflow: hidden sul body, Lenis gestisce lo scroll)
- Tutti gli useEffect con GSAP: cleanup con kill() nel return
- Tutti i componenti Three.js: dispose() delle geometrie e materiali nel return
- prefers-reduced-motion: se attivo, disattiva TUTTE le animazioni,
  mostra il contenuto statico con layout semplificato (fallback accessibile)
- Meta tags: og:image con screenshot del sito, og:title, og:description
- Favicon: un piccolo icosaedro viola su sfondo scuro

ESTETICA FINALE:
- Il sito deve avere un RITMO: momenti di intensità (tunnel, portale)
  alternati a momenti di respiro (universe, about)
- I colori devono evolvere: dal grigio all'ingresso, al viola nei servizi,
  al multicolore nei progetti, al bianco nel contatto. Un arco narrativo cromatico.
- Il suono (se attivo) segue lo stesso arco: più profondo all'inizio,
  più luminoso alla fine
- Ogni interazione deve avere feedback: il mondo REAGISCE alla presenza dell'utente.
  Mai passivo, sempre vivo.
```

---

## SEZIONE 12 — Store globale e Hooks

```
FILE: /lib/store.ts (Zustand)

import { create } from 'zustand'

interface BuildaStore {
  // Scroll
  scrollProgress: number         // 0-1
  scrollVelocity: number         // velocità attuale
  activeWorld: number            // 0-5
  setScrollProgress: (v: number) => void
  setScrollVelocity: (v: number) => void

  // Mouse
  mouse: { x: number; y: number }       // pixel position
  mouseNormalized: { x: number; y: number }  // -1 to 1
  setMouse: (x: number, y: number) => void

  // Cursor
  cursorState: 'default' | 'hover' | 'text' | 'drag' | 'explore' | 'magnetic'
  setCursorState: (state: string) => void

  // UI
  isLoaded: boolean
  isSoundOn: boolean
  isMobile: boolean
  setLoaded: (v: boolean) => void
  toggleSound: () => void
  setMobile: (v: boolean) => void

  // Active content
  activeService: number | null   // 0-3 o null
  activeProject: number | null   // 0-3 o null
  setActiveService: (i: number | null) => void
  setActiveProject: (i: number | null) => void
}

Implementa lo store con queste proprietà.
activeWorld si calcola automaticamente da scrollProgress:
  0.00 - 0.12 → 0 (Portal)
  0.12 - 0.30 → 1 (Universe)
  0.30 - 0.52 → 2 (Services)
  0.52 - 0.75 → 3 (Projects)
  0.75 - 0.88 → 4 (About)
  0.88 - 1.00 → 5 (Contact)

FILE: /hooks/useMouse.ts
- Traccia posizione mouse con listener globale
- Calcola mouseNormalized (-1 a 1)
- Aggiorna lo store Zustand
- Throttled a 60fps (requestAnimationFrame)

FILE: /hooks/useLerpedValue.ts
- Hook generico che lerpa un valore verso un target
- Usa useFrame di R3F (se dentro canvas) o requestAnimationFrame (se fuori)
- Parametri: target, factor (default 0.08)
- Restituisce il valore lerpato via ref

FILE: /hooks/useScrollProgress.ts
- Integra Lenis con lo store
- Calcola scrollProgress normalizzato
- Calcola scrollVelocity
- Integra con GSAP ScrollTrigger (ScrollTrigger.update su ogni frame Lenis)

FILE: /hooks/useMediaQuery.ts
- Detect breakpoint mobile (< 768px)
- Detect prefers-reduced-motion
- Aggiorna lo store

Tutti gli hooks devono avere cleanup nel return dell'useEffect.
```

---

## NOTE FINALI

```
REGOLE ASSOLUTE PER TUTTO IL PROGETTO:

1. NON CI SONO HEADER, NAVBAR TRADIZIONALI, FOOTER PROMINENTI, BOTTONI CONVENZIONALI.
   Ogni elemento di interfaccia è minimale, quasi invisibile, scoperto dall'utente.

2. Il sito è un PERCORSO, non una pagina. Lo scroll è un viaggio nello spazio.

3. Ogni interazione ha feedback. Il mondo è VIVO e reagisce alla presenza dell'utente.

4. Il contenuto testuale è RARO e PREZIOSO. Poche parole, scelte con cura,
   animate con rispetto. Non muri di testo.

5. Le transizioni tra mondi sono FLUIDE. Mai stacchi, mai pop, mai salti.

6. Qualità > Quantità. Un shader fatto bene vale più di 10 effetti mediocri.

7. Il target estetico: Immersive Garden incontra Apple — cinematico, sobrio, ipnotico.

8. "use client" su ogni componente che usa hooks, events, Three.js, GSAP.

9. Tutti gli useEffect con GSAP/Three.js devono avere cleanup nel return.

10. Il sito deve essere deployabile su Vercel senza configurazioni speciali.

ORDINE DI IMPLEMENTAZIONE CONSIGLIATO:
Sezione 0 → 12 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11
(Setup → Store → Canvas → Camera → Loader → Mondi in ordine → Nav → Polish)
```
