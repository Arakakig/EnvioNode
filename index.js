const express = require('express');
const path = require("path");
const app = express();
const multer = require('multer');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { Client, MessageMedia, LocalAuth, LegacySessionAuth, Buttons, List } = require('whatsapp-web.js');
const cors = require('cors');
const async = require('async');
const puppeteer = require('puppeteer');
require('buffer');

const port = process.env.PORT || 4006;

app.use(express.static(__dirname + '/frontend/static'));
app.use(express.json())
app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, "frontend", "index.html")))
const upload = multer({ dest: 'uploads/' });
app.get("/*", (req, res, next) => {
    if (req.path && req.path.startsWith('/api/')) {
        return next();
    }
    res.sendFile(path.resolve(__dirname, "frontend", "index.html"));
});




app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true }));


const SESSION_FILE_PATH = './session.json';
let ws;
let sessionData;
let latestQr = null;
let isWhatsAppReady = false;
const MESSAGES_FILE = path.join(__dirname, 'frontend', 'static', 'messages.json');

// API: mensagens padrão (editar JSON principal)
app.get('/api/messages', async (req, res) => {
    try {
        if (!fs.existsSync(MESSAGES_FILE)) {
            return res.json({ templates: [] });
        }
        const raw = await fs.promises.readFile(MESSAGES_FILE, 'utf-8');
        const data = JSON.parse(raw || '{"templates":[]}');
        res.json(data);
    } catch (err) {
        console.error('Erro ao ler messages.json:', err);
        res.status(500).json({ error: 'Erro ao ler mensagens' });
    }
});

app.put('/api/messages', async (req, res) => {
    try {
        const body = req.body;
        if (!body || !Array.isArray(body.templates)) {
            return res.status(400).json({ error: 'Payload inválido: esperado { templates: [] }' });
        }
        // validação simples dos campos
        const sanitized = body.templates.map((t) => ({
            id: String(t.id || ''),
            label: String(t.label || ''),
            text: String(t.text || ''),
        })).filter(t => t.id && t.label);

        const finalJson = { templates: sanitized };
        await fs.promises.writeFile(MESSAGES_FILE, JSON.stringify(finalJson, null, 2), 'utf-8');
        res.json({ ok: true, count: sanitized.length });
    } catch (err) {
        console.error('Erro ao gravar messages.json:', err);
        res.status(500).json({ error: 'Erro ao salvar mensagens' });
    }
});

// Removido: abertura automática de página no navegador

//-----------------------------------------------------------Com autenticação-----------------------------------------------------------
const getPuppeteerConfig = () => {
    const isHeroku = !!process.env.DYNO;
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_BIN || undefined;
    return {
        headless: isHeroku ? true : false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ],
        ...(executablePath ? { executablePath } : {})
    };
};

const withSession = async () => {
    console.log("Com Sessão")
    try {
        sessionData = require(SESSION_FILE_PATH);
        // Removido: lançamento extra do Puppeteer (cliente já gerencia o navegador)
        ws = new Client({
            puppeteer: getPuppeteerConfig(),
            authStrategy: new LocalAuth({
                clientId: 'client-one',
                dataPath: './sessions',
            }),
        })
        ws.on('ready', async () => {
            console.log('Cliente está pronto!');
            isWhatsAppReady = true;
            latestQr = null;
        });
        ws.on('qr', qr => {
            console.log('QR Code recebido (sessão existente)');
            latestQr = qr;
            qrcode.generate(qr, { small: true });
        });
        ws.on('auth_failure', (msg) => {
            console.log('** O erro de autenticação regenera o QRCODE (Excluir o arquivo session.json) **', msg);
            try {
                fs.unlinkSync('./session.json');
            } catch (err) {
                console.log('Erro ao deletar session.json:', err);
            }
            isWhatsAppReady = false;
        });
        ws.on('disconnected', (reason) => {
            console.log('Cliente desconectado:', reason);
            isWhatsAppReady = false;
        });
        await ws.initialize();
    } catch (error) {
        console.error('Erro na inicialização com sessão:', error);
        // Fallback para sem sessão
        await withOutSession();
    }
}


//-----------------------------------------------------------Sem autenticação-----------------------------------------------------------

const withOutSession = async () => {
    try {
        // Removido: lançamento extra do Puppeteer (cliente já gerencia o navegador)
        ws = new Client({
            puppeteer: getPuppeteerConfig(),
            authStrategy: new LocalAuth({
                clientId: 'client-one',
                dataPath: './sessions',
            }),
        })
        ws.on('qr', qr => {
            console.log('QR Code recebido');
            latestQr = qr;
            qrcode.generate(qr, { small: true });
        });
        ws.on('ready', async () => {
            console.log('Cliente está pronto!');
            isWhatsAppReady = true;
            latestQr = null;
        });
        ws.on('auth_failure', (msg) => {
            console.log('** O erro de autenticação regenera o QRCODE (Excluir o arquivo session.json) **', msg);
            try {
                fs.unlinkSync('./session.json');
            } catch (err) {
                console.log('Erro ao deletar session.json:', err);
            }
            isWhatsAppReady = false;
        });
        ws.on('disconnected', (reason) => {
            console.log('Cliente desconectado:', reason);
            isWhatsAppReady = false;
        });
        ws.on('authenticated', (session) => {
            console.log('Autenticado com sucesso');
            sessionData = session;
            isWhatsAppReady = true;
        });
        await ws.initialize();
    } catch (error) {
        console.error('Erro na inicialização sem sessão:', error);
        throw error;
    }
}


// Initialize WhatsApp client
const initializeWhatsApp = async () => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const tryInitialize = async () => {
        try {
            if (fs.existsSync(SESSION_FILE_PATH)) {
                console.log('Tentando inicializar com sessão existente...');
                await withSession();
            } else {
                console.log('Inicializando sem sessão...');
                await withOutSession();
            }
        } catch (error) {
            console.error(`Erro na inicialização do WhatsApp (tentativa ${retryCount + 1}):`, error);
            
            // Check if it's the serialize error
            if (error.message && error.message.includes('serialize')) {
                console.log('Erro de serialize detectado. Tentando limpar sessão e reinicializar...');
                try {
                    if (fs.existsSync(SESSION_FILE_PATH)) {
                        fs.unlinkSync(SESSION_FILE_PATH);
                    }
                    // Clear sessions directory
                    if (fs.existsSync('./sessions')) {
                        fs.rmSync('./sessions', { recursive: true, force: true });
                        fs.mkdirSync('./sessions');
                    }
                } catch (cleanupError) {
                    console.log('Erro ao limpar sessões:', cleanupError);
                }
            }
            
            if (retryCount < maxRetries) {
                retryCount++;
                console.log(`Tentativa ${retryCount} de ${maxRetries}...`);
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
                return tryInitialize();
            } else {
                console.error('Máximo de tentativas atingido. Verifique sua conexão com a internet e tente novamente.');
                throw error;
            }
        }
    };
    
    await tryInitialize();
};

initializeWhatsApp();
// QR endpoints para frontend
app.get('/api/qr', async (req, res) => {
    try {
        if (isWhatsAppReady) {
            return res.json({ status: 'ready' });
        }
        if (!latestQr) {
            return res.json({ status: 'awaiting' });
        }
        // Gera PNG base64 do QR para render no frontend
        const QRCode = require('qrcode');
        const dataUrl = await QRCode.toDataURL(latestQr, { margin: 1, scale: 6 });
        res.json({ status: 'qr', dataUrl });
    } catch (err) {
        console.error('Erro ao gerar QR:', err);
        res.status(500).json({ error: 'Erro ao gerar QR' });
    }
});

app.post('/api/qr/reset', async (req, res) => {
    try {
        // Força reinicialização para obrigar novo QR
        isWhatsAppReady = false;
        latestQr = null;
        if (ws) {
            try { await ws.destroy(); } catch (e) {}
        }
        await initializeWhatsApp();
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Falha ao resetar sessão' });
    }
});




const sendMessageMedia = (number, file, caption = '') => {
    file.forEach(element => {
        const data = fs.readFileSync(element.path);
        const media = new MessageMedia(element.mimetype, data.toString('base64'), element.originalname, element.size);

        // Verifica se o arquivo é um vídeo
        if (element.mimetype.startsWith('video')) {
            console.log('Enviando vídeo para: ', number);
        }

        // Envia o arquivo (imagem, vídeo, etc.)
        ws.sendMessage(number, media, { caption });
    });
};


//--------------------------------------------------------Verifica se está em execução--------------------------------------------------------
let isSending = false;
let continueRoading = true;

function numberAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function createFile(data) {
    const csvDataResult = data.map(object => `${object.name},${object.number},${object.enviou} \n`).join('');
    fs.writeFile('Enviados.csv', csvDataResult, (err) => {
        if (err) throw err;
    });

}

app.post('/sendmessagewhatsapp', upload.array('files[]'), async (req, res) => {
    continueRoading = true;
    if (isSending) {
        return res.status(400).json({ message: 'Já existe uma mensagem sendo enviada' });
    }
    isSending = true;
    const files = req.files;

    const data = req.body;
    const phoneNumbers = [];
    let numbersArray = []
    let numberSend = JSON.parse(data.listDocUsersSend);
    let invalidNumbers = []; 
    let dataTable = [];
    let messagesSent = 0; // Contador de mensagens enviadas

    try {
        for (let i = 0; i < numberSend.length; i++) {
            if (!continueRoading) break;
            let numberAleatorioAux = numberAleatorio(1, 10000);
            const element = numberSend[i];
            let shouldSend = true;
            let numberUser;

            //---------------------------------------Verifica se o número é válido---------------------------------------

            if (!element || !element.number || element.number === '') {
                invalidNumbers.push({ name: element?.name, number: element?.number || '' });
                continue;
            }

            //---------------------------------------Remove caracteres especiais e atualiza o ddd------------------------
            numberUser = element.number.replace(/\D/g, '');
            if (numberUser.length < 8) {
                shouldSend = false;
            }
            if (numberUser.length < 10) {
                numberUser = "67" + numberUser;
            }
            //---------------------------------------Se tiver o 9 inicial, retira----------------------------------------
            if (numberUser.length === 11 && numberUser[2] === '9') {
                numberUser = numberUser.slice(0, 2) + numberUser.slice(3);
            }
            const numeroAux = `55${numberUser}@c.us`;
            console.log(numeroAux);
            //---------------------------------------Verifica se o número é valido----------------------------------------
            if (shouldSend) {
                const isTrue = await ws.isRegisteredUser(numeroAux); // Espera a Promise ser resolvida
                if (!isTrue) {
                    invalidNumbers.push({ name: element?.name, number: element.number });
                    shouldSend = false;
                }
            }


            if (phoneNumbers.includes(numberUser) || numberUser[2] === '3') {
                shouldSend = false;
            }


            //---------------------------------------Se passar por todas as verificações, faz o disparo-------------------
            if (shouldSend) {
                console.log('Enviando mensagem para: ', numberUser)
                phoneNumbers.push(numberUser);
                numberUser = `55${numberUser}@c.us`
                // Define nome conforme opção recebida do frontend (nameComplet)
                const useFullName = (data.nameComplet === true || data.nameComplet === 'true');
                let nameElement = element.name || '';
                if (!useFullName && typeof nameElement === 'string') {
                    const parts = nameElement.trim().split(/\s+/);
                    nameElement = parts.length > 0 ? parts[0] : nameElement;
                }
                const message = data.message.replace('{nome_cliente}', nameElement);
                const protocolo = `\n \n \n_Id: ` + numberAleatorioAux + '_';
                const mensagemComProtocolo = message + protocolo;
                messageContent = mensagemComProtocolo;

                // Se houver arquivos, envia a(s) mídia(s) com a legenda (texto) junto; caso contrário, envia texto puro
                if (files && Array.isArray(files) && files.length > 0) {
                    sendMessageMedia(numberUser, files, messageContent);
                } else {
                    try {
                        await ws.sendMessage(numberUser, messageContent);
                    } catch (error) {
                        console.log(error);
                    }
                }

                numbersArray.push(numberUser)
                dataTable.push({
                    name: element.name,
                    number: element.number,
                    enviou: 'Sim'
                })
                messagesSent++;
            } else {
                console.log('Número inválido: ', numberUser);
                continue;
            }
            await new Promise(resolve => setTimeout(resolve, numberAleatorio(7000, 20000)));
            if (messagesSent % 50 === 0) {
                console.log('Pausa prolongada para evitar bloqueio...');
                await new Promise(resolve => setTimeout(resolve, numberAleatorio(300000, 600000))); // 5-10 minutos
            }
        }
        createFile(dataTable)
    } catch (error) {
        console.error(error);
    } finally {
        isSending = false;
        if (!res.headersSent) {
            res.send({ msg: 'done', invalidNumbers });
        }
    }
});


function gerarStringAleatoria(tamanho) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ,.;?/!@#$%¨&*()_+-=<>{}[]';
    let resultado = '';
    for (let i = 0; i < tamanho; i++) {
        resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return resultado;
}

app.post('/treinaNumber', async (req, res) => {
    const numberUser = `556781145831@c.us`;
    const intervaloDeEnvio = numberAleatorio(30000, 180000); // Intervalo de envio em milissegundos

    async function enviarMensagens() {
        const comprimentoAleatorio = numberAleatorio(30, 60);
        const stringAleatoria = gerarStringAleatoria(comprimentoAleatorio); // Gerando uma string aleatória de comprimento 10
        try {
            await ws.sendMessage(numberUser, stringAleatoria);
            console.log(`String aleatória "${stringAleatoria}" enviada para ${numberUser}`);
        } catch (error) {
            console.error(`Erro ao enviar string aleatória para ${numberUser}:`, error);
        } finally {
            setTimeout(enviarMensagens, intervaloDeEnvio);
        }
    }

    enviarMensagens(); // Inicia o envio de mensagens
});


app.post('/cancelwhats', (req, res) => {
    continueRoading = false;
    res.send({ msg: 'Cancelado o envio' })
})




app.listen(port, () => console.log(`Running on port ${port}`))