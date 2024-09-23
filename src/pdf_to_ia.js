const fs = require('fs');
const pdf = require('pdf-parse');

const { fetch_ia } = require("./fetch_ia");

const pdf_to_ia = async function (json) {

    let obj = [];
 
    for (const item of json.files) {        

        const dataBuffer = fs.readFileSync(`./temp/${item.filename}`);

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

        let objItem = [];

        for (let i = 0; i < pageTexts.length; i++) {
            let success = false;
        
            while (!success) {
                try {                         

                    r = await fetch_ia(pageTexts[i]);
                    
                    if(r.status == 200){

                        const IAServerResponse = await r.json();    

                        let JsonIAServerResponse = JSON.parse(IAServerResponse.response);
           
                        const chavesParaVerificar = ['conclusao', 'label'];

                        // Verifica se JsonIAServerResponse é um array
                        if (!Array.isArray(JsonIAServerResponse)) {
                            JsonIAServerResponse = [JsonIAServerResponse]; // Converte para array se não for
                        }

                        // Verifica cada objeto no array
                        for (const objeto of JsonIAServerResponse) {
                            for (const chave of chavesParaVerificar) {
                                if (!objeto.hasOwnProperty(chave)) {
                                    throw new Error(`A chave '${chave}' é obrigatória, mas não foi encontrada em um dos objetos.`);
                                }
                            }

                            objItem.push({
                                ...objeto,
                                filename: item.filename,
                                prontuarios: json.prontuarios,
                                pdf: pageTexts[i],
                                pdf_page: i
                            });
                        }

                        console.log("IA JSON no formato correto, objetos processados: ", JsonIAServerResponse.length);

                    } else {

                        console.error('Ngrok Offline');

                    }                   
        
                    success = true;
        
                } catch (error) {
                    
                    console.error("IA não conseguiu gerar JSON corretamente: ", error.message);
                    console.error(error.message)

               }
            }
        }        

        obj = obj.concat(objItem);
    }

    return obj;
};

module.exports = { pdf_to_ia };
