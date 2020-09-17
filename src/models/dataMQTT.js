const mongoose = require('mongoose')
const validator = require('validator')

const MQTTdataSchema = new mongoose.Schema({
      name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
      },
      description: String,
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
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
      active: {  // if this is just `true`, it doesnt error
        type: Boolean,
        default: true
      },
    },
    {
      timestamps: true
    }
)

const MQTTdata = mongoose.model('MQTTdata', MQTTdataSchema)


module.exports = MQTTdata
