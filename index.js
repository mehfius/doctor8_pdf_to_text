const functions = require('@google-cloud/functions-framework');
const cors = require('cors');
const corsMiddleware = cors({ origin: true });
const fs = require('fs');
const path = require('path');

const { download_card } = require("./src/supabase/download_card");
const { pdf_to_ia } = require("./src/pdf_to_ia");
const { update_prontuarios } = require("./src/supabase/update_prontuarios");
const { update_exames } = require("./src/supabase/update_exames");
const { update_ai } = require("./src/supabase/update_ai");

functions.http('pdf_to_text', async (req, res) => {
    corsMiddleware(req, res, async () => {
        try {
            let json = await download_card(req);     
            if(json.files.length){
              await update_ai(req.body.data.id, 1);
              let objIAanalise = await pdf_to_ia(json);    
              console.log(objIAanalise)  
              await update_exames(objIAanalise);
              //let prontuarios = await update_prontuarios(objIAanalise);
              const directory = './temp/';
              fs.readdir(directory, (err, files) => {
                if (err) throw err;              
                for (const file of files) {
                  fs.unlink(path.join(directory, file), err => {
                    if (err) throw err;
                  });
                }
              }); 
              await update_ai(req.body.data.id, 0);
              res.status(200).send(objIAanalise);
            } else {
              console.log(`O card [${req.body.data.id}] não possui arquivos PDF`);
              res.status(200).send(`O card [${req.body.data.id}] não possui arquivos PDF`);
            }
        } catch (error) {
            console.error('Erro:', error);
            res.status(500).send('Erro',error);
        }
    });
});