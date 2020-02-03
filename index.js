
/*
 steps to run this code:
 1. create a project folder (any folder) and go to that folder. create this file as index.js
 2. npm init
 3. npm install --save request fs
 4. node index.jsrequire('request').debug = true
 */

const request = require('request').defaults({ jar: true, debug: true });
const formDataLib = require('form-data');
const cheerio = require('cheerio');
//require('request-debug')(request);
//request.debug=true;
const fs = require('fs');

const LOGIN_URL = "https://secure.konimbo.co.il/user_sessions";

const UPLOAD_PIC_URL = "https://secure.konimbo.co.il/admin/items/xxx/update_spec";
const EDIT_PIC_URL = "https://secure.konimbo.co.il/admin/items/xxx/edit_spec";

let txtfile = fs.readFileSync('./passwords.json');
let credentials = JSON.parse(txtfile);

async function login(callback) {
  const options = {
    url: LOGIN_URL,
    method: 'POST',
    data: {
      username: credentials.user,
      password: credentials.password,
      commit: "כניסה"
    },
    headers: {
      'User-Agent': 'request'
    },
    jar: true // for cookies
  };

  request(options , (error, response, body) => {
    if (!error && response.statusCode === 200) {
      console.log("logged in");
      if (callback) {
        callback;
      }

    } else {
      console.log(`logging failed: ${response.statusCode}`);
    }
  });
}

async function uploadFile(itemNumber, filename) {
  
  const editURL = EDIT_PIC_URL.replace('xxx', encodeURI(itemNumber));
  
  request.get(editURL, (error, response, body) => {
    if (error) {
      return console.error('get edit item failed:', error);
    } else {
      if (response.statusCode === 200) {
        const $ = cheerio.load(body);
        const tokenElement = $('input[name="authenticity_token"]');
        const token = tokenElement.attr('value');
        if (!token) {
          console.error(`failed fetching authenticity_token`);
          return;
        }
        sendItemUpdate(token, itemNumber,filename);
        console.log('get item ok:', response.statusCode);
      }
    }
  
  });
  
 
}


function sendItemUpdate(token, itemNumber, filename) {
  const updateURL = UPLOAD_PIC_URL.replace('xxx', encodeURI(itemNumber));
  
  const i =1;
  const image = fs.createReadStream(__dirname + filename);
  const product = [{
    'product_images_attributes': [{
      photo: {
        filename: '',
        contentType: 'application/octet-stream',
        value: image
      },
      image_url: '',
      title: '',
      position: i+1,
      _destroy: 0,
      id: 3156524
    }],
    'product_features_attributes': [
      {
        position: i+1,
        _destroy: 0,
        group_name: '' ,
        name:'' ,
        value: ''
      }
     ],
    separator: '',
    remove_char:'',
    show_as_new: ''
  }];
  
  const formData = {
    "_method" : "put",
    authenticity_token: token,
    item_id: itemNumber,
    product_id: 2521162,
    //product,
    save: 'שמור'
    // ,attachments: [
    //   fs.createReadStream(__dirname + filename),
    // ]
  };
  
  const headers = {
    Referer: EDIT_PIC_URL.replace('xxx', encodeURI(itemNumber)),
    DNT: "1",
    'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Accept-Encoding":  "gzip, deflate, br"
    
  };
  
  const item_url = updateURL;
  console.log(`sending POST request to : ${item_url}`);
  request.post({ url: item_url, formData: formData, headers } , (err, httpResponse, body) => {
    if (err) {
      return console.error('upload failed:', err);
    }
    if (httpResponse.statusCode === 302 && httpResponse.headers.location.endsWith('edit_spec')) {
      console.log(`Upload successful!  Server responded with: ${httpResponse.statusCode} `);
    } else {
      console.log('upload almost went ok:', httpResponse.statusCode);
    }
    
  });
  
}

const uploadFunc = (itemNumber,filename) => {
  uploadFile(itemNumber, filename);
};

login(uploadFunc('1972243-בלון-אוויר-אננס', '/resources/dot.jpg'));
