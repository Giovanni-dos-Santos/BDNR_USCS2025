const mongoose = require('mongoose');

const ReservaFerramenta = new mongoose.Schema({
    ferramentaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ferramenta', required: true }, // nomeei melhor o campo
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    preco: { type: Number, required: true }
}, { _id: false });

const Reservas = new mongoose.Schema({
    data_inicio: { type: Date, required: true },
    data_final: { type: Date, required: true },
    ferramentas: [ReservaFerramenta]
});

const UsuarioModelagem = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    reservas: [Reservas]
});


module.exports = mongoose.model('Usuario', UsuarioModelagem);
