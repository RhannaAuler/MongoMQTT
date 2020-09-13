const express = require('express')
const bodyParser = require('body-parser')

// MONGO
require('./database/mongoose')
const MQTTdata = require('./models/dataMQTT')

// ROTAS
const espRouter = require('./routers/esp')

const app = express()

app.use(bodyParser.json()) // para entender quando mando json
app.use(bodyParser.urlencoded({extended: false}))
app.use(espRouter)


app.listen(3000)