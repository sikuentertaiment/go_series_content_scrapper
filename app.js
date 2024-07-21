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

// let urls_data = null;
// let index_max = null;
// let index = 667;
// let data_series = null;

// const work =  async ()=>{
// 	if(!urls_data)
// 		await new Promise((resolve,reject)=>{
// 			fs.readFile('./file_list.data','utf-8',(err,data)=>{
// 				urls_data = JSON.parse(data);
// 				index_max = urls_data.length;
// 				resolve();
// 			})
// 		})
// 	if(!data_series)
// 		await new Promise((resolve,reject)=>{
// 			fs.readFile('./series_.data','utf-8',(err,data)=>{
// 				if(err)
// 					data_series = {};
// 				else data_series = JSON.parse(data);
// 				resolve();
// 			})
// 		})
// 	woody.init({
// 		url:urls_data[index],
// 		setConfig(p){
// 			p.config.request.url = this.url;
// 		},
// 		async sf($){
// 			const series = {
// 				links:{}
// 			};
// 			// working series title
// 			$('.entry-title').each((index,element)=>{
// 				series.title = $(element).text();
// 			})

// 			// working on series props
// 			$('.info-content .spe span').each((index,element)=>{
// 				const props = $(element).text().split(': ');
// 				props[1] = props[1].split(', ');
// 				series[props[0]] = props[1].length > 1 ? props[1] : props[0];
// 			})

// 			// working on series categories
// 			$('.info-content .genxed a').each((index,element)=>{
// 				const props = $(element).text();
// 				if(!series.categories)
// 					series.categories = [];
// 				series.categories.push(props);
// 			})

// 			// working on series sinopsis
// 			$('.entry-content').each((index,element)=>{
// 				series.sinopsis = $(element).text();	
// 			})

// 			// working on series thumbnail and icon
// 			$('.thumb img').each((index,img)=>{
// 				series.thumb_img = $(img).attr('src');
// 			})

// 			// working on download links
// 			$('.soraurlx').each((index, element) => {
// 				const item = {};let resolution;
// 				$(element).children((childIndex,child)=>{
// 					child = $(child);
// 					const tag_ = child.prop('tagName');
// 					if(tag_==='STRONG'){
// 						resolution = child.text();
// 					}else{
// 						item[child.text()] = child.attr('href');
// 					}
// 				})
// 				series.links[resolution] = item;
// 	    });
// 	    data_series[series.title] = series;
// 	    console.log('Scrapping: ',index,'=>',series.title,`=> \x1b[32mdone\x1b[0m`);
// 	    index += 1;
// 	    if(index === index_max){
// 	    	await new Promise((resolve,reject)=>{
// 	    		fs.writeFile('./series_.data',JSON.stringify(data_series),(err)=>{
// 	    			resolve();
// 	    		})
// 	    	})
// 	    	return rl.close();
// 	    }
// 	   	work();
// 		}
// 	});
// }
// work();


// code for banner
// const get_banner = (series_name)=>{
// 	series_name = series_name.replaceAll(' ','+');
// 	return new Promise((resolve,reject)=>{
// 		woody.init({
// 			url:`https://duckduckgo.com/?t=h_&q=boruto+banner&iax=images&ia=images`,
// 			setConfig(p){
// 				p.config.request.url = this.url;
// 			},
// 			async sf($){
// 				console.log($.html());
// 				$('img').each((index,element)=>{
// 					console.log($(element).attr('src'));
// 				})
// 			}
// 		});
// 	})
// }

// const tes = async ()=>{
// 	await get_banner('boruto banner');
// }
// tes();

// now its B


// working getting drama list

let data = [];
let process_ = true;
let Char,Page,Base,Index = 0;
const geturl = (char, index)=>{
	if(!index)return `${Base}?show=${char}`;
	return `${Base}page/${index+1}/?show=${char}`;
}
const work = async ()=>{
	if(!data.length){
		const res = await new Promise((resolve,reject)=>{
			fs.readFile('./file_list.data', 'utf8', (err, data_) => {
			  if (err) {
			    return resolve(false);
			  }
			  data = JSON.parse(data_);
			  resolve(true);
			});
		})
		if(!res){
			console.log('Fail to read old data.');
			data = [];
		}
	}
	if(!Base){
		await new Promise((resolve,reject)=>{
			rl.question('Input Base Url: ',(ans)=>{
				Base = ans;
				resolve();
			})
		})
	}
	if(!Char){
		await new Promise((resolve,reject)=>{
			rl.question('Input Char: ',(ans)=>{
				Char = ans;
				resolve();
			})	
		})
	}
	if(Char==='finish'){
		await new Promise((resolve,reject)=>{
			fs.writeFile('./file_list.data', JSON.stringify(data), (err) => {
			  if (err) {
			    console.error('Error writing file:', err);
			  } else {
			    console.log('File written successfully');
			  }
			  resolve();
			});
		})
		console.log('Program finished:',data.length,'found.');
		return rl.close();
	}
	if(!Page){
		await new Promise((resolve,reject)=>{
			rl.question('Input Page: ',(ans)=>{
				Page = Number(ans);
				resolve();
			})	
		})
	}
	console.clear();
	woody.init({
		url:geturl(Char, Index),
		setConfig(p){
			p.config.request.url = this.url;
			console.log(this.url);
		},
		sf($){
			$('.bsx a').each((index,element)=>{
				data.push($(element).attr('href'));
			})
			Index += 1;
			console.log('total:',data.length);
			if(Index === Page){
				Page = null;
				Char = null;
				Index = 0;
			};
			work();		
		}
	});
}
// console.clear();
work();

// getting the series_data index
// fs.readFile('./series_.data', 'utf8', (err, data_) => {
//   let data = JSON.parse(data_);
//   let index = 0;
//   for(let i in data){
//   	index += 1;
//   }
//   console.log(index);
// });