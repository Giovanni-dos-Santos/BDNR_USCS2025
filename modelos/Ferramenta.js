const mongoose = require('mongoose');

const FerramentaModelagem = new mongoose.Schema({
  nome: { type: String, required: true },
  descricao: { type: String, required: true },
  preco: { type: Number, required: true },
  quantidade: { type: Number, required: true } 
});

module.exports = mongoose.model('Ferramenta', FerramentaModelagem);
