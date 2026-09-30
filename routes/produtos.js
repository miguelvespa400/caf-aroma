import express from "express";
import produtos from "../data/data_produtos.js";

const router = express.Router();

function validarProduto(corpo, parcial = false) {
  const campos = ["nome", "descricao", "img", "preco"];

  if (!corpo || typeof corpo !== "object" || Array.isArray(corpo)) {
    return "Envie os dados do produto em formato JSON.";
  }

  if (!parcial && campos.some((campo) => corpo[campo] === undefined)) {
    return "Nome, descrição, imagem e preço são obrigatórios.";
  }

  if (campos.every((campo) => corpo[campo] === undefined)) {
    return "Informe ao menos um campo para atualizar.";
  }

  if (corpo.nome !== undefined && (typeof corpo.nome !== "string" || !corpo.nome.trim())) {
    return "O nome deve ser um texto não vazio.";
  }

  if (corpo.descricao !== undefined && (typeof corpo.descricao !== "string" || !corpo.descricao.trim())) {
    return "A descrição deve ser um texto não vazio.";
  }

  if (corpo.img !== undefined && (typeof corpo.img !== "string" || !corpo.img.trim())) {
    return "A imagem deve ser um texto não vazio.";
  }

  if (corpo.preco !== undefined && (!Number.isFinite(Number(corpo.preco)) || Number(corpo.preco) <= 0)) {
    return "O preço deve ser um número maior que zero.";
  }

  return null;
}

function verificarProduto(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({ erro: "O ID deve ser um número inteiro positivo." });
  }

  const indice = produtos.findIndex((produto) => produto.id === id);
  if (indice < 0) {
    return res.status(404).json({ erro: "Produto não encontrado." });
  }

  req.indiceProduto = indice;
  return next();
}

router.get("/", (req, res) => {
  res.json(produtos);
});

router.post("/", (req, res) => {
  const erro = validarProduto(req.body);
  if (erro) {
    return res.status(400).json({ erro });
  }

  const id = req.body.id === undefined
    ? Math.max(0, ...produtos.map((produto) => produto.id)) + 1
    : Number(req.body.id);

  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({ erro: "O ID deve ser um número inteiro positivo." });
  }

  if (produtos.some((produto) => produto.id === id)) {
    return res.status(409).json({ erro: "Já existe um produto com esse ID." });
  }

  const novoProduto = {
    id,
    nome: req.body.nome.trim(),
    descricao: req.body.descricao.trim(),
    img: req.body.img.trim(),
    preco: Number(req.body.preco),
    categoria: typeof req.body.categoria === "string" && req.body.categoria.trim()
      ? req.body.categoria.trim()
      : "Outros",
  };

  produtos.push(novoProduto);
  return res.status(201).json(novoProduto);
});

router.put("/:id", verificarProduto, (req, res) => {
  const erro = validarProduto(req.body, true);
  if (erro) {
    return res.status(400).json({ erro });
  }

  const produtoAtual = produtos[req.indiceProduto];
  const atualizado = {
    ...produtoAtual,
    ...req.body,
    id: produtoAtual.id,
    preco: req.body.preco === undefined ? produtoAtual.preco : Number(req.body.preco),
  };

  for (const campo of ["nome", "descricao", "img", "categoria"]) {
    if (typeof req.body[campo] === "string") {
      atualizado[campo] = req.body[campo].trim();
    }
  }

  produtos[req.indiceProduto] = atualizado;
  return res.status(200).json(atualizado);
});

router.delete("/:id", verificarProduto, (req, res) => {
  const [removido] = produtos.splice(req.indiceProduto, 1);
  return res.status(200).json(removido);
});

export default router;