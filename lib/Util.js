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
};
