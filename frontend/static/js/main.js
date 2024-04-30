"use strict";

var firebaseConfig = {
    apiKey: "AIzaSyCXGjzx00TjaqjbmLSqIk5U1RYVtVxAJ-8",
    authDomain: "nipponatt.firebaseapp.com",
    projectId: "nipponatt",
    storageBucket: "nipponatt.appspot.com",
    messagingSenderId: "167548057096",
    appId: "1:167548057096:web:43b9fd3e741c2b565b03bd",
    measurementId: "G-2HWGGX2KSB"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
let listDocUserAux = [], listDocUsers = [];
let listDocSetor = ['Todos os Setores', 'Cassems', 'Nippon', 'Nipo'];
var firestore = firebase.firestore();
let fileContent;
let ArquivoWhatsApp = [];
let arrayContent = [];
$(() => {
    const allBody = Section(uniKey(), { classNameB: "allBody" });
    const navBarSection = Section(uniKey(), { classNameB: "nav-bar-section" });
    const modalCreateUnique = Section('modal-create-unique', { classNameB: "modal-pop modalCreateUnique" });
    const modalCreateUniqueContent = Section('modal-create-unique-content', { classNameB: "modalCreateUniqueContent" });
    $(modalCreateUnique).html(modalCreateUniqueContent);


    const butonsFilter = Section(uniKey(), { classNameB: "butonsFilter" });
    const inputSearch = inputField(uniKey(), {
        classNameB: "input-field",
        placeholder: "Digite aqui o Nome para a pesquisa",
        onchange: (() => {
            filter(inputSearch.value)
        })
    });
    $(butonsFilter).html([
        inputSearch
    ]);




    const SendNewEmail = Button(uniKey(), {
        classNameB: "button-7 button-add",
        content: [Icon('envelope'), ' Enviar Email'],
        click: (() => {
            modalEmail()
        })
    })



    const cancelWhats = Button(uniKey(), {
        classNameB: "button-7 button-add",
        content: [Icon('ban'), ' Cancelar o envio de WhatsApp'],
        click: (() => {
            CancelWhats();
        })
    })


    const SendPlanilhaModal = Button(uniKey(), {
        classNameB: "button-7 button-add",
        content: [Icon('paper-plane'), ' Enviar WhatsApp por Planilha'],
        click: (() => {
            modalAddPlanilha()
        })
    })



    $(navBarSection).html([
        cancelWhats,
        SendPlanilhaModal,
        space(10),
    ]);
    $("#root").html([
        allBody,
    ]);
    attConstruct()
})


async function setFileContent(content) {
    fileContent = content;
    arrayContent = await TransformCsvtoArray(fileContent);
}

function setArquivoContent(content) {
    ArquivoWhatsApp.push(content);
}


const attConstruct = () => {



    let completName = true;
    let teste1Aux = ['Nome Completo', 'Primeiro Nome'];   
    const divPlanilha = Section(uniKey(), { classNameB: "divPlanilha" });

    const SendPlanilhaInput = $("<input type='file' class='inputPlanilha button-7 ' accept='.csv' onchange='setFileContent(event.target.files[0])'/>");


    $(divPlanilha).html([
        SendPlanilhaInput
    ])
    const inputMessageContent = inputTextarea(uniKey(), {
        classNameB: 'input-field fscroll textAreaGrande',
    });
    const inputDivContent = Section(uniKey(), { classNameB: "" });

    const SendArquivoWhatsApp = $("<input type='file' accept='image/png, image/jpeg' class='inputArquivo inputPlanilha button-7 ' onchange='setArquivoContent(event.target.files[0])';/>");


    const divNameContent = inputSelect(uniKey(), {
        classNameB: "input-field",
        options: teste1Aux,
        onchange: (e) => {
            if(completName==false){
                completName = true;
            }
            else{
                completName = true;
            }
      
        },
    });


    $(inputDivContent).html([
        nText({ text: "Conteúdo da Mensagem", classNameB: "subtitle-modal" }),
        inputMessageContent,
        space(),
        SendArquivoWhatsApp,
        space(),
    ]);



    const SendWhatsAppTo = Button(uniKey(), {
        classNameB: "button-7",
        content: [Icon('Check'), ' Concluir'],
        click: (() => {
            SendWhatsApp(inputMessageContent.value, 'Todos os Setores', arrayContent, ArquivoWhatsApp, completName);
            $.fancybox.close()
        })
    })

    const enviarMensagemTeste = Button(uniKey(), {
        classNameB: "button-7",
        content: [Icon('Check'), ' Enviar Mensagem Teste'],
        click: (() => {
            enviarMensagensWhatsAppTreino()
        })
    })

    const buttonsFinal = Section(uniKey(), { classNameB: "buttonsFinalModal" });


    const allModal = Section(uniKey(), { classNameB: "allModal" });

    $(buttonsFinal).css('text-align', 'center')

    $(buttonsFinal).html([
        SendWhatsAppTo
    ])




    $(allModal).html([
        nText({ text: "Enviar WhatsApp por Planilha", classNameB: "title-modal" }),
        space(20),
        divPlanilha,
        space(20),
        nText({ text: "Nome Completo?", classNameB: "subtitle-modal" }),
        space(),
        divNameContent,
        space(20),
        inputDivContent,
        buttonsFinal,
        // enviarMensagemTeste
    ])

    const cobrancaSection = Section(uniKey(), { classNameB: "allBodyConstruct" });


    // Exemplo de uso


    const cobranca2a6 = Button(uniKey(), {
        classNameB: "button-7",
        content: ['Cobrança 2 a 6 meses'],
        click: (() => {
            var textoParaCopiar = `Olá {nome_cliente} tudo bem?

Aqui é o Guilherme da Pax Nippon. Passando para informar que a sua mensalidade já venceu. 
            
Você pode estar realizando o pagamento via Pix: 
            
Nippon 
Tipo: CNPJ
Pix: 41.220.924/0001-80
            
Qualquer dúvida eu estou a disposição 😊`;
            navigator.clipboard.writeText(textoParaCopiar).then(r => {
                notifyMsg('success', 'Texto Copiado com sucesso.', { positionClass: "toast-bottom-right" });
            })
        })
    })

    const cobranca7a12 = Button(uniKey(), {
        classNameB: "button-7",
        content: ['Cobrança 7 a 12 meses'],
        click: (() => {
            var textoParaCopiar = `Olá {nome_cliente}, tudo bem?
            
 Aqui é o Guilherme da Pax Nippon. 

 Estamos com algumas pendências, se você quiser, posso ver o que eu consigo para fazermos um acordo e regulariza-las. 
          
 Caso você não seja a pessoa, ou já tenha feito um acordo, por favor desconsidere essa mensagem`;
            navigator.clipboard.writeText(textoParaCopiar).then(r => {
                notifyMsg('success', 'Texto Copiado com sucesso.', { positionClass: "toast-bottom-right" });
            })

        })
    })

    const cobranca12a60 = Button(uniKey(), {
        classNameB: "button-7",
        content: ['Cobrança 12 a 60 meses'],
        click: (() => {
            var textoParaCopiar = `Olá {nome_cliente}, tudo bem?

Aqui é o Guilherme da Pax Nippon. 

Estamos com algumas pendências, se você quiser, posso ver o que eu consigo para fazermos um acordo e regulariza-las. 
          
Caso você não seja a pessoa, ou já tenha feito um acordo, por favor desconsidere essa mensagem`;
            navigator.clipboard.writeText(textoParaCopiar).then(r => {
                notifyMsg('success', 'Texto Copiado com sucesso.', { positionClass: "toast-bottom-right" });
            })
        })
    })

    const cobrancaindevida = Button(uniKey(), {
        classNameB: "button-7",
        content: ['Cobrança Indevida'],
        click: (() => {
            var textoParaCopiar = `Está certo mesmo. 
Eu peço perdão. Teve um erro aqui.

Desculpa o incomodo, tenha um ótimo dia!`;
            navigator.clipboard.writeText(textoParaCopiar).then(r => {
                notifyMsg('success', 'Texto Copiado com sucesso.', { positionClass: "toast-bottom-right" });
            })
        })
    })

    const cobrancapessoaerrada = Button(uniKey(), {
        classNameB: "button-7",
        content: ['Pessoa Errada'],
        click: (() => {
            var textoParaCopiar = `Tudo bem, vou retirar o seu número aqui do nosso sistema.

Tenha um ótimo dia! Peço perdão pelo inconveniente.`;
            navigator.clipboard.writeText(textoParaCopiar).then(r => {
                notifyMsg('success', 'Texto Copiado com sucesso.', { positionClass: "toast-bottom-right" });
            })
        })
    })



    $(cobrancaSection).html([
        nText({ text: "Botões de Cobrança", classNameB: "title-modal center" }),
        space(),
        cobranca2a6,
        space(),
        cobranca7a12,
        space(),
        cobranca12a60,
        space(),
        cobrancaindevida,
        space(),
        cobrancapessoaerrada
    ]);


    const aniversarioSection = Section(uniKey(), { classNameB: "allBodyConstruct" });
    const aniversario = Button(uniKey(), {
        classNameB: "button-7",
        content: ['Mensagem de Aniversário'],
        click: (() => {
            var textoParaCopiar = `Olá, {nome_cliente}!
            
Hoje é um dia especial, pois é o seu aniversário! 🎉🎂 Queremos aproveitar essa ocasião para desejar a você os mais sinceros votos de felicidade, saúde e sucesso em todos os aspectos da sua vida.
            
Agradecemos por fazer parte da nossa família de clientes e por confiar em nossos serviços. É um prazer atendê-lo(a) e poder contribuir para o seu bem-estar.
            
Que este novo ano de vida seja repleto de momentos incríveis, conquistas e realizações. Que você encontre inspiração, amor e paz em cada passo que der.
            
Estamos sempre à disposição para auxiliá-lo(a) no que precisar. Desejamos um feliz aniversário e um ano brilhante!
            
Com os melhores cumprimentos,
Equipe da Pax Nippon`;

            navigator.clipboard.writeText(textoParaCopiar).then(r => {
                notifyMsg('success', 'Texto Copiado com sucesso.', { positionClass: "toast-bottom-right" });
            })
        })
    })
    
    $(aniversarioSection).html([
        nText({ text: "Botão de Aniversário", classNameB: "title-modal center" }),
        space(),
        aniversario
    ]);


    $('.allBody').html([
        allModal,
        // cobrancaSection,
        // aniversarioSection
    ]);

}
const modalUnique = async (id = '') => {
    $("#modal-create-unique-content").html("")
    $.fancybox.open({ src: "#modal-create-unique", touch: false, keyboard: false });
    let docUser, dateNasc, dateVenc;
    if (id != '') {
        let userRef = firestore.collection('users');
        let doc = await userRef.doc(id).get();
        if (doc && doc.exists) {
            docUser = doc.data();
        }
        if (docUser && docUser.dueDate) {
            dateVenc = new Date(docUser.dueDate.seconds * 1000);
            dateVenc = dateVenc.toLocaleDateString("pt-BR")
        }
        if (docUser && docUser.dateNasc) {
            dateNasc = new Date(docUser.dateNasc.seconds * 1000);
            dateNasc = dateNasc.toLocaleDateString("pt-BR")
        }


    } else {
        docUser = {
            id: '',
            name: '',
            cpf: '',
            email: '',
            number: [],
            sector: '',

        }
        dateVenc = docUser.dueDate;
        dateNasc = docUser.dateNasc;
    }
    const inputName = inputField(uniKey(), {
        classNameB: "input-field",
        placeholder: "Digite aqui o nome do cliente",
        value: docUser.name
    });
    const inputContract = inputField(uniKey(), {
        classNameB: "input-field",
        placeholder: "Digite aqui o numero do contrato",
        mask: '#',
        value: docUser.id
    });



    const inputNumber = inputField(uniKey(), {
        classNameB: "input-field",
        placeholder: "Digite aqui o número do Cliente",
        mask: "(00)0000-0000",
        value: docUser.number
    });

    const inputEmail = inputField(uniKey(), {
        classNameB: "input-field",
        placeholder: "Digite aqui o email do cliente",
        value: docUser.email
    });

    const inputSector = inputSelect(uniKey(), {
        classNameB: "input-field",
        options: listDocSetor,
        onchange: (e) => {
            docUser.setor = e.target.value;
        },
        selected: docUser.setor
    });


    const deletContact = Button(uniKey(), {
        classNameB: "button-3",
        content: [Icon('user-times'), ' Remover contato'],
        click: (() => {
            firestore.collection('users').doc(docUser.id).delete().then(r => {
                notifyMsg('success', 'Cliente excluido com sucesso.', { positionClass: "toast-bottom-right" });
            }).catch(e => {
                notifyMsg('error', 'Ocorreu um erro ao remover o cupom.', { positionClass: "toast-bottom-right" });
            })
            $.fancybox.close()
        })
    })

    const attContact = Button(uniKey(), {
        classNameB: "button",
        content: [Icon('check'), ' Atualizar contato'],
        click: (() => {
            var isValid = true
            let testeNumber = inputNumber.value

            if (inputName.value == '' || testeNumber.length < 13) {
                isValid = false;
            }
            if (isValid) {

                var phonesArray = [];
                phonesArray.push(inputNumber.value)

                docUser = {
                    id: inputContract.value,
                    name: inputName.value,
                    email: inputEmail.value,
                    number: phonesArray,
                    setor: docUser.setor,

                }
                console.log(docUser)
                firestore.collection("users").doc(id).update(docUser).then(doc => {
                    notifyMsg('success', 'Cliente atualizado com sucesso.', { positionClass: "toast-bottom-right" });
                }).catch(error => {
                    notifyMsg('error', 'Ocorreu um erro ao atualizar o cliente.', { positionClass: "toast-bottom-right" });
                })

                $.fancybox.close()//Fecha o modal
            }
        })
    })

    const cancelContact = Button(uniKey(), {
        classNameB: "cancel-button  button-add",
        content: [Icon('ban'), ' Cancelar'],
        click: (() => {
            $.fancybox.close()
        })
    })
    const buttonFinal = Section(uniKey(), { classNameB: "buttonFinal" });
    if (id != '') {
        $(buttonFinal).html([
            deletContact,
            ' ',
            attContact,
        ])
    } else {
        $(buttonFinal).html([
            cancelContact,
            ' ',
        ])
    }


    $("#modal-create-unique-content").html([
        nText({ text: "Cadastrar Pessoa", classNameB: "title-modal" }),
        space(20),
        nText({ text: "Nome", classNameB: "subtitle-modal" }),
        inputName,
        space(10),
        nText({ text: "Contrato", classNameB: "subtitle-modal" }),
        inputContract,
        space(10),
        nText({ text: "Número", classNameB: "subtitle-modal" }),
        inputNumber,
        space(),
        nText({ text: "Email", classNameB: "subtitle-modal" }),
        inputEmail,
        space(10),
        nText({ text: "Setor", classNameB: "subtitle-modal" }),
        space(10),
        inputSector,
        space(20),
        buttonFinal
    ])

}

function validarCPF(strCPF) {
    let Soma = 0;
    let Resto;
    let stringCPF = strCPF.replace(/[^\d]+/g, '');
    if (stringCPF === '00000000000') return false;
    for (let i = 1; i <= 9; i++) {
        Soma += parseInt(stringCPF.substring(i - 1, i)) * (11 - i);
    }
    Resto = (Soma * 10) % 11;
    if (Resto === 10 || Resto === 11) {
        Resto = 0;
    }
    if (Resto !== parseInt(stringCPF.substring(9, 10))) {
        return false;
    }
    Soma = 0;
    for (let i = 1; i <= 10; i++) {
        Soma += parseInt(stringCPF.substring(i - 1, i)) * (12 - i);
    }
    Resto = (Soma * 10) % 11;
    if (Resto === 10 || Resto === 11) {
        Resto = 0;
    }
    if (Resto !== parseInt(stringCPF.substring(10, 11))) {
        return false;
    }
    return stringCPF;
}


const filter = (value = '') => {
    listDocUserAux
    if (value == '') {
        for (var aux = 0; aux < contacts.length; aux++) {
            $("#" + contacts[aux].id).show();
        }
    }
    else {
        let userRef = firestore.collection('users')

    }

}

const modalEmail = () => {
    $("#modal-create-unique-content").html("")
    $.fancybox.open({ src: "#modal-create-unique", touch: false, keyboard: false });


    const inputSubjectContent = inputTextarea(uniKey(), {
        classNameB: 'input-field fscroll',
    });

    const inputEmailContent = inputTextarea(uniKey(), {
        classNameB: 'input-field fscroll',
    });
    // document.createElement("canvas")


    const SendEmailTo = Button(uniKey(), {
        classNameB: "button-7",
        content: [Icon('envelope'), ' Enviar Email'],
        click: (() => {
            if (inputSubjectContent.value != '' && inputEmailContent.value != '') {
                SendEmail(inputSubjectContent.value, inputEmailContent.value)
                $.fancybox.close()
            }
        })
    })


    const buttonsFinal = Section(uniKey(), { classNameB: "buttonsFinalModal" });

    const allModal = Section(uniKey(), { classNameB: "allModal" });

    $(buttonsFinal).css('text-align', 'center')

    $(buttonsFinal).html([
        SendEmailTo
    ])

    $(allModal).html([
        nText({ text: "Enviar Email", classNameB: "title-modal" }),
        space(20),
        nText({ text: "Título do Email", classNameB: "subtitle-modal" }),
        inputSubjectContent,
        space(),
        nText({ text: "Conteúdo do Email", classNameB: "subtitle-modal" }),
        inputEmailContent,
        space(),
        buttonsFinal
    ])

    $("#modal-create-unique-content").html([
        allModal
    ])

}

const modalWhatsApp = () => {
    $("#modal-create-unique-content").html("")
    $.fancybox.open({ src: "#modal-create-unique", touch: false, keyboard: false });
    let sectorSelected;
    const inputSelectItem = inputSelect(uniKey(), {
        classNameB: "input-field",
        options: listDocSetor,
        onchange: (e) => {
            sectorSelected = e.target.value;
        },
    });

    const inputMessageContent = inputTextarea(uniKey(), {
        classNameB: 'input-field input-message fscroll',
    });

    const inputDivContent = Section(uniKey(), { classNameB: "" });

    const SendArquivoWhatsApp = $("<input type='file' accept='image/png, image/jpeg' class='inputArquivo inputPlanilha button-7 ' onchange='setArquivoContent(event.target.files[0])';/>");

    $(inputDivContent).html([
        nText({ text: "Conteúdo do Mensagem", classNameB: "subtitle-modal" }),
        inputMessageContent,
        space(),
        SendArquivoWhatsApp,
        space(),
    ]);



    const SendWhatsAppTo = Button(uniKey(), {
        classNameB: "button-7",
        content: [Icon('paper-plane'), ' Enviar Mensagem'],
        click: (() => {
            // console.log(formData)
            if (inputMessageContent.value != '') {
                // SendEmail(inputSubjectContent.value,inputEmailContent.value)
                SendWhatsApp(inputMessageContent.value, sectorSelected, listDocUsers, ArquivoWhatsApp);

                $.fancybox.close()
            }
        })
    })


    const buttonsFinal = Section(uniKey(), { classNameB: "buttonsFinalModal" });

    const allModal = Section(uniKey(), { classNameB: "allModal" });

    $(buttonsFinal).css('text-align', 'center')

    $(buttonsFinal).html([
        SendWhatsAppTo
    ])

    $(allModal).html([
        nText({ text: "Enviar Mensagem", classNameB: "title-modal" }),
        space(20),
        nText({ text: "Setor a qual deseja enviar a mensagem", classNameB: "subtitle-modal" }),
        inputSelectItem,
        space(20),
        inputDivContent,
        space(),
        buttonsFinal
    ])

    $("#modal-create-unique-content").html([
        allModal
    ])
}


const modalAddPlanilha = async () => {
    $("#modal-create-unique-content").html("")
    $.fancybox.open({ src: "#modal-create-unique", touch: false, keyboard: false });
    let completName = true;
    let teste1Aux = ['Nome Completo', 'Primeiro Nome'];   
    const divPlanilha = Section(uniKey(), { classNameB: "divPlanilha" });

    const SendPlanilhaInput = $("<input type='file' class='inputPlanilha button-7 ' accept='.csv' onchange='setFileContent(event.target.files[0])'/>");


    $(divPlanilha).html([
        SendPlanilhaInput
    ])
    const inputMessageContent = inputTextarea(uniKey(), {
        classNameB: 'input-field fscroll',
    });
    const inputDivContent = Section(uniKey(), { classNameB: "" });

    const SendArquivoWhatsApp = $("<input type='file' accept='image/png, image/jpeg' class='inputArquivo inputPlanilha button-7 ' onchange='setArquivoContent(event.target.files[0])';/>");


    const divNameContent = inputSelect(uniKey(), {
        classNameB: "input-field",
        options: teste1Aux,
        onchange: (e) => {
            if(completName==false){
                completName = true;
            }
            else{
                completName = true;
            }
      
        },
    });


    $(inputDivContent).html([
        nText({ text: "Conteúdo da Mensagem", classNameB: "subtitle-modal" }),
        inputMessageContent,
        space(),
        SendArquivoWhatsApp,
        space(),
    ]);



    const SendWhatsAppTo = Button(uniKey(), {
        classNameB: "button-7",
        content: [Icon('Check'), ' Concluir'],
        click: (() => {
            SendWhatsApp(inputMessageContent.value, 'Todos os Setores', arrayContent, ArquivoWhatsApp, completName);
            $.fancybox.close()
        })
    })


    const buttonsFinal = Section(uniKey(), { classNameB: "buttonsFinalModal" });


    const allModal = Section(uniKey(), { classNameB: "allModal" });

    $(buttonsFinal).css('text-align', 'center')

    $(buttonsFinal).html([
        SendWhatsAppTo
    ])




    $(allModal).html([
        nText({ text: "Enviar WhatsApp por Planilha", classNameB: "title-modal" }),
        space(20),
        divPlanilha,
        space(20),
        nText({ text: "Nome Completo?", classNameB: "subtitle-modal" }),
        space(),
        divNameContent,
        space(20),
        inputDivContent,
        buttonsFinal
    ])

    $("#modal-create-unique-content").html([
        allModal
    ])
}

function SendEmail(title, content) {
    $.ajax({
        url: 'https://us-central1-controleestoque-1535d.cloudfunctions.net/helloWorld',
        contentType: 'application/json',
        cache: false,
        method: 'POST',
        dataType: 'json',
        data: JSON.stringify({
            id: 'test',
            command: 'echo michael'
        }),
        success: function (data) {
            console.log(data);
        }
    });
}

async function TransformCsvtoArray(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        let aux, users = [];
        reader.readAsText(file);
        reader.onload = e => {
            if (e.target.result == undefined) return false;
            let result = e.target.result.replace(/;/g, ',');;
            aux = result.split(/\r?\n/);
            aux.forEach((elemento, index) => {
                let dados = elemento.split(',');
                let data = {
                    name: dados[0],
                    number: dados[1],
                    email: dados[2],
                    setor: dados[3] != undefined ? dados[3] : '',
                    id: uniKey()
                }
                users.push(data);
            })
            resolve(users);
        };
        reader.onerror = error => {
            reject(error);
        };
    });
}
function SendWhatsApp(message, setor = 'Todos os Setores', users = [], arquivo = '', nameComplet=true) {
    console.log(arquivo)
    let listDocUsersSend = users;
    let listUsersAux = [];
    if (setor != 'Todos os Setores') {
        listDocUsers.filter((doc) => {
            if (doc.setor == setor) {
                console.log(doc)
                listUsersAux.push(doc)
            }
        })
        listDocUsersSend = listUsersAux;
    }

    var formData = new FormData();
    formData.append("message", message);
    formData.append("listDocUsersSend", JSON.stringify(listDocUsersSend));
    formData.append("nameComplet", nameComplet);
    for (let i = 0; i < arquivo.length; i++) {
        formData.append("files[]", arquivo[i]);
    }

    $.ajax({
        url: '/sendmessagewhatsapp',
        type: 'post',
        data: formData,
        processData: false,
        contentType: false
    })
        .done((res) => {
            if (res.data.length > 0) {
                res.data.forEach((doc) => {
                    notifyMsg('error', '<strong>Erro:</strong><br>Ocorreu um erro ao tentar enviar as mensagens ' + doc, { positionClass: "toast-bottom-right" });
                })
            } else {
                let content = {
                    timeStamp: new Date(),
                    message: res.messageContent,
                    fromTo: res.numbersArray,
                    type: res.type
                }
                firestore.collection('messages').add(content)

                notifyMsg('success', 'Mensagens enviadas com sucesso!"', { positionClass: "toast-bottom-right" });
            }
        })
        .catch((err) => {
            //err
        })
}

function enviarMensagensWhatsAppTreino() {
    const mensagem = 'Treinamento de envio de mensagens';
    fetch('/treinaNumber', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            mensagem: mensagem
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao enviar mensagens');
        }
        console.log('Mensagens enviadas com sucesso');
    })
    .catch(error => {
        console.error('Erro ao enviar mensagens:', error);
    });
}

function CancelWhats() {

    $.ajax({
        url: '/cancelwhats',
        type: 'post',
        processData: false,
        contentType: false
    })
        .done((res) => {
            notifyMsg('success', 'Cancelado o Envio de Mensagens!"', { positionClass: "toast-bottom-right" });
        });

}


function SendPlanilha(e) {
    let arrayReader = [];
    const file = e;
    const reader = new FileReader();
    let aux;
    reader.readAsText(file);
    reader.onload = e => {
        if (e.target.result == undefined) return false;
        const result = e.target.result.replace(/;/g, ',');
        aux = result.split(/\r?\n/);
        aux.forEach((elemento, index) => {
            let dados = elemento.split(',');
            let data = {
                name: dados[0],
                number: dados[1],
                email: dados[2],
                setor: dados[3] != undefined ? dados[3] : '',
                id: uniKey()
            }
            // firestore.collection('users').doc(data.id).set(data);
        })
    };



    // $.ajax({
    //     url: '/sendPlanilha',
    //     contentType: 'application/json; charset=utf-8',
    //     type: 'post',
    //     dataType: 'json',
    //     data: JSON.stringify({aux})
    // })
    //     .done((res) => {
    //         console.log(res.data)
    //         if (res.data.length > 0) {
    //             res.data.forEach((doc) => {
    //                 notifyMsg('error', '<strong>Erro:</strong><br>Ocorreu um erro ao fazer Upload da Planilha' + doc, { positionClass: "toast-bottom-right" });
    //             })
    //         } else {
    //             let content = {
    //                 timeStamp:new Date(),
    //                 message:res.messageContent,
    //                 fromTo: res.numbersArray,
    //                 type: res.type
    //             }
    //             firestore.collection('messages').add(content)

    //             notifyMsg('success', 'Planilha Adicionada com Sucesso!"', { positionClass: "toast-bottom-right" });

    //         }
    //     })
    //     .catch((err) => {
    //         notifyMsg('error', '<strong>Erro:</strong><br>Ocorreu um erro ao fazer Upload da Planilha' + err, { positionClass: "toast-bottom-right" });
    //     })
}

function dataAtualFormatada() {
    var data = new Date(),
        dia = data.getDate().toString(),
        diaF = (dia.length == 1) ? '0' + dia : dia,
        mes = (data.getMonth() + 1).toString(), //+1 pois no getMonth Janeiro começa com zero.
        mesF = (mes.length == 1) ? '0' + mes : mes,
        anoF = data.getFullYear();
    return diaF + "/" + mesF + "/" + anoF;
}