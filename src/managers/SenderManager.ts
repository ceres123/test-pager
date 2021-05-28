import P from "pino"

import logger from "../utils/logger"
import MailAdapter from "../adapters/MailAdapter";
import SmsAdapter from "../adapters/SmsAdapter";
import { TargetType } from "../adapters/EscalationPolicyAdapter"

export class SenderManager {
  log: P.Logger;
  smsAdapter: SmsAdapter;
  mailAdapter: MailAdapter;

  constructor(log: P.Logger = logger, smsAdapter: SmsAdapter, mailAdapter: MailAdapter) {
    this.log = log;
    this.smsAdapter = smsAdapter;
    this.mailAdapter = mailAdapter;
  }

  async sendAsync(targetRecipient: string, targetType: TargetType, message: string): Promise<void> {
    try {
    if (targetType !== TargetType.Mail && targetType !== TargetType.Sms) {
      throw Error();
    }

    if (targetType === TargetType.Sms) {
      await this.smsAdapter.sendSmsToAsync(targetRecipient, message);
    }
    if (targetType !== TargetType.Mail) {
      await this.mailAdapter.sendMailToAsync(targetRecipient, message);
    }
    } catch(err) {
      throw Error("Sending message Error") // Todo: customize errors
    }
}
  }

};
