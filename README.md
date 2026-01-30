# SkyAlps Travel Portal - Guida Completa

## 📋 Indice
1. [Panoramica](#panoramica)
2. [Come Funziona](#come-funziona)
3. [Struttura dei File](#struttura-dei-file)
4. [Troubleshooting](#troubleshooting)

---

## Panoramica

Questo portale permette di raccogliere richieste di preventivo per viaggi SkyAlps.

**Il form è già collegato al tuo Google Sheet!**
- Google Form: [COLLEGATO AL SISTEMA]
- Google Sheet: [COLLEGATO AL SISTEMA]

---

## Come Funziona

1. Il cliente compila il form multi-step (5 sezioni)
2. Clicca "Invia richiesta"
3. **I dati vengono salvati automaticamente** sul Google Sheet collegato
4. Si apre WhatsApp con il messaggio precompilato

---

## Struttura dei File

```
skyalps-portal/
├── index.html          # Form HTML multi-step
├── script.js           # Logica JavaScript
├── styles.css          # Stili CSS
├── README.md           # Questa guida
├── font/
│   ├── Heebo/          # Font body
│   └── Magistral/      # Font titoli
└── logo/
    └── logo-def-white.png
```

---

## Troubleshooting

### Problema: I dati non arrivano al Google Sheet

**Soluzioni:**
1. Verifica che il Google Form sia collegato al Google Sheet:
   - Apri il Google Form
   - Clicca su "Risposte"
   - Clicca su "Collega a Fogli"
   - Seleziona il foglio corretto (configurazione nel file script.js)

2. Apri la Console del browser (F12) per vedere eventuali errori

### Problema: WhatsApp non si apre

**Soluzione:**
- WhatsApp web/app deve essere installato sul dispositivo

### Problema: Il form non si carica

**Soluzione:**
1. Verifica che tutti i file siano nella stessa cartella
2. Controlla la connessione internet (servono i CDN per Flatpickr)

---

**Configurazione già completa!** Non serve modificare nulla.

**Ultimo aggiornamento**: Gennaio 2026
