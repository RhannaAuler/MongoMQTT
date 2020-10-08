// Requisicao dos modulos NPM usados

const mongoose = require('mongoose')
const validator = require('validator')
require('mongoose-type-email');


// Schema para Tecnico

const TecnicoSchema = new mongoose.Schema({
      name: { // nome completo do tecnico
        type: String,
        required: true,
        lowercase: true,
        trim: true // remover espacos em branco da string
      },
      email: { // email para login e notificacoes
        type: mongoose.SchemaTypes.Email, // modulo verifica se é um email
        required: true,
        lowercase: true
      },
      password: {  // senha para login
        type: String,
        required: true,
      },
      slugAmbiente:{  // ambiente do tecnico
        type: String,
        required: true,
        lowercase: true,
        trim: true 
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

const Tecnico = mongoose.model('Tecnico', TecnicoSchema)


module.exports = Tecnico
