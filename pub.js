// MQTT publisher
var mqtt = require('mqtt')
//var client = mqtt.connect('mqtt://Localhost:1883')
var client  = mqtt.connect('mqtt://mqtt.eclipse.org/')
var topic = 'cookies'
// var message = {
//     title: 'title1',
//     message: 'Message1'
// }

var message = {
    name: 'esp32',
    data: [
        {
          value: 221,
          date: Date.now(), //mandar data pelo esp para ter certeza que é certa
          type: 'V'
        },
      ]
}

client.on('connect', () => {
    setInterval(() => {
        client.publish(topic, JSON.stringify(message))
        console.log('Message sent!', message)
    }, 5000)
})

