FB.Event.subscribe('auth.authResponseChange', function(response) {
  alert(response.status);
  alert(response);
  if (response.status === "connected") {
    window.location.replace(window.location.href);
  }
});
