const functions = require('@google-cloud/functions-framework');
const cors = require('cors');
const corsMiddleware = cors({ origin: true });
const fs = require('fs');

const path = require('path');
const fetch = require('node-fetch');
const { download_card } = require("./src/supabase/download_card");
const { pdf_to_ia } = require("./src/pdf_to_ia");

functions.http('pdf_to_text', async (req, res) => {
    corsMiddleware(req, res, async () => {
        try {
           
            let json = await download_card(req);       
            let objIAanalise = await pdf_to_ia(json);       

            const directory = './temp/';

            fs.readdir(directory, (err, files) => {
              if (err) throw err;
            
              for (const file of files) {
                fs.unlink(path.join(directory, file), err => {
                  if (err) throw err;
                });
              }
            });

            res.status(200).send(objIAanalise);

        } catch (error) {
            console.error('Erro:', error);
            res.status(500).send('Erro');
        }
    });
});
