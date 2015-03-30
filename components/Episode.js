var Episode = React.createClass({
  mixins: [PressAccordionElementMixin],

  propTypes: {
    objectId: React.PropTypes.string.isRequired,
    number: React.PropTypes.number.isRequired,
    title: React.PropTypes.string.isRequired,
    summary: React.PropTypes.string.isRequired,
    watched: React.PropTypes.bool.isRequired,
    airDate: React.PropTypes.number.isRequired,
    onChangeWatched: React.PropTypes.func.isRequired,
  },

  getInitialState: function() {
    return {'aired': false};
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
    this.updateAiredState();
    this.setInterval(this.updateAiredState, 1000 * 60);
  },

  updateWatched: function(state) {
    this.props.onChangeWatched(this.props.objectId, state);
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
    var this_ = this;
    function watchRequest(watched) {
      $.ajax({
        url: '/watch_episode',
        data: {'objectId': this_.props.objectId, 'watched': watched},
        method: 'POST',
        success: function(data) {
          if (data['success']) {
            this_.updateWatched(watched);
          }
        }
      });
    }

    var headerInfo = '';
    if (!this.state.aired) {
      headerInfo = 'not available';
    } else if (!this.props.watched) {
      headerInfo = 'not seen';
    }
    var header = (
      <span>
        {this.props.number}{'. '}
        {this.props.title}
        <span className='press-right'>{headerInfo}</span>
      </span>
    );
    var watchPart = null;
    if (this.props.watched) {
      watchPart = <PressButton
        label='I haven’t seen this episode'
        onClick={function() { watchRequest(false); }}
      />
    } else {
      watchPart = <PressButton
        label='I’ve seen this episode'
        onClick={function() { watchRequest(true); }}
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
