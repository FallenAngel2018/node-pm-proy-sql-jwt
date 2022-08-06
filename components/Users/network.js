
const express = require('express')
const controller = require('./controller')
const method = require('./other_methods')
const response = require('../../network/response')

const routes = express.Router()

// #region Complementary methods

require("dotenv").config();
const entidad = "Users"

routes.get('/get_usrs', function(req, res) {
    const filtroUsr = req.body.usr_pc_name || req.query.usr_pc_name || null
    method.validar(req, res, entidad, "/get_usrs")

    controller.obtenerUsrs( filtroUsr )
        .then((data) => response.success(req, res, data, response.success_message()))
        .catch((error) => response.error(req, res, error) )
})

// endregion


module.exports = routes