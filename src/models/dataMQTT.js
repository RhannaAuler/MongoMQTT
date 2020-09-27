const mongoose = require('mongoose')
const validator = require('validator')

const dadosMedidosSchema = new mongoose.Schema({
      id_DME: {
        type: String,
        required: true,
        lowercase: true,
        trim: true // remover espacos em branco da string
      },
      data: 
        {  //data é um dicionário para as listas dataV, dataW e dataA
          dataV: [  //dataV é  a chave da lista
            {
              value: {
                type: Number,
                required: true
              },
              date: {
                type: Date,
                default: Date.now
              },
              phase: {
                type: String,
                required: true
              },
            },
          ],
          dataW: [
            {
              value: {
                type: Number,
                required: true
              },
              date: {
                type: Date,
                default: Date.now
              },
              phase: {
                type: String,
                required: true
              },
            },
          ],
          dataA: [
            {
              value: {
                type: Number,
                required: true
              },
              date: {
                type: Date,
                default: Date.now
              },
              phase: {
                type: String,
                required: true
              },
            },
          ],
          dataE: [  
            {
              value: {
                type: Number,
                required: true
              },
              date: {
                type: Date,
                default: Date.now
              },
              phase: {
                type: String,
                required: true
              },
            },
          ],
        },
      active: {  // habilitado ou desabilitado no frontend
        type: Boolean,
        default: true
      },
    },
    {
      timestamps: true
    }
)

const MQTTdata = mongoose.model('MQTTdata', dadosMedidosSchema)


module.exports = MQTTdata
