const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Provides information about the user.'),

    async execute(interaction) {
        const { user, member } = interaction;

        const embed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle(`👤 User Information`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Username', value: user.tag, inline: true },
                { name: 'User ID', value: user.id, inline: true },
                { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`, inline: true },
                { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true },
                { name: 'Roles', value: member.roles.cache.map(role => role.name).join(', ') || 'None', inline: false }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
