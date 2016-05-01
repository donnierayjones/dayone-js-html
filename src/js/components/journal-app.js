import React from 'react';
import moment from 'moment';
import DateSelectors from './date-selectors';
import TagSelectors from './tag-selectors';
import JournalEntries from './journal-entries';
import PDFRenderer from './../pdf-renderer'

export default class JournalApp extends React.Component {
  constructor(props) {
    super(props);

    var defaults = this.getDefaults();

    this.state = {
      from: defaults.from,
      to: defaults.to,
      tags: defaults.tags,
      includeTags: defaults.includeTags,
      excludeTags: defaults.excludeTags,
      filteredEntries: []
    };

    this.renderer = props.renderer;
    this.database = props.renderer.database;
    this.dayOneFolder = props.renderer.dayOneFolder;
    this.tags = this.database.getTags();

    this.onDateChanged = this.onDateChanged.bind(this);
    this.onTagsChanged = this.onTagsChanged.bind(this);
    this.onDownload = this.onDownload.bind(this);
  }

  getFilteredEntries(criteria, callback) {
    var entries = this.database.getEntries(criteria);
    callback(entries);
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

  onDownload() {
    var pdfRenderer = new PDFRenderer(this.state.filteredEntries);

    this.renderer.setProgress('Loading images for PDF');
    this.renderer.showProgress();

    var totalPhotos = 0;
    this.state.filteredEntries.forEach((entry) => {
      totalPhotos = totalPhotos + entry.photos().length
    });

    var i = 0;

    this.state.filteredEntries.forEach((entry) => {
      entry.photos().forEach((photo) => {
        if(photo.isBase64Loaded == false) {
          photo.loadBase64(() => {
            i = this.handleBase64ImageLoaded(i, totalPhotos, pdfRenderer);
          });
        } else {
          i = this.handleBase64ImageLoaded(i, totalPhotos, pdfRenderer);
        }
      });
    });
  }

  handleBase64ImageLoaded(i, totalPhotos, pdfRenderer) {
    i = i + 1;

    this.renderer.setProgress('Loading images for PDF (' + i + ' of ' + totalPhotos + ')');

    if(i == totalPhotos) {
      this.renderer.setProgress('Saving to PDF. Please wait.');
      setTimeout(() => {
        pdfRenderer.render(this.dayOneFolder.name + '.pdf');
        this.renderer.hideProgress();
      }, 100);
    }

    return i;
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
          <TagSelectors tags={this.tags} onChange={this.onTagsChanged} />
          <button onClick={this.onDownload} className="btn btn-primary btn-block">Download PDF</button>
        </div>
        <div className="col-sm-10 col-xs-12">
          <JournalEntries entries={this.state.filteredEntries} />
        </div>
      </div>
    );
  }
};
