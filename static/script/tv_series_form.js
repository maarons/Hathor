function get_metadata_names() {
  return [
    "wikipedia_episodes_article",
    "wikipedia_season_keyword",
    "wikipedia_episodes_keyword"
  ];
}

function get_metadata() {
  var metadata = $("#provider_metadata").val();
  if (metadata) {
    metadata = JSON.parse(metadata);
  } else {
    metadata = {};
  }
  var names = get_metadata_names();
  $.each(names, function(_, name) {
    if (metadata[name] !== undefined) {
      $("#" + name).val(metadata[name]);
    }
  });
}

get_metadata();

$("#wikipedia_episodes_article_reset").click(function(event) {
  event.preventDefault();
  var title = $("#tv_series_title").val();
  var article = "List of " + title + " episodes";
  $("#wikipedia_episodes_article").val(article);
});

$("#submit").click(function(event) {
  event.preventDefault();
  var names = get_metadata_names();
  var metadata = {}
  $.each(names, function(_, name) {
    metadata[name] = $("#" + name).val();
    $("#" + name).remove();
  });
  $("#provider_metadata").val(JSON.stringify(metadata));
  $("#real-submit").click();
});
