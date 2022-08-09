const controller = require('./controller')
const response = require('../../network/response')


// #region Complementary methods


// #region verifyToken

function verifyToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];

    console.log("Method verifyToken")
    console.log(typeof bearerHeader)
    
    if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(" ")[1];
        req.token = bearerToken;
        next();
    } else {
        // Forbidden, not authorized
        res.status(403).send({
            error: '',
            body: {},
            message: 'Falta header authorization!'
        })
        // res.status(200).send({ error:'', body:data, message:message })


    }
}

// #endregion


// #region validate_employee

function validate_employee( empleado ) {

    var errors_flag = false
    var error_messages = []

    // console.log({ empleado })

    if (empleado.cedula == null || empleado.cedula == ""
        || empleado.clave == null || empleado.clave == "") {
            errors_flag = true
            error_messages.push('Ingrese ambos campos')
        // return reject('Ingrese ambos campos')
    }

    if (empleado.cedula.length < 10) {
        errors_flag = true
        error_messages.push('El campo cédula debe tener al menos 10 caracteres.')
    }

    if (empleado.cedula.length > 99 || empleado.clave.length > 99) {
        errors_flag = true
        error_messages.push('El campo cédula o clave tiene más de 100 caracteres.')
    }

    // console.log({ error_messages })

    return { errors_flag, error_messages }
}

// #endregion

// #region validate_user

async function validate_user(req, res, entidad, origen_request) {
    const os = require('os')
    const dns = require('dns');
    const show = false

    // Fuente: https://stackoverflow.com/questions/40726568/how-to-grab-the-computer-name-with-nodejs-electron
    const hostname = os.hostname() || "None hostname???"// Computer name?
    
    // Fuente: https://www.geeksforgeeks.org/node-js-dns-lookup-method/
    // Calling dns.lookup() for hostname
    // and displaying them in console as a callback
    var pc_addr = ""
    var family_addr = ""
    const options = { // Setting options for dns.lookup() method
        // Set true to see every IP address avaliable in your pc
        all: false,
    };
    await dns.lookup(hostname, options, (err, address, family) => {
        pc_addr = address || "None pc addr"
        family_addr = family ? ("IPv"+family) : "None IPvX family"
        // console.log('address: %j family: IPv%s', address, family);
    })
    
    // Server remote IP Address
    const ip_addrs = req.socket.remoteAddress || req.headers['x-forwarded-for'] || "None remoteAddress?"
    
    // Fuente: https://stackoverflow.com/questions/10849687/express-js-how-to-get-remote-client-address
    // Client IP Address
    const proxy_ip_addrs = req.headers['x-forwarded-for'] || "None proxy addr" // For proxy ip's
    var proxy_domain_name = ""

    let is_vpn = ""
    let isp_name = ""
    let timezone_name = ""
    let usr_city = ""

    if(proxy_ip_addrs != "None proxy addr") {
        dns.lookup(proxy_ip_addrs, options, (err, address, family) => {
            if (show)
                console.log('Proxy IP Address - address: %j family: IPv%s', address, family);
        })

        // Fuente: https://stackoverflow.com/questions/42151493/how-to-get-client-computer-name-in-node-js
        // Fuente: https://stackoverflow.com/questions/65073538/limit-execution-time-of-await-dns-reverse-function-js
        const timeout = (delay, message) => new Promise((_, reject) => setTimeout(reject, delay, message));
        const delay = 10000;
        var host = ""
        try {
            // proxy_ip_addrs = 186.66.23.15
            // Client hostname
            host = await Promise.race([dns.reverse(proxy_ip_addrs, function(err, domains) {
                proxy_domain_name = domains || "None client name"
            }), timeout(delay, `DNS resolution timed out after ${delay} ms`)]);
            // console.log("host:",host);
        }
        catch (e) {
            if (show)
                console.error(e);
        }


        const axios = require('axios')
    
        // Sin &ip_address devuelve los datos de conexión
        // del server en el que la app se ejecuta
        const abstract_process =
        await axios.get(`https://ipgeolocation.abstractapi.com/v1/`
                        +`?api_key=${process.env.Abstract_APIKEY}`
                        +`&ip_address=${proxy_ip_addrs}`)
        .then(response => {
            data = response.data

            if (show) 
                console.log(response.data);

            is_vpn = data["security"]["is_vpn"]
            isp_name = data["connection"]["isp_name"]
            timezone_name = data["timezone"]["name"]
            usr_city = data["city"] || "ARN???"

        })
        .catch(error => {
            if (show)
                console.log(error);
        });

        try {
            // Otra forma de usar que funciona, ahora usando timeout
            await Promise.race([abstract_process, 
                timeout(delay, `DNS resolution timed out after ${delay} ms`)]);

            // await Promise.race([abstract_process]);
        }
        catch (e) {
            if (show)
                console.error(e);
        }

    }


    const moment = require("moment");
    const dt_string = moment().format("DD-MM-YYYY HH:mm:ss") // 24 Hour format


    // Se muestran los datos y se envían
    var http = require('http');

    // Obtiene la ip pública del servidor
    try {
        http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, function(resp) {
            resp.on('data', function(public_ip) {
                if (show) {
                    console.log("Your Computer Name is:",hostname)
                    console.log("Your Computer/Server IP Address is:",pc_addr)
                    console.log("Your IP Address family is:",family_addr)
                    console.log(`My public IP address is: ${public_ip}`)
                    console.log("My remote IP Address is:",ip_addrs)
                    console.log("User/Client proxy IP Address is:",proxy_ip_addrs)
                    console.log("User/Client domain name is:",proxy_domain_name)
                    console.log("Page checked at",dt_string) // 28-06-2022 10:08:59
                    console.log("Is User using VPN? is_vpn:",is_vpn);
                    console.log("User city:",usr_city);
                    console.log("User IPS name:",isp_name);
                }

                const emp = {
                    "entidad": entidad,
                    "origen_request": origen_request,
                    "hostname": hostname,
                    "ip_addr": pc_addr,
                    "remote_ip_addr": ip_addrs,
                    "public_ip_addr": public_ip.toString(), // sin toString() <Buffer 31 38 36 2e 36 36 2e 32 33 2e 31 35>
                    "proxy_ip_addr": proxy_ip_addrs,
                    "proxy_domain_name": proxy_domain_name,
                    "is_vpn": is_vpn,
                    "isp_name": isp_name,
                    "usr_city": usr_city,
                    "checked_time": dt_string,
                }
    
                controller.validate_user( emp )

                    // .then((data) => response.success(req, res, data))
                    // .catch((error) => response.error(req, res, error) )
    
            });
        });
    }
    catch (e) {
        if (show)
            console.error(e);
    }
    
}

// #endregion


// #endregion




module.exports = {
    verificar_empleado: validate_employee,
    validar: validate_user,
    verificar: verifyToken,
}
