// MQTT broker
var mosca = require('mosca')
var settings = {port: 1883}
var broker = new mosca.Server(settings)

// MongoDB
require('./db/mongoose')
const MQTTdata = require('./models/dataMQTT')

broker.on('ready', () => {
    console.log('Broker is ready')
})

broker.on('published', (packet) => {
    const message = packet.payload.toString('utf-8')
    console.log(message)
    //console.log(typeof message)

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




// \Users\rhann\mongodb\bin\mongod.exe --dbpath=\Users\rhann\mongodb-data