'use strict';
require('dotenv').config()
const express = require('express')
const nodemailer = require('nodemailer')
const fs = require('fs')
const bodyparser = require('body-parser')
const app = express()
const fileUpload = require('express-fileupload')

const urlencoded_parser = bodyparser.urlencoded({ extended: false })
const fileuploadParser = fileUpload()
const templates = require('./HtmlTemplates.js')

let HtmlTemplate = new HtmlTemplates();

app.post("/send_email", urlencoded_parser, async (req, res) => {

	if(!req.body.to || !req.body.subject) return res.json({status: 400, message:'Validation Error. Please provide to and subject'})
	if(!req.body.template_name) return res.json({status:400, message:'Please provide a template name'})
	let template = "";
	
	if(!req.body.data) template = await HtmlTemplate.SingleTemplate(req.body.template_name)
	else template = await HtmlTemplate.MergeTemplate(req.body.template_name, req.body.data)
	
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
			privateKey: await getFile(process.env.DKIM_PRIVATE_KEY)
		}
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: process.env.EMAIL_SENDER,
        to: req.body.to, //'bar@example.com, baz@example.com',
        subject: req.body.subject,
		html: template
    };
	
	if(req.body.text) mailOptions.text = req.body.text;

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

app.post("/send_to_many", urlencoded_parser, async (req, res) => {
	// send personalized emails to many users
});

app.get("/templates", async (req, res) => {
	files = await HtmlTemplate.GetListOfTemplates();
	res.json(files);
});

app.post("/templates", [fileuploadParser, urlencoded_parser], async (req, res) => {
	await HtmlTemplate.AddTemplate(req.files.template.data);
	res.json({status:200, message:'template saved'})
}); 

app.delete("/templates/:name", async (req, res) => {
	await HtmlTemplate.DeleteTemplate(req.params.name);
	res.json({status:200, message:'template deleted'})
});

app.listen(3000, () => console.log("server listening on port 3000"))

function toBoolean(val)
{
	if(val.toLowerCase() == "true") return true;
	return false;
}

function getFile(path){
	return new Promise((resolve, reject) =>{
		fs.readFile(path, (err, data) => {
			if(err) reject(err)
			resolve(data)
		})
	})
}