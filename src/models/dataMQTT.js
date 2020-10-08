// Requisao dos modulos NPM usados

const mongoose = require('mongoose')
const validator = require('validator')


// Schema do MongoDB para armazenamento dos dados medidos pelo DME

const dadosMedidosSchema = new mongoose.Schema({
      id_DME: {
        type: String,
        required: true, // é necessario colocar o id do DME
        lowercase: true,
        trim: true, // remover espacos em branco da string
        unique: true // id deve ser unico
      },
      data: 
        {  //data é um dicionário para as listas dataV, dataW e dataA
          dataV: [  //dataV é a chave da lista com valor, fase e tempo da ultima tensao
            {
              value: {  // valor medido
                type: Number,
                required: true
              },
              date: {  // data da medicao
                type: Date,
                default: Date.now
              },
              phase: {  // fase da medicao
                type: String,
                required: true
              },
            },
          ],
          dataW: [ // referente as potencias medidas
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
          dataA: [  // referente as correntes medidas
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
          dataE: [  // referente a energia calculada
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
      timestamps: true  // ultima atualizao e data de criacao do dme
    }
)

const MQTTdata = mongoose.model('MQTTdata', dadosMedidosSchema)


// Exportando o modelo para uso em outros arquivos

module.exports = MQTTdata 
