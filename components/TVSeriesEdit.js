var TVSeriesEdit = React.createClass({
  propTypes: {
    objectId: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    wikipediaArticle: React.PropTypes.string.isRequired,
    submitLabel: React.PropTypes.string.isRequired,
  },

  getInitialState: function() {
    return {
      'title': this.props.title,
      'wikipediaArticle': this.props.wikipediaArticle,
    };
  },

  processData: function(data) {
    return data;
  },

  handleSuccess: function(ret) {
    if (ret.success) {
      PressNavigation.switchToUri(
        '/tv_series',
        {'objectId': ret.objectId, 'title': ret.title}
      );
      return true;
    } else {
      return false;
    }
  },

  handleError: function(ret) {
    return 'Save failed';
  },

  resetWikipediaTitle: function() {
    this.setState({
      'title': this.refs.title.getValue(),
      'wikipediaArticle': 'List of ' + this.refs.title.getValue() + ' episodes',
    });
  },

  render: function() {
    return (
      <PressForm
        processData={this.processData}
        submitLabel={this.props.submitLabel}
        action='/save.json'
        onSuccess={this.handleSuccess}
        onError={this.handleError}
      >
        <PressFormInput
          type='hidden'
          name='objectId'
          value={this.props.objectId}
        />
        <PressFormInput
          label='Title'
          name='title'
          value={this.state.title}
          ref='title'
        />
        <PressFormInput
          label='Wikipedia article'
          name='wikipedia_article'
          value={this.state.wikipediaArticle}
        />
        <PressButton
          label='Reset Wikipedia title'
          className='press-left'
          onClick={this.resetWikipediaTitle}
        />
        <div className='press-clear'></div>
      </PressForm>
    );
  }
});
