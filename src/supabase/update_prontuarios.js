const { createClient } = require("@supabase/supabase-js");
const { v4: uuidv4 } = require('uuid');

const update_prontuarios = async function (json) {
    const supabase = createClient(process.env.URL, process.env.KEY);

    try {
    
        let text = ""
        for (const item of json) {
 
            text += "Exame: " + item.label + "\n";
            text += item.conclusao + "\n";
            text += "Paciente: " + item.nome + "\n";            
            text += " -------------- " + "\n";
        }

        await supabase
        .from('prontuarios')
        .update({ label: text, update_uuid: uuidv4() })
        .match({ id: json[0].prontuarios, category: 179 })

        return text;

    } catch (error) {
        console.error('Erro ao processar atualização:', error.message);
        throw error; 
    }
};

module.exports = { update_prontuarios };
