# KlamsiPrints – Bestell-Website

## 1. Damit die Seite übers Handy erreichbar ist (nicht nur lokal)

Wenn du die `index.html` nur per Doppelklick öffnest, läuft sie über `file://` –
das sieht nur dein eigener Rechner. Damit Kunden über ihr Handy bestellen können,
muss die Seite auf einem echten Webserver liegen. Am einfachsten und kostenlos:

**GitHub Pages:**
1. Kostenloses GitHub-Konto erstellen, neues Repository anlegen (z.B. "klamsiprints").
2. Alle Dateien aus diesem Ordner in das Repository hochladen (Drag & Drop im Browser reicht).
3. Im Repository unter *Settings → Pages* die Branch `main` auswählen und speichern.
4. Nach ca. 1 Minute ist die Seite unter `https://DEINNAME.github.io/klamsiprints/` erreichbar –
   diesen Link kannst du auch vom Handy aus öffnen.

Alternativ geht das genauso einfach mit Netlify Drop (netlify.com/drop – Ordner reinziehen, fertig)
oder jedem anderen normalen Webhosting-Anbieter.

⚠️ Wichtig: Achte darauf, dass Datei-/Link-Namen exakt in Groß-/Kleinschreibung stimmen
(z.B. `index.html`, nicht `Index.html`) – lokal auf Windows/Mac ist das egal, auf einem
echten Server (Linux) ist das case-sensitiv und ein falscher Link funktioniert dann nicht mehr.

## 2. Google Sheets Synchronisierung einrichten

Damit Bestellungen automatisch in ein Google Sheet geschrieben werden:

1. Leeres Google Sheet erstellen.
2. Im Sheet: *Erweiterungen → Apps Script* öffnen.
3. Den kompletten Inhalt von `google-apps-script.gs` dort einfügen (vorhandenen Code ersetzen).
4. Oben rechts auf **Bereitstellen → Neue Bereitstellung**.
5. Typ: **Web-App**.
6. **Ausführen als: Ich (deine E-Mail)**
7. **Zugriff: Jeder** ← das ist der häufigste Fehlerpunkt. Steht hier "Nur ich" oder
   "Jeder mit Google-Konto", bekommt die Website statt Daten eine Google-Login-Seite
   zurück und die Verbindung schlägt fehl ("Verbindung fehlgeschlagen").
8. Bereitstellen klicken, Zugriff bestätigen, die angezeigte **Web-App-URL** (endet auf `/exec`) kopieren.
9. Diese URL in `Script.js` (Zeile mit `DEFAULT_SHEET_URL`) und in `Admin.html`
   (Zeile mit `DEFAULT_SHEET_URL`) eintragen – oder einfach im Admin-Panel unten bei
   "Google Sheets Synchronisierung" einfügen und auf "Speichern" klicken (das aktualisiert
   die Anzeige im Admin-Panel; für neue Bestellungen von Kunden muss die URL zusätzlich
   fest in `Script.js` eingetragen sein).

**Wichtig bei jeder Code-Änderung am Script:** Google verlangt bei jeder Änderung an
`google-apps-script.gs` eine **neue Bereitstellung** (Bereitstellen → Bereitstellungen
verwalten → Bearbeiten-Stift → neue Version), sonst läuft weiterhin der alte Code.

Im Admin-Panel zeigt der Status-Badge jetzt genauer an, woran es liegt:
- "Zeitüberschreitung" → Skript antwortet gar nicht (URL falsch oder Skript gelöscht)
- "Skript nicht erreichbar" → URL falsch/Tippfehler
- "Antwort ungültig" → Skript läuft, aber Zugriff ist nicht auf "Jeder" gestellt

## 3. Bilder / Performance

Die Produktbilder waren ursprünglich mit 5–6 Megapixel Auflösung hinterlegt, obwohl sie
nur als 56px-Vorschau angezeigt werden – das hat beim Rendern/Animieren spürbar geruckelt.
Alle Bilder wurden auf 400px Breite verkleinert und stärker komprimiert (von insgesamt
~4,8 MB auf ~90 KB), zusätzlich laden sie jetzt erst bei Bedarf (`loading="lazy"`).
