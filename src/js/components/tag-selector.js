import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

export default class TagSelector extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: ""
    };

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.setState({
      value: $('input:checked', ReactDOM.findDOMNode(this)).val()
    });
    this.props.onClick();
  }

  render() {
    return (
      <tr>
        <td>
          {this.props.tagName}
        </td>
        <td className="text-center">
          <input type="radio" onClick={this.onClick} name={this.props.tagName} value="" checked={this.state.value == ""} />
        </td>
        <td className="text-center">
          <input type="radio" onClick={this.onClick} name={this.props.tagName} value="include" checked={this.state.value == "include"} />
        </td>
        <td className="text-center">
          <input type="radio" onClick={this.onClick} name={this.props.tagName} value="exclude" checked={this.state.value == "exclude"} />
        </td>
      </tr>
    );
  }
};
