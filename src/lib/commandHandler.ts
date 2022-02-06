import { ServerClient } from 'minecraft-protocol';
import { logger } from './logger';
import { proxyOptions } from './options';
import * as commands from './commands/'


export async function commandHandler(msg: string, client: ServerClient) {
    console.log(commands)
    const command = msg.substring(proxyOptions.prefix.length).split(' ')[0];
    const args = msg.substring(proxyOptions.prefix.length).split(' ').slice(1);
    if (commands[command]) {
        commands[command](args);
    } else {
        logger.sendToClient(`&8[&aHopper&8] &7Unknown command: &f${command}`, client);
    }
}
