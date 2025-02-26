const express = require('express');
const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // Responder às requisições OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).send();
    }

    next();
});


// Importante: adicionar middleware para analisar JSON no corpo da requisição
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello from Express on Vercel!');
});

app.post('/ncm', (req, res) => {
    const { codigo } = req.body; // Usando req.query em vez de req.body para GET requests

    if (!codigo) {
        return res.json({ valido: false, mensagem: "Código NCM não fornecido" });
    }

    fetch('https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json')
        .then(response => response.json())
        .then(data => {
            // Verificar se o NCM existe nos dados
            const ncmValido = data.Nomenclaturas.find(item => item.Codigo === String(codigo));

            if (ncmValido) {
                res.json({
                    valido: true,
                    mensagem: "NCM válido",
                    descricao: ncmValido.Descricao || "Sem descrição disponível"
                });
            } else {
                res.json({
                    valido: false,
                    mensagem: "NCM inválido"
                });
            }
        })
        .catch(error => {
            console.error('Erro ao buscar o JSON:', error);
            res.status(500).json({
                valido: false,
                mensagem: "Erro ao verificar NCM",
                erro: error.message
            });
        });
});

module.exports = app;
