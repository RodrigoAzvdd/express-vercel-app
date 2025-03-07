const jwt = require('jsonwebtoken');

module.exports = {
    async authenticateJWT(req, res, next) {
        const token = req.header('Authorization')?.split(' ')[1];

        if (!token) return res.sendStatus(403);

        jwt.verify(token, process.env.AUTH_TOKEN, (err, user) => {
            if (err) return res.sendStatus(403);
            req.user = user;
            next();
        });
    }
}