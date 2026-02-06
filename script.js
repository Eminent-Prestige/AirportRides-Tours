document.getElementById('year').textContent = new Date().getFullYear();

let map;
let pickupMarker = null;
let dropoffMarker = null;

let startCoords = null; // [lat, lon]
let endCoords = null;   // [lat, lon]

let selectedVehicle = "Not Selected";
let selectedPrice = "Pending";
let lastDistanceKm = null;

const LONG_DISTANCE_THRESHOLD_KM = 250;

const PRICING = {
  standard: {
    base: 250,
    tiers: [
      { upTo: 30, rate: 18 },
      { upTo: 120, rate: 14 },
      { upTo: 250, rate: 11 }
    ]
  },
  vito: {
    base: 500,
    tiers: [
      { upTo: 30, rate: 20 },
      { upTo: 120, rate: 16 },
      { upTo: 250, rate: 13 }
    ]
  },
  vip: {
    base: 650,
    tiers: [
      { upTo: 30, rate: 24 },
      { upTo: 120, rate: 19 },
      { upTo: 250, rate: 16 }
    ]
  }
};

const LONG_DISTANCE_TABLE = {
  "durban":       { standard: 7000, vito: 8900, vip: 10500 },
  "cape town":    { standard: 22000, vito: 25000, vip: 28000 },
  "bloemfontein": { standard: 8500, vito: 10500, vip: 12500 },
  "polokwane":    { standard: 3500, vito: 4800, vip: 6000 },
  "nelspruit":    { standard: 3000, vito: 4200, vip: 5200 },
  "mbombela":     { standard: 3000, vito: 4200, vip: 5200 },
  "rustenburg":   { standard: 1800, vito: 2500, vip: 3200 },
  "gaborone":     { standard: 5500, vito: 7200, vip: 8800 },
  "maputo":       { standard: 6000, vito: 7800, vip: 9500 }
};

function tieredPrice(distanceKm, key) {
  const cfg = PRICING[key];
  let cost = cfg.base;
  let prev = 0;

  for (const tier of cfg.tiers) {
    const bandKm = Math.max(0, Math.min(distanceKm, tier.upTo) - prev);
    cost += bandKm * tier.rate;
    prev = tier.upTo;
    if (distanceKm <= tier.upTo) break;
  }
  return Math.ceil(cost);
}

function normalizePlace(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchLongDistanceKey(dropoffText) {
  const text = normalizePlace(dropoffText);
  for (const key of Object.keys(LONG_DISTANCE_TABLE)) {
    if (text.includes(key)) return key;
  }
  return null;
}

function showLongDistanceUI(distanceKm) {
  const msg = document.getElementById("pricingMessage");
  const cards = document.getElementById("priceOptions");
  const note = document.getElementById("smallNote");

  if (msg) {
    msg.style.display = "block";
    msg.innerHTML = `
      <div style="background:#fff7ed;border:1px solid #fdba74;padding:12px;border-radius:10px;">
        <p style="margin:0;color:#9a3412;font-weight:800;">
          Long distance trip detected (${distanceKm.toFixed(0)} km)
        </p>
        <p style="margin:6px 0 0;color:#9a3412;">
          Pricing for long distance or cross-border trips is arranged manually.
          Submit your request and we will confirm the quote.
        </p>
      </div>
    `;
  }

  if (cards) {
    cards.style.display = "none";
    cards.innerHTML = "";
  }

  if (note) note.textContent = "Long distance pricing is confirmed after request.";

  selectedVehicle = "Long distance or cross-border";
  selectedPrice = "Quote required";
}

function showFixedLongDistancePrices(cityKey, distanceKm) {
  const prices = LONG_DISTANCE_TABLE[cityKey];
  const msg = document.getElementById("pricingMessage");
  const cards = document.getElementById("priceOptions");
  const note = document.getElementById("smallNote");

  if (msg) {
    msg.style.display = "block";
    msg.innerHTML = `
      <div style="background:#ecfeff;border:1px solid #67e8f9;padding:12px;border-radius:10px;">
        <p style="margin:0;color:#155e75;font-weight:800;">
          Route pricing available for ${cityKey.toUpperCase()} (${distanceKm.toFixed(0)} km)
        </p>
        <p style="margin:6px 0 0;color:#155e75;">
          Select an option below
        </p>
      </div>
    `;
  }

  if (cards) {
    cards.style.display = "grid";
    cards.innerHTML = `
      <div class="price-card" onclick="selectRide('Standard', ${prices.standard}, this)">
        <h4>Standard</h4>
        <span class="price">R${prices.standard}</span>
        <small>Fixed route</small>
      </div>

      <div class="price-card selected" onclick="selectRide('Mercedes Vito', ${prices.vito}, this)">
        <h4>Business Van</h4>
        <span class="price">R${prices.vito}</span>
        <small>Fixed route</small>
      </div>

      <div class="price-card" onclick="selectRide('VIP E-Class', ${prices.vip}, this)">
        <h4>VIP Class</h4>
        <span class="price">R${prices.vip}</span>
        <small>Fixed route</small>
      </div>
    `;
  }

  if (note) note.textContent = "Fixed route pricing is confirmed after request.";

  selectRide("Mercedes Vito", prices.vito, null);
}

function showShortDistanceUI() {
  const msg = document.getElementById("pricingMessage");
  const cards = document.getElementById("priceOptions");
  const note = document.getElementById("smallNote");

  if (msg) {
    msg.style.display = "none";
    msg.innerHTML = "";
  }

  if (cards) cards.style.display = "grid";
  if (note) note.textContent = "Tap a price to select it. Final quote confirmed after request.";
}

function selectRide(vehicleName, price, cardElement) {
  selectedVehicle = vehicleName;
  selectedPrice = "R" + price;

  const dropdown = document.getElementById('vehicle');
  if (dropdown) {
    if (vehicleName.includes("Vito")) dropdown.value = "Mercedes-Benz Vito";
    else if (vehicleName.includes("E-Class")) dropdown.value = "Mercedes-Benz E-Class";
    else dropdown.value = "Any";
  }

  if (cardElement) {
    document.querySelectorAll('.price-card').forEach(c => c.classList.remove('selected'));
    cardElement.classList.add('selected');
  }
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function updateServiceUI() {
  const serviceType = document.getElementById("serviceType");
  const tourTypeGroup = document.getElementById("tourTypeGroup");
  const notesGroup = document.getElementById("notesGroup");

  if (!serviceType) return;

  const v = serviceType.value;

  if (v === "tour") {
    if (tourTypeGroup) tourTypeGroup.style.display = "block";
    if (notesGroup) notesGroup.style.display = "block";

    selectedVehicle = "Not Selected";
    selectedPrice = "Quote required";
  } else {
    if (tourTypeGroup) tourTypeGroup.style.display = "none";
    if (notesGroup) notesGroup.style.display = "block";
  }
}

document.addEventListener('DOMContentLoaded', function() {
  map = L.map('map').setView([-26.1367, 28.2411], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  const serviceType = document.getElementById("serviceType");
  const service = getQueryParam("service");
  if (serviceType && service) {
    serviceType.value = service;
  }
  if (serviceType) {
    serviceType.addEventListener("change", updateServiceUI);
  }
  updateServiceUI();
});

const pickupInput = document.getElementById('pickup');
const dropoffInput = document.getElementById('dropoff');
const pickupList = document.getElementById('pickupSuggestions');
const dropoffList = document.getElementById('dropoffSuggestions');

pickupInput.addEventListener('input', () => handleInput(pickupInput, pickupList, 'start'));
dropoffInput.addEventListener('input', () => handleInput(dropoffInput, dropoffList, 'end'));

document.addEventListener('click', function(e) {
  if (e.target !== pickupInput) pickupList.style.display = 'none';
  if (e.target !== dropoffInput) dropoffList.style.display = 'none';
});

let debounceTimer;

function handleInput(inputElement, listElement, type) {
  clearTimeout(debounceTimer);
  const query = inputElement.value.trim();
  if (query.length < 3) { listElement.style.display = 'none'; return; }
  debounceTimer = setTimeout(() => {
    fetchSuggestions(query, listElement, inputElement, type);
  }, 300);
}

async function fetchSuggestions(query, listElement, inputElement, type) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=za&addressdetails=1&limit=6`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    listElement.innerHTML = '';
    if (!data || data.length === 0) {
      listElement.style.display = 'none';
      return;
    }

    listElement.style.display = 'block';
    data.forEach(place => {
      const li = document.createElement('li');
      const mainName = place.name || (place.address && (place.address.road || place.address.suburb)) || "Location";
      li.innerHTML = `<strong>${mainName}</strong><span style="display:block; font-size:0.8em; color:#666;">${place.display_name}</span>`;

      li.onclick = () => {
        inputElement.value = place.display_name;

        const coords = [parseFloat(place.lat), parseFloat(place.lon)];
        if (type === 'start') {
          startCoords = coords;
          if (pickupMarker) map.removeLayer(pickupMarker);
          pickupMarker = L.marker(coords).addTo(map).bindPopup("Pickup");
          pickupMarker.openPopup();
        } else {
          endCoords = coords;
          if (dropoffMarker) map.removeLayer(dropoffMarker);
          dropoffMarker = L.marker(coords).addTo(map).bindPopup("Drop-off");
          dropoffMarker.openPopup();
        }

        listElement.style.display = 'none';
        map.setView(coords, 13);

        const serviceType = document.getElementById("serviceType");
        const isTour = serviceType && serviceType.value === "tour";

        selectedVehicle = "Not Selected";
        selectedPrice = isTour ? "Quote required" : "Pending";
        lastDistanceKm = null;
      };

      listElement.appendChild(li);
    });

  } catch (error) {
    console.error("Autocomplete error:", error);
    listElement.style.display = 'none';
  }
}

function useMyLocation(e) {
  e.preventDefault();

  if (!navigator.geolocation) {
    alert("Geolocation not supported.");
    return;
  }

  pickupInput.placeholder = "Locating...";
  navigator.geolocation.getCurrentPosition(position => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    startCoords = [lat, lon];
    pickupInput.value = "Current GPS Location";

    if (pickupMarker) map.removeLayer(pickupMarker);
    pickupMarker = L.marker(startCoords).addTo(map).bindPopup("Your Location").openPopup();
    map.setView(startCoords, 14);

    pickupInput.placeholder = "Type to search (e.g. OR Tambo)";

    const serviceType = document.getElementById("serviceType");
    const isTour = serviceType && serviceType.value === "tour";

    selectedVehicle = "Not Selected";
    selectedPrice = isTour ? "Quote required" : "Pending";
    lastDistanceKm = null;
  }, () => {
    pickupInput.placeholder = "Type to search (e.g. OR Tambo)";
    alert("Could not access location.");
  });
}

async function calculatePrice() {
  const serviceType = document.getElementById("serviceType");
  const isTour = serviceType && serviceType.value === "tour";

  if (!startCoords || !endCoords) {
    alert("Please select locations from the suggestions list first.");
    return;
  }

  if (isTour) {
    selectedVehicle = "Not Selected";
    selectedPrice = "Quote required";

    document.getElementById('resultBox').style.display = "block";
    document.getElementById('distanceText').innerText = "Tour request";

    const msg = document.getElementById("pricingMessage");
    const cards = document.getElementById("priceOptions");
    const note = document.getElementById("smallNote");

    if (msg) {
      msg.style.display = "block";
      msg.innerHTML = `
        <div style="background:#fff7ed;border:1px solid #fdba74;padding:12px;border-radius:10px;">
          <p style="margin:0;color:#9a3412;font-weight:800;">
            Tour pricing is confirmed after request
          </p>
          <p style="margin:6px 0 0;color:#9a3412;">
            Please submit your tour details and we will confirm the quote.
          </p>
        </div>
      `;
    }
    if (cards) {
      cards.style.display = "none";
      cards.innerHTML = "";
    }
    if (note) note.textContent = "Quote required for tours.";

    return;
  }

  const url = `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=false`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.routes || !data.routes[0]) {
      alert("Could not calculate route. Try selecting again.");
      return;
    }

    const distanceKmNum = data.routes[0].distance / 1000;
    lastDistanceKm = distanceKmNum;

    document.getElementById('resultBox').style.display = "block";
    document.getElementById('distanceText').innerText = distanceKmNum.toFixed(1) + " km";

    if (distanceKmNum > LONG_DISTANCE_THRESHOLD_KM) {
      const dropoffText = document.getElementById("dropoff").value;
      const key = matchLongDistanceKey(dropoffText);

      if (key) {
        showFixedLongDistancePrices(key, distanceKmNum);
      } else {
        showLongDistanceUI(distanceKmNum);
      }

      const bounds = L.latLngBounds([startCoords, endCoords]);
      map.fitBounds(bounds, {padding: [50, 50]});
      return;
    }

    showShortDistanceUI();

    const priceStandard = tieredPrice(distanceKmNum, "standard");
    const priceVito = tieredPrice(distanceKmNum, "vito");
    const priceVIP = tieredPrice(distanceKmNum, "vip");

    const priceOptions = document.getElementById('priceOptions');
    priceOptions.innerHTML = `
      <div class="price-card" onclick="selectRide('Standard', ${priceStandard}, this)">
        <h4>Standard</h4>
        <span class="price">R${priceStandard}</span>
        <small>Standard sedan</small>
      </div>

      <div class="price-card selected" onclick="selectRide('Mercedes Vito', ${priceVito}, this)">
        <h4>Business Van</h4>
        <span class="price">R${priceVito}</span>
        <small>Mercedes Vito</small>
      </div>

      <div class="price-card" onclick="selectRide('VIP E-Class', ${priceVIP}, this)">
        <h4>VIP Class</h4>
        <span class="price">R${priceVIP}</span>
        <small>Mercedes E-Class</small>
      </div>
    `;
    priceOptions.style.display = "grid";

    selectRide('Mercedes Vito', priceVito, null);

    const bounds = L.latLngBounds([startCoords, endCoords]);
    map.fitBounds(bounds, {padding: [50, 50]});

  } catch (error) {
    console.error(error);
    alert("Could not calculate route.");
  }
}

const form = document.getElementById('bookingForm');

form.addEventListener('submit', function(e) {
  e.preventDefault();

  const serviceType = document.getElementById("serviceType");
  const service = serviceType ? serviceType.value : "";

  if (service !== "tour" && selectedPrice === "Pending") {
    alert("Please click Check Price Estimate before confirming.");
    return;
  }

  const name = document.getElementById("fullName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  const pickup = document.getElementById("pickup").value.trim();
  const dropoff = document.getElementById("dropoff").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const passengers = document.getElementById("passengers").value;

  const tourType = document.getElementById("tourType") ? document.getElementById("tourType").value : "";
  const notes = document.getElementById("notes") ? document.getElementById("notes").value.trim() : "";

  const distanceLine = (lastDistanceKm !== null) ? ` Distance: ${lastDistanceKm.toFixed(1)} km%0A` : "";

  const text =
    `New Web Booking%0A%0A` +
    ` Name: ${encodeURIComponent(name)}%0A` +
    ` Phone: ${encodeURIComponent(phone)}%0A` +
    (email ? ` Email: ${encodeURIComponent(email)}%0A` : "") +
    (service ? ` Service: ${encodeURIComponent(service)}%0A` : "") +
    (service === "tour" && tourType ? ` Tour Type: ${encodeURIComponent(tourType)}%0A` : "") +
    (notes ? ` Notes: ${encodeURIComponent(notes)}%0A` : "") +
    ` Pickup: ${encodeURIComponent(pickup)}%0A` +
    ` Drop-off: ${encodeURIComponent(dropoff)}%0A` +
    distanceLine +
    ` Date: ${encodeURIComponent(date)}%0A` +
    ` Time: ${encodeURIComponent(time)}%0A` +
    ` Passengers: ${encodeURIComponent(passengers)}%0A` +
    ` Selected Ride: ${encodeURIComponent(selectedVehicle)}%0A` +
    ` Est. Price: ${encodeURIComponent(selectedPrice)}`;

  window.open(`https://wa.me/27665922166?text=${text}`, "_blank");
});

window.calculatePrice = calculatePrice;
window.useMyLocation = useMyLocation;
window.selectRide = selectRide;
