const mongoose = require('mongoose')
const validator = require('validator')

const AmbienteSchema = new mongoose.Schema({
      name: { // laboratorio
        type: String,
        required: true,
        lowercase: true,
        trim: true // remover espacos em branco da string
      },
      slug: { 
        type: String,
        required: true,
        lowercase: true,
        trim: true 
      },
      pontosDeMedicao: [ {
        ponto: {
            type: String,
            required: true,
            lowercase: true
        },
        id_DME: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true
        }
      }]
    },
    {
      timestamps: true
    }
)

const Ambiente = mongoose.model('Ambiente', AmbienteSchema)


module.exports = Ambiente
