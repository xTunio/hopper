import * as json5 from 'json5'
import { readFileSync } from 'node:fs'
const config = json5.parse(readFileSync('./config/config.json5', 'utf8'))
console.log(config)

export const connectionOptions = {
    host: "localhost",
    port: 25565,
    version: "1.18.1",
    ...config.connectionOptions
}

export const proxyOptions = {
    prefix: "/,",
    ...config.proxy
}

export const accounts = config.accounts || []