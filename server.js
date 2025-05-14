const express = require('express');
const mongoose = require('mongoose');
const ferramentasRoutes = require('./rotas/ferramentas');
const usuariosRoutes = require('./rotas/usuarios');

const app = express();

mongoose
  .connect('mongodb://localhost:27017/plataforma_aluguel')
  .then(() => console.log('Conectado ao MongoDB'))
  .catch((err) => console.log('Erro ao conectar ao MongoDB:', err));

app.use(express.json());

app.use('/ferramentas', ferramentasRoutes);
app.use('/usuarios', usuariosRoutes);

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, () => {
  console.log(`Servidor rodando na porta ${PORTA}`);
});