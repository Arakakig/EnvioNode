"use strict";
//Unikey é uma função que cria um chave aleatoria
//Section é uma função que cria uma div com um id e uma classe
//nText é uma função que cria um elemento text, com uma classe
//Button é uma função que cria um botão que contém nele um id, classe, o que há dentro do html dele e uma função click
//Space é uma função que cria uma div que da um espaço vertical com um parametro que eu passar dentro em px
//Icon é uma função que pega um icone em svg do site FontAwesome
//InputField é uma função cria um campo input
//Mask é uma mascara que pode ser colocada num input
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
let listDocUsers = [];
var firestore = firebase.firestore();

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

    const inputSearch = inputField(uniKey(), {
        classNameB: "input-field",
        placeholder: "Digite aqui o campo para a pesquisa",
        onchange: (() => {
            filter(inputSearch.value)
        })
    });
    let userRef = firestore.collection('users').limit(20)

    const allBodyContent = Section(uniKey(), { classNameB: "allBodyContent" });

    // contacts.push(docUser)
    userRef.onSnapshot((snapshot) => {
        $(allBodyContent).html('');
        listDocUsers = []
        snapshot.forEach((doc) => {
            let docUser = doc.data();
            listDocUsers.push(docUser)
            const contact = Button(docUser.id, {
                classNameB: "button-7 buttonContact",
                content: [nText({ text: docUser.name }), nText({ text: docUser.email }), nText({ text: docUser.number[0] }),],
                click: (() => {
                    modalUnique(docUser.id)
                })
            })
            $(allBodyContent).append([
                contact
            ]);

        })
    })
    $(allBody).append([
        allBodyContent
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
    const SendWhatsApp = Button(uniKey(), {
        classNameB: "button-7 button-add",
        content: [Icon('paper-plane'), ' Enviar WhatsApp'],
        click: (() => {
            modalWhatsApp()
        })
    })
    $(navBarSection).html([
        SendNewEmail,
        SendWhatsApp,
        add_contact,
        space(10),
        inputSearch,
    ]);
    $("#root").html([
        navBarSection,
        space(20),
        typeBody,
        allBody,
        modalCreateUnique,
    ]);
})

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
        if(docUser && docUser.dueDate){
            dateVenc = new Date(docUser.dueDate.seconds*1000);
            dateVenc = dateVenc.toLocaleDateString("pt-BR")
        }
        if(docUser && docUser.dateNasc){
            dateNasc = new Date(docUser.dateNasc.seconds*1000);
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
            dateNasc:dataAtualFormatada(),
            dueDate: dataAtualFormatada()
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
    const inputCpf = inputField(uniKey(), {
        classNameB: "input-field",
        placeholder: "Digite aqui o Cpf do Cliente",
        mask: "000.000.000-00",
        value: docUser.cpf
    });
    const inputDatNasc = inputField(uniKey(), {
        classNameB: "input-field",
        placeholder: "Digite aqui a data de nascimento do cliente",
        mask: "00/00/0000",
        value: dateNasc
    });
    const inputDuedate = inputField(uniKey(), {
        classNameB: "input-field",
        placeholder: "Digite aqui a data de vencimento",
        mask: "00/00/0000",
        value: dateVenc
    });
    
    const inputNumber = inputField(uniKey(), {
        classNameB: "input-field",
        placeholder: "Digite aqui o número do Cliente",
        mask: "(00)0000-0000",
        value: docUser.number[0]
    });
    const inputNumber1 = inputField(uniKey(), {
        classNameB: "input-field",
        placeholder: "Digite aqui o número do Cliente",
        mask: "(00)0000-0000",
        value: docUser.number[1]
    });
    const inputNumber2 = inputField(uniKey(), {
        classNameB: "input-field",
        placeholder: "Digite aqui o número do Cliente",
        mask: "(00)0000-0000",
        value: docUser.number[2]
    });
    const inputEmail = inputField(uniKey(), {
        classNameB: "input-field",
        placeholder: "Digite aqui o email do cliente",
        value: docUser.email
    });

    const inputSector = inputField(uniKey(), {
        classNameB: "input-field",
        placeholder: "Digite aqui o setor do Cliente",
        value: docUser.sector
    });

    $(inputSector).css("text-align","center")
    $(inputSector).css("font-weight","700")
    $(inputSector).css("font-size","20px")
    const confirmContact = Button(uniKey(), {
        classNameB: "button button-add",
        content: [Icon('check'), ' Adicionar produto'],
        click: (() => {
            var isValid = true
            let testeNumber = inputNumber.value
            console.log(validarCPF(inputCpf.value))
            if (inputEmail.value == '' || inputName.value == '' || testeNumber.length < 13 || inputDuedate.value=='' || inputDatNasc.value==''||
            validarCPF(inputCpf.value)==false|| inputContract==''||inputSector=='') {
                isValid = false;
            }
            if (isValid) {
                const dueDateSplit = inputDuedate.value.split("/");
                const dateVencSplit = inputDuedate.value.split("/");

                var timestampDueDate = new Date(dueDateSplit[2],(Number(dueDateSplit[1])-1).toString(),dueDateSplit[0]);
                var timestampDateNasc= new Date(dateVencSplit[2],(Number(dateVencSplit[1])-1).toString(),dateVencSplit[0]);

                var phonesArray = [];
                phonesArray.push(inputNumber.value)
                if(inputNumber1.value!=''){
                    phonesArray.push(inputNumber1.value)
                }
                if(inputNumber2.value!=''){
                    phonesArray.push(inputNumber1.value)
                }
                docUser = {
                    id: inputContract.value,
                    name: inputName.value,
                    cpf: inputCpf.value,
                    email: inputEmail.value,
                    number: phonesArray,
                    sector: inputSector.value,
                    dueDate: timestampDueDate,
                    dateNasc: timestampDateNasc,
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
                console.log(e)
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

            if (inputEmail.value == '' || inputName.value == '' || testeNumber.length < 13 || inputDuedate.value=='' || inputDatNasc.value==''||
            validarCPF(inputCpf.value)==false|| inputContract==''||inputSector=='') {
                isValid = false;
            }
            if (isValid) {
                const dueDateSplit = inputDuedate.value.split("/");
                const dateVencSplit = inputDatNasc.value.split("/");

                var timestampDueDate = new Date(dueDateSplit[2],(Number(dueDateSplit[1])-1).toString(),dueDateSplit[0]);
                var timestampDateNasc= new Date(dateVencSplit[2],(Number(dateVencSplit[1])-1).toString(),dateVencSplit[0]);
                console.log(timestampDateNasc)
                var phonesArray = [];
                phonesArray.push(inputNumber.value)
                if(inputNumber1.value!=''){
                    phonesArray.push(inputNumber1.value)
                }
                if(inputNumber2.value!=''){
                    phonesArray.push(inputNumber1.value)
                }
                docUser = {
                    id: inputContract.value,
                    name: inputName.value,
                    cpf: inputCpf.value,
                    email: inputEmail.value,
                    number: phonesArray,
                    sector: inputSector.value,
                    dueDate: timestampDueDate,
                    dateNasc: timestampDateNasc,
                }
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
    const dateNumber = Section(uniKey(), { classNameB: "dateNumber" });

    $(dateNumber).html([
        nText({ text: "Número 1", classNameB: "subtitle-modal" }),
        inputNumber,
        space(),
        nText({ text: "Número 2", classNameB: "subtitle-modal" }),
        inputNumber1,
        space(),
        nText({ text: "Número 3", classNameB: "subtitle-modal" }),
        inputNumber2,
        space(),
    ])

    $("#modal-create-unique-content").html([
        nText({ text: "Cadastrar Pessoa", classNameB: "title-modal" }),
        space(20),
        nText({ text: "Nome", classNameB: "subtitle-modal" }),
        inputName,
        space(10),
        nText({ text: "Contrato", classNameB: "subtitle-modal" }),
        inputContract,
        space(10),
        nText({ text: "Cpf", classNameB: "subtitle-modal" }),
        inputCpf,
        space(10),
        nText({ text: "Data de Nascimento", classNameB: "subtitle-modal" }),
        inputDatNasc,
        space(),
        nText({ text: "Data de Vencimento", classNameB: "subtitle-modal" }),
        inputDuedate,
        space(10),
        dateNumber,
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
// const filter = (value) => {
//     if (value == '') {
//         for (var aux = 0; aux < contacts.length; aux++) {
//             $("#" + contacts[aux].id).show();
//         }
//     }
//     else {
//         for (var aux = 0; aux < contacts.length; aux++) {
//             if (contacts[aux].name.includes(value) || contacts[aux].email.includes(value)) {
//                 $("#" + contacts[aux].id).show();
//             } else {
//                 var element = document.getElementById(contacts[aux].id);
//                 $("#" + contacts[aux].id).hide();
//             }
//         }
//     }

// }

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
    // const inputTeste = "<input id='inputFile' type='file' multiple='multiple' ></input>"

    const SendEmailTo = Button(uniKey(), {
        classNameB: "button-7",
        content: [Icon('envelope'), ' Enviar Email'],
        click: (() => {
            // console.log(formData)
            if(inputSubjectContent.value!=''&&inputEmailContent.value!=''){
                SendEmail(inputSubjectContent.value,inputEmailContent.value)
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

const modalWhatsApp = () =>{
    $("#modal-create-unique-content").html("")
    $.fancybox.open({ src: "#modal-create-unique", touch: false, keyboard: false });



    const inputMessageContent = inputTextarea(uniKey(), {
        classNameB: 'input-field fscroll',
    });
   

    const SendWhatsAppTo = Button(uniKey(), {
        classNameB: "button-7",
        content: [Icon('paper-plane'), ' Enviar Mensagem'],
        click: (() => {
            // console.log(formData)
            if(inputMessageContent.value!=''){
                // SendEmail(inputSubjectContent.value,inputEmailContent.value)
                SendWhatsApp(inputMessageContent.value)
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
        nText({ text: "Conteúdo do Mensagem", classNameB: "subtitle-modal" }),
        inputMessageContent,
        space(),
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
        data: JSON.stringify({ title, content, listDocUsers})
    })
        .done((res) => {
            console.log(res.data)
            if (res.data.length > 0) {
                res.data.forEach((doc) => {
                    notifyMsg('error', '<strong>Erro:</strong><br>Ocorreu um erro ao tentar enviar o email ' + doc, { positionClass: "toast-bottom-right" });
                })
            } else {

                // let content = {
                   
                // }
                console.log(res)
                firestore.collection('messages').add({
                    timeStamp:new Date(),
                    content:res.messageContent,
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

function SendWhatsApp(message) {
    $.ajax({
        url: '/sendmessagewhatsapp',
        contentType: 'application/json; charset=utf-8',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify({ message, listDocUsers})
    })
        .done((res) => {
            console.log(res.data)
            if (res.data.length > 0) {
                res.data.forEach((doc) => {
                    notifyMsg('error', '<strong>Erro:</strong><br>Ocorreu um erro ao tentar enviar as mensagens ' + doc, { positionClass: "toast-bottom-right" });
                })
            } else {
                let content = {
                    timeStamp:new Date(),
                    message:res.messageContent,
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

function whatsappAba(){

}

function dataAtualFormatada(){
    var data = new Date(),
        dia  = data.getDate().toString(),
        diaF = (dia.length == 1) ? '0'+dia : dia,
        mes  = (data.getMonth()+1).toString(), //+1 pois no getMonth Janeiro começa com zero.
        mesF = (mes.length == 1) ? '0'+mes : mes,
        anoF = data.getFullYear();
    return diaF+"/"+mesF+"/"+anoF;
}