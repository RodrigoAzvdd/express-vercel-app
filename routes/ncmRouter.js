const app = require('express')
const ncmController = require('../controllers/NcmController')
const authMiddleware = require('../middlewares/authMiddleware.js')
const Router = app.Router()

Router.get('/', authMiddleware.authenticateJWT, ncmController.getAll)
Router.post('/', authMiddleware.authenticateJWT, ncmController.getNcmByCode)
Router.get('/:codigo', authMiddleware.authenticateJWT, ncmController.getNcmByCodeParam)

module.exports = Router