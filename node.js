// ╔════════════════════════════════════════╗
// ║🔥 Discord TrueMoney Redeem Selfbot     ║
// ║🎯 Created by Teeraphat                ║
// ║🛠 Powered by meta-truemoney-api        ║
// ╚════════════════════════════════════════╝

// **1. เพิ่ม dotenv เพื่ออ่านค่าจากไฟล์ .env**
require('dotenv').config();

const { Client } = require("discord.js-selfbot-v13");
const { Webhook, MessageBuilder } = require("minimal-discord-webhook-node");
const META_API = require("meta-truemoney-api");
const chalk = require("chalk");

// **2. ดึงค่าจาก Environment Variables แทนการระบุตรงๆ**
const token = process.env.DISCORD_TOKEN;           // 🟢 TOKEN
const phone = process.env.TMN_PHONE;             // 📞 เบอร์รับซอง TrueMoney
const webhookURL = process.env.WEBHOOK_URL;     // 🌐 Webhook แจ้งเตือน

// กำหนดรูปแบบ Regex สำหรับลิงก์ TrueMoney โดยเฉพาะ
const trueMoneyPattern = /(https:\/\/gift\.truemoney\.com\/campaign\/\?v=[a-fA-F0-9]{32,})/i;


const client = new Client({
  checkUpdate: false,
});


client.on("ready", () => {
  console.clear();
  console.log(chalk.hex("#FFA500")(`
╔════════════════════════════════════════════════╗
║ 🎉 Login สำเร็จ: ${client.user.username.padEnd(25)}║
║ 🔗 Status: พร้อมดักซองอั่งเปา TrueMoney        ║
║ 💼 Developer: Teera                        ║
╚════════════════════════════════════════════════╝
  `));
});


client.on("messageCreate", async (message) => {
  // 1. ค้นหาลิงก์ TrueMoney ในเนื้อหาข้อความทั้งหมด
  const match = message.content.match(trueMoneyPattern);


  if (match) {
    const trueMoneyLink = match[0]; // ดึงเฉพาะลิงก์ที่ตรงตามรูปแบบออกมา
    const serverName = message.guild ? message.guild.name : "Direct Message / Group DM";
    console.log(chalk.green(`📥 พบลิงก์ซองจาก [${serverName}] > เริ่ม Redeem...`));


    try {
      // 2. ใช้เฉพาะลิงก์ที่ดึงออกมาในการเรียก API
      const res = await META_API(trueMoneyLink, phone);


      if (res?.ok === 1001) {
        // 🎯 สำเร็จ
        const successEmbed = new MessageBuilder()
          .setTitle("✨ ซองอั่งเปา Redeem สำเร็จ!")
          .setDescription("``🧧`` ขอบคุณที่ใช้บริการดักซองโดย **Teera**")
          .addField("``✅`` สถานะ", "Redeem สำเร็จเรียบร้อย!")
          .addField("``👤`` เจ้าของซอง", res.name_owner || "ไม่ทราบ")
          .addField("``💸`` จำนวนเงิน", `${res.amount} บาท`)
          // 3. ใช้ลิงก์ที่ดึงมาใน Webhook
          .addField("``🔗`` ลิงก์ซอง", `[คลิกที่นี่](${trueMoneyLink})`)
          .addField("``🌍`` มาจาก", serverName)
          .setColor("#33FF99")
          .setThumbnail("https://cdn.discordapp.com/emojis/1168546545811568650.gif?size=96")
          .setFooter("Teera • ดักซองอั่งเปา", client.user.displayAvatarURL())
          .setTimestamp();


        const hook = new Webhook(webhookURL);
        await hook.send(successEmbed);


        console.log(chalk.bgGreen.black(`✅ Redeem สำเร็จ: ${res.amount} บาท จาก ${res.name_owner}`));
      } else {
        // 🚫 ล้มเหลว
        const failEmbed = new MessageBuilder()
          .setTitle("❌ Redeem ล้มเหลว!")
          .setDescription("``⚠️`` ไม่สามารถ Redeem ซองนี้ได้")
          .addField("``📄`` สถานะ", res.mes_err || "ไม่ทราบสาเหตุ")
          // 4. ใช้ลิงก์ที่ดึงมาใน Webhook
          .addField("``🔗`` ลิงก์ซอง", `[คลิกที่นี่](${trueMoneyLink})`)
          .addField("``🌍`` มาจาก", serverName)
          .setColor("#FF4C4C")
          .setThumbnail("https://cdn.discordapp.com/emojis/1168546614959650816.gif?size=96")
          .setFooter("Teera • ดักซองอั่งเปา", client.user.displayAvatarURL())
          .setTimestamp();


        const hookFail = new Webhook(webhookURL);
        await hookFail.send(failEmbed);


        console.log(chalk.bgRed.white(`❌ Redeem ล้มเหลว: ${res.mes_err || "ไม่ทราบสาเหตุ"}`));
      }
    } catch (error) {
      console.error(chalk.red(`🚫 เกิดข้อผิดพลาด: ${error.message}`));
    }
  }
});


client.login(token);
