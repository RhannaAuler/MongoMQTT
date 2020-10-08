const express = require('express')
const MQTTdata = require('../models/dataMQTT')
const Ambiente = require('../models/ambiente')
const router = new express.Router()


// GETS da pagina de modulo


// mudar para /:id_DME

// porcentagem de potencia de cada fase
// ultimo valor lido da corrente 
// ultimo valor lido da tensão
// grafico para cada grandeza com uma curva para cada fase 
// default: ultimas 24 horas



// gráfico pizza com a porcentagem de potência cada fase
router.get('/power/phase/:id_DME', async (req, res) => {
    const id_DME = req.params.id_DME


    const total = await total_power_idDME(id_DME)
    try {
        const dados = await Ambiente.aggregate(
            [
                ...connectAmbienteDME(),
                activeDMEandAMB(),
                {
                    $match: {
                        "dados.id_DME": id_DME
                    }
                },
                { $unwind: "$dados.data.dataW"},
                {
                    $group: {
                    
                        _id: { 
                                phase: "$dados.data.dataW.phase"
                        },
                        lab: {$first:"$lab"},
                        ponto: {$first:"$ponto"},
                        sum_W: {
                                $sum: "$dados.data.dataW.value"
                        }
                    
                    }
                },
                {
                    $project:{
                        _id: 0,
                        phase: "$_id.phase",
                        lab: 1,
                        ponto: 1,
                        perc_W: {$round: [{$divide: ["$sum_W",total]}, 2]}
                    }
                }
            ]
        )
        return res.send(dados)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
});


// ultima corrente/tensao/potencia de cada fase
router.get('/last/:id_DME/:type', async (req, res) => {
    const type = req.params.type
    const id_DME = req.params.id_DME

    var type_string = "$dados.data.dataA"
    var string_date = "$dados.data.dataA.date"
    var string_phase = "$dados.data.dataA.phase"
    var string_value = "$dados.data.dataA.value"
    var sort_date = "dados.data.dataA.date"

    switch(type) {

        case 'V':
            var type_string = "$dados.data.dataV"
            var string_date = "$dados.data.dataV.date"
            var string_phase = "$dados.data.dataV.phase"
            var string_value = "$dados.data.dataV.value"
            var sort_date = "dados.data.dataV.date"
            break

        case 'W':
            var type_string = "$dados.data.dataW"
            var string_date = "$dados.data.dataW.date"
            var string_phase = "$dados.data.dataW.phase"
            var string_value = "$dados.data.dataW.value"
            var sort_date = "dados.data.dataW.date"
            break 
        default: 
        
    }

    try {

        const last = await Ambiente.aggregate(
            [
                ...connectAmbienteDME(),
                activeDMEandAMB(),
                {
                    $match: {
                        "dados.id_DME": id_DME
                    }
                },
                { $unwind: type_string},
                //{ $sort: {sort_date: 1}},
                {
                    $group: {
                        _id: {
                                //id_DME:"$dados.id_DME",
                                phase:string_phase
                        },
                        lab: {$first:"$lab"},
                        ponto: {$first:"$ponto"},
                        value: {$last: string_value},
                        date: {
                            $last: string_date
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        //id_DME: "$_id.id_DME",
                        phase: "$_id.phase",
                        lab: 1,
                        ponto: 1,
                        value: 1,
                        date: 1
                    }
                }
            ]
        )
        return res.send(last)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})


// grafico de todas as tensoes
router.get('/V/:id_DME', async (req, res) => {
    const id_DME = req.params.id_DME
    

    if (!req.query.initialDate || !req.query.finalDate) {
        finalDate = new Date()
        initialDate = new Date(new Date() - 24*60*60 * 1000 )
    }

    else{
        initialDate = (req.query.initialDate)
        finalDate = (req.query.finalDate)
    }

    try {
        const dados = await Ambiente.aggregate(
            [
                ...connectAmbienteDME(),
                activeDMEandAMB(),
                {
                    $match: {
                        "dados.id_DME": id_DME
                    }
                },
                { $unwind: "$dados.data.dataV"},
                match_date("dados.data.dataV.date",initialDate,finalDate),
                {
                    $project: {
                        _id: 0,
                        id_DME: "$dados.id_DME",
                        lab: 1,
                        ponto: 1,
                        value: "$dados.data.dataV.value",
                        date: "$dados.data.dataV.date"
                    }
                }
            ]
        )
        return res.send(dados)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})







module.exports = router


// FUNÇÕES


// função para filtrar período de tempo
function match_date(field, initialDate,finalDate){
    return {
        $match: {
            [field]: {
                $gte: new Date(initialDate),
                $lte: new Date(finalDate)
            }
        }
    }
}

// função para filtrar DMEs ativos
function activeDMEandAMB(){
    return {
        $match: {
            "dados.active": true
        }
    }
} 

// função para filtrar DMES ativos sem usar o ambiente
function activeDME(){
    return {
        $match: {
            "active": true
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


// função que calcula o total de energia consumido
async function total_power_idDME(id_DME){
    const total_power = await MQTTdata.aggregate(
        [
            {
                $match: {
                    "id_DME": id_DME
                }
            },
            { $unwind: "$data.dataW"},
            {
                $group: {
                    _id: "null",
                    totalPower: {
                      $sum: "$data.dataW.value"
                    }
                  }
            }
        ]
    )
    return total_power[0].totalPower
}