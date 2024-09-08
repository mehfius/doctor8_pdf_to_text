const { createClient } = require("@supabase/supabase-js");
const { v4: uuidv4 } = require('uuid');

const update_ai = async function (id,status) {
    const supabase = createClient(process.env.URL, process.env.KEY);

    try {

        if(status == 1){

            await supabase
            .from('prontuarios')
            .update({ ia: status, update_uuid: uuidv4(), label: 'Em análise pela IA, aguarde ...' })
            .eq('id', id);

        } else {

            await supabase
            .from('prontuarios')
            .update({ ia: status, update_uuid: uuidv4() })
            .eq('id', id);

        }

    } catch (error) {

        console.error('Erro ao processar atualização:', error.message);
        throw error;
        
    }
};

module.exports = { update_ai };
