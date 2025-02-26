# express-vercel-app

## Endpoint API:
- `https://express-server-self-phi.vercel.app/`

## Endpoint POST - Buscar NCM - VALIDAÇÃO:
- `https://express-server-self-phi.vercel.app/ncm`
- `body: { codigo: '0306.93.00' }`

## Exemplo de uso:

fetch('https://express-server-self-phi.vercel.app/ncm', {
    headers: {
        'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
        codigo: "0306.93.00"
    })
}).then(response => response.json())
    .then(data => console.log(data))