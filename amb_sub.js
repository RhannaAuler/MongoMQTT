// arquivo para adicionar dados no ambiente para simulacao

require('./src/database/mongoose')
const Ambiente = require('./src/models/ambiente')
const Tecnico = require('./src/models/tecnico')
const MQTTdata = require('./src/models/dataMQTT')


// Ambiente.create({ 
//         name: "Laboratorio de Medicao",
//         slug: "LMM",
//         pontosDeMedicao: [ {
//             ponto: "porta",
//             id_DME: "123456"
//       }]
//     }, function (err, small) {
//     if (err) return handleError(err);
//     // saved!
// });

// Ambiente.create({ 
//     name: "Laboratorio da Mecanica",
//     slug: "LMC",
//     pontosDeMedicao: [ {
//         ponto: "corredor",
//         id_DME: "1234567"
//   }]
// }, function (err, small) {
// if (err) return handleError(err);
// // saved!
// });

// Ambiente.create({ 
//     name: "Laboratorio da Eletrica",
//     slug: "LEL",
//     pontosDeMedicao: [ {
//         ponto: "mesa",
//         id_DME: "12345678"
//     }]
//     }, function (err, small) {
//     if (err) return handleError(err);
//     // saved!
// });

// Tecnico.create({ 
//     name: "Gabriel Paulo",
//     email: "gabrielpaulo@lmm.com",
//     password: "12345",
//     slugAmbiente: "LMM"
// }, function (err, small) {
//     if (err) return handleError(err);
//     // saved!
// });

// Tecnico.create({ 
//     name: "Marina Rhanna",
//     email: "marihanna@lmm.com",
//     password: "12345",
//     slugAmbiente: "LEL",
//     active: false
// }, function (err, small) {
//     if (err) return handleError(err);
//     console.log('oi')
//     // saved!
// });

MQTTdata.create({ 
        id_DME: "12345678"
    }, function (err, small) {
        if (err) return handleError(err);
        console.log('oi')
        // saved!
});