const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const woody = {
	config:{
		request:{
			method:'get',
			data:{}
		}
	},
	init(config){
		if(config.setConfig)
			config.setConfig(this);
		const scrape_data = this.scrappe(config.sf);
		return scrape_data;	
	},
	async scrappe(sf=null){
		const {data} = await this.req(this.config.request);
		const $d = this.parse(data);
		if(!sf)
			return $d;
		sf($d);
	},
	req(config){
		return axios[config.method](config.url,config.data);
	},
	parse(data){
		return cheerio.load(data);
	}
}

// working on details series

let urls_data = null;
let index_max = 10;
let index = 0;
let data_series = null;

const work =  async ()=>{
	if(!urls_data)
		await new Promise((resolve,reject)=>{
			fs.readFile('./file_list.data','utf-8',(err,data)=>{
				urls_data = JSON.parse(data);
				index_max = urls_data.length;
				resolve();
			})
		})
	if(!data_series)
		await new Promise((resolve,reject)=>{
			fs.readFile('./series_.data','utf-8',(err,data)=>{
				data_series = JSON.parse(data);
				resolve();
			})
		})
	woody.init({
		url:urls_data[index],
		setConfig(p){
			p.config.request.url = this.url;
		},
		async sf($){
			const series = {
				links:{}
			};
			// working series title
			$('.entry-title').each((index,element)=>{
				series.title = $(element).text();
			})

			// working on series props
			$('.info-content .spe span').each((index,element)=>{
				const props = $(element).text().split(': ');
				props[1] = props[1].split(', ');
				series[props[0]] = props[1].length > 1 ? props[1] : props[0];
			})

			// working on series sinopsis
			$('.entry-content').each((index,element)=>{
				series.sinopsis = $(element).text();	
			})

			// working on series thumbnail and icon
			$('.thumb img').each((index,img)=>{
				series.thumb_img = $(img).attr('src');
			})

			// working on download links
			$('.soraurlx').each((index, element) => {
				const item = {};let resolution;
				$(element).children((childIndex,child)=>{
					child = $(child);
					const tag_ = child.prop('tagName');
					if(tag_==='STRONG'){
						resolution = child.text();
					}else{
						item[child.text()] = child.attr('href');
					}
				})
				series.links[resolution] = item;
		    });
		    data_series[series.title] = series;
		    index += 1;
		    if(index === index_max){
		    	await new Promise((resolve,reject)=>{
		    		fs.writeFile('./series_.data',JSON.stringify(data_series),(err)=>{
		    			resolve();
		    		})
		    	})
		    	return rl.close();
		    }
		   	work();
		}
	});
}
work();


// now its B


// working getting drama list
// let data = [];
// let process_ = true;
// let Char,Page,Base,Index = 0;
// const geturl = (char, index)=>{
// 	if(!index)return `${Base}?show=${char}`;
// 	return `${Base}page/${index+1}/?show=${char}`;
// }
// const work = async ()=>{
// 	if(!data.length){
// 		const res = await new Promise((resolve,reject)=>{
// 			fs.readFile('./file_list.data', 'utf8', (err, data_) => {
// 			  if (err) {
// 			    return resolve(false);
// 			  }
// 			  data = JSON.parse(data_);
// 			  resolve(true);
// 			});
// 		})
// 		if(!res){
// 			console.log('Fail to read old data.')
// 			return rl.close();
// 		}
// 	}
// 	if(!Base){
// 		await new Promise((resolve,reject)=>{
// 			rl.question('Input Base Url: ',(ans)=>{
// 				Base = ans;
// 				resolve();
// 			})
// 		})
// 	}
// 	if(!Char){
// 		await new Promise((resolve,reject)=>{
// 			rl.question('Input Char: ',(ans)=>{
// 				Char = ans;
// 				resolve();
// 			})	
// 		})
// 	}
// 	if(Char==='finish'){
// 		await new Promise((resolve,reject)=>{
// 			fs.writeFile('./file_list.data', JSON.stringify(data), (err) => {
// 			  if (err) {
// 			    console.error('Error writing file:', err);
// 			  } else {
// 			    console.log('File written successfully');
// 			  }
// 			  resolve();
// 			});
// 		})
// 		console.log('Program finished:',data.length,'found.');
// 		return rl.close();
// 	}
// 	if(!Page){
// 		await new Promise((resolve,reject)=>{
// 			rl.question('Input Page: ',(ans)=>{
// 				Page = Number(ans);
// 				resolve();
// 			})	
// 		})
// 	}
// 	woody.init({
// 		url:geturl(Char, Index),
// 		setConfig(p){
// 			p.config.request.url = this.url;
// 			console.log(this.url);
// 		},
// 		sf($){
// 			$('.bsx a').each((index,element)=>{
// 				data.push($(element).attr('href'));
// 			})
// 			Index += 1;
// 			console.log(data.length)
// 			if(Index === Page){
// 				Page = null;
// 				Char = null;
// 				Index = 0;
// 			};
// 			work();		
// 		}
// 	});
// }
// console.clear();
// work();

