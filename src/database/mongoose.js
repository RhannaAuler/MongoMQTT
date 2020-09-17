const mongoose = require('mongoose')


mongoose.connect('mongodb+srv://marinastavares:senha@cluster0-0uxwc.mongodb.net/Rhanna-teste2?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

// VERSAO LOCAL

// mongoose.connect('mongodb://localhost:27017/testMQTT', {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true,
//     useFindAndModify: false
// })


mongoose.Promise = global.Promise

module.exports = mongoose