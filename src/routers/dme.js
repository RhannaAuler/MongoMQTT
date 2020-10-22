const express = require('express')
const MQTTdata = require('../models/dataMQTT')
const Ambiente = require('../models/ambiente')
const router = new express.Router()


// GETS da pagina de modulo


//  /:id_DME
// porcentagem de potencia de cada fase
// ultimo valor lido da corrente 
// ultimo valor lido da tensão
// grafico para cada grandeza com uma curva para cada fase 
// default: ultimas 24 horas



// ultima corrente e tensao de cada fase
// e gráfico pizza com a porcentagem de potência cada fase
router.get('/last/:id_DME', async (req, res) => {
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

        const lastA = await MQTTdata.aggregate(
            [
                activeDME(),
                {
                    $match: {
                        "id_DME": id_DME
                    }
                },
                { $unwind: "$data.dataA"},
                match_date("data.dataA.date",initialDate,finalDate),
                {
                    $group: {
                        _id: {
                                phase:"$data.dataA.phase"
                        },
                        //lab: {$first:"$lab"},
                        //ponto: {$first:"$ponto"},
                        value: {$last: "$data.dataA.value"},
                        date: {
                            $last:"$data.dataA.date"
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        //id_DME: "$_id.id_DME",
                        phase: "$_id.phase",
                        //lab: 1,
                        //ponto: 1,
                        value: 1,
                        date: 1
                    }
                }
            ]
        )

        const lastV = await MQTTdata.aggregate(
            [
                activeDME(),
                {
                    $match: {
                        "id_DME": id_DME
                    }
                },
                { $unwind: "$data.dataV"},
                match_date("data.dataV.date",initialDate,finalDate),
                {
                    $group: {
                        _id: {
                                phase:"$data.dataV.phase"
                        },
                        //lab: {$first:"$lab"},
                        //ponto: {$first:"$ponto"},
                        value: {$last: "$data.dataV.value"},
                        date: {
                            $last:"$data.dataV.date"
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        phase: "$_id.phase",
                        //lab: 1,
                        //ponto: 1,
                        value: 1,
                        date: 1
                    }
                }
            ]
        )

        const total = await total_power_idDME(id_DME,initialDate,finalDate)

        const perc = await MQTTdata.aggregate(
            [
                activeDME(),
                {
                    $match: {
                        "id_DME": id_DME
                    }
                },
                { $unwind: "$data.dataW"},
                match_date("data.dataW.date",initialDate,finalDate),
                {
                    $group: {
                    
                        _id: { 
                                phase: "$data.dataW.phase"
                        },
                        //lab: {$first:"$lab"},
                        //ponto: {$first:"$ponto"},
                        sum_W: {
                                $sum: "$data.dataW.value"
                        }
                    
                    }
                },
                {
                    $project:{
                        _id: 0,
                        phase: "$_id.phase",
                        //lab: 1,
                        //ponto: 1,
                        perc_W: {$round: [{$divide: ["$sum_W",total]}, 2]}
                    }
                }
            ]
        )

        return res.send(
            {
               "lastA": lastA,
               "lastV": lastV,
               "perc": perc
        
            }
            
        )
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
        const dadosV = await MQTTdata.aggregate(
            [
                activeDME(),
                filterDME(id_DME),
                { $unwind: "$data.dataV"},
                match_date("data.dataV.date",initialDate,finalDate),
                {
                    $project: {
                        _id: 0,
                        phaseV: "$data.dataV.phase",
                        valueV: "$data.dataV.value",
                        dateV: "$data.dataV.date",

                    }
                }
            ]
        )

        return res.send(dadosV)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

// grafico de todas as energias
router.get('/E/:id_DME', async (req, res) => {
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
        
        const dadosE = await MQTTdata.aggregate(
            [
                activeDME(),
                filterDME(id_DME),
                { $unwind: "$data.dataE"},
                match_date("data.dataE.date",initialDate,finalDate),
                {
                    $project: {
                        _id: 0,
                        phaseE: "$data.dataE.phase",
                        valueE: "$data.dataE.value",
                        dateE: "$data.dataE.date",

                    }
                }
            ]
        )
        return res.send(dadosE)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

// grafico de todas as correntes
router.get('/A/:id_DME', async (req, res) => {
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
        
        const dadosA = await MQTTdata.aggregate(
            [
                activeDME(),
                filterDME(id_DME),
                { $unwind: "$data.dataA"},
                match_date("data.dataA.date",initialDate,finalDate),
                {
                    $project: {
                        _id: 0,
                        phaseA: "$data.dataA.phase",
                        valueA: "$data.dataA.value",
                        dateA: "$data.dataA.date",

                    }
                }
            ]
        )
        
        return res.send(dadosA)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

// grafico de todas as potencias
router.get('/W/:id_DME', async (req, res) => {
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
        
        const dadosW = await MQTTdata.aggregate(
            [
                activeDME(),
                filterDME(id_DME),
                { $unwind: "$data.dataW"},
                match_date("data.dataW.date",initialDate,finalDate),
                {
                    $project: {
                        _id: 0,
                        phaseW: "$data.dataW.phase",
                        valueW: "$data.dataW.value",
                        dateW: "$data.dataW.date",

                    }
                }
            ]
        )
        
        return res.send(dadosW)
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


// função para filtrar DMES ativos sem usar o 
function activeDME(){
    return {
        $match: {
            "active": true
        }
    }
}

// função para filtrar id_DME
function filterDME(id_DME){
    return {
        $match: {
            "id_DME": id_DME
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
async function total_power_idDME(id_DME,initialDate,finalDate){
    const total_power = await MQTTdata.aggregate(
        [
            {
                $match: {
                    "id_DME": id_DME
                }
            },
            { $unwind: "$data.dataW"},
            match_date("data.dataW.date",initialDate,finalDate),
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

    if (total_power.length){
        return total_power[0].totalPower
    }
    else{
        return null
    }
}


// gráfico pizza com a porcentagem de potência cada fase
//router.get('/power/phase/:id_DME', async (req, res) => {
    // const id_DME = req.params.id_DME

    // if (!req.query.initialDate || !req.query.finalDate) {
    //     finalDate = new Date()
    //     initialDate = new Date(new Date() - 24*60*60 * 1000 )
    // }

    // else{
    //     initialDate = (req.query.initialDate)
    //     finalDate = (req.query.finalDate)
    // }

    // const total = await total_power_idDME(id_DME)
    // try {
    //     const dados = await Ambiente.aggregate(
    //         [
    //             ...connectAmbienteDME(),
    //             activeDMEandAMB(),
    //             filterDME(id_DME),
    //             { $unwind: "$dados.data.dataW"},
    //             match_date("dados.data.dataW.date",initialDate,finalDate),
    //             {
    //                 $group: {
                    
    //                     _id: { 
    //                             phase: "$dados.data.dataW.phase"
    //                     },
    //                     lab: {$first:"$lab"},
    //                     ponto: {$first:"$ponto"},
    //                     sum_W: {
    //                             $sum: "$dados.data.dataW.value"
    //                     }
                    
    //                 }
    //             },
    //             {
    //                 $project:{
    //                     _id: 0,
    //                     phase: "$_id.phase",
    //                     lab: 1,
    //                     ponto: 1,
    //                     perc_W: {$round: [{$divide: ["$sum_W",total]}, 2]}
    //                 }
    //             }
    //         ]
    //     )
    //     return res.send(dados)
    // } catch (e) {
    //     console.log(e)
    //     res.status(500).send()
    // }
//});