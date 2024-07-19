const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://google.com';

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

woody.init({
	url:'https://tv5.anikor.pics/series/komedi-kacau-2024/',
	setConfig(p){
		p.config.request.url = this.url;
	},
	sf($){
		const series = {
			links:{}
		};
		// working series title
		$('.entry-title').each((index,element)=>{
			series.title = $(element).text();
		})

		// working on series props

		// working on series sinopsis
		$('.entry-content p').each((index,element)=>{
			series.sinopsis = $(element).text();	
		})

		// working on series thumbnail and icon
		$('.thumb img').each((index,img)=>{
			series.thumb_img = $(img).attr('src');
		})

		// working on downloa links
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
	    console.log(series)
	}
});