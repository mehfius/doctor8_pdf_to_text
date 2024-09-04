const { createClient } = require("@supabase/supabase-js");

const update_descricao = async function (json) {
    const supabase = createClient(process.env.URL, process.env.KEY);

    try {
        const results = [];

        for (const item of json) {
            const { data, error } = await supabase
                .from('files')
                .update({ descricao: item.analise })
                .eq('filename', item.filename);

            if (error) {
                console.error(`Erro ao atualizar o arquivo ${item.filename}:`, error);
                throw new Error(`Falha ao atualizar ${item.filename}`);
            } else {
                console.log(`Arquivo ${item.filename} atualizado com sucesso.`);
                results.push(data);
            }
        }

        return results;

    } catch (error) {
        console.error('Erro ao processar atualização:', error.message);
        throw error; // Rethrow the error to be handled by the caller, if needed
    }
};

module.exports = { update_descricao };
