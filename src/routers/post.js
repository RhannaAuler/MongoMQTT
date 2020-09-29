const express = require('express');
const Tecnico = require('../models/tecnico');
const Ambiente = require('../models/ambiente');
const router = express.Router();


// POST DO TECNICO

router.post('/registro_tecnico', async (req, res) => {

    try {
        const tecnico = await Tecnico.create(req.body); // Todos os parametros do esquema estarao dentro de req.body
        return res.send({tecnico});


    } catch (e) {
        res.status(400).send({error: 'Falha nos dados de registro do tecnico'})
    }
     
});

// POST DO AMBIENTE

router.post('/registro_ambiente', async (req, res) => {

    try {
        const ambiente = await Ambiente.create(req.body); // Todos os parametros do esquema estarao dentro de req.body
        return res.send({ambiente});


    } catch (e) {
        console.log(e)
        res.status(400).send({error: 'Falha nos dados de registro do Ambiente'})
    }
     
});

module.exports = router