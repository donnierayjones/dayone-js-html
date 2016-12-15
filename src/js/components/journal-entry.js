import React from 'react';
import JournalPhoto from './journal-photo';

export default class JournalEntry extends React.Component {
  render() {
    var legacyPhotoHtml = '';
    if(this.props.entry.hasLegacyPhoto())
    {
      legacyPhotoHtml = _.map(this.props.entry.photos(), (photo) => {
         return <JournalPhoto key={this.props.entry.UUID()} photo={photo} />;
      });
    }

    var entryText = <div className="do-entry-text" dangerouslySetInnerHTML={{__html: this.props.entry.html() }}></div>;

    if(this.props.entry.hasInlinePhotos())
    {
      entryText = _.map(this.props.entry.htmlWithInlinePhotos(), (item) => {
        if(item.type == 'photo') {
          return <JournalPhoto key={item.id} photo={item.data} />;
        }
        if(item.type == 'html') {
          return <div key={item.id} className="do-entry-text" dangerouslySetInnerHTML={{__html: item.data }}></div>
        }
      });
    }

    return (
      <div className="row do-entry">
        <div className="col-lg-3 col-md-4 col-sm-4 hidden-xs">
          <div className="do-entry-date">
            {this.props.entry.creationDate()}<br/>
            {this.props.entry.creationTime()}
          </div>
          <div className="do-entry-tags">
            {this.props.entry.tags().join(', ')}
          </div>
        </div>
        <div className="col-lg-9 col-md-8 col-sm-8 col-xs-12">
          { legacyPhotoHtml }
          <div className="do-entry-text-container">
            <div className="do-entry-date visible-xs">
              {this.props.entry.creationDate()}{' '}{this.props.entry.creationTime()}
            </div>
            { entryText }
          </div>
        </div>
      </div>
    );
  }
}
