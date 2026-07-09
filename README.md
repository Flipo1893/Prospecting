# Prospecting Tool

Persönliches Sales-/Prospecting-Tool für die Kundenakquise bei einem
Schweizer B2B-Startup. Hilft dabei, Schweizer Gewerbe- und
Handwerksbetriebe zu finden (via Zefix-Handelsregister), als Leads zu
speichern und über eine Status-Pipeline zu verfolgen.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 ·
Supabase (Postgres + Auth) · deploybar auf Vercel.

## Features (Stufe 1)

- **Lead-Suche**: Formular mit Branche (Freitext mit Vorschlägen) und
  Kanton (Dropdown, alle 26 CH-Kantone).
- **Zefix-Anbindung**: Firmensuche über die offizielle Zefix-PublicREST-API,
  gekapselt in einer Server-Route (`/api/zefix/search`). Läuft **ohne**
  API-Zugang sofort im **Mock-Modus** mit Beispieldaten.
- **Ergebnis-Tabelle**: Firmenname, Ort/Kanton, Branche, Rechtsform,
  Status-Auswahl — per Klick als Lead speichern.
- **Lead-Verwaltung**: Pipeline-Status (Neu → Angeschrieben → Interesse →
  Pilot / Abgelehnt), inline änderbar, Notizfeld, Löschen.
- **Filter & Sortierung** nach Status, Kanton, Branche.
- **Auth**: Login per Magic Link (Supabase Auth), Leads sind pro Nutzer
  isoliert (Row Level Security).

## Voraussetzungen

- Node.js ≥ 18.18 (getestet mit Node 22)
- Ein [Supabase](https://supabase.com)-Projekt (kostenloser Free-Tier reicht)

## 1. Setup

```bash
npm install
cp .env.example .env.local
```

### Supabase einrichten

1. Neues Projekt auf [supabase.com](https://supabase.com/dashboard) anlegen.
2. Unter **Project Settings → API** findest du:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   Beide in `.env.local` eintragen.
3. **Migration ausführen** — entweder:
   - **Supabase Dashboard**: SQL Editor öffnen, Inhalt von
     `supabase/migrations/0001_init.sql` einfügen und ausführen, **oder**
   - **Supabase CLI**:
     ```bash
     npx supabase login
     npx supabase link --project-ref <dein-projekt-ref>
     npx supabase db push
     ```
4. **Auth-Einstellungen**: Die App nutzt Magic-Link-Login
   (`signInWithOtp`). Das ist bei Supabase standardmässig aktiviert — es
   ist keine zusätzliche Konfiguration nötig. Optional kannst du unter
   **Authentication → URL Configuration** die `Site URL` auf deine
   Vercel-Domain setzen, damit die Magic-Link-Mails auf die richtige URL
   verweisen.

Ohne gesetzte Supabase-Variablen startet die App trotzdem (Login/Leads
sind dann deaktiviert bzw. es erscheint ein Hinweis "Supabase nicht
konfiguriert") — praktisch, um zuerst nur die Zefix-Suche im Mock-Modus
auszuprobieren.

### Zefix-Zugang einrichten (optional — Mock-Modus funktioniert ohne)

Die App ruft Firmendaten über die offizielle **Zefix PublicREST-API**
(`https://www.zefix.admin.ch/ZefixPublicREST`) ab. Diese API erfordert
registrierte Zugangsdaten (Basic-Auth Benutzername/Passwort):

1. Zugang beantragen über die Zefix-Kontaktseite:
   https://www.zefix.admin.ch/de/search/entity/welcome (Abschnitt zur
   PublicREST-API/Registrierung) oder über das im Swagger-UI verlinkte
   Kontaktformular:
   https://www.zefix.admin.ch/ZefixPublicREST/swagger-ui/index.html
2. Nach Erhalt der Zugangsdaten in `.env.local` eintragen:
   ```
   ZEFIX_API_KEY=benutzername:passwort
   ```
   (Format `"username:password"` — wird von der App automatisch zu
   Basic-Auth Base64 kodiert. Alternativ kannst du direkt einen fertigen
   Base64-String eintragen.)
3. `ZEFIX_FORCE_MOCK=false` setzen (Default).

**Hinweis zur Feldabdeckung:** Das Zefix-Handelsregister kennt keine
strikte "Branche"-Kategorie — die App nutzt den Branchen-Begriff daher als
Namens-Suchbegriff (viele KMU tragen ihr Gewerbe im Firmennamen, z.B.
"Sanitär Muster AG") und filtert zusätzlich nach Kanton. Für eine
präzisere Branchen-Anreicherung ist Stufe 2 (Google Places API)
vorgesehen.

> Die Zefix-Integration wurde anhand der öffentlich dokumentierten
> API-Struktur implementiert; die Swagger-Konsole war zum Zeitpunkt der
> Erstellung nicht automatisiert erreichbar. Prüfe bei Abweichungen die
> aktuelle Swagger-Doku und passe das Mapping in
> `src/lib/zefix/client.ts` (Funktion `mapRawCompany`) entsprechend an.

**Ohne `ZEFIX_API_KEY`** (oder mit `ZEFIX_FORCE_MOCK=true`) läuft die
Suche automatisch im **Mock-Modus** mit realistischen Beispieldaten aus
`src/lib/zefix/mock-data.ts` — die App ist damit sofort ohne jede
Registrierung lauffähig.

## 2. Lokal starten

```bash
npm run dev
```

App läuft unter [http://localhost:3000](http://localhost:3000). Beim
ersten Aufruf wirst du zu `/login` geleitet (falls Supabase konfiguriert
ist) — Login per Magic Link per E-Mail.

## 3. Deployment (Vercel)

1. Repo mit Vercel verbinden.
2. Umgebungsvariablen aus `.env.local` im Vercel-Projekt unter
   **Settings → Environment Variables** eintragen.
3. Deploy — Next.js/Vercel-Standardkonfiguration, kein Zusatzsetup nötig.

## Ordnerstruktur

```
src/
  app/
    (app)/                 # geschützter Bereich (hinter Login), gemeinsames Nav-Layout
      layout.tsx
      search/page.tsx      # Lead-Suche (Zefix) + Ergebnis-Tabelle
      leads/page.tsx        # Lead-Verwaltung (Pipeline, Filter, Notizen)
    api/zefix/search/route.ts  # Server-Route: kapselt Zefix-Call + Mock-Fallback
    auth/callback/route.ts # Magic-Link Callback (Session-Exchange)
    login/page.tsx
    logout/route.ts
    layout.tsx              # Root-Layout (Fonts, globale Styles)
    page.tsx                 # Redirect auf /leads
  components/                # UI-Komponenten (Nav, Filter, Status-Badge, Lead-Zeile)
  lib/
    actions/leads.ts          # Server Actions: Lead speichern/Status/Notizen/Löschen
    constants/                # Kantone, Branchen-Vorschläge, Status-Pipeline + Farben
    supabase/                 # Browser-/Server-/Middleware-Clients
    zefix/                     # Zefix-Client + Mock-Daten
  types/lead.ts                # Lead- und Suchtreffer-Typen
  middleware.ts                 # Auth-Schutz für Routen
supabase/migrations/0001_init.sql  # Datenbank-Schema (leads-Tabelle, RLS)
```

## Datenmodell

Tabelle `leads` (siehe `supabase/migrations/0001_init.sql`):

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | uuid | Primärschlüssel |
| `user_id` | uuid | Besitzer (RLS-geschützt, `auth.users`) |
| `company_name` | text | Firmenname |
| `canton` | text | Kantonskürzel (z.B. `ZH`) |
| `industry` | text | Branche (Freitext) |
| `legal_form` | text | Rechtsform |
| `source` | text | `zefix` oder `manual` |
| `source_ref` | text | Zefix-UID (Dedupe-Schlüssel) |
| `status` | text | `Neu` \| `Angeschrieben` \| `Interesse` \| `Pilot` \| `Abgelehnt` |
| `notes` | text | Freitext-Notizen |
| `created_at` / `updated_at` | timestamptz | Zeitstempel |

Row Level Security ist aktiv: jede:r Nutzer:in sieht ausschliesslich
eigene Leads.

## Erweiterungspunkte (Roadmap)

Die App ist bewusst modular gehalten, damit die folgenden Ausbaustufen
sich ohne grössere Umbauten ergänzen lassen:

### Stufe 2 — Anreicherung (Google Places API)

- `GOOGLE_PLACES_API_KEY` ist bereits in `.env.example` vorgesehen.
- Geplanter Ansatz: neue Server-Route `src/app/api/places/enrich/route.ts`,
  die pro Lead (Firmenname + Ort) einen Places-Lookup macht und
  Website/Telefon/Bewertung zurückgibt.
- Datenmodell: zusätzliche Spalten auf `leads` (`website`, `phone`,
  `rating`, `has_website`) per neuer Migration
  `0002_enrichment.sql`, keine Änderung an bestehenden Spalten nötig.
- UI: neue Spalte/Badge "Website vorhanden" als Qualifizierungssignal in
  `leads/page.tsx` und `LeadListItem`.

### Stufe 3 — Investoren-Pipeline

- Eigenes Modul mit gleichem Muster wie das Prospecting-Modul, aber
  eigener Tabelle `investors` (analog zu `leads`, eigene Migration) und
  eigenen Status-Werten (`Kontaktiert`, `Meeting`, `Interessiert`,
  `Committed`) — siehe Kommentar/Vorlage in
  `src/lib/constants/status.ts` (`INVESTOR_STATUSES`).
  Zusätzliches Feld `next_action_at` (Follow-up-Datum) direkt mit anlegen,
  siehe Stufe 4.
- Neue Route-Gruppe `src/app/(app)/investors/` mit `search`/`list`
  Seiten, wiederverwendet: `FilterBar`, `StatusBadge`, `AppShell`-Nav
  (neuer Menüpunkt "Investoren").
- Gemeinsame Typen/Helpers (`Lead`/`Investor`) lassen sich bei Bedarf zu
  einem generischen `Contact<TStatus>`-Typ zusammenführen.

### Stufe 4 — Follow-up & Reminder

- Spalte `next_action_at` (timestamptz) auf `leads` (und `investors`)
  ergänzen.
- Neue Dashboard-Seite `src/app/(app)/dashboard/page.tsx`: Query auf
  fällige (`next_action_at <= now()`) Leads/Investoren, sortiert nach
  Fälligkeit.

### Stufe 5 — Reporting

- Aggregations-Queries auf `leads` (Anzahl je Status, Conversion
  Neu→Pilot, Aktivität pro Woche via `created_at`/`updated_at`).
- Eigene Seite `src/app/(app)/reports/page.tsx` mit einfachen Charts
  (z.B. mit `recharts`) — reine Lesezugriffe, keine Schemaänderung nötig.

## Nächste Schritte

1. `npm install`, `.env.local` aus `.env.example` befüllen (mind.
   Supabase-Variablen).
2. Migration in Supabase ausführen (SQL-Editor oder CLI).
3. `npm run dev`, unter `/login` per Magic Link anmelden.
4. Unter `/search` eine erste Suche starten (läuft ohne Zefix-Key im
   Mock-Modus) und Treffer in die Leads-Liste speichern.
5. Wenn Stufe 1 passt: Bescheid geben für den Prompt zu Stufe 2
   (Google Places Anreicherung).
