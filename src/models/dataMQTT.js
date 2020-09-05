const mongoose = require('mongoose')
const validator = require('validator')

const MQTTdata = mongoose.model('MQTTdata', {
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      description: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      data: [
        {
          value: {
            type: Number,
            required: true,
          },
          date: {
            type: Date,
            default: Date.now,
          },
          type: {
            type: String,
            required: true,
          },
        },
      ],
      active: {
        type: Boolean,
        default: true,
      },
    }
    // if this is just `true`, it doesnt error
  )


module.exports = MQTTdata
