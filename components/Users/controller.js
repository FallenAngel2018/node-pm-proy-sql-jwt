const storage = require('./storage')

function validate_user( emp ) {
    return new Promise((resolve, reject) => {
        resolve( storage.validar( emp ) )
    })
}

function obtenerUsrs( emp ) {
    return new Promise((resolve, reject) => {
        resolve( storage.obtener_validar( emp ) )
    })
}

module.exports = {
    validate_user,
    obtenerUsrs,
}