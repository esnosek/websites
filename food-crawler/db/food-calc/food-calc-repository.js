const mysql = require('mysql2');

const config = require('../../config/config.js').config;

const connection = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: "food_calc"
});

function getUsersList(callback){
    var sql = `SELECT * FROM user`;
    connection.query(sql, function (err, result, fields) {
        if (err) throw err;
        callback(result);
    });    
}

function getUsersNeedsList(callback){
    var sql = `SELECT * FROM user_needs`;
    connection.query(sql, function (err, result, fields) {
        if (err) throw err;
        callback(result);
    });    
}

function insertUser(user){
    var sql = `INSERT INTO user (name)
    	VALUES (
            '${user.name}'
        )`;
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log(`User ${user.name} inserted with id ${result.insertId}.`);
    });   
}

function findPortion(id, callback){
    let sql = `SELECT * FROM portion WHERE id='${id}'`
    connection.query(sql, function (err, result) {
        if (err) throw err;
        callback(result);
    });
}

function updatePortionQuantity(id, quantity, callback){
    let sql = `UPDATE portion SET quantity = '${quantity}' WHERE id = '${id}'`
    connection.query(sql, function (err, result) {
        if (err) throw err;
        callback(result);
    });
}

function deletePortion(id, callback){
    let sql = `DELETE FROM portion WHERE id='${id}'`
    connection.query(sql, function (err, result) {
        if (err) throw err;
        callback(result);
    });
}

function insertPortion(portion, callback){
    let productString = JSON.stringify(portion.productJson._source);
    var sql = `INSERT INTO portion (user_id, product_json, quantity, date)
    	VALUES (
            ${portion.user.id}, 
            '${productString}',
            ${portion.quantity},
            '${portion.date}'
        )`;
    connection.query(sql, function (err, result) {
        if (err) throw err;
        callback(result);
        console.log(`Portion inserted with id ${result.insertId}.`);
    });   
}

function insertUserNeeds(userNeeds){
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
        console.log(`UserNeed inserted with id ${result.insertId}.`);
    });   	
}

async function getUserNeedsValues(userId, callback){
    var sql = `SELECT energy, protein, fat, carbohydrates FROM user_needs WHERE user_id = ${userId}`;
    connection.query(sql, function (err, result) {
        if (err) throw err;
        callback(result);
    });   	
}

module.exports = {
    insertUser: insertUser,
    insertPortion: insertPortion,
    insertUserNeeds: insertUserNeeds,
    getUsersList: getUsersList,
    findPortion: findPortion,
    deletePortion: deletePortion,
    updatePortionQuantity : updatePortionQuantity,
    getUsersNeedsList : getUsersNeedsList,
    getUserNeedsValues : getUserNeedsValues
};