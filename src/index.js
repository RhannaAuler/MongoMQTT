const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

// MONGO
require('./database/mongoose')
const MQTTdata = require('./models/dataMQTT')

// ROTAS
const espRouter = require('./routers/esp')

const app = express()
const port = process.env.PORT || 3001


app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json()) // para entender quando mando json
app.use(cors())

app.use(espRouter)


app.listen(port)
