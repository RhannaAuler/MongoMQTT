const express = require('express')
const MQTTdata = require('../models/dataMQTT')
const Ambiente = require('../models/ambiente')
const router = new express.Router()

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

// ultima corrente/tensao/potencia de cada fase
router.get('/last/:type', async (req, res) => {
    const type = req.params.type

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
                { $unwind: type_string},
                { $sort: {sort_date: 1}},
                {
                    $group: {
                        _id: {
                                id_DME:"$dados.id_DME",
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
                        id_DME: "$_id.id_DME",
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
router.get('/grafico', async (req, res) => {
    try {
        const dados = await Ambiente.aggregate(
            [
                ...connectAmbienteDME(),
                activeDMEandAMB(),
                { $unwind: {
                    path: '$dados.data.dataV',
                    preserveNullAndEmptyArrays: false
                  }
                },
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

// grafico com a soma das potencias por periodo/por hora

router.get('/sum/hour', async (req, res) => {

    try {
        const sum = await Ambiente.aggregate(
            [
                ...connectAmbienteDME(),
                activeDMEandAMB(),
                { $unwind: "$dados.data.dataW"},
                {
                    $group: {
                        _id: {
                                id_DME: "$dados.id_DME",  
                                year: { $year: "$dados.data.dataW.date" },
                                month: { $month: "$dados.data.dataW.date" },
                                day: { $dayOfMonth: "$dados.data.dataW.date" },
                                hour: { $hour: "$dados.data.dataW.date" },
                                //minute: { $minute: "$data.dataW.date" }
                               
                        },
                        lab: {$first:"$lab"},
                        ponto: {$first:"$ponto"},
                        w_total: {
                            $sum: "$dados.data.dataW.value"
                        }
                    }
                }, 
                {
                    $project:{
                        _id: 0,
                        w_total: 1,
                        date: { $dateFromParts: { 'year' : "$_id.year", 'month' : "$_id.month", 'day': "$_id.day", 'hour' : "$_id.hour"  } },
                        lab: 1,
                        ponto: 1,

                   }
                }
            ]
        )
        return res.send(sum)
    } catch (e) {
        res.status(500).send()
    }
});

// pico corrente

router.get('/peak_current', async (req, res) => {

    const initialDate = (req.query.initialDate)
    const finalDate = (req.query.finalDate)

    if (!initialDate || !finalDate){
        try {
            const dados = await Ambiente.aggregate(
                [
                    ...connectAmbienteDME(),
                    activeDMEandAMB(),
                    { $unwind: "$dados.data.dataA"},
                    { $sort: {'dados.data.dataA.value': -1}},
                    { $limit: 1},
                    { $project: {
                        _id: 0,
                        id_DME: "$dados.id_DME",
                        lab: 1,
                        ponto: 1,
                        value: "$dados.data.dataA.value",
                        date: "$dados.data.dataA.date"
                    }}
    
                ]
            )
            return res.send(dados[0])
        } catch (e) {
            res.status(500).send()
        }
    }

    try {
        const dados = await Ambiente.aggregate(
            [
                ...connectAmbienteDME(),
                activeDMEandAMB(),
                { $unwind: "$dados.data.dataA"},
                match_date("dados.data.dataA.date",initialDate,finalDate),
                { $sort: {'dados.data.dataA.value': -1}},
                { $limit: 1},
                { $project: {
                    _id: 0,
                        id_DME: "$dados.id_DME",
                        lab: 1,
                        ponto: 1,
                        value: "$dados.data.dataA.value",
                        date: "$dados.data.dataA.date"
                }}

            ]
        )
        return res.send(dados[0])
    } catch (e) {
        res.status(500).send()
    }
    
});

// grafico da potencia 24 hors por dia, x - horas, y - 7 graficos de cada dia da semana

router.get('/pot_weekday', async (req, res) => {
    
    try {
        const dados = await MQTTdata.aggregate(
            [
                activeDME(),
                { $unwind: "$data.dataW"},
                {
                    $group: {
                        _id: {
                                day: { $dayOfWeek: "$data.dataW.date" }, // 1 - domingo
                                hour: { $hour: "$data.dataW.date" }
                        },
                        W_avg: {
                            $avg: "$data.dataW.value"
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        day: "$_id.day",
                        hour: "$_id.hour",
                        W_avg:1
                    }
                }
            ]
        )
        return res.send(dados)
    } catch (e) {
        res.status(500).send()
    }
});

// gráfico pizza com a porcentagem de potência cada fase
router.get('/power/phase', async (req, res) => {

    try {
        const dados = await MQTTdata.aggregate(
            [
                activeDME(),
                { $unwind: "$data.dataW"},
                {
                    $group: {
                        _id: null,
                        totalW: {
                          $sum: "$data.dataW.value"
                        },
                        phase_dataW: {
                          $push: {phase: "$data.dataW.phase", dataW: "$data.dataW"}
                        }
                      }
                },
                { $unwind: "$phase_dataW"},
                {
                    $group: {
                    
                            _id: {phase:"$phase_dataW.phase", total: "$totalW"},
                            sum_W: {
                                 $sum: "$phase_dataW.dataW.value"
                            }
                    
                    }
                },
                {
                    $project:{
                        _id: 0,
                        phase: "$_id.phase",
                        perc_W: {$round: [{$divide: ["$sum_W","$_id.total"]}, 2]}
                    }
                }
            ]
        )
        return res.send(dados)
    } catch (e) {
        res.status(500).send()
    }
});

// grafico pizza com porcentagem de energia de cada dispositivo em relacao ao total

router.get('/energy/lab', async (req, res) => {

    const total = await total_energy()
    try {
        const dados = await Ambiente.aggregate(
        [
            ...connectAmbienteDME(),
            activeDMEandAMB(),
            { $unwind: "$dados.data.dataE"},
            {
                $group: {
                
                        _id: "$dados.id_DME",
                        lab: {$first:"$lab"},
                        ponto: {$first:"$ponto"},
                        sum_E: {
                            $sum: "$dados.data.dataE.value"
                        }
                
                }
            },
            {
                $project:{
                    _id: 0,
                    lab: 1,
                    ponto: 1,
                    perc_E: {$round: [{$divide: ["$sum_E",total]}, 2]}
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

// grafico barras energia total y, dia da semana x
router.get('/energy/dayOfWeek', async (req, res) => {

    try {
        const dados = await MQTTdata.aggregate(
            [
                activeDME(),
                { $unwind: "$data.dataE"},
                {
                    $group: {
                        _id: { $dayOfWeek: "$data.dataE.date" }, // 1 - domingo,
                        totalEnergy: {
                          $sum: "$data.dataE.value"
                        }
                    
                      }
                }
            ]
        )
        return res.send(dados)
    } catch (e) {
        res.status(500).send()
    }
})

// gasto medio de energia 
router.get('/energy/avg', async (req, res) => {

    try {
        const dados = await MQTTdata.aggregate(
            [
                activeDME(),
                { $unwind: "$data.dataE"},
                {
                    $group: {
                        _id: null, 
                        avgEnergy: {
                          $avg: "$data.dataE.value"
                        }
                    }
                },
                {
                    $project:{
                        _id: 0,
                        avgEnergy: 1
                    }
                }
            ]
        )
        return res.send(dados[0])
    } catch (e) {
        res.status(500).send()
    }
})

// energia total consumida por 1 mes
router.get('/energy/total', async (req, res) => {

    try {
        const dados = await MQTTdata.aggregate(
            [
                activeDME(),
                { $unwind: "$data.dataE"},
                {
                    $match: {
                        "data.dataE.date": {
                            $gte: new Date(new Date().setMonth(new Date().getMonth() - 1 ) )
                        }
                    }
                },
                {
                    $group: {
                        _id: null, 
                        totalEnergyMonth: {
                          $sum: "$data.dataE.value"
                        }
                    }
                },
                {
                    $project:{
                        _id: 0,
                        totalEnergyMonth: 1
                    }
                }
            ]
        )
        return res.send(dados[0])
    } catch (e) {
        res.status(500).send()
    }
})

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

// função para filtrar DMES ativos sem usar o 
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
async function total_energy(){
    const total_energy = await MQTTdata.aggregate(
        [
            { $unwind: "$data.dataE"},
            {
                $group: {
                    _id: null,
                    totalEnergy: {
                      $sum: "$data.dataE.value"
                    }
                  }
            }
        ]
    )
    return total_energy[0].totalEnergy
}