"use strict";
const fs = require('fs')
const logg = require('pino')
let _env = JSON.parse(fs.readFileSync('./Cfg/env.json'));
let session = `./${_env.botSessionName}.json`
let newMember = JSON.parse(fs.readFileSync('./Lib/GroupMember.json'))


const {
    default: makeWASocket,
    DisconnectReason,
    makeInMemoryStore,
    useSingleFileAuthState,
} = require("@adiwajshing/baileys")

const { state, saveState } = useSingleFileAuthState(session)

const { serialize } = require('./Lib/config')

function nocache(module, cb = () => {}) {
    fs.watchFile(require.resolve(module), async () => {
        await uncache(require.resolve(module))
        cb(module)
    })
}

function uncache(module = '.') {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(module)]
            resolve()
        } catch (e) {
            reject(e)
        }
    })
}

const store = makeInMemoryStore({
    logger: logg().child({
        level: 'fatal',
        stream: 'ShelterID'
    })
})

function landingPage(){
    console.clear()
    console.log('Checking Session ...')
}

const connectToWhatsApp = async () => {
    const shelter = makeWASocket({
        printQRInTerminal: true,
        logger: logg({
            level: "fatal"
        }),
        auth: state,
        browser: [_env.browserHost, _env.browserName, _env.browserVersion],
    })
    landingPage()
    store.bind(shelter.ev)
    let bot = shelter.ev

    require('./Lib/config')
    require('./Cfg/help')
    require('./Handle/msg')
    nocache('./Lib/config',_ => console.log("Update Config"))
    nocache('./Cfg/help', _ => console.log("Update Help"))
    nocache('./Handle/msg', _ => console.log("Update Messsage Handler"))

    // Check if Got New Messages
    bot.on('messages.upsert', async res => {
        if (!res.messages) return
        let msg = res.messages[0];
        msg = serialize(shelter, msg)
        msg.isBaileys = msg.key.id.startsWith('BAE5') || msg.key.id.startsWith('3EB0')
        // const from = msg.key.remoteJid

        // Call Message Handler & Passing Data
        await require('./Handle/msg')(shelter, bot, msg, res, _env, store, newMember)
    })

    // Check Current Sessions
    bot.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            console.log('Connection Close')
            lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut ?
                connectToWhatsApp() :
                console.log('Connection Expired')
        }else if (connection === 'open'){
            console.log("Connection Open")
        }
    })

    //Save New Session if Session Updated
    bot.on('creds.update', () => saveState)

    bot.on('groups.update', async () => {})

    bot.on('message-receipt.update', async () => {})


    //Send Response if Member Group Updated
    bot.on('group-participants.update', async (data) => {
        console.log('Grup Update')
        console.log(data)
        const isNew = !!newMember.includes(data.id)
        if (!isNew) {
            try {
                for (let i of data.participants) {
                    let pp_user = undefined
                    try {
                        pp_user = await shelter.profilePictureUrl(i, 'image')
                    } catch {
                        pp_user = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
                    }
                    if (data.action === "add") {
                        shelter.sendMessage(data.id, {
                            image: {
                                url: pp_user
                            },
                            caption: `Hai Domba @${i.split("@")[0]} Selamat datang`,
                            mentions: [i]
                        }).then(r => console.log(r))
                    } else if (data.action === "remove") {
                        shelter.sendMessage(data.id, {
                            image: {
                                url: pp_user
                            },
                            caption: `Byeee @${i.split("@")[0]}`,
                            mentions: [i]
                        }).then(r => console.log(r))
                    }
                }
            } catch (e) {
                console.log(e)
            }
        }
    })

    shelter.reply = (from, content, msg) => shelter.sendMessage(from, {
        text: content
    },{
        quoted: msg
    })
    return shelter
}

connectToWhatsApp()
    .catch(err => console.log(err))