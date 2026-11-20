/* ---------------------------------------------------------------- */
/* Personalizações do template por @meu.perrengue                   */
/* ---------------------------------------------------------------- */

// assets/js/custom.js
document.addEventListener("DOMContentLoaded", function() {
  const openBtns = document.querySelectorAll(".open-info");
  const overlay = document.getElementById("custom-overlay");
  const modal = document.getElementById("custom-modal");
  const modalBody = document.getElementById("custom-modal-body");
  const closeBtnSelector = ".custom-modal-close";
  let clearBodyTimeout = null;

  function scrollToProductSection(source) {
    const section = source.closest("section");
    if (!section) return;

    const isModalOpen = modal.classList.contains("active");
    if (isModalOpen) {
      document.body.style.overflow = "";
    }

    section.scrollIntoView({ behavior: "auto", block: "start" });

    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    }
  }

  function openCustomModal(htmlContent) {
    // Cancela limpeza pendente caso o usuário feche e abra outro modal rapidamente
    if (clearBodyTimeout) {
      clearTimeout(clearBodyTimeout);
      clearBodyTimeout = null;
    }

    // Injetar o conteúdo
    modalBody.innerHTML = "";
    modalBody.appendChild(htmlContent);

    // Mostrar
    overlay.classList.add("active");
    modal.classList.add("active");
    document.documentElement.classList.add("is-custom-modal-open"); // para possíveis estilos
    // bloquear scroll principal
    document.body.style.overflow = "hidden";
    // acessibilidade
    modal.setAttribute("aria-hidden", "false");
    overlay.setAttribute("aria-hidden", "false");
  }

  function closeCustomModal(updateUrl = true) {
    overlay.classList.remove("active");
    modal.classList.remove("active");
    document.documentElement.classList.remove("is-custom-modal-open");
    document.body.style.overflow = ""; // restaurar
    modal.setAttribute("aria-hidden", "true");
    overlay.setAttribute("aria-hidden", "true");

    // Remove o parâmetro ?produto=... da URL ao fechar
    if (updateUrl) {
      const url = new URL(window.location.href);
      if (url.searchParams.has("produto")) {
        url.searchParams.delete("produto");
        history.pushState({}, "", url.pathname + url.search + url.hash);
      }
    }

    // limpar conteúdo (opcional)
    clearBodyTimeout = setTimeout(() => {
      modalBody.innerHTML = "";
      clearBodyTimeout = null;
    }, 200);
  }

  function openProductById(id, updateUrl = true, shouldScroll = false) {
    if (!id) return false;
    const source = document.getElementById(`info-${id}`);
    if (!source) return false;

    if (shouldScroll) {
      scrollToProductSection(source);
    }

    // clonar conteúdo para não remover do DOM original
    const clone = source.cloneNode(true);
    // evita ID duplicado no DOM enquanto o modal estiver aberto
    clone.removeAttribute("id");
    // se o clone tem style display:none, removemos para mostrar
    clone.style.display = "";

    // abrir modal com o clone
    openCustomModal(clone);

    // atualiza a URL para ?produto=<id>
    if (updateUrl) {
      const url = new URL(window.location.href);
      if (url.searchParams.get("produto") !== id) {
        url.searchParams.set("produto", id);
        url.hash = "";
        history.pushState({ produto: id }, "", url.pathname + url.search);
      }
    }

    return true;
  }

  function syncModalWithUrl() {
    const params = new URLSearchParams(window.location.search);
    const produtoId = params.get("produto");

    if (produtoId) {
      const opened = openProductById(produtoId, false, true);
      if (!opened && modal.classList.contains("active")) {
        closeCustomModal(false);
      }
    } else if (modal.classList.contains("active")) {
      closeCustomModal(false);
    }
  }

  // abrir ao clicar nos links .open-info
  openBtns.forEach((btn) => {
    btn.addEventListener("click", function(e) {
      e.preventDefault();
      const id = this.dataset.info; // ex: "floresca-seu-ser"
      openProductById(id, true);
    });
  });

  // fechar ao clicar no overlay
  overlay.addEventListener("click", function() {
    closeCustomModal();
  });

  // fechar ao clicar no botão X (delegation)
  document.addEventListener("click", function(e) {
    if (e.target.matches(closeBtnSelector) || e.target.closest(closeBtnSelector)) {
      closeCustomModal();
    }
  });

  // fechar esc
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" || e.key === "Esc") {
      if (modal.classList.contains("active")) closeCustomModal();
    }
  });

  // sincroniza ao usar os botões Voltar / Avançar do navegador
  window.addEventListener("popstate", syncModalWithUrl);

  window.addEventListener("load", function () {
    if (!modal.classList.contains("active")) return;
    const produtoId = new URLSearchParams(window.location.search).get("produto");
    if (!produtoId) return;
    const source = document.getElementById(`info-${produtoId}`);
    if (source) {
      scrollToProductSection(source);
    }
  });

  // abre automaticamente se a página já carregar com ?produto=...
  syncModalWithUrl();
});

// ============================================================
// Formulário "Get in touch" -> abrir e-mail com campos preenchidos
// ============================================================

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // impede o envio padrão do formulário

    // Captura os valores digitados
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    // Monta o link mailto:
    const destinatario = "canalmeuperrengue@gmail.com"; // <-- altere para o seu e-mail real
    const assunto = encodeURIComponent(`Mensagem de ${name || "visitante"} via @VistaPerrengue`);
    const corpo = encodeURIComponent(
      `Nome: ${name}\nE-mail: ${email}\n\nMensagem:\n${message}`
    );

    // Cria o link e abre o cliente de e-mail
    const mailtoLink = `mailto:${destinatario}?subject=${assunto}&body=${corpo}`;
    window.location.href = mailtoLink;
  });
});
