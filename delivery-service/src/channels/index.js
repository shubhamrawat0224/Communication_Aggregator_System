import * as email from "./email.sender.js";
import * as sms from "./sms.sender.js";
import * as whatsapp from "./whatsapp.sender.js";

export default {
  [email.name]: email,
  [sms.name]: sms,
  [whatsapp.name]: whatsapp,
};
