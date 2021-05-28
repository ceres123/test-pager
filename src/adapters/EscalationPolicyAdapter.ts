import BaseAdapter from "./BaseAdapter"

export enum TargetType {
  Mail = "MAIL",
  Sms = "SMS"
};

export type Target = {
  type: TargetType,
  recipient: string
};

export type Level = {
  order: number,
  targets: Target[]
};

export type EscalationPolicy = {
  levels: Level[]
  service_id: string
};


export class EscalationPolicyAdapter extends BaseAdapter {
  //@ts-ignore
  async getEscalationPolicyAsync(serviceId: string): Promise<EscalationPolicy> {
    this.log.info("getEscalationPolicyAsync")
  }
  //@ts-ignore
  async getTargetsByLevelAsync(serviceId: string, level: number): Promise<Target[]> {
    this.log.info("getTargetsByLevelAsync");
  }
  //@ts-ignore
  async editEscalationPolicyAsync(serviceId: string): Promise<EscalationPolicy> {
    this.log.info("editEscalationPolicyAsync")
  }
};
