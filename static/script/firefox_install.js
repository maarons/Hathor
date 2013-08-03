var manifest_path = window.location.protocol + "//" +
  window.location.host + "/manifest.webapp";

if (!navigator.mozApps) {
  show_section("no-mozapps");
} else {
  request = navigator.mozApps.checkInstalled(manifest_path);
  request.onsuccess = function() {
    if (request.result) {
      show_section("already-installed");
    } else {
      show_section("firefox-install");
    }
  };
  request.onerror = function() {
    show_section("error");
    console.log(this.error.message);
  };
}

function show_section(name) {
  $("#install-prepare").addClass("hide");
  $("#" + name).removeClass("hide");
}

$("#firefox-install").click(function(event) {
  event.preventDefault();
  var request = navigator.mozApps.install(manifest_path);
  request.onsuccess = function() {
    show_section("success");
  };
  request.onerror = function() {
    show_section("error");
    console.log(this.error.name);
  };
});
