// MQTT subscriber
var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://mqtt.eclipse.org/')
var topic = 'cookies'

client.on('message', (topic, message) => {
    message = message.toString()
    console.log(message)
})

client.on('connect', () => {
    client.subscribe(topic)
})
