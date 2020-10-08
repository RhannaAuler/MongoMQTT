const mongoose = require('mongoose')  // modulo mongoose
const validator = require('validator') // modulo de validacao de dados

// Schema para os Ambientes/Laboratorios
const AmbienteSchema = new mongoose.Schema({
      name: {   // nome do ambiente
        type: String,
        required: true,
        lowercase: true,
        trim: true  // retira espacos em branco
      },
      slug: {  // sigla do ambiente, ex: lmm
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true  // sigla deve ser unica
      },
      pontosDeMedicao: [ { // lista de pontos de medicao do ambiente
        ponto: {   // nome do ponto
            type: String,
            required: true,
            lowercase: true
        },
        id_DME: {  // id do dme ligado ao ponto
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true
        }
      }]
    },
    {
      timestamps: true // data de atualizacao e criacao do ambiente
    }
)

// Modelo do Ambiente
const Ambiente = mongoose.model('Ambiente', AmbienteSchema) 

// Exportando o modelo Ambiente para uso em outros arquivos
module.exports = Ambiente
