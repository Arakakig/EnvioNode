"use strict";

  var firebaseConfig = {
    apiKey: "<REDACTED_API_KEY>",
    authDomain: "<REDACTED_AUTH_DOMAIN>",
    projectId: "<REDACTED_PROJECT_ID>",
    storageBucket: "<REDACTED_STORAGE_BUCKET>",
    messagingSenderId: "<REDACTED_SENDER_ID>",
    appId: "<REDACTED_APP_ID>",
    measurementId: "<REDACTED_MEASUREMENT_ID>"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  var firestore = firebase.firestore();

$(() => {
    const allBody = Section(uniKey(), { classNameB: "allBody" });
    const navBarSection = Section(uniKey(), { classNameB: "nav-bar-section" });
    const modalCreateUnique = Section('modal-create-unique', { classNameB: "modal-pop modalCreateUnique" });
    const modalCreateUniqueContent = Section('modal-create-unique-content', { classNameB: "modalCreateUniqueContent" });
    $(modalCreateUnique).html(modalCreateUniqueContent);

    const add_contact = Button(uniKey(), {
        classNameB: "button-7 button-add",
        content: [Icon('plus'), ' Cadastrar Transação'],
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
        snapshot.forEach((doc) => {
            let docUser =  doc.data();
            const contact = Button(docUser.id, {
                classNameB: "button-7 buttonContact",
                content: [nText({ text: docUser.name }), nText({ text: docUser.email }), nText({ text: docUser.number }),],
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
        nText({ text: "Id", classNameB: "typeBodyName" }),
        nText({ text: "Nome", classNameB: "typeBodyName" }),
        nText({ text: "Quantidade", classNameB: "typeBodyContent" }),
        nText({ text: "Preço", classNameB: "typeBodyContent" }),
    ]);
    const OtherPage = "<a href='index.html' class='button-7 button-add'>Produtos no Estoque</p>"
    $(OtherPage).css("background-color");
    $(navBarSection).html([
        OtherPage,
        add_contact,
        space(10),
        inputSearch,
    ]);
    $("#root").html([
        navBarSection,
        space(20),
        typeBody,
        allBody,
        modalCreateUnique
    ]);
})

const modalUnique = async (id = '') => {
    $("#modal-create-unique-content").html("")
    $.fancybox.open({ src: "#modal-create-unique", touch: false, keyboard: false });
    let docUser;
    if(id!=''){
        let userRef = firestore.collection('users');
        let doc = await userRef.doc(id).get();
        if (doc && doc.exists) {
            docUser = doc.data();
        }
    }else{
       docUser = {
            id: '',
            data: '',
            product: '',
            qnt: '',
            price: '',
            typé: '',
        }
    }
    
    const InputData = inputField(uniKey(), {
        classNameB: "input-field",
        placeholder: "Digite aqui a data da transação",
        mask: "00/00/0000",
        value: docUser.data
    });
    const inputTransition= inputSelect(uniKey(), {
        classNameB: "input-field",
        placeholder: "Digite aqui o produto da transação",
        mask: "#",
        value: docUser.product
    });
    const inputQnt= inputField(uniKey(), {
        classNameB: "input-field",
        placeholder: "Digite aqui a quantidade do produto",
        mask: "#",
        value: docUser.qnt
    });
    const inputPrice = inputField(uniKey(), {
        classNameB: "input-field",
        placeholder: "Digite aqui o preço total da transação",
        value: docUser.price
    });
    const confirmContact = Button(uniKey(), {
        classNameB: "button button-add",
        content: [Icon('check'), ' Adicionar produto'],
        click: (() => {
            var isValid = true

            if (inputPrice.value == '' || inputName.value == '') {
                isValid = false;
            }
            if (isValid) {
                docUser = {
                    name: inputName.value,
                    price: inputPrice.value,
                    qnty: inputQnt.value,
                    id: uniKey()
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
            let testeNumber = inputTelephone.value

            if (inputEmail.value == '' || inputName.value == '' || testeNumber.length != 14) {
                isValid = false;
            }
            if (isValid) {
                docUser = {
                    name: inputName.value,
                    email: inputEmail.value,
                    number: inputTelephone.value,
                    id: id
                }
                const elemento = document.getElementById(id);

                $(elemento).html([nText({ text: docUser.name }), nText({ text: docUser.email }),nText({ text: docUser.number }),])

                contacts[aux] = docUser;
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
        nText({ text: "Cadastro do Transação", classNameB: "title-modal" }),
        space(20),
        nText({ text: "Data", classNameB: "subtitle-modal" }),
        InputData,
        space(10),
        nText({ text: "Produto", classNameB: "subtitle-modal" }),
        inputTransition,
        space(10),
        nText({ text: "Quantidade", classNameB: "subtitle-modal" }),
        inputQnt,
        space(10),
        nText({ text: "Preço", classNameB: "subtitle-modal" }),
        inputPrice,
        space(20),
        buttonFinal
    ])
    $('.arrow-down').css({position:'absolute', 'text-align':'end'})

}

const filter = (value) => {
    if (value == '') {
        for (var aux = 0; aux < contacts.length; aux++) {
            $("#" + contacts[aux].id).show();
        }
    }
    else {
        for (var aux = 0; aux < contacts.length; aux++) {
            if (contacts[aux].name.includes(value) || contacts[aux].email.includes(value)) {
                $("#" + contacts[aux].id).show();
            } else {
                var element = document.getElementById(contacts[aux].id);
                $("#" + contacts[aux].id).hide();
            }
        }
    }

}

const modalUniqueConsult = async (id = '') => {
    $("#modal-create-unique-content").html("")
    $.fancybox.open({ src: "#modal-create-unique", touch: false, keyboard: false });

    let docUser = {
        name: '',
        email: '',
        number: '',
    }
    var aux = 0
    for (; aux < contacts.length; aux++) {
        if (contacts[aux].id == id) {
            docUser = {
                name: contacts[aux].name,
                email: contacts[aux].email,
                number: contacts[aux].number,
            }
            break;
        }
    }
    const inputName = inputField(uniKey(), {
        classNameB: "input-field",
        placeholder: "",
        value: docUser.name
    });
    const inputTelephone = inputField(uniKey(), {
        classNameB: "input-field",
        placeholder: "",
        mask: "(00)00000-0000",
        value: docUser.number
    });
    const inputEmail = inputField(uniKey(), {
        classNameB: "input-field",
        placeholder: "",
        value: docUser.email
    });
    const confirmContact = Button(uniKey(), {
        classNameB: "button button-add",
        content: [Icon('check'), ' Adicionar contato'],
        click: (() => {
            var isValid = true
            let testeNumber = inputTelephone.value

            if (inputEmail.value == '' || inputName.value == '' || testeNumber.length != 14) {
                isValid = false;
            }
            if (isValid) {
                docUser = {
                    name: inputName.value,
                    email: inputEmail.value,
                    number: inputTelephone.value,
                    id: uniKey()
                }
                
                $.fancybox.close()
            }
        })
    })
    const deletContact = Button(uniKey(), {
        classNameB: "button-3",
        content: [Icon('user-times'), ' Remover contato'],
        click: (() => {
            contacts.splice(aux, 1);
            const elemento = document.getElementById(id);
            elemento.parentNode.removeChild(elemento);
            $(elemento).html('')
            $.fancybox.close()
        })
    })
    const attContact = Button(uniKey(), {
        classNameB: "button",
        content: [Icon('check'), ' Atualizar contato'],
        click: (() => {
            var isValid = true
            let testeNumber = inputTelephone.value

            if (inputEmail.value == '' || inputName.value == '' || testeNumber.length != 14) {
                isValid = false;
            }
            if (isValid) {
                docUser = {
                    name: inputName.value,
                    email: inputEmail.value,
                    number: inputTelephone.value,
                    id: id
                }
                const elemento = document.getElementById(id);

                $(elemento).html([nText({ text: docUser.name }), nText({ text: docUser.email }),nText({ text: docUser.number }),])

                contacts[aux] = docUser;
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
        nText({ text: "Clientes", classNameB: "title-modal" }),
        space(20),
        nText({ text: "Nome", classNameB: "subtitle-modal" }),
        inputName,
        space(10),
        nText({ text: "Telefone", classNameB: "subtitle-modal" }),
        inputTelephone,
        space(10),
        nText({ text: "Email", classNameB: "subtitle-modal" }),
        inputEmail,
        space(20),
        buttonFinal
    ])

}

