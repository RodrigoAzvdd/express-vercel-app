module.exports = {
    async getAll(req, res) {

        fetch('https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json')
            .then(response => response.json())
            .then(data => {
                // Verificar se o NCM existe nos dados
                if (data) {
                    return res.json(data)
                } else {
                    throw new Error('Nenhum NCM encontrado. ', data)
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
    },

    async getNcmByCode(req, res) {

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
                        codigo: ncmValido.Codigo,
                        descricao: ncmValido.Descricao || "Sem descrição disponível",
                        data_inicio: ncmValido.Data_Inicio,
                        data_fim: ncmValido.Data_Fim,
                        tipo_ato_ini: ncmValido.Tipo_Ato_Ini,
                        numero_ato_ini: ncmValido.Numero_Ato_Ini,
                        ano_ato_ini: ncmValido.Ano_Ato_Ini
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
    },

    async getNcmByCodeParam(req, res) {

        const { codigo } = req.params;

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
                        codigo: ncmValido.Codigo,
                        descricao: ncmValido.Descricao || "Sem descrição disponível",
                        data_inicio: ncmValido.Data_Inicio,
                        data_fim: ncmValido.Data_Fim,
                        tipo_ato_ini: ncmValido.Tipo_Ato_Ini,
                        numero_ato_ini: ncmValido.Numero_Ato_Ini,
                        ano_ato_ini: ncmValido.Ano_Ato_Ini
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
    }
}