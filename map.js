"use strict";

/* ==========================================================
   Konfigurace
   ========================================================== */

const GEOJSON_URL = "body.geojson";
const STRED_CR = [49.8175, 15.473]; // přibližný střed ČR [lat, lng]
const VYCHOZI_ZOOM = 7;

/* ==========================================================
   Mapa a podkladová vrstva
   ========================================================== */

const mapa = L.map("mapa").setView(STRED_CR, VYCHOZI_ZOOM);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">přispěvatelé OpenStreetMap</a>',
}).addTo(mapa);

/* ==========================================================
   Pomocné funkce
   ========================================================== */

/** Vlastní značka (CSS kruh) místo výchozí modré špendlíkové ikony. */
const ikonaMesta = L.divIcon({
  className: "znacka",
  html: "<span></span>",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -12],
  tooltipAnchor: [12, 0],
});

/** Obsah popupu. Texty vkládáme přes textContent, takže data z GeoJSONu nemohou vložit HTML. */
function vytvorPopup(vlastnosti) {
  const obal = document.createElement("div");
  obal.className = "popup";

  const nadpis = document.createElement("h2");
  nadpis.textContent = vlastnosti.nazev;

  const popisek = document.createElement("p");
  popisek.textContent = vlastnosti.popisek;

  obal.append(nadpis, popisek);
  return obal;
}

/** Správný tvar slova „město“ podle počtu (1 město, 2–4 města, 5+ měst). */
function pocetMest(n) {
  if (n === 1) return "1 město";
  if (n >= 2 && n <= 4) return `${n} města`;
  return `${n} měst`;
}

/** Zobrazí chybovou hlášku nad mapou. */
function zobrazChybu(html) {
  const prvek = document.getElementById("chyba");
  prvek.innerHTML = html;
  prvek.hidden = false;
}

/* ==========================================================
   Načtení a vykreslení dat
   ========================================================== */

function vykresliMesta(geojson) {
  const vrstva = L.geoJSON(geojson, {
    pointToLayer: (feature, latlng) =>
      L.marker(latlng, {
        icon: ikonaMesta,
        title: feature.properties.nazev,
        alt: feature.properties.nazev,
      }),

    onEachFeature: (feature, layer) => {
      layer.bindPopup(vytvorPopup(feature.properties), { maxWidth: 300 });
      layer.bindTooltip(feature.properties.nazev, { direction: "right" });
    },
  }).addTo(mapa);

  const pocet = geojson.features.length;
  document.getElementById("pocet").textContent = pocetMest(pocet);

  // Přiblížit mapu tak, aby byla vidět všechna města
  const hranice = vrstva.getBounds();
  if (hranice.isValid()) {
    mapa.fitBounds(hranice, { padding: [60, 60], maxZoom: 12 });
  }
}

async function nactiMesta() {
  try {
    const odpoved = await fetch(GEOJSON_URL);
    if (!odpoved.ok) {
      throw new Error(`Server vrátil chybu ${odpoved.status}`);
    }
    vykresliMesta(await odpoved.json());
  } catch (chyba) {
    console.error("Data měst se nepodařilo načíst:", chyba);

    if (location.protocol === "file:") {
      zobrazChybu(
        "<strong>Soubor <code>body.geojson</code> se nepodařilo načíst.</strong><br>" +
          "Prohlížeč blokuje načítání dat ze souboru otevřeného přes <code>file://</code>. " +
          "Spusťte lokální server, například <code>python -m http.server 8000</code>, " +
          "a otevřete <code>http://localhost:8000</code>."
      );
    } else {
      zobrazChybu(
        "<strong>Data měst se nepodařilo načíst.</strong><br>" +
          "Zkontrolujte, že soubor <code>body.geojson</code> leží vedle <code>index.html</code> " +
          "a obsahuje platný JSON."
      );
    }
  }
}

nactiMesta();