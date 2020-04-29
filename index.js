/*
 steps to run this code:
 1. create a project folder (any folder) and go to that folder. create this file as index.js
 2. npm init
 3. npm install --save request fs
 4. node index.jsrequire('request').debug = true
 */

const request = require('request').defaults({jar: true});

const fs = require('fs');

const WEB_URL = "https://secure.konimbo.co.il/login?goto_url=%2Fadmin%2Fitems%2F";
const LOGIN_URL = "https://secure.konimbo.co.il/user_sessions";
const GOTO_URL="https://secure.konimbo.co.il/login?goto_url=%2Fadmin%2Forders%3Fstatus_option_title%3D%25D7%25A8%25D7%259C%25D7%2595%25D7%2595%25D7%25A0%25D7%2598%25D7%2599%25D7%2595%25D7%25AA";

const UPLOAD_PIC_URL = "https://secure.konimbo.co.il/admin/items/xxx/update_spec";
const EDIT_PIC_URL = "https://secure.konimbo.co.il/admin/items/xxx/edit_spec";

const USERAGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36";
const ENCODED_MIME = 'application/x-www-form-urlencoded';


let credentials = require('./passwords.json');
console.log(`credentials = ${JSON.stringify(credentials)}`);

async function login(callback) {
	const options = {
		url: LOGIN_URL,
		method: 'POST',
		hostname: 'secure.konimbo.co.il',
		//path: '/user_sessions',
		formData: {
			"user_session[username]": credentials.user,
			"user_session[password]": credentials.password,
			goto_url: "/admin/orders?status_option_title=%D7%A8%D7%9C%D7%95%D7%95%D7%A0%D7%98%D7%99%D7%95%D7%AA",
			current_url: GOTO_URL,
			current_ip: "10.0.1.171",
			commit: "כניסה"
		},
		headers: {
			"Content-Type" : ENCODED_MIME,
			"User-Agent": USERAGENT
		},
		followAllRedirects: true,
		maxRedirects: 20,
		jar: true // for cookies
	};
	
	request(options, (error, response, body) => {
		if (!error && response.statusCode === 200) {
			console.log("logged in");
			if (callback) {
				const cookies = response.headers["set-cookie"];
				console.log(`cookies=${JSON.stringify(cookies)}`);
				callback(cookies);
				return cookies;
			}

		} else {
			console.log(`logging failed: ${response.statusCode}`);
		}
	});
}

function sendItemUpdate(itemNumber,productId, filename, cookies) {
	const updateURL = UPLOAD_PIC_URL.replace('xxx', encodeURI(itemNumber));
	const editURL = EDIT_PIC_URL.replace('xxx', encodeURI(itemNumber));
	
	let formData = {
		'_method': 'put',
		'authenticity_token': '',
		'item_id': '1972243',
		'product_id': productId,
		'product[product_images_attributes][1][photo]': {
			'value': fs.createReadStream('/home/taimor/dev/somethingNew/dror/resources/dot.jpg'),
			'options': {
				'filename': 'dot.jpg',
				'contentType': "image/jpeg"
			}
		},
		'product[product_images_attributes][1][image_url]': '',
		'product[product_images_attributes][1][title]': 'just a title',
		'product[product_images_attributes][1][position]': '2',
		'product[product_images_attributes][1][_destroy]': '0',
		'save': 'שמור',
		'product[separator]': '',
		'product[remove_char]': '',
		'show_as_new': '1'
	};
	
	let headers =
		{
			'User-Agent': USERAGENT,
			'Content-Type': ENCODED_MIME,
			Referer: editURL,
			Origin: 'https://secure.konimbo.co.il/',
			Connection: "keep-alive",
			"Accept-Encoding": "gzip, deflate, br",
			Host: "secure.konimbo.co.il",
			Accept: "*/*",
			"Cache-Control": "no-cache"
		};
	
	let options = {
		method: 'POST',
		url: updateURL,
		headers,
		formData,
		followAllRedirects: true,
		maxRedirects: 20,
		jar: true // for cookies
	};
	
	console.log(`sending POST request to : ${updateURL}`);
	request.post(options, (err, httpResponse, body) => {
		if (err) {
			console.error('upload failed:', err);
			throw new Error(err);
		} else if (httpResponse.statusCode === 302 && httpResponse.headers.location != null ) {
			console.log(`Upload failed . redirect to ${httpResponse.headers.location} `);
		} else if (httpResponse.statusCode === 200) {
			console.log('upload Success:', httpResponse.statusCode);
		} else {
			console.log('upload almost went ok:', httpResponse.statusCode);
		}
	});
	
}

login((cookies) => {
	sendItemUpdate('1972243-בלון-אוויר-אננס', "2521162", '/resources/dot.jpg', cookies);
});
