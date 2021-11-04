function authenticador(req, res, next){
    console.log('Autenticando...');
    next();
}
 
module.exports = authenticador;