const express = require('express');
const path = require("path");
const app = express();
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { Client, MessageMedia, LocalAuth, LegacySessionAuth } = require('whatsapp-web.js');
const cors = require('cors');
const readline = require('readline');
require('buffer');

// const xl = require('excel4node');
// const wb = new xl.Workbook();
// const tabela = wb.addWorksheet('Worksheet Name');


// const user = "guipecoisarakaki@gmail.com"
// function _0x4d9e(_0x415df2, _0x36d71e) { const _0x3be044 = _0x3be0(); return _0x4d9e = function (_0x4d9eba, _0x5cf593) { _0x4d9eba = _0x4d9eba - 0x65; let _0x110e2b = _0x3be044[_0x4d9eba]; return _0x110e2b; }, _0x4d9e(_0x415df2, _0x36d71e); } function _0x3be0() { const _0x3a4471 = ['5535090zjirvi', '1229150eNpaxE', '1775520EEoMga', '1166808KMBwPx', '1yzmIoF', '1046176KVNrQq', '11376vzzbHg', '836928laongq', 'arakaki34', '336RBfavn']; _0x3be0 = function () { return _0x3a4471; }; return _0x3be0(); } const _0x46f2db = _0x4d9e; (function (_0x44d0fb, _0x310942) { const _0xb7a64b = _0x4d9e, _0x516a58 = _0x44d0fb(); while (!![]) { try { const _0x115ba8 = parseInt(_0xb7a64b(0x6d)) / 0x1 * (-parseInt(_0xb7a64b(0x6e)) / 0x2) + -parseInt(_0xb7a64b(0x66)) / 0x3 + parseInt(_0xb7a64b(0x6b)) / 0x4 + -parseInt(_0xb7a64b(0x6a)) / 0x5 + parseInt(_0xb7a64b(0x6c)) / 0x6 + -parseInt(_0xb7a64b(0x68)) / 0x7 * (-parseInt(_0xb7a64b(0x65)) / 0x8) + parseInt(_0xb7a64b(0x69)) / 0x9; if (_0x115ba8 === _0x310942) break; else _0x516a58['push'](_0x516a58['shift']()); } catch (_0x9e23aa) { _0x516a58['push'](_0x516a58['shift']()); } } }(_0x3be0, 0x42d38)); const pass = _0x46f2db(0x67);


const port = process.env.PORT || 4001;

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




// app.post('/sendemail', async (req, res) => {
//     const data = req.body;
//     let array = [], messageContent = data.content, title = data.title;
//     let numbersArray = []
//     await data.listDocUsers.forEach(element => {
//         numbersArray.push(element.email)
//         const transporter = nodemailer.createTransport({
//             host: "smtp.gmail.com",
//             port: 587,
//             auth: { user, pass },
//         })
//         transporter.sendMail({
//             from: user,
//             to: element.email,
//             replyTo: "guilherme.arakaki@ufms.br",
//             subject: `Olá ${element.name},` + data.title,
//             html: data.content,
//             attachments: [{
//                 filename: 'teste1.jpeg',
//                 path: 'teste1.jpeg',
//                 contentType: 'application/jpeg'
//             }],
//         }).then(info => {
//             // arraySucefull.push(element)
//         }).catch(error => {
//             array.push(element)
//         })
//         console.log(element)
//     });
//     res.send({ msg: 'done', data: array, numbersArray, messageContent, type: 'email', title })


// })

// API
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
    ws.on('message', async message => {
        let chat = await message.getChat();
    });


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
    const data = fs.readFileSync(file.path);
    const media = new MessageMedia(file.mimetype, data.toString('base64'), file.originalname, file.size);
    ws.sendMessage(number, media);
}


app.post('/sendmessagewhatsapp', upload.single('file'), async (req, res) => {

    const file = req.file;

    const data = req.body;

    let array = [], messageContent;
    let numbersArray = []
    let numberSend = JSON.parse(data.listDocUsersSend);
    let dataTable = [];
    numberSend.forEach(element => {
        setTimeout(() => {
            if (typeof element.number == 'object') {
                element.number.forEach(el => {
                    let numberUser = "55" + el
                    numberUser = numberUser.replace(/\D+/g, '');
                    numberUser = numberUser.replace('@c.us', '');
                    let numberUserAux = numberUser;
                    numberUser = `${numberUser}@c.us`
                    if (numberUser.length === 18 && numberUser[4] === '9') {
                        numberUser = numberUser.slice(0, 4) + numberUser.slice(5);
                    }  
                    const message = data.message || `Olá, tudo bem?`;
                    messageContent = message;
                    ws.sendMessage(numberUser, message).then(e => {
                        if (file != null && file != undefined) {
                            sendMessageMedia(numberUser, file)
                        }
                        numbersArray.push(numberUser)
                        dataTable.push({
                            name: element.name,
                            numero: el,
                            email: element.email,
                            enviou: 'Sim'
                        })
                        createFile(dataTable)
                    }).catch(error => {
                        dataTable.push({
                            name: element.name,
                            numero: el,
                            email: element.email,
                            enviou: 'Não'
                        })
                        createFile(dataTable)
                        array.push(element)
                        console.log(error)
                    });
                })
            } else {
               
                let numberUser = "55" + element.number;
                numberUser = numberUser.replace(/\D+/g, '');
                if(numberUser.length<=12){
                    numberUser = numberUser.slice(0, 2)+ '67' + numberUser.slice(5);
                }
                numberUser = numberUser.replace('@c.us', '');
                numberUser = `${numberUser}@c.us`
                if (numberUser.length === 18 && numberUser[4] === '9') {
                    numberUser = numberUser.slice(0, 4) + numberUser.slice(5);
                }
                const message = data.message || `Olá, tudo bem?`;
                messageContent = message;
                ws.sendMessage(numberUser, message).then(e => {
                    if (file != null && file != undefined) {
                        sendMessageMedia(numberUser, file, 'imagem')
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
                    array.push(element)
                    console.log(error)
                });

            }
        }, 10 * 1000 );
    })
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



