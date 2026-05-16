const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// dados iniciais
let temperaturaAtual = 25.0;
let umidadeAtual = 60.0;
let statusAtual = 'normal';
let ultimaAtualizacao = 'Aguardando primeira leitura externa';

// historico
let historico = [];

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//calcular status do ambiente
function calcularStatus(temperatura, umidade) {
    if (temperatura >= 30 || umidade <= 40) {
        return 'atenção';
    }

    return 'normal';
}

//registrar histórico
function registrarLeitura(temperatura, umidade, origem = 'desconhecida') {
    statusAtual = calcularStatus(temperatura, umidade);
    ultimaAtualizacao = new Date().toLocaleString('pt-BR');

    const leitura = {
        temperatura,
        umidade,
        status: statusAtual,
        origem,
        dataHora: ultimaAtualizacao
    };

    historico.push(leitura);

    // ultimas leituras
    if (historico.length > 20) {
        historico.shift();
    }

    console.log(
        `Leitura recebida (${origem}) -> Temperatura: ${temperatura} °C | Umidade: ${umidade}% | Status: ${statusAtual}`
    );

    return leitura;
}

registrarLeitura(temperaturaAtual, umidadeAtual, 'inicial');

// pagina principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// rota para a Alexa
app.get('/dados', (req, res) => {
    res.json({
        temperatura: temperaturaAtual,
        umidade: umidadeAtual,
        status: statusAtual,
        ultimaAtualizacao
    });
});

// rota temperatura
app.get('/temperatura', (req, res) => {
    res.json({
        temperatura: temperaturaAtual
    });
});

// rota umidade
app.get('/umidade', (req, res) => {
    res.json({
        umidade: umidadeAtual
    });
});

// rota histórico
app.get('/historico', (req, res) => {
    res.json(historico);
});

// rota status
app.get('/status', (req, res) => {
    res.json({
        status: statusAtual,
        ultimaAtualizacao
    });
});

// rota dados do pelo ESP8266 / wokwi / simulador
app.post('/atualizar-dados', (req, res) => {
    const { temperatura, umidade } = req.body;

    if (temperatura === undefined || umidade === undefined) {
        return res.status(400).json({
            erro: 'Os campos temperatura e umidade são obrigatórios.'
        });
    }

    const temperaturaConvertida = Number(temperatura);
    const umidadeConvertida = Number(umidade);

    if (Number.isNaN(temperaturaConvertida) || Number.isNaN(umidadeConvertida)) {
        return res.status(400).json({
            erro: 'Temperatura e umidade devem ser valores numéricos.'
        });
    }

    temperaturaAtual = temperaturaConvertida;
    umidadeAtual = umidadeConvertida;

    const leitura = registrarLeitura(
        temperaturaAtual,
        umidadeAtual,
        'ESP8266/Wokwi'
    );

    res.json({
        mensagem: 'Dados atualizados com sucesso.',
        dados: leitura
    });
});

//servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});