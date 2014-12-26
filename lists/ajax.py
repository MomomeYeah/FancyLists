from django.http import HttpResponse
from django.template import RequestContext
import json as simplejson
from django.utils.safestring import mark_safe
from django.template.loader import render_to_string

FORM_HTML_NAME          = u'ajax_modal_form_html'
MESSAGE_NAME            = u'message'
SYS_CODE_NAME           = u'system_code'
INSERT_HTML_NAME        = u'insertHtml'
CLOSE_MODAL_NAME        = u'closeModal'
UPDATE_HTML_METHOD_NAME = u'updateHtmlMethod'

SYS_CODE_SUCCESS            = u'SUCCESS'
SYS_CODE_WARNING            = u'WARNING'
SYS_CODE_ERROR              = u'ERROR'
SYS_CODE_PERMISSION_DENIED  = u'PERMISSION_DENIED'

HTML_UPDATE_APPEND  = u'APPEND'
HTML_UPDATE_PREPEND = u'PREPEND'
HTML_UPDATE_BEFORE  = u'BEFORE'
HTML_UPDATE_AFTER   = u'AFTER'
HTML_UPDATE_REPLACE = u'REPLACE'
HTML_REPLACE_CONTENT = u'REPLACE_CONTENT'
HTML_UPDATE_REMOVE  = u'REMOVE'

DEFAULT_FAILURE_MESSAGE           = u'Oops! Something went wrong with your request, please try again.'
DEFAULT_PERMISSION_DENIED_MESSAGE = u'Sorry, you do not have the required permission to perform this action.'

def success_response(request, message=None, data={}, html_update_method=None):
  datadict = dict({SYS_CODE_NAME: SYS_CODE_SUCCESS}.items() + data.items())
  datadict = _add_generic_items(datadict, message, html_update_method)
  json = simplejson.dumps(datadict)
  return HttpResponse(json, content_type='application/json')

def warning_response(request, message, data={}, close_modal=True, html_update_method=None):
  datadict = dict({SYS_CODE_NAME: SYS_CODE_WARNING, CLOSE_MODAL_NAME: close_modal}.items() + data.items())
  datadict = _add_generic_items(datadict, message, html_update_method)
  json = simplejson.dumps(datadict)
  return HttpResponse(json, content_type='application/json')

def failure_response(request, message=DEFAULT_FAILURE_MESSAGE, data={}, close_modal=True, html_update_method=None):
  datadict = dict({SYS_CODE_NAME: SYS_CODE_ERROR, CLOSE_MODAL_NAME: close_modal}.items() + data.items())
  datadict = _add_generic_items(datadict, message, html_update_method)
  json = simplejson.dumps(datadict)
  return HttpResponse(json, content_type='application/json')

def permission_denied_response(request, message=DEFAULT_PERMISSION_DENIED_MESSAGE, data={}, html_update_method=None):
  datadict = dict({SYS_CODE_NAME: SYS_CODE_PERMISSION_DENIED}.items() + data.items())
  datadict = _add_generic_items(datadict, message, html_update_method)
  json = simplejson.dumps(datadict)
  return HttpResponse(json, content_type='application/json')
  
def render_to_dict(request, template_name, context):
  datadict = {INSERT_HTML_NAME: render_to_string(template_name, RequestContext(request, context))}
  return datadict

def _add_generic_items(datadict, message, html_update_method):
  msg_data = {}
  if (message):
    msg_data = {MESSAGE_NAME: mark_safe(message)}
  update_method = ''
  if (html_update_method != None):
    update_method = html_update_method
  elif (datadict.get(INSERT_HTML_NAME) and html_update_method == None):
    update_method = HTML_UPDATE_APPEND # default if insertHtml is present but the update method is not.
  else:
    return dict(msg_data.items() + datadict.items())
  return dict({UPDATE_HTML_METHOD_NAME: update_method}.items() + msg_data.items() + datadict.items())


