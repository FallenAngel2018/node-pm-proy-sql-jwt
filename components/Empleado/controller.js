const storage = require('./storage')
const jwt = require('jsonwebtoken')
// require("dotenv").config(); // Carga variables de entorno
const usrs = require('../Users/other_methods')

function obtenerEmpleados( filtroEmp ) {
    return new Promise((resolve, reject) => {
        resolve( storage.obtener( filtroEmp ) )
    })
}

function loginEmpleado( empleado ) {
    return new Promise((resolve, reject) => {
        // var errors_flag = false
        // var error_messages = []

        // // console.log({ empleado })

        // if (empleado.cedula == null || empleado.cedula == ""
        //     || empleado.clave == null || empleado.clave == "") {
        //         errors_flag = true
        //         error_messages.push('Ingrese ambos campos')
        //     // return reject('Ingrese ambos campos')
        // }

        // if (empleado.cedula.length < 10) {
        //     errors_flag = true
        //     error_messages.push('El campo cédula debe tener al menos 10 caracteres.')
        // }

        // if (empleado.cedula.length > 99 || empleado.clave.length > 99) {
        //     errors_flag = true
        //     error_messages.push('El campo cédula o clave tienen más de 100 caracteres.')
        // }

        // console.log({ error_messages })

        const permit_data = usrs.verificar_empleado( empleado );
        const { errors_flag, error_messages } = permit_data

        if (errors_flag) {
            return reject(error_messages)
        }

        resolve( storage.login( empleado ) )
    })
}

// function agregarEmpleado( empleado ) {
function agregarEmpleado( empleado, token ) {
    return new Promise((resolve, reject) => {
        if (empleado.cedula == null || empleado.cedula == "") {
            return reject('Ingrese una cédula')
        }
        // resolve( storage.agregar( empleado ) )
        resolve( storage.agregar( empleado, token ) )
    })
}

function actualizarEmpleado( empleado, token ) {
    return new Promise((resolve, reject) => {
        console.log("controller/Empleado/actualizarEmpleado")
        console.log("Method jwt.verify executed!!!")

        var secretKey = process.env.Encryption_Secret_key
        // Sync
        try {   
            const decoded = jwt.verify(token, secretKey);
            console.log({ decoded })
        }
        catch (ex) {
            // ReferenceError: jwt is not defined
            console.log(ex.message);

            return reject(ex)
        }
        
        const permit_data = usrs.verificar_empleado( empleado );
        const { errors_flag, error_messages } = permit_data

        if (errors_flag) {
            return reject(error_messages)
        }

        resolve( storage.actualizar( empleado, token ) )
    })
}

function eliminarEmpleado( empleado ) {
    return new Promise((resolve, reject) => {
        if (empleado.cedula == null || empleado.cedula == "") {
            return reject('Ingrese una cédula')
        }
        resolve( storage.eliminar( empleado ) )
    })
}

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
    obtenerEmpleados,
    loginEmpleado,
    agregarEmpleado,
    actualizarEmpleado,

    eliminarEmpleado,
    validate_user,
    obtenerUsrs,
}