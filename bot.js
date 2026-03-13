const {
Client,
GatewayIntentBits,
ActionRowBuilder,
StringSelectMenuBuilder,
Events
} = require('discord.js');

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildMessages
]
});

const TOKEN = process.env.TOKEN;

// INCOLLA QUI L'ID DEL CANALE #richieste-ruoli
const CHANNEL_ID = "1284613683523092511";

const rolesList = [
"Logistica",
"Fronte",
"Building",
"Facility"
];

client.once(Events.ClientReady, async () => {

console.log(`Bot online come ${client.user.tag}`);

const guild = client.guilds.cache.first();

if(!guild){
console.log("Server non trovato");
return;
}

const channel = guild.channels.cache.get(CHANNEL_ID);

if(!channel){
console.log("Canale richieste-ruoli non trovato");
return;
}

// controlla se il pannello esiste già
const messages = await channel.messages.fetch({limit:10});

const alreadyPanel = messages.find(m =>
m.author.id === client.user.id &&
m.components.length > 0
);

if(alreadyPanel){
console.log("Pannello ruoli già presente");
return;
}

// crea menu ruoli
const menu = new StringSelectMenuBuilder()
.setCustomId("roles_menu")
.setPlaceholder("Seleziona i tuoi ruoli")
.setMinValues(0)
.setMaxValues(4)
.addOptions([
{
label:"Logistica",
value:"Logistica"
},
{
label:"Fronte",
value:"Fronte"
},
{
label:"Building",
value:"Building"
},
{
label:"Facility",
value:"Facility"
}
]);

const row = new ActionRowBuilder().addComponents(menu);

// invia pannello
channel.send({
content:"🎖 **Seleziona i tuoi ruoli operativi**",
components:[row]
});

});

// gestione selezione ruoli
client.on(Events.InteractionCreate, async interaction => {

if(!interaction.isStringSelectMenu()) return;
if(interaction.customId !== "roles_menu") return;

const member = interaction.member;

for(const roleName of rolesList){

const role = interaction.guild.roles.cache.find(
r => r.name === roleName
);

if(!role) continue;

if(interaction.values.includes(roleName)){

if(!member.roles.cache.has(role.id)){
await member.roles.add(role);
}

}else{

if(member.roles.cache.has(role.id)){
await member.roles.remove(role);
}

}

}

// messaggio privato utente
await interaction.reply({
content:`Ruoli aggiornati: ${interaction.values.join(", ") || "nessuno"}`,
ephemeral:true
});

// log nel canale
interaction.channel.send(
`📋 ${member.user.username} ha aggiornato i ruoli: ${interaction.values.join(", ") || "nessuno"}`
);

});

client.login(TOKEN);