import BaseAdapter from "./BaseAdapter"

type Alert = {
  service_id: string
};

class AlertingAdapter extends BaseAdapter {
  receiveAlert(): Alert {
    this.log.info("receiveAlert")
    return {service_id: "service_id"}
  };
};

export default AlertingAdapter;
