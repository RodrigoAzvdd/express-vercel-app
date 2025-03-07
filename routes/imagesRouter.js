const app = require('express')
const imageController = require('../controllers/ImagesController.js')
const authMiddleware = require('../middlewares/authMiddleware.js')
const Router = app.Router()

Router.post('/', authMiddleware.authenticateJWT, imageController.compareFaces)
Router.get('/', authMiddleware.authenticateJWT, imageController.get)

module.exports = Router
