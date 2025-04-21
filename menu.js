
window.addEventListener('DOMContentLoaded', () => {
  fetch('../menu.html')
    .then(res => res.text())
    .then(html => {
      const nav = document.createElement('div');
      nav.innerHTML = html;
      document.body.prepend(nav);
    });
});

document.addEventListener("DOMContentLoaded", () => {
  // Ícones nos botões
  document.querySelectorAll("button").forEach(btn => {
    const text = btn.textContent.toLowerCase();

    if (text.includes("salvar")) {
      btn.innerHTML = '<i class="fas fa-save"></i> ' + btn.textContent.trim();
    }
    if (text.includes("editar")) {
      btn.innerHTML = '<i class="fas fa-edit"></i> ' + btn.textContent.trim();
    }
    if (text.includes("excluir") || text.includes("deletar")) {
      btn.innerHTML = '<i class="fas fa-trash-alt"></i> ' + btn.textContent.trim();
    }
    if (text.includes("reenviar")) {
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> ' + btn.textContent.trim();
    }
    if (text.includes("enviar")) {
      btn.innerHTML = '<i class="fas fa-share-square"></i> ' + btn.textContent.trim();
    }
    if (text.includes("novo")) {
      btn.innerHTML = '<i class="fas fa-plus-circle"></i> ' + btn.textContent.trim();
    }
  });

  // Ícones nos links do menu
  document.querySelectorAll(".menu-nav a").forEach(link => {
    const text = link.textContent.toLowerCase();

    if (text.includes("abastecimento")) {
      link.innerHTML = '<i class="fas fa-gas-pump"></i> ' + link.textContent.trim();
    }
    if (text.includes("clientes")) {
      link.innerHTML = '<i class="fas fa-users"></i> ' + link.textContent.trim();
    }
    if (text.includes("manutenção")) {
      link.innerHTML = '<i class="fas fa-tools"></i> ' + link.textContent.trim();
    }
    if (text.includes("entregas")) {
      link.innerHTML = '<i class="fas fa-truck"></i> ' + link.textContent.trim();
    }
    if (text.includes("relatórios")) {
      link.innerHTML = '<i class="fas fa-file-pdf"></i> ' + link.textContent.trim();
    }
    if (text.includes("configurações")) {
      link.innerHTML = '<i class="fas fa-cogs"></i> ' + link.textContent.trim();
    }
  });
});
document.addEventListener("click", function (e) {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("menuNav");
  if (toggle && nav && e.target === toggle) {
    nav.classList.toggle("ativo");
  }
});
