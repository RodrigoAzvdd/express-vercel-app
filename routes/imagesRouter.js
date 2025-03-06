const app = require('express')
const imageController = require('../controllers/ImagesController.js')
const Router = app.Router()

Router.post('/', imageController.compareFaces)

module.exports = Router
