import DayOneEntry from './day-one-entry'
import DayOnePhoto from './day-one-photo'

export default class DayOneDatabase {
  constructor(journalJson, photosFolder) {
    var entries = journalJson.entries;

    this.entries = {};

    entries.forEach((entry) => {
      entry['dayOnePhotos'] = {};

      if(entry.photos) {
        entry.photos.forEach((photo) => {
          entry['dayOnePhotos'][photo['identifier']] = new DayOnePhoto(photo, photosFolder);
        });
      }

      this.entries[entry['uuid']] = new DayOneEntry(entry);
    }, this);
  }

  getEntries(criteria) {
    var entries = _.values(this.entries);

    entries = _.filter(entries, (entry) => {
      return entry.creationDateTime() <= criteria.to.endOf('day').toDate() && entry.creationDateTime() >= criteria.from.startOf('day').toDate();
    });

    if(criteria.includeTags.length > 0) {
      entries = _.filter(entries, (entry) => {
        return _.intersection(criteria.includeTags, entry.tags()).length > 0;
      });
    }

    if(criteria.excludeTags.length > 0) {
      entries = _.filter(entries, (entry) => {
        return _.intersection(criteria.excludeTags, entry.tags()).length <= 0;
      });
    }

    entries = _.sortBy(entries, (e) => {
      return e.creationDateNumeric();
    });

    return entries;
  }

  getTags() {
    var tags = [];
    _.values(this.entries).forEach((entry) => {
      entry.tags().forEach((tag) => {
        if(tags.includes(tag) === false) {
          tags.push(tag);
        }
      });
    });

    return tags.sort();
  }
}
