const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: "localhost",
    user: "nos",
    password: "NosNos92@",
    database: "food_calc"
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

function findPortion(id, callback){
    let sql = `SELECT * FROM portion WHERE id='${id}'`
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

function mysql_real_escape_string (str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\"+char; // prepends a backslash to backslash, percent,
                                  // and double/single quotes
        }
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
    getUsersList: getUsersList,
    findPortion: findPortion,
    deletePortion: deletePortion
};