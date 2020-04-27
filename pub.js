// MQTT publisher
var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://Localhost:1883')
var topic = 'cookies'
var message = {
    title: 'title1',
    message: 'Message1'
}

client.on('connect', () => {
    setInterval(() => {
        client.publish(topic, JSON.stringify(message))
        console.log('Message sent!', message)
    }, 5000)
})
