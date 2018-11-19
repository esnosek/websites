const mysql = require('mysql2');

const config = require('../../config/config.js').config;

const connection = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password
});

async function removeDatabase(databaseName){
    connection.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        connection.query(`DROP DATABASE ${databaseName}`, function (err, result) {
            if (err) throw err;
            console.log(`Database ${databaseName} removed`);
        });
    });
}

removeDatabase("food_calc")