var TVSeriesEdit = React.createClass({
  propTypes: {
    objectId: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    wikipediaArticle: React.PropTypes.string.isRequired,
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
          value={this.props.title}
        />
        <PressFormInput
          label='Wikipedia article'
          name='wikipedia_article'
          value={this.props.wikipediaArticle}
        />
      </PressForm>
    );
  }
});
