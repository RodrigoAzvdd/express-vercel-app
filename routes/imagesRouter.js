const app = require('express')
const imageController = require('../controllers/ImagesController.js')
const Router = app.Router()

Router.post('/', imageController.compareFaces)
Router.get('/', imageController.get)

module.exports = Router
