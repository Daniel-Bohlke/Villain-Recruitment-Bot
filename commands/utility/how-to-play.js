const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('how-to-play')
        .setDescription('Explains the rules of the Heroes vs Villains game.'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle('📜 How to Play — Heroes vs Villains')
            .setDescription('A social deduction game of strategy, deception, and survival.\n')
            .addFields(
                { name: '🎭 Roles', value: 
                    '**Heroes** — Majority. Eliminate all Villains.\n' +
                    '**Villains** — Minority. Outnumber Heroes to win.\n' +
                    '**Shadow Armor** — Protects one player from a single attack or elimination.'
                },
                { name: '⚙️ Game Setup', value: 
                    '- 8–25 players are chosen via `/start-game`.\n' +
                    '- 1–5 Villains assigned based on player count.\n' +
                    '- Heroes and Villains get private role messages.\n' +
                    '- Villains are added to a private Villain Thread to coordinate.'
                },
                { name: '🌞 Day Phase (Hero Turn)', value: 
                    '1. Players vote using `/eliminate` to remove a suspected Villain.\n' +
                    '2. Tie → Tie-break vote (dead players may vote).\n' +
                    '3. If a Hero dies → they can give **Shadow Armor** to someone.\n' +
                    '4. Check win conditions.'
                },
                { name: '🌙 Night Phase (Villain Turn)', value: 
                    '**Villains choose ONE action:**\n' +
                    '1️⃣ **Assassinate** — `/assassinate` a Hero.\n' +
                    '2️⃣ **Recruit** — `/recruit` a Hero (if below villain capacity).\n\n' +
                    'If recruiting, the target gets `/respond` to accept or refuse.\n' +
                    '❗ Refusal wastes the Villain turn.'
                },
                { name: '🏆 Win Conditions', value: 
                    '- **Heroes Win** — All Villains eliminated.\n' +
                    '- **Villains Win** — Villains outnumber Heroes.'
                },
                { name: '💡 Tips', value: 
                    '- Villains should balance assassination and recruitment.\n' +
                    '- Heroes should use voting to deduce who the Villains are.\n' +
                    '- The Shadow Armor can swing the game — use it wisely!'
                }
            )
            .setFooter({ text: 'Good luck and trust no one...' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
