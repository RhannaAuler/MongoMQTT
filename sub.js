// MQTT subscriber
var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://mqtt.eclipse.org/')
var topic = 'cookies'

require('./src/db/mongoose')
const MQTTdata = require('./src/models/dataMQTT')

client.on('message', (topic, message) => {
    message = message.toString()
    console.log(message)
    if (message.includes('{') && !message.includes('mqtt')) {
        const data = JSON.parse(message)
        console.log(data)

        const messageMQTT = new MQTTdata({
            message: data.message,
            title: data.title,
            date: Date.now()
        })

        messageMQTT.save().then(() => {
            console.log(messageMQTT)
        }).catch((e) => {
            console.log('Error!', e)
        })
    }
})

client.on('connect', () => {
    client.subscribe(topic)
})
