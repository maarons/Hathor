var newController = function() {
  var content =
    <TVSeriesEdit
      title={''}
      wikipediaArticle={''}
      objectId={''}
      submitLabel='Create'
    />;
  return {
    'toolbar':
      <div>
        <PressNavigationButton
          label='Back'
          uri='/'
          className='press-right'
        />
        <h1>New TV series</h1>
      </div>,
    'content': <PressCard content={content}/>
  };
}
