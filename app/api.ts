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
  return fetch("ric/api/v1/objects?where.model=613f3bc9e0f250001005190f&where.model=613f3bf6e0f2500010051916").then((resp) => resp.json());
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
