import * as React from "react";

export default class SimpleTable extends React.Component<{ fields: any, data: any, onClick: any }, any> {
  shouldComponentUpdate() {
    return true;
  }

  render() {
    var headercells = this.props.fields.map(function (field: any) {
      return <th key={field}>{field}</th>;
    });

    var rows = [];
    for (var i = 0; i < this.props.data.length; i++) {
      var row = this.props.fields.map((field: any) => <td key={field}>{this.props.data[i][field]}</td>);
      rows.push(<tr key={i}>{row}</tr>);
    }

    return <table className="simple_table" onClick={this.props.onClick}>
      <tbody>
        <tr>{headercells}</tr>
        {rows}
      </tbody>
    </table>;
  }
}
