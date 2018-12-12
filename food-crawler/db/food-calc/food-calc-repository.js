const mysql = require('mysql2');

const config = require('../../config/config.js').config;

const connection = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: "food_calc"
});

function insertSession(session, cb){
    var sql = `INSERT INTO session (current_day)
    	VALUES (
            '${session.day}'
        )`;
    connection.query(sql, function (err, result) {
        if (err) throw err;
        cb(result);
    });   
}

function findSession(id, cb){
    let sql = `SELECT * FROM session WHERE id='${id}'`
    connection.query(sql, function (err, result) {
        if (err) throw err;
        cb(result);
    });  
}

function insertUser(user, cb){
    var sql = `INSERT INTO user (name)
    	VALUES (
            '${user.name}'
        )`;
    connection.query(sql, function (err, result) {
        if (err) throw err;
        cb(result);
    });   
}

function findAllUsers(cb){
    var sql = `SELECT * FROM user`;
    connection.query(sql, function (err, result, fields) {
        if (err) throw err;
        cb(result);
    });    
}

function findUserByName(name, cb){
    var sql = `SELECT * FROM user WHERE name='${name}'`;
    connection.query(sql, function (err, result, fields) {
        if (err) throw err;
        cb(result);
    });    
}

function insertUserNeeds(userNeeds, cb){
    var sql = `INSERT INTO user_needs (user_id, energy, protein, fat, carbohydrates, start_date)
    VALUES (
        ${userNeeds.user.id},
        ${userNeeds.energy},
        ${userNeeds.protein},
        ${userNeeds.fat},
        ${userNeeds.carbohydrates},
        '${userNeeds.startDate}'
    )`;
    connection.query(sql, function (err, result) {
        if (err) throw err;
        cb(result);
    });   	
}

function findAllUsersNeeds(cb){
    var sql = `SELECT * FROM user_needs`;
    connection.query(sql, function (err, result, fields) {
        if (err) throw err;
        cb(result);
    });    
}

function findUserNeedsByUserName(userName, cb){
    var sql = `SELECT * FROM user_needs
    INNER JOIN user ON user.id=user_needs.user_id
    WHERE user.name='${userName}';`;
    connection.query(sql, function (err, result) {
        if (err) throw err;
        cb(result);
    });   	
}

function findUserNeedsValuesByUserName(userName, cb){
    var sql = `SELECT energy, protein, fat, carbohydrates FROM user_needs
    INNER JOIN user ON user.id=user_needs.user_id
    WHERE user.name='${userName}';`;
    connection.query(sql, function (err, result) {
        if (err) throw err;
        cb(result);
    });   	
}

function insertPortion(portion, cb){
    console.log(portion.productJson._source)
    let productString = JSON.stringify(portion.productJson._source)
        .replace(/\\\"/g, "\\\\\"")
        .replace(/\'/g, "\\\'");
    var sql = `INSERT INTO portion (user_id, product_json, quantity, date)
    	VALUES (
            '${portion.user.id}', 
            '${productString}',
            ${portion.quantity},
            '${portion.date}'
        )`;
    connection.query(sql, function (err, result) {
        if (err) throw err;
        cb(result);
    });   
}

function findPortion(id, cb){
    let sql = `SELECT * FROM portion WHERE id='${id}'`
    connection.query(sql, function (err, result) {
        if (err) throw err;
        cb(result);
    });
}

function findPortionByDate(date, cb){
    let sql = `SELECT * FROM portion WHERE date='${date}'`
    connection.query(sql, function (err, result) {
        if (err) throw err;
        cb(result);
    });
}

function updatePortionQuantity(id, quantity, cb){
    let sql = `UPDATE portion SET quantity = '${quantity}' WHERE id = '${id}'`
    connection.query(sql, function (err, result) {
        if (err) throw err;
        cb(result);
    });
}

function deletePortion(id, cb){
    let sql = `DELETE FROM portion WHERE id='${id}'`
    connection.query(sql, function (err, result) {
        if (err) throw err;
        cb(result);
    });
}

module.exports = {
    insertSession : insertSession,
    findSession : findSession,
    insertUser: insertUser,
    findAllUsers: findAllUsers,
    findUserByName : findUserByName,
    insertUserNeeds: insertUserNeeds,
    findAllUsersNeeds : findAllUsersNeeds,
    findUserNeedsByUserName : findUserNeedsByUserName,
    findUserNeedsValuesByUserName : findUserNeedsValuesByUserName,
    insertPortion: insertPortion,
    findPortion: findPortion,
    findPortionByDate : findPortionByDate,
    updatePortionQuantity : updatePortionQuantity,
    deletePortion: deletePortion
};