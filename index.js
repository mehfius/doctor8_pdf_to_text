const functions = require('@google-cloud/functions-framework');
const cors = require('cors');
const corsMiddleware = cors({ origin: true });
const fs = require('fs');

const path = require('path');
const fetch = require('node-fetch');
const { download_card } = require("./src/supabase/download_card");
const { pdf_to_ia } = require("./src/pdf_to_ia");
const { update_prontuarios } = require("./src/supabase/update_prontuarios");
const { update_exames } = require("./src/supabase/update_exames");

functions.http('pdf_to_text', async (req, res) => {
    corsMiddleware(req, res, async () => {
        try {

            await supabase
            .from('prontuarios')
            .update({ ai:1 })
            .match({ id: req.body.data.id, category: 179 })

            let json = await download_card(req);       

            let objIAanalise = await pdf_to_ia(json);        

            await update_exames(objIAanalise);

            let prontuarios = await update_prontuarios(objIAanalise);

            const directory = './temp/';

            fs.readdir(directory, (err, files) => {
              if (err) throw err;
            
              for (const file of files) {
                fs.unlink(path.join(directory, file), err => {
                  if (err) throw err;
                });
              }
            });

            await supabase
            .from('prontuarios')
            .update({ ai:0 })
            .match({ id: json[0].prontuarios, category: 179 })

            res.status(200).send(objIAanalise);

        } catch (error) {
            console.error('Erro:', error);
            res.status(500).send('Erro');
        }
    });
});
