---
name: aircraft-aero-modeling
description: >
  Regole di modellazione per velivoli e oggetti aerodinamici in Blender/CAD.
  USARE SEMPRE quando l'utente modella aerei, droni, ali, fusoliere, profili
  alari, o chiede precisione dimensionale, linee pulite e proporzioni corrette,
  anche se non nomina esplicitamente "aerodinamica".
---

# Metodologia
- Lavora SEMPRE per coordinate esatte. Mai trascinare vertici a occhio.
- Costruisci superfici aerodinamiche per loft tra sezioni a profilo NACA.
- Genera i punti del profilo NACA via script (parametrizzato su corda e spessore).
- Modella metà fusoliera + modificatore Mirror per la simmetria bilaterale.
- Dopo ogni operazione, cattura uno screenshot del viewport e verifica le proporzioni.

# Proporzioni di riferimento (questo progetto)
- Apertura alare ≈ lunghezza fusoliera
- Fusoliera ≈ 60% della larghezza totale

## Quote reali misurate — modello R600 V3 (tailsitter VTOL "Spearhead")
- Unità: metri, scala 1.0. Origine: empty `R600 V3 v038` a (0,0,0).
- Asse fusoliera = Z (tailsitter verticale). Naso +Z (~+0.237 m), coda -Z (~-0.218 m).
- Lunghezza fusoliera ≈ 0.46 m → apertura alare target ≈ 0.46 m (NON oltre).
- Asse apertura = X. Piano ala = X-Z, quindi spessore profilo lungo Y.
- 4 motori in croce diagonale a (±0.107, ±0.107) m, z ≈ +0.01 m. Disco elica Ø ≈ 0.16 m.
  Raggio diagonale punta-motore ≈ 0.151 m → vincolo clearance elica.
- Le 4 pinne-coda / gambe d'appoggio partono ESATTAMENTE dai 4 motori (±0.107, ±0.107).
- Corpo: colonna centrale a x,y~0; dome di base 0.248 m largo a z ≈ -0.13 m.
- Mesh CAD densa (2.76M tris, 21 materiali): NON modificarla, costruire solo proxy intorno.
- Tutti i proxy proporzionati al corpo ~0.46 m esistente: non ingrandire il velivolo.

# Checklist di qualità
- Normali coerenti, niente n-gon sulle superfici curve
- Bordo d'attacco/uscita continui (G2)
- Tutte le quote dichiarate, niente valori "magici"
