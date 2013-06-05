var animation_time = 200;

function pretty_ui() {
  $(".episodes").accordion({
    collapsible: true,
    active: false,
    animate: animation_time,
  });
  $(".button").button();
  $(".episode-body .watch").click(watch_episode);
  $(".episode-body .unwatch").click(unwatch_episode);
}

pretty_ui();

function reload_partial(t) {
  var p = t.parents(".reload");
  var url = p.data("url");
  if (url) {
    t.parents(".episodes").accordion("option", "active", false);
    var animation_start = $.now();
    $.getJSON(url, function(data) {
      setTimeout(function() {
        p.replaceWith(data);
        pretty_ui();
      }, animation_time - ($.now() - animation_start));
    });
    return true;
  }
  return false;
}

function watch_episode(event) {
  event.preventDefault();
  var episode_id = $(this).data("episode-id");
  var button = $(this);
  $.getJSON("/episodes/watch/?id=" + episode_id, function(data) {
    if (data === true) {
      if (!reload_partial(button)) {
        $("#episode-" + episode_id + "-header .marker").addClass("hide");
        $("#episode-" + episode_id + "-body .watch").addClass("hide");
        $("#episode-" + episode_id + "-body .unwatch").removeClass("hide");
      }
    }
  });
}

function unwatch_episode(event) {
  event.preventDefault();
  var episode_id = $(this).data("episode-id");
  var button = $(this);
  $.getJSON("/episodes/unwatch/?id=" + episode_id, function(data) {
    if (data === true) {
      if (!reload_partial(button)) {
        $("#episode-" + episode_id + "-header .marker").removeClass("hide");
        $("#episode-" + episode_id + "-body .watch").removeClass("hide");
        $("#episode-" + episode_id + "-body .unwatch").addClass("hide");
      }
    }
  });
};

$("a.confirm").click(function(event) {
  if (!confirm("Are you sure?")) {
    event.preventDefault();
  }
});
