const { SlashCommandBuilder, ActionRowBuilder, UserSelectMenuBuilder, ComponentType, EmbedBuilder, ChannelType } = require('discord.js');
const { Player, Game, saveGame, directMessageUser } = require('../../helpers.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start-game')
        .setDescription('Initiates a game of Heroes and Villains.'),

    async execute(interaction) {
        const userSelect = new UserSelectMenuBuilder()
            .setCustomId('users')
            .setPlaceholder('Select multiple players. (Minimum 8)')
            .setMinValues(8)
            .setMaxValues(25);

        const row1 = new ActionRowBuilder().addComponents(userSelect);

        const response = await interaction.reply({
            content: '📝 **Select the players for this game:**',
            components: [row1],
        });

        let gameStarted = false;

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.UserSelect,
            time: 30_000
        });

        collector.on('collect', async i => {
            const userIds = i.values;
            const userNames = await Promise.all(
                userIds.map(async id => (await interaction.guild.members.fetch(id)).user.username)
            );

            // Create players
            const players = userIds.map((id, idx) => new Player({ id, username: userNames[idx] }, idx));

            const playerCount = players.length;
            const maxVillains = this.calculateMaxVillains(playerCount);
            const numVillains = getRandomInt(1, maxVillains);

            // Assign villains randomly
            const villains = [];
            while (villains.length < numVillains) {
                const randomPlayer = players[getRandomInt(0, playerCount - 1)];
                if (!randomPlayer.isVillain) {
                    randomPlayer.isVillain = true;
                    villains.push(randomPlayer);
                }
            }

            const heroes = players.filter(p => !p.isVillain);

            // DM heroes
            for (const hero of heroes) {
                directMessageUser(interaction, hero.user.id, {
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x00AE86)
                            .setTitle('🛡️ You are a Hero')
                            .setDescription('Your goal is to protect your fellow heroes and eliminate the villains.')
                            .setTimestamp()
                    ]
                });
            }

            // DM villains and collect IDs for thread
            const villainNames = villains.map(v => v.user.username).join('\n');
            const villainIDs = villains.map(v => v.user.id);

            for (const villain of villains) {
                directMessageUser(interaction, villain.user.id, {
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x8B0000)
                            .setTitle('😈 You are a Villain')
                            .setDescription(`Your fellow villains are:\n${villainNames}`)
                            .setTimestamp()
                    ]
                });
            }

            // Create private villain thread in a specific channel
            const villainChannel = interaction.guild.channels.cache.find(ch => ch.name === 'villain-chat');
            if (villainChannel && villainChannel.isTextBased()) {
                const villainThread = await villainChannel.threads.create({
                    name: `Villain Lair - Game ${Date.now()}`,
                    autoArchiveDuration: 1440, // 24 hours
                    type: ChannelType.PrivateThread,
                    reason: 'Private villain coordination for current game.'
                });

                // Add all villains to the thread
                for (const id of villainIDs) {
                    try {
                        await villainThread.members.add(id);
                    } catch (err) {
                        console.log(`Could not add ${id} to villain thread:`, err.message);
                    }
                }

                // Send intro message to villain thread
                await villainThread.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x8B0000)
                            .setTitle('🩸 Welcome to the Villain Lair')
                            .setDescription('This is your private coordination space. Plot your moves carefully...')
                            .setTimestamp()
                    ]
                });
            }

            // Save game
            const game = new Game(numVillains, maxVillains, players);
            game.livingPlayers = playerCount;
            saveGame(i, game);
            gameStarted = true;

            // Public game start announcement
            await i.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFFD700)
                        .setTitle('🎮 New Game Started!')
                        .setDescription(`A new game has begun with **${playerCount} players**.\nUse **/my-status** to learn your role.`)
                        .addFields(
                            { name: 'Number of Villains', value: `${numVillains}`, inline: true },
                            { name: 'Number of Heroes', value: `${playerCount - numVillains}`, inline: true }
                        )
                        .setTimestamp()
                ]
            });
        });

        collector.on('end', async () => {
            if (!gameStarted) {
                await interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle('⌛ Game Setup Cancelled')
                            .setDescription('The player selection time expired. Please run **/start-game** again.')
                            .setTimestamp()
                    ]
                });
            }
        });
    },

    calculateMaxVillains(playerCount) {
        if (playerCount >= 8 && playerCount <= 10) return 2;
        if (playerCount <= 15) return 3;
        if (playerCount <= 20) return 4;
        if (playerCount <= 25) return 5;
        throw new Error(`Invalid player count: ${playerCount}`);
    }
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
