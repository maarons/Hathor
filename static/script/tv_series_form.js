field_names = {
  // Wikipedia
  "1" : [
    "wikipedia_episodes_article",
    "wikipedia_season_keyword",
    "wikipedia_episodes_keyword",
  ],
  // Freebase
  "2" : [
    "freebase_tv_series_id",
  ],
};

function get_all_metadata_names() {
  var names = [];
  $.each(field_names, function(_, value) {
    names.push.apply(names, value);
  });
  return names;
}

function get_metadata_names() {
  return field_names[$("#provider_type").val()];
}

function get_metadata() {
  var metadata = $("#provider_metadata").val();
  if (metadata) {
    metadata = JSON.parse(metadata);
  } else {
    metadata = {};
  }
  var names = get_all_metadata_names();
  $.each(names, function(_, name) {
    if (metadata[name] !== undefined) {
      $("#" + name).val(metadata[name]);
    }
  });
}

function switch_fields() {
  $.each(field_names, function(type, _) {
    $("#provider_" + type).addClass("hide");
  });
  $("#provider_" + $("#provider_type").val()).removeClass("hide");
}

get_metadata();
switch_fields();

$("#freebase_id_hint").click(function(event) {
  event.preventDefault();
  $("#freebase_id_hint_list").empty();
  freebase_id_hint($("#tv_series_title").val(), function(data) {
    $.each(data, function(id, hint) {
      var name = hint + " — " + id;
      var link = "<a href='#' class='freebase_hint' data-id='" + id + "'>" +
                 name + "</a";
      $("#freebase_id_hint_list").append(
        $("<li>" + link + "</li>")
      );
    });
  });
});

$(document).on("click", ".freebase_hint", function(event) {
  event.preventDefault();
  var id = $(this).data("id");
  $("#freebase_tv_series_id").val(id);
});

$("#wikipedia_episodes_article_reset").click(function(event) {
  event.preventDefault();
  var title = $("#tv_series_title").val();
  var article = "List of " + title + " episodes";
  $("#wikipedia_episodes_article").val(article);
});

$("#submit").click(function(event) {
  event.preventDefault();
  var names = get_metadata_names();
  var metadata = {};
  $.each(names, function(_, name) {
    metadata[name] = $("#" + name).val();
  });
  $.each(get_all_metadata_names(), function(_, name) {
    $("#" + name).remove();
  });
  $("#provider_metadata").val(JSON.stringify(metadata));
  $("#real-submit").click();
});

$("#provider_type").change(function() {
  switch_fields();
});
