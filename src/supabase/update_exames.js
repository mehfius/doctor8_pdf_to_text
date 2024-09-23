const { createClient } = require("@supabase/supabase-js");

const update_exames = async function (json) {

    const supabase = createClient(process.env.URL, process.env.KEY);

    try {

        const results = [];       

        await supabase
        .from('exames')
        .delete()
        .match({ prontuarios: json[0].prontuarios })      
      
        for (const item of json) {            
          
            const { data, error } = await supabase
                .from('exames')
                .insert(item)   

            if (error) {
                console.error(`Erro ao atualizar o arquivo ${item.filename}:`, error);
                throw new Error(`Falha ao atualizar ${item.filename}`);
            } else {
                console.log(`Registro na tabela [exames] atualizado com sucesso.`,`${item.filename} `);
                results.push(data);

            }
        }

        return results;

    } catch (error) {
        console.error('Erro ao processar atualização:', error.message);
        throw error; 
    }
};

module.exports = { update_exames };