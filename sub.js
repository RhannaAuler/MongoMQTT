// MQTT subscriber
var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://test.mosquitto.org/')
var topic = 'PI_mqtt'

require('./src/database/mongoose')
const MQTTdata = require('./src/models/dataMQTT')

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
                dataV: [{                   
                      value: data.dataV,
                      date: data.date,
                      phase: data.phase
                }],
                dataW: [{                   
                    value: data.dataW,
                    date: data.date,
                    phase: data.phase
                }],
                dataA: [{                   
                    value: data.dataA,
                    date: data.date,
                    phase: data.phase
                }],
                dataE: [{
                    value: data.dataW/60000,  //amostragem a cada um minuto, convertendo de W para kWh
                    date: data.date,
                    phase: data.phase
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
