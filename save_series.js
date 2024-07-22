const fs = require('fs');
const adminfb = require("firebase-admin");
const { getDatabase } = require('firebase-admin/database');
const { getStorage, getDownloadURL, getFileBucket } = require('firebase-admin/storage');
const serviceAccount = require("./credentials/warungkuproject-45a28-firebase-adminsdk-ljd7p-fcc0c51c37.json");
adminfb.initializeApp({
  credential: adminfb.credential.cert(serviceAccount),
  databaseURL: "https://warungkuproject-45a28-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageUrl:"gs://warungkuproject-45a28.appspot.com"
});

const db = getDatabase();

const set = async ()=>{
	const res = await new Promise((resolve,reject)=>{
		fs.readFile('./normalized_series.data','utf8',(err,data)=>{
			if(err)
				return resolve({valid:false});
			resolve({valid:true,data:JSON.parse(data)});
		})
	})
	if(!res.valid)
		return console.log('Program Stoped: Cannot read series data');
	await db.ref('series').set(res.data);
	console.log('update series successfully');
	process.exit();
}

set();