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
                "tags": ["TESTE"],
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
                "summary": "Verifica a validade de um código NCM (via body)",
                "description": "Verifica se o código NCM fornecido no corpo da requisição é válido",
                "tags": ["NCM"],
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
                                        "example": "0306.93.00"
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
                                        "codigo": {
                                            "type": "string",
                                            "description": "Código do NCM"
                                        },
                                        "descricao": {
                                            "type": "string",
                                            "description": "Descrição do NCM (se for válido)"
                                        },
                                        "data_inicio": {
                                            "type": "string",
                                            "description": "Data de início da vigência"
                                        },
                                        "data_fim": {
                                            "type": "string",
                                            "description": "Data de fim da vigência"
                                        },
                                        "tipo_ato_ini": {
                                            "type": "string",
                                            "description": "Tipo do ato de início"
                                        },
                                        "numero_ato_ini": {
                                            "type": "string",
                                            "description": "Número do ato de início"
                                        },
                                        "ano_ato_ini": {
                                            "type": "string",
                                            "description": "Ano do ato de início"
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
        },
        "/ncm/{codigo}": {
            "get": {
                "summary": "Verifica a validade de um código NCM (via parâmetro)",
                "description": "Verifica se o código NCM fornecido como parâmetro de URL é válido",
                "tags": ["NCM"],
                "parameters": [
                    {
                        "in": "path",
                        "name": "codigo",
                        "required": true,
                        "description": "Código NCM a ser verificado",
                        "schema": {
                            "type": "string"
                        },
                        "example": "0306.93.00"
                    }
                ],
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
                                        "codigo": {
                                            "type": "string",
                                            "description": "Código do NCM"
                                        },
                                        "descricao": {
                                            "type": "string",
                                            "description": "Descrição do NCM (se for válido)"
                                        },
                                        "data_inicio": {
                                            "type": "string",
                                            "description": "Data de início da vigência"
                                        },
                                        "data_fim": {
                                            "type": "string",
                                            "description": "Data de fim da vigência"
                                        },
                                        "tipo_ato_ini": {
                                            "type": "string",
                                            "description": "Tipo do ato de início"
                                        },
                                        "numero_ato_ini": {
                                            "type": "string",
                                            "description": "Número do ato de início"
                                        },
                                        "ano_ato_ini": {
                                            "type": "string",
                                            "description": "Ano do ato de início"
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
        },
        "/ncm/": {
            "get": {
                "summary": "Obter todos os NCMs disponíveis",
                "description": "Retorna todos os dados de NCM disponíveis no SISCOMEX",
                "tags": ["NCM"],
                "responses": {
                    "200": {
                        "description": "Lista de NCMs",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "Nomenclaturas": {
                                            "type": "array",
                                            "items": {
                                                "type": "object",
                                                "properties": {
                                                    "Codigo": {
                                                        "type": "string"
                                                    },
                                                    "Descricao": {
                                                        "type": "string"
                                                    },
                                                    "Data_Inicio": {
                                                        "type": "string"
                                                    },
                                                    "Data_Fim": {
                                                        "type": "string"
                                                    },
                                                    "Tipo_Ato_Ini": {
                                                        "type": "string"
                                                    },
                                                    "Numero_Ato_Ini": {
                                                        "type": "string"
                                                    },
                                                    "Ano_Ato_Ini": {
                                                        "type": "string"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Erro ao buscar NCMs",
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

// Exportar o app para a Vercel
module.exports = app;
