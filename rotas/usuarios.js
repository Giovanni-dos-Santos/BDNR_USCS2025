const express = require('express');
const router = express.Router();
const Usuario = require('../modelos/Usuario');
const Ferramenta = require('../modelos/Ferramenta');

// ---- CREATE ----
router.post('/', async (req, res) => {
  try {
    const { nome, email } = req.body;
    if (!nome || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }

    const usuario = new Usuario(req.body);
    await usuario.save();
    res.status(201).json({ message: 'Usuário criado com sucesso', usuario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao criar usuario. Tente novamente mais tarde.' });
  }
});


function preencherDadosFerramenta(ferramenta) {
  return {
    ferramentaId: ferramenta._id,
    nome: ferramenta.nome,
    descricao: ferramenta.descricao,
    preco: ferramenta.preco
  };
}

router.post('/:id/reservas', async (req, res) => {
  try {
    const { ferramentaId, data_inicio, data_final } = req.body;

    if (!ferramentaId || !data_inicio || !data_final) {
      return res.status(400).json({ error: 'Os campos ferramentaId, data_inicio e data_final são obrigatórios.' });
    }

    if (new Date(data_inicio) >= new Date(data_final)) {
      return res.status(400).json({ error: 'A data de início deve ser anterior à data final.' });
    }

    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const ferramenta = await Ferramenta.findById(ferramentaId);
    if (!ferramenta) {
      return res.status(404).json({ error: 'Ferramenta não encontrada.' });
    }

    if (ferramenta.quantidade < 1) {
      return res.status(400).json({ error: 'Ferramenta sem estoque disponível.' });
    }

    ferramenta.quantidade -= 1;
    await ferramenta.save();

    const novaReserva = {
      data_inicio,
      data_final,
      ferramentas: [preencherDadosFerramenta(ferramenta)]
    };

    usuario.reservas.push(novaReserva);
    await usuario.save();

    res.status(201).json({ message: 'Reserva criada com sucesso.', reserva: novaReserva });
  } catch (err) {
    console.error('Erro ao criar reserva:', err);
    res.status(500).json({ error: 'Erro ao criar a reserva. Tente novamente mais tarde.' });
  }
});


// ---- READ ----
router.get('/', async (req, res) => {
    try {
      const usuarios = await Usuario.find();
      res.status(200).json(usuarios);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao listar usuarios. Tente novamente mais tarde.' });
    }
});

router.get('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).populate('reservas.ferramentas');
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado. Verifique o ID fornecido.' });
    }
    res.status(200).json(usuario);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário. Tente novamente mais tarde.' });
  }
});

router.get('/reservas/ferramentas/:ferramentaId', async (req, res) => {
  try {
    const { ferramentaId } = req.params;

    const usuarios = await Usuario.find();

    const reservasFiltradas = [];

    usuarios.forEach(usuario => {
      usuario.reservas.forEach(reserva => {
        const ferramentasCorrespondentes = reserva.ferramentas.filter(f =>
          f.ferramentaId.toString() === ferramentaId
        );

        if (ferramentasCorrespondentes.length > 0) {
          reservasFiltradas.push({
            usuarioId: usuario._id,
            usuarioNome: usuario.nome,
            usuarioEmail: usuario.email,
            data_inicio: reserva.data_inicio,
            data_final: reserva.data_final,
            ferramentas: ferramentasCorrespondentes
          });
        }
      });
    });

    if (reservasFiltradas.length === 0) {
      return res.status(404).json({ message: 'Nenhuma reserva encontrada para esta ferramenta.' });
    }

    res.status(200).json({ reservas: reservasFiltradas });
  } catch (err) {
    console.error('Erro ao buscar reservas da ferramenta:', err);
    res.status(500).json({ error: 'Erro ao buscar reservas. Tente novamente mais tarde.' });
  }
});


// ---- UPDATE
router.put('/:id', async (req, res) => {
  try {
    const { nome, email } = req.body;

    const emailExistente = await Usuario.findOne({ email, _id: { $ne: req.params.id } });
    if (emailExistente) {
      return res.status(400).json({ error: 'E-mail já está em uso por outro usuário.' });
    }

    const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado. Verifique o ID fornecido.' });
    }

    res.status(200).json({ message: 'Usuário atualizado com sucesso.', usuario });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar usuário. Tente novamente mais tarde.' });
  }
});

router.put('/:userId/reservas/:reservaId', async (req, res) => {
  try {
    const { data_inicio, data_final } = req.body;

    const usuario = await Usuario.findById(req.params.userId);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const reserva = usuario.reservas.id(req.params.reservaId);
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva não encontrada.' });
    }

    if (data_inicio) reserva.data_inicio = new Date(data_inicio);
    if (data_final) reserva.data_final = new Date(data_final);

    await usuario.save();

    res.status(200).json({ message: 'Reserva atualizada com sucesso.', reserva });
  } catch (err) {
    console.error('Erro ao atualizar reserva:', err.message);
    res.status(500).json({ error: 'Erro interno ao atualizar reserva.', details: err.message });
  }
});


// ---- DELETE ----
router.delete('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado. Verifique o ID fornecido.' });
    }

    if (usuario.reservas && usuario.reservas.length > 0) {
      return res.status(400).json({ error: 'Não é possível deletar um usuário com reservas ativas.' });
    }

    await Usuario.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Usuário deletado com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar usuário. Tente novamente mais tarde.' });
  }
});

router.delete('/:userId/reservas/:reservaId', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.userId);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const reserva = usuario.reservas.id(req.params.reservaId);
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva não encontrada.' });
    }

    if (reserva.ferramentas && reserva.ferramentas.length > 0) {
      await Ferramenta.findByIdAndUpdate(reserva.ferramentas[0], { $inc: { quantidade: 1 } });
    }

    await Usuario.findByIdAndUpdate(req.params.userId, { $pull: { reservas: { _id: req.params.reservaId } } });

    res.status(200).json({ message: 'Reserva cancelada com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cancelar reserva. Tente novamente mais tarde.' });
  }
});


module.exports = router;