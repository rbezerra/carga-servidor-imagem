const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");

const PATH = process.argv[2];
const IMAGE_SERVER_ADDRESS = process.argv[3];
let images = [];

const directoryPath = path.join(__dirname, PATH);

const hrstart = process.hrtime()
fs.readdir(directoryPath, async (err, files) => {
    if(err){
        return console.log("Diretório não acessível ", err);
    }

    const promises = files.map(async (file) => {
        filepath = path.join(__dirname, PATH, file);
        let form = new FormData();
        form.append('image', fs.createReadStream(filepath));
        form.append('descricao', file);
        await axios
            .post(IMAGE_SERVER_ADDRESS+"/upload", 
                form, 
                {headers: form.getHeaders()})
            .then(result => {
                images.push({
                   old_name: file,
                   new_name: result.data.Path,
                   uuid: result.data.UUID
                });
            })
            .catch((err) => {
                console.log("Falha ao fazer upload do arquivo ", err.message);
            });
    });

    await Promise.all(promises);

    fs.writeFile("files.json", JSON.stringify(images), (err) => {
        let hrend = process.hrtime(hrstart);
        if(err) console.log("Erro ao criar arquivo de mapeamento ", err);
        console.log("Carga finalizada em %ds %dms", hrend[0], hrend[1] / 1000000);
    });

    
});
