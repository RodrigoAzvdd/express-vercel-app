const app = require('express')
const ncmController = require('../controllers/NcmController')
const Router = app.Router()

Router.get('/', ncmController.getAll)
Router.get('/:codigo', ncmController.getNcmByCodeParam)
Router.post('/', ncmController.getNcmByCode)

module.exports = Router