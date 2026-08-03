const consoleContainer = document.getElementById('console');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

const beepSound = new Audio('beep.mp3.wav');

// Bloqueos de navegación
window.addEventListener('beforeunload', (e) => { e.preventDefault(); e.returnValue = ''; });
document.addEventListener('contextmenu', (e) => e.preventDefault());

document.getElementById('start-btn').addEventListener('click', async () => {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
    }
    document.getElementById('overlay').style.display = 'none';

    if ('Notification' in window && Notification.permission !== 'granted') {
        await Notification.requestPermission();
    }

    startHackSimulation();
});

function getTime() {
    const d = new Date();
    return `[${d.toTimeString().split(' ')[0]}]`;
}

function getGPUInfo() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    } catch (e) {
        return "Generic/Integrated Graphics";
    }
}

async function getBatteryInfo() {
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            return `${Math.round(battery.level * 100)}% (${battery.charging ? "AC" : "BAT"})`;
        } catch (e) {
            return "N/A";
        }
    }
    return "N/A";
}

async function startHackSimulation() {
    const screenRes = `${window.screen.width}x${window.screen.height}`;
    const batteryInfo = await getBatteryInfo();
    const gpuInfo = getGPUInfo();
    const cpuCores = navigator.hardwareConcurrency || "4";

    let ipData = { ip: "127.0.0.1", city: "Unknown", country_name: "Unset", org: "Local" };

    try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) { ipData = await res.json(); }
    } catch (e) {}

    // Mensajes con formato de consola de exploit/sistema
    const logMessages = [
        { type: "info", text: "Initializing framework core v4.18.0-sys..." },
        { type: "info", text: "Establishing socket stream on remote endpoint..." },
        { type: "warn", text: `TARGET IDENTIFIED -> IP: ${ipData.ip} [GEO: ${ipData.city}, ${ipData.country_name}]` },
        { type: "info", text: `ISP Route: ${ipData.org}` },
        { type: "info", text: `System Architecture: ${navigator.platform} | CPU Cores: ${cpuCores}` },
        { type: "info", text: `Display Metrics: ${screenRes} | GPU: ${gpuInfo}` },
        { type: "info", text: `Power Management Status: ${batteryInfo}` },
        { type: "warn", text: "Probing heap memory space at 0x7FFF92A0..." },
        { type: "data", text: "0x7FFF92A0: 4F 6B 2D 80 12 A9 00 FF 34 D1 88 CE 10 A2 FF 01" },
        { type: "data", text: "0x7FFF92B0: A1 B2 C3 D4 E5 F6 07 18 29 3A 4B 5C 6D 7E 8F 90" },
        { type: "warn", text: "Injecting payload into primary buffer..." },
        { type: "alert", text: "CRITICAL: Exfiltrating browser session cookies & local tokens..." }
    ];

    let messageIndex = 0;

    function printMessage() {
        if (messageIndex < logMessages.length) {
            const item = logMessages[messageIndex];
            const p = document.createElement('p');

            let classType = "log-info";
            if (item.type === "warn") classType = "log-warn";
            if (item.type === "alert") classType = "log-alert";
            if (item.type === "data") classType = "log-data";

            p.innerHTML = `<span class="log-time">${getTime()}</span> <span class="${classType}">${item.text}</span>`;

            consoleContainer.appendChild(p);
            consoleContainer.scrollTop = consoleContainer.scrollHeight;

            beepSound.currentTime = 0;
            beepSound.play().catch(() => {});

            if ('vibrate' in navigator) { navigator.vibrate(20); }

            messageIndex++;
            setTimeout(printMessage, Math.floor(Math.random() * 300) + 100);
        } else {
            setTimeout(startProgressBar, 300);
        }
    }

    function startProgressBar() {
        progressContainer.style.display = 'block';
        let progress = 0;

        const interval = setInterval(() => {
            if (progress < 85) {
                progress += Math.floor(Math.random() * 8) + 1;
            } else if (progress < 99) {
                progress += 1;
            }

            if (progress > 99) {
                progress = 99;
                clearInterval(interval);
                sendCriticalNotification();

                if ('vibrate' in navigator) {
                    navigator.vibrate([150, 50, 150, 50, 300]);
                }

                setTimeout(showFinalTroll, 2500);
            }

            progressFill.style.width = `${progress}%`;
            progressText.textContent = `[PROCESS] DUMPING MEMORY TO REMOTE SERVER: ${progress}%`;
        }, 150);
    }

    function sendCriticalNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification("SYSTEM BREACH ALERT", {
                body: "Unauthorized memory dump detected on current host.",
                icon: "https://cdn-icons-png.flaticon.com/512/564/564619.png"
            });
        }
    }

    function showFinalTroll() {
        consoleContainer.innerHTML = '';
        progressContainer.style.display = 'none';

        const trollMessage = document.createElement('div');
        trollMessage.style.textAlign = 'center';
        trollMessage.style.marginTop = '20%';
        trollMessage.innerHTML = `
            <p class="log-alert" style="font-size: 20px;">[!] SYSTEM OVERRIDE FAILED</p>
            <p style="color: #fff; margin-top: 10px;">¡CAÍSTE EN EL TROLEO! 🤖</p>
            <p style="color: #008833; font-size: 11px; margin-top: 15px;">Ningún dato fue robado ni guardado.</p>
        `;

        consoleContainer.appendChild(trollMessage);
    }

    printMessage();
}