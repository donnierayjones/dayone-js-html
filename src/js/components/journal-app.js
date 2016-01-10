import React from 'react';
import moment from 'moment';
import DateSelectors from './date-selectors';
import TagSelectors from './tag-selectors';
import JournalEntries from './journal-entries';

export default class JournalApp extends React.Component {
  constructor(props) {
    super(props);

    var defaults = this.getDefaults();

    this.renderer = props.renderer;

    this.state = {
      from: defaults.from,
      to: defaults.to,
      tags: defaults.tags,
      includeTags: defaults.includeTags,
      excludeTags: defaults.excludeTags,
      filteredEntries: []
    };

    this.onDateChanged = this.onDateChanged.bind(this);
    this.onTagsChanged = this.onTagsChanged.bind(this);
  }

  getFilteredEntries(criteria, callback) {
    var entries = this.props.entries;

    entries = _.filter(entries, function(entry) {
      return entry.creationDateTime() <= criteria.to.endOf('day').toDate() && entry.creationDateTime() >= criteria.from.startOf('day').toDate();
    });

    if(criteria.includeTags.length > 0) {
      entries = _.filter(entries, function(entry) {
        return _.intersection(criteria.includeTags, entry.tags()).length > 0;
      });
    }

    if(criteria.excludeTags.length > 0) {
      entries = _.filter(entries, function(entry) {
        return _.intersection(criteria.excludeTags, entry.tags()).length <= 0;
      });
    }

    var entriesProcessed = 0;

    var unloadedPhotoEntries = _.filter(entries, function(entry) {
      return entry.hasPhoto() && entry.hasShrinkedPhoto() === false;
    })

    if(unloadedPhotoEntries.length > 0) {
      this.renderer.showProgress();
      _.each(unloadedPhotoEntries, (entry) => {
          setTimeout(() => {
            entry.shrinkPhoto(() => {
              entriesProcessed++;
              this.renderer.setProgress('Shrinking photos...', Math.round(entriesProcessed * 100 / unloadedPhotoEntries.length));
              if(entriesProcessed == unloadedPhotoEntries.length) {
                this.renderer.hideProgress();
                callback(entries);
              }
            });
          }, Math.random() * 500 * unloadedPhotoEntries.length);
      });
    } else {
      callback(entries);
    }

    return entries;
  }

  filterEntries() {
    var _this = this;
    var defaults = this.getDefaults();
    this.getFilteredEntries({
      includeTags: this.includeTags || defaults.includeTags,
      excludeTags: this.excludeTags || defaults.excludeTags,
      from: this.from || defaults.from,
      to: this.to || defaults.to
    }, function(entries) {
      _this.setState({
        filteredEntries: entries
      });
    });
  }

  onTagsChanged(includeTags, excludeTags) {
    this.includeTags = includeTags;
    this.excludeTags = excludeTags;
    this.filterEntries();
  }

  onDateChanged(from, to) {
    this.from = from;
    this.to = to;
    this.filterEntries();
  }

  getDefaults() {
    return {
      from: moment().subtract(1, 'months'),
      to: moment(),
      includeTags: [],
      excludeTags: [],
      tags: []
    };
  }

  componentDidMount() {
    var _this = this;
    this.getFilteredEntries(this.getDefaults(), function(entries) {
      _this.setState({
        filteredEntries: entries
      });
    });
  }

  render() {
    return (
      <div className="row">
      <div className="col-sm-2 hidden-xs">
      <DateSelectors from={this.state.from.format('YYYY-MM-DD')} to={this.state.to.format('YYYY-MM-DD')} onChange={this.onDateChanged} />
      <TagSelectors tags={this.props.tags} onChange={this.onTagsChanged} />
      </div>
      <div className="col-sm-10 col-xs-12">
      <JournalEntries entries={this.state.filteredEntries} />
      </div>
      </div>
    );
  }
};
