const mysql = require('mysql');

const connection = mysql.createConnection({
    host: "localhost",
    user: "nos",
    password: "nos"
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