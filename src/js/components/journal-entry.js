import React from 'react';
import JournalPhoto from './journal-photo';

export default class JournalEntry extends React.Component {
  render() {
    var photoHtml = this.props.entry.hasPhoto()
    ? <JournalPhoto entry={this.props.entry} />
    : <span/>
    return (
      <div className="row do-entry">
        <div className="col-lg-10 col-md-9 col-sm-8 col-xs-12">
          { photoHtml }
          <div className="do-entry-text-container">
            <div className="do-entry-date visible-xs">
              {this.props.entry.creationDate()}{' '}{this.props.entry.creationTime()}
            </div>
            <div className="do-entry-text" dangerouslySetInnerHTML={{__html: this.props.entry.text() }}>
            </div>
          </div>
        </div>
        <div className="col-lg-2 col-md-3 col-sm-4 hidden-xs">
          <div className="do-entry-date">
            {this.props.entry.creationDate()}<br/>
            {this.props.entry.creationTime()}
          </div>
          <div className="do-entry-tags">
            {this.props.entry.tags().join(', ')}
          </div>
        </div>
      </div>
    );
  }
}
