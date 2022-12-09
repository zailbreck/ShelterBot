const fs = require('fs')
const _env = require('../Cfg/env.json')

module.exports = class DbBuilder {
    makeLogger(_type, _msg) {
        let obj = [];
        if(!fs.existsSync(_env.botLogName)) {
            obj.push({
               type: _type,
               msg: _msg
            });
            fs.writeFile(_env.botLogName, JSON.stringify(obj), (err) => {
                if (err) return
                fs.readFileSync(_env.botLogName, "utf-8")
            });
        }else{
            console.log("Log Already Exists!")
            fs.readFile(_env.botLogName, "utf-8", (err) => {
                if (err) return
                obj = fs.readFileSync(_env.botLogName, "utf-8")
                obj = JSON.parse(obj)

                obj.push({
                    type: _type,
                    msg: _msg
                });
                fs.writeFile(_env.botLogName, JSON.stringify(obj), (err) => {
                    if (err) return
                    fs.readFileSync(_env.botLogName, "utf-8")
                });
            })
            console.log(obj)
        }
    }
}