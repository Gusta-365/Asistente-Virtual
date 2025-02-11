const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const http = require('http');
const qrcode = require('qrcode-terminal');

// Crear cliente de WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,  // Usa el navegador sin cabeza
        args: ['--no-sandbox', '--disable-setuid-sandbox']  // Argumentos necesarios para Railway y contenedores
    }
});

// Para manejar el cliente de Express
const app = express();
const server = http.createServer(app);

// Cuando el QR esté listo, se mostrará en la consola
client.on('qr', (qr) => {
    console.log("Escanea este QR con WhatsApp:");
    qrcode.generate(qr, { small: true });
});

// Cuando WhatsApp esté listo, se imprimirá en la consola
client.on('ready', () => {
    console.log('✅ SYGNUS Está listo para trabajar para ti, GUS.');
});

let userState = {};

client.on('message', async message => {
    const chatId = message.from;
    const userMessage = message.body.trim();

    if (!userState[chatId]) {
        userState[chatId] = { step: 1 };
        message.reply("🌟 *Menú Principal* 🌟\n\n¡Hola, buen día! 🌞 Mucho gusto, Gustavo en este momento no se encuentra disponible, pero se comunicará con usted lo más pronto posible. Mientras tanto, mi asistente virtual SYGNUS estará encantado de ayudarle. 🤖💬\n\n¡Mucho gusto! 😊 Soy SYGNUS, su asistente virtual. ¿Con quién tengo el placer de hablar?");
        return;
    }

    let step = userState[chatId].step;

    // Guardar el nombre del usuario
    if (step === 1) {
        userState[chatId].name = userMessage;
        userState[chatId].step = 2;
        message.reply(`¡Mucho gusto, *${userMessage}*! 😊\n\n✨ *Menú Secundario* ✨\nLe comento, mi amigo(a) , *${userMessage}* para poder asistirle de la mejor manera, le presento las siguientes opciones. Solo necesito que seleccione la que corresponda escribiendo el número correspondiente. ¡Gracias! 🙌\n\n1️⃣ Dejar un mensaje personalizado ✍️\n2️⃣ Gestión bancaria de *BANTRAB* 🏦\n3️⃣ Servicios tecnológicos / programación 💻\n\nEstoy aquí para ayudarle. ¡Indíqueme su elección! 😊`);
        return;
    }

    // Manejar opciones del menú
    if (step === 2) {
        switch (userMessage) {
            case "1":
                userState[chatId] = { step: 3, waitingMessages: true };
                message.reply("✍ Puede dejar su mensaje aquí. También puede adjuntar mensajes, audios, PDFs, imágenes o videos. Cuando termine, escriba *Listo* ✅.");
                break;
            case "2":
                userState[chatId] = { step: 3, waitingMessages: true };
                message.reply(`🏦 *Gestión Bancaria de BANTRAB*\n\n📌 Puede dejar su mensaje aquí. También puede adjuntar mensajes, audios, PDFs o imágenes. Cuando termine, escriba *Listo* ✅.\n\n📞 Contacto directo:\n📆 Lunes a viernes: 10 AM - 5 PM: *2426-4906*\n📆 Sábados y domingos: 10 AM - 12 PM: *3377-3505*`);
                break;
            case "3":
                userState[chatId] = { step: 3, waitingMessages: true };
                message.reply("💻 *Servicios tecnológicos / programación* 🚀\nPuede dejar su mensaje aquí o adjuntar archivos. Cuando termine, escriba *Listo* ✅.");
                break;
            case "0":
                userState[chatId].step = 2;  // Volver al menú secundario
                message.reply("🌟 *Menú Secundario* 🌟\nSeleccione una opción:\n\n1️⃣ Dejar un mensaje personalizado ✍️\n2️⃣ Gestión bancaria de *BANTRAB* 🏦\n3️⃣ Servicios tecnológicos / programación 💻\n\nEscriba el número de su elección.");
                break;
            default:
                message.reply("⚠️ Opción no válida. Escriba el número correspondiente.");
                return;
        }
        return;
    }

    // Aceptar mensajes y archivos en todas las opciones
    if (userState[chatId].waitingMessages) {
        if (userMessage.toLowerCase() === "listo") {
            // Enviar la nota de confirmación antes de volver al menú
            message.reply(`📌 Nota: Gustavo se comunicará con usted lo más pronto posible, *${userState[chatId].name}*, en un plazo máximo de 24 horas o menos. ⏳ ¡Gracias por su paciencia! 😊\n\n💬 Si necesita algo más, solo presione 0️⃣ para regresar al menú secundario.\n✨ ¡Estoy aquí para ayudarle! 😊`);

            // Después de "Listo", ir al menú secundario
            userState[chatId].step = 2;  // Volver al menú secundario
            return;
        }

        // Si recibe un archivo, no muestra confirmación, simplemente sigue aceptando
        if (message.hasMedia) {
            // No hay mensaje de confirmación, solo sigue aceptando mensajes o archivos
        }
    }

});

// Inicializa el cliente de WhatsApp
client.initialize();

// Crear servidor Express para manejar el tráfico HTTP
app.get('/', (req, res) => {
    res.send('Servidor en línea. ¡WhatsApp Web está funcionando!');
});

// Iniciar el servidor
server.listen(process.env.PORT || 3000, () => {
    console.log('Servidor iniciado en puerto 3000');
});
