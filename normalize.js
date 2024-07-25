const fs = require('fs');
const axios = require('axios');
const data_path = './series_.data';
const clicksflysign = 'afa975b031fbfba062d51e3efd3cca5344d14a14';

const normalized_series = {};

const getNewSeriesID = ()=>{
	return `sID_${new Date().getTime()}`;
}

const getDateCreate = ()=>{
	// Get current date and time
	const now = new Date();

	// Format options for date
	const dateOptions = {
	  weekday: 'long', // full day of the week (e.g., Monday)
	  year: 'numeric',
	  month: 'long', // full month name (e.g., January)
	  day: 'numeric', // day of the month (e.g., 1)
	};

	// Format options for time
	const timeOptions = {
	  hour: 'numeric',
	  minute: 'numeric',
	  second: 'numeric',
	  hour12: false, // Use 24-hour format
	};

	// Format the date
	const formattedDate = new Intl.DateTimeFormat('id-ID', dateOptions).format(now);

	// Format the time
	const formattedTime = new Intl.DateTimeFormat('id-ID', timeOptions).format(now);

	return formattedDate + ' ' + formattedTime;
}

const getclicksflylink = (dest)=>{
	return `https://clicksfly.com/api?api=${clicksflysign}&url=${dest}`;
}

const getKeterangan = (series)=>{
	const value = {};
	const blacklist = ['links','title','categories','sinopsis','thumb_img'];
	const diction = {
		Duration:'Durasi',
		Episodes:'Episode',
		Country:'Negara',
		Type:'Tipe',
		'Realeased on':'Rilis'
	}
	for(let i in series){
		if(!blacklist.includes(i)){
			let item = series[i];
			if(typeof item === 'object' && item.length){
				item = item.toString();
			}
			if(diction[i])
				value[diction[i]] = item;
			else value[i] = item;
		}
	}
	return value;
}

const getBatchLink = (links)=>{
	return new Promise(async (resolve,reject)=>{
		const batchs = [];
		for(let i in links){
			const resolution = links[i];
			for(let platform in resolution){
				const item = resolution[platform];
				batchs.push({
					index:batchs.length,
					label:`${i} ${platform}`,
					link:item,
					shortenedUrl: await new Promise((resolve,reject)=>{
						axios.get(getclicksflylink(item))
					  .then(response => {
					  	console.log('Done =>',response.data.shortenedUrl);
					    resolve(response.data.shortenedUrl)
					  })
					  .catch(error => {
					    resolve('ERROR: FAIL GETTING THE SHORTED LINK');
					  });	
					})
				});
			}
		}
		resolve(batchs);	
	})
}


const normalize = async ()=>{
	const res = await new Promise((resolve,reject)=>{
		fs.readFile(data_path,'utf8',(err,data)=>{
			if(err)
				return resolve({valid:false});
			resolve({valid:true,data:JSON.parse(data)});
		})
	})
	if(!res.valid)
		return console.log('Program stoped: Error while trying to read the data!');
	let count = 0;
	for(let label in res.data){
		const series = res.data[label];
		const series_id = getNewSeriesID();
		const date_create = getDateCreate();
		const keterangan = getKeterangan(series);
		const link_batch = await getBatchLink(series.links);
		count += 1;
		console.log('Series index:',count);
		const small_title = `${keterangan.Rilis ? keterangan.Rilis : '-'}, ${keterangan.Status ? keterangan.Status : '-'}`;
		normalized_series[series_id] = {
			series_id,
			nama:series.title,
			banner_series:series.thumb_img,
			logo_series:series.thumb_img,
			kategori:series.categories,
			sinopsis:series.sinopsis,
			small_title,
			date_create,
			last_edit:date_create,
			keterangan,
			link_batch
		}
	}
	await new Promise((resolve,reject)=>{
		fs.writeFile('./normalized_series.data',JSON.stringify(normalized_series),(err)=>{
			resolve(true);
		})
	})
	console.log('Process stoped: file saved.');
}

const wrap_categories = async ()=>{
	const kategori = {};
	const res = await new Promise((resolve,reject)=>{
		fs.readFile('./normalized_series.data','utf8',(err,data)=>{
			if(err)
				return resolve({valid:false});
			resolve({valid:true,data:JSON.parse(data)});
		})
	})
	if(!res.valid)
		return console.log('Program stoped: Cannot read series data');
	for(let i in res.data){
		if(!res.data[i].kategori)
			continue;
		res.data[i].kategori.forEach(j=>{
			if(!kategori[j]){
				kategori[j] = [res.data[i].series_id];
			}else kategori[j].push(res.data[i].series_id);
		})
	}
	await new Promise((resolve,reject)=>{
		fs.writeFile('./normalized_series_categories.data',JSON.stringify(kategori),(err)=>{
			resolve(true);
		})
	})
	console.log('Process stoped: file saved.');
}


wrap_categories();
// normalize();
