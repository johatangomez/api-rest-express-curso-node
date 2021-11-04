const express = require('express');
const Joi = require('joi');
const app = express();
const config = require('config');
//const logger = require('./logger');
const auth = require('./auth');
const morgan = require('morgan');
const debugInicio = require('debug')('app:inicio');
const debugDB = require('debug')('app:db');

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
//app.use(logger);
app.use(auth);

if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    debugInicio('Morgan está habilitado...');
}

debugDB('Conectando con la base de datos');


//Configuración de entorno
console.log('Aplicación: ' + config.get('nombre'));
console.log('BD server: ' + config.get('configDB.host'));


const users = [
    {id:1, nombre: 'Johatan'},
    {id:2, nombre: 'Luz'},
    {id:3, nombre: 'Johany'}
];

//consulta
app.get('/', (req, res) => {
    res.send('Hola Mundo desde express');
}); 

app.get('/api/usuarios', (req, res) => {
    res.send(users);
});

app.get('/api/usuarios/:id', (req, res) => {
    let user = existUser(req.params.id);
    if(!user) res.status(404).send('El usuario no fue encontrado');
    res.send(user);
});

//envío de datos
app.post('/api/usuarios', (req, res) => {
    const {error, value} = userValid(req.body.nombre);
    if(!error){
        const user = {
            id: users.length + 1,
            nombre: value.nombre
        };
        users.push(user);
        res.send(users);
    }
    else {
        const msj = error.details[0].message;
        res.status(400).send(msj);
    }    
}); 

//actualización
app.put('/api/usuarios/:id', (req, res) => {
    let user = existUser(req.params.id);
    if(!user){
        res.status(404).send('El usuario no fue encontrado');
        return;
    } 
        
    
    const {error, value} = userValid(req.body.nombre);
    if(error){
        const msj = error.details[0].message;
        res.status(400).send(msj);
        return;
    }
    
    user.nombre = value.nombre;
    res.send(user);
}); 

// eliminación
app.delete('/api/usuarios/:id', (req, res) => {
    let user = existUser(req.params.id);
    if(!user){
        res.status(404).send('El usuario no fue encontrado');
        return;
    } 

    const idx = users.indexOf(user);
    users.splice(idx, 1);
    res.send(users);
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Escuchando en el puerto ${port}`));

//funciones
function existUser(id){
    return (users.find(u => u.id === parseInt(id)));
}

function userValid(name){
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });
    return (schema.validate({ nombre: name }));
}






