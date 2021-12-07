const mysql = require('mysql');

function newConn(){
    var conn = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'reccentre3'
    });
    return conn;
}

module.exports = newConn;