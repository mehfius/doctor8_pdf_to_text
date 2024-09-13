const fs = require('fs');
const pdf = require('pdf-parse');
const { get_prompt } = require("./supabase/get_prompt");

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
        
        const prompt = await get_prompt();

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

                    r = await response;

                    if(r.status == 200){

                        const IAServerResponse = await r.json();    

                        let JsonIAServerResponse = JSON.parse(IAServerResponse.response);

                        objItem.push(
                            { 
                                ...JsonIAServerResponse,
                                filename: item.filename,
                                users: json.users,
                                prontuarios: json.prontuarios,
                                pdf: pageTexts[i]
                            }
                        );

                        console.log("IA JSON no formato correto, chaves encontradas: ", Object.keys(JsonIAServerResponse).length);

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
