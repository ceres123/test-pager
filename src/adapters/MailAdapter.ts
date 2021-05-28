import BaseAdapter from "./BaseAdapter"

class MailAdapter extends BaseAdapter {
  async sendMailToAsync(targetRecipient: string, message: string): Promise<void> {

    this.log.info("sendMailTo")
  }
};

export default MailAdapter;
