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
    name: 'LME',
    dataV: [
          {
            value: 221,
            date: Date.now(), //mandar data pelo esp para ter certeza que é certa
            phase: '1'
          },
        ],
    dataW: [
          {
            value: 33,
            date: Date.now(), 
            phase: '1'
          },
        ],
    dataA: [
          {
            value: 300,
            date: Date.now(), 
            phase: '1'
          },
        ]
       
}

client.on('connect', () => {
    setInterval(() => {
        client.publish(topic, JSON.stringify(message))
        console.log('Message sent!', JSON.stringify(message))
    }, 5000)
})

