document.addEventListener('DOMContentLoaded', () => {
  let entregas = JSON.parse(localStorage.getItem('entregas')) || [];
  let fotosCapturadas = [];
  let modoEdicao = false;
  let entregaIndex = null;
  let contadorInterval = null;

  const form = document.getElementById('formEntrega');
  const fotoInput = document.getElementById('fotoInput');
  const localCarregamento = document.getElementById('localCarregamento');
  const cidadeDescarga = document.getElementById('cidadeDescarga');
  const localDescarga = document.getElementById('localDescarga');
  const btnEnviar = document.getElementById('btnEnviar');
  const btnEnviarFoto = document.getElementById('btnEnviarFoto');
  const lista = document.getElementById('listaEntregas');
  const totalComissaoElem = document.getElementById('totalComissao');
  const dataInicialInput = document.getElementById('dataInicial');
  const dataFinalInput = document.getElementById('dataFinal');
  const btnFiltrar = document.getElementById('btnFiltrar');

  let contadorElem = document.createElement('div');
  contadorElem.id = 'contador-tempo';
  contadorElem.style.marginTop = '10px';
  contadorElem.style.fontWeight = 'bold';
  contadorElem.style.color = 'red';
  const botoesContainer = document.getElementById('botoesFormulario') || form.querySelector('button').parentElement;
  form.insertBefore(contadorElem, botoesContainer);

  fotoInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => fotosCapturadas.push(reader.result);
      reader.readAsDataURL(file);
    });
  });

  form.pesoLiquido.addEventListener('input', (e) => {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor.length > 5) valor = valor.slice(0, 5);
    if (valor.length >= 4) {
      valor = valor.slice(0, valor.length - 3) + ',' + valor.slice(-3);
    }
    e.target.value = valor;
  });

  function salvarEntregas() {
    localStorage.setItem('entregas', JSON.stringify(entregas));
  }

  function calcularComissaoTotal() {
    return entregas.reduce((total, entrega) => {
      const valorFrete = entrega.peso * entrega.valorCidade;
      const comissao = valorFrete * 0.12;
      return total + comissao;
    }, 0);
  }

  function renderizarEntregas() {
    lista.innerHTML = "";

    let entregasFiltradas = entregas;
    if (dataInicialInput.value && dataFinalInput.value) {
      const dataInicio = new Date(dataInicialInput.value);
      const dataFim = new Date(dataFinalInput.value);
      entregasFiltradas = entregas.filter(e => {
        const dataEntrega = new Date(e.dataCarregamento);
        return dataEntrega >= dataInicio && dataEntrega <= dataFim;
      });
    }

    const totalComissao = calcularComissaoTotal();
    if (totalComissaoElem) {
      totalComissaoElem.innerHTML = `Total Comissão: R$ ${totalComissao.toFixed(2)}`;
    }

    if (entregasFiltradas.length === 0) {
      lista.innerHTML = "<p>Nenhuma entrega registrada.</p>";
      return;
    }

    entregasFiltradas.forEach((e, i) => {
      const peso = e.peso || 0;
      const valorFrete = peso * e.valorCidade;
      const comissao = valorFrete * 0.12;

      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <strong>${e.dataCarregamento} → ${e.dataDescarga}</strong><br>
        🚚 ${e.localCarregamento} → ${e.localDescarga} (${e.cidadeDescarga})<br>
        ⚖️ ${peso.toFixed(3)} t | 💰 Frete: R$ ${valorFrete.toFixed(2)} | Comissão: R$ ${comissao.toFixed(2)}<br>
        <button class="btnExcluir" data-index="${i}">Excluir</button>
      `;
      lista.appendChild(div);
    });

    document.querySelectorAll('.btnExcluir').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        entregas.splice(index, 1);
        salvarEntregas();
        renderizarEntregas();
      });
    });
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const pesoLiquido = form.pesoLiquido.value.replace(',', '.');
    const peso = parseFloat(pesoLiquido) || 0;

    if (!form.dataCarregamento.value || !form.localCarregamento.value || !form.dataDescarga.value || !form.localDescarga.value || !form.cidadeDescarga.value) {
      alert("Todos os campos são obrigatórios.");
      return;
    }

    const entrega = {
      dataCarregamento: form.dataCarregamento.value,
      localCarregamento: form.localCarregamento.value,
      dataDescarga: form.dataDescarga.value,
      cidadeDescarga: form.cidadeDescarga.value,
      localDescarga: form.localDescarga.value,
      peso: peso,
      valorCidade: parseFloat(cidadeDescarga.getAttribute('data-valor')) || 0,
      imagens: fotosCapturadas.slice()
    };

    if (modoEdicao && entregaIndex !== null) {
      entregas[entregaIndex] = entrega;
      modoEdicao = false;
      alert("Entrega atualizada com sucesso.");
    } else {
      entregas.push(entrega);
    }

    salvarEntregas();
    renderizarEntregas();

    let tempoRestante = 60;
    contadorElem.textContent = `Tempo restante para enviar via WhatsApp: ${tempoRestante}s`;
    clearInterval(contadorInterval);
    contadorInterval = setInterval(() => {
      tempoRestante--;
      contadorElem.textContent = `Tempo restante para enviar via WhatsApp: ${tempoRestante}s`;
      if (tempoRestante <= 0) {
        clearInterval(contadorInterval);
        contadorElem.textContent = "";
        form.reset();
        fotosCapturadas = [];
      }
    }, 1000);
  });

  btnEnviar.addEventListener('click', () => {
    const entrega = entregas[entregas.length - 1];
    if (!entrega) return alert("Nenhuma entrega salva.");

    const valorFrete = entrega.peso * entrega.valorCidade;
    const comissao = valorFrete * 0.12;
    const texto = `📦 *Entrega*\n📅 *Data Carregamento:* ${entrega.dataCarregamento}\n🚚 *Local Carregamento:* ${entrega.localCarregamento}\n📦 *Data Descarga:* ${entrega.dataDescarga}\n🏙️ *Cidade:* ${entrega.cidadeDescarga}\n📍 *Local Descarga:* ${entrega.localDescarga}\n⚖️ *Peso Líquido:* ${entrega.peso.toFixed(3)} t\n💰 *Frete:* R$ ${valorFrete.toFixed(2)}\n📈 *Comissão:* R$ ${comissao.toFixed(2)}`;

    const numero = localStorage.getItem('numeroWhatsapp');
    if (!numero) return alert("Configure o número no menu de Configurações.");
    const link = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
    window.open(link, '_blank');
  });

  btnEnviarFoto.addEventListener('click', async () => {
    if (!fotosCapturadas.length) return alert("Nenhuma imagem carregada.");

    try {
      const mimeType = fotosCapturadas[0].match(/^data:(.*?);/)[1] || 'image/jpeg';
      const response = await fetch(fotosCapturadas[0]);
      const blob = await response.blob();
      const file = new File([blob], "entrega.jpg", { type: mimeType });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Foto da Entrega",
          text: "Foto da entrega registrada.",
          files: [file]
        });
      } else if (navigator.share) {
        await navigator.share({
          title: "Foto da Entrega",
          text: "Foto da entrega registrada no sistema.",
          files: [file]
        });
      } else {
        alert("Compartilhamento não suportado neste dispositivo ou navegador.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao compartilhar a foto. Certifique-se de estar usando o aplicativo.");
    }
  });

  btnFiltrar.addEventListener('click', () => {
    renderizarEntregas();
    btnFiltrar.textContent = "Filtrando...";
    setTimeout(() => btnFiltrar.textContent = "Filtrar", 1000);
  });

  function carregarClientes() {
    localCarregamento.innerHTML = '<option value="">Selecione o local de carregamento</option>';
    localDescarga.innerHTML = '<option value="">Selecione o local de descarga</option>';

    const locais = JSON.parse(localStorage.getItem('locaisCarregamento')) || [];
    locais.forEach(loc => {
      localCarregamento.innerHTML += `<option value="${loc}">${loc}</option>`;
    });

    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const locaisParaCidades = {};
    const locaisUnicos = new Set();

    clientes.forEach(cli => {
      if (cli.localDescarga && cli.cidadeDescarga && cli.valorPorTonelada) {
        locaisUnicos.add(cli.localDescarga);
        locaisParaCidades[cli.localDescarga] = {
          cidade: cli.cidadeDescarga,
          valor: parseFloat(cli.valorPorTonelada)
        };
      }
    });

    locaisUnicos.forEach(loc => {
      localDescarga.innerHTML += `<option value="${loc}">${loc}</option>`;
    });

    localDescarga.addEventListener('change', () => {
      const selecionado = localDescarga.value;
      if (locaisParaCidades[selecionado]) {
        cidadeDescarga.value = locaisParaCidades[selecionado].cidade;
        cidadeDescarga.setAttribute('data-valor', locaisParaCidades[selecionado].valor);
      } else {
        cidadeDescarga.value = "";
        cidadeDescarga.removeAttribute('data-valor');
      }
    });
  }

  carregarClientes();
  renderizarEntregas();
});