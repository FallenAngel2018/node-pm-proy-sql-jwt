const pool = require('../../bd')
const sql = require('mssql');
const fs = require('fs');
const path = require('path');
const img_dir = "uploads"
// const jwt = require('jsonwebtoken')



require("dotenv").config(); // Carga variables de entorno

// FALTA GET
// async function obtenerTareas( tarea ) {
async function obtenerTareas( tarea, token ) {
    const conn = await pool.getConnection();

    console.log({ tarea })

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
        const result = await conn.request()
        .input('id_tarea', tarea.id_tarea ? parseInt(tarea.id_tarea) : null)
        .input('cedula_nombre', tarea.parametro_busqueda)
        .input('tipo_empleado', parseInt(tarea.tipo_empleado)) // 0: Normal, 1: Admin
        .input('estado_tarea', tarea.estado != 'null' ? tarea.estado : null) // 0: PENDIENTE, 1: COMPLETADO, null = Todas las tareas???
        .execute(`nb_obtener_tareas`);

        const results = result.recordset;
        // console.log({ results })

        if(results) {
            let i = 0
            results.forEach(element => {
                // Este vuelve como un String, en vez de como un Integer
                element["IdTarea"] = parseInt(results[i]["IdTarea"])
                // En este campo, los resultados volvían como [ '1', '1' ], en vez de solo un Int 1
                element["IdEmpleado"] = parseInt(results[i]["IdEmpleado"][0])

                if(element["Imagen"] != null) {
                    var originalBase64ImageStr = Buffer.from(element["Imagen"], 'utf8');
                    // decodedImage = originalBase64ImageStr.toString('base64');
                    decodedImage = Buffer.from(originalBase64ImageStr, 'base64');
                    decodedImage2 = originalBase64ImageStr.toString('base64');

                    const b64 = Buffer.from(element["Imagen"]).toString('base64');

                    // console.log({originalBase64ImageStr})
                    // console.log({ decodedImage })
                    // console.log({ decodedImage2 })

                    // const img_varbinary = `data:image/jpg;base64,${decodedImage}`
                    // const img_varbinary = `data:image/png;base64,${decodedImage}`
                    const ext = element["Extension"]
                    var img_varbinary = `data:image/png;base64,${b64}`; // decodedImage2
                    console.log({ ext })
                    // console.log({ b64 })
                    var str = b64.substring(0,30);
                    console.log({ str })


                    if (ext != "" && ext) {
                        img_varbinary = `data:image/${ext};base64,${b64}`; // decodedImage2
                    }

                    element["Imagen"] = img_varbinary;

                    // var x = element["Imagen"]
                    // console.log({ x })
                }
                
                i++
            });

            return results;

        }

        return {}

    } catch(error) {
        console.log(error);

        return error;
    }

}



// Agregar y Actualizar van separados
// Se unen a un solo método aparte definido más abajo
async function agregarFoto( tarea ) {
    console.log({ tarea })

    return tarea
    // fs.writeFile(img_dir + "image.png", tarea, (err) => {
    //     console.error(error)

    //     return error
    // })
    
}

// Agregar y Actualizar van separados
// Se unen a un solo método aparte definido más abajo
async function agregarTarea( tarea ) {
    return await transaction_AgregarActualizar_Tarea(tarea)
}

async function actualizarTarea( tarea ) {
    return await transaction_AgregarActualizar_Tarea(tarea)
}


// FALTA DELETE


// Fuente: https://codeomelet.com/posts/calling-stored-procedure-with-nodejs-and-mssql
const transaction_AgregarActualizar_Tarea = async (tarea) => {

    console.log({ tarea })

    try {
        const conn = await pool.getConnection();

        var result = null

        // INSERTAR
        if (tarea.id_tarea == 0) {

            // Fuente: https://stackoverflow.com/questions/31762686/node-js-make-code-wait-until-the-fs-readfile-is-completed
            var image = null;
            // Si el path es enviado, ejecuta la obtención de la imagen
            if(tarea.path && tarea.path.length > 0) image = fs.readFileSync(tarea.path);
            // var image = fs.readFile(tarea.path);

            // console.log({ image })

            // if(tarea.imagen_tipo) {
            //     // Fuente: https://www.w3schools.com/jsref/jsref_includes.asp
            //     if(tarea.imagen_tipo.toString().toLowerCase().includes("jpg")) tarea.imagen_tipo = "jpg"
            //     if(tarea.imagen_tipo.toString().toLowerCase().includes("jpeg")) tarea.imagen_tipo = "jpeg"
            //     if(tarea.imagen_tipo.toString().toLowerCase().includes("png")) tarea.imagen_tipo = "png"
            // }

            result = await conn.request()
                .input('id_tarea', tarea.id_tarea) // 0: INSERTAR, 1: ACTUALIZAR
                .input('cedula', tarea.cedula)
                .input('cod_vivienda', parseInt(tarea.cod_vivienda)) // Int
                .input('direccion', tarea.direccion)
                .input('manzana', tarea.manzana)
                .input('villa', tarea.villa)
                // Prueba para plataforma web
                .input('imagen', sql.VarBinary(sql.MAX), image ? Buffer.from(image, 'binary') : null) //  VarBinary(Max)
                // .input('imagen', sql.VarBinary(sql.MAX), image ? Buffer.from(image).toString('utf8') : null) //  VarBinary(Max)
                // En web: image/jpg, image/png, image/jpeg
                // En Android: ??? 
                .input('imagen_tipo', tarea.imagen_tipo ? tarea.imagen_tipo : "")
                .execute(`nb_tarea_crear_actualizar`); // Se crea con estado 0 = Pendiente
        }

        // ACTUALIZAR
        if (tarea.id_tarea >= 1) {

            // Fuente: https://stackoverflow.com/questions/31762686/node-js-make-code-wait-until-the-fs-readfile-is-completed
            var image = null;
            // Si el path es enviado, ejecuta la obtención de la imagen
            if(tarea.path && tarea.path.length > 0) image = fs.readFileSync(tarea.path);

            if(tarea.imagen_tipo) {
                // Fuente: https://www.w3schools.com/jsref/jsref_includes.asp
                if(tarea.imagen_tipo.toString().toLowerCase().includes("jpg")) tarea.imagen_tipo = "jpg"
                if(tarea.imagen_tipo.toString().toLowerCase().includes("jpeg")) tarea.imagen_tipo = "jpeg"
                if(tarea.imagen_tipo.toString().toLowerCase().includes("png")) tarea.imagen_tipo = "png"
            }

            result = await conn.request()
                .input('id_tarea', tarea.id_tarea) // 0: INSERTAR, 1: ACTUALIZAR
                .input('cedula', tarea.cedula)
                // .input('cod_vivienda', tarea.cod_vivienda) // Int
                // .input('direccion', tarea.direccion)
                // .input('manzana', tarea.manzana)
                // .input('villa', tarea.villa)
                
                // DESCOMENTAR ESTE PARA PRUEBAS EN ANDROID
                // Fuente: https://stackoverflow.com/questions/34383938/how-to-insert-binary-data-into-sql-server-using-node-mssql
                // Fuente: https://stackoverflow.com/questions/50990572/requesterror-validation-failed-for-parameter-invalid-buffer
                // Fuente: https://nodejs.org/en/docs/guides/buffer-constructor-deprecation/
                // Fuente Buffer.from(tarea.imagen, 'binary'): https://stackoverflow.com/questions/34383938/how-to-insert-binary-data-into-sql-server-using-node-mssql
                .input('imagen', sql.VarBinary(sql.MAX), image ? Buffer.from(image, 'binary') : null) //  VarBinary(Max)
                // En web: image/jpg, image/png, image/jpeg 
                // En Android: ??? 
                .input('imagen_tipo', tarea.imagen_tipo ? tarea.imagen_tipo : "")
                .input('cod_medidor', tarea.cod_medidor.toString())
                .input('gps', tarea.gps.toString())
                .input('estado', parseInt(tarea.estado.toString().trim())) // 0: PENDIENTE, 1: COMPLETADO
                .execute(`nb_tarea_crear_actualizar`);
        }
        
        const results = result.recordset;
        
        console.log(results);

        await removeUploads();

        return results

    } catch (error) {
        console.log(error)

        await removeUploads();

        return error
    }

};

async function removeUploads() {

    fs.readdir(img_dir, (err, files) => {
        if (err) throw err;

        if (files) {
            console.log("Removing files from folder", `'${img_dir}'`, "...")
            for (const file of files) {
                fs.unlink(path.join(img_dir, file), err => {
                    if (err) throw err;
                });
            }
            console.log("Files removed successfully!")

        }
        
    });

    
    // Fuente: https://stackoverflow.com/questions/18052762/remove-directory-which-is-not-empty
    // También existe este modulo para hacerlo en menos líneas (Falta probar)
    // const rimraf = require("rimraf");
    // rimraf(img_dir, function () { console.log("done"); });
    // rimraf("/some/directory", function () { console.log("done"); });

} 


module.exports = {
    obtener: obtenerTareas,
    agregar: agregarTarea,
    upload: agregarFoto,
    actualizar: actualizarTarea,

    // eliminar: eliminarEmpleado,
    // validar: validate_user,
    // obtener_validar: obtenerUsrs,
}