About
=====

A small/light script for doing cross-domain, cross-browser ajax
requests.

It provides 2 utility methods:

- crossdomain.ajax(options)
- crossdomain.async_load_javascript(path, on_load_callback)

ajax() does cross-domain requests. If it cannot use HTTP Access
Control (CORS) available in modern browsers, then it falls back to
[flensed.flXHR](http://flxhr.flensed.com/), a Flash-based plugin which
provides an alternative implementation for XmlHttpRequest.

But flXHR is heavy and doesn't work on mobile-phones well, so if the
browser supports CORS, then it prefers doing that.

async_load_javascript() is used internally for asynchronously loading
flXHR, only in case it is needed. It loads a Javascript file, and when
done it executes the provided callback. Multiple callbacks provided
(by multiple calls done at the same time) are stacked.

Technical details
-----------------

This code was actually wrote as a companion to a blog post:
    http://alexn.org/blog/2011/03/24/cross-domain-requests.html

Compatibility
-------------

Currently is known to work on: Opera 11 (flXHR), IExplorer 6 (flXHR),
IExplorer 8 (CORS), Firefox 3.5/4 (CORS), Chrome 10 (CORS).

Usage Sample
------------

    <script language="javascript" src="public/crossdomain-ajax.js"></script>
    <script language="javascript" type="text/javascript">
      var jquery_path = "http://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.min.js";

      // loading jQuery asynchronously
      crossdomain.async_load_javascript(jquery_path, function () {
        $(function () {

          // doing post request
          crossdomain.ajax({
              type: "GET",
              url: "http://thebuzzengine.appspot.com/api/hello/",
              success: function (txt) {
                $('#response-get').html(txt);
              },
          });

          // doing get request
          crossdomain.ajax({
            type: "POST",
            url: "http://thebuzzengine.appspot.com/api/hello/",
            data: "hello=world",
            success: function (txt) {
              $('#response-post').html(txt);
            },
          });

        });
      });
    </script>


