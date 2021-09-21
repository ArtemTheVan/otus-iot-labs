export type Device = {
  _id: string;
  name: string;
  color: string;
  state: Packet;
};

export type Packet = {
  _id: string;
  time: number | Date;
};

export function getDevices(): Promise<Device[]> {
  return fetch("ric/api/v1/objects").then((resp) => resp.json());
}

export function getPackets(
  id: string,
  from = 0,
  to = Date.now()
): Promise<Packet[]> {
  return fetch(`ric/api/v1/objects/${id}/packets?from=${from}&to=${to}`).then(
    (resp) => resp.json()
  );
}
