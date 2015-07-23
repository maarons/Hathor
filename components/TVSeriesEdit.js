var TVSeriesEdit = React.createClass({
  propTypes: {
    objectId: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    wikipediaArticle: React.PropTypes.string.isRequired,
  },

  handleSubmit: function(event) {
    event.preventDefault();
  },

  render: function() {
    return (
      <PressForm
        onSubmit={this.handleSubmit}
        submitLabel={this.props.submitLabel}
      >
        <input
          id='search-form-objectId'
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
          value={this.props.url}
        />
      </PressForm>
    );
  }
});
