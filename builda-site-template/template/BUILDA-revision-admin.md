# BUILDA — Revisione Stilistica + Admin Panel
# CONTINUAZIONE dei prompt base (BUILDA-immersive-prompts.md + supplement)
# Copia queste fasi IN ORDINE su Claude Code DOPO aver completato il setup base

---

## PREMESSA — Cambio di direzione stilistica

Questa revisione SOSTITUISCE le scelte estetiche dei prompt precedenti.
Il sito passa da un'estetica "spazio cosmico viola" a un'estetica
EDITORIALE ARCHITETTONICA: colori neutri caldi, pattern geometrici ordinati,
spazi rigorosi ma vivi, screenshot reali come contenuto visivo principale.

Pensa a: un portfolio cartaceo di uno studio di architettura giapponese,
digitalizzato con animazioni cinematiche. Ogni elemento ha una ragione,
nulla è decorativo per il solo gusto di esserlo.

PALETTE COLORI (sostituisce TUTTE le scelte cromatiche precedenti):
- #1E2224 → "void" — lo sfondo principale, quasi nero ma con calore
- #393E41 → "carbon" — sfondo secondario, bordi pesanti, testi secondari
- #D3D0CB → "stone" — testo primario, elementi in primo piano
- #E7E5DF → "chalk" — accent caldo, titoli importanti, hover states

Regole cromatiche:
- NON ci sono più viola, indigo, ciano, rosa. Zero colori saturi.
- L'unico "colore" è la LUCE: elementi chalk (#E7E5DF) su sfondo void (#1E2224)
  creano contrasto sufficiente senza saturazione.
- I gradienti sono tra void e carbon (scuro→meno scuro), mai con colori.
- I glow/bloom sono in bianco caldo (#E7E5DF a bassa opacità), mai colorati.
- I bordi sono in carbon (#393E41) a opacità variabile (0.3 — 0.8).
- Il gradiente animato sui testi speciali ora è:
  linear-gradient(135deg, #D3D0CB, #E7E5DF, #D3D0CB) con background-size 300% e animation.

---

## FASE 1 — Revisione sfondo e pattern ordinato

```
SOSTITUISCI il ParticleField e lo ShaderBackground con un sistema nuovo.

FILE: /components/canvas/ShaderBackground.tsx (RISCRIVI)

SFONDO:
- Gradiente diagonale (135°) da #1E2224 in alto a sinistra a #121416 in basso a destra
  (ancora più scuro del void, quasi nero puro)
- Sovrapposto: un sottile noise grain a opacità 0.025 (quasi invisibile,
  dà texture materica come carta ruvida)
- Niente blob colorati, niente noise animato. Lo sfondo è SOLIDO e materico.
  La bellezza sta nella texture, non nel movimento.

FILE: /components/canvas/GridPattern.tsx (NUOVO — sostituisce ParticleField)

Al posto delle particelle random, un PATTERN GEOMETRICO ORDINATO a griglia.

Concetto: una griglia regolare di punti (dots) che copre tutto lo schermo.
I punti sono perfettamente allineati in righe e colonne, come carta millimetrata.
Ma la griglia è VIVA: reagisce allo scroll e al mouse con deformazioni ordinate.

Implementazione con Canvas 2D (più leggero di Three.js per questo effetto):
- Canvas fullscreen, position: fixed, z-index: 1 (sopra sfondo, sotto contenuto)
- Griglia di punti: spacing 40px tra i punti (sia X che Y)
- Ogni punto: cerchio di 1.5px di raggio
- Colore base: #393E41 a opacità 0.25 (appena visibili)

ANIMAZIONI DELLA GRIGLIA:

1. Parallasse allo scroll:
   Lo scroll sposta la griglia verso l'alto a velocità 0.3x rispetto al contenuto.
   I punti scorrono lentamente, l'effetto è di profondità sotto il contenuto.

2. Onda al mouse (effetto RIPPLE ordinato):
   Quando il mouse si muove, i punti VICINI al cursore (entro raggio 200px) si spostano
   RADIALMENTE verso l'esterno di 3-8px (proporzionale alla vicinanza).
   I punti più vicini si spostano di più, quelli al bordo del raggio quasi nulla.
   Lo spostamento è calcolato come: direction_from_mouse * (1 - distance/radius) * maxDisplacement
   Quando il mouse si allontana, i punti TORNANO alla posizione originale
   con un'animazione ease-out lenta (lerp fattore 0.06).
   L'effetto: il mouse crea un "buco" nella griglia che si richiude dolcemente.

3. Punti che si illuminano allo scroll:
   Man mano che scrollProgress avanza, una "onda di luce" attraversa la griglia:
   i punti nella zona dello scroll corrente aumentano opacità a 0.5 e dimensione a 2.5px,
   poi tornano normali. L'onda si muove dall'alto verso il basso seguendo lo scroll.
   Il range dell'onda è ~200px di altezza. Colore dei punti illuminati: #D3D0CB.

4. Intersezioni speciali:
   Ogni 5 righe e 5 colonne (quindi ogni 200px), il punto di intersezione
   è leggermente più grande (2.5px) e più luminoso (opacità 0.35).
   Questo crea un sotto-pattern a griglia più larga dentro la griglia.

5. Linee di connessione (opzionale, molto sottili):
   Ogni 200px (le intersezioni speciali) sono connesse da linee orizzontali e verticali
   di 0.5px, colore #393E41 opacità 0.08. Creano una griglia secondaria quasi invisibile.
   Le linee NON reagiscono al mouse, restano statiche come riferimento.

Performance:
- Calcola solo i punti visibili nel viewport (+ margine 100px)
- Usa requestAnimationFrame a 60fps
- Il calcolo del ripple del mouse usa solo i punti nel raggio (non tutti)
- Mobile: aumenta lo spacing a 50px (meno punti), disabilita il ripple del mouse
```

---

## FASE 2 — Screenshot placeholder al posto degli oggetti 3D

```
CONCETTO FONDAMENTALE:
Non ci sono più oggetti 3D astratti (blob, gyroscope, cubo esplosivo, DNA).
Al loro posto ci sono FRAME/PLACEHOLDER rettangolari che simuleranno screenshot
di prodotti SaaS reali. Per ora sono placeholder con gradiente e testo,
ma la struttura è pronta per ricevere immagini vere.

FILE: /components/ui/ScreenFrame.tsx (NUOVO)

Un componente riutilizzabile che mostra un frame stile "browser window"
o "device mockup" elegante e minimale.

Props:
- title: string (nome del progetto/prodotto)
- category: string (es: "AI Platform", "Dashboard")
- imageSrc?: string (path dell'immagine — se vuoto, mostra placeholder)
- aspectRatio: "16/9" | "4/3" | "9/16" (default "16/9")
- variant: "browser" | "device" | "minimal" (stile del frame)
- isActive: boolean (se true, animazioni di entrata attive)

DESIGN DEL FRAME:

Variante "browser":
- Rettangolo con border-radius: 12px
- Bordo: 1px solid #393E41 con il gradiente sfumato (più luminoso in alto a sinistra)
- Barra superiore (32px di altezza):
  - Background: #1E2224
  - 3 cerchietti a sinistra (8px, spaziati 8px): colore #393E41
    (simulano i bottoni di una finestra browser, ma monocromatici)
  - Al centro della barra: il titolo del progetto, Space Mono 10px, #D3D0CB opacità 0.5
  - Bordo inferiore della barra: 1px solid #393E41 opacità 0.3
- Area contenuto sotto la barra:
  - Se imageSrc è fornito: <img> o <Image> che riempie l'area (object-fit: cover)
  - Se imageSrc è vuoto (PLACEHOLDER):
    - Background: gradiente sottile da #1E2224 a #252829
    - Al centro: il testo "Screenshot" in Space Mono, 14px, #393E41 opacità 0.3
    - Sotto: la categoria in Space Mono, 10px, #393E41 opacità 0.2
    - Opzionale: un pattern di linee diagonali sottilissime (#393E41 opacità 0.05)
      che riempie l'area come texture placeholder
- Ombra esterna: 0 20px 60px rgba(0,0,0,0.3) — crea profondità

Variante "device":
- Simile a browser ma senza la barra superiore
- Border-radius: 16px
- Un bordo più spesso (2px) color #393E41
- Padding interno: 4px (simula la cornice di un tablet/monitor)

Variante "minimal":
- Solo il contenuto, border-radius: 8px
- Bordo: 1px solid #393E41 opacità 0.4
- Nessuna barra, nessun cerchietto. Puro e pulito.

ANIMAZIONI:
- Entrata (quando isActive diventa true):
  - Il frame appare con: opacity 0→1, translateY(40px)→0, scale(0.95)→1
  - Durata: 0.8s, ease: power3.out
  - L'ombra si intensifica durante l'entrata (da 0 a piena)
- Hover:
  - Il frame si solleva: translateY(-8px), ombra si espande
  - Il bordo diventa più luminoso (#D3D0CB opacità 0.2)
  - Transizione: 0.4s ease-out
- Parallasse:
  - Il frame si muove a velocità diversa rispetto al testo adiacente
  - Accetta un prop parallaxSpeed per controllare la velocità
```

---

## FASE 3 — Scrollytelling rivisto e cinematico

```
RISCRIVI LA STRUTTURA NARRATIVA DEL SITO.

Il sito non è più un viaggio nello spazio 3D con camera che si muove.
È uno SCROLLYTELLING VERTICALE con sezioni che si svelano, si sovrappongono,
e si trasformano mentre l'utente scrolla. Più controllato, più narrativo.

La camera Three.js non si muove più lungo un percorso curvo.
Il canvas Three.js resta come layer di sfondo per la griglia e per eventuali
effetti, ma il contenuto primario è HTML/CSS animato con GSAP ScrollTrigger.

STRUTTURA NARRATIVA (7 atti):

FILE: /app/page.tsx (RISCRIVI)

Il page.tsx contiene un wrapper scrollabile con 7 sezioni.
Ogni sezione ha un'altezza specifica e un comportamento unico di scrollytelling.

=== ATTO 1: APERTURA (0vh — 100vh) ===
Componente: <HeroAct />
La prima cosa che l'utente vede. Schermo pieno.
- Il titolo "BUILDA" è centrato, enorme (15vw), Syne weight 800, colore #E7E5DF
  Appare con scramble/decode effect (dal loading)
- Sotto: "We build the future of software." in Inter, 18px, weight 300, #D3D0CB opacità 0.6
- La griglia di punti (GridPattern) è visibile sotto il testo
- In basso: una freccia minimale (due linee a V) che pulsa lentamente
  + "Scroll" in Space Mono 9px, #393E41
- Mentre l'utente scrolla (0-100vh):
  il titolo si COMPRIME verticalmente (scaleY da 1 a 0.3) e sale fuori dallo schermo
  il sottotitolo sfuma. La griglia accelera leggermente.
  ScrollTrigger: pin, scrub: true

=== ATTO 2: MANIFESTO (100vh — 300vh) ===
Componente: <ManifestoAct />
Altezza: 200vh (molto spazio per respirare)
Uno SCROLLYTELLING TESTUALE puro: frasi che appaiono e scompaiono una alla volta
mentre l'utente scrolla. Ogni frase occupa l'intero schermo.

Sequenza di frasi (centrate, Syne, clamp(32px, 5vw, 64px), weight 600, #E7E5DF):
1. "Every great product" (100vh — 140vh, appare e sfuma)
2. "starts with a question." (140vh — 180vh)
3. "What if software could think?" (180vh — 220vh, "think" ha un leggero glow)
4. "What if automation felt invisible?" (220vh — 260vh)
5. "We answered." (260vh — 300vh, pausa più lunga, peso visivo forte)

Ogni frase:
- Appare: opacity 0→1, translateY(30px)→0, blur(8px)→0 — effetto "emerge dalla nebbia"
- Scompare: opacity 1→0, translateY(0)→-30px, blur(0)→8px
- Durata in scroll: 40vh per frase (20vh per apparire, 20vh per scomparire)
- ScrollTrigger: scrub: true, trigger su ogni frase

Effetto sulla griglia: durante il manifesto, i punti della griglia pulsano
leggermente in sincronia con l'apparizione delle frasi (opacità che oscilla).

=== ATTO 3: SERVIZI (300vh — 600vh) ===
Componente: <ServicesAct />
Altezza: 300vh

Il sistema dei servizi con tipografia gigante sovrapposta (dalla Sezione C del supplement).
Ma con la nuova palette:
- Le parole grandi sono in #E7E5DF (chalk)
- Le parole inattive sono in #393E41 (carbon)
- I tag delle pillole hanno bordo #393E41 e testo #D3D0CB
- Il glow di hover NON è colorato: è un leggero aumento di luminosità
  (text-shadow: 0 0 40px rgba(227, 229, 223, 0.15))

AGGIUNTA: quando un servizio è attivo, a destra del testo appare un ScreenFrame
variant="minimal" con un placeholder dello screenshot di un progetto legato
a quel servizio. Il frame entra con l'animazione standard.

Scrollytelling: il servizio attivo cambia man mano che l'utente scrolla.
- 300vh — 375vh: Intelligence attiva (il frame mostra placeholder "NeuralFlow Dashboard")
- 375vh — 450vh: Automation attiva (placeholder "AutoScale Pipeline")
- 450vh — 525vh: SaaS attiva (placeholder "DataPulse Analytics")
- 525vh — 600vh: Software attiva (placeholder "SynthOS Interface")

ScrollTrigger: pin sulla sezione, scrub: true. La sezione rimane fissa
per 300vh mentre il contenuto al suo interno transiziona.

=== ATTO 4: PROGETTI — Galleria cinematica (600vh — 1000vh) ===
Componente: <ProjectsAct />
Altezza: 400vh

Ogni progetto occupa 100vh di scroll e ha una presentazione CINEMATICA a schermo pieno.

Per ogni progetto (4 totali):
Layout split-screen:
- Metà sinistra (55%): ScreenFrame variant="browser" che occupa quasi tutta l'altezza
  Con placeholder dello screenshot del progetto
  Il frame entra da sinistra con translateX(-100px)→0 + opacity + scale
- Metà destra (45%): informazioni testuali
  - Numero: "01" grande (8vw), Syne, #393E41 opacità 0.15 — decorativo
  - Titolo: Syne, clamp(36px, 4vw, 56px), weight 700, #E7E5DF
    Appare con TextReveal (split chars, stagger)
  - Categoria: Space Mono, 12px, uppercase, letter-spacing 0.15em, #D3D0CB opacità 0.4
  - Descrizione: Inter, 15px, weight 300, #D3D0CB opacità 0.5, max-width 400px
    (2-3 righe che descrivono il progetto)
  - Tags tecnologici: pillole con bordo #393E41 (come nei servizi)
  - CTA: un link "View project →" in Space Mono 12px, #E7E5DF,
    con effetto hover underline che si disegna da sinistra

TRANSIZIONE TRA PROGETTI:
Quando si scrolla da un progetto al successivo:
1. Il frame corrente scivola via verso sinistra (translateX → -60px, opacity → 0)
2. Il testo corrente sfuma (opacity → 0, translateY → -20px)
3. Il frame del nuovo progetto entra da destra (translateX 100px → 0)
4. Il testo del nuovo progetto entra con TextReveal
5. Il numero decorativo in background si morphs ("01" → "02") con scramble

ScrollTrigger: ogni progetto è pinnato per 100vh, scrub: true.
Il layout alterna: progetto 1 ha il frame a sinistra, progetto 2 a DESTRA
(il testo va a sinistra), progetto 3 di nuovo a sinistra, etc.
Questa alternanza crea ritmo visivo e evita monotonia.

Progetti:
1. NeuralFlow — AI Platform — 2025
   "An intelligent dashboard that turns raw data into strategic decisions in real-time."
   Tags: GPT-4, Python, React, PostgreSQL

2. AutoScale — Automation SaaS — 2025
   "End-to-end workflow automation that eliminated 80% of manual processes for enterprise clients."
   Tags: Node.js, AWS Lambda, Zapier API, Redis

3. DataPulse — Analytics Dashboard — 2024
   "Real-time analytics with predictive modeling. 200ms response time on 10M+ data points."
   Tags: Next.js, D3.js, ClickHouse, WebSocket

4. SynthOS — Operating System UI — 2024
   "A next-gen operating system interface designed for AI-first computing."
   Tags: Rust, WebGPU, Figma, TypeScript

=== ATTO 5: NUMERI (1000vh — 1150vh) ===
Componente: <StatsAct />
Altezza: 150vh

Sezione con le statistiche. Layout: 4 blocchi in riga su desktop, 2x2 su mobile.
Ogni blocco separato da linee verticali di 1px (#393E41 opacità 0.2).

Ogni stat:
- Numero grande: Syne, clamp(48px, 6vw, 80px), weight 800, #E7E5DF
  Effetto COUNT-UP: il numero parte da 0 e sale al valore finale
  quando la sezione entra nel viewport. Durata 2s, ease: power2.out.
  Il conteggio non è lineare: accelera all'inizio e rallenta alla fine.
- Suffisso ("+", "%") con animazione separata (appare 0.2s dopo il numero)
- Label: Space Mono, 10px, uppercase, letter-spacing 0.2em, #393E41

Stats:
1. 150+ / Projects Delivered
2. 98% / Client Retention
3. 40+ / Team Members
4. 12 / Countries Served

Linea decorativa orizzontale sopra e sotto la sezione (SectionDivider).
Entra dal centro verso l'esterno.

Scrollytelling: la sezione è pinnata per 150vh.
I 4 numeri appaiono in SEQUENZA con stagger di 0.3s
(ScrollTrigger start quando la sezione è al 30% del viewport).

=== ATTO 6: ABOUT (1150vh — 1350vh) ===
Componente: <AboutAct />
Altezza: 200vh

Due sotto-sezioni:

Prima (1150vh — 1250vh): TESTO GRANDE
Una frase che appare parola per parola man mano che si scrolla:
"We are a digital studio where artificial intelligence meets exceptional craft.
Every algorithm is purposeful. Every pixel is intentional."
Syne, clamp(28px, 3.5vw, 48px), weight 600, #E7E5DF
Ogni parola parte da opacity 0.1 e diventa 1.0 quando il suo "turno" arriva.
L'effetto: il testo si rivela progressivamente, come se lo stessi scrivendo con lo scroll.
ScrollTrigger: scrub: true, le parole si illuminano sequenzialmente.

Seconda (1250vh — 1350vh): CHI SIAMO compatto
Layout a 2 colonne:
- Sinistra: "Built different." Syne, 5vw, weight 700, #E7E5DF
- Destra: paragrafo Inter, 16px, weight 300, #D3D0CB opacità 0.6
Sotto: una riga di loghi/badge partner o tecnologie (placeholder grigi, 40x40px,
rettangoli arrotondati in #393E41 opacità 0.2) con animazione stagger.

=== ATTO 7: CONTATTO (1350vh — 1500vh) ===
Componente: <ContactAct />
Altezza: 150vh

L'atto finale. Grande, diretto, potente.
- "Ready?" appare e scompare velocemente (flas
h, 1s) — Space Mono, piccolo, #393E41
- Titolo su 2 righe, centrato:
  "Let's create" — #E7E5DF
  "something extraordinary." — con gradiente animato #D3D0CB → #E7E5DF
  Syne, weight 800, clamp(36px, 7vw, 90px)
  Appare con TextReveal splitBy="chars"
- Sotto: GlassButton (ora con palette aggiornata, vedi fase successiva)
  testo "Start a Project"
- Email: "hello@builda.studio" in Inter 16px, #D3D0CB opacità 0.4
  Hover: opacità 1, underline animato
- Footer: "© 2025 BUILDA" + social links (Tw · Li · Dr · Gh)
  Space Mono, 10px, #393E41

La griglia di punti nell'atto finale fa un'animazione speciale:
tutti i punti convergono lentamente verso il centro dello schermo
(come se fossero attratti dal CTA), poi tornano normali.
Dura tutto il 150vh dell'atto.
```

---

## FASE 4 — Aggiornamento componenti UI alla nuova palette

```
AGGIORNA tutti i componenti UI alla nuova palette colori.

FILE: /components/ui/GlassButton.tsx (AGGIORNA)
- background: rgba(57, 62, 65, 0.15) (carbon a bassa opacità)
- border: 1px solid rgba(57, 62, 65, 0.4)
- backdrop-filter: blur(12px)
- color: #E7E5DF
- border-radius: 100px
- Hover:
  - background: rgba(57, 62, 65, 0.3)
  - border: 1px solid rgba(211, 208, 203, 0.2)
  - Shimmer: gradiente lineare rgba(227,229,223,0.05) che scorre da sinistra a destra
- Variante "primary":
  - background: rgba(211, 208, 203, 0.1) + backdrop-filter
  - border: 1px solid rgba(211, 208, 203, 0.15)
  - Hover: background rgba(211, 208, 203, 0.18)

FILE: /components/ui/SectionDivider.tsx (AGGIORNA)
- Colore linea: gradiente orizzontale:
  transparent → #393E41 opacità 0.3 → #393E41 opacità 0.3 → transparent
  (sfuma alle estremità)
- Animazione: scaleX 0→1, durata 1.2s

FILE: /components/ui/GlassCard.tsx (AGGIORNA)
- background: rgba(30, 34, 36, 0.6) (void a 60%)
- border: 1px solid #393E41 opacità 0.3
- backdrop-filter: blur(8px)
- Hover: border diventa #393E41 opacità 0.6

FILE: /components/interface/CursorEntity.tsx (AGGIORNA)
- Dot: #E7E5DF (chalk) al posto di bianco
- Ring: border color #D3D0CB opacità 0.3
- Trail: opacità in #D3D0CB
- mix-blend-mode: difference resta invariato

FILE: /components/interface/NavigationWhisper.tsx (AGGIORNA)
- Punti inattivi: #393E41 opacità 0.3
- Punto attivo: #E7E5DF, ring di pulse in #D3D0CB opacità 0.2
- Linea connettiva: #393E41 opacità 0.05
- Tooltip: #D3D0CB, Space Mono

FILE: /components/interface/ScrollProgress.tsx (AGGIORNA)
- Linea di sfondo: #393E41 opacità 0.1
- Linea di progresso: gradiente #393E41 → #D3D0CB → #E7E5DF
  (da scuro a chiaro man mano che progredisce)

FILE: tailwind.config.ts (AGGIORNA i colori)
colors: {
  void: '#1E2224',
  carbon: '#393E41',
  stone: '#D3D0CB',
  chalk: '#E7E5DF',
  // Rimuovi phantom, glow, pulse e qualsiasi colore saturo
}

FILE: globals.css (AGGIORNA)
- ::selection → background: rgba(211, 208, 203, 0.25); color: #1E2224
- body → background: #1E2224; color: #D3D0CB
- Scrollbar (se visibile): thumb #393E41, track #1E2224
```

---

## FASE 5 — Pannello Admin (Backend + Frontend)

```
Crea un pannello di amministrazione completo per gestire i contenuti del sito
e delegare accesso ad altri utenti.

=== BACKEND ===

FILE: /backend/prisma/schema.prisma

Usa Prisma con PostgreSQL (Railway ha PostgreSQL integrato).

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String   // hash bcrypt
  role      Role     @default(EDITOR)
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  projects  Project[]
  services  Service[]
  logs      ActivityLog[]
}

enum Role {
  OWNER     // può tutto, gestisce utenti
  ADMIN     // può tutto tranne gestire utenti
  EDITOR    // può editare contenuti ma non impostazioni
  VIEWER    // sola lettura
}

model Project {
  id          String   @id @default(cuid())
  title       String
  category    String
  year        String
  description String
  tags        String[] // array di stringhe
  imageSrc    String?  // URL dello screenshot (upload su S3/Cloudflare R2)
  order       Int      // ordinamento nella galleria
  isPublished Boolean  @default(false)
  createdBy   User     @relation(fields: [userId], references: [id])
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Service {
  id          String   @id @default(cuid())
  num         String   // "01", "02", etc.
  title       String
  description String
  tags        String[]
  order       Int
  isPublished Boolean  @default(true)
  createdBy   User     @relation(fields: [userId], references: [id])
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model SiteSetting {
  id    String @id @default(cuid())
  key   String @unique
  value String // JSON stringificato per valori complessi
}

model Stat {
  id     String @id @default(cuid())
  value  Int
  suffix String // "+", "%", ""
  label  String
  order  Int
}

model ActivityLog {
  id        String   @id @default(cuid())
  action    String   // "created_project", "updated_service", "invited_user", etc.
  details   String?  // JSON con dettagli
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  createdAt DateTime @default(now())
}

FILE: /backend/src/routes/auth.ts
- POST /api/auth/login → email + password, ritorna JWT (httpOnly cookie)
- POST /api/auth/logout → pulisce il cookie
- GET /api/auth/me → ritorna l'utente corrente dal JWT
- Usa bcrypt per password hashing, jsonwebtoken per JWT
- Il JWT contiene: userId, email, role
- Middleware authMiddleware che verifica il JWT e aggiunge user alla request
- Middleware roleMiddleware(minRole) che verifica il ruolo:
  OWNER > ADMIN > EDITOR > VIEWER

FILE: /backend/src/routes/users.ts (solo OWNER)
- GET /api/users → lista tutti gli utenti
- POST /api/users/invite → crea un nuovo utente con email + ruolo
  Genera una password temporanea random, la invia via email (o la mostra una sola volta)
  L'utente può cambiarla dopo il primo login
- PATCH /api/users/:id → aggiorna ruolo
- DELETE /api/users/:id → rimuove utente (non può rimuovere se stesso)
- GET /api/users/:id/activity → log attività di un utente

FILE: /backend/src/routes/projects.ts (EDITOR+)
- GET /api/projects → lista progetti (ordinati per order)
- POST /api/projects → crea nuovo progetto
- PATCH /api/projects/:id → aggiorna progetto
- DELETE /api/projects/:id → elimina progetto (ADMIN+ per delete)
- POST /api/projects/:id/upload → upload screenshot
  Accetta multipart/form-data, salva l'immagine su Cloudflare R2 o S3
  Ritorna l'URL pubblico dell'immagine
- PATCH /api/projects/reorder → body: [{id, order}] — riordina i progetti

FILE: /backend/src/routes/services.ts (EDITOR+)
- Stessa struttura di projects

FILE: /backend/src/routes/stats.ts (EDITOR+)
- GET /api/stats
- PATCH /api/stats/:id

FILE: /backend/src/routes/settings.ts (ADMIN+)
- GET /api/settings → tutte le impostazioni
- PATCH /api/settings/:key → aggiorna un'impostazione
  Impostazioni: site_title, site_description, contact_email, social_links (JSON),
  manifesto_phrases (JSON array delle 5 frasi dell'atto 2)

FILE: /backend/src/routes/public.ts (nessuna auth)
- GET /api/public/portfolio → ritorna tutti i dati pubblicati del portfolio:
  { projects, services, stats, settings }
  Solo i contenuti con isPublished: true
  Questo endpoint è chiamato dal frontend per rendere il sito pubblico

Questo endpoint viene cachato con Cache-Control: public, max-age=60, stale-while-revalidate=300
```

---

## FASE 6 — Frontend Admin Panel

```
Il pannello admin è una sezione SEPARATA del frontend Next.js,
accessibile a /admin. Ha un design proprio (non usa lo stile del portfolio).

=== LAYOUT ADMIN ===

FILE: /frontend/app/admin/layout.tsx

- Background: #0F1112 (più scuro del sito pubblico)
- Sidebar a sinistra (240px di larghezza):
  - Logo "BUILDA" in piccolo in cima (Syne, 16px, #E7E5DF)
  - Sotto: "Admin" in Space Mono, 10px, #393E41
  - Navigazione verticale con icone (usa lucide-react):
    - Dashboard (LayoutDashboard)
    - Projects (FolderOpen)
    - Services (Layers)
    - Stats (BarChart3)
    - Settings (Settings)
    - Team (Users) — solo per OWNER
    - Activity Log (Clock) — solo per ADMIN+
  - In fondo: avatar utente + nome + ruolo, bottone logout
  - Link attivo: background #1E2224, bordo sinistro 2px #E7E5DF
  - Link hover: background #1A1C1E
- Area contenuto a destra: padding 32px, overflow-y: auto
- Su mobile (< 1024px): sidebar diventa un drawer che si apre con hamburger

=== PAGINE ===

FILE: /frontend/app/admin/page.tsx (Dashboard)
- Titolo "Dashboard" + saluto "Welcome back, [nome]"
- 4 card in riga con stats rapide:
  - Progetti totali (numero)
  - Servizi attivi (numero)
  - Ultimo aggiornamento (data relativa, es: "2 hours ago")
  - Utenti team (numero, solo se OWNER/ADMIN)
- Sotto: Activity Log recente (ultime 10 azioni) in una tabella compatta:
  Colonne: Data, Utente, Azione
  Ogni riga ha un'icona che indica il tipo di azione
- Stile card: background #1E2224, border 1px #393E41 opacità 0.3, border-radius 12px

FILE: /frontend/app/admin/projects/page.tsx
- Titolo "Projects" + bottone "Add Project" (in alto a destra)
- Lista dei progetti come card ordinabili con DRAG AND DROP:
  Ogni card mostra:
  - Thumbnail dello screenshot (se presente) o placeholder grigio
  - Titolo, categoria, anno
  - Badge "Published" (verde) o "Draft" (giallo)
  - Bottoni: Edit (pencil icon), Delete (trash icon, con conferma modale)
- Il drag and drop riordina i progetti (salva automaticamente con debounce)
  Usa @dnd-kit/core e @dnd-kit/sortable per il drag and drop
- Click su "Edit" o "Add" apre una pagina/modale con form:
  - Title (input text)
  - Category (input text)
  - Year (input text o select)
  - Description (textarea)
  - Tags (input con chip: digiti e premi Enter per aggiungere, click sulla X per rimuovere)
  - Screenshot upload: area di drop/click con preview dell'immagine
    Accetta JPG, PNG, WebP. Max 5MB. Mostra preview dopo upload.
  - Published (toggle switch)
  - Bottoni: Save, Cancel

FILE: /frontend/app/admin/services/page.tsx
- Stessa struttura di projects ma per i servizi
- Campi form: Num, Title, Description, Tags, Published

FILE: /frontend/app/admin/stats/page.tsx
- 4 card inline editabili
- Ogni card ha: Value (input number), Suffix (input text), Label (input text)
- Salvataggio automatico con debounce 1s dopo l'ultimo cambiamento
- Feedback: toast "Saved" quando il salvataggio va a buon fine

FILE: /frontend/app/admin/settings/page.tsx (ADMIN+)
- Form con i campi:
  - Site Title (input)
  - Site Description (textarea)
  - Contact Email (input)
  - Social Links: 4 input per Twitter, LinkedIn, Dribbble, GitHub URL
  - Manifesto Phrases: 5 textarea per le frasi dell'Atto 2 del scrollytelling
    Ogni textarea è numerata (1-5) e sortable
- Bottone Save in fondo

FILE: /frontend/app/admin/team/page.tsx (solo OWNER)
- Lista utenti con: Avatar, Nome, Email, Ruolo, Data creazione
- Per ogni utente:
  - Dropdown per cambiare ruolo (VIEWER, EDITOR, ADMIN)
    Il cambio è immediato con conferma
  - Bottone "Remove" (icona trash, con conferma modale)
    "Are you sure you want to remove [nome]? This action cannot be undone."
  - Non puoi rimuovere te stesso
  - Non puoi abbassare il tuo ruolo
- Bottone "Invite Member" che apre un modale:
  - Email (input, required)
  - Name (input, required)
  - Role (select: VIEWER, EDITOR, ADMIN)
  - Bottone "Send Invite"
  - Dopo l'invito: mostra la password temporanea generata UNA SOLA VOLTA
    con un bottone "Copy" e un avviso: "Save this password. It won't be shown again."

FILE: /frontend/app/admin/activity/page.tsx (ADMIN+)
- Tabella paginata di tutte le azioni:
  Colonne: Data/Ora, Utente (con avatar), Azione, Dettagli
  - "User A created project NeuralFlow"
  - "User B updated service Automation"
  - "Admin invited user editor@example.com as EDITOR"
- Filtri in alto: per utente (dropdown), per tipo azione (dropdown), per data (date range)
- Paginazione: 20 righe per pagina

=== AUTH ===

FILE: /frontend/app/admin/login/page.tsx
- Pagina centrata, minimale
- Logo "BUILDA" + "Admin" sotto
- Form: Email, Password, bottone "Sign In"
- Errore: messaggio rosso sotto il form se credenziali sbagliate
- Redirect a /admin/dashboard dopo login
- Se l'utente è già loggato, redirect automatico alla dashboard

FILE: /frontend/middleware.ts
- Proteggi tutte le route /admin/* (tranne /admin/login)
- Se non c'è cookie JWT valido, redirect a /admin/login
- Se il JWT è scaduto, redirect a /admin/login

=== INTEGRAZIONE CON IL SITO PUBBLICO ===

FILE: /frontend/app/page.tsx (AGGIORNA)
- Il page.tsx del sito pubblico ora chiama GET /api/public/portfolio al caricamento
  (usa fetch in un Server Component, o useSWR/React Query in un Client Component)
- I dati di projects, services, stats, settings vengono passati ai componenti
  invece di essere hardcoded in constants.ts
- constants.ts diventa un FALLBACK: se l'API non risponde, usa i dati statici
- Questo permette di aggiornare il portfolio dall'admin senza toccare il codice

CACHING:
- Il sito pubblico usa Next.js ISR (Incremental Static Regeneration):
  revalidate: 60 (rigenera la pagina ogni 60 secondi max)
- Oppure usa on-demand revalidation: quando un contenuto viene salvato nell'admin,
  chiama una route /api/revalidate che invalida la cache della home
```

---

## FASE 7 — Setup primo utente e deployment

```
SETUP INIZIALE E DEPLOY:

FILE: /backend/src/scripts/seed.ts
Script che crea il primo utente OWNER:
- Email: (parametro o variabile d'ambiente OWNER_EMAIL)
- Password: (parametro o variabile d'ambiente OWNER_PASSWORD)
- Nome: "Admin"
- Ruolo: OWNER
- Esegui con: npx ts-node src/scripts/seed.ts
- Controlla se esiste già un OWNER prima di crearne uno nuovo
- Logga la conferma: "Owner account created: admin@builda.studio"

Crea anche i dati iniziali di default:
- 4 servizi (quelli di constants.ts)
- 4 progetti placeholder (senza screenshot)
- 4 stats
- Settings base (title, description, email, social links)

FILE: /backend/.env.example
DATABASE_URL=postgresql://user:pass@host:5432/builda
JWT_SECRET=your-secret-key-here
OWNER_EMAIL=admin@builda.studio
OWNER_PASSWORD=change-me-immediately
S3_BUCKET=builda-uploads
S3_REGION=auto
S3_ACCESS_KEY=xxx
S3_SECRET_KEY=xxx
S3_ENDPOINT=https://xxx.r2.cloudflarestorage.com

FILE: /frontend/.env.example
NEXT_PUBLIC_API_URL=http://localhost:3001
REVALIDATE_SECRET=your-revalidate-secret

RAILWAY DEPLOY:
- Service "backend":
  - Root: /backend
  - Variabili d'ambiente: tutte quelle del .env.example
  - Aggiungi un database PostgreSQL dal marketplace Railway
    Railway genera automaticamente DATABASE_URL
  - Build command: npm run build
  - Start command: npm run start
  - Dopo il primo deploy: esegui npx prisma migrate deploy && npx ts-node src/scripts/seed.ts
    (puoi farlo dalla console Railway o aggiungendo al build command)

- Service "frontend":
  - Root: /frontend
  - Variabili: NEXT_PUBLIC_API_URL = URL del service backend su Railway
  - Build command: npm run build
  - Start command: npm start

- Railway genera URL automatici per entrambi i servizi.
  Il sito pubblico è l'URL del frontend.
  L'admin è all'URL del frontend + /admin
  Quando vuoi un dominio custom: aggiungi il dominio in Railway settings
  e configura il DNS (CNAME record).
```

---

## ORDINE DI ESECUZIONE COMPLETO

```
Esegui tutte le fasi dei prompt base PRIMA, poi queste fasi:

FASE 1 → Sfondo + Griglia ordinata (sostituisce particelle)
FASE 2 → ScreenFrame placeholder (sostituisce oggetti 3D)
FASE 3 → Scrollytelling rivisto (7 atti narrativi)
FASE 4 → Aggiornamento palette colori su tutti i componenti
FASE 5 → Backend: database, API, autenticazione, ruoli
FASE 6 → Frontend admin panel
FASE 7 → Seed, env, deploy Railway

Nota: le fasi 5-6-7 sono INDIPENDENTI dallo stile del sito.
Possono essere eseguite in parallelo con le fasi 1-4
da un altro sviluppatore (il backend dev del vostro team).
```
