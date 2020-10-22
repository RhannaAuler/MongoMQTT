const express = require('express')
const MQTTdata = require('../models/dataMQTT')
const Ambiente = require('../models/ambiente')
const router = new express.Router()


// GETS gerais


// todos os dados
router.get('/', async (req, res) => {

    try {
        const dados = await Ambiente.aggregate(
            [
                ...connectAmbienteDME(),
                activeDMEandAMB(),
            ]
        )
        return res.send(dados)
    } catch (e) {
        res.status(500).send()
    }

        
})

// nome dos labs
router.get('/labs', async (req, res) => {

    try {
        const dados = await Ambiente.find({ }, { name: 1, slug: 1, _id: 0 })
        return res.send(dados) // envia dados encontrados como resposta
    } catch (e) { 
        res.status(500).send() // envia o erro
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


// Lista de ponto de medição dos suas respectivas slugs e ID_DME

router.get('/Lista/DME_Ambiente_PontoMedicao', async (req, res) => {
    

    try {

        //console.log("Entrou no try")
        const Lista = await Ambiente.aggregate(
            [  
                ...connectAmbienteDME(), // Todas as informações dessa função ficam dentro do agregate e podem ser referenciadas dentro do $project em seguida
                activeDMEandAMB(), 
                {
                    $project: { // mostra as informacoes que eu quero
                        _id: 0,
                        ponto: "$ponto", // Mostra ponto de medição da funcao connectAmbienteDME
                        lab: "$lab", // Mostra Lab da funcao connectAmbienteDME
                        Id_DME: "$_id", // Mostra ID_DME da funcao connectAmbienteDME
                    }
                }
            ]
        )
        return res.send(Lista)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }

})




// EXTRA

// SOMA DAS POTENCIAS

router.get('/sum', async (req, res) => {

    try {
        const sum = await Ambiente.aggregate(
            [   
                ...connectAmbienteDME(), // quebra as linhas de relacao
                activeDMEandAMB(), 
                { $unwind: "$dados.data.dataW"},
                {
                    $group: {
                        _id: "$dados.id_DME",
                        lab: {$first:"$lab"},
                        ponto: {$first:"$ponto"},
                        W_total: {
                            $sum: "$dados.data.dataW.value"
                        }
                    }
                }
            ]
        )
        return res.send(sum)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
});
  

//SOMA DAS POTENCIAS POR DIA EM UM DADO PERIODO
router.get('/sum/day', async (req, res) => {

    try {
        const sum = await MQTTdata.aggregate(
            [
                activeDME(),
                { $unwind: "$data.dataW"},
                {
                    $group: {
                        _id: { day: { $dayOfYear: "$data.dataW.date"}, year: { $year: "$data.dataW.date" } },
                        W_total: {
                            $sum: "$data.dataW.value"
                        }
                    }
                }
            ]
        )
        return res.send(sum)
    } catch (e) {
        res.status(500).send()
    }
});


// maior tensão média
router.get('/voltage', async (req, res) => {

    try {
        const dados = await Ambiente.aggregate(
            [
                ...connectAmbienteDME(), 
                activeDMEandAMB(), 
                { $unwind: "$dados.data.dataV"},
                {
                    $group: {
                        _id: "$dados.id_DME",
                        lab: {$first:"$lab"},
                        ponto: {$first:"$ponto"},
                        V_avg: {
                            $avg: "$dados.data.dataV.value"
                        }
                    }
                },
                {
                    $sort: { V_avg: -1 } // sort by avg_assessment descending
                },
                {
                    $limit: 1 // only return one document
                }
            ]
        )
        return res.send(dados[0])
    } catch (e) {
        res.status(500).send()
    }
});



module.exports = router


// FUNÇÕES

// função para filtrar DMEs ativos
function activeDMEandAMB(){
    return {
        $match: {
            "dados.active": true
        }
    }
} 


// função que adiciona parte da query necessária para associar
// ambiente com id_DME
function connectAmbienteDME(){
    return [
        {
            $unwind: {
                path: "$pontosDeMedicao"
            }
        }, 
        {
            $project: {
                _id: "$pontosDeMedicao.id_DME",
                lab: "$slug",
                ponto: "$pontosDeMedicao.ponto"
            }
        }, 
        {
            $lookup: {
                from: 'mqttdatas',
                localField: '_id',
                foreignField: 'id_DME',
                as: 'dados'
            }
        },
        {$unwind: "$dados"}
        
    ]
}
