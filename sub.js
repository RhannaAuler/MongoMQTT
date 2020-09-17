// MQTT subscriber
var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://mqtt.eclipse.org/')
var topic = 'PI_mqtt'

require('./src/database/mongoose')
const MQTTdata = require('./src/models/dataMQTT')

function updateModel(name, doc, newData) {

    return MQTTdata.findOneAndUpdate(
        { name: name },
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
            name: data.name,
            data: {
                dataV: data.dataV,
                dataW: data.dataW,
                dataA: data.dataA,
                dataE: [{
                    value: data.dataW[0].value/60000,
                    date: data.dataW[0].date,
                    phase: data.dataW[0].phase
                }]
            }
            
        })

        MQTTdata
            .findOne({ name: messageMQTT.name }, 'data') // string no final sao os campos que vao aparecer no findone
            .then((doc) => {
                // console.log('inside')
                // console.log(doc)
                if (doc == null){
                    return messageMQTT.save().then(() => {console.log('Novo')})
                }
                else{
                    return updateModel(messageMQTT.name, doc, messageMQTT.data).then(() => {console.log('Tudo bem')})
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
