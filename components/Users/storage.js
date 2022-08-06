const pool = require('../../bd')
const sql = require('mssql');


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
        var queryStr = `EXEC nb_set_checked_time '${emp.entidad}'
                            , '${emp.origen_request}', '${emp.hostname}', '${emp.ip_addr}'
                            , '${emp.remote_ip_addr}', '${emp.public_ip_addr}'
                            , '${emp.proxy_ip_addr}', '${emp.proxy_domain_name}'
                            , '${emp.is_vpn}', '${emp.isp_name}', '${emp.usr_city}'
                            , '${emp.checked_time}'`

        const request = new sql.Request(transaction)
        request.query(queryStr, (err, result) => {
            // ... error checks
            // console.dir(result) //["recordset"]
            console.log(err || "")

            results = result

            transaction.commit(err => {
                // ... error checks
                // console.log("Transaction committed.")
            })
        })
    })

    return results

}

// #endregion


module.exports = {
    validar: validate_user,
    obtener_validar: obtenerUsrs,
}