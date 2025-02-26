# express-vercel-app

Aplicação Express hospedada na Vercel.

## Endpoints da API

### Endpoint Base:
```
https://express-server-self-phi.vercel.app/
```

### Endpoint POST - Buscar NCM
**Validação de código NCM.**

- **URL:**
  ```
  https://express-server-self-phi.vercel.app/ncm
  ```
- **Método:** `POST`
- **Cabeçalhos:**
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Corpo da Requisição:**
  ```json
  {
    "codigo": "0306.93.00"
  }
  ```

## Exemplo de Uso

### Requisição via Fetch API (JavaScript):
```javascript
fetch('https://express-server-self-phi.vercel.app/ncm', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        codigo: "0306.93.00"
    })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erro:', error));
```