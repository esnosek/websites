const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: "localhost",
    user: "nos",
    password: "NosNos92@"
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