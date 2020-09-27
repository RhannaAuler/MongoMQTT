const express = require('express')
//const MQTTdata = require('../models/dataMQTT')
const Ambiente = require('../models/ambiente')
const router = new express.Router()


// nome dos labs
router.get('/labs', async (req, res) => {

    
    try {
        const dados = await Ambiente.find({ }, { name: 1, slug: 1, _id: 0 })
        return res.send(dados)
    } catch (e) {
        res.status(500).send()
    }
})

// pegar dados de um especifico lab (usar slug)
router.get('/labs/:lab', async (req, res) => {
    const lab = req.params.lab

    try {
        const dados = await Ambiente.find({slug: lab})
        if (!dados) {
            res.status(404).send()
        }
        res.send(dados)
    } catch(e) {
        res.status(500).send()
    }   
})

module.exports = router