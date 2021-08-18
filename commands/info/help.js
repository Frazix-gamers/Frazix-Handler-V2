const {
  Message,
  Client,
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu,
  Interaction,
} = require("discord.js");

module.exports = {
  name: "help",
  /**
   *
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  run: async (client, message, args) => {
    const directories = [
      ...new Set(client.commands.map((cmd) => cmd.directory)),
    ];
    const formatString = (str) =>
      `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;
    const categories = directories.map((dir) => {
      const getCommands = client.commands
        .filter((cmd) => cmd.directory === dir)
        .map((cmd) => {
          return {
            name: cmd.name || "There is no name",
            discription: cmd.discription || "There is no discription",
          };
        });
      return {
        directory: formatString(dir),
        commands: getCommands,
      };
    });
    const embed = new MessageEmbed().setTitle("Help Menu");
    const components = (state) => [
      new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId("help-menu")
          .setPlaceholder("please select a category")
          .setDisabled(state)
          .addOptions(
            categories.map((cmd) => {
              return {
                label: cmd.directory,
                value: cmd.directory.toLowerCase(),
                discription: `Commands from ${cmd.directory} category`,
              };
            })
          )
      ),
    ];
    const initialMessage = await message.channel.send({
      embeds: [embed],
      components: components(false),
    });
    const filter = (interaction) => interaction.user.id === message.author.id;
    const collector = message.channel.createMessageComponentCollector({
      filter,
      componentType: "SELECT_MENU",
      time: 18000,
    });
    collector.on("collect", (interaction) => {
      const [directory] = interaction.values;
      const category = categories.find(
        (x) => x.directory.toLowerCase() === directory
      );

      const categoryEmbed = new MessageEmbed()
        .setTitle(`${directory} commands`)
        .setDescription("Here are the list of commands")
        .addFields(
          category.commands.map((cmd) => {
            return {
              name: `\`${cmd.name}\``,
              value: cmd.discription,
              inline: true,
            };
          })
        );

      interaction.update({ embeds: [categoryEmbed] });
    });
    collector.on("end", () => {
      initialMessage.edit({ components: components(true) });
    });
  },
};
