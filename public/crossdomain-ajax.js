//
// Copyright 2011, Alexandru Nedelcu
//
// MIT Licensed, refer to the LICENSE file.
//

var crossdomain = (function () {

    //
    // We really need this path.  You have to either set it from the
    // external document loading this script, or load the script from
    // a <script src="... tag
    //
    try {
	var CROSSDOMAINJS_PATH = CROSSDOMAINJS_PATH;
    } catch(e) {
	var CROSSDOMAINJS_PATH = null;
    }

    //
    // Detecting absolute path of this script, if not set in the
    // external document.
    //
    if (!CROSSDOMAINJS_PATH) {
	var scripts = document.getElementsByTagName("script")
	for (var i=0; i<scripts.length; i++) {
	    var src = scripts[i].getAttribute('src');
	    if (src && src.match(/crossdomain-ajax.js/)) {
		CROSSDOMAINJS_PATH = src.replace("crossdomain-ajax.js", '');
		break;
	    }
	}
	
	// is the path relative to our document?
	if (CROSSDOMAINJS_PATH && ! CROSSDOMAINJS_PATH.match(/^(https?|HTTPS?):\/\//) && CROSSDOMAINJS_PATH.substring(0,1) != '/') 
	    CROSSDOMAINJS_PATH = (window.location + '').replace(/[^\/]*$/, '') + CROSSDOMAINJS_PATH;
	
	// we cannot go on without it
	if (!CROSSDOMAINJS_PATH) 
	    throw "crossdomain-ajax.js cannot work without CROSSDOMAINJS_PATH. Please set it before loading this script.";
    }

    // used by async_load_javascript
    var FILES_INCLUDED = {};
    var FILES_LOADING  = {}; // for avoiding race conditions
    var REGISTERED_CALLBACKS = {};

    //
    // Used to test if an object is a primitive or an Object.
    //
    function type(obj){
	return Object.prototype.toString.call(obj).match(/^\[object (.*)\]$/)[1]
    }

    function is_iexplorer() { 
	return navigator.userAgent.indexOf('MSIE') !=-1 
    }

    // used by async_load_javascript
    function register_callback(file, callback) {
	if (!REGISTERED_CALLBACKS[file])
	    REGISTERED_CALLBACKS[file] = new Array();
	REGISTERED_CALLBACKS[file].push(callback);
    }

    // used by async_load_javascript
    function execute_callbacks(file) {
	while (REGISTERED_CALLBACKS[file].length > 0) {
	    var callback = REGISTERED_CALLBACKS[file].pop();
	    if (callback) callback();
	}
    }

    //
    // Loads a Javascript file asynchronously, executing a `callback`
    // if/when file gets loaded.
    //
    function async_load_javascript(file, callback) {
	register_callback(file, callback);

	if (FILES_INCLUDED[file]) {
	    execute_callbacks(file);
	    return true;
	}
	if (FILES_LOADING[file]) 
	    return false;

	FILES_LOADING[file] = true;

	var html_doc = document.getElementsByTagName('head')[0];
	js = document.createElement('script');
	js.setAttribute('type', 'text/javascript');
	js.setAttribute('src', file);
	html_doc.appendChild(js);

	js.onreadystatechange = function () {
            if (js.readyState == 'complete' || js.readyState == 'loaded') {
		if (! FILES_INCLUDED[file]) {
		    FILES_INCLUDED[file] = true;
		    execute_callbacks(file);
		}
            }
	};

	js.onload = function () {
	    if (! FILES_INCLUDED[file]) {
		FILES_INCLUDED[file] = true;
		execute_callbacks(file);
	    }
	};

	return false;
    }

    //
    // Does a request using flXHR (the Flash module).
    // Assumes flXHR.js is already loaded.
    //
    function _ajax_with_flxhr(options) {
	var url     = options['url'];
	var type    = options['type'] || 'GET';
	var success = options['success'];
	var error   = options['error'];
	var data    = options['data'];

	function handle_load(XHRobj) {
	    if (XHRobj.readyState == 4) {
		if (XHRobj.status == 200 && success)
		    success(XHRobj.responseText, XHRobj);
		else
		    error(XHRobj);
	    }
	}

	var flproxy = new flensed.flXHR({ 
	    autoUpdatePlayer:false, 
	    instanceId:"myproxy1", 
	    xmlResponseText:false, 
	    onreadystatechange:handle_load, 
	    loadPolicyURL: CROSSDOMAINJS_PATH + "load-policy.xml"
	});

	flproxy.open(type, url, true);
	flproxy.send(data);
    }

    //
    // Does an ajax request.
    //
    // For browsers that do not support CORS, it fallbacks to a flXHR
    // request.
    //
    // Arguments:
    //
    //    url: the request's URL
    //    type: HTTP verb, as in "GET", "POST", "PUT", "DELETE"
    //    success: JS callback to be executed on success
    //    error: JS callback to be executed on error
    //	  data: data to send in case of POST (it's a string, this
    //	         method does not do form-encoding)
    //  
    // NOTE: withCredentials does not work in IExplorer or with flXHR
    //       I would advise against using it.
    //
    function ajax(options) {
	var url = options['url'];
	var type = options['type'] || 'GET';
	var success = options['success'];
	var error = options['error'];
	var data  = options['data'];

	try {
	    var xhr = new XMLHttpRequest();
	} catch(e) {}	
	
	var is_sane = false;

	if (xhr && "withCredentials" in xhr){
	    xhr.open(type, url, true);
	} else if (typeof XDomainRequest != "undefined"){
	    xhr = new XDomainRequest();
	    xhr.open(type, url);
	}
	else
	    xhr = null;

	if (!xhr) {
	    async_load_javascript(CROSSDOMAINJS_PATH + "flXHR/flXHR.js", function () {
		_ajax_with_flxhr(options);
	    });
	}
	else {
	    var handle_load = function (event_type) {
		return function (XHRobj) {
		    // stupid IExplorer!!!
		    var XHRobj = is_iexplorer() ? xhr : XHRobj;

		    if (event_type == 'load' && (is_iexplorer() || XHRobj.readyState == 4) && success)
			success(XHRobj.responseText, XHRobj);
		    else if (error)
			error(XHRobj);
		}
	    };

	    try {
		// withCredentials is not supported by IExplorer's
		// XDomainRequest, neither it is supported by flXHR
		// and it has weird behavior anyway
		xhr.withCredentials = false;
	    } catch(e) {};

	    xhr.onload  = function (e) { handle_load('load')(is_iexplorer() ? e : e.target) };
	    xhr.onerror = function (e) { handle_load('error')(is_iexplorer() ? e : e.target) };
	    xhr.send(data);
	}
    }

    return {
	ajax: ajax,
	async_load_javascript: async_load_javascript
    }
})();