const express = require('express');
const router = express.Router();
const Ferramenta = require('../modelos/Ferramenta');


// ---- CREATE ----
router.post('/', async (req, res) => {
    try {
      const { nome, descricao, preco, quantidade } = req.body;
      if (!nome || !descricao || typeof preco !== 'number' || typeof quantidade !== 'number' || quantidade < 0) {
        return res.status(400).json({ error: 'Dados inválidos para ferramenta' });
      }
  
      const ferramenta = new Ferramenta(req.body);
      await ferramenta.save();
      res.status(201).json({ message: 'Ferramenta criada com sucesso', ferramenta });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro interno ao criar ferramenta. Tente novamente mais tarde.' });
    }
});

// ---- READ ----
router.get('/', async (req, res) => {
    try {
      const ferramentas = await Ferramenta.find();
      res.status(200).json(ferramentas);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao listar ferramentas. Tente novamente mais tarde.' });
    }
});

router.get('/:id', async (req, res) => {
  try {
    const ferramenta = await Ferramenta.findById(req.params.id);
    if (!ferramenta) return res.status(404).send({ erro: 'Não foi possível encontrar a ferramenta. Verifique o ID fornecido' });
    res.status(200).json(ferramenta);
  } catch (err) {
    res.status(500).send({ error: 'Erro ao buscar ferramenta. Tente novamente mais tarde.' });
  }
});

// ---- UPDATE ----
router.put('/:id', async (req, res) => {
    try {
      const ferramenta = await Ferramenta.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!ferramenta) return res.status(404).json({ error: 'Não foi possível atualizar a ferramenta. Verifique o ID fornecido' });
      res.status(200).json({ message: 'Ferramenta atualizada com sucesso.', ferramenta });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao atualizar ferramenta. Tente novamente mais tarde.' });
    }
});

// ---- DELETE ----
router.delete('/:id', async (req, res) => {
    try {
      const ferramenta = await Ferramenta.findByIdAndDelete(req.params.id);
      if (!ferramenta) return res.status(404).json({ error: 'Não foi possível deletar a ferramenta. Verifique o ID fornecido' });
      res.status(200).json({ message: 'Ferramenta deletada com sucesso.' });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao deletar ferramenta. Tente novamente mais tarde.' });
    }
});

module.exports = router;