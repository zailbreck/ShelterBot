let _env = require('./env.json')
exports.help = (prefix) => {
    return `Ketik ${_env.prefixCmd + _env.menuCmd} Untuk Menu`
}