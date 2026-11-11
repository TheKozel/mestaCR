# Mapa měst České republiky

Jednoduchá webová mapa postavená na [Leafletu](https://leafletjs.com/). Města se načítají ze souboru GeoJSON, takže nové město přidáte úpravou dat, bez zásahu do kódu.

## Struktura projektu

```
mapa-mest/
├── index.html     stránka, načítá Leaflet, styly a skript
├── map.js         vytvoření mapy, načtení GeoJSONu, značky a popupy
├── styl.css       vzhled stránky, značek a popupů
├── body.geojson   data měst (id, nazev, popisek + souřadnice)
└── README.md      tento soubor
```

## Spuštění

Mapa načítá `body.geojson` pomocí `fetch()`. Prohlížeče to **nepovolují u stránky otevřené dvojklikem** (`file://`), proto je potřeba lokální server.

Nejrychleji přes Python (stačí ve složce projektu):

```bash
python -m http.server 8000
```

Pak otevřete <http://localhost:8000>.

Další možnosti:

- **VS Code:** rozšíření *Live Server* → pravé tlačítko na `index.html` → *Open with Live Server*.
- **Node.js:** `npx serve`

Ke stažení Leafletu a dlaždic mapy je potřeba připojení k internetu.

## Formát dat (`body.geojson`)

Každé město je jeden objekt typu `Feature` s geometrií `Point`:

```json
{
  "type": "Feature",
  "properties": {
    "id": 1,
    "nazev": "Olomouc",
    "popisek": "Text, který se zobrazí v popupu."
  },
  "geometry": {
    "type": "Point",
    "coordinates": [17.2509, 49.5938]
  }
}
```

| Atribut   | Popis                                           |
|-----------|-------------------------------------------------|
| `id`      | Jedinečné číslo města                           |
| `nazev`   | Název, zobrazí se v tooltipu a nadpisu popupu   |
| `popisek` | Krátký text v popupu                            |

> **Pozor na pořadí souřadnic:** GeoJSON používá `[délka, šířka]`, tedy `[longitude, latitude]`. Leaflet jinak běžně pracuje s `[šířka, délka]`. Převod provádí `L.geoJSON` automaticky.

## Přidání dalšího města

1. Otevřete `body.geojson`.
2. Za poslední město přidejte čárku a nový objekt, například:

   ```json
   {
     "type": "Feature",
     "properties": {
       "id": 3,
       "nazev": "Brno",
       "popisek": "Druhé největší město ČR."
     },
     "geometry": {
       "type": "Point",
       "coordinates": [16.6068, 49.1951]
     }
   }
   ```

3. Obnovte stránku. Značka, tooltip, popup i počet měst v záhlaví se aktualizují samy a mapa se přiblíží tak, aby byla vidět všechna města.

Data můžete ověřit například na <https://geojson.io>.

## Co se kde dá upravit

- **Výchozí pohled mapy:** konstanty `STRED_CR` a `VYCHOZI_ZOOM` na začátku `map.js`.
- **Vzhled značky:** třída `.znacka` v `styl.css` (barva je proměnná `--cervena`).
- **Obsah popupu:** funkce `vytvorPopup()` v `map.js`.
- **Podkladová mapa:** `L.tileLayer(...)` v `map.js`.

## Poznámky

- Texty z GeoJSONu se do popupu vkládají přes `textContent`, takže případné HTML v datech se nevykreslí.
- Dlaždice z `tile.openstreetmap.org` jsou určené pro mírné využití. Pokud má stránka větší návštěvnost, použijte jiného poskytovatele dlaždic. Přehled najdete v [pravidlech OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/).
- Podkladová data: © přispěvatelé OpenStreetMap.
