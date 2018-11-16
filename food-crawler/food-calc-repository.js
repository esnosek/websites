const mysql = require('mysql');

const connection = mysql.createConnection({
    host: "localhost",
    user: "nos",
    password: "nos",
    database: "apple_collection"
});

function getUsersList(callback){
    var sql = `SELECT * FROM user`;
    connection.query(sql, function (err, result, fields) {
        if (err) throw err;
        callback(result);
    });    
}

function insertUser(user){
    var sql = `INSERT INTO user (name)
    	VALUES (
            "${user.name}"
        )`;
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log(`User ${user.name} inserted with id ${result.insertId}.`);
    });   
}

function insertPortion(portion){
    var sql = `INSERT INTO portion (user_id, date, product_json, quantity)
    	VALUES (
            ${portion.user.id}, 
            "${portion.date}",
            "${portion.product_json}",
            ${portion.quantity}
        )`;
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log(`Portion inserted with id ${result.insertId}.`);
    });   
}

function insertUserNeeds(userNeeds){
    var sql = `INSERT INTO user_needs (user_id, energy, protein, fat, carbohydrates, start_date, end_date)
    VALUES (
        ${userNeeds.user.id},
        ${userNeeds.energy},
        ${userNeeds.protein},
        ${userNeeds.fat},
        ${userNeeds.carbohydrates},
        "${userNeeds.start_date}",
        "${userNeeds.end_date}"
    )`;
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log(`UserNeed inserted with id ${result.insertId}.`);
    });   	
}

module.exports = {
    insertUser: insertUser,
    insertPortion: insertPortion,
    insertUserNeeds: insertUserNeeds,
    getUsersList: getUsersList
};