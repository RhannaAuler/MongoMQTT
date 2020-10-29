// Requisicao dos modulos NPM usados

const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

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
        lowercase: true,
        unique: true
      },
      password: {  // senha para login
        type: String,
        required: true,
        select: false,
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
);


//Cria uma encriptação para a senha com 10 rounds

TecnicoSchema.pre('save', async function(next){
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});

const Tecnico = mongoose.model('Tecnico', TecnicoSchema)


module.exports = Tecnico