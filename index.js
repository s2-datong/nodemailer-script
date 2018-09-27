'use strict';
require('dotenv').config()
const express = require('express')
const nodemailer = require('nodemailer')
const fs = require('fs')
const bodyparser = require('body-parser')
const app = express()

const urlencoded_parser = bodyparser.urlencoded({ extended: false })

app.post("/send_email", urlencoded_parser, async (req, res) => {

	if(!req.body.to || !req.body.subject) return res.json({status: 400, message:'Validation Error. Please provide to and subject'})
	if(!req.body.text && !req.body.html) return res.json({status: 400, message: 'Validation Error. Provide body as text or html'})
	
	let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: toBoolean(process.env.SMTP_SECURE),
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        },
		dkim: {
			domainName: process.env.DKIM_DOMAIN,
			keySelector: process.env.DKIM_KEY_SELECTOR,
			privateKey: await getKey(process.env.DKIM_PRIVATE_KEY)
		}
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: process.env.EMAIL_SENDER,
        to: req.body.to, //'bar@example.com, baz@example.com',
        subject: req.body.subject,
        text: req.body.text
    };
	
	if(req.body.html) mailOptions.html = req.body.html;

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
			res.json({status: 400, error: error});
            return console.log(error);
        }
		console.log(info);
		res.json({status: 200, message: 'Mail Accepted and queued for transport'});
    });
});

app.listen(3000, () => console.log("server listening on port 3000"))

function toBoolean(val)
{
	if(val.toLowerCase() == "true") return true;
	return false;
}

function getKey(path){
	return new Promise((resolve, reject) =>{
		fs.readFile(path, (err, data) => {
			if(err) reject(err)
			resolve(data)
		})
	})
}