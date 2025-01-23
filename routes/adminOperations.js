var express = require('express');
var router = express.Router();
const oracledb = require('oracledb'); // Library for Oracle Connection
const db = require('./dbcrud');

//Used by admin.html 

router.post('/read-permission', async function (req, res, next) {
	let response = {};
	let sql;
	try {    				
		let binds = req.body.data;
		const options = {autoCommit: true};

		//Check for session and create connection
		if (!req.session.status) throw new Error('Not Logged in');
		connection = await oracledb.getConnection(req.session.connection);

          //Insert Scheme Details
		sql = `select distinct AD.*,AL.ASSET_NAME from pdd.ADMIN_DATAENTRY_ALLOWED_ AD, pdd.ASSET_LIST_ AL where AL.ID = AD.ASSET_ID`;		
		response = await db.read(req,sql,[],options);
		if(response.status != "success"){
               throw new Error(response.message);
          }

		res.send(response);
	}
	catch (error) {
		response.status = "error";
		response.message = error.message;
		res.send(response); 
	}
	finally {
		if (connection) {
			try { await connection.close(); }
			catch (error) { return {status: "error", message: error.message}; }
		}
	}
});

router.post('/check-permission', async function (req, res, next) {
	let response = {};
	let sql;
	try {    				
		let binds = req.body.data;
		const options = {autoCommit: true};

		//Check for session and create connection
		if (!req.session.status) throw new Error('Not Logged in');
		connection = await oracledb.getConnection(req.session.connection);

          //Insert Scheme Details
		sql = `select count(*) from 
				pdd.ADMIN_DATAENTRY_ALLOWED_
			where 
				MONTH_YEAR = :MONTH_YEAR and 
				(ASSET_ID = :ASSET_ID or ASSET_ID = 0)`;		
		response = await db.read(req,sql,binds,options);
		if(response.status != "success"){
               throw new Error(response.message);
          }

		res.send(response);
	}
	catch (error) {
		response.status = "error";
		response.message = error.message;
		res.send(response); 
	}
	finally {
		if (connection) {
			try { await connection.close(); }
			catch (error) { return {status: "error", message: error.message}; }
		}
	}
});

router.post('/enable-data-entry', async function (req, res, next) {
	let response = {};
	let sql;
	try {    				
		let binds = req.body.data;
		const options = {autoCommit: true};
		console.log(binds)		;

		//Check for session and create connection
		if (!req.session.status) throw new Error('Not Logged in');
		connection = await oracledb.getConnection(req.session.connection);

          //Insert Scheme Details
		sql = `insert into pdd.ADMIN_DATAENTRY_ALLOWED_ 
		(ASSET_ID, CATEGORY, MONTH_YEAR)
		values
		(:ASSET_ID, :CATEGORY, :MONTH_YEAR)`;		
		response = await db.update(req,sql,binds,options);
		if(response.status != "success"){
               throw new Error(response.message);
          }

		res.send(response);
	}
	catch (error) {
		response.status = "error";
		response.message = error.message;
		res.send(response); 
	}
	finally {
		if (connection) {
			try { await connection.close(); }
			catch (error) { return {status: "error", message: error.message}; }
		}
	}
});

router.post('/disable-data-entry', async function (req, res, next) {
	let response = {};
	let sql;
	try {    				
		let binds = req.body.data;
		const options = {autoCommit: true};

		//Check for session and create connection
		if (!req.session.status) throw new Error('Not Logged in');
		connection = await oracledb.getConnection(req.session.connection);

		sql = `delete from pdd.ADMIN_DATAENTRY_ALLOWED_ 
		where 
			ASSET_ID=:ASSET_ID and
		 	CATEGORY=:CATEGORY and 
			MONTH_YEAR=:MONTH_YEAR
		`;
		
		response = await db.update(req,sql,binds,options);	

		// For Troubleshooting Only
		// response.sql = sql;
		// response.binds = binds;

		res.send(response);
	}
	catch (error) {
		response.status = "error";
		response.message = error.message;
		res.send(response); 
	}
	finally {
		if (connection) {
			try { await connection.close(); }
			catch (error) { return {status: "error", message: error.message}; }
		}
	}
});


module.exports = router;