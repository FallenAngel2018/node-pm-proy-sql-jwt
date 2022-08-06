const storage = require('./storage')

function obtenerEmpleados( filtroEmp ) {
    return new Promise((resolve, reject) => {
        resolve( storage.obtener( filtroEmp ) )
    })
}

function loginEmpleado( empleado ) {
    return new Promise((resolve, reject) => {
        if (empleado.cedula == null || empleado.cedula == ""
            || empleado.clave == null || empleado.clave == "") {
            return reject('Ingrese ambos campos')
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

function actualizarEmpleado( empleado ) {
    return new Promise((resolve, reject) => {
        if (empleado.cedula == null || empleado.cedula == "") {
            return reject('Ingrese una cédula')
        }
        resolve( storage.actualizar( empleado ) )
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