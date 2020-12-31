// MQTT publisher
var mqtt = require('mqtt')
//var client = mqtt.connect('mqtt://Localhost:1883')
var client  = mqtt.connect('mqtt://test.mosquitto.org/')
var topic = 'PI_mqtt'
// var message = {
//     title: 'title1',
//     message: 'Message1'
// }

var message = {
    id_DME: '76',
    date: 1601419464000, //mandar data pelo esp para ter certeza que é certa
    phase: '1',
    dataV: '220',
    dataW: '1150',
    dataA: '12'      
}

client.on('connect', () => {
    setInterval(() => {
        client.publish(topic, JSON.stringify(message))
        console.log('Message sent!', JSON.stringify(message))
    }, 5000)
})

