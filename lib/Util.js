var Util = {
  fetchTVSeries: function(objectId, callback) {
    $.ajax({
      url: '/get.json',
      data: {'objectId': objectId},
      success: callback,
      error: function() {
        // TODO
      },
      dataType: 'json',
    });
  },

  uploadTVSeriesData: function(
    objectId,
    data,
    success_callback,
    error_callback
  ) {
    $.ajax({
      url: '/upload.json',
      data: {'objectId': objectId, 'data': JSON.stringify(data)},
      success: success_callback,
      error: error_callback,
      type: 'POST',
      dataType: 'json',
    });
  }
};
