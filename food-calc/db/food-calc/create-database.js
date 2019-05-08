const mysql = require('mysql2');

const config = require('../../config/config.js').config;

const connection = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password
});

async function createDatabase(name){
    connection.connect(function(err) {
        if (err) throw err;
        console.log("Connected to mysql");
        connection.query(`CREATE DATABASE ${name}`, function (err, result) {
            if (err) throw err;
            console.log(`Database ${name} created`);
        });
    });
}

createDatabase("food_calc")