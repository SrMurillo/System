const consoleContainer = document.getElementById('console');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

// Secuencia de mensajes "técnicos"
const logMessages = [
    "Iniciando protocolo de conexión remota...",
    "Bypassing firewall [Puerto 8080]... OK",
    "Escaneando red local...",
    "Dispositivo detectado: " + navigator.userAgent.split(')')[0] + ')',
    "Obteniendo dirección IP pública...",
    "Accediendo al almacenamiento local...",
    "Extrayendo historial del navegador...",
    "Accediendo a la cámara frontal...",
    "Desbloqueando carpetas del sistema...",
    "Iniciando transferencia de datos a servidor remoto..."
];

let messageIndex = 0;

function printMessage() {
    if (messageIndex < logMessages.length) {
        const p = document.createElement('p');
        p.textContent = `> ${logMessages[messageIndex]}`;

        // Resaltar algunos mensajes de rojo o amarillo
        if (logMessages[messageIndex].includes("Accediendo") || logMessages[messageIndex].includes("Extrayendo")) {
            p.classList.add('highlight');
        }

        consoleContainer.appendChild(p);
        consoleContainer.scrollTop = consoleContainer.scrollHeight;
        messageIndex++;

        // Tiempo aleatorio entre mensajes para que parezca real
        setTimeout(printMessage, Math.floor(Math.random() * 800) + 400);
    } else {
        // Cuando terminan los mensajes, mostramos la barra de carga
        setTimeout(startProgressBar, 600);
    }
}

function startProgressBar() {
    progressContainer.style.display = 'block';
    let progress = 0;

    const interval = setInterval(() => {
        // Sube rápido al principio y se frena al final
        if (progress < 70) {
            progress += Math.floor(Math.random() * 10) + 1;
        } else if (progress < 99) {
            progress += 1;
        }

        if (progress > 99) {
            progress = 99; // Se queda trabado en 99% para desesperar
            clearInterval(interval);
            setTimeout(showFinalTroll, 2500);
        }

        progressFill.style.width = `${progress}%`;
        progressText.textContent = `Extrayendo datos del sistema: ${progress}%`;
    }, 200);
}

function showFinalTroll() {
    consoleContainer.innerHTML = '';
    progressContainer.style.display = 'none';

    const trollMessage = document.createElement('div');
    trollMessage.style.textAlign = 'center';
    trollMessage.style.paddingTop = '50px';
    trollMessage.innerHTML = `
    <h1 style="color: #ff3333; font-size: 32px; margin-bottom: 15px;">¡HAS SIUDO HACKEADO! 🤖</h1>
    <p style="font-size: 18px; color: #fff;">Es mentira, pero caíste bien feo jajaja.</p>
    <p style="margin-top: 20px; color: #888;">Tranquilo, no se extrajo ninguna información.</p>
  `;

    consoleContainer.appendChild(trollMessage);
}

// Iniciar la secuencia al cargar la página
window.onload = () => {
    setTimeout(printMessage, 1000);
};