const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

// MONGO
require('./database/mongoose')
const MQTTdata = require('./models/dataMQTT')

// ROTAS
const dmeRouter = require('./routers/dme')
const generalRouter = require('./routers/general')
const mainpageRouter = require('./routers/mainpage')
const postRouter = require('./routers/post')

const app = express() 
const port = process.env.PORT || 3000


app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json()) // para entender quando mando json
app.use(cors())
app.use(dmeRouter)
app.use(generalRouter)
app.use(mainpageRouter)
app.use(postRouter)



app.listen(port)
