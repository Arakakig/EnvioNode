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
let ArquivoWhatsApp;
let arrayContent = [];
$(() => {
    const allBody = Section(uniKey(), { classNameB: "allBody" });
    const navBarSection = Section(uniKey(), { classNameB: "nav-bar-section" });
    const modalCreateUnique = Section('modal-create-unique', { classNameB: "modal-pop modalCreateUnique" });
    const modalCreateUniqueContent = Section('modal-create-unique-content', { classNameB: "modalCreateUniqueContent" });
    $(modalCreateUnique).html(modalCreateUniqueContent);

    const add_contact = Button(uniKey(), {
        classNameB: "button-7 button-add",
        content: [Icon('plus'), ' Adicionar Cliente'],
        click: (() => {
            modalUnique()
        })
    })
    const filterByCpf = Button(uniKey(), {
        classNameB: "button-7 button-add",
        content: ['Cpf'],
        click: (() => {
            modalUnique()
        })
    })
    const filterByPhone = Button(uniKey(), {
        classNameB: "button-7 button-add",
        content: ['Telefone'],
        click: (() => {
            modalUnique()
        })
    })
    const filterBySector = Button(uniKey(), {
        classNameB: "button-7 button-add",
        content: ['Seção'],
        click: (() => {
            modalUnique()
        })
    })

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



    const typeBody = Section(uniKey(), { classNameB: "typeBody" });

    $(typeBody).html([
        nText({ text: "Nome", classNameB: "typeBodyName" }),
        nText({ text: "Email", classNameB: "typeBodyName" }),
        nText({ text: "Telefone", classNameB: "typeBodyContent" }),
    ]);
    const SendNewEmail = Button(uniKey(), {
        classNameB: "button-7 button-add",
        content: [Icon('envelope'), ' Enviar Email'],
        click: (() => {
            modalEmail()
        })
    })






    const SendPlanilhaModal = Button(uniKey(), {
        classNameB: "button-7 button-add",
        content: [Icon('paper-plane'), ' Enviar Planilha'],
        click: (() => {
            modalAddPlanilha()
        })
    })
    const SendWhatsApp = Button(uniKey(), {
        classNameB: "button-7 button-add",
        content: [Icon('paper-plane'), ' Enviar WhatsApp'],
        click: (() => {
            modalWhatsApp()
        })
    })




    $(navBarSection).html([
        SendPlanilhaModal,
        SendNewEmail,
        SendWhatsApp,
        add_contact,
        space(10),
    ]);
    $("#root").html([
        navBarSection,
        space(10),
        // butonsFilter,
        typeBody,
        allBody,
        modalCreateUnique,
    ]);
    attConstruct()
})


async function setFileContent(content) {
    fileContent = content;
    arrayContent = await TransformCsvtoArray(fileContent);
}

function setArquivoContent(content) {
    ArquivoWhatsApp = content;
}


const attConstruct = () => {
    let userRef = firestore.collection('users').limit(20)

    const allBodyConstruct = Section(uniKey(), { classNameB: "allBodyConstruct" });

    // contacts.push(docUser)
    userRef.onSnapshot((snapshot) => {
        $(allBodyConstruct).html('');
        listDocUsers = [];
        snapshot.forEach((doc) => {

            let docUser = doc.data();
            listDocUsers.push(docUser)
            const contact = Button(docUser.id, {
                classNameB: "button-7 buttonContact",
                content: [nText({ text: docUser.name }), nText({ text: docUser.email }), nText({ text: typeof docUser.number == 'object' ? docUser.number[0] : docUser.number }),],
                click: (() => {
                    modalUnique(docUser.id)
                })
            })
            $(allBodyConstruct).append([
                contact
            ]);
        })
    })

    $('.allBody').html([
        allBodyConstruct
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


    const confirmContact = Button(uniKey(), {
        classNameB: "button button-add",
        content: [Icon('check'), ' Adicionar Cliente'],
        click: (() => {
            var isValid = true
            let testeNumber = inputNumber.value
            if ( inputName.value == '' || testeNumber.length < 13 ) {
                isValid = false;
            }
            if (isValid) {
            
                var phonesArray = [];
                phonesArray.push(inputNumber.value)
              
                docUser = {
                    id: inputContract.value,
                    name: inputName.value,
                    // cpf: inputCpf.value,
                    email: inputEmail.value,
                    number: phonesArray,
                    setor: docUser.setor,
                   
                }
                firestore.collection('users').doc(docUser.id).set(docUser)
                $.fancybox.close()
            }
        })
    })
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

            if (inputName.value == '' || testeNumber.length < 13 ) {
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
            confirmContact,
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
    var Soma;
    var Resto;
    Soma = 0;
    let stringCPF = strCPF.replace(/[^\d]+/g, '');
    if (stringCPF == "00000000000") { return false };

    for (var i = 1; i <= 9; i++) Soma = Soma + parseInt(stringCPF.substring(i - 1, i)) * (11 - i);
    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11)) Resto = 0;
    if (Resto != parseInt(stringCPF.substring(9, 10))) { return false };

    Soma = 0;
    for (var i = 1; i <= 10; i++) Soma = Soma + parseInt(stringCPF.substring(i - 1, i)) * (12 - i);
    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11)) Resto = 0;
    if (Resto != parseInt(stringCPF.substring(10, 11))) { return false; }
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
        classNameB: 'input-field fscroll',
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
    let testeAux = ['Adicionar Clientes', 'Enviar para Mensagem para a Lista'];
    let typeSend = 'Adicionar Clientes';
    const divPlanilha = Section(uniKey(), { classNameB: "divPlanilha" });

    const SendPlanilhaInput = $("<input type='file' class='inputPlanilha button-7 ' accept='.csv' onchange='setFileContent(event.target.files[0])';/>");


    $(divPlanilha).html([
        SendPlanilhaInput
    ])
    const inputMessageContent = inputTextarea(uniKey(), {
        classNameB: 'input-field fscroll',
    });
    const inputDivContent = Section(uniKey(), { classNameB: "inputDivContent" });

    const SendArquivoWhatsApp = $("<input type='file' accept='image/png, image/jpeg' class='inputArquivo inputPlanilha button-7 ' onchange='setArquivoContent(event.target.files[0])';/>");


    $(inputDivContent).html([
        nText({ text: "Conteúdo do Mensagem", classNameB: "subtitle-modal" }),
        inputMessageContent,
        space(),
        SendArquivoWhatsApp,
        space(),
    ]);

    const inputSelectItem = inputSelect(uniKey(), {
        classNameB: "input-field",
        options: testeAux,
        onchange: (e) => {
            if (e.target.value == 'Enviar para Mensagem para a Lista') {
                typeSend = 'Enviar para Mensagem para a Lista';
                inputDivContent.classList.remove('inputDivContent');
            } else {
                typeSend = 'Adicionar Clientes';
                inputDivContent.classList.add('inputDivContent');
            }
        },
    });


    const SendWhatsAppTo = Button(uniKey(), {
        classNameB: "button-7",
        content: [Icon('Check'), ' Concluir'],
        click: (() => {

            if (typeSend == 'Adicionar Clientes') {
                SendPlanilha(fileContent);
            } else {
                if (inputMessageContent.value != '') {
                    SendWhatsApp(inputMessageContent.value, 'Todos os Setores', arrayContent, ArquivoWhatsApp);
                }
            }
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
        nText({ text: "Enviar Planilha", classNameB: "title-modal" }),
        space(20),
        divPlanilha,
        space(20),
        nText({ text: "Deseja Cadastrar Clientes ou Enviar a Mensagem para Lista?", classNameB: "subtitle-modal" }),
        space(),
        inputSelectItem,
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
        url: '/sendemail',
        contentType: 'application/json; charset=utf-8',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({ title, content, listDocUsers })
    })
        .done((res) => {
            console.log(res.data)
            if (res.data.length > 0) {
                res.data.forEach((doc) => {
                    notifyMsg('error', '<strong>Erro:</strong><br>Ocorreu um erro ao tentar enviar o email ' + doc, { positionClass: "toast-bottom-right" });
                })
            } else {
                firestore.collection('messages').add({
                    timeStamp: new Date(),
                    content: res.messageContent,
                    fromTo: res.numbersArray,
                    type: res.type,
                    title: res.title
                })

                notifyMsg('success', 'Emails enviados com sucesso!"', { positionClass: "toast-bottom-right" });
            }
        })
        .catch((err) => {
            //err
        })
}

async function TransformCsvtoArray(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        let aux, users = [];
        reader.readAsText(file);
        reader.onload = e => {
            let result = e.target.result;
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
function SendWhatsApp(message, setor = 'Todos os Setores', users = [], arquivo = '') {
    console.log(users)
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
    formData.append("listDocUsersSend",  JSON.stringify(listDocUsersSend));
    if (arquivo != '') {
        formData.append("file", arquivo);
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
                setTimeout(()=>{
                    location.reload();
                }, 5000);
            }
        })
        .catch((err) => {
            //err
        })
}

function SendPlanilha(e) {
    let arrayReader = [];
    const file = e;
    const reader = new FileReader();
    let aux;
    reader.readAsText(file);
    reader.onload = e => {
        let result = e.target.result;
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
            firestore.collection('users').doc(data.id).set(data);
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