const express = require('express')
const Tecnico = require('../models/tecnico')
const Ambiente = require('../models/ambiente')
const MQTTdata = require('../models/dataMQTT')
const router = express.Router()
const bcrypt = require('bcryptjs')


// POST DO TECNICO

router.post('/registro_tecnico', async (req, res) => {

    const { email } = req.body
    
    try {

        if (await Tecnico.findOne({email})){
            return res.status(400).send({error: 'Email já cadastrado'})
        }; // Caso o usuario ja esteja cadastrado


        const tecnico = await Tecnico.create(req.body); // Todos os parametros do esquema estarao dentro de req.body

        //Tecnico.password = undefined; // Para nao voltar a informação de senha, NAO DEU CERTO


        return res.send({tecnico});


    } catch (e) {
        res.status(400).send({error: 'Falha nos dados de registro do tecnico'})
    }
     
})

// POST DO AMBIENTE

router.post('/registro_ambiente', async (req, res) => {
    // const { id_DME } = req.body;
    const {slug} = req.body;


    try {

        if (await Ambiente.findOne({id_DME: req.body.pontosDeMedicao[0].id_DME})){ //Verifica se existe aquele id_DME
            console.log(req.body.pontosDeMedicao[0].id_DME)
            console.log("ID Existente")
            return res.status(400).send({error: 'ID_DME existente'})
        }
            
        else{
            console.log("Nao achou a ID")
            const datamqtt = await MQTTdata.create({
                                                    id_DME: req.body.pontosDeMedicao[0].id_DME,
                                                    slug: req.body.slug,
                                                    ponto: req.body.pontosDeMedicao[0].ponto
                                                }); // Cria a nova ID_DME no schema dataMQTT
            
            res.send({datamqtt})

            if (await Ambiente.findOne({slug})){
                console.log("Achou a Slug do ambiente")
                
                 Ambiente.findOne({slug}, 'pontosDeMedicao')
                .then((doc) => {
                    console.log("Atualiza ponto de medição")
                    return Ambiente.findOneAndUpdate({slug}, {pontosDeMedicao: doc.pontosDeMedicao.concat(req.body.pontosDeMedicao[0])}); // Atualiza o ponto de medição
                    // return res.send({amb, datamqtt})
                    
                })
                // return res.send({datamqtt, ambiente})
            }
            
            else{
                console.log('Nao achou a slug do ambiente, portando da req.body')

                const ambiente = await Ambiente.create(req.body); // Todos os parametros do esquema estarao dentro de req.body
                return res.send({ambiente, datamqtt });
            }
        }
    } catch (e) {
        console.log(e)
        res.status(400).send({error: 'Falha nos dados de registro do Ambiente, verifique se o id_DME é unico'})
    }
     
})


// POST HABILITAR/DESABILITAR DMES

router.post('/status_active', async (req, res) => {
    const {id_DME} = req.body;
    try {

        if (await MQTTdata.findOne({id_DME: req.body.id_DME})){
            console.log("Achou a ID_DME")


            MQTTdata.findOne({id_DME: req.body.id_DME}, 'active') 
                .then((doc) => {

                    if (doc.active){//Se o doc.active == true
                        console.log("Atualiza ponto de medição")
                        return MQTTdata.findOneAndUpdate({id_DME: req.body.id_DME}, {active: false}); //Atualiza o status do 'active
                    }
                    else{//Se o doc.active == false
                        return MQTTdata.findOneAndUpdate({id_DME: req.body.id_DME}, {active: true}); //Atualiza o status do 'active'
                    }             
                })
                return res.send(req.body)
            }
        else{
            console.log("Nao achou a ID_DME")
            res.status(400).send({error: 'ID_DME não encontrada'})
        }            

    } catch (e) {
        res.status(400).send({error: 'ID_DME não encontrada'})
    }
     
})

// POST de LOGIN


//lembrar que houve alteracao no schema do tecnico
// Instalar a biblioteca bcryptjs e importar ele no tecnico.js e no post.js

router.post('/login', async (req, res) => {

    const { email, password } = req.body

    const user = await Tecnico.findOne({ email }).select('+password');

    if (!user){
        res.status(400).send({error: 'Usuário não encontrado'});

    };

    if (!await bcrypt.compare(password, user.password)){ //Compara se a senha digitada é a mesma senha cadastrada pelo usuario
        return res.status(400).send({error: 'Senha inválida'})
    };

    res.send({user});
     
})



module.exports = router