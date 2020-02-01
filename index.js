
/*
 steps to run this code:
 1. create a project folder (any folder) and go to that folder. create this file as index.js
 2. npm init
 3. npm install --save request fs
 4. node index.jsrequire('request').debug = true
 */

const request = require('request').defaults({ jar: true, debug: true });
//require('request-debug')(request);
//request.debug=true;
const fs = require('fs');

const LOGIN_URL = "https://secure.konimbo.co.il/user_sessions";

const UPLOAD_PIC_URL = "https://secure.konimbo.co.il/admin/items/xxx/update_spec";
const EDIT_PIC_URL = "https://secure.konimbo.co.il/admin/items/xxx/edit_spec";

function login(itemNumber, filename) {
  const options = {
    url: LOGIN_URL,
    method: 'POST',
    data: {
      username: "xxx",
      password: "yyy",
      commit: "כניסה"
    },
    headers: {
      'User-Agent': 'request'
    },
    jar: true // for cookies
  };

  request(options, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      console.log("logged in");
      uploadFile(itemNumber, filename);
    } else {
      console.log(`logging failed: ${response.statusCode}`);
    }
  });
}

function uploadFile(itemNumber, filename) {
  const formData = {
    attachments: [
      fs.createReadStream(__dirname + filename),
    ]
  };

  const headers = {
    Referer: EDIT_PIC_URL.replace('xxx', encodeURI(itemNumber)),
    DNT: "1",
    'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Accept-Encoding":  "gzip, deflate, br"

  }

  const item_url = UPLOAD_PIC_URL.replace('xxx', encodeURI(itemNumber));
  console.log(`sending POST request to : ${item_url}`);
  request.post({ url: item_url, formData: formData, headers }, function optionalCallback(err, httpResponse, body) {
    if (err) {
      return console.error('upload failed:', err, httpResponse.statusCode);
    }
    if (httpResponse.statusCode === 302 && httpResponse.headers.location.endsWith('edit_spec')) {
      console.log(`Upload successful!  Server responded with: ${httpResponse.statusCode} `);
    } else {
      console.log('upload almost went ok:', httpResponse.statusCode);
    }
   
  });

}

login('1972243-בלון-אוויר-אננס', '/pics/39938608163.jpg');
