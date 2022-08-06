exports.success = function(req, res, data, message) {
    // 'TokenExpiredError': jwt expired
    // 'JsonWebTokenError': jwt malformed
    console.log(`data.name : ${data.name}`)
    if (data.name && (data.name == 'TokenExpiredError'
            || data.name == 'JsonWebTokenError')) {
        // console.log(`Error 403 - ${data.message}`) // jwt expired

        res.status(403).send({ error: data, body: {}, message: data.message })

        return
    }
    
    res.status(200).send({ error:'', body:data, message:message })
}

exports.error = function(req, res, message) {
    // Fuente: https://www.sohamkamani.com/nodejs/jwt-authentication/
    // message = error
    // if (message instanceof jwt.JsonWebTokenError) {
    //     // if the error thrown is because the JWT is unauthorized, return a 401 error
    //     return res.status(403).send({ error:message, body:'' }).end()
    // }
    res.status(500).send({ error: message, body:'' })
}

exports.success_message = function() {
    return "Operación realizada con éxito"
}