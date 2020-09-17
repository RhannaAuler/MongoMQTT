const express = require('express')
const MQTTdata = require('../models/dataMQTT')
const router = new express.Router()

// todos os dados
router.get('/', async (req, res) => {

    try {
        const dados = await MQTTdata.find()
        return res.send(dados)
    } catch (e) {
        res.status(500).send()
    }

        
})


// nome dos labs
router.get('/labs', async (req, res) => {

    
    try {
        const dados = await MQTTdata.find({ }, { name: 1, _id: 0 })
        return res.send(dados)
    } catch (e) {
        res.status(500).send()
    }
})

// pegar dados de um especifico lab
router.get('/labs/:lab', async (req, res) => {
    const lab = req.params.lab

    try {
        const dados = await MQTTdata.find({name: lab})
        if (!dados) {
            res.status(404).send()
        }
        res.send(dados)
    } catch(e) {
        res.status(500).send()
    }   
})

// ultima corrente/tensao/potencia de cada fase
router.get('/last/:type', async (req, res) => {
    const type = req.params.type

    var type_string = "$data.dataA"
    var string_date = "$data.dataA.date"
    var string_phase = "$data.dataA.phase"
    var string_value = "$data.dataA.value"
    var sort_date = "data.dataA.date"

    switch(type) {

        case 'V':
            var type_string = "$data.dataV"
            var string_date = "$data.dataV.date"
            var string_phase = "$data.dataV.phase"
            var string_value = "$data.dataV.value"
            var sort_date = "data.dataV.date"
            break

        case 'W':
            var type_string = "$data.dataW"
            var string_date = "$data.dataW.date"
            var string_phase = "$data.dataW.phase"
            var string_value = "$data.dataW.value"
            var sort_date = "data.dataW.date"
            break 
        default: 
        
    }

    try {
        const last = await MQTTdata.aggregate(
            [
                { $unwind: type_string},
                { $sort: {sort_date: 1}},
                {
                    $group: {
                        _id: {
                                name:"$name",
                                phase:string_phase
                        },
                        value: {$last: string_value},
                        date: {
                            $last: string_date
                        }
                    }
                }
            ]
        )
        return res.send(last)
    } catch (e) {
        res.status(500).send(e)
    }
})


// grafico de todas as tensoes
router.get('/grafico', async (req, res) => {
    try {
        const dados = await MQTTdata.aggregate(
            [
                { $unwind: {
                    path: '$data.dataV',
                    preserveNullAndEmptyArrays: false
                  }
                },
                {
                    $project: {
                        _id: 0,
                        name: 1,
                        value: "$data.dataV.value",
                        date: "$data.dataV.date"
                       
                    }
                }
            ]
        )
        return res.send(dados)
    } catch (e) {
        res.status(500).send()
    }
})



// grafico com a soma das potencias por periodo/por hora

router.get('/sum/hour', async (req, res) => {

    try {
        const sum = await MQTTdata.aggregate(
            [
                { $unwind: "$data.dataW"},
                {
                    $group: {
                        _id: {
                                name: "$name",
                                year: { $year: "$data.dataW.date" },
                                month: { $month: "$data.dataW.date" },
                                day: { $dayOfMonth: "$data.dataW.date" },
                                hour: { $hour: "$data.dataW.date" },
                                //minute: { $minute: "$data.dataW.date" }
                               
                        },
                        w_total: {
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

// pico corrente

router.get('/peak_current', async (req, res) => {

    const initialDate = (req.query.initialDate)
    const finalDate = (req.query.finalDate)

    if ((!req.query.initialDate) || (!req.query.finalDate)){
        try {
            const dados = await MQTTdata.aggregate(
                [
                    { $unwind: "$data.dataA"},
                    { $sort: {'data.dataA.value': -1}},
                    { $limit: 1},
                    { $project: {
                        _id: 0,
                        name: 1,
                        value: "$data.dataA.value",
                        date: "$data.dataA.date"
                    }}
    
                ]
            )
            return res.send(dados[0])
        } catch (e) {
            res.status(500).send()
        }
    }

    try {
        const dados = await MQTTdata.aggregate(
            [
                { $unwind: "$data.dataA"},
                {
                    $match: {
                        "data.dataA.date": {
                            $gte: new Date(initialDate),
                            $lte: new Date(finalDate)
                        }
                    }
                },
                { $sort: {'data.dataA.value': -1}},
                { $limit: 1},
                { $project: {
                    _id: 0,
                    name: 1,
                    value: "$data.dataA.value",
                    date: "$data.dataA.date"
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
                }
            ]
        )
        return res.send(dados)
    } catch (e) {
        res.status(500).send()
    }
});




// gráfico pizza com a porcentagem de consumo cada fase
router.get('/energy/phase', async (req, res) => {

    try {
        const dados = await MQTTdata.aggregate(
            [
                { $unwind: "$data.dataE"},
                {
                    $group: {
                        _id: null,
                        totalEnergy: {
                          $sum: "$data.dataE.value"
                        },
                        phase_dataE: {
                          $push: {phase: "$data.dataE.phase", dataE: "$data.dataE"}
                        }
                      }
                },
                { $unwind: "$phase_dataE"},
                {
                    $group: {
                    
                            _id: {phase:"$phase_dataE.phase", total: "$totalEnergy"},
                            sum_E: {
                                 $sum: "$phase_dataE.dataE.value"
                            }
                    
                    }
                },
                {
                    $project:{
                        _id: 0,
                        phase: "$_id.phase",
                        perc_E: {$round: [{$divide: ["$sum_E","$_id.total"]}, 2]}
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

    try {
        const dados = await MQTTdata.aggregate(
            [
                { $unwind: "$data.dataE"},
                {
                    $group: {
                        _id: null,
                        totalEnergy: {
                          $sum: "$data.dataE.value"
                        },
                        name_dataE: {
                          $push: {name: "$name", dataE: "$data.dataE"}
                        }
                      }
                },
                { $unwind: "$name_dataE"},
                {
                    $group: {
                    
                            _id: {name:"$name_dataE.name", total: "$totalEnergy"},
                            sum_E: {
                                 $sum: "$name_dataE.dataE.value"
                            }
                    
                    }
                },
                {
                    $project:{
                        _id: 0,
                        name: "$_id.name",
                        perc_E: {$round: [{$divide: ["$sum_E","$_id.total"]}, 2]}
                    }
                }
            ]
        )
        return res.send(dados)
    } catch (e) {
        res.status(500).send()
    }
});

// grafico barras energia total y, dia da semana x
router.get('/energy/dayOfWeek', async (req, res) => {

    try {
        const dados = await MQTTdata.aggregate(
            [
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
        return res.send(dados)
    } catch (e) {
        res.status(500).send()
    }
})

// energia total consumida por 1 mes
router.get('/energy/total', async (req, res) => {

    //monthData = new Date();
    //monthData.setMonth(monthData.getMonth() - 1)

    try {
        const dados = await MQTTdata.aggregate(
            [
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
        return res.send(dados)
    } catch (e) {
        res.status(500).send()
    }
})

// SOMA DAS POTENCIAS

router.get('/sum', async (req, res) => {

    try {
        const sum = await MQTTdata.aggregate(
            [
                { $unwind: "$data.dataW"},
                {
                    $group: {
                        _id: "$name",
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
  
//SOMA DAS POTENCIAS POR DIA EM UM DADO PERIODO
router.get('/sum/day', async (req, res) => {

    try {
        const sum = await MQTTdata.aggregate(
            [
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



router.get('/voltage', async (req, res) => {

    try {
        const dados = await MQTTdata.aggregate(
            [
                { $unwind: "$data.dataV"},
                {
                    $group: {
                        _id: "$name",
                        V_avg: {
                            $avg: "$data.dataV.value"
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