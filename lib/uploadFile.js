const FormData = require('form-data');
const type = require("file-type")
const fetch = require('node-fetch')
const cheerio = require("cheerio")
const cryp = require("crypto")


// Get number size to Bytes To size...
function bytesToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return 'n/a';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i === 0) return (`${bytes} ${sizes[i]}`);
    return (`${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`);
};


function capitalizeEachWord(teks = "") {
    var splitStr = teks?.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(" ")
}


module.exports = async function uploadFile(buffer) {
    return new Promise(async (resolve, reject) => {
        const { ext } = await type.fromBuffer(buffer);
        const bodyForm = new FormData();
        const randomfile = 'IMG-'+cryp.randomBytes(8).toString('hex').toUpperCase();
        bodyForm.append('files[]', buffer, `${randomfile}.${ext}`);

        // Created by https://github.com/caliphdev (Caliph)
        // Creator by https://github.com/cakrayp (Cakra YP)
        fetch('https://uguu.se/upload.php', {
            method: 'POST',
            body: bodyForm.getBuffer(),
            headers: {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9,id;q=0.8",
                ...bodyForm.getHeaders()
            }
        })
            .then(response => response.json())
            .then(async (data) => {
                const files_result = data.files[0];
                const uploadedfile = files_result.url;
                const { headers } = await fetch(uploadedfile, { method: 'GET' });
                resolve({
                    server: capitalizeEachWord(headers.get("server")) + " (file Uploader)",
                    hash: files_result.hash,
                    originalname: files_result.name,	// uploadedfile.match(/file\/(.+)/)[1],
                    filetype: ext,
                    mimetype: files_result.mimetype,
                    size: bytesToSize(files_result.size),
                    file_url: uploadedfile
                });
            })
            .catch(async (err) => {
                reject({
                    code: 503,
                    message: {
                        error: true,
                        messageError: "Error encorred! Service Unavailable as program file upload is not work to file uploads.",
                        info: 'We have provided an image response, Please use paramenter of responsetype=image(s) for image response'
                    }
                });
            });
    });
};
