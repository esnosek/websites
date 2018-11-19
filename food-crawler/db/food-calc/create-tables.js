const mysql = require('mysql2');

const config = require('../../config/config.js').config;

const connection = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: "food_calc"
});

async function createUserTable(){
    var sql = `CREATE TABLE user (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        name TEXT
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
        product_json JSON,
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
