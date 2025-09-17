
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const sentences = [];

const commands = [
    new SlashCommandBuilder()
        .setName('등록')
        .setDescription('문장을 등록합니다')
        .addStringOption(option =>
            option.setName('문장')
                .setDescription('등록할 문장')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('랜덤')
        .setDescription('등록된 문장 중 하나를 랜덤으로 출력합니다'),
    new SlashCommandBuilder()
        .setName('목록')
        .setDescription('등록된 모든 문장을 확인합니다'),
    new SlashCommandBuilder()
        .setName('삭제')
        .setDescription('등록된 문장 중 하나를 삭제합니다')
        .addIntegerOption(option =>
            option.setName('번호')
                .setDescription('삭제할 문장의 번호 (목록에서 확인)')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('설명')
        .setDescription('봇 사용 설명서를 보여줍니다'),
    // 추가 명령어는 여기에 작성
];

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    // 모든 서버에 슬래시 명령어 등록
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN || "MTQxNzc3MzYyODE1MzY1OTUyNQ.GfHu9d.pIyMChMc13d-9PrvTzsOLNe2EpLAErDfwXFW_k");
    for (const guild of client.guilds.cache.values()) {
        try {
            await rest.put(
                Routes.applicationGuildCommands(client.user.id, guild.id),
                { body: commands.map(cmd => cmd.toJSON()) }
            );
            console.log(`명령어 등록 완료: ${guild.name}`);
        } catch (error) {
            console.error(`명령어 등록 실패 (${guild.name}):`, error);
        }
    }
});

client.on('guildCreate', async guild => {
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN || "MTQxNzc3MzYyODE1MzY1OTUyNQ.GfHu9d.pIyMChMc13d-9PrvTzsOLNe2EpLAErDfwXFW_k");
    try {
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, guild.id),
            { body: commands.map(cmd => cmd.toJSON()) }
        );
        console.log(`명령어 등록 완료: ${guild.name}`);
    } catch (error) {
        console.error(`명령어 등록 실패 (${guild.name}):`, error);
    }
});

client.on('interactionCreate', async interaction => {
    // 슬래시 명령어 처리
    if (!interaction.isCommand()) return;

    if (interaction.commandName === '설명') {
        const helpText =
            '/등록 [문장] - 문장을 등록합니다. 여러 문장은 /로 구분해 한 번에 등록 가능합니다.\n'
            + '/랜덤 - 등록된 문장 중 하나를 랜덤으로 출력합니다.\n'
            + '/목록 - 등록된 모든 문장을 확인합니다.\n'
            + '/삭제 [번호] - 해당 번호의 문장을 삭제합니다. (번호는 /목록에서 확인)\n'
            + '/설명 - 봇 사용 설명서를 보여줍니다.';
        await interaction.reply(helpText);
    }

    if (interaction.commandName === '등록') {
        const input = interaction.options.getString('문장');
        const newSentences = input.split('/').map(s => s.trim()).filter(s => s.length > 0);
        sentences.push(...newSentences);
        if (newSentences.length === 1) {
            await interaction.reply(`문장이 등록되었습니다: "${newSentences[0]}".`);
        } else {
            await interaction.reply(`총 ${newSentences.length}개의 문장이 등록되었습니다.`);
        }
    }

    if (interaction.commandName === '랜덤') {
        if (sentences.length === 0) {
            await interaction.reply('등록된 문장이 없습니다. "/등록 [문장]" 명령어로 문장을 등록해주세요.');
        } else {
            const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
            await interaction.reply(randomSentence + '.');
        }
    }

    if (interaction.commandName === '목록') {
        if (sentences.length === 0) {
            await interaction.reply('등록된 문장이 없습니다.');
        } else {
            const list = sentences.map((s, i) => `${i + 1}. ${s}.`).join('\n');
            await interaction.reply(`등록된 문장 목록:\n${list}`);
        }
    }

    if (interaction.commandName === '삭제') {
        const idx = interaction.options.getInteger('번호') - 1;
        if (idx < 0 || idx >= sentences.length) {
            await interaction.reply('올바른 번호를 입력해 주세요. (목록에서 확인 가능).');
        } else {
            const removed = sentences.splice(idx, 1);
            await interaction.reply(`문장이 삭제되었습니다: "${removed[0]}."`);
        }
    }
});



client.login(process.env.BOT_TOKEN || "여기에 토큰을 입력하세요");
