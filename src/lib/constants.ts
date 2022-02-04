export function instanceOptions(version: string) {
    return {
        'online-mode': true,
        port: 1337,
        host: "127.0.0.1",
        keepAlive: false,
        version: version,
        motd: " ".repeat(13) + "§f§lHopper proxy server\n" + " ".repeat(7) + "§7Transfering you between servers",
        maxPlayers: 1337,
        //copyright @Mojang, https://minecraft.fandom.com/wiki/Hopper?file=Hopper_%2528D%2529_JE8.png
        //TODO: change server icon to something custom
        favicon: 'data:image/png;base64,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',
        beforePing: function (response, client) {
            response.players.online = -420;
            response.players.max = 2137;
        }
    };
}
