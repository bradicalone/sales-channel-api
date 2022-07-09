
const fetch = require('node-fetch');
exports.timeStamp = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes()).toString()
}


