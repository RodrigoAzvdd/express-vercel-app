const express = require('express');
const app = express();

// Vercel automaticamente define a variável de ambiente `PORT`
const port = process.env.PORT || 3000; // Porta 3000 como fallback

app.get('/', (req, res) => {
    res.send('Hello from Express on Vercel!');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


module.exports = app;
