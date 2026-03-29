document.getElementById('year').textContent = new Date().getFullYear();
const GAUTENG_CENTER = { lat: -26.1367, lon: 28.2411 };
const SEARCH_BOUNDS = "27.8,-26.5,28.8,-25.5"; // This "boxes in" the Gauteng region
let map;
let pickupMarker = null;
let dropoffMarker = null;
let startCoords = null; 
let endCoords = null;
let selectedVehicle = "Not Selected";
let selectedPrice = "Pending";
let lastDistanceKm = null;



// --- 1. DATA EXTRACTED FROM YOUR IMAGES ---
const pricingData = {
  "airways park": { "sedan": 250, "van": 500 },
  "actonville": { "sedan": 500, "van": 850 },
  "auckland pack": { "sedan": 650, "van": 980 },
  "auclands": { "sedan": 550, "van": 850 },
  "athol": { "sedan": 650, "van": 980 },
  "alberton centre": { "sedan": 500, "van": 850 },
  "actavia park (elandsfontein)": { "sedan": 300, "van": 600 },
  "alexandra": { "sedan": 600, "van": 900 },
  "amalgun": { "sedan": 650, "van": 980 },
  "apex (benoni)": { "sedan": 450, "van": 750 },
  "atlasville": { "sedan": 300, "van": 650 },
  "alrode": { "sedan": 550, "van": 850 },
  "attridgeville": { "sedan": 950, "van": 1350 },
  "albernte - alberton": { "sedan": 550, "van": 880 },
  "albetville": { "sedan": 680, "van": null },
  "balfour park / norwood": { "sedan": 550, "van": 750 },
  "bapsfontein": { "sedan": 800, "van": 1200 },
  "baragwanath hospital": { "sedan": 750, "van": 1200 },
  "benoni centre": { "sedan": 400, "van": 750 },
  "boksburg": { "sedan": 400, "van": 550 },
  "bronkhortspruit": { "sedan": 900, "van": 1250 },
  "braamfontein": { "sedan": 550, "van": 850 },
  "brynston": { "sedan": 700, "van": 980 },
  "brackenhurst": { "sedan": 650, "van": 980 },
  "brackendowns": { "sedan": 650, "van": 850 },
  "buccleigh": { "sedan": 600, "van": 850 },
  "brakpan": { "sedan": 500, "van": 850 },
  "bosmont": { "sedan": 700, "van": null },
  "bruma": { "sedan": 400, "van": 600 },
  "bedfordview": { "sedan": 400, "van": 600 },
  "brixton": { "sedan": 650, "van": 950 },
  "berea / yeoville": { "sedan": 550, "van": 850 },
  "birch acres": { "sedan": 450, "van": 700 },
  "bramley": { "sedan": 550, "van": 750 },
  "bassonia": { "sedan": 650, "van": 980 },
  "blaegorie": { "sedan": 700, "van": 980 },
  "brackensdown": { "sedan": 650, "van": 980 },
  "booysens": { "sedan": 600, "van": 800 },
  "benmore": { "sedan": 650, "van": 880 },
  "blackhealth": { "sedan": 700, "van": null },
  "brentwood park": { "sedan": 350, "van": 650 },
  "bonaero park": { "sedan": 350, "van": 600 },
  "bredell": { "sedan": 400, "van": 700 },
  "bezvalle": { "sedan": 450, "van": 750 },
  "brooklyn lodge (pta)": { "sedan": 700, "van": 980 },
  "cartonville": { "sedan": 1250, "van": 1950 },
  "carnival city": { "sedan": 550, "van": 880 },
  "city deep": { "sedan": 500, "van": 800 },
  "crystal park": { "sedan": 550, "van": 850 },
  "cerildene": { "sedan": 480, "van": 750 },
  "crown mines": { "sedan": 600, "van": 950 },
  "casedale (springs)": { "sedan": 700, "van": 1150 },
  "carousel": { "sedan": 1400, "van": 2200 },
  "centurion / midstream": { "sedan": 700, "van": 980 },
  "cresta": { "sedan": 780, "van": 980 },
  "cleveland": { "sedan": 450, "van": 900 },
  "claremont": { "sedan": 600, "van": 950 },
  "craigavon": { "sedan": 550, "van": 850 },
  "cosmos city": { "sedan": 790, "van": 1100 },
  "chloorkop": { "sedan": 400, "van": 750 },
  "copperleaf": { "sedan": 880, "van": 1230 },
  "craighall park": { "sedan": 650, "van": 950 },
  "daggafontein": { "sedan": 600, "van": 950 },
  "dalpark": { "sedan": 550, "van": 850 },
  "dersley": { "sedan": 550, "van": 850 },
  "devland": { "sedan": 850, "van": 1300 },
  "dunswart": { "sedan": 450, "van": 750 },
  "doorfontein": { "sedan": 550, "van": 800 },
  "duduza (nigel)": { "sedan": 750, "van": 980 },
  "douglasdale": { "sedan": 750, "van": 900 },
  "dawn park": { "sedan": 550, "van": 750 },
  "dunkeld": { "sedan": 650, "van": 850 },
  "daveyton": { "sedan": 600, "van": 800 },
  "diepkloof (soweto)": { "sedan": 800, "van": 950 },
  "discovery (roodepoort)": { "sedan": 900, "van": 1200 },
  "edanvale": { "sedan": 300, "van": 500 },
  "east rand mall": { "sedan": 250, "van": 550 },
  "eastgate": { "sedan": 400, "van": 600 },
  "eastville (springs)": { "sedan": 700, "van": 900 },
  "ester park": { "sedan": 350, "van": 680 },
  "eskom megawatt park": { "sedan": 600, "van": 850 },
  "elmapark": { "sedan": 300, "van": 650 },
  "eldorado park": { "sedan": 850, "van": 1100 },
  "elannsfontein": { "sedan": 350, "van": 600 },
  "edenpark": { "sedan": 650, "van": 850 },
  "ebony park": { "sedan": 550, "van": 850 },
  "emmarentia": { "sedan": 650, "van": 900 },
  "esselen park": { "sedan": 400, "van": 700 },
  "edleen / kempton park": { "sedan": 250, "van": 500 },
  "emperors palace": { "sedan": 250, "van": 500 },
  "eye of africa": { "sedan": 850, "van": 1100 },
  "fairland": { "sedan": 750, "van": 900 },
  "faerie glen": { "sedan": 750, "van": 900 },
  "fourways": { "sedan": 700, "van": 980 },
  "farramere": { "sedan": 500, "van": 800 },
  "fleurhof": { "sedan": 750, "van": 950 },
  "florida": { "sedan": 800, "van": 1100 },
  "freeway park": { "sedan": 600, "van": 850 },
  "fordsburg": { "sedan": 580, "van": 780 },
  "germiston": { "sedan": 550, "van": 950 },
  "gallagher estate": { "sedan": 650, "van": 950 },
  "glenmarais": { "sedan": 350, "van": 650 },
  "glen hazel": { "sedan": 450, "van": 750 },
  "garsfontein 9pta east": { "sedan": 680, "van": 980 },
  "grasmere": { "sedan": 700, "van": 1100 },
  "glenvista": { "sedan": 650, "van": 1000 },
  "glen austin (midrand)": { "sedan": 600, "van": 950 },
  "lembton": { "sedan": 550, "van": 950 },
  "grand central airport": { "sedan": 600, "van": 980 },
  "gold reef city": { "sedan": 600, "van": 900 },
  "greenstone": { "sedan": 350, "van": 600 },
  "greenside": { "sedan": 650, "van": 980 },
  "kwagasrand pretoria": { "sedan": 750, "van": 1200 },
  "haatebeespoort dam": { "sedan": 1400, "van": 2000 },
  "helderkuin": { "sedan": 850, "van": 1050 },
  "heildeburg": { "sedan": 900, "van": 1300 },
  "henepspark": { "sedan": 830, "van": 1400 },
  "highlands north": { "sedan": 550, "van": 850 },
  "honey dew": { "sedan": 850, "van": 1350 },
  "houghton": { "sedan": 550, "van": 950 },
  "hurlingham": { "sedan": 650, "van": 900 },
  "horison park": { "sedan": 700, "van": 1400 },
  "hollbrow": { "sedan": 550, "van": 850 },
  "hydepark": { "sedan": 650, "van": 950 },
  "herotdale": { "sedan": 450, "van": 750 },
  "hatfiel": { "sedan": 750, "van": 1200 },
  "ivory park": { "sedan": 550, "van": 850 },
  "iren": { "sedan": 650, "van": 950 },
  "isando": { "sedan": 250, "van": 500 },
  "illiondale": { "sedan": 350, "van": 650 },
  "illovo": { "sedan": 650, "van": 980 },
  "impala pack": { "sedan": 300, "van": 650 },
  "indaba hotel": { "sedan": 700, "van": 1100 },
  "industria": { "sedan": 650, "van": 980 },
  "jhb central": { "sedan": 550, "van": 800 },
  "jet park": { "sedan": 300, "van": 650 },
  "jhb zoo": { "sedan": 550, "van": 900 },
  "judith park / bezvalley": { "sedan": 450, "van": 700 },
  "juskel park": { "sedan": 700, "van": 980 },
  "jhb general hospital": { "sedan": 550, "van": 850 },
  "kaalfontein": { "sedan": 550, "van": 850 },
  "kempton park central": { "sedan": 250, "van": 500 },
  "kagiso": { "sedan": 950, "van": 1250 },
  "katlehong": { "sedan": 600, "van": 900 },
  "kew": { "sedan": 580, "van": 850 },
  "krugersdorp": { "sedan": 950, "van": 1200 },
  "kibler park": { "sedan": 850, "van": 950 },
  "killaney": { "sedan": 550, "van": 850 },
  "kensington park a": { "sedan": 450, "van": 800 },
  "kwa-thema": { "sedan": 650, "van": 950 },
  "klipspuit": { "sedan": 650, "van": 950 },
  "kayqlami": { "sedan": 650, "van": 950 },
  "klersdorp": { "sedan": 2800, "van": 3100 },
  "klipoortjie": { "sedan": 550, "van": 880 },
  "kessington b": { "sedan": 750, "van": 980 },
  "kramaville": { "sedan": 600, "van": 850 },
  "lakeside mall": { "sedan": 450, "van": 800 },
  "land mark lodge": { "sedan": 650, "van": 850 },
  "lenseria airport": { "sedan": 900, "van": 1200 },
  "larochelle": { "sedan": 600, "van": 850 },
  "lambton": { "sedan": 550, "van": 900 },
  "laudium": { "sedan": 950, "van": 1250 },
  "lenasia ext 1": { "sedan": 900, "van": 1200 },
  "lenasia south": { "sedan": 950, "van": 1250 },
  "lyndhurst": { "sedan": 550, "van": 850 },
  "limbro park": { "sedan": 600, "van": 800 },
  "linksfield": { "sedan": 500, "van": 750 },
  "linmeyer": { "sedan": 550, "van": 880 },
  "lyme park": { "sedan": 750, "van": 980 },
  "lonehill": { "sedan": 700, "van": 950 },
  "leeukoop prison": { "sedan": 700, "van": 950 },
  "little falls": { "sedan": 850, "van": 1100 },
  "linden": { "sedan": 750, "van": 1100 },
  "long meadow": { "sedan": 600, "van": 800 },
  "mackenzie park": { "sedan": 500, "van": 950 },
  "magaliesburg": { "sedan": 1700, "van": 2000 },
  "malvern": { "sedan": 500, "van": 800 },
  "melville": { "sedan": 650, "van": 980 },
  "melrose": { "sedan": 650, "van": 950 },
  "meyerton": { "sedan": 750, "van": null },
  "mayberry park": { "sedan": 550, "van": 850 },
  "mondeor": { "sedan": 650, "van": 980 },
  "mayfair": { "sedan": 580, "van": 900 },
  "morning side": { "sedan": 650, "van": 950 },
  "modderfontein": { "sedan": 450, "van": 850 },
  "meggawatt park": { "sedan": 600, "van": 950 },
  "moffat park": { "sedan": 600, "van": 950 },
  "morning hill": { "sedan": 450, "van": 650 },
  "mountain view": { "sedan": 680, "van": 980 },
  "menlyn": { "sedan": 700, "van": 950 },
  "marlboro gardens": { "sedan": 600, "van": 850 },
  "marula sun": { "sedan": 1500, "van": 1950 },
  "milpark": { "sedan": 650, "van": 950 },
  "mareleta park": { "sedan": 700, "van": 900 },
  "muldersdrift": { "sedan": 950, "van": 1500 },
  "monte casino": { "sedan": 750, "van": 1300 },
  "mamelodi": { "sedan": 950, "van": 1400 },
  "montana": { "sedan": 950, "van": 1400 },
  "mulberton": { "sedan": 650, "van": 1000 },
  "nasrec": { "sedan": 650, "van": 1100 },
  "nigel": { "sedan": 900, "van": 1500 },
  "noordwyk": { "sedan": 650, "van": 980 },
  "northclif": { "sedan": 750, "van": 1200 },
  "norwood": { "sedan": 550, "van": 980 },
  "oriental plaza": { "sedan": 580, "van": 950 },
  "oakdene": { "sedan": 550, "van": 950 },
  "observatory": { "sedan": 450, "van": 850 },
  "ormonde": { "sedan": 650, "van": 950 },
  "pretoria central": { "sedan": 750, "van": 1200 },
  "parkmore": { "sedan": 650, "van": 900 },
  "parktown": { "sedan": 600, "van": 880 },
  "parkview": { "sedan": 550, "van": 850 },
  "parkwood": { "sedan": 550, "van": 880 },
  "parkhurst": { "sedan": 650, "van": 850 },
  "primrose": { "sedan": 400, "van": 800 },
  "potchefsroom": { "sedan": 1950, "van": 2100 },
  "rosslyn": { "sedan": 1150, "van": 1950 },
  "randburg": { "sedan": 750, "van": 1050 },
  "sandton": { "sedan": 650, "van": 950 },
  "sasolburg": { "sedan": 1600, "van": 2100 },
  "secunda": { "sedan": 1600, "van": 2300 },
  "soweto": { "sedan": 850, "van": 1200 },
  "soshanguve": { "sedan": 1200, "van": 1850 },
  "tembisa": { "sedan": 500, "van": 800 },
  "vereeniging": { "sedan": 1200, "van": 1950 }
};

// --- 2. LOGIC START ---

function normalizePlace(str) {
  return (str || "").toLowerCase().replace(/[,]/g, " ").replace(/\s+/g, " ").trim();
}

function getFixedPrice(text) {
  const norm = normalizePlace(text);
  for (const key of Object.keys(pricingData)) {
    if (norm.includes(key)) return pricingData[key];
  }
  return null;
}


function selectRide(vehicleName, price, cardElement) {
  selectedVehicle = vehicleName;
  selectedPrice = "R" + price;
  const drop = document.getElementById('vehicle');
  if (drop) {
    if (vehicleName.includes("Van")) drop.value = "Express Van (2-6 Pax)";
    else if (vehicleName.includes("VIP")) drop.value = "Express VIP (Premium)";
    else drop.value = "Express Sedan (1-3 Pax)";
  }
  if (cardElement) {
    document.querySelectorAll('.price-card').forEach(c => c.classList.remove('selected'));
    cardElement.classList.add('selected');
  }
}

function showInquiryUI(reason) {
  const msg = document.getElementById("pricingMessage"), cards = document.getElementById("priceOptions");
  if (msg) {
    msg.style.display = "block";
    msg.innerHTML = `<div style="background:#fff7ed;border:1px solid #fdba74;padding:12px;border-radius:10px;color:#9a3412;"><strong>${reason}</strong><br>Quote confirmed after request.</div>`;
  }
  if (cards) cards.style.display = "none";
  selectedVehicle = reason; selectedPrice = "Quote required";
}

async function calculatePrice() {
  const service = document.getElementById("serviceType").value;
  const isTour = (service === "tour");
  const pickVal = document.getElementById("pickup").value;
  const dropVal = document.getElementById("dropoff").value;

  // Basic validation
  if (!startCoords || (!isTour && !endCoords)) {
    alert("Please select locations from the suggestions list.");
    return;
  }

  const resBox = document.getElementById('resultBox');
  const msgArea = document.getElementById("pricingMessage");
  const opts = document.getElementById('priceOptions');
  const distText = document.getElementById('distanceText');

  resBox.style.display = "block";
  msgArea.style.display = "none";
  opts.innerHTML = "";
  distText.innerText = "Gauteng Service Zone";

  // 1. Handle Tours (Always Manual Quote)
  if (isTour) {
    showInquiryUI("Tour Request");
    return;
  }

  // 2. Search your Fixed Price List (The ~200 locations)
  // This looks at both Pickup and Dropoff to find a match
  const match = getFixedPrice(pickVal) || getFixedPrice(dropVal);

  if (match) {
    // MATCH FOUND: Show your verified prices from the photos
    opts.style.display = "grid";
    opts.innerHTML = `
      ${match.sedan ? `
      <div class="price-card" onclick="selectRide('Express Sedan', ${match.sedan}, this)">
        <h4>Standard Sedan</h4>
        <span class="price">R${match.sedan}</span>
        <small>Fixed Rate</small>
      </div>` : ''}
      
      ${match.van ? `
      <div class="price-card selected" onclick="selectRide('Express Van', ${match.van}, this)">
        <h4>Express Van</h4>
        <span class="price">R${match.van}</span>
        <small>Fixed Rate</small>
      </div>` : ''}
    `;
    // Auto-select the Van if available, otherwise Sedan
    selectRide(match.van ? 'Express Van' : 'Express Sedan', match.van || match.sedan, null);
  } else {
    // 3. NO MATCH: This stops the Port Elizabeth/wrong distance error
    showInquiryUI("Custom Route Required");
  }

  // Zoom map to show the route
  if (startCoords && endCoords) {
    map.fitBounds(L.latLngBounds([startCoords, endCoords]), {padding: [50, 50]});
  }
}

// Add this helper if you don't have it:
function showInquiryUI(reason) {
  const msgArea = document.getElementById("pricingMessage");
  const opts = document.getElementById('priceOptions');
  msgArea.style.display = "block";
  msgArea.innerHTML = `
    <div style="background:#fff7ed;border:1px solid #fdba74;padding:12px;border-radius:10px;color:#9a3412;text-align:center;">
      <strong>${reason}</strong><br>
      This route is outside our standard local zone. Please submit your request for a manual quote.
    </div>`;
  opts.style.display = "none";
  selectedPrice = "Quote required";
  selectedVehicle = reason;
}

// --- 3. AUTOCOMPLETE & MAP INIT ---

document.addEventListener('DOMContentLoaded', () => {
  map = L.map('map').setView([-26.1367, 28.2411], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  document.getElementById("serviceType").addEventListener("change", () => {
    const isTour = (document.getElementById("serviceType").value === "tour");
    document.getElementById("tourTypeGroup").style.display = isTour ? "block" : "none";
  });
});

async function fetchSuggestions(query, listEl, inputEl, type) {
// REPLACE the old URL line with this one:
const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=za&viewbox=${SEARCH_BOUNDS}&bounded=1&limit=6`;  const resp = await fetch(url), data = await resp.json();
  listEl.innerHTML = '';
  if (!data.length) { listEl.style.display = 'none'; return; }
  listEl.style.display = 'block';
  data.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${p.name || "Location"}</strong><br><small>${p.display_name}</small>`;
    li.onclick = () => {
      inputEl.value = p.display_name;
      const coords = [parseFloat(p.lat), parseFloat(p.lon)];
      if (type === 'start') {
        startCoords = coords; if (pickupMarker) map.removeLayer(pickupMarker);
        pickupMarker = L.marker(coords).addTo(map).bindPopup("Pickup").openPopup();
      } else {
        endCoords = coords; if (dropoffMarker) map.removeLayer(dropoffMarker);
        dropoffMarker = L.marker(coords).addTo(map).bindPopup("Drop-off").openPopup();
      }
      listEl.style.display = 'none'; map.setView(coords, 13);
    };
    listEl.appendChild(li);
  });
}

const pIn = document.getElementById('pickup'), dIn = document.getElementById('dropoff'), pL = document.getElementById('pickupSuggestions'), dL = document.getElementById('dropoffSuggestions');
let dBT;
pIn.addEventListener('input', () => { clearTimeout(dBT); dBT = setTimeout(() => fetchSuggestions(pIn.value, pL, pIn, 'start'), 300); });
dIn.addEventListener('input', () => { clearTimeout(dBT); dBT = setTimeout(() => fetchSuggestions(dIn.value, dL, dIn, 'end'), 300); });

function useMyLocation(e) {
  e.preventDefault();
  navigator.geolocation.getCurrentPosition(pos => {
    startCoords = [pos.coords.latitude, pos.coords.longitude];
    pIn.value = "Current GPS Location";
    if (pickupMarker) map.removeLayer(pickupMarker);
    pickupMarker = L.marker(startCoords).addTo(map).bindPopup("Your Location").openPopup();
    map.setView(startCoords, 14);
  });
}

// --- 4. FORM SUBMIT ---

document.getElementById('bookingForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const data = {
    name: document.getElementById("fullName").value,
    phone: document.getElementById("phone").value,
    pickup: document.getElementById("pickup").value,
    dropoff: document.getElementById("dropoff").value,
    vehicle: selectedVehicle,
    price: selectedPrice
  };
  const msg = `Booking Request\nName: ${data.name}\nPhone: ${data.phone}\nFrom: ${data.pickup}\nTo: ${data.dropoff}\nVehicle: ${data.vehicle}\nPrice: ${data.price}`;
  window.open(`https://wa.me/27678571974?text=${encodeURIComponent(msg)}`, "_blank");
});

window.calculatePrice = calculatePrice;
window.useMyLocation = useMyLocation;