var Episode = React.createClass({
  mixins: [PressAccordionElementMixin],

  propTypes: {
    objectId: React.PropTypes.string.isRequired,
    number: React.PropTypes.number.isRequired,
    title: React.PropTypes.string.isRequired,
    summary: React.PropTypes.string.isRequired,
    watched: React.PropTypes.bool.isRequired,
    air_date: React.PropTypes.number.isRequired,
    on_change_watched: React.PropTypes.func.isRequired,
    tv_series: React.PropTypes.object,
    season: React.PropTypes.object,
    extra_title: React.PropTypes.string,
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
    this.props.on_change_watched(this.props.objectId, state);
  },

  updateAiredState: function() {
    this.setState({
      'aired': this.props.air_date * 1000 < Date.now()
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

    var header_info = '';
    if (!this.state.aired) {
      header_info = 'not available';
    } else if (!this.props.watched) {
      header_info = 'not seen';
    }
    var title = this.props.number + '. ' + this.props.title;
    if (this.props.tv_series !== undefined && this.props.season !== undefined) {
      title = (
        this.props.tv_series.title + ' — S' + this.props.season.number + 'E' +
        addPadding(this.props.number, 2) + ' — ' + this.props.title
      );
    }
    if (this.props.extra_title !== undefined) {
      title += this.props.extra_title;
    }
    var header = (
      <span>
        {title}
        <span className='press-right'>{header_info}</span>
      </span>
    );
    var watch_part = null;
    if (this.props.watched) {
      watch_part = <PressButton
        label='I haven’t seen this episode'
        onClick={function() { watchRequest(false); }}
      />
    } else {
      watch_part = <PressButton
        label='I’ve seen this episode'
        onClick={function() { watchRequest(true); }}
      />
    }
    var air_date_obj = new Date(this.props.air_date * 1000);
    var air_date = (
      <span>
        {addPadding(air_date_obj.getUTCMonth() + 1, 2)}/
        {addPadding(air_date_obj.getUTCDate(), 2)}/
        {addPadding(air_date_obj.getUTCFullYear(), 4)}
      </span>
    );
    if (this.state.aired) {
      var date_part = <p>Aired on: {air_date}</p>;
    } else {
      var date_part = <p>Will air on: {air_date}</p>;
    }
    var summary_part = <span></span>
    if (this.props.summary.length > 0) {
      summary_part = <p>Summary: {this.props.summary}</p>;
    }
    var body = (
      <div>
        <p>{watch_part}</p>
        <p>Episode number: {this.props.number}</p>
        <p>{date_part}</p>
        {summary_part}
      </div>
    );
    return this.renderElement(header, body);
  }
});
