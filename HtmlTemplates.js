'use strict';
const fs = require('fs');

class HtmlTemplates
{
	
	async AddTemplate(file){
		return new Promise((resolve, reject) =>{
			if(!req.files) reject(new Error("no files were uploaded"))
			let uniquename = Math.random().toString(36).substr(2, 16) + ".html";
			fs.writeFile(process.env.EMAIL_TEMPLATE_PATH + uniquename, file, (err) => {
				if(err) reject(err)
				resolve(true)
			})
		})
	}
	
	async GetListOfTemplates(){
		return new Promise((resolve, reject) => {
			fs.readdir(process.env.EMAIL_TEMPLATE_PATH, (err, files) => {
				resolve(files)
			})
		})
	}
	
	async DeleteTemplate(name){
		return new Promise((resolve, reject) => {
			fs.unlink( process.env.EMAIL_TEMPLATE_PATH + name, (err) => {
				resolve(true)
			})
		})
	}
	
	UpdateTemplate(){
	
	}
	
	async SingleTemplate(name){
		return new Promise((resolve, reject) =>{
			fs.readFile(process.env.EMAIL_TEMPLATE_PATH + name, 'utf8', (err, data) => {
				if(err) reject(err)
				resolve(data)
			})
		})
	}
	
	async MergeTemplate(name, dictionary){
		// take a html template and merge values into it
		try{
			let template = await this.getFile( process.env.EMAIL_TEMPLATE_PATH + name )
			let keys = Object.keys(dictionary)
			let tkey = process.env.EMAIL_TEMPLATE_KEY;
			
			let i;
			for(i in keys){
				let key = keys[i];
				let find = tkey + key + tkey;
				template = template.replace(new RegExp(find, 'g'), dictionary[key]);
			}
			return template;
		}
		catch(e){
			console.log(e)
		}

	}
	
	getFile(path){
		return new Promise((resolve, reject) =>{
			fs.readFile(path, 'utf8', (err, data) => {
				if(err) reject(err)
				resolve(data)
			})
		})
	}
}

module.exports = HtmlTemplates