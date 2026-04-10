const API_URL = "http://localhost:5000";
const storedUser = JSON.parse(localStorage.getItem("user"));

if (!storedUser || storedUser.role !== 'driver') {
    window.location = "index.html";
}

document.getElementById("user-name").innerText = storedUser.name;

let map;
let marker;
let trackingId = null;
let mockInterval = null;
let vehicleId = null;

// Initialize Map
function initMap() {
    map = L.map('map', { zoomControl: false }).setView([18.5204, 73.8567], 15);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    marker = L.marker([18.5204, 73.8567]).addTo(map);
}

initMap();

// Get Vehicle ID for this driver
async function fetchVehicle() {
    const res = await fetch(`${API_URL}/vehicles/${storedUser.id}`);
    const vehicles = await res.json();
    if (vehicles.length > 0) {
        vehicleId = vehicles[0].id;
    } else {
        // Auto-create if doesn't exist for this prototype
        const createRes = await fetch(`${API_URL}/vehicles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: storedUser.id, vehicle_name: "My Vehicle" })
        });
        const created = await fetch(`${API_URL}/vehicles/${storedUser.id}`);
        const data = await created.json();
        vehicleId = data[0].id;
    }
}
fetchVehicle();

// --- REAL GPS TRACKING ---
function toggleOnline() {
    if (trackingId) {
        navigator.geolocation.clearWatch(trackingId);
        trackingId = null;
        updateUI('offline');
    } else {
        if (!navigator.geolocation) return alert("Geolocation not supported!");
        
        trackingId = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, speed } = pos.coords;
                updateLocation(latitude, longitude, speed || 0, 'online');
            },
            (err) => console.error(err),
            { enableHighAccuracy: true }
        );
        updateUI('online');
    }
}

// --- MOCK ROAD MOVEMENT ---
async function toggleMock() {
    if (mockInterval) {
        clearInterval(mockInterval);
        mockInterval = null;
        updateUI('mock-off');
    } else {
        const start = marker.getLatLng();
        // Pick a random destination within ~1km
        const dest = L.latLng(
            start.lat + (Math.random() - 0.5) / 50,
            start.lng + (Math.random() - 0.5) / 50
        );

        const router = L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' });
        
        router.route([
            { latLng: start },
            { latLng: dest }
        ], (err, routes) => {
            if (err || !routes || routes.length === 0) return alert("Could not find road path!");
            
            const points = routes[0].coordinates;
            let index = 0;
            
            mockInterval = setInterval(() => {
                if (index >= points.length) {
                    clearInterval(mockInterval);
                    mockInterval = null;
                    updateUI('mock-off');
                    return;
                }
                
                const p = points[index];
                updateLocation(p.lat, p.lng, Math.floor(Math.random() * 20 + 30), 'simulated');
                index++;
            }, 1000);
            
            updateUI('mock-on');
        });
    }
}

// Update Database & Map
async function updateLocation(lat, lng, speed, status) {
    const coords = [lat, lng];
    marker.setLatLng(coords);
    map.panTo(coords);
    
    document.getElementById("speed").innerText = speed.toFixed(0);

    if (vehicleId) {
        await fetch(`${API_URL}/vehicles/update/${vehicleId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                lat, 
                lng, 
                speed, 
                status, 
                driver_name: storedUser.name 
            })
        });
    }
}


function updateUI(state) {
    const statusEl = document.getElementById("gps-status");
    const onlineBtn = document.getElementById("online-btn");
    const mockBtn = document.getElementById("mock-btn");

    if (state === 'online') {
        statusEl.innerText = "Online";
        statusEl.className = "text-sm font-bold text-green-400 uppercase";
        onlineBtn.classList.add("bg-red-600");
        document.getElementById("online-text").innerText = "STOP TRACKING";
    } else if (state === 'offline') {
        statusEl.innerText = "Offline";
        statusEl.className = "text-sm font-bold text-red-400 uppercase";
        onlineBtn.classList.remove("bg-red-600");
        document.getElementById("online-text").innerText = "GO ONLINE (REAL GPS)";
    } else if (state === 'mock-on') {
        mockBtn.classList.add("bg-indigo-600");
        document.getElementById("mock-text").innerText = "STOP MOCK";
    } else if (state === 'mock-off') {
        mockBtn.classList.remove("bg-indigo-600");
        document.getElementById("mock-text").innerText = "START MOCK (ROAD ONLY)";
    }
}
