const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/testMQTT', {
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