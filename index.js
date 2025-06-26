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
app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, "frontend", "static")))
const upload = multer({ dest: 'uploads/' });
app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "index.html"));
});




app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true }));


const SESSION_FILE_PATH = './session.json';
let ws;
let sessionData;

const openUrl = async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('http://localhost:4006');
}

//-----------------------------------------------------------Com autenticação-----------------------------------------------------------
const withSession = async () => {
    console.log("Com Sessão")
    try {
        sessionData = require(SESSION_FILE_PATH);
        const browser = await puppeteer.launch({ 
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });
        ws = new Client({
            puppeteer: {
                headless: false,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            },
            authStrategy: new LocalAuth({
                clientId: 'client-one',
                dataPath: './sessions',
            }),
        })
        ws.on('ready', async () => {
            console.log('Cliente está pronto!');
            await openUrl();
        });
        ws.on('auth_failure', (msg) => {
            console.log('** O erro de autenticação regenera o QRCODE (Excluir o arquivo session.json) **', msg);
            try {
                fs.unlinkSync('./session.json');
            } catch (err) {
                console.log('Erro ao deletar session.json:', err);
            }
        });
        ws.on('disconnected', (reason) => {
            console.log('Cliente desconectado:', reason);
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
        const browser = await puppeteer.launch({ 
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });
        ws = new Client({
            puppeteer: {
                headless: false,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            },
            authStrategy: new LocalAuth({
                clientId: 'client-one',
                dataPath: './sessions',
            }),
        })
        ws.on('qr', qr => {
            console.log('QR Code recebido');
            qrcode.generate(qr, { small: true });
        });
        ws.on('ready', async () => {
            console.log('Cliente está pronto!');
            await openUrl();
        });
        ws.on('auth_failure', (msg) => {
            console.log('** O erro de autenticação regenera o QRCODE (Excluir o arquivo session.json) **', msg);
            try {
                fs.unlinkSync('./session.json');
            } catch (err) {
                console.log('Erro ao deletar session.json:', err);
            }
        });
        ws.on('disconnected', (reason) => {
            console.log('Cliente desconectado:', reason);
        });
        ws.on('authenticated', (session) => {
            console.log('Autenticado com sucesso');
            sessionData = session;
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

            if (element === element.number || element.number == '' || element.number == undefined || element.number == null) {
                return res.status(400).json({ message: 'O número em questão não existe' });
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
                let nameElement = element.name;
                const message = data.message.replace('{nome_cliente}', nameElement);
                const protocolo = `\n \n \n_Id: `+numberAleatorioAux + '_';
                const mensagemComProtocolo = message + protocolo;
                messageContent = mensagemComProtocolo;
                ws.sendMessage(numberUser, messageContent).then(e => {
                    if (files != null && files != undefined) {
                        sendMessageMedia(numberUser, files, 'imagem')
                    }
                    numbersArray.push(numberUser)
                    dataTable.push({
                        name: element.name,
                        number: element.number,
                        enviou: 'Sim'
                    })
                    messagesSent++;
                }).catch(error => {
                    console.log(error)
                });
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
        res.send({ msg: 'done', invalidNumbers });
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