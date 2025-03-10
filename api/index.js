const express = require('express');
const app = express();
const ncmRouter = require('../routes/ncmRouter')
const imageRouter = require('../routes/imagesRouter')
const helmet = require('helmet')
const path = require('path');
const fs = require('fs');

app.use(helmet())

// app.use((req, res, next) => {
//     res.setHeader("Content-Security-Policy", `
//         default-src 'self';
//         script-src 'self' https://cdn.jsdelivr.net;
//         style-src 'self' https://cdn.jsdelivr.net;
//         object-src 'none';
//         connect-src 'self';
//         font-src 'self' https://fonts.googleapis.com;
//         img-src 'self' data:;
//     `);
//     next();
// });

// IP permitido
const allowedIP = "200.253.9.130";

app.use((req, res, next) => {
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    console.log("IP do cliente:", clientIP); // Para debug

    if (!clientIP.includes(allowedIP)) {
        return res.status(403).json({ message: "Acesso negado" });
    }

    next();
});

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
    "components": {
        "securitySchemes": {
            "bearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
                "description": "Token de autenticação"
            }
        }
    },
    "security": [
        {
            "bearerAuth": []
        }
    ],
    "paths": {
        "/ping": {
            "get": {
                "summary": "Verifica se a API está funcionando",
                "description": "Retorna \"pong\" para confirmar que a API está online",
                "tags": [
                    "TESTE"
                ],
                "security": [
                    {
                        "bearerAuth": []
                    }
                ],
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
                    },
                    "401": {
                        "description": "Não autorizado - Token inválido ou ausente",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "error": {
                                            "type": "string",
                                            "example": "Token de autenticação necessário"
                                        },
                                        "message": {
                                            "type": "string",
                                            "example": "A requisição não pôde ser processada porque um token de autenticação válido não foi fornecido"
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
                "tags": [
                    "NCM"
                ],
                "security": [
                    {
                        "bearerAuth": []
                    }
                ],
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": [
                                    "codigo"
                                ],
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
                    "401": {
                        "description": "Não autorizado - Token inválido ou ausente",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "error": {
                                            "type": "string",
                                            "example": "Token de autenticação necessário"
                                        },
                                        "message": {
                                            "type": "string",
                                            "example": "A requisição não pôde ser processada porque um token de autenticação válido não foi fornecido"
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
                "tags": [
                    "NCM"
                ],
                "security": [
                    {
                        "bearerAuth": []
                    }
                ],
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
                    "401": {
                        "description": "Não autorizado - Token inválido ou ausente",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "error": {
                                            "type": "string",
                                            "example": "Token de autenticação necessário"
                                        },
                                        "message": {
                                            "type": "string",
                                            "example": "A requisição não pôde ser processada porque um token de autenticação válido não foi fornecido"
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
                "tags": [
                    "NCM"
                ],
                "security": [
                    {
                        "bearerAuth": []
                    }
                ],
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
                    "401": {
                        "description": "Não autorizado - Token inválido ou ausente",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "error": {
                                            "type": "string",
                                            "example": "Token de autenticação necessário"
                                        },
                                        "message": {
                                            "type": "string",
                                            "example": "A requisição não pôde ser processada porque um token de autenticação válido não foi fornecido"
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
        },
        "/compareImages": {
            "post": {
                "summary": "Compara duas imagens",
                "description": "Compara duas imagens e retorna um resultado de semelhança. Suporta múltiplos formatos de envio (JSON com Base64, FormData com arquivos ou URLs)",
                "tags": [
                    "Imagem"
                ],
                "security": [
                    {
                        "bearerAuth": []
                    }
                ],
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "image1": {
                                        "type": "string",
                                        "description": "Primeira imagem codificada em base64 ou URL da imagem",
                                        "example": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAUDBAQEAwUE..."
                                    },
                                    "image2": {
                                        "type": "string",
                                        "description": "Segunda imagem codificada em base64 ou URL da imagem",
                                        "example": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAUDBAQEAwUE..."
                                    },
                                    "formato": {
                                        "type": "string",
                                        "description": "Formato de envio das imagens",
                                        "enum": ["base64", "url"],
                                        "default": "base64"
                                    }
                                },
                                "required": ["image1", "image2"]
                            }
                        },
                        "multipart/form-data": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "image1": {
                                        "type": "string",
                                        "format": "binary",
                                        "description": "Arquivo da primeira imagem para comparação"
                                    },
                                    "image2": {
                                        "type": "string",
                                        "format": "binary",
                                        "description": "Arquivo da segunda imagem para comparação"
                                    }
                                },
                                "required": ["image1", "image2"]
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Resultado da comparação de imagens",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "same_person": {
                                            "type": "boolean",
                                            "description": "Indica se as imagens representam a mesma pessoa"
                                        },
                                        "similarity_degree": {
                                            "type": "number",
                                            "format": "float",
                                            "description": "Nível de semelhança entre as imagens (0-1)",
                                            "example": 0.87
                                        },
                                        "confidence": {
                                            "type": "number",
                                            "format": "float",
                                            "description": "Nível de confiança da comparação (0-1)",
                                            "example": 0.95
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Requisição inválida",
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
                                            "example": "Formato de imagem inválido ou não suportado"
                                        },
                                        "erro": {
                                            "type": "string",
                                            "description": "Detalhes do erro"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "401": {
                        "description": "Não autorizado - Token inválido ou ausente",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "error": {
                                            "type": "string",
                                            "example": "Token de autenticação necessário"
                                        },
                                        "message": {
                                            "type": "string",
                                            "example": "A requisição não pôde ser processada porque um token de autenticação válido não foi fornecido"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Erro ao comparar imagens",
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
                                            "example": "Erro ao comparar imagens"
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
}

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

app.use('/compareImages', imageRouter)

// Exportar o app para a Vercel
module.exports = app;
