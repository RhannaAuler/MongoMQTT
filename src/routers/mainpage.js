// requisicoes
const express = require('express')
const MQTTdata = require('../models/dataMQTT')
const Ambiente = require('../models/ambiente')
const router = new express.Router()



// GETS da pagina principal


// gasto medio de energia 
router.get('/energy/avg', async (req, res) => {

    if (!req.query.initialDate || !req.query.finalDate) {
        finalDate = new Date()
        initialDate = new Date(new Date() - 24*60*60 * 1000 )
    }

    else{
        initialDate = (req.query.initialDate)
        finalDate = (req.query.finalDate)
    }

    try {
        const dados = await MQTTdata.aggregate(
            [
                activeDME(),
                { $unwind: "$data.dataE"},
                match_date("data.dataE.date",initialDate,finalDate),
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
        res.status(401).send({error: 'Falha para obter os dados desejados'})
    }
})


// pico da corrente
router.get('/peak_current', async (req, res) => {

    if (!req.query.initialDate || !req.query.finalDate) {
        finalDate = new Date()
        initialDate = new Date(new Date() - 24*60*60 * 1000 )
    }

    else{
        initialDate = (req.query.initialDate)
        finalDate = (req.query.finalDate)
    }

    try {
        const dados = await MQTTdata.aggregate(
            [
                activeDME(),
                { $unwind: "$data.dataA"},
                match_date("data.dataA.date",initialDate,finalDate),
                { $sort: {'data.dataA.value': -1}},
                { $limit: 1},
                { $project: {
                    _id: 0,
                        id_DME: "$id_DME",
                        slug: 1,
                        ponto: 1,
                        value: "$data.dataA.value",
                        date: "$data.dataA.date"
                }}

            ]
        )
        return res.send(dados[0])
    } catch (e) {
        res.status(401).send({error: 'Falha para obter os dados desejados'})
    }
    
});


// grafico barras energia total y, dia da semana x
router.get('/energy/dayOfWeek', async (req, res) => {

    if (!req.query.initialDate || !req.query.finalDate) {
        initialDate = new Date(new Date() - 7 * 60 * 60 * 24 * 1000)
        finalDate = new Date(new Date() - 1 * 60 * 60 * 24 * 1000)
    }

    else{
        initialDate = (req.query.initialDate)
        finalDate = (req.query.finalDate)
    }

    try {
        const dados = await MQTTdata.aggregate(
            [
                activeDME(),
                { $unwind: "$data.dataE"},
                {
                    $match: {
                        "data.dataE.date": {
                            $gte: new Date(initialDate),
                            $lte: new Date(finalDate)
                        }
                    }
                },
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
        res.status(401).send({error: 'Falha para obter os dados desejados'})
    }
})


// grafico pizza com porcentagem de energia de cada dispositivo em relacao ao total
router.get('/energy/lab', async (req, res) => {

    if (!req.query.initialDate || !req.query.finalDate) {
        finalDate = new Date()
        initialDate = new Date(new Date() - 24*60*60 * 1000 )
    }

    else{
        initialDate = (req.query.initialDate)
        finalDate = (req.query.finalDate)
    }

    const total = await total_energy(initialDate,finalDate)
    try {
        const dados = await MQTTdata.aggregate(
        [
            activeDME(),
            { $unwind: "$data.dataE"},
            match_date("data.dataE.date",initialDate,finalDate),
            {
                $group: {
                
                        _id: "$id_DME",
                        lab: {$first:"$slug"},
                        ponto: {$first:"$ponto"},
                        sum_E: {
                            $sum: "$data.dataE.value"
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
        res.status(401).send({error: 'Falha para obter os dados desejados'})
    }
});


// grafico com a soma das potencias por periodo/por hora
router.get('/sum/hour', async (req, res) => {
    if (!req.query.initialDate || !req.query.finalDate) {
        finalDate = new Date()
        initialDate = new Date(new Date() - 24*60*60 * 1000 )
    }

    else{
        initialDate = (req.query.initialDate)
        finalDate = (req.query.finalDate)
    }

    try {
        const sum = await MQTTdata.aggregate(
            [
                activeDME(),
                { $unwind: "$data.dataW"},
                match_date("data.dataW.date",initialDate,finalDate),
                {
                    $group: {
                        _id: {
                                id_DME: "$id_DME",  
                                year: { $year: "$data.dataW.date" },
                                month: { $month: "$data.dataW.date" },
                                day: { $dayOfMonth: "$data.dataW.date" },
                                hour: { $hour: "$data.dataW.date" },
                                //minute: { $minute: "$data.dataW.date" }
                               
                        },
                        lab: {$first:"$slug"},
                        ponto: {$first:"$ponto"},
                        w_total: {
                            $sum: "$data.dataW.value"
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
        res.status(401).send({error: 'Falha para obter os dados desejados'})
    }
});


// grafico da potencia 24 hors por dia, x - horas, y - 7 graficos de cada dia da semana
router.get('/pot_weekday', async (req, res) => {

    if (!req.query.initialDate || !req.query.finalDate) {
        initialDate = new Date(new Date() - 7 * 60 * 60 * 24 * 1000)
        finalDate = new Date(new Date() - 1 * 60 * 60 * 24 * 1000)
    }

    else{
        initialDate = (req.query.initialDate)
        finalDate = (req.query.finalDate)
    }


    try {
        const dados = await MQTTdata.aggregate(
            [
                activeDME(),
                { $unwind: "$data.dataW"},
                {
                    $match: {
                        "data.dataW.date": {
                            $gte: new Date(initialDate),
                            $lte: new Date(finalDate)
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                                dayOfWeek: { $dayOfWeek: "$data.dataW.date" }, // 1 - domingo
                                hour: { $hour: "$data.dataW.date" },
                                year: { $year: "$data.dataW.date" },
                                month: { $month: "$data.dataW.date" },
                                day: { $dayOfMonth: "$data.dataW.date" }
                        },
                        W_avg: {
                            $avg: "$data.dataW.value"
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        dayOfWeek: "$_id.dayOfWeek",
                        date: { $dateFromParts: { 'year' : "$_id.year", 'month' : "$_id.month", 'day': "$_id.day", 'hour' : "$_id.hour"  } },
                        W_avg:1
                    }
                }
            ]
        )
        return res.send(dados)
    } catch (e) {
        console.log(e)
        res.status(401).send({error: 'Falha para obter os dados desejados'})
    }
});



// energia total consumida por 1 mes
router.get('/energy/total', async (req, res) => {

    if (!req.query.initialDate || !req.query.finalDate) {
        finalDate = new Date()
        initialDate = new Date(new Date().setMonth(new Date().getMonth() - 1 ) )
    }

    else{
        initialDate = (req.query.initialDate)
        finalDate = (req.query.finalDate)
    }
    
    try {
        const dados = await MQTTdata.aggregate(
            [
                activeDME(),
                { $unwind: "$data.dataE"},
                match_date("data.dataE.date", initialDate,finalDate),
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
        res.status(401).send({error: 'Falha para obter os dados desejados'})
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
async function total_energy(initialDate,finalDate){
    const total_energy = await MQTTdata.aggregate(
        [
            { $unwind: "$data.dataE"},
            match_date("data.dataE.date",initialDate,finalDate),
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