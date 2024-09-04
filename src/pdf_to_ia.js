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

        const prompt = "Instrução: Faça a conclusão do exame laboratorial informando a condição do paciente. Informação do exame: \n ";

        let objItem = [];

        for (let i = 0; i < pageTexts.length; i++) {
            const response = await fetch('https://739e-45-163-147-247.ngrok-free.app/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "llama3.1",
                    prompt: `${prompt} : ${pageTexts[i]}`,
                    stream: false,
                    temperature: 0.5
                })
            });

            const jsonResponse = await response.json();
            objItem.push({ "analise": jsonResponse.response });
        }

        obj = obj.concat(objItem);
    }

    return obj;
};

module.exports = { pdf_to_ia };
