const storage = require('./storage')
const jwt = require('jsonwebtoken')
require("dotenv").config(); // Carga variables de entorno

// function obtenerTareas( filtroTarea ) {
function obtenerTareas( filtroTarea, token ) {
    return new Promise((resolve, reject) => {
        // resolve( storage.obtener( filtroTarea ) )
        
        console.log("controller/Tarea/obtenerTareas")

        var secretKey = process.env.JwtEncryption_Secret_key
        // Sync
        try {   
            const decoded = jwt.verify(token, secretKey);
            console.log({ decoded })
        }
        catch (ex) {
            console.log(ex.message);

            return reject(ex)
        }

        resolve( storage.obtener( filtroTarea, token ) )
    })
}

function agregarFoto( tarea ) {
    return new Promise((resolve, reject) => {
        if (tarea == null) {
            return reject('Ingrese una imagen.')
        }
        resolve( storage.upload( tarea ) )
    })
}

function agregarTarea( tarea ) {
    return new Promise((resolve, reject) => {
        var errors_flag = false
        var error_messages = []

        if (tarea.id_tarea == null) {
            errors_flag = true
            error_messages.push("Ingrese un id de tarea.");
            // return reject('Ingrese un id de tarea.')
            return reject(error_messages)
        }
        if(tarea.imagen_tipo) {
            // Fuente: https://www.w3schools.com/jsref/jsref_includes.asp
            if(tarea.imagen_tipo.toString().toLowerCase().includes("jpg")) tarea.imagen_tipo = "jpg"
            if(tarea.imagen_tipo.toString().toLowerCase().includes("jpeg")) tarea.imagen_tipo = "jpeg"
            if(tarea.imagen_tipo.toString().toLowerCase().includes("png")) tarea.imagen_tipo = "png"
        }
        resolve( storage.agregar( tarea ) )
    })
}

function actualizarTarea( tarea ) {
    return new Promise((resolve, reject) => {
        if (tarea.id_tarea == null) {
            return reject('Ingrese un id de tarea.')
        }
        
        resolve( storage.actualizar( tarea ) )
            // .then((data) => response.success(req, res, data, response.success_message()))
            // .catch((error) => response.error(req, res, error) )
    })
}

module.exports = {
    obtenerTareas,
    agregarTarea,
    agregarFoto,
    actualizarTarea,

    // eliminarEmpleado,

}