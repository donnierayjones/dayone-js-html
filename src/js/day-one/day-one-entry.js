import marked from 'marked';
import moment from 'moment';
import removeMd from 'remove-markdown';

var timeZoneDifference = 6 * 60 * 60 * 1000;

export default class DayOneEntry {
  constructor(data) {
    this.data = data;
  }

  get(key) {
    return this.data[key];
  }

  UUID() {
    return this.get('uuid');
  }

  creationDateNumeric() {
    return this._creationDate().getTime();
  }

  creationDateTime() {
    return moment(this._creationDate());
  }

  creationDate() {
    return this.creationDateTime().format('MMMM Do YYYY');
  }

  creationTime() {
    return this.creationDateTime().format('h:mm a');
  }

  text() {
    return this.get('text') || "";
  }

  textWithoutInlinePhotos() {
      return removeMd(this.text().replace(/\!\[\]\(dayone-moment\:\/\/[0-9a-zA-Z]{32}\)\s*/g, ''));
  };

  html() {
    return marked(this.text());
  }

  textWithInlinePhotos() {
    var text = this.text();
    var output = [];

    var results = text.split(/(\!\[\]\(dayone-moment\:\/\/[0-9a-zA-Z]{32}\)\s*)/);

    results.forEach((result, i) => {
      if(result.search(/\!\[\]\(dayone-moment\:\/\/[0-9a-zA-Z]{32}\)\s*/) >= 0) {
        var match = result.match(/\!\[\]\(dayone-moment\:\/\/([0-9a-zA-Z]{32})\)\s*/)[1];
        if(this.data.dayOnePhotos[match]) {
          output.push({
            id: this.UUID() + i,
            type: 'photo',
            data: this.data.dayOnePhotos[match]
          });
        }
      }
      else {
        output.push({
          id: this.UUID() + i,
          type: 'text',
          data: result
        });
      }
    });

    return output;
  }

  htmlWithInlinePhotos() {
    return _.map(this.textWithInlinePhotos(), (item) => {
      if(item.type == 'text') {
        return {
          id: item.id,
          type: 'html',
          data: marked(item.data)
        };
      } else {
        return item;
      }
    });
  }

  tags() {
    return this.data.tags || [];
  }

  photos() {
    return _.values(this.data.dayOnePhotos);
  }

  hasLegacyPhoto() {
    return this.hasPhoto() && this.text().search(/\!\[\]\(dayone-moment\:\/\/[0-9a-zA-Z]{32}\)\s*/) == -1;
  }

  hasInlinePhotos() {
    return this.hasPhoto() && this.text().search(/\!\[\]\(dayone-moment\:\/\/[0-9a-zA-Z]{32}\)\s*/) >= 0;
  }

  getPhotoMD5(id) {
    return this.data.dayOnePhotos[id]['md5'];
  }

  getPhotoData(id) {
    return this.data.dayOnePhotos[id]['base64URL'];
  }

  hasPhoto() {
    return _.values(this.data.dayOnePhotos).length > 0;
  }

  _creationDate() {
    return new Date(this.get('creationDate'));
  }
}
