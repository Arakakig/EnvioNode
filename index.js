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



function transformNumber(number) {
    const numberSeparator = number.split(' ');
    let newNumber;
    if (numberSeparator[1].length == 9) {
        const numberSeparator9 = numberSeparator[1].split('');
        let firstElement = numberSeparator9.shift();
        newNumber = numberSeparator[0] + ' ' + numberSeparator9;
        return newNumber;
    }
    return number;
}
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true }));


const SESSION_FILE_PATH = './session.json';
let ws;
let sessionData;


/**
 * Verificamos se salvamos as credenciais para fazer o login
 * esta etapa evita verificar novamente o QRCODE
 */
const withSession = async () => {
    sessionData = require(SESSION_FILE_PATH);
    ws = new Client({
        authStrategy: new LegacySessionAuth({
            session: sessionData
        })
    });
    ws.on('ready', () => console.log('Cliente está pronto!'));
    ws.on('auth_failure', () => {
        console.log('** O erro de autenticação regenera o QRCODE (Excluir o arquivo session.json) **');
        fs.unlinkSync('./session.json');
    })
    ws.initialize();
}


/**
 * Geramos um QRCODE para iniciar a sessão
 */
const withOutSession = async () => {
    ws = new Client({
        puppeteer: {
            executablePath: '/usr/bin/brave-browser-stable',
        },
        authStrategy: new LocalAuth({
            clientId: "client-one"
        }),
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

const sendButton = (number) => {
    const productsList = new List(
        "Here's our list of products at 50% off",
        "View all products",
        [
            {
                title: "Products list",
                rows: [
                    { id: "apple", title: "Apple" },
                    { id: "mango", title: "Mango" },
                    { id: "banana", title: "Banana" },
                ],
            },
        ],
        "Please select a product"
    );
    let text = 'Olá, tudo bem? Aqui é da juventude da Primeira Batista. Gostariamos de fazer uma pesquisa com você! Você atualmente está inserido em qual dessas redes?';
    let title = "Você atualmente está inserido em qual dessas redes?";
    let button = new Buttons(text, [{ body: 'Livres' }, { body: 'Flow' }], title, 'Ficaremos felizes em saber!');

    ws.sendMessage(number, button);
}

function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

let isSending = false;
app.post('/sendmessagewhatsapp', upload.array('files[]'), async (req, res) => {
    if (isSending) {
        return res.status(400).json({ message: 'Já existe uma mensagem sendo enviada' });
    }
    isSending = true;
    const files = req.files;

    const data = req.body;
    // sendButton(data.number);
    const phoneNumbers = [];
    let array = [], messageContent;
    let numbersArray = []
    let numberSend = JSON.parse(data.listDocUsersSend);
    let dataTable = [];
    async.timesSeries(numberSend.length, (i, next) => {
        const element = numberSend[i];
        if (element=== element.number) {
            return res.status(400).json({ message: 'O número em questão não existe' });
        }
        let numberUser;
        // if (typeof element.number == 'object') {
        //     element.number.forEach(el => {
        //         numberUser = numberUser.replace(/\D+/g, '').replace(/[^a-zA-Z0-9]/g, '');
        //         if (numberUser.length <= 10) {
        //             numberUser = "67" + element.number;
        //         }
        //         numberUser = "55" + el
        //         numberUser = numberUser.replace('@c.us', '');
        //         if (numberUser.length === 18 && numberUser[4] === '9') {
        //             numberUser = numberUser.slice(0, 4) + numberUser.slice(5);
        //         }
        //         if (phoneNumbers.includes(numberUser) || numberUser[4] === '3') {
        //             return;
        //         }
        //         phoneNumbers.push(numberUser);
        //         numberUser = `${numberUser}@c.us`
        //         const message = `Olá ${element.name}, tudo bem?` + data.message || `Olá, tudo bem?`;
        //         messageContent = message;
        //         ws.sendMessage(numberUser, message).then(e => {
        //             if (files != null && files != undefined && files.length != 0) {
        //                 sendMessageMedia(numberUser, files)
        //             }
        //             numbersArray.push(numberUser)
        //             dataTable.push({
        //                 name: element.name,
        //                 numero: el,
        //                 email: element.email,
        //                 enviou: 'Sim'
        //             })
        //             createFile(dataTable)
        //         }).catch(error => {
        //             dataTable.push({
        //                 name: element.name,
        //                 numero: el,
        //                 email: element.email,
        //                 enviou: 'Não'
        //             })
        //             createFile(dataTable)
        //         });
        //     })
        // } else {
        numberUser = element.number.replace(/\s/g, '').replace(/[^a-zA-Z0-9]/g, '');
        if (numberUser.length < 10) {
            numberUser = "67" + numberUser;
        }
        numberUser = numberUser.replace('@c.us', '');
        if (numberUser.length === 11 && numberUser[2] === '9') {
            numberUser = numberUser.slice(0, 2) + numberUser.slice(3);
        }

        let shouldSend = true;
        if (phoneNumbers.includes(numberUser) || numberUser[2] === '3') {
            shouldSend = false;
        }
        if (shouldSend) {
            phoneNumbers.push(numberUser);
            numberUser = `55${numberUser}@c.us`
            const message = data.message ;
            messageContent = message;
            ws.sendMessage(numberUser, message).then(e => {
                if (files != null && files != undefined) {
                    sendMessageMedia(numberUser, files, 'imagem')
                }
                numbersArray.push(numberUser)
                dataTable.push({
                    name: element.name,
                    numero: element.number,
                    email: element.email,
                    enviou: 'Sim'
                })
                createFile(dataTable)
            }).catch(error => {
                dataTable.push({
                    name: element.name,
                    numero: element.number,
                    email: element.email,
                    enviou: 'Não'
                })
                createFile(dataTable)
                console.log(error)
            });
        } else {
            return next();
        }


        // }
        setTimeout(next, 15000);
    }).then(() => {
        isSending = false;
    });
    res.send({ msg: 'done', data: array, numbersArray, messageContent, type: 'whatsApp' })
})



function createFile(data) {
    console.log(data)
    const csvDataResult = data.map(object => `${object.name},${object.numero},${object.email},${object.enviou} \n`).join('');
    // Escrevendo a string no arquivo
    fs.writeFile('Enviados.csv', csvDataResult, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });

}



app.listen(port, () => console.log(`Running on port ${port}`))



