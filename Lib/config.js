"use strict";
const axios = require("axios");
const fs = require("fs");
const fetch = require('node-fetch')
//const jimp = require("jimp")

exports.serialize = (conn, msg) => {
    msg.isGroup = msg.key.remoteJid.endsWith('@g.us')
    try{
        const _key = Object.keys(msg.message)[0]
        msg.type = _key
    } catch {
        msg.type = null
    }
    try{
        const context = msg.message[msg.type].contextInfo.quotedMessage
        if(context["ephemeralMessage"]){
            msg.quotedMsg = context.ephemeralMessage.message
        }else{
            msg.quotedMsg = context
        }
        msg.isQuotedMsg = true
        msg.quotedMsg.sender = msg.message[msg.type].contextInfo.participant
        msg.quotedMsg.fromMe = msg.quotedMsg.sender === conn.user.id.split(':')[0]+'@s.whatsapp.net' ? true : false
        msg.quotedMsg.type = Object.keys(msg.quotedMsg)[0]
        let qtd = msg.quotedMsg
        msg.quotedMsg.chats = (qtd.type === 'conversation' && qtd.conversation) ? qtd.conversation : (qtd.type == 'imageMessage') && qtd.imageMessage.caption ? qtd.imageMessage.caption : (qtd.type == 'documentMessage') && qtd.documentMessage.caption ? qtd.documentMessage.caption : (qtd.type == 'videoMessage') && qtd.videoMessage.caption ? qtd.videoMessage.caption : (qtd.type == 'extendedTextMessage') && qtd.extendedTextMessage.text ? qtd.extendedTextMessage.text : (qtd.type == 'buttonsMessage') && qtd.buttonsMessage.contentText ? qtd.buttonsMessage.contentText : ""
        msg.quotedMsg.id = msg.message[msg.type].contextInfo.stanzaId
    }catch{
        msg.quotedMsg = null
        msg.isQuotedMsg = false
    }

    try{
        const mention = msg.message[msg.type].contextInfo.mentionedJid
        msg.mentioned = mention
    }catch{
        msg.mentioned = []
    }

    if (msg.isGroup){
        msg.sender = msg.participant
    }else{
        msg.sender = msg.key.remoteJid
    }
    if (msg.key.fromMe){
        msg.sender = conn.user.id.split(':')[0]+'@s.whatsapp.net'
    }

    msg.from = msg.key.remoteJid
    msg.now = msg.messageTimestamp
    msg.fromMe = msg.key.fromMe

    return msg
}

exports.getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`
}

exports.getBuffer = async (url, options) => {
    try {
        options ? options : {}
        const res = await axios({
            method: "get",
            url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            },
            ...options,
            responseType: 'arraybuffer'
        })
        return res.data
    } catch (e) {
        console.log(`Error : ${e}`)
    }
}

exports.fetchJson = (url, options) => new Promise(async(resolve, reject) => {
    fetch(url, options)
        .then(response => response.json())
        .then(json => {
            resolve(json)
        })
        .catch((err) => {
            reject(err)
        })
})


exports.fetchText = (url, options) => new Promise(async(resolve, reject) => {
    fetch(url, options)
        .then(response => response.text())
        .then(text => {
            resolve(text)
        })
        .catch((err) => {
            reject(err)
        })
})

exports.getGroupAdmins = function(participants){
    let admins = []
    for (let i of participants) {
        i.admin !== null ? admins.push(i.id) : ''
    }
    return admins
}

exports.runtime = function(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}

exports.removeEmojis = (string) => {
    var regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
    return string.replace(regex, '');
}

exports.calculate_age = (dob) => { // new Date("month/date/year")
    var diff_ms = Date.now() - dob.getTime();
    var age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
}

exports.sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

exports.url = (url) => {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&/=]*)/, 'gi'))
}

exports.makeid = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}
