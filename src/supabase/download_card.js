const { createClient } = require("@supabase/supabase-js");
const fs = require('fs');
const path = require('path');
const https = require('https');

const download_card = async function (req) {

    const supabase = createClient(process.env.URL, process.env.KEY);

    let param = {
        data: {
            id: req.body.data.id,
            session: req.body.data.session
        }
    };

    let { data, error } = await supabase.rpc('list_download', param);

    if (error) {
        console.error('Erro ao chamar RPC:', error.message);
        throw error;
    }

    const downloadPromises = data.files.map(item => {

        return new Promise((resolve, reject) => {
            const filename = item.filename;
            const url = `https://vflhuqqzjmgkdhjgxzni.supabase.co/storage/v1/object/public/pdf/${item.files}/${filename}`;
            const file = fs.createWriteStream(path.join('./temp/', filename));
            
            https.get(url, (response) => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(() => {
                        console.log(`Download concluído!`,`${filename}`);
                        resolve(); 
                    });
                });
            }).on('error', (err) => {
                fs.unlink(path.join('./temp', filename), () => {
                    console.error(`Erro ao baixar ${filename}: ${err.message}`);
                    reject(err);  
                });
            });
        });

    });

    await Promise.all(downloadPromises);

    return data;
};

module.exports = { download_card };
