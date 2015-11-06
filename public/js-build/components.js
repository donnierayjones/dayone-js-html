var JournalPhoto = React.createClass({
  getShrinkedImage: function (entry) {
    var _this = this;
    if (entry.hasShrinkedPhoto() === false) {
      entry.shrinkPhoto(function () {
        _this.setState({
          loaded: true,
          dataURL: entry.getShrinkedPhotoDataURL()
        });
      });
    } else {
      this.setState({
        loaded: true,
        dataURL: entry.getShrinkedPhotoDataURL()
      });
    }
  },
  componentDidMount: function () {
    this.getShrinkedImage(this.props.entry);
  },
  componentWillReceiveProps: function (nextProps) {
    if (nextProps.entry != this.props.entry) {
      this.replaceState(this.getInitialState());
      this.getShrinkedImage(nextProps.entry);
    }
  },
  getInitialState: function () {
    return {
      loaded: false,
      dataURL: ''
    };
  },
  render: function () {
    return this.state.loaded === true ? React.createElement("img", { className: "do-entry-photo", src: this.state.dataURL }) : React.createElement(
      "div",
      { className: "do-entry-photo do-entry-photo-loading" },
      "Loading ..."
    );
  }
});

var JournalEntry = React.createClass({
  render: function () {
    var photoHtml = this.props.entry.hasPhoto() ? React.createElement(JournalPhoto, { entry: this.props.entry }) : React.createElement("span", null);
    return React.createElement(
      "div",
      { className: "row do-entry" },
      React.createElement(
        "div",
        { className: "col-lg-10 col-md-9 col-sm-8 col-xs-12" },
        photoHtml,
        React.createElement(
          "div",
          { className: "do-entry-date visible-xs" },
          this.props.entry.creationDate(),
          ' ',
          this.props.entry.creationTime()
        ),
        React.createElement("div", { className: "do-entry-text", dangerouslySetInnerHTML: { __html: this.props.entry.text() } })
      ),
      React.createElement(
        "div",
        { className: "col-lg-2 col-md-3 col-sm-4 hidden-xs" },
        React.createElement(
          "div",
          { className: "do-entry-date" },
          this.props.entry.creationDate(),
          React.createElement("br", null),
          this.props.entry.creationTime()
        ),
        React.createElement(
          "div",
          { className: "do-entry-tags" },
          this.props.entry.tags().join(', ')
        )
      )
    );
  }
});

var JournalEntries = React.createClass({
  render: function () {
    return React.createElement(
      "div",
      null,
      this.props.entries.map(function (entry, i) {
        return React.createElement(JournalEntry, { entry: entry });
      }, this)
    );
  }
});

var TagSelector = React.createClass({
  render: function () {
    return React.createElement(
      "div",
      { className: "checkbox" },
      React.createElement(
        "label",
        null,
        React.createElement("input", { type: "checkbox", onClick: this.props.onClick, name: this.props.tag }),
        this.props.tag
      )
    );
  }
});

var DateSelector = React.createClass({
  onChange: function () {
    var value = $('input', this.getDOMNode()).val();
    this.setState({
      date: value
    });
    this.props.onChange();
  },
  getInitialState: function () {
    return {
      date: this.props.date
    };
  },
  render: function () {
    return React.createElement(
      "div",
      { className: "form-group" },
      React.createElement(
        "label",
        { htmlFor: this.props.name },
        this.props.label
      ),
      React.createElement("input", { className: "form-control", type: "date", value: this.state.date, id: this.props.name, name: this.props.name, onChange: this.onChange })
    );
  }
});

var DateSelectors = React.createClass({
  onChange: function () {
    var fromValue = $('input[name="from"]', this.getDOMNode()).val();
    var toValue = $('input[name="to"]', this.getDOMNode()).val();
    this.props.onChange(moment(fromValue), moment(toValue));
  },
  render: function () {
    return React.createElement(
      "div",
      null,
      React.createElement(
        "h4",
        null,
        "Creation Date"
      ),
      React.createElement(DateSelector, { name: "from", label: "From", date: this.props.from, onChange: this.onChange }),
      React.createElement(DateSelector, { name: "to", label: "To", date: this.props.to, onChange: this.onChange })
    );
  }
});

var TagSelectors = React.createClass({
  onChange: function () {
    var tags = [];
    $('input:checked', this.getDOMNode()).each(function (i, checkbox) {
      tags.push($(checkbox).attr('name'));
    });
    this.props.onChange(tags);
  },
  render: function () {
    return React.createElement(
      "div",
      null,
      React.createElement(
        "h4",
        null,
        "Tags"
      ),
      this.props.tags.map(function (tag, i) {
        return React.createElement(TagSelector, { tag: tag, onClick: this.onChange });
      }, this)
    );
  }
});

var JournalApp = React.createClass({
  getFilteredEntries: function (criteria) {
    var entries = this.props.entries;

    entries = _.filter(entries, function (entry) {
      return entry.creationDateTime() <= criteria.to.endOf('day').toDate() && entry.creationDateTime() >= criteria.from.startOf('day').toDate();
    });

    if (criteria.tags.length > 0) {
      entries = _.filter(entries, function (entry) {
        return _.intersection(criteria.tags, entry.tags()).length > 0;
      });
    }

    return entries;
  },
  filterEntries: function () {
    var defaults = this.getDefaults();
    this.setState({
      filteredEntries: this.getFilteredEntries({
        tags: this.tags || defaults.tags,
        from: this.from || defaults.from,
        to: this.to || defaults.to
      })
    });
  },
  onTagsChanged: function (tags) {
    this.tags = tags;
    this.filterEntries();
  },
  onDateChanged: function (from, to) {
    this.from = from;
    this.to = to;
    this.filterEntries();
  },
  getDefaults: function () {
    return {
      from: moment().subtract(1, 'months'),
      to: moment(),
      tags: []
    };
  },
  getInitialState: function () {
    var defaults = this.getDefaults();
    return {
      from: defaults.from,
      to: defaults.to,
      tags: defaults.tags,
      filteredEntries: this.getFilteredEntries(defaults)
    };
  },
  render: function () {
    return React.createElement(
      "div",
      { className: "row" },
      React.createElement(
        "div",
        { className: "col-sm-2 hidden-xs" },
        React.createElement(DateSelectors, { from: this.state.from.format('YYYY-MM-DD'), to: this.state.to.format('YYYY-MM-DD'), onChange: this.onDateChanged }),
        React.createElement(TagSelectors, { tags: this.props.tags, onChange: this.onTagsChanged })
      ),
      React.createElement(
        "div",
        { className: "col-sm-10 col-xs-12" },
        React.createElement(JournalEntries, { entries: this.state.filteredEntries })
      )
    );
  }
});

window.DayOne.renderEntries = function (entries, tags) {
  ReactDOM.render(React.createElement(JournalApp, { entries: entries, tags: tags }), document.getElementById('dayOneRenderTarget'));
};