const functions = require('@google-cloud/functions-framework');
const cors = require('cors');
const corsMiddleware = cors({ origin: true });
const fs = require('fs');
const path = require('path');

//const { download_card } = require("./src/supabase/download_card");
const { get_file_url } = require("./src/supabase/get_file_url");
const { pdf_to_ia } = require("./src/pdf_to_ia");
const { update_prontuarios } = require("./src/supabase/update_prontuarios");
const { update_exames } = require("./src/supabase/update_exames");
const { update_ai } = require("./src/supabase/update_ai");

functions.http('pdf_to_text', async (req, res) => {
    corsMiddleware(req, res, async () => {
        try {
            let json = await get_file_url(req); 
           
            if(json.files.length){
              await update_ai(req.body.data.id, 1);
              let objIAanalise = await pdf_to_ia(json);    
              await update_exames(objIAanalise);    
 
              await update_ai(req.body.data.id, 0);
              res.status(200).json({
                status: 1,
                data: objIAanalise
              });
            } else {
              console.log(`O card [${req.body.data.id}] não possui arquivos PDF`);
              res.status(200).json({
                status: 0,
                message: `O card [${req.body.data.id}] não possui arquivos PDF`
              });
            } 

        } catch (error) {
            console.error('Erro:', error);
            res.status(500).json({
              status: 0,
              message: 'Erro: ' + error.message
            });
        }
    });
});