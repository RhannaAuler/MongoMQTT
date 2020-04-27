const mongoose = require('mongoose')
const validator = require('validator')


const MQTTdata = mongoose.model('MQTTdata', {
    message: {

    },
    title: {

    },
    date: {
        type: Date
    }
})

module.exports = MQTTdata
