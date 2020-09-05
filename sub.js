// MQTT subscriber
var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://mqtt.eclipse.org/')
var topic = 'cookies'

require('./src/db/mongoose')
const MQTTdata = require('./src/models/dataMQTT')

function updateModel(name, doc, newData) {
    return MQTTdata.findOneAndUpdate(
        { name: name },
        { 
            data: doc.data.concat(newData) //concatenando o que tinha em data com o novo valor
        }
    )

}

client.on('message', (topic, message) => {
    message = message.toString()
    console.log(message)
    if (message.includes('{') && !message.includes('mqtt')) {
        const data = JSON.parse(message)
        console.log(data)

        const messageMQTT = new MQTTdata({
            name: data.name,
            data: data.data,
        })

        MQTTdata
            .findOne({ name: messageMQTT.name }, 'data') // string no final sao os campos que vao aparecer no findone
            .then((doc) => {
                console.log(doc)
                if (doc == null){
                    return messageMQTT.save().then(() => {console.log('Novo')})
                }
                else{
                    return updateModel(messageMQTT.name, doc, data.data).then(() => {console.log('Tudo bem')})
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
