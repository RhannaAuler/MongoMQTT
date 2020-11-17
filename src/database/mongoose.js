const mongoose = require('mongoose')

// VERSAO NA NUVEM 

mongoose.connect('mongodb+srv://marinastavares:senha@cluster0-0uxwc.mongodb.net/teste3?retryWrites=true&w=majority', { // alterar link para mudar conta do mongo
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