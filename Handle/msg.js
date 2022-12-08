"use strict";
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
                                msg.message.templateButtonReplyMessage.selectedId : (type == 'messageContextInfo') ?
                                    (msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply.selectedRowId) : (type == 'listResponseMessage') && quotedMsg.fromMe && msg.message.listResponseMessage.singleSelectReply.selectedRowId ?
                                        msg.message.listResponseMessage.singleSelectReply.selectedRowId : ""
        const command = chats.toLowerCase().split(' ')[0] || ''
        const from = msg.key.remoteJid
        switch (command){
            case _env.menuCmd:
                console.log(from)
                shelter.sendMessage(from, {
                    text: chats
                })
                break
            case _env.finderCmd:
                let contebt = chats.toString().replace(_env.finderCmd, "")
                console.log(from)
                shelter.sendMessage(from, {
                    text: contebt
                })
                break
            default:
                break
        }
    }catch (e){
        console.log(e)
    }
}