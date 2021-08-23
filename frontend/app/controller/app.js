
function Section(ind, opt = null) {
    var obj = document.createElement("div");
    obj.id = ind;
    if (opt) {
        $.each(opt, function (i, e) {
            if (i == 'classNameB') {
                obj.className = e;
            } else if (i == 'idPrefix') {
                obj.id = e + ind;
            }
        });
    }
    return obj;
}

function Button(ind, opt) {
    var obj = Section(ind, { classNameB: opt.classNameB });

    $.each(opt, function (i, e) {
        if (i == 'isModal') {
            if (e.active) {
                var new_w;

                if (e.target == 'cache') {
                    // cache_id_modal = uniKey(8);
                    // e.target = cache_id_modal;
                    e.target = 'new-item-pop';
                }

                if (e.create) {
                    new_w = Section(e.target, { classNameB: 'modal-pop' });
                    if (e.classNameM) {
                        $(new_w).addClass(e.classNameM);
                    }
                    $(obj).append(new_w);
                }

                var prefix = '#';

                if (e.type == 'image') {
                    prefix = '';
                }

                $(obj).fancybox({
                    autoFocus: false,
                    src: prefix + e.target,
                    touch: false,

                    afterClose: function (e) {

                        if (e.close !== '') {
                            e.close();
                            $('iframe').remove();
                        }

                        if ($('#new-item-pop').length < 1) {
                            new_w = Section('new-item-pop', { classNameB: 'modal-pop' });
                            if (e.classNameM) {
                                $(new_w).addClass(e.classNameM);
                            }
                            $('#root').append(new_w);
                        }
                    }
                });
            }
        } else if (i == 'click') {
            $(obj).bind('click', e);
        } else if (i == 'idPrefix') {
            obj.id = e + ind;
        } else if (i == 'content') {
            $(e).each(function (c_i, c_e) {
                $(obj).append(c_e);
            })

        }
    });
    return obj;
}


function cancelButton() {
    var obj = Button(uniKey(5), {
        'classNameB': 'cancel-button',
        'click': (function () {
            $.fancybox.close();
        }),
        'content': ['Cancelar']
    });
    return obj;
}

function closeModalButton() {
    return '<button type="button" data-fancybox-close="" class="fancybox-button fancybox-close-small" title="Close"><svg xmlns="http://www.w3.org/2000/svg" version="1" viewBox="0 0 24 24"><path d="M13 12l5-5-1-1-5 5-5-5-1 1 5 5-5 5 1 1 5-5 5 5 1-1z"></path></svg></button>';
}

function reorderButton(id, opt) {

    var obj = Button(uniKey(5), {
        'classNameB': opt.classNameB,
        content: [Icon('arrows-alt'), ' ', 'Ordenar'],
        'click': (function (e) {
            if ($(this).attr('data-step') == '0') {
                $(this).attr('data-step', '1');
                $(this).html([Icon('check'), ' ', 'Concluir']);
                opt.start();
                var dest = opt.dest;
                if (typeof opt.dest == 'string') {
                    dest = $(dest).get(0);
                }
                sortable[id] = new Sortable(dest, {
                    animation: 150,
                    onEnd: opt.onEnd,
                    // function (evt) {
                    //     console.log('0');
                    //     //reOrderItens(i, catalog_itens.id);
                    //   },
                });
            } else {
                $(this).attr('data-step', '0');
                //$('.catalog-itens').show('fast');
                $(this).html([Icon('arrows-alt'), ' ', 'Ordenar']);
                sortable[id].option("disabled", true);
                opt.after();
            }
        })
    });

    $(obj).attr('data-step', '0');

    return obj;
}

function inputField(ind, opt) {
    var obj = document.createElement("input");
    obj.id = ind;

    $.each(opt, function (i, e) {
        if (i == 'classNameB') {
            obj.className = e;
        } else if (i == 'onchange') {
            $(obj).bind('change', e);
        } else if (i == 'idPrefix') {
            obj.id = e + ind;
        } else if (i == 'value') {
            $(obj).val(e);
        } else if (i == 'keyup') {
            $(obj).bind('keyup', e);
        } else if (i == 'placeholder') {
            $(obj).attr('placeholder', e);
        } else if (i == 'type') {
            $(obj).attr('type', e);
        } else if (i == 'name') {
            $(obj).attr('name', e);
        } else if (i == 'mask') {
            $(obj).mask(e, { reverse: opt.reverse });

        } else if (i == 'disable') {
            if (e) {
                $(obj).css('pointer-events', 'none');
                $(obj).attr('disabled', 'disabled');
            }
        }
    });

    return obj;
}

function inputCounter(id, opt) {

    var counter_button = Section(id, { classNameB: 'counter-button' });
    var field_counter = inputField(uniKey(5), { classNameB: 'counter-input', mask: '#', value: opt.value, disable: true });

    var less_button = Button(uniKey(5), {
        classNameB: 'counter-button-minus',
        click: (function (e) {
            if (opt.change('minus')) {
                $(field_counter).val(Number($(field_counter).val()) - 1);
            }
        })
    });
    var add_button = Button(uniKey(5), {
        classNameB: 'counter-button-plus',
        click: (function (e) {

            if (opt.change('plus')) {
                $(field_counter).val(Number($(field_counter).val()) + 1);
            }
        })
    });

    $(counter_button).append([less_button, field_counter, add_button]);

    $(less_button).append(Icon('minus'));
    $(add_button).append(Icon('plus'));

    return counter_button;
}

function inputCheck(ind, opt) {

    var input_section = Section(uniKey(5), { classNameB: 'check-row' })

    var input_check = Section(uniKey(5), { classNameB: 'input-check' })
    var input_check_dot = Section(uniKey(5), { classNameB: 'input-check-dot' })

    $(input_check).append(input_check_dot);

    var check_button = inputField(ind, {
        name: opt.name,
        value: opt.value,

        onchange: (function (e) {

            if (opt.change) {
                opt.change();
            }

            if (this.checked) {
                if (opt.type == 'radio') {
                    $("input[name='" + this.name + "']").parent('.check-row').removeClass('input-checked');
                }
                $(this).parent('.check-row').addClass('input-checked');
            } else {
                if (opt.type == 'checkbox') {
                    $(this).parent('.check-row').removeClass('input-checked');
                }
            }
        }),
        type: opt.type
    });

    $(check_button).prop('checked', opt.checked);

    if (opt.checked) {
        $(input_section).addClass('input-checked');
    }


    if (opt.theme == 'square') {
        $(input_check_dot).append(Icon('check'));
        $(input_check).addClass('input-checkbox');
        $(input_check_dot).addClass('input-checkbox-dot');
    }

    $(check_button).hide();

    var label = document.createElement("label");
    $(label).attr('for', ind);
    $(label).append(opt.label);

    $(input_check).bind('click', function () {
        $(label).click();
    })

    $(input_section).append([input_check, ' ', check_button, label]);

    return input_section;
}

function inputSelect(ind, opt) {
    var box = Section(uniKey());
    $(box).css('position', 'relative');

    var obj = document.createElement("select");
    obj.id = ind;

    $.each(opt, function (i, e) {
        if (i == 'classNameB') {
            obj.className = e;
        } else if (i == 'onchange') {
            $(obj).bind('change', e);
        } else if (i == 'idPrefix') {
            obj.id = e + ind;
        }
    });

    $.each(opt.options, function (index, value) {
        $(obj).append('<option value="' + value + '">' + index + '</option>');
    })

    $('option[value="' + opt.selected + '"]', obj).prop('selected', 'selected');

    $(box).append([obj, Icon('angle-down', { classNameB: 'arrow-down' })])
    return box;
}

function linkA(id, opt = null) {
    var obj = document.createElement("a");
    obj.id = id;
    if (opt) {
        $.each(opt, function (i, e) {
            if (i == 'classNameB') {
                obj.className = e;
            } else if (i == 'click') {
                $(obj).bind('click', e);
            } else if (i == 'href') {
                $(obj).attr('href', e);

            } else if (i == 'content') {
                $(e).each(function (c_i, c_e) {
                    $(obj).append(c_e);
                })
            }
        });
    }

    if (!($(obj).attr('href'))) {
        $(obj).attr('href', 'javascript:;')
    }
    return obj;
}

function nText(opt) {

    var obj = Section(uniKey(5), { classNameB: 'text' });

    if (opt) {
        $.each(opt, function (i, e) {
            if (i == 'classNameB') {
                $(obj).addClass(e);
            } else if (i == 'idPrefix') {
                obj.id = e + obj.id;
            }
        });
    }

    var content = '';

    if ((opt.responsive)) {
        content = '<div class="hide-mobile">' + opt.text + '</div><div class="mobile-only">' + opt.responsive + '</div>';
    } else {
        content = opt.text;
    }

    $(obj).append(content);
    return obj;
}

function Loader(ind, opt) {
    var obj = document.createElement("div");
    obj.id = ind;
    var w = '40px';
    var h = '40px';
    var color = setColor('loader-color');

    $.each(opt, function (i, e) {
        if (i == 'classNameB') {
            obj.className = e;
        } else if (i == 'idPrefix') {
            obj.id = e + ind;
        } else if (i == 'width') {
            w = e;
        } else if (i == 'height') {
            h = e;
        } else if (i == 'color') {
            color = e;
        }
    });

    $(obj).html('<svg version="1.1" id="loader-' + ind + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="' + w + '" height="' + h + '" viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;" xml:space="preserve"><path fill="' + color + '" d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z"><animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.6s" repeatCount="indefinite"/></path></svg>')

    return obj;
}

function iconSuccess() {

    var svg = '<svg id="successAnimation" class="animated" xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 70 70"><path id="successAnimationResult" fill="#D8D8D8" d="M35,60 C21.1928813,60 10,48.8071187 10,35 C10,21.1928813 21.1928813,10 35,10 C48.8071187,10 60,21.1928813 60,35 C60,48.8071187 48.8071187,60 35,60 Z M23.6332378,33.2260427 L22.3667622,34.7739573 L34.1433655,44.40936 L47.776114,27.6305926 L46.223886,26.3694074 L33.8566345,41.59064 L23.6332378,33.2260427 Z"/><circle id="successAnimationCircle" cx="35" cy="35" r="24" stroke="#979797" stroke-width="2" stroke-linecap="round" fill="transparent"/><polyline id="successAnimationCheck" stroke="#979797" stroke-width="2" points="23 34 34 43 47 27" fill="transparent"/></svg>';

    var obj = Section(uniKey(), { classNameB: 'successAnimationBox' });

    $(obj).append(svg)

    return obj;
}

function locationIcon(ind, opt) {
    var obj = document.createElement("div");
    obj.className = 'inline-block';
    obj.id = ind;
    var w = '17px';
    var h = '17px';
    var color = setColor('location-color');

    $.each(opt, function (i, e) {
        if (i == 'classNameB') {
            obj.className = e;
        } else if (i == 'idPrefix') {
            obj.id = e + ind;
        } else if (i == 'width') {
            w = e;
        } else if (i == 'height') {
            h = e;
        } else if (i == 'color') {
            color = e;
        }
    });

    $(obj).html('<svg id="location-' + ind + '" aria-hidden="true" style="margin-bottom: -3px;" width="' + w + '" height="' + h + '" focusable="false" data-icon="location" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="' + color + '" d="M496 224h-50.88C431.61 143.66 368.34 80.39 288 66.88V16c0-8.84-7.16-16-16-16h-32c-8.84 0-16 7.16-16 16v50.88C143.66 80.39 80.39 143.66 66.88 224H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h50.88C80.39 368.34 143.66 431.61 224 445.12V496c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16v-50.88c80.34-13.51 143.61-76.78 157.12-157.12H496c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zM256 384c-70.7 0-128-57.31-128-128s57.3-128 128-128 128 57.31 128 128-57.3 128-128 128zm0-216c-48.6 0-88 39.4-88 88s39.4 88 88 88 88-39.4 88-88-39.4-88-88-88z" class=""></path></svg>');

    return obj;
}

function inputTextarea(ind, opt) {
    var obj = document.createElement("textarea");
    obj.id = ind;

    $.each(opt, function (i, e) {
        if (i == 'classNameB') {
            obj.className = e;
        } else if (i == 'onchange') {
            $(obj).bind('change', e);
        } else if (i == 'idPrefix') {
            obj.id = e + ind;
        } else if (i == 'value') {
            $(obj).val(e);
        } else if (i == 'placeholder') {
            $(obj).attr('placeholder', e);
        }
    });

    return obj;
}

function booleanButton(i, e, b = true) {

    var obj = Section(i, { classNameB: 'bool-btn', 'idPrefix': 'bool-' });

    var btn_true = Button(uniKey(5), {
        classNameB: 'bool-btn-true',
        'content': ['Ativar']
    });

    var btn_false = Button(uniKey(5), {
        classNameB: 'bool-btn-false',
        'content': ['Pausar']
    });

    $(obj).append([btn_false, btn_true]);

    $(btn_true).bind('click', function () {
        e.visible = true;
        $(this).addClass('true-on');
        $(btn_false).removeClass('false-on');
    });

    $(btn_false).bind('click', function () {
        e.visible = false;
        $(this).addClass('false-on');
        $(btn_true).removeClass('true-on');
    });

    $('.bool-btn-' + b.visible, obj).addClass(b.visible + '-on');

    return obj;
}

function Icon(id, opt = null) {
    var obj = document.createElement("i");
    obj.className = 'fa fa-' + id;
    if (opt) {
        $.each(opt, function (i, e) {
            if (i == 'classNameB') {
                $(obj).addClass(e);
            } else if (i == 'color') {
                $(obj).css('color', e);
            } else if (i == 'size') {
                $(obj).css('font-size', e);
            }
        });
    }

    return obj;
}

function space(s = 10) {
    var obj = Section(uniKey(5));
    $(obj).css('height', s + 'px');
    return obj;
}

function rule() {
    var obj = Section(uniKey(5), { classNameB: 'rule-n' });
    return obj;
}

function Menu(id, btns, opt = null) {
    var obj = Section(uniKey(5));
    obj.id = id;
    var responsive_btn;

    if (opt) {
        $.each(opt, function (i, e) {
            if (i == 'classNameB') {
                obj.className = e;
            } else if (i == 'idPrefix') {
                obj.id = e + id;
            }
        });
    }


    $(obj).append(btns);
    return obj;
}

function Footer() {
    var obj = Section(uniKey(), { classNameB: 'footer-row-rule' });
    var footer = Section(uniKey(), { classNameB: 'footer-row' });

    var copy = Section(uniKey(), { classNameB: 'copy-footer' });
    var help = Section(uniKey(), { classNameB: 'help-footer' });

    $(copy).append('Zap Delivery &copy; 2020<br><a href="/privacidade">Política de Privacidade</a> | <a href="/termos">Termos de Uso</a><br>por MacroStudio')
    $(help).append('Preciso de ajuda!<br><strong><a href="/v2/app/myaccount/help">Clique aqui</a></strong>')

    $(footer).html([copy, help]);
    $(obj).html(footer);

    return obj;
}

function storeFooter() {
    var obj = Section(uniKey(), { classNameB: 'footer-row-rule' });
    var footer = Section(uniKey(), { classNameB: 'footer-row' });
    var copy = Section(uniKey(), { classNameB: 'copy-footer' });
    var help = Section(uniKey(), { classNameB: 'help-footer' });

    $(copy).append('Zap Delivery &copy; 2020<br><a href="/privacidade">Política de Privacidade</a> | <a href="/termos">Termos de Uso</a><br>por MacroStudio')
    $(help).append('Tenha seu App de pedidos!<br><strong><a href="/">Clique aqui</a></strong>')

    $(footer).html([copy, help]);
    $(obj).html(footer);

    return obj;
}

function Aths() {



}

/**
 * 
 * General Functions
 * 
 */


function getQuery(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) { return pair[1]; }
    }
    return (false);
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

function timeNow() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function setColor(id) {
    switch (id) {
        case 'loader-color':
            return 'var(--contrast)';
        case 'location-color':
            return '#FFFFFF';
        case 'main-color':
            return '#6AC259';
    }
}

function setStatus(id) {
    switch (id) {
        case 'pendent':
            return 'Pendente';
        case 'processing':
            return 'Processando';
        case 'routing':
            return 'Rota de entrega';
        case 'pick':
            return 'Disponível para retirada';
    }
}

function notifyMsg(type, msg, opt = null) {
    if (opt) { toastr.options = opt; };
    toastr[type](msg);
}

function throwMessage(msg, type, target, opt = null) {

    var message = Section(uniKey(), { classNameB: 'throw-message ' + type });

    $(message).append(msg);

    if (opt) {
        if (opt.icon) {
            $(message).prepend([Icon(opt.icon), ' ']);
        }
    }

    $(message).hide();
    $(target).append(message);
    $(message).show('slow');

}

function throwAuthError(code) {

    var err = {
        "auth/app-deleted": "Thrown if the instance of FirebaseApp has been deleted.",
        "auth/app-not-authorized": "Thrown if the app identified by the domain where it's hosted, is not authorized to use Firebase Authentication with the provided API key. Review your key configuration in the Google API console.",
        "auth/argument-error": "Thrown if a method is called with incorrect arguments.",
        "auth/invalid-api-key": "Thrown if the provided API key is invalid. Please check that you have copied it correctly from the Firebase Console.",
        "auth/invalid-user-token": "Thrown if the user's credential is no longer valid. The user must sign in again.",
        "auth/invalid-tenant-id": "Thrown if the tenant ID provided is invalid.",
        "auth/network-request-failed": "Thrown if a network error (such as timeout, interrupted connection or unreachable host) has occurred.",
        "auth/operation-not-allowed": "Thrown if you have not enabled the provider in the Firebase Console. Go to the Firebase Console for your project, in the Auth section and the Sign in Method tab and configure the provider.",
        "auth/requires-recent-login": "Thrown if the user's last sign-in time does not meet the security threshold. Use firebase.User.reauthenticateWithCredential to resolve. This does not apply if the user is anonymous.",
        "auth/too-many-requests": "Thrown if requests are blocked from a device due to unusual activity. Trying again after some delay would unblock.",
        "auth/unauthorized-domain": "Thrown if the app domain is not authorized for OAuth operations for your Firebase project. Edit the list of authorized domains from the Firebase console.",
        "auth/user-disabled": "Thrown if the user account has been disabled by an administrator. Accounts can be enabled or disabled in the Firebase Console, the Auth section and Users subsection.",
        "auth/user-token-expired": "Thrown if the user's credential has expired. This could also be thrown if a user has been deleted. Prompting the user to sign in again should resolve this for either case.",
        "auth/web-storage-unsupported": "Thrown if the browser does not support web storage or if the user disables them.",
        "auth/email-already-in-use": "Este email já está em uso.",
        "auth/user-not-found": "Dados incorretos! Verifique e tente novamente.",
        "auth/wrong-password": "Dados incorretos! Verifique e tente novamente."
    }

    return err[code];
}

function showModalNotification(msg, opt = null) {

    var body_pop = Section(uniKey(), { classNameB: 'modal-pop' });

    $(body_pop).css('text-align', 'center');
    $(body_pop).attr('data-touch', 'false');


    $(body_pop).append([
        nText({ text: msg }),
        space(),
        Button(uniKey(), { classNameB: 'button', content: [Icon('check'), ' Ok'], click: (function () { $.fancybox.close(); }) })
    ]);


    $('body').append(body_pop);

    $.fancybox.open(body_pop);

}

function uniKey(length = 10) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function Copy(e) {
    var copyText = document.getElementById(e);
    copyText.select();
    copyText.setSelectionRange(0, 99999)
    document.execCommand("copy");
}

function sendImage(i, ind, e) {

    var filesToUpload = e.files;
    $('.add-img-msg', '#add-img-' + ind).html(Loader(ind, { idPrefix: 'loader-', width: '25px', height: '25px' }));

    if (filesToUpload.length > 0) {
        var file = filesToUpload[0];

        var img = document.createElement("img");
        var reader = new FileReader();

        reader.onload = function (e) {
            img.src = e.target.result;
            img.onload = function (e) {

                var width = img.width;
                var height = img.height;

                var canvas = document.createElement("canvas");
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                var MAX_WIDTH = 1500;
                var MAX_HEIGHT = 1500;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;


                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                var canvas_thumb = document.createElement("canvas");
                ctx_thumb = canvas_thumb.getContext("2d");

                canvas_thumb.width = canvas_thumb.height = 150;

                ctx_thumb.drawImage(
                    img,
                    width > height ? (width - height) / 2 : 0,
                    height > width ? (height - width) / 2 : 0,
                    width > height ? height : width,
                    width > height ? height : width,
                    0, 0,
                    150, 150
                );

                var dataurl = canvas.toDataURL("image/png");
                var dataurl_thumb = canvas_thumb.toDataURL("image/png");

                getImage(ind, dataurl);

                uploadFile(i, ind, dataurl.replace(/^data:image\/(png|jpg);base64,/, ""));
                uploadFileThumb(ind, dataurl_thumb.replace(/^data:image\/(png|jpg);base64,/, ""));

            }
        }
        reader.readAsDataURL(file);
    }
}

function uploadFile(i, ind, o) {

    const file_ref = firebase.storage().ref('stores/' + store.id + '/' + ind + '.png');

    file_ref.put(base64ToBlob(o)).then(function (snapshot) {
        file_ref.updateMetadata({ cacheControl: 'public,max-age=200000' });

        $('.add-img-msg', '#add-img-' + ind).html(Icon('check-circle'));
        if (!$(store.catalog[i].itens[ind].image).length) {
            $('#hd-pic-' + i).append(
                Button(ind, {
                    idPrefix: 'rmv-img-',
                    classNameB: 'btn-rmv-img',
                    content: [Icon('times-circle')],
                    'click': (function (e) {
                        $('.add-img').css('background-image', 'url(\'/apps/assets/img/noimg.png\')');
                        $('img', '#' + ind).attr('src', '/apps/assets/img/noimg.png');
                        catalog[i].itens[ind].image = false;
                        this.remove();
                    })
                }));
        }
        store.catalog[i].itens[ind].image = true;

        //notifyMsg('success', 'Imagem enviada e publicada com sucesso', { positionClass: "toast-bottom-right" });
    });
}

function uploadFileThumb(ind, o) {
    const file_ref = firebase.storage().ref('stores/' + store.id + '/' + ind + '-150x150.png');
    file_ref.put(base64ToBlob(o)).then(function (snapshot) {
        file_ref.updateMetadata({ cacheControl: 'public,max-age=200000' });
    });
}


function base64ToBlob(base64, mime) {
    mime = mime || '';
    var sliceSize = 1024;
    var byteChars = window.atob(base64);
    var byteArrays = [];

    for (var offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
        var slice = byteChars.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mime });
}

function getImage(ind, data) {
    $('.add-img').css('background-image', 'url(' + data + ')');
    $('img', '#' + ind).attr('src', data);
}

function resizeModalGeo(h, t) {
    $('.iframe-geo').css('height', h + t);

    $('iframe', '.iframe-geo').attr('scrolling', 'no');
    if (t == 'px') { h = h - 5 };
    $('iframe', '.iframe-geo').css('height', h + t);
}
