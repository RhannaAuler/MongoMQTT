// MQTT publisher
var mqtt = require('mqtt')
//var client = mqtt.connect('mqtt://Localhost:1883')
var client  = mqtt.connect('mqtt://mqtt.eclipse.org/')
var topic = 'PI_mqtt'
// var message = {
//     title: 'title1',
//     message: 'Message1'
// }

var message = {
    id_DME: '123456',
    dataV: [
          {
            value: 220,
            date: 1601419464000, //mandar data pelo esp para ter certeza que é certa
            phase: '3'
          },
        ],
    dataW: [
          {
            value: 1150,
            date: 1601419464000, 
            phase: '3'
          },
        ],
    dataA: [
          {
            value: 12,
            date: 1601419464000, 
            phase: '3'
          },
        ]
       
}

client.on('connect', () => {
    setInterval(() => {
        client.publish(topic, JSON.stringify(message))
        console.log('Message sent!', JSON.stringify(message))
    }, 5000)
})

