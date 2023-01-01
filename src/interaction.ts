import { AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';
import { commands } from './commands';

export async function execCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  const command = commands[interaction.commandName];

  if (!command) {
    console.error(`command ${interaction.commandName} not found`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
}

export async function execAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
  const command = commands[interaction.commandName];

  if (!command || !command.autocomplete) {
    console.error(`command ${interaction.commandName} not found`);
    return;
  }

  try {
    await command.autocomplete(interaction);
  } catch (error) {
    console.error(error);
  }
}
