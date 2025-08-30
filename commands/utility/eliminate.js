const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { getGame, findPlayer, saveGame, endGame } = require('../../helpers.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eliminate')
        .setDescription('Initiates a public vote to eliminate a player.'),

    async execute(interaction) {
        const game = getGame(interaction);
        if (!game) return this.error(interaction, 'Error - The game has not been started.');
        if (game.villainActionReady) return this.error(interaction, 'Error - It is currently the Villains\' turn to act.');

        const requestingPlayer = findPlayer(game.players, interaction.user.id);
        if (!requestingPlayer) return this.error(interaction, 'Error - You are not a player in the game.');
        if (requestingPlayer.isDead) return this.error(interaction, 'Error - Only living players may initiate a vote.');
		
		// ✅ Acknowledge right away
        await interaction.deferReply();

        await this.runVote(interaction, game, /* allowDead */ false);
    },

    async runVote(interaction, game, allowDead) {
        const eligiblePlayers = allowDead ? game.players : game.players.filter(p => !p.isDead);
        const livingPlayers = game.players.filter(p => !p.isDead);

        // Create vote buttons for each living player
        const buttons = livingPlayers.map(player =>
            new ButtonBuilder()
                .setCustomId(`vote_${player.user.id}`)
                .setLabel(player.user.username)
                .setStyle(ButtonStyle.Danger)
        );

        const rows = [];
        for (let i = 0; i < buttons.length; i += 5) {
            rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
        }

        const embed = new EmbedBuilder()
            .setColor(allowDead ? 0xAA00FF : 0xFFD700)
            .setTitle(allowDead ? '⚖️ Tie-Break Vote' : '🗳️ Elimination Vote')
            .setDescription(`Click on the button for the player you want to eliminate.\nVoting will close in **30 seconds**.`)
            .setTimestamp();

        const voteMessage = await interaction.channel.send({ embeds: [embed], components: rows });

        const votes = {};
        const collector = voteMessage.createMessageComponentCollector({ time: 30_000 });

        collector.on('collect', i => {
            const voter = findPlayer(game.players, i.user.id);
            if (!voter) {
                return i.reply({ content: 'You are not a player in this game.', flags: MessageFlags.Ephemeral });
            }
            if (!allowDead && voter.isDead) {
                return i.reply({ content: 'You cannot vote because you are dead.', flags: MessageFlags.Ephemeral });
            }

            const targetId = i.customId.replace('vote_', '');
            votes[voter.user.id] = targetId;
            i.reply({ content: `You have voted for **${game.players.find(p => p.user.id === targetId).user.username}**.`, flags: MessageFlags.Ephemeral });
        });

        collector.on('end', async () => {
            const tally = {};
            Object.values(votes).forEach(vote => {
                tally[vote] = (tally[vote] || 0) + 1;
            });

            if (Object.keys(tally).length === 0) {
                return interaction.channel.send('No votes were cast. No one is eliminated.');
            }

            const maxVotes = Math.max(...Object.values(tally));
            const candidates = Object.keys(tally).filter(id => tally[id] === maxVotes);

            if (candidates.length > 1) {
                if (!allowDead) {
                    // Run tie-break vote
                    return this.runVote(interaction, game, /* allowDead */ true);
                } else {
                    return interaction.channel.send('The tie-break vote also ended in a tie. No one is eliminated.');
                }
            }

            const eliminatedId = candidates[0];
            const eliminatedPlayer = findPlayer(game.players, eliminatedId);

            // Shadow Armor
            if (eliminatedPlayer.shadowArmor) {
                game.villainActionReady = true;
                saveGame(interaction, game);
                return interaction.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x808080)
                            .setTitle('🛡️ Elimination Blocked')
                            .setDescription(`**${eliminatedPlayer.user.username}** was protected by the **Shadow Armor** and survives!`)
                            .setTimestamp()
                    ]
                });
            }

            // Eliminate
            eliminatedPlayer.isDead = true;
            game.livingPlayers--;
            game.players[eliminatedPlayer.index] = eliminatedPlayer;

            let embedResult = new EmbedBuilder().setTimestamp();

            if (eliminatedPlayer.isVillain) {
                game.numVillains--;
                game.villainActionReady = true;
                embedResult
                    .setColor(0x00AE86)
                    .setTitle('⚔️ Villain Eliminated')
                    .setDescription(`**${eliminatedPlayer.user.username}** has been eliminated by vote.\n\nThey were a **Villain**!`);

                if (game.numVillains === 0) {
                    embedResult.addFields({ name: '🎉 Victory!', value: 'The final Villain has been eliminated — the **Heroes** have won!' });
                    endGame(interaction);
                }
            } else {
                eliminatedPlayer.canGrantShadowArmor = true;
                game.grantingShadowArmor = true;
                embedResult
                    .setColor(0xFF0000)
                    .setTitle('💔 Hero Fallen')
                    .setDescription(`**${eliminatedPlayer.user.username}** has been eliminated by vote.\n\nThey were a **Hero** and must now grant the **Shadow Armor**.`);

                if (game.numVillains > game.livingPlayers) {
                    embedResult.addFields({ name: '☠️ Villains Triumph!', value: 'The Villains now outnumber the Heroes — evil reigns supreme!' });
                    endGame(interaction);
                }
            }

            saveGame(interaction, game);
            await interaction.channel.send({ embeds: [embedResult] });
        });
    },

    error(interaction, message) {
        return interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
    }
};
