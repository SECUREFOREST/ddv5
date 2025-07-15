<!DOCTYPE html>
<html>
<head>
    <script src="//archive.org/includes/athena.js" type="text/javascript"></script>
    <script type="text/javascript">
    window.addEventListener('DOMContentLoaded', function() {
        var v = archive_analytics.values;
        v.service = 'wb';
        v.server_name = 'wwwb-app239.us.archive.org';
        v.server_ms = 819;
        archive_analytics.send_pageview({});
    });
    </script>
    <script type="text/javascript" src="https://web-static.archive.org/_static/js/bundle-playback.js?v=1B2M2Y8A" charset="utf-8"></script>
    <script type="text/javascript" src="https://web-static.archive.org/_static/js/wombat.js?v=1B2M2Y8A" charset="utf-8"></script>
    <script>
    window.RufflePlayer = window.RufflePlayer || {};
    window.RufflePlayer.config = {
        "autoplay": "on",
        "unmuteOverlay": "hidden",
        "showSwfDownload": true
    };
    </script>
    <script type="text/javascript" src="https://web-static.archive.org/_static/js/ruffle/ruffle.js"></script>
    <script type="text/javascript">
    __wm.init("https://web.archive.org/web");
    __wm.wombat("http://deviantdare.com.com:80/doms/b1e052bff6cd9805f4c3", "20150810020744", "https://web.archive.org/", "web", "https://web-static.archive.org/_static/",
    "1439172464");
    </script>
    <link rel="stylesheet" type="text/css" href="https://web-static.archive.org/_static/css/banner-styles.css?v=1B2M2Y8A"/>
    <link rel="stylesheet" type="text/css" href="https://web-static.archive.org/_static/css/iconochive.css?v=1B2M2Y8A"/>
    <!-- End Wayback Rewrite JS Include -->

    <script type="text/javascript">
    window.NREUM || (NREUM = {});
    NREUM.info = {
        "beacon": "bam.nr-data.net",
        "errorBeacon": "bam.nr-data.net",
        "licenseKey": "94b514c9d6",
        "applicationID": "8913510",
        "transactionName": "egxbEBYMWVVTR05WWFQKWwUQClpXRRoSWlhO",
        "queueTime": 0,
        "applicationTime": 185,
        "agent": "js-agent.newrelic.com/nr-686.min.js"
    }
    </script>
    <script type="text/javascript">
    window.NREUM || (NREUM = {}),
    __nr_require = function(e, n, t) {
        function r(t) {
            if (!n[t]) {
                var o = n[t] = {
                    exports: {}
                };
                e[t][0].call(o.exports, function(n) {
                    var o = e[t][1][n];
                    return r(o ? o : n)
                }, o, o.exports)
            }
            return n[t].exports
        }
        if ("function" == typeof __nr_require)
            return __nr_require;
        for (var o = 0; o < t.length; o++)
            r(t[o]);
        return r
    }({
        QJf3ax: [function(e, n) {
            function t(e) {
                function n(n, t, a) {
                    e && e(n, t, a),
                    a || (a = {});
                    for (var u = c(n), f = u.length, s = i(a, o, r), p = 0; f > p; p++)
                        u[p].apply(s, t);
                    return s
                }
                function a(e, n) {
                    f[e] = c(e).concat(n)
                }
                function c(e) {
                    return f[e] || []
                }
                function u() {
                    return t(n)
                }
                var f = {};
                return {
                    on: a,
                    emit: n,
                    create: u,
                    listeners: c,
                    _events: f
                }
            }
            function r() {
                return {}
            }
            var o = "nr@context",
                i = e("gos");
            n.exports = t()
        }, {
            gos: "7eSDFh"
        }],
        ee: [function(e, n) {
            n.exports = e("QJf3ax")
        }, {}],
        3: [function(e, n) {
            function t(e) {
                return function() {
                    r(e, [(new Date).getTime()].concat(i(arguments)))
                }
            }
            var r = e("handle"),
                o = e(1),
                i = e(2);
            "undefined" == typeof window.newrelic && (newrelic = window.NREUM);
            var a = ["setPageViewName", "addPageAction", "setCustomAttribute", "finished", "addToTrace", "inlineHit", "noticeError"];
            o(a, function(e, n) {
                window.NREUM[n] = t("api-" + n)
            }),
            n.exports = window.NREUM
        }, {
            1: 12,
            2: 13,
            handle: "D5DuLP"
        }],
        gos: [function(e, n) {
            n.exports = e("7eSDFh")
        }, {}],
        "7eSDFh": [function(e, n) {
            function t(e, n, t) {
                if (r.call(e, n))
                    return e[n];
                var o = t();
                if (Object.defineProperty && Object.keys)
                    try {
                        return Object.defineProperty(e, n, {
                            value: o,
                            writable: !0,
                            enumerable: !1
                        }), o
                    } catch (i) {}
                return e[n] = o, o
            }
            var r = Object.prototype.hasOwnProperty;
            n.exports = t
        }, {}],
        D5DuLP: [function(e, n) {
            function t(e, n, t) {
                return r.listeners(e).length ? r.emit(e, n, t) : void (r.q && (r.q[e] || (r.q[e] = []), r.q[e].push(n)))
            }
            var r = e("ee").create();
            n.exports = t,
            t.ee = r,
            r.q = {}
        }, {
            ee: "QJf3ax"
        }],
        handle: [function(e, n) {
            n.exports = e("D5DuLP")
        }, {}],
        XL7HBI: [function(e, n) {
            function t(e) {
                var n = typeof e;
                return !e || "object" !== n && "function" !== n ? -1 : e === window ? 0 : i(e, o, function() {
                    return r++
                })
            }
            var r = 1,
                o = "nr@id",
                i = e("gos");
            n.exports = t
        }, {
            gos: "7eSDFh"
        }],
        id: [function(e, n) {
            n.exports = e("XL7HBI")
        }, {}],
        G9z0Bl: [function(e, n) {
            function t() {
                var e = d.info = NREUM.info,
                    n = f.getElementsByTagName("script")[0];
                if (e && e.licenseKey && e.applicationID && n) {
                    c(p, function(n, t) {
                        n in e || (e[n] = t)
                    });
                    var t = "https" === s.split(":")[0] || e.sslForHttp;
                    d.proto = t ? "https://" : "http://",
                    a("mark", ["onload", i()]);
                    var r = f.createElement("script");
                    r.src = d.proto + e.agent,
                    n.parentNode.insertBefore(r, n)
                }
            }
            function r() {
                "complete" === f.readyState && o()
            }
            function o() {
                a("mark", ["domContent", i()])
            }
            function i() {
                return (new Date).getTime()
            }
            var a = e("handle"),
                c = e(1),
                u = window,
                f = u.document;
            e(2);
            var s = ("" + location).split("?")[0],
                p = {
                    beacon: "bam.nr-data.net",
                    errorBeacon: "bam.nr-data.net",
                    agent: "js-agent.newrelic.com/nr-686.min.js"
                },
                d = n.exports = {
                    offset: i(),
                    origin: s,
                    features: {}
                };
            f.addEventListener ? (f.addEventListener("DOMContentLoaded", o, !1), u.addEventListener("load", t, !1)) : (f.attachEvent("onreadystatechange", r), u.attachEvent("onload", t)),
            a("mark", ["firstbyte", i()])
        }, {
            1: 12,
            2: 3,
            handle: "D5DuLP"
        }],
        loader: [function(e, n) {
            n.exports = e("G9z0Bl")
        }, {}],
        12: [function(e, n) {
            function t(e, n) {
                var t = [],
                    o = "",
                    i = 0;
                for (o in e)
                    r.call(e, o) && (t[i] = n(o, e[o]), i += 1);
                return t
            }
            var r = Object.prototype.hasOwnProperty;
            n.exports = t
        }, {}],
        13: [function(e, n) {
            function t(e, n, t) {
                n || (n = 0),
                "undefined" == typeof t && (t = e ? e.length : 0);
                for (var r = -1, o = t - n || 0, i = Array(0 > o ? 0 : o); ++r < o;)
                    i[r] = e[n + r];
                return i
            }
            n.exports = t
        }, {}]
    }, {}, ["G9z0Bl"]);
    </script>
    <title>Deviant Dare</title>
    <link rel="stylesheet" media="all" href="/web/20150810020744cs_/http://deviantdare.com.com/assets/application-77c6a01909b7973990de991089bd297529e181aedf88f4f5dc8bda90423a55df.css" data-turbolinks-track="true"/>
    <script src="/web/20150810020744js_/http://deviantdare.com.com/assets/application-db2db080af503f2a16ff9ee56c43e29ba5ad0fa27c0daf0991b6209f04e8066a.js" data-turbolinks-track="true"></script>
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <meta name="csrf-param" content="authenticity_token"/>
    <meta name="csrf-token" content="b4Dkp1UxMfAc9mFeuyo4SyaBXQ5dDgb3BoXEq4Ypp1lCtDPV8/dSl/t5/niReIrCQ7fo5asOUCQHUwJ4UOTdaA=="/>
    <script>
    (function(i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        i[r] = i[r] || function() {
            (i[r].q = i[r].q || []).push(arguments)
        },
        i[r].l = 1 * new Date();
        a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m)
    })(window, document, 'script', '//web.archive.org/web/20150810020744/http://www.google-analytics.com/analytics.js', 'ga');
    ga('create', 'UA-58424785-1', 'auto');
    ga('send', 'pageview');
    </script>
    <script>
    var userId = null;
    </script>

</head>
<body role="document">
    <!-- BEGIN WAYBACK TOOLBAR INSERT -->
    <script>
    __wm.rw(0);
    </script>
    <div id="wm-ipp-base" lang="en" style="display:none;direction:ltr;" toolbar-mode="auto">
        <div id="wm-ipp" style="position:fixed;left:0;top:0;right:0;">
            <div id="donato" style="position:relative;width:100%;height:0;">
                <div id="donato-base">
                    <iframe id="donato-if" src="https://archive.org/includes/donate.php?as_page=1&amp;platform=wb&amp;referer=https%3A//web.archive.org/web/20150810020744/http%3A//deviantdare.com.com/doms/b1e052bff6cd9805f4c3" scrolling="no" frameborder="0" style="width:100%; height:100%"></iframe>
                </div>
            </div>
            <div id="wm-ipp-inside">
                <div id="wm-toolbar" style="position:relative;display:flex;flex-flow:row nowrap;justify-content:space-between;">
                    <div id="wm-logo" style="/*width:110px;*/padding-top:12px;">
                        <a href="/web/" title="Wayback Machine home page">
                            <img src="https://web-static.archive.org/_static/images/toolbar/wayback-toolbar-logo-200.png" srcset="https://web-static.archive.org/_static/images/toolbar/wayback-toolbar-logo-100.png, https://web-static.archive.org/_static/images/toolbar/wayback-toolbar-logo-150.png 1.5x, https://web-static.archive.org/_static/images/toolbar/wayback-toolbar-logo-200.png 2x" alt="Wayback Machine" style="width:100px" border="0"/>
                        </a>
                    </div>
                    <div class="c" style="display:flex;flex-flow:column nowrap;justify-content:space-between;flex:1;">
                        <form class="u" style="display:flex;flex-direction:row;flex-wrap:nowrap;" target="_top" method="get" action="/web/submit" name="wmtb" id="wmtb">
                            <input type="text" name="url" id="wmtbURL" value="http://deviantdare.com.com/doms/b1e052bff6cd9805f4c3" onfocus="this.focus();this.select();" style="flex:1;"/>
                            <input type="hidden" name="type" value="replay"/>
                            <input type="hidden" name="date" value="20150810020744"/>
                            <input type="submit" value="Go"/>
                        </form>
                        <div style="display:flex;flex-flow:row nowrap;align-items:flex-end;">
                            <div class="s" id="wm-nav-captures" style="flex:1;">
                                <a class="t" href="/web/20150810020744*/http://deviantdare.com.com/doms/b1e052bff6cd9805f4c3" title="See a list of every capture for this URL">2 captures</a>
                                <div class="r" title="Timespan for captures of this URL">10 Aug 2015 - 09 Sep 2015</div>
                            </div>
                            <div class="k">
                                <a href="" id="wm-graph-anchor">
                                    <div id="wm-ipp-sparkline" title="Explore captures for this URL" style="position: relative">
                                        <canvas id="wm-sparkline-canvas" width="750" height="27" border="0">
                                        </canvas>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="n">
                        <table>
                            <tbody>
                                <!-- NEXT/PREV MONTH NAV AND MONTH INDICATOR -->
                                <tr class="m">
                                    <td class="b" nowrap="nowrap">Jul</td>
                                    <td class="c" id="displayMonthEl" title="You are here: 02:07:44 Aug 10, 2015">AUG</td>
                                    <td class="f" nowrap="nowrap">Sep</td>
                                </tr>
                                <!-- NEXT/PREV CAPTURE NAV AND DAY OF MONTH INDICATOR -->
                                <tr class="d">
                                    <td class="b" nowrap="nowrap">
                                        <img src="https://web-static.archive.org/_static/images/toolbar/wm_tb_prv_off.png" alt="Previous capture" width="14" height="16" border="0"/>
                                    </td>
                                    <td class="c" id="displayDayEl" style="width:34px;font-size:22px;white-space:nowrap;" title="You are here: 02:07:44 Aug 10, 2015">10</td>
                                    <td class="f" nowrap="nowrap">
                                        <a href="https://web.archive.org/web/20150909182210/http://deviantdare.com.com:80/doms/b1e052bff6cd9805f4c3" title="18:22:10 Sep 09, 2015">
                                            <img src="https://web-static.archive.org/_static/images/toolbar/wm_tb_nxt_on.png" alt="Next capture" width="14" height="16" border="0"/>
                                        </a>
                                    </td>
                                </tr>
                                <!-- NEXT/PREV YEAR NAV AND YEAR INDICATOR -->
                                <tr class="y">
                                    <td class="b" nowrap="nowrap">2014</td>
                                    <td class="c" id="displayYearEl" title="You are here: 02:07:44 Aug 10, 2015">2015</td>
                                    <td class="f" nowrap="nowrap">2016</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="r" style="display:flex;flex-flow:column nowrap;align-items:flex-end;justify-content:space-between;">
                        <div id="wm-btns" style="text-align:right;height:23px;">
                            <span class="xxs">
                                <div id="wm-save-snapshot-success">success</div>
                                <div id="wm-save-snapshot-fail">fail</div>
                                <a id="wm-save-snapshot-open" href="#" title="Share via My Web Archive">
                                    <span class="iconochive-web"></span>
                                </a>
                                <a href="https://archive.org/account/login.php" title="Sign In" id="wm-sign-in">
                                    <span class="iconochive-person"></span>
                                </a>
                                <span id="wm-save-snapshot-in-progress" class="iconochive-web"></span>
                            </span>
                            <a class="xxs" href="http://faq.web.archive.org/" title="Get some help using the Wayback Machine" style="top:-6px;">
                                <span class="iconochive-question" style="color:rgb(87,186,244);font-size:160%;"></span>
                            </a>
                            <a id="wm-tb-close" href="#close" style="top:-2px;" title="Close the toolbar">
                                <span class="iconochive-remove-circle" style="color:#888888;font-size:240%;"></span>
                            </a>
                        </div>
                        <div id="wm-share" class="xxs">
                            <a href="/web/20150810020744/http://web.archive.org/screenshot/http://deviantdare.com.com/doms/b1e052bff6cd9805f4c3" id="wm-screenshot" title="screenshot">
                                <span class="wm-icon-screen-shot"></span>
                            </a>
                            <a href="#" id="wm-video" title="video">
                                <span class="iconochive-movies"></span>
                            </a>
                            <a id="wm-share-facebook" href="#" data-url="https://web.archive.org/web/20150810020744/http://deviantdare.com.com:80/doms/b1e052bff6cd9805f4c3" title="Share on Facebook" style="margin-right:5px;" target="_blank">
                                <span class="iconochive-facebook" style="color:#3b5998;font-size:160%;"></span>
                            </a>
                            <a id="wm-share-twitter" href="#" data-url="https://web.archive.org/web/20150810020744/http://deviantdare.com.com:80/doms/b1e052bff6cd9805f4c3" title="Share on Twitter" style="margin-right:5px;" target="_blank">
                                <span class="iconochive-twitter" style="color:#1dcaff;font-size:160%;"></span>
                            </a>
                        </div>
                        <div style="padding-right:2px;text-align:right;white-space:nowrap;">
                            <a id="wm-expand" class="wm-btn wm-closed" href="#expand">
                                <span id="wm-expand-icon" class="iconochive-down-solid"></span>
                                <span class="xxs" style="font-size:80%;">About this capture</span>
                            </a>
                        </div>
                    </div>
                </div>
                <div id="wm-capinfo" style="border-top:1px solid #777;display:none; overflow: hidden">
                    <div id="wm-capinfo-notice" source="api"></div>
                    <div id="wm-capinfo-collected-by">
                        <div style="background-color:#666;color:#fff;font-weight:bold;text-align:center;padding:2px 0;">COLLECTED BY</div>
                        <div style="padding:3px;position:relative" id="wm-collected-by-content">
                            <div style="display:inline-block;vertical-align:top;width:50%;">
                                <span class="c-logo" style="background-image:url(https://archive.org/services/img/alexacrawls);"></span>

                                		Organization: 
                                <a style="color:#33f;" href="https://archive.org/details/alexacrawls" target="_new">
                                    <span class="wm-title">Alexa Crawls</span>
                                </a>
                                <div style="max-height:75px;overflow:hidden;position:relative;">
                                    <div style="position:absolute;top:0;left:0;width:100%;height:75px;background:linear-gradient(to bottom,rgba(255,255,255,0) 0%,rgba(255,255,255,0) 90%,rgba(255,255,255,255) 100%);"></div>

                                    	  Starting in 1996, 
                                    <a href="http://www.alexa.com/">Alexa Internet</a>
                                     has been donating their crawl data to the Internet Archive.  Flowing in every day, these data are added to the 
                                    <a href="http://web.archive.org/">Wayback Machine</a>
                                     after an embargo period.
                                    	
                                </div>
                            </div>
                            <div style="display:inline-block;vertical-align:top;width:49%;">
                                <span class="c-logo" style="background-image:url(https://archive.org/services/img/alexacrawls)"></span>
                                <div>
                                    Collection: 
                                    <a style="color:#33f;" href="https://archive.org/details/alexacrawls" target="_new">
                                        <span class="wm-title">Alexa Crawls</span>
                                    </a>
                                </div>
                                <div style="max-height:75px;overflow:hidden;position:relative;">
                                    <div style="position:absolute;top:0;left:0;width:100%;height:75px;background:linear-gradient(to bottom,rgba(255,255,255,0) 0%,rgba(255,255,255,0) 90%,rgba(255,255,255,255) 100%);"></div>

                                    	  Starting in 1996, 
                                    <a href="http://www.alexa.com/">Alexa Internet</a>
                                     has been donating their crawl data to the Internet Archive.  Flowing in every day, these data are added to the 
                                    <a href="http://web.archive.org/">Wayback Machine</a>
                                     after an embargo period.
                                    	
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="wm-capinfo-timestamps">
                        <div style="background-color:#666;color:#fff;font-weight:bold;text-align:center;padding:2px 0;" title="Timestamps for the elements of this page">TIMESTAMPS</div>
                        <div>
                            <div id="wm-capresources" style="margin:0 5px 5px 5px;max-height:250px;overflow-y:scroll !important"></div>
                            <div id="wm-capresources-loading" style="text-align:left;margin:0 20px 5px 5px;display:none">
                                <img src="https://web-static.archive.org/_static/images/loading.gif" alt="loading"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="wm-ipp-print">The Wayback Machine - https://web.archive.org/web/20150810020744/http://deviantdare.com.com:80/doms/b1e052bff6cd9805f4c3</div>
    <script type="text/javascript">
    //<![CDATA[
    __wm.bt(750, 27, 25, 2, "web", "http://deviantdare.com.com/doms/b1e052bff6cd9805f4c3", "20150810020744", 1996, "https://web-static.archive.org/_static/", ["https://web-static.archive.org/_static/css/banner-styles.css?v=1B2M2Y8A", "https://web-static.archive.org/_static/css/iconochive.css?v=1B2M2Y8A"], false);
    __wm.rw(1);
    //]]>
    </script>
    <!-- END WAYBACK TOOLBAR INSERT -->

    <div class="navbar navbar-default navbar-fixed-top">
        <div class="container">
            <div class="navbar-header">
                <button class="navbar-toggle" data-target="#main-nav" data-toggle="collapse" type="button">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <div class="navbar-brand">
                    <a href="/web/20150810020744/http://deviantdare.com.com/">
                        <i class="glyphicon glyphicon-home"></i>

                        Deviant Dare
                    </a>
                </div>
            </div>
            <div class="navbar-collapse collapse" id="main-nav">
                <ul class="nav navbar-nav navbar-right">
                    <li>
                        <a href="/web/20150810020744/http://deviantdare.com.com/users/sign_in">sign in</a>
                    </li>
                </ul>
            </div>
        </div>
    </div>

    <div class="page-main-content-wide">
        <div class="container container-narrow theme-showcase" role="main">

            <div class="aggressive-text">
                <p>Selenophile wants you to perform</p>
                <h1 class="inline-heading">Deviant Dare</h1>
            </div>
            <div class="user_info">
                <table class="table">
                    <tbody>
                        <tr>
                            <td>Name</td>
                            <td>Selenophile</td>
                        </tr>
                        <tr>
                            <td>Gender</td>
                            <td>Male</td>
                        </tr>
                        <tr>
                            <td>Age</td>
                            <td>18 years old</td>
                        </tr>
                        <tr>
                            <td>dares performed</td>
                            <td>
                                <div class="counts">
                                10 of 10 completed
                                </div>
                                <div class="percentage">
                                100%
                                </div>
                                <div class="grade">
                                A
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>dares created</td>
                            <td>
                                <div class="counts">
                                1
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Hard Limits</td>
                            <td>
                                <div class="display_tag_list">
                                    <span class="tag">public</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="aggressive-text">
                <p>Will you agree to perform their dare?</p>
                <h2>Of course, there's a catch.</h2>   <div class="difficulty-details">
                    <div class="heading">
                        <span class="prefix">difficulty:</span>
                        <span class="name">easy</span>
                    </div>
                    <div class="description">difficult description</div>
                </div>
                <div class="call-to-action">
                    <form class="button_to" method="post" action="/web/20150810020744/http://deviantdare.com.com/subs">
                        <button class="btn btn-primary btn-lg" id="create_submission" type="submit">I Consent
                        </button>
                        <input type="hidden" name="authenticity_token" value="B2kEp3WEkdF8jxPxkOimxly6aa146CSSZeu4ZP4IcrYqXdPV00LytpsAjNe6uhRPOYzcRo7ockFkPX63KMUIhw=="/>
                        <input type="hidden" name="domination_id" value="b1e052bff6cd9805f4c3"/>
                    </form>
                </div>
            </div>

        </div>
    </div>
    <div class="footer site-footer">

    </div>

</body>
</html>