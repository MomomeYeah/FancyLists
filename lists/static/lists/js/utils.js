// --------------------------------------------------
// AJAX
// --------------------------------------------------
var ajaxutil = {
  post: function(url, data_in, callback_success, html_target) {
    return $.ajax({
      type: 'POST'
    , url: url
    , data: data_in
    , crossDomain: false
    , beforeSend: function(xhr) {
        ajaxutil.ajaxBeforeSend(xhr);
      }
    , success: function(response, status, xhr) {
        ajaxutil.ajaxCallbackSuccess(response, status, xhr, callback_success, html_target);
      }
    , error: function(response, status, error) {
        if (status != 'abort') {
          ajaxutil.ajaxCallbackFailure(response, status, error, html_target);
        }
      }
    });
  }
, get: function(url, data_in, callback_success, html_target) {
    return $.ajax({
      type: 'GET'
    , url: url
    , data: data_in
    , crossDomain: false
    , success: function(response, status, xhr) {
        ajaxutil.ajaxCallbackSuccess(response, status, xhr, callback_success, html_target);
      }
    , error: function(response, status, error) {
        ajaxutil.ajaxCallbackFailure(response, status, error, html_target);
      }
    });
  }
, ajaxBeforeSend: function(xhr) {
    xhr.setRequestHeader('X-CSRFToken', ajaxutil.getCookie('csrftoken'));
}
, ajaxCallbackSuccess: function(response, status, xhr, callback_success, html_target) {
    if (response.system_code =='SUCCESS') {
      if (response.message) {
        banner.success(response.message);
      }
    } else if (response.system_code =='WARNING') {
      if (response.message) {
        banner.warning(response.message);
      }
    } else if (response.system_code == 'ERROR') {
      if (response.message !== undefined) {
        banner.error(response.message);
      } else {
        banner.error('Oops! Something went wrong!');
      }
    } else if (response.system_code == 'PERMISSION_DENIED') {
      if (response.message) {
        banner.error(response.message);
      }
      location.reload();
    }
    if (response.updateHtmlMethod && html_target) {
      if (response.updateHtmlMethod == 'APPEND') {
        html_target.append(response.insertHtml);
      } else if (response.updateHtmlMethod == 'PREPEND') {
        html_target.prepend(response.insertHtml);
      } else if (response.updateHtmlMethod == 'BEFORE') {
        html_target.before(response.insertHtml);
      } else if (response.updateHtmlMethod == 'AFTER') {
        html_target.after(response.insertHtml);
      } else if (response.updateHtmlMethod == 'REPLACE') {
        html_target.after(response.insertHtml);
        html_target.remove();
      } else if (response.updateHtmlMethod == 'REPLACE_CONTENT') {
        html_target.html(response.insertHtml);
      } else if (response.updateHtmlMethod == 'REMOVE') {
        html_target.remove();
      }
    }
    if (callback_success) { callback_success(response, status, xhr); }
  }
, ajaxCallbackFailure: function(response, status, error, html_target) {
    alert("In failure callback");
    if (status != 'abort') {
      document.write(response.responseText);
    }
  }
, getCookie: function(name) {
    var cookieValue = null, i;
    if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (i = 0; i < cookies.length; i+=1) {
        var cookie = jQuery.trim(cookies[i]);
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
, csrfSafeMethod: function(method) {
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
  }
};

// --------------------------------------------------
// Banner
// --------------------------------------------------
BannerManager = function() {
  var displayInterval;
  var timeout = 1000*1; // 2 seconds

  var show = function(type, message) {
    clearInterval(displayInterval);
    $('#banner-alert').html(message);
    $('#banner-alert').removeClass('success').removeClass('warning').removeClass('info').removeClass('alert');
    $('#banner-alert').addClass(type);
    $('#banner-alert').show();

    displayInterval = setInterval(banner.hide, timeout);
  };

  this.info = function(message) {
    show('info', message);
  };
  
  this.success = function(message) {
    show('success', message);
  };

  this.error = function(message) {
    show('alert', message);
  };

  this.warning = function(message) {
    show('warning', message);
  };

  this.hide = function() {
    $('#banner-alert').fadeOut(500);
    clearInterval(displayInterval);
  };
};

var banner = new BannerManager();