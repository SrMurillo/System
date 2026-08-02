const consoleContainer = document.getElementById('console');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

// Cargar el archivo de sonido descargado
const beepSound = new Audio('beep.mp3.wav');

// Escuchador para la pantalla inicial de interacción (permite audio y notificaciones)
document.getElementById('start-btn').addEventListener('click', async () => {
    // Ocultar pantalla de bienvenida
    document.getElementById('overlay').style.display = 'none';

    // 1. Solicitar permiso de Notificaciones
    if ('Notification' in window && Notification.permission !== 'granted') {
        await Notification.requestPermission();
    }

    // 2. Solicitar permiso de Geolocalización GPS precisa
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(4);
                const lon = position.coords.longitude.toFixed(4);
                console.log(`GPS Exacto obtenido: ${lat}, ${lon}`);
            },
            (error) => console.log("Permiso de GPS denegado")
        );
    }

    // Iniciar la secuencia de la terminal
    startHackSimulation();
});

// Función para obtener la batería de forma segura
async function getBatteryInfo() {
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            const level = Math.round(battery.level * 100);
            const charging = battery.charging ? "Cargando" : "Desconectado";
            return `${level}% (${charging})`;
        } catch (e) {
            return "No disponible";
        }
    }
    return "No disponible";
}

// Función principal que recopila datos y ejecuta la terminal
async function startHackSimulation() {
    // Datos locales del navegador
    const screenRes = `${window.screen.width}x${window.screen.height}`;
    const userLang = navigator.language || "es-ES";
    const batteryInfo = await getBatteryInfo();

    // Datos obtenidos por IP (Ubicación pública)
    let ipData = {
        ip: "Obteniendo...",
        city: "Desconocida",
        country_name: "Desconocido",
        org: "Proveedor de red"
    };

    try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
            ipData = await res.json();
        }
    } catch (error) {
        console.log("No se pudo obtener la IP:", error);
    }

    // Secuencia de mensajes combinando datos reales e inventados
    const logMessages = [
        "Iniciando protocolo de conexión remota...",
        "Bypassing firewall [Puerto 8080]... OK",
        `IP Pública detectada: ${ipData.ip}`,
        `Ubicación rastreada: ${ipData.city}, ${ipData.country_name}`,
        `Proveedor de servicios: ${ipData.org}`,
        `Dispositivo: ${navigator.userAgent.split(')')[0]})`,
        `Resolución de pantalla: ${screenRes}`,
        `Batería restante: ${batteryInfo}`,
        `Idioma del sistema: ${userLang}`,
        "Accediendo al almacenamiento local...",
        "Extrayendo historial del navegador...",
        "Iniciando transferencia de datos a servidor remoto..."
    ];

    let messageIndex = 0;

    function printMessage() {
        if (messageIndex < logMessages.length) {
            const p = document.createElement('p');
            p.textContent = `> ${logMessages[messageIndex]}`;

            // Resaltar los datos reales recolectados
            if (
                logMessages[messageIndex].includes("IP Pública") ||
                logMessages[messageIndex].includes("Ubicación") ||
                logMessages[messageIndex].includes("Batería")
            ) {
                p.classList.add('highlight');
            }

            consoleContainer.appendChild(p);
            consoleContainer.scrollTop = consoleContainer.scrollHeight;

            // Reproducir sonido beep en cada mensaje
            beepSound.currentTime = 0;
            beepSound.play().catch(e => console.log("Audio bloqueado"));

            messageIndex++;
            setTimeout(printMessage, Math.floor(Math.random() * 600) + 300);
        } else {
            setTimeout(startProgressBar, 600);
        }
    }

    function startProgressBar() {
        progressContainer.style.display = 'block';
        let progress = 0;

        const interval = setInterval(() => {
            if (progress < 70) {
                progress += Math.floor(Math.random() * 10) + 1;
            } else if (progress < 99) {
                progress += 1;
            }

            if (progress > 99) {
                progress = 99;
                clearInterval(interval);
                sendCriticalNotification();
                setTimeout(showFinalTroll, 3500);
            }

            progressFill.style.width = `${progress}%`;
            progressText.textContent = `Extrayendo datos del sistema: ${progress}%`;
        }, 200);
    }

    function sendCriticalNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification("🚨 ALERTA DE SEGURIDAD CRÍTICA", {
                body: "Se ha detectado una exfiltración masiva de datos en este dispositivo.",
                icon: "https://cdn-icons-png.flaticon.com/512/564/564619.png"
            });
        }
    }

    function showFinalTroll() {
        consoleContainer.innerHTML = '';
        progressContainer.style.display = 'none';

        const trollMessage = document.createElement('div');
        trollMessage.style.textAlign = 'center';
        trollMessage.style.paddingTop = '50px';
        trollMessage.innerHTML = `
      <h1 style="color: #ff3333; font-size: 32px; margin-bottom: 15px;">¡HAS SIDO HACKEADO! 🤖</h1>
      <p style="font-size: 18px; color: #fff;">Es mentira, pero viste tu IP en pantalla y te asustaste jajaja.</p>
      <p style="margin-top: 20px; color: #888;">Tranquilo, ningún dato fue guardado ni enviado a ningún lado.</p>
    `;

        consoleContainer.appendChild(trollMessage);
    }

    // Iniciar impresión de mensajes
    printMessage();
}