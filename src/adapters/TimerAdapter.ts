import BaseAdapter from "./BaseAdapter"


class TimerAdapter extends BaseAdapter {
  async setAcknowledgementTimeoutAsync(serviceId: string): Promise<void> {
    this.log.info("setAcknowledgementTimeoutAsync")
  }

  //@ts-ignore
  async isAcknowledgementTimeoutExpiredAsync(serviceId: string): Promise<boolean> {
    this.log.info("isTimeoutExpired");
  }

}

export default TimerAdapter;
