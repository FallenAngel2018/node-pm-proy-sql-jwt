// Sql Server (mssql)
const pool = require('../../bd')
const sql = require('mssql');
const dns = require('dns')
require("dotenv").config(); // Carga variables de entorno

const jwt = require('jsonwebtoken')


async function obtenerEmpleados( filtroEmp ) {
    console.log({filtroEmp})

    try {
        const conn = await pool.getConnection();

        const result = await conn.request()
            .input('nombre_cedula', filtroEmp.parametro_busqueda)
            .input('tipo_empleado', filtroEmp.tipo_empleado ? parseInt(filtroEmp.tipo_empleado) : null)
            .input('id_empleado', filtroEmp.id_empleado)
            .execute(`nb_obtener_empleados`);

        const results = result.recordset;

        return results

    } catch(error) {
        console.log(error)

        return error
    }
}


async function loginEmpleado( filtroEmp ) {

    try {
        const conn = await pool.getConnection();

        const result = await conn.request()
            .input('cedula', filtroEmp.cedula)
            .input('tipo_empleado', parseInt(filtroEmp.tipo_empleado))
            .execute(`nb_empleado_login`);

        const results = result.recordset;
        var response_arr = [];

        // Si la cédula del empleado no fue encontrada...
        if (results[0]["IdError"] == -1) {
            console.log(results[0]["MsgOperacion"])
            
            console.log({ results })
            // return false

            const response_body = {
                login_success: false,
                usuario: results[0]["NombreUsuario"]
            }

            // Si el login viene desde Android, devolverá
            // un array en vez de un diccionario
            if(filtroEmp.tipo_empleado == 0) {
                response_arr.push(response_body["login_success"])
                response_arr.push(response_body["usuario"])

                return response_arr
            }

            return response_body
            
        }
        
        const hash = { iv: results[0]["Clave_IV"], password: results[0]["Clave"] }
        const text = passwd_decrypt(hash, filtroEmp.clave);
        console.log("login_success?:", text == filtroEmp.clave)

        // return {
        //     login_success: text == filtroEmp.clave,
        //     usuario: results[0]["NombreUsuario"]
        // }

        var secretKey = process.env.Encryption_Secret_key
        // var token = ''
        // const token = 
        // jwt.sign({ user: filtroEmp }, secretKey,
        //     { expiresIn: '40s' }, (err, json_w_token) => {
        //     if(!err) {
        //         token = json_w_token
        //         console.log({ token })

        //         // return token
        //     }

        //     if(err) {
        //         return err
        //     }

        //     // return !err ? token : ""
        // });

        filtroEmp["usuario"] = results[0]["NombreUsuario"]

        // Fuente: https://stackoverflow.com/questions/56855440/in-jwt-the-sign-method
        // Synchronous
        const syncToken = jwt.sign({ user: filtroEmp }, secretKey, { expiresIn: '90s' });

        const response_body = {
            login_success: text == filtroEmp.clave,
            usuario: results[0]["NombreUsuario"],
            token: syncToken // token, syncToken
        }
        
        // Si el login viene desde Android, devolverá
        // un array en vez de un diccionario
        if(filtroEmp.tipo_empleado == 0) {

            console.log({ response_body })

            response_arr.push(response_body["login_success"].toString())
            response_arr.push(response_body["usuario"])
            response_arr.push(response_body["token"])

            return response_arr
        }

        return response_body

    } catch(error) {
        console.log(error)

        return error
    }
}

// Agregar y Actualizar van separados
// Se unen a un solo método aparte definido más abajo
// async function agregarEmpleado( empleado ) {
async function agregarEmpleado( empleado, token ) {
    console.log({ empleado })
    console.log({ token })

    // return await transaction_AgregarActualizar_Empleado(empleado)
    return await transaction_AgregarActualizar_Empleado(empleado, token)
}

async function actualizarEmpleado( empleado, token ) {
    console.log({ empleado })
    console.log({ token })

    return await transaction_AgregarActualizar_Empleado(empleado, token)
}

// Fuente: https://codeomelet.com/posts/calling-stored-procedure-with-nodejs-and-mssql
// const transaction_AgregarActualizar_Empleado = async (empleado) => {
const transaction_AgregarActualizar_Empleado = async (empleado, token) => {
    
    // var passwd = 'I love kittens ñ í á è';
    var passwd = empleado.clave;
    var key = process.env.Encryption_Secret_key + passwd
    var hash = {}

    // var secretKey = process.env.Encryption_Secret_key

    // //sync
    // try {
    //     const decoded = jwt.verify(token, secretKey);
    //     console.log({ decoded })
    // }
    // catch (ex) {
    //     console.log(ex.message);

    //     return ex
    // }

    try {
        const conn = await pool.getConnection();

        hash = passwd_encrypt(passwd, key)

        const result = await conn.request()
            .input('cedula', empleado.cedula)
            .input('nombre', empleado.nombre)
            .input('clave', hash.password)
            .input('clave_iv', hash.iv)
            .input('tipo_empleado', empleado.tipo_empleado)
            .input('tipo_operacion', empleado.tipo_operacion)
            .input('estado', empleado.estado)
            .execute(`nb_empleado_crear_actualizar`);

        const results = result.recordset;
        console.log(results);

        return results
    } catch (error) {
        console.log(error)

        return error
    }

    // hash = { iv: "837e59266bf7c82e6c5e9ba7efaa828a", password: "ce0c90dde7e664c6ea9acb0a0e6ef96659dc0d7965c0dd2ce9a3" }
    // const text = passwd_decrypt(hash, passwd);
    // console.log(text); // Hello World!

};

// Pone al empleado en estado 0 = INACTIVO
async function eliminarEmpleado( empleado ) {
    const conn = await pool.getConnection();

    try {
        
        const result = await conn.request()
            .input('cedula', empleado.cedula) // O Id del empleado, como sea
            .input('estado', empleado.estado) // Mandar con un int = 0
            .execute(`nb_empleado_eliminar`);

        const results = result.recordset;

        return results

    } catch (error) {
        console.log(error)

        return error
    }

}

// #region Complementary methods

// Fuente: https://attacomsian.com/blog/nodejs-encrypt-decrypt-data
var crypto = require('crypto'); // package.json: "crypto": "^1.0.1",

const passwd_encrypt = (text, key) => {

    // 'aes-256-ctr', or any other algorithm supported by OpenSSL
    var algorithm = process.env.Algorithm_encryption_type; // or any other algorithm supported by OpenSSL
    var secretKey = key;
    secretKey = crypto.createHash('sha256').update(String(secretKey)).digest('base64').substring(0, 32);
    // console.log("secretKey CON ENC:", secretKey)

    // Create an initialization vector
    var iv = crypto.randomBytes(16); // <Buffer f4 7e ... 09>

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv.toString('hex'), // Initialization vector
        // content: encrypted.toString('hex')
        password: encrypted.toString('hex')
    };
};

const passwd_decrypt = (hash, passwd) => {
    const algorithm = process.env.Algorithm_encryption_type; // or any other algorithm supported by OpenSSL
    var secretKey = process.env.Encryption_Secret_key + passwd;
    secretKey = crypto.createHash('sha256').update(String(secretKey)).digest('base64').substring(0, 32);

    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));

    // const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.password, 'hex')), decipher.final()]);

    return decrpyted.toString();
};


// #region GET

async function obtenerUsrs( filtroEmp ) {
    // Sql Server (mssql)
    const conn = await pool.getConnection();
    var queryStr = "";
    let results = null;

    console.log(`filtroEmp: ${filtroEmp}`)

    if (filtroEmp) {
        queryStr = `SELECT * FROM Trial_Usr_Logs WHERE usr_pc_name LIKE '%' + '${filtroEmp}' + '%'`;
        
        results = await conn.request().query(queryStr);
    } else {
        // const result = await conn.request().query("");
        queryStr = "SELECT * FROM Trial_Usr_Logs";
        
        results = await conn.request().query(queryStr);
    }

    // console.log(results.recordset);

    return results.recordset;
}

// #endregion

// #region POST

async function validate_user( emp ) {
    // console.log({emp})

    var results = null;
    const conn = await pool.getConnection();
    const transaction = new sql.Transaction(conn)
    transaction.begin(err => {
        var queryStr = `EXEC nb_set_checked_time '${emp.hostname}', '${emp.ip_addr}'
                            , '${emp.remote_ip_addr}', '${emp.public_ip_addr}'
                            , '${emp.proxy_ip_addr}', '${emp.proxy_domain_name}'
                            , '${emp.checked_time}'`

        const request = new sql.Request(transaction)
        request.query(queryStr, (err, result) => {
            // ... error checks
            // console.dir(result) //["recordset"]
            console.log(err || "")

            results = result

            transaction.commit(err => {
                // ... error checks
                console.log("Transaction committed.")
            })
        })
    })

    return results

}

// #endregion


// #endregion



module.exports = {
    obtener: obtenerEmpleados,
    login: loginEmpleado,
    agregar: agregarEmpleado,
    actualizar: actualizarEmpleado,

    eliminar: eliminarEmpleado,
    validar: validate_user,
    obtener_validar: obtenerUsrs,
}