const fs = require('fs');
const path = require('path');
const https = require('https');
const pdf = require('pdf-parse');

const pdf_to_ia = async function (json) {
    let obj = [];
 
    for (const item of json.files) {
        const filePath = `./temp/${item.filename}`;
        const dataBuffer = fs.readFileSync(filePath);

        const pageTexts = [];

        const options = {
            pagerender: (pageData) => {
                return pageData.getTextContent().then(textContent => {
                    let pageText = textContent.items.map(item => item.str).join(' ');
                    pageText = pageText.replace(/[^\x20-\x7E]/g, '');
                    pageTexts.push(pageText);
                    return pageText;
                });
            }
        };

        await pdf(dataBuffer, options);

        //const prompt = "Instrução: Faça a conclusão do exame laboratorial informando a condição do paciente. Informação do exame: \n ";

        const prompt = `
            Monte 1 objeto json neste formato: 
            {
                "data" : "coloque aqui o dia que o exame foi realizado",
                "nome": "coloque aqui o nome do paciente com palavras no formato Title Case",
                "conclusao":  "coloque aqui a conclusao do exame e que nao seja muito tecnica que informe se o resultado é o esperado para ser saudavel",
                "label": "coloque aqui o nome ou tipo do exame com palavras no formato de texto Title Case",
                "alerta": "preencha aqui como true ou false se o exame merece atencao, pois nao esta com o resultado esperado",
                "laboratorio": "nome do laboratorio, se não reconhecer alguma palavra coloque null como resposta"
            }
            Serão apenas essas chaves nao invente outras chaves.
            Você costuma responder no inicio informacoes que eu nao preciso por exemplo "aqui esta o seu resultado".
            Toda sua resposta deve se limitar ao formato do objeto que pedi acima.
            Esses sao os dados a ser analisado: `;

        let objItem = [];

        for (let i = 0; i < pageTexts.length; i++) {
            let success = false;
        
            while (!success) {
                try {
                    const response = await fetch('https://open-pumped-lacewing.ngrok-free.app/api/generate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: "llama3.1",
                            prompt: `${prompt} : ${pageTexts[i]}`,
                            stream: false,
                            temperature: 0.3
                        })
                    });
        
                    const IAServerResponse = await response.json();
        
                    let JsonIAServerResponse = JSON.parse(IAServerResponse.response);
                    objItem.push({ ...JsonIAServerResponse, filename: item.filename, users: json.users, prontuarios: json.prontuarios, pdf: pageTexts[i] });
                    console.log("JSON parseado com sucesso, chaves encontradas:", Object.keys(JsonIAServerResponse).length);
        
                    success = true; // Sai do loop `while` se tudo deu certo
        
                } catch (error) {
                    console.error("Erro ao parsear JSON ou na requisição:", error.message);
 
        
                    // Aqui você pode adicionar uma lógica para limitar as tentativas ou esperar um tempo antes de tentar novamente
                }
            }
        }
        

        obj = obj.concat(objItem);
    }

    return obj;
};

module.exports = { pdf_to_ia };
