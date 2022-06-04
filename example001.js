const { Client, Intents, MessageEmbed } = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
require("dotenv").config();
client.login(process.env.BOTTOKEN);

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

//グローバルチャット
client.on("messageCreate", message => {
    if (message.author?.bot || message.channel.name != "グローバルチャット") return;

    client.channels.cache.forEach(ch => {
        console.log(ch.name);
        if (ch.type == "GUILD_TEXT" && ch.name === "グローバルチャット") {
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

    const attachment_list = [];// 添付ファイルリスト
    message.attachments.forEach((attachment) => {// 添付ファイルをすべて参照
        const att = attachment.toJSON();// 添付ファイルをJSONに
        att.content_type = attachment.contentType;// DiscordAPIに仕様を合わせる
        attachment_list.push(att);// 添付ファイルリストに入れる
    });
    const send_msg = message.toJSON();// メッセージをJSONに
    send_msg.attachments = attachment_list;// メッセージをJSONにしたものに添付ファイルリストを入れる
    send_msg.reference = message.reference;// メッセージをJSONにしたものに返信情報を入れる
    let chid = "951753514021949441";// 接続するチャンネル ※変更しないでください
    client.channels.cache.get(chid).send({// 送信
        embeds: [{// 埋め込み(s)
            description: Buffer.from(// バッファをここから
                JSON.stringify({// オブジェクトの文字列化
                    channel: {// チャンネル情報
                        name: message.channel.name,// チャンネル名
                        id: message.channel.id// チャンネルID
                    },
                    author: {// 送信者情報
                        username: message.author.username,// ユーザー名
                        discriminator: message.author.discriminator,// ユーザーディスクリミネーター
                        id: message.author.id,// ユーザーID
                        avatarURL: message.author.avatarURL({// ユーザーアバター
                            dynamic: true,// ダイナミックを有効
                            format: "png",// pngフォーマット
                            size: 512// 512x512 px
                        }),
                        bot: message.author.bot// Botかどうか
                    },
                    guild: {// サーバー情報
                        name: message.guild.name,// サーバー名
                        id: message.guild.id,// サーバーID
                        iconURL: message.guild.iconURL({// サーバーアイコン
                            dynamic: true,// ダイナミックを有効
                            format: "png",// pngフォーマット
                            size: 256// 256x256 px
                        })
                    },
                    message: send_msg// メッセージ情報
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
            if (ch.type == "GUILD_TEXT" && ch.name === "グローバルチャット") {
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
