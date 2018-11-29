const mysql = require('mysql2');

const config = require('../../config/config.js').config;

const connection = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: "food_calc"
});

function getUsersList(cb){
    var sql = `SELECT * FROM user`;
    connection.query(sql, function (err, result, fields) {
        if (err) throw err;
        cb(result);
    });    
}

function getUsersNeedsList(cb){
    var sql = `SELECT * FROM user_needs`;
    connection.query(sql, function (err, result, fields) {
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

function findPortion(id, cb){
    let sql = `SELECT * FROM portion WHERE id='${id}'`
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

function insertPortion(portion, cb){
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

async function getUserNeedsValues(userId, cb){
    var sql = `SELECT energy, protein, fat, carbohydrates FROM user_needs WHERE user_id = ${userId}`;
    connection.query(sql, function (err, result) {
        if (err) throw err;
        cb(result);
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