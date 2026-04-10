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
            headers: { "Content-Type": "application/json" },
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
            headers: { "Content-Type": "application/json" },
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
