import { ServerClient, Client } from 'minecraft-protocol';
import { inspect } from 'node:util'
import * as dayjs from 'dayjs';
import * as chalk from 'chalk';
const { MessageBuilder } = require('prismarine-chat')('1.18.1')

export const logger = {
    flares: {
        chat: chalk.bgYellow.black.bold(' CHAT '),
        proxy: chalk.bgGreen.black.bold(' PROXY '),
        client: chalk.bgCyan.black.bold(' CLIENT '),
        bot: chalk.bgBlue.black.bold(' BOT '),
        plugin: chalk.bgMagenta.black.bold(' PLUGIN '),
        eval: chalk.bgRed.black.bold(' EVAL ')
    },
    getCurrentTime: () => {
        const currentTime = dayjs().format('hh:mm A');
        return `[${currentTime}]`;
    },
    chatMessage: (msg: string) => {
        console.log(`${logger.flares.chat} ${logger.getCurrentTime()} ${msg}`);
    },
    sendToClient: (msg: string, client: ServerClient | Client) => {
        const message = MessageBuilder.fromString(msg);
        client.write('chat', { message: JSON.stringify(message), position: 0, sender: '0' });
    },
    plugin: (msg: string) => {
        console.log(`${logger.flares.plugin} ${logger.getCurrentTime()} ${msg}`);
    },
    client: (msg: string) => {
        console.log(`${logger.flares.client} ${logger.getCurrentTime()} ${msg}`);
    },
    proxy: (msg: string) => {
        console.log(`${logger.flares.proxy} ${logger.getCurrentTime()} ${msg}`);
    },
    bot: (msg: string) => {
        console.log(`${logger.flares.bot} ${logger.getCurrentTime()} ${msg}`);
    },
    eval: (msg: string|any) => {
        if (typeof msg !== 'string') {
            console.log(`${logger.flares.eval} ${logger.getCurrentTime()} ${inspect(msg)}`);
        } else {
            console.log(`${logger.flares.eval} ${logger.getCurrentTime()} ${msg}`);
        }
    }
};
