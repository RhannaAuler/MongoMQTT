const mongoose = require('mongoose')
const validator = require('validator')
require('mongoose-type-email');

const TecnicoSchema = new mongoose.Schema({
      name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true // remover espacos em branco da string
      },
      email: {
        type: mongoose.SchemaTypes.Email,
        required: true,
        lowercase: true
      },
      password: {
        type: String,
        required: true,
      },
      slugAmbiente:{ 
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
