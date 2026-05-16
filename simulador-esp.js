const API_URL = 'http://localhost:3000/atualizar-dados';

const leiturasApresentacao = [
    {
        temperatura: 24.5,
        umidade: 58.0,
        descricao: 'Ambiente normal'
    },
    {
        temperatura: 25.2,
        umidade: 56.4,
        descricao: 'Leve variação normal'
    },
    {
        temperatura: 26.1,
        umidade: 54.8,
        descricao: 'Condição estável'
    },
    {
        temperatura: 31.2,
        umidade: 39.5,
        descricao: 'Situação de atenção'
    },
    {
        temperatura: 27.0,
        umidade: 51.3,
        descricao: 'Ambiente normalizado'
    }
];

let indice = 0;

async function enviarDados() {
    const leitura = leiturasApresentacao[indice];

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                temperatura: leitura.temperatura,
                umidade: leitura.umidade
            })
        });

        const dados = await resposta.json();

        console.log('-----------------------------------');
        console.log(`Modo apresentação: ${leitura.descricao}`);
        console.log(`Temperatura enviada: ${leitura.temperatura} °C`);
        console.log(`Umidade enviada: ${leitura.umidade}%`);
        console.log(`Resposta do backend: ${dados.mensagem}`);

        indice++;

        if (indice >= leiturasApresentacao.length) {
            indice = 0;
        }

    } catch (error) {
        console.error('Erro ao enviar dados:', error.message);
    }
}

console.log('Simulador ESP iniciado em modo apresentação...');
console.log('Enviando dados para:', API_URL);

enviarDados();
setInterval(enviarDados, 5000);