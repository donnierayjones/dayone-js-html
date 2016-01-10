import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import $ from 'jquery';
import DateSelector from './date-selector';

export default class DateSelectors extends React.Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  onChange() {
    var fromValue = $('input[name="from"]', ReactDOM.findDOMNode(this)).val();
    var toValue = $('input[name="to"]', ReactDOM.findDOMNode(this)).val();
    this.props.onChange(moment(fromValue), moment(toValue));
  }

  render() {
    return (
      <div>
        <h4>Creation Date</h4>
        <DateSelector name="from" label="From" date={this.props.from} onChange={this.onChange} />
        <DateSelector name="to" label="To" date={this.props.to} onChange={this.onChange} />
      </div>
    );
  }
}
