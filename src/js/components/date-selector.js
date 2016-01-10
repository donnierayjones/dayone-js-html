import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

export default class DateSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: props.date
    };

    this.onChange = this.onChange.bind(this)
  }

  onChange() {
    var value = $('input', ReactDOM.findDOMNode(this)).val();
    this.setState({
      date: value
    });

    if(this.changeTimeout) {
      clearTimeout(this.changeTimeout);
    }

    this.changeTimeout = setTimeout(() => {
      this.props.onChange();
    }, 200);
  }

  render() {
    return (
      <div className="form-group">
        <label htmlFor={this.props.name}>{this.props.label}</label>
        <input className="form-control" type="date" value={this.state.date} id={this.props.name} name={this.props.name} onChange={this.onChange} />
      </div>
    );
  }
}

