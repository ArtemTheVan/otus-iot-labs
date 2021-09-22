import React from "react";
import ReactDom from "react-dom";
import { Device, getDevices, getPackets, Packet } from "./api";

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

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

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
  [
    "temperature-inside",
    "humidity-inside",
  ],
  [
    "mass",
    "speed",
  ],
];

document.title = "Hello";

const devices = await getDevices();

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

class App extends React.Component<{}, AppState> {
  state: AppState = {
    device: devices[0],
    packets: [],
  };
  tabIndex: number = 0;

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

  params_string(index: number) {
    let params_res: string = "";
    
    for (const p of PARAMS[index]) {
      params_res += p + " ";
    }

    return (params_res);
  }

  getDeviceList() {
    console.log("getDeviceList");
    return devices.map((dev) => (
      <ListItem
        key={dev._id}
        id={dev._id}
        // name={dev.name}
        className={dev === this.state.device ? "selected" : ""}
        onClick={() => this.setSelected(dev)}
      />
    ));
  }

  render() {
    const packet = (this.state.device?.state ?? {}) as Packet;

    const device_name = (this.state.device?.name);

    let tabIndex = this.tabIndex;

    console.log(packet);

    const keys = Object.keys(packet).map(key => {
      if (!isNaN(packet[key])) {
        if (isFinite(packet[key])) {
          if (typeof(packet[key]=="number")) {
            return key;
          }
        }
      }
    })
    console.log(keys);

    const params = keys.filter(function( element ) {
      return (element !== undefined) && (PARAMS[tabIndex].includes(element));
    });

    console.log(tabIndex);
    console.log(this.tabIndex);
    console.log(params);

    const values = params.map((k) => (
      <ValueBox key={k} title={k} value={packet[k]} />
    ));

    console.log(values);

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
        <div className="head"></div>
        <div className="left">
          {(
            <span>Список объектов:</span>
          )}
          {this.getDeviceList()}
        </div>
        <div className="main">
          <div className="value-title">
            {(
              <span>Имя выбранного объекта:&nbsp;</span>
            )}
            {device_name}
          </div>
          <Tabs defaultIndex={this.tabIndex} onSelect={index => {
              console.log("tonSelectabs:");
              this.tabIndex = (index);
              this.loadPackets(this.state.device);
              console.log(this.tabIndex);
            }
          }>
          <TabList>
           <Tab>{this.params_string(0)}</Tab>
           <Tab>{this.params_string(1)}</Tab>
          </TabList>
          <TabPanel></TabPanel>
          <TabPanel></TabPanel>
          </Tabs>
          <div className="value-boxes">
            {values}
            {values.length === 0 && (
              <span>нет данных</span>
            )}
          </div>
          {chart}
        </div>
      </div>
    );
  }
}

ReactDom.render(<App />, document.getElementById("root"));
