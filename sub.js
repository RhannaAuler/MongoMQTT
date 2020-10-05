// MQTT subscriber
var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://mqtt.eclipse.org/')
var topic = 'PI_mqtt'

require('./src/database/mongoose')
const MQTTdata = require('./src/models/dataMQTT')

const port = process.env.PORT || 3000

function updateModel(id_DME, doc, newData) {

    return MQTTdata.findOneAndUpdate(
        { id_DME: id_DME },
        { 
            data:{
                   dataV: doc.data.dataV.concat(newData.dataV), //concatenando o que tinha em data com o novo valor
                   dataW: doc.data.dataW.concat(newData.dataW),
                   dataA: doc.data.dataA.concat(newData.dataA),
                   dataE: doc.data.dataE.concat(newData.dataE)
            }
        }
    )

}

client.on('message', (topic, message) => {
    message = message.toString()
    console.log(message)
    if (message.includes('{') && !message.includes('mqtt')) {
        const data = JSON.parse(message)
        //console.log(data)

        const messageMQTT = new MQTTdata({
            id_DME: data.id_DME,
            data: {
                dataV: data.dataV,
                dataW: data.dataW,
                dataA: data.dataA,
                dataE: [{
                    value: data.dataW[0].value/60000,  //amostragem a cada um minuto, convertendo de W para kWh
                    date: data.dataW[0].date,
                    phase: data.dataW[0].phase
                }]
            }
            
        })

        MQTTdata
            .findOne({ id_DME: messageMQTT.id_DME }, 'data') // string no final sao os campos que vao aparecer no findOne
            .then((doc) => {
                // if (doc == null){
                //     return messageMQTT.save().then(() => {console.log('Novo')})
                // }
                if (doc != null){
                    return updateModel(messageMQTT.id_DME, doc, messageMQTT.data).then(() => {console.log('ok')})
                }
            }) 
            .catch((e) => {
                console.log('Error!', e)
            })
        
    }
})

client.on('connect', () => {
    client.subscribe(topic)
})


app.listen(port)