import BaseAdapter from "./BaseAdapter"

class SmsAdapter extends BaseAdapter {
  async sendSmsToAsync(targetRecipient: string, message: string): Promise<void> {
    this.log.info("sendSmsTo")
  }
}

export default SmsAdapter;
