var Episode = React.createClass({
  mixins: [PressAccordionElementMixin],

  propTypes: {
    objectId: React.PropTypes.string.isRequired,
    number: React.PropTypes.number.isRequired,
    title: React.PropTypes.string.isRequired,
    summary: React.PropTypes.string.isRequired,
    watched: React.PropTypes.bool.isRequired,
    airDate: React.PropTypes.number.isRequired,
  },

  getInitialState: function() {
    return {'watched': true, 'aired': false};
  },

  componentWillMount: function() {
    this.intervals = [];
  },

  setInterval: function() {
    this.intervals.push(setInterval.apply(null, arguments));
  },

  componentWillUnmount: function() {
    this.intervals.map(clearInterval);
  },

  componentDidMount: function() {
    this.setState({
      'watched': this.props.watched,
    });
    this.updateAiredState();
    this.setInterval(this.updateAiredState, 1000 * 60);
  },

  updateAiredState: function() {
    this.setState({
      'aired': this.props.airDate * 1000 < Date.now()
    });
  },

  render: function() {
    function addPadding(number, len) {
      var x = 0;
      for (var i = 0; i < len; ++i) {
        x = 10 * x + 9;
      }
      if (number <= x) {
        number = (Array(len).join('0') + number).slice(-len);
      }
      return number;
    }
    var requestBase = {
      data: {'objectId': this.props.objectId},
      method: 'POST',
    };
    var episode = this;
    function watch() {
      $.ajax($.extend({}, requestBase, {
        url: '/watch_episode',
        success: function(data) {
          if (data) {
            episode.setState({'watched': true});
          }
        }
      }));
    }
    function unwatch() {
      $.ajax($.extend({}, requestBase, {
        url: '/unwatch_episode',
        success: function(data) {
          if (data) {
            episode.setState({'watched': false});
          }
        }
      }));
    }

    var header = (
      <span>
        {this.props.number}{'. '}
        {this.props.title}
      </span>
    );
    if (this.state.watched) {
      var watchPart = <PressButton
        label='I haven’t seen this episode'
        onClick={unwatch}
      />
    } else {
      var watchPart = <PressButton
        label='I’ve seen this episode'
        onClick={watch}
      />
    }
    var airDateObj = new Date(this.props.airDate * 1000);
    var airDate = (
      <span>
        {addPadding(airDateObj.getUTCMonth() + 1, 2)}/
        {addPadding(airDateObj.getUTCDate(), 2)}/
        {addPadding(airDateObj.getUTCFullYear(), 4)}
      </span>
    );
    if (this.state.aired) {
      var datePart = <p>Aired on: {airDate}</p>;
    } else {
      var datePart = <p>Will air on: {airDate}</p>;
    }
    var summaryPart = <span></span>
    if (this.props.summary.length > 0) {
      summaryPart = <p>Summary: {this.props.summary}</p>;
    }
    var body = (
      <div>
        <p>{watchPart}</p>
        <p>Episode number: {this.props.number}</p>
        <p>{datePart}</p>
        {summaryPart}
      </div>
    );
    return this.renderElement(header, body);
  }
});
