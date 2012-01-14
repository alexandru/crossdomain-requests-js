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


Further Action
--------------

See:

- [Compatibility](https://github.com/alexandru/crossdomain-requests-js/wiki/Compatibility)
- [Usage](https://github.com/alexandru/crossdomain-requests-js/wiki/Usage)
- [Troubleshooting](https://github.com/alexandru/crossdomain-requests-js/wiki/Troubleshooting)
- [Implementation / technical details](http://bionicspirit.com/blog/2011/03/24/cross-domain-requests.html)

If it doesn't work for you, please open a bug-ticket (with details)
and I'll love to fix it for you.

