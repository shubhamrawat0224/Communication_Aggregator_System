// Export channel modules.
// To add a new channel: create {name}.channel.js and export it here.
import * as email from "./email.channel.js";
import * as sms from "./sms.channel.js";
import * as whatsapp from "./whatsapp.channel.js";

const channels = {
  [email.name]: email,
  [sms.name]: sms,
  [whatsapp.name]: whatsapp,
};

export default channels;
