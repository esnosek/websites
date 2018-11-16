const mysql = require('mysql');

const connection = mysql.createConnection({
    host: "localhost",
    user: "nos",
    password: "nos",
    database: "food_calc"
});

async function createUserTable(){
    var sql = `CREATE TABLE user (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        name VARCHAR(255)
    )`;
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table \'user\' created");
    });
}

async function createPortionTable(){
    var sql = `CREATE TABLE portion (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        date DATE,
        quantity INT,
        product_json TEXT,
        user_id INT, FOREIGN KEY fk_user(user_id) REFERENCES user(id) ON UPDATE CASCADE ON DELETE RESTRICT
    )`;
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table \'portion\' created");
    });
}

async function createUserNeedsTable(){
    var sql = `CREATE TABLE user_needs (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        energy INT,
        protein INT,
        carbohydrates INT,
        fat INT,
        start_date DATE,
        end_date DATE,
        user_id INT, FOREIGN KEY fk_user(user_id) REFERENCES user(id) ON UPDATE CASCADE ON DELETE RESTRICT
    )`;
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table \'user_needs\' created");
    });  
}

async function createAllTables(){
    await createUserTable()
    createPortionTable()
    createUserNeedsTable()
}

createAllTables()
