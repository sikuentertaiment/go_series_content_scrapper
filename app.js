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
	url:'https://tv5.anikor.pics/rick-and-morty-season-7-episode-4/',
	setConfig(p){
		p.config.request.url = this.url;
	},
	sf($){
		$('a').each((index, element) => {
	      const linkText = $(element).text();
	      const linkHref = $(element).attr('href');
	      console.log(`Link ${index + 1}: ${linkText} (${linkHref})`);
	    });
	}
});