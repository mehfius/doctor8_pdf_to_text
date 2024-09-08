const { createClient } = require("@supabase/supabase-js");

const get_prompt = async function () {
    const supabase = createClient(process.env.URL, process.env.KEY);

    try {

        let { data, error} = await supabase
        .from('suites_config')
        .select('url')
        .eq('label', 'prompt_pdf_to_ia');

        return data[0].url;

    } catch (error) {

        console.error('Erro ao processar atualização:', error.message);
        throw error;
        
    }
};

module.exports = { get_prompt };
