import { resolveApiUrl } from "./api-config.js";

document.addEventListener("DOMContentLoaded", () => {
  const lista = document.getElementById("lista-produtos");
  const busca = document.getElementById("busca-produtos");
  const filtros = document.getElementById("filtros-produtos");
  const resumo = document.getElementById("resumo-produtos");
  const botaoSacola = document.getElementById("abrir-sacola");
  const contadorSacola = document.getElementById("contador-sacola");
  const dialogSacola = document.getElementById("dialog-sacola");
  const fecharSacola = document.getElementById("fechar-sacola");
  const itensSacolaElemento = document.getElementById("itens-sacola");
  const totalSacolaElemento = document.getElementById("total-sacola");
  const urlProdutos = resolveApiUrl("/api/produtos");
  const formatoMoeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  let produtos = [];
  let categoriaAtual = "Todos";
  const sacola = new Map();

  function escaparHTML(valor) {
    return String(valor).replace(/[&<>"']/g, (caractere) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[caractere]);
  }

  function renderizarSacola() {
    const itens = [...sacola.values()];
    const quantidadeTotal = itens.reduce((total, item) => total + item.quantidade, 0);
    const valorTotal = itens.reduce((total, item) => total + item.produto.preco * item.quantidade, 0);

    contadorSacola.textContent = String(quantidadeTotal);
    botaoSacola.setAttribute("aria-label", `Abrir sacola, ${quantidadeTotal} ${quantidadeTotal === 1 ? "item" : "itens"}`);
    totalSacolaElemento.textContent = formatoMoeda.format(valorTotal);

    if (itens.length === 0) {
      itensSacolaElemento.innerHTML = '<p class="loja-sacola-vazia">Sua sacola está vazia.</p>';
      return;
    }

    itensSacolaElemento.innerHTML = itens.map(({ produto, quantidade }) => {
      const nome = escaparHTML(produto.nome);
      const id = Number(produto.id);

      return `
        <article class="loja-item-sacola">
          <div class="loja-item-sacola-info">
            <h3>${nome}</h3>
            <p>${formatoMoeda.format(produto.preco)} cada</p>
          </div>
          <div class="loja-controles-quantidade" aria-label="Quantidade de ${nome}">
            <button type="button" data-diminuir="${id}" aria-label="Diminuir quantidade de ${nome}">-</button>
            <span>${quantidade}</span>
            <button type="button" data-aumentar="${id}" aria-label="Aumentar quantidade de ${nome}">+</button>
          </div>
          <button type="button" class="loja-remover-item" data-remover="${id}">Remover</button>
        </article>
      `;
    }).join("");
  }

  function renderizarProdutos() {
    const termo = busca.value.trim().toLocaleLowerCase("pt-BR");
    const filtrados = produtos.filter((produto) => {
      const correspondeCategoria = categoriaAtual === "Todos" || produto.categoria === categoriaAtual;
      const textoProduto = `${produto.nome} ${produto.descricao} ${produto.categoria}`.toLocaleLowerCase("pt-BR");
      return correspondeCategoria && textoProduto.includes(termo);
    });

    resumo.textContent = `${filtrados.length} ${filtrados.length === 1 ? "produto" : "produtos"}`;

    if (filtrados.length === 0) {
      lista.innerHTML = '<p class="loja-status">Nenhum produto encontrado. Tente outra busca ou categoria.</p>';
      return;
    }

    lista.innerHTML = filtrados.map((produto, indice) => {
      const nome = escaparHTML(produto.nome);
      const descricao = escaparHTML(produto.descricao);
      const imagem = escaparHTML(produto.img);
      const categoria = escaparHTML(produto.categoria ?? "Outros");

      return `
        <article class="loja-produto" style="--atraso: ${indice * 45}ms">
          <div class="loja-produto-imagem">
            <img src="${imagem}" alt="${nome}" loading="lazy" />
            <span class="loja-categoria">${categoria}</span>
          </div>
          <div class="loja-produto-info">
            <h3>${nome}</h3>
            <p>${descricao}</p>
            <div class="loja-produto-compra">
              <strong>${formatoMoeda.format(produto.preco)}</strong>
              <button type="button" data-adicionar="${Number(produto.id)}" aria-label="Adicionar ${nome} à sacola">Adicionar</button>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  async function carregarProdutos() {
    try {
      const resposta = await fetch(urlProdutos);
      if (!resposta.ok) {
        throw new Error(`Erro na API: ${resposta.status}`);
      }

      produtos = await resposta.json();
      renderizarProdutos();
    } catch (erro) {
      console.error("Não foi possível carregar os produtos:", erro);
      resumo.textContent = "Loja indisponível";
      lista.innerHTML = '<p class="loja-status">Não foi possível carregar os produtos. Tente novamente mais tarde.</p>';
    }
  }

  busca.addEventListener("input", renderizarProdutos);

  filtros.addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-categoria]");
    if (!botao) {
      return;
    }

    categoriaAtual = botao.dataset.categoria;
    filtros.querySelectorAll("[data-categoria]").forEach((filtro) => {
      const selecionado = filtro === botao;
      filtro.classList.toggle("ativo", selecionado);
      filtro.setAttribute("aria-pressed", String(selecionado));
    });
    renderizarProdutos();
  });

  lista.addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-adicionar]");
    if (!botao) {
      return;
    }

    const produto = produtos.find((item) => item.id === Number(botao.dataset.adicionar));
    if (!produto) {
      return;
    }

    const itemNaSacola = sacola.get(produto.id);
    sacola.set(produto.id, {
      produto,
      quantidade: itemNaSacola ? itemNaSacola.quantidade + 1 : 1,
    });
    renderizarSacola();
    botao.textContent = "Adicionado";
    botao.disabled = true;
    window.setTimeout(() => {
      botao.textContent = "Adicionar";
      botao.disabled = false;
    }, 900);
  });

  botaoSacola.addEventListener("click", () => {
    renderizarSacola();
    dialogSacola.showModal();
    botaoSacola.setAttribute("aria-expanded", "true");
  });

  fecharSacola.addEventListener("click", () => dialogSacola.close());

  dialogSacola.addEventListener("close", () => {
    botaoSacola.setAttribute("aria-expanded", "false");
    botaoSacola.focus();
  });

  dialogSacola.addEventListener("click", (evento) => {
    if (evento.target === dialogSacola) {
      dialogSacola.close();
    }
  });

  itensSacolaElemento.addEventListener("click", (evento) => {
    const botaoAumentar = evento.target.closest("[data-aumentar]");
    const botaoDiminuir = evento.target.closest("[data-diminuir]");
    const botaoRemover = evento.target.closest("[data-remover]");
    const botaoAcionado = botaoAumentar ?? botaoDiminuir ?? botaoRemover;

    if (!botaoAcionado) {
      return;
    }

    const id = Number(botaoAcionado.dataset.aumentar ?? botaoAcionado.dataset.diminuir ?? botaoAcionado.dataset.remover);
    const item = sacola.get(id);
    if (!item) {
      return;
    }

    if (botaoRemover || botaoDiminuir && item.quantidade === 1) {
      sacola.delete(id);
    } else if (botaoAumentar) {
      item.quantidade += 1;
    } else {
      item.quantidade -= 1;
    }

    renderizarSacola();
  });

  carregarProdutos();
});