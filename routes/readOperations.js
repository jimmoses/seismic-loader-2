var express = require('express');
var router = express.Router();
const db = require('./dbcrud');

router.get('/rigs', async function (req, res, next) {
    try{
       let sql, binds, options, response;
       projectId = req.params.project_id;
       sql = `select DISTINCT RIG from PRJDDN.DS_RIG_ASSETWISE_LIST_ ORDER BY 1`;
       binds = {};
       options = {};
       response = await db.read(req, sql, binds, options, "object");
       res.send(response);
    }
   catch (error) { res.send({ status: "error", message: error.message }); }
   finally {
 
   }
 });

 module.exports = router;