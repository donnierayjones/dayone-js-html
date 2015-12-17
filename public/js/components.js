var JournalPhoto = React.createClass({
  render: function() {
    return (
      <img className="do-entry-photo" src={this.props.entry.getShrinkedPhotoDataURL()} />
    );
  }
});

var JournalEntry = React.createClass({
  render: function() {
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
});

var JournalEntries = React.createClass({
  render: function() {
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
});

var DateSelector = React.createClass({
  onChange: function() {
    var _this = this;

    var value = $('input', _this.getDOMNode()).val();
    this.setState({
      date: value
    });

    if(this.changeTimeout) {
      clearTimeout(this.changeTimeout);
    }

    this.changeTimeout = setTimeout(function() {
      _this.props.onChange();
    }, 200);
  },
  getInitialState: function() {
    return {
      date: this.props.date
    };
  },
  render: function() {
    return (
      <div className="form-group">
        <label htmlFor={this.props.name}>{this.props.label}</label>
        <input className="form-control" type="date" value={this.state.date} id={this.props.name} name={this.props.name} onChange={this.onChange} />
      </div>
    );
  }
});

var DateSelectors = React.createClass({
  onChange: function() {
    var fromValue = $('input[name="from"]', this.getDOMNode()).val();
    var toValue = $('input[name="to"]', this.getDOMNode()).val();
    this.props.onChange(moment(fromValue), moment(toValue));
  },
  render: function() {
    return (
      <div>
        <h4>Creation Date</h4>
        <DateSelector name="from" label="From" date={this.props.from} onChange={this.onChange} />
        <DateSelector name="to" label="To" date={this.props.to} onChange={this.onChange} />
      </div>
    );
  }
});

var TagSelector = React.createClass({
  onClick: function() {
    this.setState({
      value: $('input:checked', this.getDOMNode()).val()
    });
    this.props.onClick();
  },
  getInitialState: function() {
    return {
      value: ""
    };
  },
  render: function() {
    return (
      <tr>
        <td>
          {this.props.tagName}
        </td>
        <td className="text-center">
          <input type="radio" onClick={this.onClick} name={this.props.tagName} value="" checked={this.state.value == ""} />
        </td>
        <td className="text-center">
          <input type="radio" onClick={this.onClick} name={this.props.tagName} value="include" checked={this.state.value == "include"} />
        </td>
        <td className="text-center">
          <input type="radio" onClick={this.onClick} name={this.props.tagName} value="exclude" checked={this.state.value == "exclude"} />
        </td>
      </tr>
    );
  }
});

var TagSelectors = React.createClass({
  onChange: function() {
    var includeTags = [];
    var excludeTags = [];
    $('input:checked', this.getDOMNode()).each(function(i, radio) {
      if($(radio).val() == "include") {
        includeTags.push($(radio).attr('name'));
      }
      if($(radio).val() == "exclude") {
        excludeTags.push($(radio).attr('name'));
      }
    });
    this.props.onChange(includeTags, excludeTags);
  },
  render: function() {
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
              <TagSelector tagName={tag} onClick={this.onChange} />
            );
          }, this)}
        </tbody>
        </table>
      </div>
    );
  }
});

var JournalApp = React.createClass({
  getFilteredEntries: function(criteria, callback) {
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
      window.DayOne.renderer.showProgress();
      _.each(unloadedPhotoEntries, function(entry) {
          setTimeout(function() {
            entry.shrinkPhoto(function() {
              entriesProcessed++;
              window.DayOne.renderer.setProgress('Shrinking photos...', Math.round(entriesProcessed * 100 / unloadedPhotoEntries.length));
              if(entriesProcessed == unloadedPhotoEntries.length) {
                window.DayOne.renderer.hideProgress();
                callback(entries);
              }
            });
          }, Math.random() * 500 * unloadedPhotoEntries.length);
      });
    } else {
      callback(entries);
    }

    return entries;
  },
  filterEntries: function() {
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
  },
  onTagsChanged: function(includeTags, excludeTags) {
    this.includeTags = includeTags;
    this.excludeTags = excludeTags;
    this.filterEntries();
  },
  onDateChanged: function(from, to) {
    this.from = from;
    this.to = to;
    this.filterEntries();
  },
  getDefaults: function() {
    return {
      from: moment().subtract(1, 'months'),
      to: moment(),
      includeTags: [],
      excludeTags: [],
      tags: []
    };
  },
  componentDidMount: function() {
    var _this = this;
    this.getFilteredEntries(this.getDefaults(), function(entries) {
      _this.setState({
        filteredEntries: entries
      });
    });
  },
  getInitialState: function() {
    var defaults = this.getDefaults();
    return {
      from: defaults.from,
      to: defaults.to,
      tags: defaults.tags,
      includeTags: defaults.includeTags,
      excludeTags: defaults.excludeTags,
      filteredEntries: []
    }
  },
  render: function() {
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
});

window.DayOne = {};
window.DayOne.reactRender = function(entries, tags) {
  ReactDOM.render(
    <JournalApp entries={entries} tags={tags} />,
    document.getElementById('dayOneRenderTarget'));
};
