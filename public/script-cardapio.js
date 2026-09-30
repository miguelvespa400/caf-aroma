import { resolveApiUrl } from "./api-config.js";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("container-cards");
  const URL_API = resolveApiUrl("/api/cardapio");

  async function carregarCardapio() {
    try {
      const response = await fetch(URL_API);

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      container.innerHTML = "";

      data.forEach((cafe, index) => {
        const card = document.createElement("article");
        card.classList.add("card");
        card.style.animationDelay = `${index * 80}ms`;

        card.innerHTML = `
          <img src="${cafe.imagem}" alt="${cafe.nome}">
          <h3>${cafe.nome}</h3>
          <p>${cafe.descrição}</p>
          <button>Pedir Agora</button>
        `;

        container.appendChild(card);
      });
    } catch (error) {
      console.error("Erro ao buscar o cardápio:", error);
      if (container) {
        container.innerHTML = "<p>Não foi possível carregar o cardápio no momento.</p>";
      }
    }
  }

  carregarCardapio();
});
