import React from 'react';

export default class JournalPhoto extends React.Component {
  render() {
    return (
      <img className="do-entry-photo" src={this.props.entry.getShrinkedPhotoDataURL()} />
    );
  }
}

