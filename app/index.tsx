import React from "react";
import ReactDom from "react-dom";
import { Device, getDevices, getPackets, Packet } from "./api";

import { Auth } from "./Auth";

import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  YAxis,
  Brush,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import "./index.css";

const COLORS = [
  "#1890FF",
  "#2FC25B",
  "#FACC14",
  "#738AE6",
  "#8543E0",
  "#DD81E6",
  "#FA7D92",
  "#F04864",
  "#13C2C2",
];

const PARAMS = [
  "temperature",
  "humidity",
  "height",
  "speed",
  "satellites",
  "isRent",
];

document.title = "Hello";

function ListItem(props) {
  return (
    <div className={`device ${props.className}`} onClick={props.onClick}>
      <div className="device-id">{props.id}</div>
      <div className="device-name">{props.name}</div>
    </div>
  );
}

function ValueBox(props) {
  return (
    <div className="value-box">
      <div className="value-title">{props.title ?? "Unknown"}</div>
      <div className="value-value">{(props.value ?? "-").toString()}</div>
    </div>
  );
}

type AppState = {
  device: Device;
  packets: Packet[];
};

class App extends React.Component<{ devices: Device[] }, AppState> {
  state: AppState = {
    device: this.props.devices[0],
    packets: [],
  };

  componentDidMount() {
    if (!this.state.packets.length) {
      this.loadPackets(this.state.device);
    }
  }

  setSelected(device: Device) {
    this.setState({ device, packets: [] });
    this.loadPackets(device);
  }

  async loadPackets(device: Device) {
    let packets = await getPackets(device._id);

    packets = packets.sort((a, b) => +a.time - +b.time);
    packets = packets.slice(-1000);

    for (const p of packets) {
      p.time = new Date(p.time);
    }

    this.setState({ packets });
  }

  getDeviceList() {
    return this.props.devices.map((dev) => (
      <ListItem
        key={dev._id}
        id={dev._id}
        name={dev.name}
        className={dev === this.state.device ? "selected" : ""}
        onClick={() => this.setSelected(dev)}
      />
    ));
  }

  render() {
    const packet = (this.state.device?.state ?? {}) as Packet;

    const params = PARAMS.filter((k) => packet[k] !== undefined);

    const values = params.map((k) => (
      <ValueBox key={k} title={k} value={packet[k]} />
    ));

    const lines = params.map((k, i) => (
      <Line
        key={k}
        stroke={COLORS[i]}
        type="linear"
        dataKey={k}
        dot={false}
        isAnimationActive={false}
      />
    ));

    const chart = (
      <ResponsiveContainer>
        <LineChart data={this.state.packets}>
          {lines}

          <Legend />
          <CartesianGrid />

          <XAxis
            dataKey="time"
            tickFormatter={(x) => {
              if (x === "auto") return ".";
              return new Date(x).toLocaleString();
            }}
          />
          <Brush />
          <YAxis />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    );

    return (
      <div className="app">
        <div className="head">head</div>
        <div className="left">{this.getDeviceList()}</div>
        <div className="main">
          <div className="value-boxes">
            {values}
            {values.length === 0 && (
              <span>нет интересующих нас параметров</span>
            )}
          </div>
          {chart}
        </div>
      </div>
    );
  }
}

let app = <div>?</div>;

try {
  const devices = await getDevices();
  app = <App devices={devices} />;
} catch (err) {
  console.error(err);

  document.title = "Auth";
  app = <Auth />;
}

ReactDom.render(app, document.getElementById("root"));
