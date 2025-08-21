"use strict";

let fileContent;
let ArquivoWhatsApp = [];
let arrayContent = [];

$(() => {
  const page = Section(uniKey(), { classNameB: 'page-container' });
  const hero = Section(uniKey(), { classNameB: 'hero' });
  $(hero).html([
    nText({ text: 'Disparo de Mensagens WhatsApp', classNameB: 'hero-title' }),
    nText({ text: 'Envie mensagens em massa com texto e mídia a partir de uma planilha .csv', classNameB: 'hero-subtitle' })
  ]);

  const grid = Section('grid-main', { classNameB: 'grid' });
  $(page).html([hero, grid]);
  $('#root').html([page]);

  buildUI();
});

async function setFileContent(content) {
  fileContent = content;
  arrayContent = await TransformCsvtoArray(fileContent);
  if (window.updatePreview) window.updatePreview();
}

function setArquivoContent(content) {
  ArquivoWhatsApp = [];
  if (!content) return;
  if (content instanceof FileList || Array.isArray(content)) {
    for (const f of content) { if (f) ArquivoWhatsApp.push(f); }
  } else {
    ArquivoWhatsApp.push(content);
  }
  if (window.updatePreview) window.updatePreview();
}

function buildUI() {
  const grid = $('#grid-main');
  const left = Section(uniKey(), { classNameB: 'panel panel-left' });
  const right = Section(uniKey(), { classNameB: 'panel panel-right' });
  $(grid).html([left, right]);

  // LEFT
  $(left).append(nText({ text: 'Configuração do envio', classNameB: 'panel-title' }));
  const csvRow = Section(uniKey(), { classNameB: 'input-row' });
  const csvInput = $("<input type='file' class='inputPlanilha button-7' accept='.csv' onchange='setFileContent(event.target.files[0])'/>");
  $(csvRow).html([nText({ text: '1) Planilha (.csv)', classNameB: 'label' }), csvInput]);

  let completName = true; // true = nome completo; false = primeiro nome
  const nameMode = inputSelect(uniKey(), { classNameB: 'input-field', options: ['Nome Completo', 'Primeiro Nome'], onchange: (e) => { completName = (e.target.value === 'Nome Completo'); if (window.updatePreview) window.updatePreview(); } });
  const nameRow = Section(uniKey(), { classNameB: 'input-row' });
  $(nameRow).html([nText({ text: '2) Tratamento do nome', classNameB: 'label' }), nameMode]);

  const inputMessageContent = inputTextarea(uniKey(), { classNameB: 'input-field fscroll textAreaGrande' });
  $(inputMessageContent).attr('rows', 8).attr('placeholder', 'Digite a mensagem. Use {nome_cliente} para personalizar.');
  $(inputMessageContent).on('input', () => { if (window.updatePreview) window.updatePreview(); });
  const msgRow = Section(uniKey(), { classNameB: 'input-row stack' });
  $(msgRow).html([nText({ text: '3) Mensagem', classNameB: 'label' }), inputMessageContent]);

  const mediaRow = Section(uniKey(), { classNameB: 'input-row' });
  const mediaInput = $("<input type='file' accept='image/*,video/*' class='inputArquivo inputPlanilha button-7' onchange='setArquivoContent(event.target.files)'/>");
  $(mediaRow).html([nText({ text: '4) Anexo (opcional)', classNameB: 'label' }), mediaInput]);

  const actions = Section(uniKey(), { classNameB: 'actions' });
  const btnCancel = Button(uniKey(), { classNameB: 'button-7', content: [Icon('ban'), ' Cancelar envio'], click: (() => { CancelWhats(); }) });
  const btnSend = Button(uniKey(), { classNameB: 'button-7 button-add', content: [Icon('check'), ' Enviar Mensagem'], click: (() => { SendWhatsApp(inputMessageContent.value, 'Todos os Setores', arrayContent, ArquivoWhatsApp, completName); }) });
  const btnEditTemplates = Button(uniKey(), { classNameB: 'button-7', content: [Icon('edit'), ' Editar modelos'], click: openTemplatesEditor });
  $(actions).html([btnEditTemplates, btnCancel, btnSend]);

  $(left).append([csvRow, nameRow, msgRow, mediaRow, actions]);

  // RIGHT
  $(right).append(nText({ text: 'Pré-visualização', classNameB: 'panel-title' }));
  const stats = Section(uniKey(), { classNameB: 'stats' });
  const statRecipients = Section('stat-recipients', { classNameB: 'stat' });
  const statMedia = Section('stat-media', { classNameB: 'stat' });
  $(statRecipients).html([nText({ text: 'Destinatários', classNameB: 'stat-label' }), nText({ text: '0', classNameB: 'stat-value' })]);
  $(statMedia).html([nText({ text: 'Anexos', classNameB: 'stat-label' }), nText({ text: '0', classNameB: 'stat-value' })]);
  $(stats).html([statRecipients, statMedia]);

  const previewCard = Section(uniKey(), { classNameB: 'preview-card' });
  const previewTitle = nText({ text: 'Exemplo da mensagem', classNameB: 'preview-title' });
  const previewBody = Section('preview-body', { classNameB: 'preview-body' });
  $(previewCard).html([previewTitle, previewBody]);

  const templates = Section(uniKey(), { classNameB: 'templates' });
  $(templates).append(nText({ text: 'Modelos rápidos', classNameB: 'panel-subtitle' }));
  const tplGrid = Section(uniKey(), { classNameB: 'tpl-grid' });
  // buscar do backend (editável)
  fetch('/api/messages').then(r => r.json()).then(cfg => {
    (cfg.templates || []).forEach(t => {
      const btn = Button(uniKey(), { classNameB: 'button-7', content: [t.label], click: (() => { $(inputMessageContent).val(t.text); if (window.updatePreview) window.updatePreview(); notifyMsg('success', 'Modelo aplicado', { positionClass: 'toast-bottom-right' }); }) });
      $(tplGrid).append(btn);
    })
  }).catch(() => {
    // Fallback simples se o JSON não carregar
    const fallback = [
      { label: 'Exemplo', text: 'Olá {nome_cliente}, esta é uma mensagem de exemplo.' }
    ];
    fallback.forEach(t => {
      const btn = Button(uniKey(), { classNameB: 'button-7', content: [t.label], click: (() => { $(inputMessageContent).val(t.text); if (window.updatePreview) window.updatePreview(); notifyMsg('success', 'Modelo aplicado', { positionClass: 'toast-bottom-right' }); }) });
      $(tplGrid).append(btn);
    })
  });
  $(templates).append(tplGrid);
  $(right).html([stats, previewCard, templates]);

  // Seção QRCode (quando necessário)
  const qrCard = Section(uniKey(), { classNameB: 'preview-card' });
  const qrTitle = nText({ text: 'Estado do WhatsApp', classNameB: 'preview-title' });
  const qrBody = Section('qr-body', { classNameB: 'preview-body' });
  const qrImg = document.createElement('img');
  qrImg.id = 'qr-image';
  qrImg.style.maxWidth = '240px';
  qrImg.style.display = 'none';
  const qrStatus = nText({ text: 'Carregando...', classNameB: '' });
  const qrActions = Section(uniKey(), { classNameB: 'actions' });
  const qrRefresh = Button(uniKey(), { classNameB: 'button-7', content: [Icon('sync'), ' Recarregar QR'], click: fetchQr });
  const qrReset = Button(uniKey(), { classNameB: 'button-7', content: [Icon('redo'), ' Resetar sessão'], click: resetQr });
  $(qrActions).append([qrReset, qrRefresh]);
  $(qrBody).append([qrImg, qrStatus, qrActions]);
  $(qrCard).html([qrTitle, qrBody]);
  $(right).append(qrCard);

  async function fetchQr() {
    try {
      const r = await fetch('/api/qr');
      const j = await r.json();
      if (j.status === 'ready') {
        $('#qr-image').hide();
        $(qrStatus).text('Conectado');
      } else if (j.status === 'qr' && j.dataUrl) {
        $('#qr-image').attr('src', j.dataUrl).show();
        $(qrStatus).text('Escaneie o QR Code no seu WhatsApp');
      } else {
        $('#qr-image').hide();
        $(qrStatus).text('Aguardando QR Code...');
      }
    } catch (e) {
      $(qrStatus).text('Erro ao consultar QR');
    }
  }
  // Atualiza a cada 5s
  fetchQr();
  setInterval(fetchQr, 5000);

  async function resetQr() {
    try {
      await fetch('/api/qr/reset', { method: 'POST' });
      notifyMsg('success', 'Sessão reiniciada. Aguarde o novo QR...', { positionClass: 'toast-bottom-right' });
      setTimeout(fetchQr, 1500);
    } catch (e) {
      notifyMsg('error', 'Erro ao resetar sessão', { positionClass: 'toast-bottom-right' });
    }
  }

  window.updatePreview = function () {
    $('#stat-recipients .stat-value').text(arrayContent?.length || 0);
    $('#stat-media .stat-value').text(ArquivoWhatsApp?.length || 0);
    let exampleName = (arrayContent && arrayContent[0]?.name) ? arrayContent[0].name : '{nome_cliente}';
    if (exampleName && exampleName !== '{nome_cliente}' && !completName) {
      const parts = String(exampleName).trim().split(/\s+/);
      exampleName = parts.length > 0 ? parts[0] : exampleName;
    }
    // get value from textarea
    const msg = ($(inputMessageContent).val() || '').replace('{nome_cliente}', exampleName);
    $('#preview-body').text(msg || 'Sua mensagem aparecerá aqui...');
  };
  window.updatePreview();
}

function openTemplatesEditor() {
  // Abre um editor simples baseado no JSON atual
  $.get('/api/messages').done((cfg) => {
    const current = cfg.templates || [];
    const modal = Section(uniKey(), { classNameB: 'modal-pop' });
    const list = Section(uniKey(), { classNameB: 'input-row stack' });
    $(modal).append(nText({ text: 'Editar modelos', classNameB: 'panel-title' }));

    const items = [];
    current.forEach(t => {
      const row = Section(uniKey(), { classNameB: 'input-row stack' });
      const idField = inputField(uniKey(), { classNameB: 'input-field', value: t.id });
      const labelField = inputField(uniKey(), { classNameB: 'input-field', value: t.label });
      const textField = inputTextarea(uniKey(), { classNameB: 'input-field fscroll textAreaGrande' });
      $(textField).val(t.text);
      $(row).append([
        nText({ text: 'ID', classNameB: 'label' }), idField,
        nText({ text: 'Label', classNameB: 'label' }), labelField,
        nText({ text: 'Texto', classNameB: 'label' }), textField
      ]);
      items.push({ idField, labelField, textField });
      $(list).append(row);
    });

    const addBtn = Button(uniKey(), { classNameB: 'button-7', content: [Icon('plus'), ' Adicionar'], click: (() => {
      const row = Section(uniKey(), { classNameB: 'input-row stack' });
      const idField = inputField(uniKey(), { classNameB: 'input-field', value: '' });
      const labelField = inputField(uniKey(), { classNameB: 'input-field', value: '' });
      const textField = inputTextarea(uniKey(), { classNameB: 'input-field fscroll textAreaGrande' });
      $(row).append([
        nText({ text: 'ID', classNameB: 'label' }), idField,
        nText({ text: 'Label', classNameB: 'label' }), labelField,
        nText({ text: 'Texto', classNameB: 'label' }), textField
      ]);
      items.push({ idField, labelField, textField });
      $(list).append(row);
    }) });

    const saveBtn = Button(uniKey(), { classNameB: 'button-7 button-add', content: [Icon('check'), ' Salvar'], click: (() => {
      const payload = { templates: items.map(it => ({ id: it.idField.value, label: it.labelField.value, text: it.textField.value })) };
      $.ajax({ url: '/api/messages', method: 'PUT', contentType: 'application/json', data: JSON.stringify(payload) })
        .done(() => { notifyMsg('success', 'Modelos salvos', { positionClass: 'toast-bottom-right' }); $.fancybox.close(); location.reload(); })
        .fail(() => notifyMsg('error', 'Erro ao salvar', { positionClass: 'toast-bottom-right' }));
    }) });

    $(modal).append([list, Section(uniKey(), { classNameB: 'actions' })]);
    $(modal).find('.actions').append([addBtn, saveBtn]);
    $('#root').append(modal);
    $.fancybox.open({ src: `#${modal.id}`, touch: false, keyboard: false });
  });
}

// ==== Funções utilitárias necessárias para compatibilidade ====
async function TransformCsvtoArray(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    let aux, users = [];
    reader.readAsText(file);
    reader.onload = e => {
      if (e.target.result == undefined) return false;
      let result = e.target.result.replace(/;/g, ',');
      aux = result.split(/\r?\n/);
      aux.forEach((elemento, index) => {
        if (!elemento) return;
        let dados = elemento.split(',');
        let data = {
          name: dados[0],
          number: dados[1],
          email: dados[2],
          setor: dados[3] != undefined ? dados[3] : '',
          id: uniKey()
        };
        if (data.name || data.number) users.push(data);
      })
      resolve(users);
    };
    reader.onerror = error => { reject(error); };
  });
}

function SendWhatsApp(message, setor = 'Todos os Setores', users = [], arquivo = '', nameComplet = true) {
  let listDocUsersSend = users;
  // filtro por setor (compat)
  // Se necessário, implementar aqui usando variável global listDocUsers

  const formData = new FormData();
  formData.append('message', message);
  formData.append('listDocUsersSend', JSON.stringify(listDocUsersSend));
  formData.append('nameComplet', nameComplet);
  for (let i = 0; i < (arquivo?.length || 0); i++) {
    formData.append('files[]', arquivo[i]);
  }

  $.ajax({ url: '/sendmessagewhatsapp', type: 'post', data: formData, processData: false, contentType: false })
    .done((res) => {
      if (res.invalidNumbers && res.invalidNumbers.length > 0) {
        notifyMsg('error', 'Algumas mensagens não foram enviadas. Gerando lista...', { positionClass: 'toast-bottom-right' });
        generateCSV(res.invalidNumbers, 'numeros_invalidos');
      } else {
        notifyMsg('success', 'Mensagens enviadas com sucesso!', { positionClass: 'toast-bottom-right' });
      }
    })
    .catch((err) => {
      console.error('Erro na requisição:', err);
    });
}

function CancelWhats() {
  $.ajax({ url: '/cancelwhats', type: 'post', processData: false, contentType: false })
    .done(() => notifyMsg('success', 'Cancelado o Envio de Mensagens!', { positionClass: 'toast-bottom-right' }))
}

function generateCSV(data, fileName) {
  const csvRows = [];
  const headers = ['Nome', 'Número'];
  csvRows.push(headers.join(';'));
  data.forEach(item => { const row = [item.name, item.number]; csvRows.push(row.join(';')); });
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
