const { Client, Intents, MessageEmbed } = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
require("dotenv").config();
client.login(process.env.BOTTOKEN);

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

//グローバルチャット
client.on("messageCreate", message => {
    if (message.author?.bot || !message.channel.topic?.match(/tester.gchat/)) return;

    client.channels.cache.forEach(ch => {
        console.log(ch.name);
        if (ch.type == "GUILD_TEXT" && ch.topic?.match(/tester.gchat/)) {
            var embed = new MessageEmbed({
                title: "",
                color: "RANDOM",
                description: message.content, // メッセージの内容を説明欄に
                timestamp: new Date(), // 時間を時間の欄に
                footer: {
                    icon_url: message.guild.iconURL(), // フッターのアイコンのURLをメッセージが送信されたサーバーのアイコンのURLに
                    text: message.guild.name // 文字をサーバーの名前に
                },
                image: {
                    url: message.attachments.first() || null//もしメッセージの中にファイルが有るなら、メッセージの中のはじめのファイルのURLを。無いならnull(無し)を。
                },
                author: {
                    name: message.author.tag,//メッセージの送信者のタグ付きの名前を送信者名の欄に
                    url: `https://discord.com/users/${message.author.id}`,//名前を押すとその人のプロフィールが出されるように(https://discord.com/users/ その人のID)
                    icon_url: message.author.displayAvatarURL({ format: "png" })//メッセージ送信者のアイコンのURLを送信者のアイコンの欄に
                }
            });
            ch.send({ embeds: [embed] })
                .catch(e => console.log(e));
        }
    });

    let chid = "951753514021949441";// 接続するチャンネル ※変更しないでください
    client.channels.cache.get(chid).send({// 送信
        embeds: [{// 埋め込み(s)
            description: Buffer.from(// バッファをここから
                JSON.stringify({
                    "channel": {
                        "name": message.channel.name,
                        "id": message.channel.id
                    },
                    "author": {
                        "username": message.author.username,
                        "discriminator": message.author.discriminator,
                        "id": message.author.id,
                        "avatarURL": message.author.avatarURL({ "dynamic": true, "format": "png", "size": 512 }),
                        "bot": message.author.bot
                    },
                    "guild": {
                        "name": message.guild.name,
                        "id": message.guild.id,
                        "iconURL": message.guild.iconURL({ "dynamic": true, "format": "png", "size": 256 })
                    },
                    "message": {
                        "content": message.content,
                        "id": message.id,
                        "cleanContent": message.cleanContent,
                        "reference": {
                            "channel_id": message.reference.channelId,
                            "guild_id": message.reference.guildId,
                            "message_id": message.reference.messageId
                        },
                        "attachments": message.attachments.map((attachment) => ({
                            "name": attachment.name,
                            "url": attachment.url,
                            "height": attachment.height,
                            "width": attachment.width,
                            "content_type": attachment.contentType
                        })),
                        "embeds": message.embeds
                    }
                })
            ).toString("base64")// base64でエンコード
        }]
    });
    message.delete({ timeout: 1000 }).catch((e) => message.channel.send(`メッセージを削除する際にエラーが起きました\nエラー:${e.message}`));
})
    //グローバルチャット連携
    .on("messageCreate", async (msg) => {
        if (msg.channelId !== "951753514021949441") return;// 接続するチャンネル ※変更しないでください
        if (msg.author.id === client.user.id) return;// 自分なら止める
        if (!msg.embeds[0].description) return;// 連携グローバルチャットの情報が無ければ止める

        const message = JSON.parse(// 連携メッセージ情報をオブジェクト化
            Buffer.from(msg.embeds[0].description, "base64")// base64デコード
        );

        msg.react("🤔");// 認識したことを示す

        if (message.author.bot) return msg.react("👍");// Botを弾く

        /* 以下コピペと連携用の修正 */
        client.channels.cache.forEach(ch => {
            console.log(ch.name);
            if (ch.type == "GUILD_TEXT" && ch.topic?.match(/tester.gchat/)) {
                var embed = new MessageEmbed({
                    title: "",
                    color: "RANDOM",
                    description: message.message.content, // メッセージの内容を説明欄に
                    timestamp: new Date(), // 時間を時間の欄に
                    footer: {
                        icon_url: message.guild.iconURL, // フッターのアイコンのURLをメッセージが送信されたサーバーのアイコンのURLに
                        text: message.guild.name // 文字をサーバーの名前に
                    },
                    image: {
                        url: (message.message.attachments.length) ? message.message.attachments[0].url : null//もしメッセージの中にファイルが有るなら、メッセージの中のはじめのファイルのURLを。無いならnull(無し)を。
                    },
                    author: {
                        name: `${message.author.username}#${message.author.discriminator}`,//メッセージの送信者のタグ付きの名前を送信者名の欄に
                        url: `https://discord.com/users/${message.author.id}`,//名前を押すとその人のプロフィールが出されるように(https://discord.com/users/ その人のID)
                        icon_url: message.author.avatarURL//メッセージ送信者のアイコンのURLを送信者のアイコンの欄に
                    }
                });
                ch.send({ embeds: [embed] })
                    .catch(e => console.log(e));
            }
        });
        /* 以上コピペと連携用の修正 */

        msg.react("👍");// 処理完了を示す
    });
