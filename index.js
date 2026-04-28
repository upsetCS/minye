require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
    ],
});

client.once('clientReady', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('guildMemberAdd', async (member) => {
    const channel = await client.channels.fetch(process.env.WELCOME_CHANNEL_ID).catch(() => null);
    if (!channel) return console.log('Welcome channel not found!');

    const role = member.guild.roles.cache.get(process.env.MEMBER_ROLE_ID);
    if (role) {
        await member.roles.add(role).catch(err => console.log('Could not assing role: ', err));
    } else {
        console.log('Member role not found!');
    }

    const memberCount = member.guild.memberCount;
    const suffix = getOrdinalSuffix(memberCount);

    const welcomeEmbed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle(`👋 Welcome to ${member.guild.name}!`)
        .setDescription(
            `Hey ${member}, we're happy to have you here!\n\n` +
            `Make sure to read the rules and enjoy your stay. 🎉`
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
            { name: '📛 Username', value: member.user.tag, inline: true },
            { name: '📅 Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
        )
        .setFooter({ text: `🎊 You're our ${memberCount}${suffix} member!` })
        .setTimestamp();

    channel.send({ embeds: [welcomeEmbed] });
});

client.on('guildMemberRemove', async (member) => {
    const channel = await client.channels.fetch(process.env.GOODBYE_CHANNEL_ID).catch(() => null);
    if (!channel) return console.log('Goodbye channel not found!');

    const memberCount = member.guild.memberCount;
    const suffix = getOrdinalSuffix(memberCount);

    const goodbyeEmbed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle('😢 Someone just left...')
        .setDescription(
            `**${member.user.tag}** has left the server. We'll miss you!\n\n` +
            `We hope to see you again someday and luck in all. 👋`
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
            { name: '📛 Username', value: member.user.tag, inline: true },
            { name: '📅 Was here since', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        )
        .setFooter({ text: `We now have ${memberCount}${suffix} members.` })
        .setTimestamp();

    channel.send({ embeds: [goodbyeEmbed] });
});

function getOrdinalSuffix(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}

client.login(process.env.DISCORD_TOKEN);