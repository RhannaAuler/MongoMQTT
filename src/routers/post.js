const express = require('express')
const Tecnico = require('../models/tecnico')
const Ambiente = require('../models/ambiente')
const MQTTdata = require('../models/dataMQTT')
const router = express.Router()


// POST DO TECNICO

router.post('/registro_tecnico', async (req, res) => {

    try {
        const tecnico = await Tecnico.create(req.body); // Todos os parametros do esquema estarao dentro de req.body
        return res.send({tecnico});


    } catch (e) {
        res.status(400).send({error: 'Falha nos dados de registro do tecnico'})
    }
     
})

// POST DO AMBIENTE

router.post('/registro_ambiente', async (req, res) => {
    // const { id_DME } = req.body;
    const {slug} = req.body;


    try {

        // Teste

        if (await Ambiente.findOne({id_DME: req.body.pontosDeMedicao[0].id_DME})){ //Verifica se existe aquele id_DME
            console.log(req.body.pontosDeMedicao[0].id_DME)
            console.log("ID Existente")
            return res.status(400).send({error: 'ID_DME existente'})
        }
            
        else{
            console.log("Nao achou a ID")
            const datamqtt = await MQTTdata.create({id_DME: req.body.pontosDeMedicao[0].id_DME}); // Cria a nova ID_DME no schema dataMQTT
            
            res.send({datamqtt})

            if (await Ambiente.findOne({slug})){
                console.log("Achou a Slug do ambiente")
                
                 Ambiente.findOne({slug}, 'pontosDeMedicao')
                .then((doc) => {
                    console.log("Atualiza ponto de medição")
                    return Ambiente.findOneAndUpdate({slug}, {pontosDeMedicao: doc.pontosDeMedicao.concat(req.body.pontosDeMedicao[0])}); // Atualiza o ponto de medição
                    // return res.send({amb, datamqtt})
                    
                })
                // return res.send({datamqtt, ambiente})
            }
            
            else{
                console.log('Nao achou a slug do ambiente, portando da req.body')

                const ambiente = await Ambiente.create(req.body); // Todos os parametros do esquema estarao dentro de req.body
                return res.send({ambiente, datamqtt });
            }
        }
    } catch (e) {
        console.log(e)
        res.status(400).send({error: 'Falha nos dados de registro do Ambiente, verifique se o id_DME é unico'})
    }
     
})

module.exports = router