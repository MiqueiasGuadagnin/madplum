function getFiltroDatas() {
    const inicio = document.getElementById("filtroDataInicial")?.value;
    const fim = document.getElementById("filtroDataFinal")?.value;
    if (!inicio || !fim) return null;
    return {
        inicio: new Date(inicio + 'T00:00:00'),
        fim: new Date(fim + 'T23:59:59')
      };
  }


  function gerarPDFEntregas(doc, novaPagina = true, pagina = 1) {
    const filtro = getFiltroDatas();
    let entregas = JSON.parse(localStorage.getItem('entregas')) || [];
    if (filtro) {
      entregas = entregas.filter(e => {
        const data = new Date(e.dataCarregamento);
        return data >= filtro.inicio && data <= filtro.fim;
      });
    }
  
    if (entregas.length === 0) {
      if (!doc) alert("Nenhuma entrega registrada no período.");
      return doc || null;
    }
  
    if (!doc) doc = new jsPDF({ orientation: "landscape" });
  
    let totalPeso = 0, totalFrete = 0, totalComissao = 0;
    const corpo = entregas.map(e => {
      const peso = e.peso || 0;
      const frete = peso * e.valorCidade;
      const comissao = frete * 0.12;
      totalPeso += peso;
      totalFrete += frete;
      totalComissao += comissao;
  
      return [
        e.dataCarregamento, e.localCarregamento, e.dataDescarga,
        e.cidadeDescarga, e.localDescarga,
        peso.toFixed(3) + " t", "R$ " + frete.toFixed(2), "R$ " + comissao.toFixed(2)
      ];
    });
  
    if (novaPagina) doc.addPage("landscape");
    doc.setFontSize(16);
    doc.text(`Relatório de Entregas — Página ${pagina}`, 14, 20);
    doc.autoTable({
      startY: 30,
      head: [["Data Carreg.", "Local Carreg.", "Data Desc.", "Cidade", "Local Desc.", "Peso", "Frete", "Comissão"]],
      body: corpo,
      styles: { fontSize: 10 },
      theme: "striped",
      headStyles: { fillColor: [44, 62, 80] }
    });
  
    let y = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Totais do período:`, 14, y); y += 6;
    doc.text(`Peso total: ${totalPeso.toFixed(3)} t`, 14, y);
    doc.text(`Frete total: R$ ${totalFrete.toFixed(2)}`, 90, y);
    doc.text(`Comissão total: R$ ${totalComissao.toFixed(2)}`, 170, y);
  
    return doc;
  }
  
  function gerarPDFCombustivel(doc, novaPagina = true, pagina = 1) {
    const filtro = getFiltroDatas();
    let abastecimentos = JSON.parse(localStorage.getItem('abastecimentos')) || [];
    if (filtro) {
      abastecimentos = abastecimentos.filter(a => {
        const data = new Date(a.data);
        return data >= filtro.inicio && data <= filtro.fim;
      });
    }
  
    if (abastecimentos.length === 0) {
      if (!doc) alert("Nenhum abastecimento registrado no período.");
      return doc || null;
    }
  
    if (!doc) doc = new jsPDF({ orientation: "landscape" });
  
    let totalLitros = 0, totalValor = 0, arlaLitros = 0, arlaValor = 0, somaKmL = 0, contador = 0;
    let hodometroAnterior = null;
  
    const corpo = abastecimentos.map(a => {
      const arla = a.arla || {};
      const kmL = (hodometroAnterior !== null && a.litros > 0 && a.hodometro > hodometroAnterior)
        ? ((a.hodometro - hodometroAnterior) / a.litros).toFixed(2)
        : "—";
  
      if (kmL !== "—") {
        somaKmL += parseFloat(kmL);
        contador++;
      }
  
      hodometroAnterior = a.hodometro;
  
      totalLitros += a.litros;
      totalValor += a.valor;
      arlaLitros += arla.litros || 0;
      arlaValor += arla.total || 0;
  
      return [
        a.data, a.placa, a.local,
        a.litros.toFixed(2) + " L", "R$ " + a.preco.toFixed(2), "R$ " + a.valor.toFixed(2),
        a.hodometro + " km", a.arla32 === "sim" ? "Sim" : "Não",
        (arla.litros || 0).toFixed(2) + " L", "R$ " + (arla.preco || 0).toFixed(2), "R$ " + (arla.total || 0).toFixed(2),
        kmL + " km/L"
      ];
    });
  
    const mediaKmL = contador > 0 ? (somaKmL / contador).toFixed(2) : "—";
    const mediaArla = arlaLitros > 0 ? (arlaValor / arlaLitros).toFixed(2) : "—";
  
    if (novaPagina) doc.addPage("landscape");
    doc.setFontSize(16);
    doc.text(`Relatório de Abastecimentos — Página ${pagina}`, 14, 20);
    doc.autoTable({
      startY: 30,
      head: [["Data", "Placa", "Local", "Litros", "Preço/L", "Total", "Hodômetro", "Arla32", "Arla Litros", "Arla Preço", "Arla Total", "km/L"]],
      body: corpo,
      styles: { fontSize: 10 },
      theme: "striped",
      headStyles: { fillColor: [44, 62, 80] }
    });
  
    let y = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Totais do período:`, 14, y); y += 6;
    doc.text(`Litros: ${totalLitros.toFixed(2)} L | Valor: R$ ${totalValor.toFixed(2)}`, 14, y);
    doc.text(`Arla32: ${arlaLitros.toFixed(2)} L | Valor: R$ ${arlaValor.toFixed(2)} | Média: R$ ${mediaArla}`, 14, y + 6);
    doc.text(`Média km/L: ${mediaKmL}`, 14, y + 12);
  
    return doc;
  }
  
  function gerarPDFChecklist(doc, novaPagina = true, pagina = 1) {
    const filtro = getFiltroDatas();
    let checklists = JSON.parse(localStorage.getItem('checklists')) || [];
    if (filtro) {
      checklists = checklists.filter(c => {
        const data = new Date(c.data);
        return data >= filtro.inicio && data <= filtro.fim;
      });
    }
  
    if (checklists.length === 0) {
      if (!doc) alert("Nenhum checklist salvo no período.");
      return doc || null;
    }
  
    if (!doc) doc = new jsPDF({ orientation: "landscape" });
  
    doc.setFontSize(16);
    doc.text(`Relatório de Checklists — Página ${pagina}`, 14, 20);
    let y = 30;
  
    checklists.forEach(c => {
      doc.setFontSize(12);
      doc.text(`Data: ${c.data} | Placa: ${c.placa}`, 14, y);
      y += 6;
  
      const corpo = c.itens.map(i => [
        i.nome,
        i.status === "ok" ? "OK" : i.status === "defeito" ? "Defeito" : "—",
        i.obs || "---"
      ]);
  
      doc.autoTable({
        startY: y,
        head: [["Item", "Status", "Observação"]],
        body: corpo,
        theme: "striped",
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 }
      });
  
      y = doc.lastAutoTable.finalY + 10;
      if (y > 190) {
        doc.addPage("landscape");
        y = 20;
      }
    });
  
    return doc;
  }
  
  function gerarPDFManutencao(doc, novaPagina = true, pagina = 1) {
    const filtro = getFiltroDatas();
    let manutencoes = JSON.parse(localStorage.getItem('manutencoes')) || [];
  
    if (filtro) {
      manutencoes = manutencoes.filter(m => {
        const data = new Date(m.data);
        return data >= filtro.inicio && data <= filtro.fim;
      });
    }
  
    if (manutencoes.length === 0) {
      if (!doc) alert("Nenhuma manutenção registrada no período.");
      return doc || null;
    }
  
    if (!doc) doc = new jsPDF({ orientation: "landscape" });
  
    let totalManutencao = 0;
    const corpo = manutencoes.map(m => {
      totalManutencao += m.valor || 0;
      return [
        m.data,
        m.placa || "---",
        m.tipo || "---",
        m.descricao || "---",
        "R$ " + (m.valor || 0).toFixed(2),
        m.pago === "avista" ? "À Vista" : m.pago === "apagar" ? "A Pagar" : "---"
      ];
    });
  
    if (novaPagina) doc.addPage("landscape");
    doc.setFontSize(16);
    doc.text(`Relatório de Manutenções — Página ${pagina}`, 14, 20);
  
    doc.autoTable({
      startY: 30,
      head: [["Data", "Placa", "Tipo", "Descrição", "Valor", "Pagamento"]],
      body: corpo,
      styles: { fontSize: 10 },
      theme: "striped",
      headStyles: { fillColor: [44, 62, 80] }
    });
  
    let y = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Totais do período:`, 14, y);
    y += 6;
    doc.text(`Total em manutenções: R$ ${totalManutencao.toFixed(2)}`, 14, y);
  
    return doc;
  }
  
  function gerarRelatorioFinanceiro(doc = null, novaPagina = true, pagina = 1) {
    const { jsPDF } = window.jspdf;
    if (!doc) doc = new jsPDF({ orientation: "landscape" });
  
    const entregas = JSON.parse(localStorage.getItem("entregas")) || [];
    const abastecimentos = JSON.parse(localStorage.getItem("abastecimentos")) || [];
    const manutencoes = JSON.parse(localStorage.getItem("manutencoes")) || [];
  
    const filtro = typeof getFiltroDatas === "function" ? getFiltroDatas() : null;
  
    let totalReceitas = 0, totalComissao = 0;
    entregas.forEach(e => {
      const dataEntrega = new Date(e.dataCarregamento || e.data);
      if (filtro && (dataEntrega < filtro.inicio || dataEntrega > filtro.fim)) return;
  
      const peso = e.peso || 0;
      const valorCidade = e.valorCidade || 0;
      const frete = peso * valorCidade;
      totalReceitas += frete;
      totalComissao += frete * 0.12;
    });
  
    let totalCombustivel = 0;
    abastecimentos.forEach(a => {
      const data = new Date(a.data);
      if (filtro && (data < filtro.inicio || data > filtro.fim)) return;
  
      totalCombustivel += a.valor || 0;
      if (a.arla && a.arla.total) totalCombustivel += a.arla.total;
    });
  
    let totalManutencao = 0;
    manutencoes.forEach(m => {
      const data = new Date(m.data);
      if (filtro && (data < filtro.inicio || data > filtro.fim)) return;
  
      totalManutencao += m.valor || 0;
    });
  
    const totalDespesas = totalComissao + totalCombustivel + totalManutencao;
    const lucro = totalReceitas - totalDespesas;
  
    if (novaPagina) doc.addPage("landscape");
  
    // Título
    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.text("RELATÓRIO FINANCEIRO CONSOLIDADO", 14, 20);
  
    // Subtítulo com data ou intervalo
    doc.setFontSize(10);
    const hoje = new Date();
    const formatarData = (d) => d.toLocaleDateString("pt-BR");
    const periodoTexto = filtro
      ? `Período: ${formatarData(filtro.inicio)} até ${formatarData(filtro.fim)}`
      : `Data do relatório: ${formatarData(hoje)}`;
    doc.text(periodoTexto, 14, 26);
  
    // Bloco Receitas
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 51);
    doc.text("RECEITAS", 14, 35);
  
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total de Receitas (Fretes):`, 20, 45);
    doc.text(`R$ ${totalReceitas.toFixed(2)}`, 90, 45);
  
    // Bloco Despesas
    doc.setFontSize(14);
    doc.setTextColor(204, 0, 0);
    doc.text("DESPESAS", 14, 60);
  
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Comissão (12%):`, 20, 70);
    doc.text(`R$ ${totalComissao.toFixed(2)}`, 90, 70);
    doc.text(`Combustível:`, 20, 80);
    doc.text(`R$ ${totalCombustivel.toFixed(2)}`, 90, 80);
    doc.text(`Manutenções:`, 20, 90);
    doc.text(`R$ ${totalManutencao.toFixed(2)}`, 90, 90);
    doc.setFont(undefined, "bold");
    doc.text(`Despesas Totais:`, 20, 100);
    doc.text(`R$ ${totalDespesas.toFixed(2)}`, 90, 100);
    doc.setFont(undefined, "normal");
  
    // Resultado Final
    doc.setFontSize(14);
    doc.setTextColor(lucro >= 0 ? 0 : 180, lucro >= 0 ? 128 : 0, 0);
    doc.text(`LUCRO / PREJUÍZO: R$ ${lucro.toFixed(2)}`, 14, 120);
  
    return doc;
  }
  
  function gerarTodosRelatorios() {
    const { jsPDF } = window.jspdf;
    let doc = null;
    let pagina = 1;
    let relatorioGerado = false;
  
    const tentativas = [
      gerarPDFEntregas,
      gerarPDFCombustivel,
      gerarPDFChecklist,
      gerarPDFManutencao,
      gerarRelatorioFinanceiro
    ];
  
    for (const func of tentativas) {
      const tempDoc = doc || new jsPDF({ orientation: "landscape" });
      const result = func(tempDoc, relatorioGerado, pagina++); // novaPagina = true se já gerou algo
      if (result) {
        doc = result;
        relatorioGerado = true;
      }
    }
  
    if (!relatorioGerado) {
      alert("Nenhum dado disponível para gerar os relatórios.");
      return;
    }
  
    const data = new Date().toISOString().split("T")[0];
    doc.save(`relatorio_geral_${data}.pdf`);
  }
  
  function gerarPDFEntregasSimples() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape" });
    gerarPDFEntregas(doc, false, 1);
    const data = new Date().toISOString().split("T")[0];
    doc.save(`relatorio_entregas_${data}.pdf`);
  }
  
  function gerarPDFCombustivelSimples() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape" });
    gerarPDFCombustivel(doc, false, 1);
    const data = new Date().toISOString().split("T")[0];
    doc.save(`relatorio_abastecimento_${data}.pdf`);
  }
  
  function gerarPDFChecklistSimples() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape" });
    gerarPDFChecklist(doc, false, 1);
    const data = new Date().toISOString().split("T")[0];
    doc.save(`relatorio_checklist_${data}.pdf`);
  }
  
  function gerarPDFManutencaoSimples() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape" });
    gerarPDFManutencao(doc, false, 1);
    const data = new Date().toISOString().split("T")[0];
    doc.save(`relatorio_manutencao_${data}.pdf`);
  }
  function gerarPDFFinanceiroSimples() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape" });
    gerarRelatorioFinanceiro(doc, false, 1);
    const data = new Date().toISOString().split("T")[0];
    doc.save(`relatorio_financeiro_${data}.pdf`);
  }
 