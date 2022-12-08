"use strict";
const { downloadContentFromMessage } = require("@adiwajshing/baileys")
const { getBuffer, fetchJson, fetchText, getRandom, getGroupAdmins, runtime, sleep, makeid } = require("../Lib/config");
const fs = require('fs')
const StickerBuilder = require('../Lib/stickerBuilder')
const sBuilder = new StickerBuilder()
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require("fluent-ffmpeg");
const { exec, spawn } = require("child_process");
ffmpeg.setFfmpegPath(ffmpegPath);
module.exports = async (shelter, bot, msg, res, _env, store, newMember) => {
    try{
        const { type, quotedMsg, mentioned, now, fromMe} = msg
        if(msg.isBaileys) return

        const chats = (type === 'conversation' && msg.message.conversation) ?
            msg.message.conversation : (type === 'imageMessage') && msg.message.imageMessage.caption ?
                msg.message.imageMessage.caption : (type === 'videoMessage') && msg.message.videoMessage.caption ?
                    msg.message.videoMessage.caption : (type === 'extendedTextMessage') && msg.message.extendedTextMessage.text ?
                        msg.message.extendedTextMessage.text : (type === 'buttonsResponseMessage') && quotedMsg.fromMe && msg.message.buttonsResponseMessage.selectedButtonId ?
                            msg.message.buttonsResponseMessage.selectedButtonId : (type === 'templateButtonReplyMessage') && quotedMsg.fromMe && msg.message.templateButtonReplyMessage.selectedId ?
                                msg.message.templateButtonReplyMessage.selectedId : (type === 'messageContextInfo') ?
                                    (msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply.selectedRowId) : (type === 'listResponseMessage') && quotedMsg.fromMe && msg.message.listResponseMessage.singleSelectReply.selectedRowId ?
                                        msg.message.listResponseMessage.singleSelectReply.selectedRowId : ""
        const command = chats.toLowerCase().split(' ')[0] || ''
        const content = JSON.stringify(msg.message)
        const from = msg.key.remoteJid
        const q = chats.slice(command.length + 1, chats.length)

        const isImage = (type === 'imageMessage')
        const isVideo = (type === 'videoMessage')
        const isSticker = (type === 'stickerMessage')
        const isQuotedMsg = (type === 'extendedTextMessage')
        const isQuotedImage = isQuotedMsg ? content.includes('imageMessage') : false
        const isQuotedAudio = isQuotedMsg ? content.includes('audioMessage') : false
        const isQuotedDocument = isQuotedMsg ? content.includes('documentMessage') : false
        const isQuotedVideo = isQuotedMsg ? content.includes('videoMessage') : false
        const isQuotedSticker = isQuotedMsg ? content.includes('stickerMessage') : false

        // Show New Message in Terminal
        // if (!isGroup && isCmd && !fromMe) {
        //     console.log('->[\x1b[1;32mCMD\x1b[1;37m]', color(moment(nay.messageTimestamp * 1000).format('DD/MM/YYYY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname))
        // }
        // if (isGroup && isCmd && !fromMe) {
        //     console.log('->[\x1b[1;32mCMD\x1b[1;37m]', color(moment(nay.messageTimestamp * 1000).format('DD/MM/YYYY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(groupName))
        // }

        switch (command){
            // Menu Commands
            case _env.menuCmd:
                console.log(from)
                shelter.sendMessage(from, {
                    text: chats
                })
                break
            // Shelter Finder API
            case _env.finderCmd:
                let contebt = chats.toString().replace(_env.finderCmd, "")
                console.log(from)
                shelter.sendMessage(from, {
                    text: contebt
                })
                break

            case _env.stickerCmd:
                sBuilder.create(_env.stickerPackName, _env.stickerAuthorName)

                if(isImage || isQuotedImage) {
                    let stream = await downloadContentFromMessage(msg.message.imageMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.imageMessage, 'image');
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk])
                    }
                    let rand1 = 'sticker/' + getRandom('.jpg');
                    let rand2 = 'sticker/' + getRandom('.webp');

                    fs.writeFileSync(`./${rand1}`, buffer)
                    ffmpeg(`./${rand1}`)
                        .on("error", console.error)
                        .on("end", () => {
                            exec(`webpmux -set exif ./sticker/data.exif ./${rand2} -o ./${rand2}`, async (error) => {
                                shelter.sendMessage(from, {
                                    sticker: fs.readFileSync(`./${rand2}`)
                                }, {
                                    quoted: msg
                                })
                                fs.unlinkSync(`./${rand1}`)
                                fs.unlinkSync(`./${rand2}`)
                                // reply("Sebagai tanda terima kasih\n *Bantu Subscribe Channel*\nhttps://www.youtube.com/channel/UCGr6-nskQkBo_bmB2ykmfVw")
                            })
                        })
                        .addOutputOptions(["-vcodec", "libwebp", "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"])
                        .toFormat('webp')
                        .save(`${rand2}`)
                }
                break
            default:
                break
        }
    }catch (e){
        console.log(e)
    }
}