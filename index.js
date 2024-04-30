const express = require('express');
const path = require("path");
const app = express();
const multer = require('multer');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { Client, MessageMedia, LocalAuth, LegacySessionAuth, Buttons, List } = require('whatsapp-web.js');
const cors = require('cors');
const async = require('async');
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



//-----------------------------------------------------------Com autenticação-----------------------------------------------------------
const withSession = async () => {
    sessionData = require(SESSION_FILE_PATH);
    ws = new Client({ authStrategy: new LocalAuth({ dataPath: "sessions", }), webVersionCache: { type: 'remote', remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html', } });
    ws.on('ready', () => console.log('Cliente está pronto!'));
    ws.on('auth_failure', () => {
        console.log('** O erro de autenticação regenera o QRCODE (Excluir o arquivo session.json) **');
        fs.unlinkSync('./session.json');
    })
    ws.initialize();
}


//-----------------------------------------------------------Sem autenticação-----------------------------------------------------------

const withOutSession = async () => {
    ws = new Client({
        puppeteer: {
            executablePath: '/usr/bin/brave-browser-stable',
            args: ["--no-sandbox", "--disable-dev-shm-usage"],
        },
        authStrategy: new LocalAuth({ dataPath: "sessions", }), webVersionCache: { type: 'remote', remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html', },
        puppeteer: {
            headless: false,
        },
    });

    // Geramos o QRCODE no Terminal
    ws.on('qr', qr => {
        qrcode.generate(qr, { small: true });
    });
    ws.on('ready', () => console.log('Cliente está pronto!'));
    ws.on('auth_failure', () => {
        console.log('** O erro de autenticação regenera o QRCODE (Excluir o arquivo session.json) **');
        fs.unlinkSync('./session.json');
    })
    ws.on('authenticated', (session) => {
        sessionData = session;
        console.log(sessionData)
        if (sessionData != undefined) {
            fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
                if (err) console.log(err);
            });
        }

    });
    ws.initialize();
}



(fs.existsSync(SESSION_FILE_PATH)) ? withSession() : withOutSession();




const sendMessageMedia = (number, file, caption = '') => {
    file.forEach(element => {
        const data = fs.readFileSync(element.path);
        const media = new MessageMedia(element.mimetype, data.toString('base64'), element.originalname, element.size);
        ws.sendMessage(number, media);
    });

}

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
    let dataTable = [];
    async.timesSeries(numberSend.length, (i, next) => {
        if (!continueRoading) return true;
        
        const element = numberSend[i];
        console.log(element)
        let shouldSend = true;
        let numberUser;

        //---------------------------------------Verifica se o número é válido---------------------------------------

        if (element === element.number || element.number == '' || element.number == undefined || element.number == null) {
            return res.status(400).json({ message: 'O número em questão não existe' });
        }

        //---------------------------------------Remove caracteres especiais e atualiza o ddd------------------------
        numberUser = element.number.replace(/\s/g, '').replace(/[^a-zA-Z0-9]/g, '').replace('@c.us', '');
        if (numberUser.length < 10) {
            numberUser = "67" + numberUser;

        }
        //---------------------------------------Se tiver o 9 inicial, retira----------------------------------------
        if (numberUser.length === 11 && numberUser[2] === '9') {
            numberUser = numberUser.slice(0, 2) + numberUser.slice(3);
        }

        //---------------------------------------Verifica se o número é valido----------------------------------------
        const isTrue =  ws.isRegisteredUser(numberUser);

        if (!isTrue) {
            shouldSend = false;
            dataTable.pus({
                name: element.nome,
                number: element.number,
                enviou: 'Não'})
        }
        
        if (phoneNumbers.includes(numberUser) || numberUser[2] === '3') {
            shouldSend = false;
        }


        //---------------------------------------Se passar por todas as verificações, faz o disparo-------------------
        if (shouldSend) {
            phoneNumbers.push(numberUser);
            numberUser = `55${numberUser}@c.us`
            let nameElement = element.name.split(' ')[0];
            nameElement = nameElement.charAt(0).toUpperCase() + nameElement.slice(1).toLowerCase();
            const message = data.message.replace('{nome_cliente}', nameElement);
            messageContent = message;
            ws.sendMessage(numberUser, message).then(e => {
                if (files != null && files != undefined) {
                    sendMessageMedia(numberUser, files, 'imagem')
                }
                numbersArray.push(numberUser)
                dataTable.push({
                    name: element.name,
                    number: element.number,
                    enviou: 'Sim'
                })
            }).catch(error => {
                console.log(element.name, element.number)
                console.log(error)
            });
        } else {
            return next();
        }


        // }
        setTimeout(next, numberAleatorio(900000, 180000));
    }).then(() => {
        createFile(dataTable)
        isSending = false;
    });
    res.send({ msg: 'done', dataTable })
})

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



