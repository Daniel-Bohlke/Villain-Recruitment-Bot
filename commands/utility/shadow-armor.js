const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { getGame, findPlayer, saveGame, directMessageUser } = require('../../helpers.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shadow-armor')
    .setDescription('Grants Shadow Armor to a player.')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user you would like to give the Shadow Armor to.')
        .setRequired(true)
    ),

  async execute(interaction) {
    const game = getGame(interaction);
    if (!game) return;

    const targetUser = interaction.options.getUser('user');
    const giftingPlayer = findPlayer(game.players, interaction.user.id);
    const target = findPlayer(game.players, targetUser.id);

    // Validation
    if (!giftingPlayer) return this.error(interaction, 'Error - You are not a player in the game.');
    if (!target) return this.error(interaction, `Error - User: ${targetUser.username} is not a player in the game.`);
    if (giftingPlayer.isVillain) return this.error(interaction, 'Error - You are a Villain.');
    if (!giftingPlayer.isDead) return this.error(interaction, 'Error - You are not dead.');
    if (game.villainActionReady) return this.error(interaction, 'Error - It is currently the Villains\' turn to act.');
    if (target.isDead) return this.error(interaction, 'Error - The chosen player is dead.');
    if (!game.grantingShadowArmor) return this.error(interaction, 'Error - Shadow Armor cannot be granted at this time.');
    if (!giftingPlayer.canGrantShadowArmor) return this.error(interaction, 'Error - You are not the player authorized to grant Shadow Armor at this time.');

    // Grant the Shadow Armor
    giftingPlayer.canGrantShadowArmor = false;
    game.grantingShadowArmor = false;

    // Only one Shadow Armor can exist at a time
    game.players.forEach(p => { p.shadowArmor = false; });
    target.shadowArmor = true;

    // After armor is granted, villains may take their next action
    game.villainActionReady = true;

    game.players[giftingPlayer.index] = giftingPlayer;
    game.players[target.index] = target;
    saveGame(interaction, game);

    // DM the recipient
    await directMessageUser(interaction, targetUser.id, {
      embeds: [
        new EmbedBuilder()
          .setColor(0xFFD700)
          .setTitle('🛡️ Shadow Armor Granted')
          .setDescription('You have been bestowed with the **Shadow Armor**. You cannot die until another Hero falls.')
          .setTimestamp()
      ]
    });

    // Confirmation to granting player
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xFFD700)
          .setTitle('✅ Shadow Armor Granted')
          .setDescription(`The Shadow Armor has been granted to **${targetUser.username}**. The game may now continue.`)
          .setTimestamp()
      ]
    });

    // Public vague message (identity hidden, but clearly Shadow Armor)
    await interaction.channel.send('🛡️ The **Shadow Armor** has been granted to a hero, but their identity remains hidden...');
  },

  error(interaction, message) {
    return interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
  }
};
