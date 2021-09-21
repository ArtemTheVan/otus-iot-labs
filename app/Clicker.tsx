import React from "react";

export class Clicker extends React.Component {
  state = {
    clicks: 0,
  };

  click() {
    const { clicks } = this.state;
    this.setState({ clicks: clicks + 1 });
  }

  render() {
    return (
      <div>
        clicks: {this.state.clicks}
        <button onClick={() => this.click()}>+1</button>
      </div>
    );
  }
}
