const API = "https://famished-cowedly-larry.ngrok-free.dev";


let user = JSON.parse(localStorage.getItem("user"));
let markers = []; // To keep track of markers and clear them

// NAVIGATION
function showLogin() {
    document.getElementById("auth-login-section")?.classList.remove("hidden");
    document.getElementById("auth-register-section")?.classList.add("hidden");
    document.getElementById("hero-section")?.classList.add("hidden");
}

function showRegister() {
    document.getElementById("auth-register-section")?.classList.remove("hidden");
    document.getElementById("auth-login-section")?.classList.add("hidden");
    document.getElementById("hero-section")?.classList.add("hidden");
}

function showHero() {
    document.getElementById("hero-section")?.classList.remove("hidden");
    document.getElementById("auth-login-section")?.classList.add("hidden");
    document.getElementById("auth-register-section")?.classList.add("hidden");
}

function goDashboard() {
    if (user) {
        if (user.role === 'admin') window.location = "admin.html";
        else window.location = "driver.html";
    } else {
        showLogin();
    }
}


function logout() {
    localStorage.removeItem("user");
    window.location = "index.html";
}

// REGISTER
async function register() {
    const name = document.getElementById("reg-name").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;

    if (!name || !email || !password) return alert("Please fill all fields");

    try {
        const res = await fetch(API + "/auth/register", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "69420"
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        alert(data.message);
        showLogin();
    } catch (err) {
        console.error(err);
        alert("Registration failed");
    }
}

// LOGIN
async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch(API + "/auth/login", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "69420"
            },
            body: JSON.stringify({ email, password }),
        });


        if (!res.ok) throw new Error("Invalid credentials");

        const data = await res.json();
        localStorage.setItem("user", JSON.stringify(data));
        
        // Role-based redirection
        if (data.role === 'admin') {
            window.location = "admin.html";
        } else {
            window.location = "driver.html";
        }
    } catch (err) {
        alert(err.message);
    }
}


// MAP & DASHBOARD UTILS (Shared)
// Specific logic for Driver/Admin moved to driver.js / admin.js

// Landing Page Map Preview
function initPreviewMap() {
    const mapContainer = document.getElementById('map-preview');
    if (!mapContainer) return;

    const map = L.map('map-preview', { 
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false
    }).setView([18.5204, 73.8567], 14);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    // Simulated Vehicles
    const vehicles = [
        { id: 1, pos: [18.5230, 73.8500], color: '#6366f1' },
        { id: 2, pos: [18.5150, 73.8650], color: '#ec4899' }
    ];

    const markers = vehicles.map(v => {
        const icon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: ${v.color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${v.color};"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        });
        return {
            marker: L.marker(v.pos, { icon }).addTo(map),
            lat: v.pos[0],
            lng: v.pos[1]
        };
    });

    // Animate markers
    setInterval(() => {
        markers.forEach(m => {
            m.lat += (Math.random() - 0.5) * 0.0005;
            m.lng += (Math.random() - 0.5) * 0.0005;
            m.marker.setLatLng([m.lat, m.lng]);
        });
    }, 2000);
}

// Initialize on load
if (document.getElementById('map-preview')) {
    initPreviewMap();
}
