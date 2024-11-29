const { get_prompt } = require("./supabase/get_prompt");

const fetch_ia = async function (text) {

    try {
        
        const prompt = await get_prompt();
        
        const response = await fetch('https://open-pumped-lacewing.ngrok-free.app/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama3.1",
                prompt: `${prompt} : ${text}`,
                stream: false,
                temperature: 0.3
            })
        });   

        return await response;

    } catch (error) {

        console.error('Erro fetch IA:', error.message);
        throw error;
        
    }
};

module.exports = { fetch_ia };
