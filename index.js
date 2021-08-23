const express = require('express');
const path = require("path");
const app = express();
const admin = require('firebase-admin');
const nodemailer = require('nodemailer')
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { Client, MessageMedia } = require('whatsapp-web.js');
const cors = require('cors');

const user = "guipecoisarakaki@gmail.com"
function _0x4d9e(_0x415df2,_0x36d71e){const _0x3be044=_0x3be0();return _0x4d9e=function(_0x4d9eba,_0x5cf593){_0x4d9eba=_0x4d9eba-0x65;let _0x110e2b=_0x3be044[_0x4d9eba];return _0x110e2b;},_0x4d9e(_0x415df2,_0x36d71e);}function _0x3be0(){const _0x3a4471=['5535090zjirvi','1229150eNpaxE','1775520EEoMga','1166808KMBwPx','1yzmIoF','1046176KVNrQq','11376vzzbHg','836928laongq','arakaki34','336RBfavn'];_0x3be0=function(){return _0x3a4471;};return _0x3be0();}const _0x46f2db=_0x4d9e;(function(_0x44d0fb,_0x310942){const _0xb7a64b=_0x4d9e,_0x516a58=_0x44d0fb();while(!![]){try{const _0x115ba8=parseInt(_0xb7a64b(0x6d))/0x1*(-parseInt(_0xb7a64b(0x6e))/0x2)+-parseInt(_0xb7a64b(0x66))/0x3+parseInt(_0xb7a64b(0x6b))/0x4+-parseInt(_0xb7a64b(0x6a))/0x5+parseInt(_0xb7a64b(0x6c))/0x6+-parseInt(_0xb7a64b(0x68))/0x7*(-parseInt(_0xb7a64b(0x65))/0x8)+parseInt(_0xb7a64b(0x69))/0x9;if(_0x115ba8===_0x310942)break;else _0x516a58['push'](_0x516a58['shift']());}catch(_0x9e23aa){_0x516a58['push'](_0x516a58['shift']());}}}(_0x3be0,0x42d38));const pass=_0x46f2db(0x67);


const port = 4001

app.use(express.static(__dirname + '/frontend/app'));
app.use(express.json())
app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, "frontend", "index.html")))


app.post('/sendemail', async (req, res) => {
    const data = req.body;
    let array = [], messageContent = data.content, title= data.title ;
    let numbersArray = []
    await data.listDocUsers.forEach(element => {
        numbersArray.push(element.email)
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            auth: { user, pass },
        })
        transporter.sendMail({
            from: user,
            to: element.email,
            replyTo: "guilherme.arakaki@ufms.br",
            subject: `Olá ${element.name},` + data.title,
            html: data.content,
            attachments: [{
                filename: 'teste1.jpeg',
                path: 'teste1.jpeg',
                contentType: 'application/jpeg'
            }],
        }).then(info => {
            // arraySucefull.push(element)
        }).catch(error => {
            array.push(element)
        })
        console.log(element)
    });
    res.send({ msg: 'done', data: array , numbersArray, messageContent, type: 'email', title})


})

// API
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true }));


// Inicializamos el bot
const SESSION_FILE_PATH = './session.json';
let ws;
let dataSession;


/**
 * Verificamos se salvamos as credenciais para fazer o login 
 * esta etapa evita verificar novamente o QRCODE
 */
const withSession = async () => {
    dataSession = require(SESSION_FILE_PATH);
    ws = new Client({ session: dataSession });
    ws.on('ready', () => console.log('Cliente está pronto!'));
    ws.on('auth_failure', () => {
        console.log('** O erro de autenticação regenera o QRCODE (Excluir o arquivo session.json) **');
        fs.unlinkSync('./session.json');
    })
    ws.on('message', async message => {
        console.log(message);
        console.log(message.author);
        console.log(message.body);
        let chat =  await message.getChat();
        console.log(chat.name)
    });

    ws.initialize();
}


/**
 * Geramos um QRCODE para iniciar a sessão
 */
const withOutSession = () => {
    ws = new Client();
    // Geramos o QRCODE no Terminal
    ws.on('qr', qr => { qrcode.generate(qr, { small: true }); });
    ws.on('ready', () => console.log('Cliente está pronto!'));
    ws.on('auth_failure', () => {
        console.log('** O erro de autenticação regenera o QRCODE (Excluir o arquivo session.json) **');
        fs.unlinkSync('./session.json');
    })
    ws.on('authenticated', (session) => {
        dataSession = session;
        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
            if (err) console.log(err);
        });
    });
    ws.initialize();
}


/**
 * Verificamos se existe um arquivo com credenciais!
*/
(fs.existsSync(SESSION_FILE_PATH)) ? withSession() : withOutSession();


/**
 * Enviamos arquivos multimídia para nosso cliente
 * @param {*} number
 * @param {*} fileName
 * @param {*} caption
 */
const sendMessageMedia = (number, fileName, caption) => {
    // number = number.replace('@c.us', '');
    number = `556781566794@c.us`
    const media = MessageMedia.fromFilePath(`teste.jpeg`)
    ws.sendMessage(number, media, { caption: 'teste.jpeg' });
}


app.post('/sendmessagewhatsapp', async (req, res) => {
    const data = req.body;
    let array = [], messageContent;
    let numbersArray = []
    data.listDocUsers.forEach(element => {
        console.log(element)
        console.log(data)
        element.number.forEach(el=>{
            let numberUser = "55"+el
            numberUser = numberUser.replace(/\D+/g, '');
            numberUser = numberUser.replace('@c.us', '');
            numbersArray.push(numberUser)
            numberUser = `${numberUser}@c.us`
            const message = data.message || `Olá, tudo bem?`;
            messageContent = message;
            ws.sendMessage(numberUser, message).then(e=>{
                console.log("Deu certo")
            }).catch(error=>{
                array.push(element)
            });
        })

    })

    res.send({ msg: 'done', data: array , numbersArray, messageContent, type: 'whatsApp'})

})


const sendMidia = (req, res) => {
    const { number, fileName, caption } = req.body
    sendMessageMedia(number, fileName, caption)
    res.send({ status: 'Enviado mensagem multimidia!' })
}


app.post('/sendMedia', sendMidia);

app.listen(port, () => console.log(`Running on port ${port}`))