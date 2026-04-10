const API_URL = "https://famished-cowedly-larry.ngrok-free.dev";

const storedUser = JSON.parse(localStorage.getItem("user"));

if (!storedUser || storedUser.role !== 'admin') {
    window.location = "index.html";
}

let map;
let adminMarkers = {}; // Store markers by vehicle ID

// Initialize Map
function initMap() {
    map = L.map('map', { zoomControl: false }).setView([18.5204, 73.8567], 13);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
}

initMap();

async function pollVehicles() {
    try {
        const res = await fetch(`${API_URL}/vehicles/all`);
        const vehicles = await res.json();
        
        updateStats(vehicles);
        updateMap(vehicles);
        updateList(vehicles);
    } catch (err) {
        console.error("Polling error:", err);
    }
}

function updateStats(vehicles) {
    document.getElementById("total-v").innerText = vehicles.length;
    document.getElementById("active-count").innerText = vehicles.filter(v => v.status !== 'offline').length;
}

function updateMap(vehicles) {
    vehicles.forEach(v => {
        if (adminMarkers[v.id]) {
            // Update existing marker
            adminMarkers[v.id].setLatLng([v.lat, v.lng]);
            adminMarkers[v.id].getPopup().setContent(`<b>${v.vehicle_name}</b><br>Driver: ${v.driver_name}<br>Speed: ${v.speed} km/h`);
        } else {
            // Create new marker
            const marker = L.marker([v.lat, v.lng]).addTo(map)
                .bindPopup(`<b>${v.vehicle_name}</b><br>Driver: ${v.driver_name}<br>Speed: ${v.speed} km/h`);
            adminMarkers[v.id] = marker;
        }
    });

    // Remove adminMarkers for vehicles no longer in list if necessary
    // (Simple implementation skips cleanup for prototype stability)
}


function updateList(vehicles) {
    const list = document.getElementById("fleet-list");
    list.innerHTML = "";
    
    vehicles.forEach(v => {
        const isActive = v.status !== 'offline';
        list.innerHTML += `
            <div class="p-4 bg-gray-900 rounded-2xl border border-white/5 hover:border-indigo-500/50 transition-all group cursor-pointer" onclick="focusVehicle(${v.lat}, ${v.lng})">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="font-bold text-white group-hover:text-indigo-400">${v.vehicle_name}</h3>
                        <p class="text-[10px] text-gray-400 font-medium">DRI: ${v.driver_name.toUpperCase()}</p>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'}">
                        ${v.status}
                    </span>
                </div>
                <div class="flex justify-between items-center text-xs">
                    <span class="text-gray-500">Speed: <b class="text-white">${v.speed} km/h</b></span>
                    <svg class="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M24 12a12 12 0 11-24 0 12 12 0 0124 0z"></path></svg>
                </div>
            </div>`;
    });
}

function focusVehicle(lat, lng) {
    map.flyTo([lat, lng], 16);
}

// Initial poll and interval
pollVehicles();
setInterval(pollVehicles, 3000);
