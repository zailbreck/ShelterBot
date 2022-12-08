const path = require("path");
const sqlite3 = require('sqlite3').verbose()

const db = new sqlite3.Database(path.resolve('../DB/shelterDB.db'), sqlite3.OPEN_READWRITE, (err) => {
    if (err) throw err
})

module.exports = db