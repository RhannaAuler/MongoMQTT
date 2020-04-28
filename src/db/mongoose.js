const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://marinastavares:senha@cluster0-0uxwc.mongodb.net/test-MQTT?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})



// const MQTTdata = mongoose.model('MQTTdata', {
//     message: {

//     }
// })

// const m1 = new MQTTdata({
//     message: 'Hello'
// })

// m1.save().then(() => {
//     console.log(m1)
// }).catch((e) => {
//     console.log('Error!', e)
// })
