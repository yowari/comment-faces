import dotenv from 'dotenv';
import { Client, Events, GatewayIntentBits } from 'discord.js';

dotenv.config();

import config from './config';
import { execAutocomplete, execCommand } from './interaction';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (c) => {
  // set bot status message
  c.user.setPresence({
    activities: [{ name: '/comment-faces <face-id>' }]
  });

  // MY BOTY IS READY
  console.log('comment-faces bot ready');
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    execCommand(interaction);
  } else if (interaction.isAutocomplete()) {
    execAutocomplete(interaction)
  }
});

client.login(config.token);
