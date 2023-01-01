import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
const images = require('../../images.json');

export const command = new SlashCommandBuilder()
  .setName('comment-faces')
  .setDescription('sends a comment face image based on r/animes')
  .addStringOption((option) =>
    option.setName('face-id')
      .setDescription('the comment face id')
      .setAutocomplete(true)
      .setRequired(true)
  );

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const faceId = interaction.options.getString('face-id', true);
  const image = images[faceId];

  if (!image) {
    console.error(`Cannot find image ${faceId}`);
    await interaction.reply('Image not found');
    return;
  }

  await interaction.reply(image);
};

export const autocomplete = async (interaction: AutocompleteInteraction) => {
  const focusedValue = interaction.options.getFocused();
  const filtered = Object.keys(images).filter((commentFace) => commentFace.includes(focusedValue)).slice(0, 25);
  await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
};
