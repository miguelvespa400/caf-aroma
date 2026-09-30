import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cardapioRoutes from './routes/cardapio.js';
import produtosRoutes from './routes/produtos.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/CSS', express.static(path.join(__dirname, 'CSS')));
app.use('/css', express.static(path.join(__dirname, 'CSS')));

app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'style.css'));
});

app.get('/CSS/:file', (req, res) => {
  res.sendFile(path.join(__dirname, 'CSS', req.params.file));
});

app.get('/css/:file', (req, res) => {
  res.sendFile(path.join(__dirname, 'CSS', req.params.file));
});

app.use('/api/cardapio', cardapioRoutes);
app.use('/api/produtos', produtosRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});