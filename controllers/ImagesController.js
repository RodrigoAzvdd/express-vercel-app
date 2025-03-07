module.exports = {
    async compareFaces(req, res) {

        const { imagem1, imagem2 } = req.body

        fetch('https://prod-27.brazilsouth.logic.azure.com:443/workflows/3854da61058b44aa9e5e466d3743beb1/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Xl9vvSmw2K2CAJP0QP_aunHpO9-5I8fewFEDLKGHaXA', {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                imagem1: imagem1,
                imagem2: imagem2
            })
                .then(response => response.json())
                .then(data => {
                    res.json(data);
                })
                .catch(error => res.json(error))
        })
    },
    async get(req, res) {
        res.json({ message: "TESTE" })

    }

}