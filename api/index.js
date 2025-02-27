const express = require('express');
const app = express();
const ncmRouter = require('../routes/ncmRouter')
const path = require('path');
const fs = require('fs');

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

// Definição da documentação Swagger
const swaggerDocument = {
    "openapi": "3.0.0",
    "info": {
        "title": "API de Verificação de NCM",
        "version": "1.0.0",
        "description": "API para validar códigos NCM usando dados do SISCOMEX"
    },
    "servers": [
        {
            "url": "/",
            "description": "Servidor atual"
        }
    ],
    "paths": {
        "/ping": {
            "get": {
                "summary": "Verifica se a API está funcionando",
                "description": "Retorna \"pong\" para confirmar que a API está online",
                "responses": {
                    "200": {
                        "description": "Resposta bem-sucedida",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "message": {
                                            "type": "string",
                                            "example": "pong"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/ncm": {
            "post": {
                "summary": "Verifica a validade de um código NCM",
                "description": "Verifica se o código NCM fornecido é válido de acordo com os dados do SISCOMEX",
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["codigo"],
                                "properties": {
                                    "codigo": {
                                        "type": "string",
                                        "description": "O código NCM a ser verificado",
                                        "example": "01012100"
                                    }
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Resultado da verificação",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "valido": {
                                            "type": "boolean",
                                            "description": "Indica se o NCM é válido"
                                        },
                                        "mensagem": {
                                            "type": "string",
                                            "description": "Mensagem sobre o resultado da verificação"
                                        },
                                        "descricao": {
                                            "type": "string",
                                            "description": "Descrição do NCM (se for válido)"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Erro ao verificar o NCM",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "valido": {
                                            "type": "boolean",
                                            "example": false
                                        },
                                        "mensagem": {
                                            "type": "string",
                                            "example": "Erro ao verificar NCM"
                                        },
                                        "erro": {
                                            "type": "string",
                                            "description": "Detalhes do erro"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

// Servir especificação Swagger como JSON
app.get('/swagger.json', (req, res) => {
    res.json(swaggerDocument);
});

// Servir a interface Swagger UI estática na rota principal
app.get('/', (req, res) => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>API de Verificação de NCM - Documentação</title>
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: "/swagger.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "BaseLayout"
      });
      window.ui = ui;
    };
  </script>
</body>
</html>
  `;
    res.send(htmlContent);
});

// Rota ping
app.get('/ping', (req, res) => {
    res.json({
        message: 'pong'
    });
});

app.use('/ncm', ncmRouter)

// Rota para verificar NCM
// app.post('/ncm', (req, res) => {
//     const { codigo } = req.body;

//     if (!codigo) {
//         return res.json({ valido: false, mensagem: "Código NCM não fornecido" });
//     }

//     fetch('https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json')
//         .then(response => response.json())
//         .then(data => {
//             // Verificar se o NCM existe nos dados
//             const ncmValido = data.Nomenclaturas.find(item => item.Codigo === String(codigo));

//             if (ncmValido) {
//                 res.json({
//                     valido: true,
//                     mensagem: "NCM válido",
//                     descricao: ncmValido.Descricao || "Sem descrição disponível"
//                 });
//             } else {
//                 res.json({
//                     valido: false,
//                     mensagem: "NCM inválido"
//                 });
//             }
//         })
//         .catch(error => {
//             console.error('Erro ao buscar o JSON:', error);
//             res.status(500).json({
//                 valido: false,
//                 mensagem: "Erro ao verificar NCM",
//                 erro: error.message
//             });
//         });
// });

// Exportar o app para a Vercel
module.exports = app;

// Se precisar iniciar em ambiente local
// if (process.env.NODE_ENV !== 'production') {
//     const PORT = process.env.PORT || 3000;
//     app.listen(PORT, () => {
//         console.log(`Servidor rodando na porta ${PORT}`);
//     });
// }