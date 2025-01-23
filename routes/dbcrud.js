//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Common functions for checking session and executing SQL

const oracledb = require('oracledb'); // Library for Oracle Connection

// For reading data
async function read(req, sql, binds, options) {
	// console.log(sql,binds,options);
	try {
	    //Check for session
	    if (!req.session.status) throw new Error('Not Logged in');
 
	    //Create connection from session variable
	    connection = await oracledb.getConnection(req.session.connection);
	    result = await connection.execute(sql, binds, options);
	    return { status: "success", message: result.rows.length + " records fetched", data: result.rows };
	}
	catch (error) { return { status: "error", message: error.message }; }
	finally {
	    if (connection) {
		   try { await connection.close(); }
		   catch (error) { return { status: "error", message: error.message }; }
	    }
	}
}

// For insert and update queries
async function update(req,sql,binds,options){	
	// console.log(sql,binds,options);
	try {
		//Check for session
		if (!req.session.status) throw new Error('Not Logged in');
		
		//Create connection from session variable
		connection = await oracledb.getConnection(req.session.connection);
		result = await connection.executeMany(sql,binds,options);
		return {status: "success", message: result.rowsAffected, data: result};
	} 
	catch (error) { return {status: "error", message: error.message}; }
	finally {
		if (connection) {
			try { await connection.close(); }
			catch (error) { return {status: "error", message: error.message}; }
		}
	}
}

module.exports = {update: update, read: read};