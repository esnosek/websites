const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: "localhost",
    user: "nos",
    password: "NosNos92@"
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