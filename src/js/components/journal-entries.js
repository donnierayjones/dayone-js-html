import React from 'react';
import JournalEntry from './journal-entry';

export default class JournalEntries extends React.Component {
  render() {
    return (
      <div>
      {this.props.entries.map(function(entry, i) {
        return (
          <JournalEntry entry={entry} />
        );
      }, this)}
      </div>
    )
  }
}
