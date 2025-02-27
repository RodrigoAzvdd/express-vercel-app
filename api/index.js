const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const path = require('path');

// Configuração CORS
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

// Middleware para analisar JSON
app.use(express.json());

// Configuração do Swagger adaptada para Vercel
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Verificação de NCM',
            version: '1.0.0',
            description: 'API para validar códigos NCM usando dados do SISCOMEX',
            contact: {
                name: 'Suporte'
            }
        },
        servers: [
            {
                url: '/', // Usa URL relativa para funcionar na Vercel
                description: 'Servidor de produção'
            }
        ]
    },
    apis: ['./index.js'] // Certifique-se que este é o nome correto do seu arquivo principal
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Servir a documentação Swagger na rota principal
app.get('/', (req, res) => {
    res.redirect('/api-docs');
});

/**
 * @swagger
 * /ping:
 *   get:
 *     summary: Verifica se a API está funcionando
 *     description: Retorna "pong" para confirmar que a API está online
 *     responses:
 *       200:
 *         description: Resposta bem-sucedida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: pong
 */
app.get('/ping', (req, res) => {
    res.json({
        message: 'pong'
    });
});

/**
 * @swagger
 * /ncm:
 *   post:
 *     summary: Verifica a validade de um código NCM
 *     description: Verifica se o código NCM fornecido é válido de acordo com os dados do SISCOMEX
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo
 *             properties:
 *               codigo:
 *                 type: string
 *                 description: O código NCM a ser verificado
 *                 example: "01012100"
 *     responses:
 *       200:
 *         description: Resultado da verificação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valido:
 *                   type: boolean
 *                   description: Indica se o NCM é válido
 *                 mensagem:
 *                   type: string
 *                   description: Mensagem sobre o resultado da verificação
 *                 descricao:
 *                   type: string
 *                   description: Descrição do NCM (se for válido)
 *       500:
 *         description: Erro ao verificar o NCM
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valido:
 *                   type: boolean
 *                   example: false
 *                 mensagem:
 *                   type: string
 *                   example: Erro ao verificar NCM
 *                 erro:
 *                   type: string
 *                   description: Detalhes do erro
 */
app.post('/ncm', (req, res) => {
    const { codigo } = req.body;

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

// Para a Vercel, precisamos exportar a aplicação usando module.exports
module.exports = app;

// // Se precisarmos iniciar em ambiente local
// if (process.env.NODE_ENV !== 'production') {
//     const PORT = process.env.PORT || 3000;
//     app.listen(PORT, () => {
//         console.log(`Servidor rodando na porta ${PORT}`);
//     });
// }