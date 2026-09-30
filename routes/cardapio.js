import express from "express";
import dados from "../data/cardapio.js";

const router = express.Router();

function verificarItemExiste(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({ erro: "O ID deve ser um número inteiro positivo." });
  }

  const index = dados.findIndex((item) => item.id === id);

  if (index < 0) {
    return res.status(404).json({ erro: "Item do cardápio não encontrado!" });
  }

  req.id = id;
  req.index = index;
  return next();
}

router.get("/", (req, res) => {
  res.json(dados);
});

router.post("/", (req, res) => {
  const corpo = req.body ?? {};
  const { id, nome } = corpo;
  const descricao = corpo.descricao ?? corpo["descrição"];
  const img = corpo.img ?? corpo.imagem;

  if (
    id === undefined ||
    id === null ||
    String(id).trim() === "" ||
    typeof nome !== "string" ||
    !nome.trim() ||
    typeof descricao !== "string" ||
    !descricao.trim() ||
    typeof img !== "string" ||
    !img.trim()
  ) {
    return res.status(400).json({ erro: "Todos os campos são obrigatórios!" });
  }

  const idNumerico = Number(id);
  if (!Number.isSafeInteger(idNumerico) || idNumerico < 1) {
    return res.status(400).json({ erro: "O ID deve ser um número inteiro positivo." });
  }

  const existeItem = dados.some((item) => item.id === idNumerico);
  if (existeItem) {
    return res.status(400).json({ erro: "Cadastro já existente!" });
  }

  const novoItem = {
    id: idNumerico,
    nome: nome.trim(),
    descrição: descricao.trim(),
    imagem: img.trim(),
  };

  dados.push(novoItem);
  return res.status(201).json(dados);
});

router.put("/:id", verificarItemExiste, (req, res) => {
  const corpo = req.body ?? {};
  const nome = corpo.nome;
  const descricao = corpo.descricao ?? corpo["descrição"];
  const img = corpo.img ?? corpo.imagem;
  const campos = [nome, descricao, img];

  if (campos.some((valor) => valor !== undefined && (typeof valor !== "string" || !valor.trim()))) {
    return res.status(400).json({ erro: "Os campos enviados devem ser textos não vazios." });
  }

  const itemAtual = dados[req.index];
  dados[req.index] = {
    ...itemAtual,
    nome: nome !== undefined ? nome.trim() : itemAtual.nome,
    descrição: descricao !== undefined ? descricao.trim() : itemAtual.descrição,
    imagem: img !== undefined ? img.trim() : itemAtual.imagem,
  };

  return res.status(200).json(dados[req.index]);
});

router.delete("/:id", verificarItemExiste, (req, res) => {
  dados.splice(req.index, 1);
  return res.status(204).end();
});

export default router;
