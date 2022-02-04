import { states, createServer, createClient, Client, ServerClient } from 'minecraft-protocol'
import * as json5 from 'json5'
import { readFileSync } from 'node:fs'
import { instanceOptions } from './lib/constants'
import { logger } from './lib/logger'

const config = json5.parse(readFileSync('./config/config.json5', 'utf8'))

const connectionOptions = {
    host: config.host || "localhost",
    port: config.port || 25565,
    version: config.version || "1.18.1",
}


const ChatMessage = require('prismarine-chat')(connectionOptions.version)
const { MessageBuilder } = require('prismarine-chat')(connectionOptions.version)
const mcData = require('minecraft-data')(connectionOptions.version)

const fishingBot = {
    enabled: true,
    bobberEntityId: mcData.entitiesArray.find(x => x.name === 'fishing_bobber').id,
    bobbers: new Set(),
    bobCount: 0,
    deltaThreshhold: -1150 // less than -1500 for legit I guess
}

logger.proxy("starting proxy instance...");

const srv = createServer(instanceOptions(connectionOptions.version))

srv.on('listening', function () {
    logger.proxy(`Server listening on 127.0.0.1`) //TODO: fix later
})

srv.on('login', function (client) {
    const addr = client.socket.remoteAddress
    let endedClient = false
    let endedTargetClient = false
    logger.proxy(`Incoming connection ${addr}`)

    client.on('end', function () {
        endedClient = true
        logger.client(`Connection closed by client ${addr}`)
        if (!endedTargetClient) { targetClient.end('End') }
    })

    client.on('error', function (err) {
        endedClient = true
        logger.proxy(`Connection error by client ${addr}`)
        console.log(err.stack)
        if (!endedTargetClient) { targetClient.end('Error') }
    })

    const targetClient = createClient({
        ...connectionOptions,
        // username: client.username,
        ...config.accounts[0],
        keepAlive: false,
        skipValidation: true
    })

    targetClient.on('connect', () => {
        // console.log(srv.clients);
        logger.bot(`Connected client ${addr} to ${connectionOptions.host} as ${targetClient.username}`)
        logger.sendToClient(`&8[&aHopper&8] &7Sucessfully connected to ${connectionOptions.host} as ${targetClient.username}`, client)
    })

    client.on('packet', function (data, meta) {
        if (targetClient.state === states.PLAY && meta.state === states.PLAY) {
            if (!endedTargetClient) {
                if (meta.name === 'chat') {
                    console.log(data);
                    const message: string = data.message;
                    if (message.indexOf("/,") === 0) {
                        try{
                            let evaled = eval(message.substring(3));
                            logger.eval(evaled);
                        } catch (e) {
                            console.error(e);
                        }
                        return
                    }
                }
                targetClient.write(meta.name, data)
            }
        }
    })

    targetClient.on('packet', function (data, meta) {
        if (!(meta.state === states.PLAY && client.state === states.PLAY)) {return}
        if (endedClient) { return }

        client.write(meta.name, data)

        if (meta.name === 'chat') {
            if (data.position === 1) {
                const message = ChatMessage.fromNotch(data.message).toString();
                logger.chatMessage(message);
            }
        }

        if (meta.name === 'set_compression') {
            client.compressionThreshold = data.threshold
        } // Set compression

        //check if spawned entity is fishing bobber
        if (meta.name === 'spawn_entity' && data.type === fishingBot.bobberEntityId) {
            console.log(data)
            if(fishingBot.enabled){
                    fishingBot.bobbers.add(data.entityId)
                    // console.log(fishingBot.bobbers)
                    logger.plugin(`[Fishing] added new bobber to tracking list: ${data.entityId}`)
            }
        }

        if (meta.name === 'entity_move_look'){
            if(fishingBot.bobbers.has(data.entityId)){
                // console.log(data.dY)
                fishingBot.bobCount++
                //TODO: rewrite it as some async function, not expression
                (async () => {
                    if(fishingBot.bobCount>=20 && data.dY<= fishingBot.deltaThreshhold){
                        logger.plugin(`[Fishing] Taking out bobber, because of position (dY: ${data.dY})`)
                        targetClient.write('use_item', {hand: 0})
                        fishingBot.bobCount = 0;
                        if(fishingBot.bobbers.size >= 10){
                            fishingBot.bobbers.clear();
                            logger.plugin('[Fishing] Cleared bobbers list')
                        }
                    }
                })()
            }
        }
    })



    targetClient.on('raw', function (buffer, meta) {
        if (client.state !== states.PLAY || meta.state !== states.PLAY) { return }
    })

    client.on('raw', function (buffer, meta) {
        if (meta.state !== states.PLAY || meta.state !== states.PLAY) { return }

    })

    targetClient.on('end', function () {
        endedTargetClient = true
        logger.bot(`Connection closed by server ${addr}`)
        if (!endedClient) { client.end('End') }
    })

    targetClient.on('error', function (err) {
        endedTargetClient = true
        logger.bot(`Connection error by server ${addr}`)
        console.log(err.stack)
        if (!endedClient) { client.end('Error') }
    })

})
