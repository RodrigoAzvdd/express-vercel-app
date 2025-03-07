const jwt = require('jsonwebtoken');

module.exports = {
    async authenticateJWT(req, res, next) {
        const token = req.header('Authorization')?.split(' ')[1];

        if (!token) return (
            res.json({
                "error": "Token de autenticação necessário",
                "message": "A requisição não pôde ser processada porque um token de autenticação válido não foi fornecido. Por favor, inclua um token de autorização no cabeçalho 'Authorization' da sua requisição."
            })
        );

        if (token == process.env.AUTH_TOKEN) {
            next();
        }

        // jwt.verify(token, process.env.AUTH_TOKEN, (err, user) => {
        //     if (err) return res.sendStatus(403);
        //     req.user = user;
        //     next();
        // });
    }
}