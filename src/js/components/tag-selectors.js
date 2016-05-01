import React from 'react';
import ReactDOM from 'react';
import TagSelector from './tag-selector';
import $ from 'jquery';

export default class TagSelectors extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange() {
    var includeTags = [];
    var excludeTags = [];
    $('input:checked', ReactDOM.findDOMNode(this)).each(function(i, radio) {
      if($(radio).val() == "include") {
        includeTags.push($(radio).attr('name'));
      }
      if($(radio).val() == "exclude") {
        excludeTags.push($(radio).attr('name'));
      }
    });
    this.props.onChange(includeTags, excludeTags);
  }

  render() {
    return (
      <div>
        <table className="table table-condensed">
        <thead>
          <tr>
            <th>Tag</th>
            <th className="text-center">-</th>
            <th className="text-center text-success">{String.fromCharCode(10004)}</th>
            <th className="text-center text-danger">{String.fromCharCode(10008)}</th>
          </tr>
        </thead>
        <tbody>
          {this.props.tags.map(function(tag, i) {
            return (
              <TagSelector key={tag} tagName={tag} onChange={this.onChange} />
            );
          }, this)}
        </tbody>
        </table>
      </div>
    );
  }
}

