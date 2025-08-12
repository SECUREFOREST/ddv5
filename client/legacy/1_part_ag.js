                        }
                    }]), t
                }(u["default"]);
            t["default"] = c, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                s = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                l = n(1),
                u = r(l),
                c = n(31),
                d = r(c),
                p = function(e) {
                    function t() {
                        i(this, t), s(Object.getPrototypeOf(t.prototype), "constructor", this).apply(this, arguments)
                    }
                    return o(t, e), a(t, [{
                        key: "renderSingularDescription",
                        value: function(e) {
                            return u["default"].createElement("span", {
                                className: "description"
                            }, this.renderUser(e.actor), " fulfilled your demand")
                        }
                    }, {
                        key: "renderAggregateContents",
                        value: function() {
                            return u["default"].createElement("span", {
                                className: "contents"
                            }, this.renderAggregateActorNames(), " have fulfilled your demands")
                        }
                    }]), t
                }(d["default"]);
            t["default"] = p, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                s = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                l = n(1),
                u = r(l),
                c = n(31),
                d = r(c),
                p = function(e) {
                    function t() {
                        i(this, t), s(Object.getPrototypeOf(t.prototype), "constructor", this).apply(this, arguments)
                    }
                    return o(t, e), a(t, [{
                        key: "renderSingularDescription",
                        value: function(e) {
                            return u["default"].createElement("span", {
                                className: "description"
                            }, this.renderUser(e.actor), " graded your task: ", u["default"].createElement("span", {
                                className: "grade"
                            }, this.actStepParam(e, "grade")))
                        }
                    }, {
                        key: "renderAggregate",
                        value: function() {
                            return u["default"].createElement("a", {
                                href: this.url()
                            }, "multiple fulfill task")
                        }
                    }]), t
                }(d["default"]);
            t["default"] = p, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                s = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                l = n(1),
                u = r(l),
                c = n(31),
                d = r(c),
                p = function(e) {
                    function t() {
                        i(this, t), s(Object.getPrototypeOf(t.prototype), "constructor", this).apply(this, arguments)
                    }
                    return o(t, e), a(t, [{
                        key: "renderSingularDescription",
                        value: function(e) {
                            var t = {
                                    chicken: "chickened out",
                                    impossible: "think it's not possible of safe for anyone to do",
                                    incomprehensible: "couldn't understand what was being demanded",
                                    abuse: "have reported the demand as abuse"
                                },
                                n = t[this.actStepParam(e, "reason")];
                            return u["default"].createElement("span", {
                                className: "description"
                            }, this.renderUser(e.actor), " rejected your demand because they ", n, ".")
                        }
                    }, {
                        key: "renderDetails",
                        value: function(e) {
                            var t = e.task;
                            return t ? u["default"].createElement("span", {
                                className: "details task"
                            }, t.demand) : void 0
                        }
                    }]), t
                }(d["default"]);
            t["default"] = p, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                s = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                l = n(1),
                u = r(l),
                c = n(31),
                d = r(c),
                p = function(e) {
                    function t() {
                        i(this, t), s(Object.getPrototypeOf(t.prototype), "constructor", this).apply(this, arguments)
                    }
                    return o(t, e), a(t, [{
                        key: "renderSingularDescription",
                        value: function() {
                            return u["default"].createElement("span", {
                                className: "description"
                            }, "A winner has been picked in your switch game.")
                        }
                    }]), t
                }(d["default"]);
            t["default"] = p, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                s = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                l = n(31),
                u = r(l),
                c = function(e) {
                    function t() {
                        i(this, t), s(Object.getPrototypeOf(t.prototype), "constructor", this).apply(this, arguments)
                    }
                    return o(t, e), a(t, [{
                        key: "renderSingularDescription",
                        value: function(e) {
                            return React.createElement("span", {
                                className: "description"
                            }, this.renderUser(e.actor), " has deleted their account")
                        }
                    }]), t
                }(u["default"]);
            t["default"] = c, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                s = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                l = n(1),
                u = r(l),
                c = n(371),
                d = r(c),
                p = function(e) {
                    function t() {
                        i(this, t), s(Object.getPrototypeOf(t.prototype), "constructor", this).apply(this, arguments)
                    }
                    return o(t, e), a(t, [{
                        key: "renderNotifications",
                        value: function() {
                            return this.props.notifications.map(function(e) {
                                return u["default"].createElement(d["default"], {
                                    key: e.id,
                                    notification: e
                                })
                            })
                        }
                    }, {
                        key: "renderNotificationsCount",
                        value: function() {
                            return this.props.unseen > 0 ? u["default"].createElement("span", {
                                className: "counter"
                            }, this.props.unseen) : void 0
                        }
                    }, {
                        key: "onDropDownClick",
                        value: function(e) {
                            var t = $(e.target).closest(".dropdown-toggle"),
                                n = t.attr("aria-expanded");
                            n && this.props.onListViewed()
                        }
                    }, {
                        key: "render",
                        value: function() {
                            return u["default"].createElement("li", {
                                className: "notifications-nav"
                            }, u["default"].createElement("a", {
                                href: "#",
                                className: "dropdown-toggle icon-menu nav-item-with-counter",
                                "aria-expanded": "false",
                                "data-toggle": "dropdown",
                                role: "button",
                                onClick: this.onDropDownClick.bind(this)
                            }, this.renderNotificationsCount(), u["default"].createElement("i", {
                                className: "glyphicon glyphicon-bell"
                            })), u["default"].createElement("ul", {
                                className: "dropdown-menu",
                                role: "menu"
                            }, this.renderNotifications()))
                        }
                    }]), t
                }(u["default"].Component);
            p.propTypes = {
                notifications: u["default"].PropTypes.array.isRequired,
                unseen: u["default"].PropTypes.number,
                unread: u["default"].PropTypes.number,
                onListViewed: u["default"].PropTypes.func
            }, t["default"] = p, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                s = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                l = n(1),
                u = r(l),
                c = n(146),
                d = r(c),
                p = n(368),
                f = r(p),
                h = n(365),
                m = r(h),
                v = function(e) {
                    function t() {
                        i(this, t), s(Object.getPrototypeOf(t.prototype), "constructor", this).apply(this, arguments)
                    }
                    return o(t, e), a(t, [{
                        key: "slotsTitle",
                        value: function() {
                            return this.allSlotsEmpty() ? "You haven't promised to perform anything yet" : "You agreed to perform"
                        }
                    }, {
                        key: "findMoreTitle",
                        value: function() {
                            return this.props.cooldown ? u["default"].createElement("div", null, "New actions unlocked ", u["default"].createElement(m["default"], {
                                until: this.props.cooldown.until
                            })) : this.allSlotsFull() ? "If you finish some of your acts, you could..." : this.allSlotsEmpty() ? "Start a submissive act" : "Find more submissive acts"
                        }
                    }, {
                        key: "allSlotsEmpty",
                        value: function() {
                            return this.props.slots[0].empty
                        }
                    }, {
                        key: "allSlotsFull",
                        value: function() {
                            return !this.props.slots[this.props.slots.length - 1].empty
                        }
                    }, {
                        key: "findMoreDescription",
                        value: function() {
                            return this.props.cooldown ? u["default"].createElement("p", {
                                className: "disabled-explanation"
                            }, "These options are disabled for now because you have rejected an act recently. There is nothing wrong with rejecting acts, but to ensure that acts don't get rejected too quickly, there is a cool down period after each one.") : this.allSlotsFull() ? u["default"].createElement("p", {
                                className: "disabled-explanation"
                            }, "These options are disabled for now because you can only have 5 open acts at a time. This to stop people from hogging all the submissive acts and spoiling others fun. You will be able to do more once you free up an act slot by completing or rejecting an act.") : void 0
                        }
                    }, {
                        key: "canPerformMore",
                        value: function() {
                            return !this.allSlotsFull() && !this.props.cooldown
                        }
                    }, {
                        key: "render",
                        value: function() {
                            return u["default"].createElement("div", {
                                className: ""
                            }, u["default"].createElement("h3", {
                                className: "section-description"
                            }, this.slotsTitle()), u["default"].createElement(d["default"], {
                                slots: this.props.slots
                            }), u["default"].createElement(f["default"], {
                                title: this.findMoreTitle(),
                                description: this.findMoreDescription(),
                                enabled: this.canPerformMore(),
                                publicActs: this.props.publicActs
                            }))
                        }
                    }]), t
                }(u["default"].Component);
            v.displayName = "PerformDashboard", t["default"] = v, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                s = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                l = n(1),
                u = r(l),
                c = n(311),
                d = n(388),
                p = r(d),
                f = n(386),
                h = r(f),
                m = n(389),
                v = r(m),
                g = n(387),
                y = r(g),
                _ = function(e) {
                    function t(e) {
                        i(this, t), s(Object.getPrototypeOf(t.prototype), "constructor", this).call(this, e), this.state = {
                            activeTab: "about"
                        }
                    }
                    return o(t, e), a(t, [{
                        key: "homeTab",
                        value: function() {
                            return u["default"].createElement("div", {
                                className: "icon-tab"
                            }, u["default"].createElement("i", {
                                className: "glyphicon glyphicon-user"
                            }), u["default"].createElement("span", {
                                className: "description"
                            }, "About"))
                        }
                    }, {
                        key: "renderRoleTab",
                        value: function(e, t) {
                            return u["default"].createElement("div", {
                                className: "role-tab"
                            }, u["default"].createElement("span", {
                                className: "percentage"
                            }, this.rolePercentage(t), u["default"].createElement("span", {
                                className: "symbol"
                            }, "%")), u["default"].createElement("span", {
                                className: "role-name"
                            }, e))
                        }
                    }, {
                        key: "roleTabActive",
                        value: function(e) {
                            return this.rolePercentage(e) > 0
                        }
                    }, {
                        key: "rolePercentage",
                        value: function(e) {
                            return this.props.user.natureRatio[e]
                        }
                    }, {
                        key: "onChangeTab",
                        value: function(e) {
                            this.setState({
                                activeTab: e
                            })
                        }
                    }, {
                        key: "renderCurrentTabPanel",
                        value: function() {
                            switch (this.state.activeTab) {
                                case "about":
                                    return u["default"].createElement(p["default"], {
                                        user: this.props.user
                                    });
                                case "dominant":
                                    return u["default"].createElement(h["default"], {
                                        profileData: this.props.user.natures.dominant,
                                        username: this.props.user.username
                                    });
                                case "submissive":
                                    return u["default"].createElement(v["default"], {
                                        profileData: this.props.user.natures.submissive,
                                        username: this.props.user.username
                                    })
                            }
                        }
                    }, {
                        key: "render",
                        value: function() {
                            var e = this.props.user;
                            return u["default"].createElement("div", {
                                id: "profile"
                            }, u["default"].createElement(y["default"], {
                                user: e
                            }), u["default"].createElement("div", {
                                id: "profile-tabs"
                            }, u["default"].createElement("div", {
                                className: "container"
                            }, u["default"].createElement(c.Nav, {
                                id: "profile-tabs",
                                activeKey: this.state.activeTab,
                                bsStyle: "pills",
                                onSelect: this.onChangeTab.bind(this)
                            }, u["default"].createElement(c.NavItem, {
                                eventKey: "about"
                            }, this.homeTab()), u["default"].createElement(c.NavItem, {
                                eventKey: "dominant",
                                disabled: !this.roleTabActive("domination")
                            }, this.renderRoleTab("dominant", "domination")), u["default"].createElement(c.NavItem, {
                                eventKey: "submissive",
                                disabled: !this.roleTabActive("submission")
                            }, this.renderRoleTab("submissive", "submission"))))), u["default"].createElement("div", {
                                id: "tab-panel"
                            }, u["default"].createElement("div", {
                                className: "container"
                            }, this.renderCurrentTabPanel())))
                        }
                    }]), t
                }(u["default"].Component);
            _.propTypes = {
                user: u["default"].PropTypes.object
            }, t["default"] = _, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                s = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                l = n(1),
                u = r(l),
                c = n(140),
                d = r(c),
                p = n(87),
                f = r(p),
                h = n(313).Doughnut,
                m = function(e) {
                    function t() {
                        i(this, t), s(Object.getPrototypeOf(t.prototype), "constructor", this).apply(this, arguments)
                    }
                    return o(t, e), a(t, [{
                        key: "dataForDifficulty",
                        value: function(e) {
                            var t = {
                                dominant: {
                                    titillating: "#F65161",
                                    arousing: "#F3162C",
                                    explicit: "#AE091A",
                                    edgy: "#740611",
                                    hardcore: "#3A0309"
                                },
                                submissive: {
                                    titillating: "#89A6FA",
                                    arousing: "#4672F7",
                                    explicit: "#144CF5",
                                    edgy: "#0837C4",
                                    hardcore: "#062789"
                                }
                            };
                            return {
                                value: this.props.data.completed[e] || 0,
                                color: t[this.props.actType][e],
                                label: e
                            }
                        }
                    }, {
                        key: "render",
                        value: function() {
                            var e = [{
                                    value: this.props.data.incomplete || 0,
                                    color: "#CCCCCC",
                                    label: "Incomplete"
                                }, this.dataForDifficulty("titillating"), this.dataForDifficulty("arousing"), this.dataForDifficulty("explicit"), this.dataForDifficulty("edgy"), this.dataForDifficulty("hardcore"), {
                                    value: this.props.data.rejected || 0,
                                    color: "#FFAA00",
                                    label: "Rejected"
                                }],
                                t = {
                                    segmentShowStroke: !1,
                                    animation: !1,
                                    percentageInnerCutout: 70,
                                    showTooltips: !0,
                                    tooltipFontSize: 14,
                                    tooltipXOffset: 20,
                                    customTooltips: d["default"]
                                };
                            return u["default"].createElement("div", {
                                className: "role-breakdown-chart-container"
                            }, u["default"].createElement(h, {
                                className: "role-breakdown-donut-chart",
                                data: e,
                                options: t,
                                width: "100",
                                height: "100"
                            }), this.props.grade ? u["default"].createElement(f["default"], {
                                value: this.props.grade
                            }) : null)
                        }
                    }]), t
                }(u["default"].Component);
            m.propTypes = {
                data: l.PropTypes.shape({
                    incomplete: l.PropTypes.number,
                    completed: l.PropTypes.shape({
                        titillating: l.PropTypes.number,
                        arousing: l.PropTypes.number,
                        explicit: l.PropTypes.number,
                        edgy: l.PropTypes.number,
                        hardcore: l.PropTypes.number
                    }),
                    rejected: l.PropTypes.number
                }),
                grade: l.PropTypes.number
            }, t["default"] = m, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                s = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                l = n(1),
                u = r(l),
                c = function(e) {
                    function t(e) {
                        i(this, t), s(Object.getPrototypeOf(t.prototype), "constructor", this).call(this, e), this.state = {
                            loading: !1,
                            value: !!e.value
                        }
                    }
                    return o(t, e), a(t, [{
                        key: "handleClick",
                        value: function(e) {
                            var t = this;
                            e.preventDefault(), this.setState({
                                loading: !0
                            });
                            var n = this.state.value ? "unblock" : "block";
                            $.ajax({
                                type: "POST",
                                url: "/blocks/" + this.props.userID + "/" + n,
                                success: this.onSuccess.bind(this),
                                error: function(e, n, r) {
                                    t.setState({
                                        loading: !1
                                    }), console.log("error blocking models (" + n + "): " + r)
                                }
                            })
                        }
                    }, {
                        key: "onSuccess",
                        value: function(e) {
                            this.setState({
                                loading: !1,
                                value: e
                            })
                        }
                    }, {
                        key: "render",
                        value: function() {
                            return u["default"].createElement("a", {
                                className: "blockLink boolean-toggle boolean-" + this.state.value + " btn btn-default",
                                href: "#",
                                onClick: this.handleClick.bind(this)
                            }, u["default"].createElement("i", {
                                className: this.state.loading ? "fa fa-spinner fa-spin" : "fa fa-ban"
                            }), this.state.value ? " blocked" : " block")
                        }
                    }]), t
                }(u["default"].Component);
            c.propTypes = {
                userID: u["default"].PropTypes.number.isRequired,
                value: u["default"].PropTypes.bool.isRequired
            }, t["default"] = c, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                s = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                l = n(1),
                u = r(l),
                c = n(143),
                d = r(c),
                p = n(147),
                f = r(p),
                h = function(e) {
                    function t() {
                        i(this, t), s(Object.getPrototypeOf(t.prototype), "constructor", this).apply(this, arguments)
                    }
                    return o(t, e), a(t, [{
                        key: "render",
                        value: function() {
                            return u["default"].createElement("div", null, u["default"].createElement("div", {
                                className: "stat-sections"
                            }, u["default"].createElement(d["default"], {
                                title: "With everyone",
                                actType: "dominant",
                                noDataMessage: "They haven't performed any dominant acts yet.",
                                data: this.props.profileData.withEveryone,
                                leaderboard: this.props.profileData.leaderboardPosition,
                                username: this.props.username
                            }), u["default"].createElement(d["default"], {
                                title: "With you",
                                actType: "dominant",
                                noDataMessage: "You haven't submitted to them yet.",
                                data: this.props.profileData.withYou,
                                username: this.props.username
                            })), u["default"].createElement(f["default"], {
                                title: "Dominant acts with you",
                                tasks: this.props.profileData.tasks
                            }))
                        }
                    }]), t
                }(u["default"].Component);
            t["default"] = h, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                s = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                l = n(1),
                u = r(l),
                c = n(385),
                d = r(c),
                p = function(e) {
                    function t() {
                        i(this, t), s(Object.getPrototypeOf(t.prototype), "constructor", this).apply(this, arguments)
                    }
                    return o(t, e), a(t, [{
                        key: "ageAndGender",
                        value: function() {
                            var e = _.compact([this.props.user.age, this.props.user.genderDescription]);
                            return e.join(" ")
                        }
                    }, {
                        key: "ownProfile",
                        value: function() {
                            return this.props.user.id == window.currentUser.id
                        }
                    }, {
                        key: "render",
                        value: function() {
                            var e = this.props.user;
                            return u["default"].createElement("div", {
                                id: "profile-header"
                            }, u["default"].createElement("div", {
                                className: "container"
                            }, u["default"].createElement("img", {
                                className: "profile-avatar",
                                src: e.avatarThumbUrl
                            }), u["default"].createElement("div", {
                                className: "headings"
                            }, u["default"].createElement("h2", {
                                className: "name"
                            }, e.name), u["default"].createElement("h3", {
                                className: "username"
                            }, "@", e.username), u["default"].createElement("div", {
                                className: "age-and-gender"
                            }, this.ageAndGender()), u["default"].createElement("div", {
                                className: "buttons"
                            }, this.ownProfile() ? null : u["default"].createElement(d["default"], {
                                userID: e.id,
                                value: e.blocked
                            })))))
                        }
                    }]), t
                }(u["default"].Component);
            t["default"] = p, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                s = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                l = n(1),
                u = r(l),
                c = n(587),
                d = r(c),
                p = function(e) {
                    function t() {
                        i(this, t), s(Object.getPrototypeOf(t.prototype), "constructor", this).apply(this, arguments)
                    }
                    return o(t, e), a(t, [{
                        key: "renderDescription",
                        value: function() {
                            return this.props.user.description && "" != this.props.user.description ? u["default"].createElement("div", {
                                className: "contents"
                            }, u["default"].createElement(d["default"], {
                                source: this.props.user.description
                            })) : u["default"].createElement("div", {
                                className: "no-data"
                            }, "This kinkster hasn't written a bio yet.")
                        }
                    }, {
                        key: "editDescriptionLink",
                        value: function() {
                            return this.props.user.id == window.currentUser.id ? u["default"].createElement("span", null, " ", u["default"].createElement("a", {
                                href: "/users/edit"
                            }, "(edit)")) : void 0
                        }
                    }, {
                        key: "renderDescriptionSection",
                        value: function() {
                            return u["default"].createElement("section", {
                                className: "description"
                            }, u["default"].createElement("h2", null, "About me", this.editDescriptionLink()), this.renderDescription())
                        }
                    }, {
                        key: "render",
                        value: function() {
                            return u["default"].createElement("div", null, this.renderDescriptionSection())
                        }
                    }]), t
                }(u["default"].Component);
            t["default"] = p, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                s = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                l = n(1),
                u = r(l),
                c = n(143),
                d = r(c),
                p = n(147),
                f = r(p),
                h = function(e) {
                    function t() {
                        i(this, t), s(Object.getPrototypeOf(t.prototype), "constructor", this).apply(this, arguments)
                    }
                    return o(t, e), a(t, [{
                        key: "render",
                        value: function() {
                            return u["default"].createElement("div", null, u["default"].createElement("div", {
                                className: "stat-sections"
                            }, u["default"].createElement(d["default"], {
                                title: "With everyone",
                                actType: "submissive",
                                noDataMessage: "They haven't performed any submissive acts yet.",
                                data: this.props.profileData.withEveryone,
                                leaderboard: this.props.profileData.leaderboardPosition,
                                username: this.props.username
                            }), u["default"].createElement(d["default"], {
                                title: "With you",
                                actType: "submissive",
                                noDataMessage: "You haven't dominated them yet.",
                                data: this.props.profileData.withYou,
                                username: this.props.username
                            })), u["default"].createElement(f["default"], {
                                title: "Submissive acts with you",
                                tasks: this.props.profileData.tasks
                            }))
                        }
                    }]), t
                }(u["default"].Component);
            t["default"] = h, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                s = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                l = n(1),
                u = r(l),
                c = n(577),
                d = r(c),
                p = function(e) {
                    function t() {
                        i(this, t), s(Object.getPrototypeOf(t.prototype), "constructor", this).apply(this, arguments)
                    }
                    return o(t, e), a(t, [{
                        key: "render",
                        value: function() {
                            return u["default"].createElement("div", {
                                className: "profile-bar"
                            }, u["default"].createElement("div", {
                                className: "container"
                            }, u["default"].createElement(d["default"], {
                                lines: 2,
                                backgroundColor: "#8d0715"
                            }, u["default"].createElement("div", {
                                id: "description",
                                dangerouslySetInnerHTML: {
                                    __html: this.props.description
                                }
                            }))))
                        }
                    }]), t
                }(u["default"].Component);
            p.propTypes = {
                description: u["default"].PropTypes.string
            }, t["default"] = p, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                s = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                l = n(1),
                u = r(l),
                c = n(137),
                d = (r(c), n(138)),
                p = r(d),
                f = n(87),
                h = r(f),
                m = function(e) {
                    function t() {
                        i(this, t), s(Object.getPrototypeOf(t.prototype), "constructor", this).apply(this, arguments)
                    }
                    return o(t, e), a(t, [{
                        key: "renderFurtherInfo",
                        value: function() {
                            var e = this.props.act;
                            return e.user.averageGrade ? u["default"].createElement("div", null, "Average grade: ", u["default"].createElement(h["default"], {
                                value: e.user.averageGrade
                            })) : void 0
                        }
                    }, {
                        key: "render",
                        value: function() {
                            var e = this.props.act;
                            return u["default"].createElement("a", {
                                className: "thing thing-with-avatar public-act",
                                href: e.url
                            }, u["default"].createElement("img", {
                                src: e.imageUrl,
                                className: "avatar"
                            }), u["default"].createElement("div", {
                                className: "thing-details"
                            }, u["default"].createElement("div", {
                                className: "thing-title user-name single-line"
                            }, e.user.name), u["default"].createElement("div", {
                                className: "single-line"
                            }, u["default"].createElement(p["default"], {
                                age: e.user.age,
                                gender: e.user.gender
                            })), this.renderFurtherInfo()))
                        }
                    }]), t
                }(u["default"].Component);
            m.propTypes = {}, t["default"] = m, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = Object.assign || function(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = arguments[t];
                        for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
                    }
                    return e
                },
                s = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                l = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                u = n(1),
                c = r(u),
                d = n(361),
                p = r(d),
                f = n(393),
                h = r(f),
                m = function(e) {
                    function t() {
                        i(this, t), l(Object.getPrototypeOf(t.prototype), "constructor", this).apply(this, arguments)
                    }
                    return o(t, e), s(t, [{
                        key: "renderActs",
                        value: function() {
                            return 0 == this.props.acts.length ? 0 == this.props.filter.difficulties.length ? c["default"].createElement("div", {
                                className: "no-data"
                            }, "You need to select at least one difficulty level in order to see some offers") : c["default"].createElement("div", {
                                className: "no-data"
                            }, "No offers found") : c["default"].createElement(h["default"], {
                                acts: this.props.acts
                            })
                        }
                    }, {
                        key: "render",
                        value: function() {
                            return c["default"].createElement("div", null, c["default"].createElement(p["default"], a({}, this.props.filter, {
                                onChanged: this.props.onFilterChanged
                            })), this.renderActs())
                        }
                    }]), t
                }(c["default"].Component);
            m.propTypes = {}, t["default"] = m, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                s = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                l = n(1),
                u = r(l),
                c = n(391),
                d = r(c),
                p = function(e) {
                    function t() {
                        i(this, t), s(Object.getPrototypeOf(t.prototype), "constructor", this).apply(this, arguments)
                    }
                    return o(t, e), a(t, [{
                        key: "render",
                        value: function() {
                            var e = this.props.acts.map(function(e) {
                                return u["default"].createElement(d["default"], {
                                    key: e.id,
                                    act: e
                                })
                            }, this);
                            return u["default"].createElement("div", {
                                className: "thing-list public-acts-list"
                            }, e)
                        }
                    }]), t
                }(u["default"].Component);
            p.propTypes = {}, t["default"] = p, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                s = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                l = n(1),
                u = r(l),
                c = function(e) {
                    function t() {
                        i(this, t), s(Object.getPrototypeOf(t.prototype), "constructor", this).apply(this, arguments)
                    }
                    return o(t, e), a(t, [{
                        key: "renderPublicActsCount",
                        value: function() {
                            var e = _.values(this.props.publicActCounts),
                                t = _.sum(e);
                            return this.renderCounter(t)
                        }
                    }, {
                        key: "renderActTypeCount",
                        value: function(e) {
                            var t = this.props.publicActCounts[e];
                            return this.renderCounter(t)
                        }
                    }, {
                        key: "renderCounter",
                        value: function(e) {
                            return e > 0 ? u["default"].createElement("span", {
                                className: "counter"
                            }, e) : void 0
                        }
                    }, {
                        key: "render",
                        value: function() {
                            return u["default"].createElement("li", {
                                className: "dropdown public-dropdown"
                            }, u["default"].createElement("a", {
                                className: "dropdown-toggle icon-menu nav-item-with-counter",
                                "aria-expanded": "false",
                                "data-toggle": "dropdown",
                                href: "#",
                                role: "button"
                            }, this.renderPublicActsCount(), u["default"].createElement("i", {
                                className: "glyphicon glyphicon-globe"
                            }), u["default"].createElement("span", {
                                className: "caret"
                            })), u["default"].createElement("ul", {
                                className: "dropdown-menu",
                                role: "menu"
                            }, u["default"].createElement("li", {
                                className: "with-counter"
                            }, u["default"].createElement("a", {
                                href: "/subs/public"
                            }, this.renderActTypeCount("submission"), "offers of submission")), u["default"].createElement("li", {
                                className: "with-counter"
                            }, u["default"].createElement("a", {
                                href: "/doms/public"
                            }, this.renderActTypeCount("domination"), "offers of domination")), u["default"].createElement("li", {
                                className: "with-counter"
                            }, u["default"].createElement("a", {
                                href: "/switches/public"
                            }, this.renderActTypeCount("switch"), "switch games"))))
                        }
                    }]), t
                }(u["default"].Component);
            t["default"] = c, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                s = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                l = n(1),
                u = r(l),
                c = n(142),
                d = r(c),
                p = function(e) {
                    function t() {
                        i(this, t), s(Object.getPrototypeOf(t.prototype), "constructor", this).apply(this, arguments)
                    }
                    return o(t, e), a(t, [{
                        key: "render",
                        value: function() {
                            return this.props.empty ? u["default"].createElement("div", {
                                className: "slot empty-slot"
                            }, u["default"].createElement("div", {
                                className: "dummy"
                            }), u["default"].createElement("div", {
                                className: "contents"
                            })) : u["default"].createElement("a", {
                                href: this.props.url,
                                className: "slot act-slot"
                            }, u["default"].createElement("div", {
                                className: "dummy"
                            }), u["default"].createElement("div", {
                                className: "overlay"
                            }, u["default"].createElement(d["default"], {
                                percentageTimeElapsed: this.props.percentageTimeElapsed
                            }), u["default"].createElement("div", {
                                className: "difficulty"
                            }, this.props.difficulty)), u["default"].createElement("div", {
                                className: "contents"
                            }, u["default"].createElement("img", {
                                src: this.props.imageUrl
                            })))
                        }
                    }]), t
                }(u["default"].Component);
            p.propTypes = {
                empty: u["default"].PropTypes.bool,
                url: u["default"].PropTypes.string,
                imageUrl: u["default"].PropTypes.string,
                difficulty: u["default"].PropTypes.string,
                percentageTimeElapsed: u["default"].PropTypes.number
            }, t["default"] = p, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                s = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                l = n(1),
                u = r(l),
                c = n(142),
                d = r(c),
                p = n(2),
                f = r(p),
                h = function(e) {
                    function t() {
                        i(this, t), s(Object.getPrototypeOf(t.prototype), "constructor", this).apply(this, arguments)
                    }
                    return o(t, e), a(t, [{
                        key: "durationSinceEnteredState",
                        value: function() {
                            if (this.props.task.enteredStateAt) {
                                var e = f["default"](this.props.task.enteredStateAt);
                                return u["default"].createElement("span", {
                                    className: "time"
                                }, e.fromNow(!0))
                            }
                        }
                    }, {
                        key: "statusDescription",
                        value: function() {
                            switch (this.props.task.status) {
                                case "soliciting":
                                    return u["default"].createElement("div", {
                                        className: "status"
                                    }, u["default"].createElement("span", {
                                        className: "state"
                                    }, "awaiting participants"), " for ", this.durationSinceEnteredState());
                                case "in_progress":
                                    return u["default"].createElement("div", {
                                        className: "status"
                                    }, u["default"].createElement("span", {
                                        className: "state"
                                    }, "awaiting pic"), " for ", this.durationSinceEnteredState());
                                case "completed":
                                    return u["default"].createElement("div", {
                                        className: "status"
                                    }, u["default"].createElement("span", {
                                        className: "state"
                                    }, "completed"), " ", this.durationSinceEnteredState(), " ago");
                                case "user_deleted":
                                    return u["default"].createElement("div", {
                                        className: "status"
                                    }, u["default"].createElement("span", {
                                        className: "state"
                                    }, "user deleted"), " ", this.durationSinceEnteredState(), " ago");
                                case "cancelled":
                                    return u["default"].createElement("div", {
                                        className: "status"
                                    }, u["default"].createElement("span", {
                                        className: "state"
                                    }, "cancelled"), " ", this.durationSinceEnteredState(), " ago")
                            }
                        }
                    }, {
                        key: "render",
                        value: function() {
                            var e = this.props.task;
                            return u["default"].createElement("div", {
                                className: "task"
                            }, u["default"].createElement("a", {
                                href: e.url,
                                className: "task-icon-link"
                            }, u["default"].createElement("div", {
                                className: "overlay"
                            }, u["default"].createElement(d["default"], {
                                percentageTimeElapsed: e.percentageTimeElapsed
                            })), u["default"].createElement("div", {
                                className: "contents"
                            }, u["default"].createElement("img", {
                                src: e.imageUrl
                            }))), u["default"].createElement("div", {
                                className: "details"
                            }, u["default"].createElement("a", {
                                href: e.url,
                                className: "full-details"
                            }, "full details"), u["default"].createElement("div", {
                                className: "difficulty"
                            }, _.capitalize(e.difficulty)), this.statusDescription(), u["default"].createElement("div", {
                                className: "demand"
                            }, e.demand)))
                        }
                    }]), t
                }(u["default"].Component);
            t["default"] = h, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                s = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                l = n(1),
                u = r(l),
                c = function(e) {
                    function t() {
                        i(this, t), s(Object.getPrototypeOf(t.prototype), "constructor", this).apply(this, arguments)
                    }
                    return o(t, e), a(t, [{
                        key: "render",
                        value: function() {
                            return u["default"].createElement("li", {
                                className: "dropdown"
                            }, u["default"].createElement("a", {
                                id: "user-menu",
                                className: "dropdown-toggle icon-menu",
                                "aria-expanded": "false",
                                "data-toggle": "dropdown",
                                href: "#",
                                role: "button"
                            }, u["default"].createElement("img", {
                                src: this.props.avatarThumbnail,
                                className: "avatar"
                            }), u["default"].createElement("span", {
                                className: "caret"
                            })), u["default"].createElement("ul", {
                                className: "dropdown-menu",
                                role: "menu"
                            }, u["default"].createElement("li", null, u["default"].createElement("a", {
                                href: "/interact-with/" + window.currentUser.username
                            }, "your profile")), u["default"].createElement("li", null, u["default"].createElement("a", {
                                href: "/users/edit"
                            }, "edit account")), u["default"].createElement("li", null, u["default"].createElement("a", {
                                href: "/safety"
                            }, "safety & privacy")), u["default"].createElement("li", null, u["default"].createElement("a", {
                                "data-method": "delete",
                                rel: "nofollow",
                                href: "/users/sign_out"
                            }, "logout")), u["default"].createElement("li", {
                                className: "divider"
                            }), this.props.admin ? u["default"].createElement("li", null, u["default"].createElement("a", {
                                href: "/admin"
                            }, "admin")) : null, this.props.admin ? u["default"].createElement("li", null, u["default"].createElement("a", {
                                href: "/blazer"
                            }, "blazer reports")) : null, this.props.admin ? u["default"].createElement("li", null, u["default"].createElement("a", {
                                href: "/split"
                            }, "experiments")) : null, this.props.admin_in_disguise ? u["default"].createElement("li", null, u["default"].createElement("a", {
                                href: "/unbecome"
                            }, "revert to admin")) : null))
                        }
                    }]), t
                }(u["default"].Component);
            c.propTypes = {
                admin: u["default"].PropTypes.bool,
                admin_in_disguise: u["default"].PropTypes.bool,
                avatarThumbnail: u["default"].PropTypes.string.isRequired
            }, t["default"] = c, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = Object.assign || function(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = arguments[t];
                        for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
                    }
                    return e
                },
                s = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                l = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                u = n(1),
                c = r(u),
                d = n(366),
                p = r(d),
                f = n(192),
                h = (r(f), n(406)),
                m = r(h),
                v = n(2),
                g = r(v),
                y = function(e) {
                    function t(e) {
                        i(this, t), l(Object.getPrototypeOf(t.prototype), "constructor", this).call(this, e), this.state = e, this.setCooldownTimer(e)
                    }
                    return o(t, e), s(t, [{
                        key: "componentWillMount",
                        value: function() {
                            this.props.performPublicActs && (this.actsSubscription = new m["default"](this))
                        }
                    }, {
                        key: "componentDidMount",
                        value: function() {
                            this.actsSubscription && this.actsSubscription.bind()
                        }
                    }, {
                        key: "onTabChange",
                        value: function(e) {
                            $.ajax({
                                type: "POST",
                                url: "/user_settings",
                                data: {
                                    dashboard_tab: e
                                }
                            })
                        }
                    }, {
                        key: "refreshData",
                        value: function() {
                            $.ajax({
                                type: "get",
                                url: "/acts.json",
                                success: this.updateData.bind(this),
                                error: function(e, t, n) {
                                    console.log("error fetching dashboard data (" + t + "): " + n)
                                }
                            })
                        }
                    }, {
                        key: "updateData",
                        value: function(e) {
                            this.setState(e)
                        }
                    }, {
                        key: "componentWillReceiveProps",
                        value: function(e) {
                            this.setCooldownTimer(e)
                        }
                    }, {
                        key: "setCooldownTimer",
                        value: function(e) {
                            if (e.cooldown) {
                                var t = g["default"](e.cooldown.until),
                                    n = t.diff(g["default"]());
                                this.clearCooldownTimer(), this.cooldownTimeout = setTimeout(this.onCooldownTimeout.bind(this), n)
                            }
                        }
                    }, {
                        key: "clearCooldownTimer",
                        value: function() {
                            this.cooldownTimeout && clearTimeout(this.cooldownTimeout)
                        }
                    }, {
                        key: "onCooldownTimeout",
                        value: function() {
                            this.clearCooldownTimer(), this.setState({
                                cooldown: null
                            }), this.refreshData()
                        }
                    }, {
                        key: "render",
                        value: function() {
                            return c["default"].createElement(p["default"], a({}, this.state, {
                                onTabChange: this.onTabChange.bind(this)
                            }))
                        }
                    }]), t
                }(c["default"].Component);
            t["default"] = y, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = Object.assign || function(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = arguments[t];
                        for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
                    }
                    return e
                },
                s = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                l = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                u = n(1),
                c = r(u),
                d = n(65),
                p = r(d),
                f = n(381),
                h = r(f),
                m = n(402),
                v = r(m),
                g = function(e) {
                    function t(e) {
                        i(this, t), l(Object.getPrototypeOf(t.prototype), "constructor", this).call(this, e), this.state = {
                            notifications: [],
                            unseen: 0,
                            unread: 0
                        }, this.enricher = new v["default"], this.subscribed = !1
                    }
                    return o(t, e), s(t, [{
                        key: "componentWillMount",
                        value: function() {
                            var e = p["default"].getStream();
                            this.feed = e.feed("user_notifications", this.props.userID, this.props.streamToken)
                        }
                    }, {
                        key: "componentDidMount",
                        value: function() {
                            this.fetchInitialData()
                        }
                    }, {
                        key: "fetchInitialData",
                        value: function() {
                            this.feed.get({
                                limit: 10
                            }).then(this.handleInitialRawData.bind(this))["catch"](this.handleError.bind(this))
                        }
                    }, {
                        key: "handleNewData",
                        value: function(e) {
                            this.handleRawData(e)
                        }
                    }, {
                        key: "handleInitialRawData",
                        value: function(e) {
                            this.handleRawData(e), this._ensureSubscribed()
                        }
                    }, {
                        key: "handleRawData",
                        value: function(e) {
                            this.enricher.enrichAggregateResult(e, this.handleEnrichedData.bind(this))
                        }
                    }, {
                        key: "handleEnrichedData",
                        value: function(e) {
                            var t = null;
                            if (e["new"]) {
                                var n = this.state.notifications || [];
                                t = e["new"].concat(n)
                            } else t = e.results;
                            this.setState({
                                notifications: t,
                                unseen: e.unseen,
                                unread: e.unread
                            })
                        }
                    }, {
                        key: "handleError",
                        value: function(e) {
                            console.log("handling error", e)
                        }
                    }, {
                        key: "onListViewed",
                        value: function() {
                            this.setState({
                                unseen: 0
                            }), this.recordAllAsSeen()
                        }
                    }, {
                        key: "recordAllAsSeen",
                        value: function() {
                            this.feed.get({
                                limit: 10,
                                mark_seen: !0
                            })
                        }
                    }, {
                        key: "render",
                        value: function() {
                            return c["default"].createElement(h["default"], a({}, this.state, {
                                onListViewed: this.onListViewed.bind(this)
                            }))
                        }
                    }, {
                        key: "_ensureSubscribed",
                        value: function() {
                            this.subscribed || (this.feed.subscribe(this.handleNewData.bind(this)).then(function() {}, this.handleError.bind(this)), this.subscribed = !0)
                        }
                    }]), t
                }(c["default"].Component);
            g.propTypes = {
                userID: c["default"].PropTypes.number.isRequired,
                streamToken: c["default"].PropTypes.string.isRequired
            }, t["default"] = g, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                s = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                l = n(1),
                u = r(l),
                c = n(392),
                d = r(c),
                p = n(407),
                f = r(p),
                h = function(e) {
                    function t(e) {
                        i(this, t), s(Object.getPrototypeOf(t.prototype), "constructor", this).call(this, {}), this.state = {
                            filter: {
                                difficulties: e.difficulties
                            },
                            acts: e.acts
                        }
                    }
                    return o(t, e), a(t, [{
                        key: "componentWillMount",
                        value: function() {
                            this.actsSubscription = new f["default"](this, this.props.actType)
                        }
                    }, {
                        key: "componentDidMount",
                        value: function() {
                            this.actsSubscription && this.actsSubscription.bind()
                        }
                    }, {
                        key: "onFiltersChanged",
                        value: function(e) {
                            this.setState({
                                filter: e
                            })
                        }
                    }, {
                        key: "actsToDisplay",
                        value: function() {
                            var e = this,
                                t = [];
                            return _.select(this.state.acts, function(n) {
                                var r = _.include(e.state.filter.difficulties, n.difficulty);
                                if (r) {
                                    var i = _.include(t, n.user.id);
                                    if (!i) return t.push(n.user.id), n
                                }
                            })
                        }
                    }, {
                        key: "render",
                        value: function() {
                            return u["default"].createElement(d["default"], {
                                filter: this.state.filter,
                                onFilterChanged: this.onFiltersChanged.bind(this),
                                acts: this.actsToDisplay()
                            })
                        }
                    }]), t
                }(u["default"].Component);
            h.propTypes = {}, t["default"] = h, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }

            function o(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                e.prototype = Object.create(t && t.prototype, {
                    constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var a = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                s = function(e, t, n) {
                    for (var r = !0; r;) {
                        var i = e,
                            o = t,
                            a = n;
                        r = !1, null === i && (i = Function.prototype);
                        var s = Object.getOwnPropertyDescriptor(i, o);
                        if (void 0 !== s) {
                            if ("value" in s) return s.value;
                            var l = s.get;
                            if (void 0 === l) return;
                            return l.call(a)
                        }
                        var u = Object.getPrototypeOf(i);
                        if (null === u) return;
                        e = u, t = o, n = a, r = !0, s = u = void 0
                    }
                },
                l = n(1),
                u = r(l),
                c = n(192),
                d = (r(c), n(405)),
                p = r(d),
                f = n(394),
                h = r(f),
                m = function(e) {
                    function t(e) {
                        i(this, t), s(Object.getPrototypeOf(t.prototype), "constructor", this).call(this, e), this.state = e
                    }
                    return o(t, e), a(t, [{
                        key: "componentWillMount",
                        value: function() {
                            this.actsSubscription = new p["default"](this)
                        }
                    }, {
                        key: "componentDidMount",
                        value: function() {
                            this.actsSubscription.bind()
                        }
                    }, {
                        key: "render",
                        value: function() {
                            return u["default"].createElement(h["default"], {
                                publicActCounts: this.state.publicActCounts
                            })
                        }
                    }]), t
                }(u["default"].Component);
            m.propTypes = {
                publicActCounts: u["default"].PropTypes.shape({
                    submission: u["default"].PropTypes.number,
                    domination: u["default"].PropTypes.number,
                    "switch": u["default"].PropTypes.number
                }).isRequired
            }, t["default"] = m, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var o = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                a = n(404),
                s = r(a),
                l = function() {
                    function e() {
                        i(this, e), this.modelStore = new s["default"]
                    }
                    return o(e, [{
                        key: "enrichAggregateResult",
                        value: function(e, t) {
                            var n = this,
                                r = e["new"] ? e["new"] : e.results,
                                i = this.modelKeys(r);
                            this.modelStore.loadModels(i, function(i) {
                                n._injectModels(r, i), t(e)
                            })
                        }
                    }, {
                        key: "modelKeys",
                        value: function(e) {
                            var t = this._traverseModelKeys(e);
                            return _.uniq(_.compact(t))
                        }
                    }, {
                        key: "_traverseModelKeys",
                        value: function(e) {
                            var t = this;
                            return _.isString(e) ? this._buildEnrichable(e) : _.flatten(_.map(e, function(e) {
                                return t._traverseModelKeys(e)
                            }), !1)
                        }
                    }, {
                        key: "_buildEnrichable",
                        value: function(e) {
                            return /^[a-z]+\:[0-9]+$/i.test(e) ? e : null
                        }
                    }, {
                        key: "_injectModels",
                        value: function(e, t, n, r) {
                            var i = this;
                            if (_.isString(e)) {
                                var o = t[e];
                                o && (n[r] = o)
                            } else _.forEach(e, function(n, r) {
                                i._injectModels(n, t, e, r)
                            })
                        }
                    }]), e
                }();
            t["default"] = l, e.exports = t["default"]
        }, function(e, t) {
            "use strict";

            function n(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var r = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                i = function() {
                    function e() {
                        n(this, e)
                    }
                    return r(e, [{
                        key: "fetchModels",
                        value: function(e, t) {
                            $.ajax({
                                type: "GET",
                                url: "/enrichment.json",
                                data: {
                                    keys: e
                                },
                                success: function(e) {
                                    t(e)
                                },
                                error: function(e, t, n) {
                                    console.log("error fetching models (" + t + "): " + n)
                                }
                            })
                        }
                    }]), e
                }();
            t["default"] = i, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var o = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                a = n(403),
                s = r(a),
                l = function() {
                    function e() {
                        i(this, e), this.store = {}, this.fetcher = new s["default"]
                    }
                    return o(e, [{
                        key: "loadModels",
                        value: function(e, t) {
                            var n = this,
                                r = this.cachedModels(e),
                                i = _.xor(e, Object.keys(r));
                            i.length > 0 ? this.fetcher.fetchModels(i, function(e) {
                                n.cacheModels(e);
                                var i = _.merge(r, e);
                                t(i)
                            }) : t(r)
                        }
                    }, {
                        key: "cachedModels",
                        value: function(e) {
                            var t = this,
                                n = {};
                            return _.forEach(e, function(e) {
                                var r = t.cachedModel(e);
                                r && (n[e] = r)
                            }), n
                        }
                    }, {
                        key: "cachedModel",
                        value: function(e) {
                            var t = e.split(":"),
                                n = t[0],
                                r = parseInt(t[1]);
                            return this.store[n] ? this.store[n][r] : null
                        }
                    }, {
                        key: "cacheModels",
                        value: function(e) {
                            var t = this;
                            _.forEach(e, function(e, n) {
                                t.cacheModel(n, e)
                            })
                        }
                    }, {
                        key: "cacheModel",
                        value: function(e, t) {
                            var n = e.split(":"),
                                r = n[0],
                                i = parseInt(n[1]);
                            this.store[r] || (this.store[r] = {}), this.store[r][i] = t
                        }
                    }]), e
                }();
            t["default"] = l, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var o = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                a = n(88),
                s = r(a),
                l = n(65),
                u = r(l),
                c = function() {
                    function e(t) {
                        i(this, e), this.stateHolder = t, this.publicActsChannel = u["default"].pusherSubscription("public_acts"), this.visibilityChecker = new s["default"]
                    }
                    return o(e, [{
                        key: "bind",
                        value: function() {
                            this.publicActsChannel.bind("publish", this.onPublishAct, this), this.publicActsChannel.bind("unpublish", this.onUnpublishAct, this)
                        }
                    }, {
                        key: "onPublishAct",
                        value: function(e) {
                            e.updatesAct && this.changeCountIfVisible(e.act, -1), this.changeCountIfVisible(e.act, 1)
                        }
                    }, {
                        key: "onUnpublishAct",
                        value: function(e) {
                            this.changeCountIfVisible(e.act, -1)
                        }
                    }, {
                        key: "changeCountIfVisible",
                        value: function(e, t) {
                            this.visibilityChecker.actVisibleToCurrentUser(e) && this.changeCount(e, t)
                        }
                    }, {
                        key: "changeCount",
                        value: function(e, t) {
                            var n = this.stateHolder.state.publicActCounts,
                                r = e.actType,
                                i = _.clone(n);
                            i[r] = i[r] + t, this.stateHolder.setState({
                                publicActCounts: i
                            })
                        }
                    }, {
                        key: "handleNewCounts",
                        value: function(e) {
                            this.stateHolder.setState({
                                publicActCounts: e
                            })
                        }
                    }]), e
                }();
            t["default"] = c, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var o = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                a = n(88),
                s = r(a),
                l = n(65),
                u = r(l),
                c = function() {
                    function e(t) {
                        i(this, e), this.stateHolder = t, this.publicActsChannel = u["default"].pusherSubscription("public_acts"), this.visibilityChecker = new s["default"]
                    }
                    return o(e, [{
                        key: "bind",
                        value: function() {
                            this.publicActsChannel.bind("publish", this.onPublishAct, this), this.publicActsChannel.bind("unpublish", this.onUnpublishAct, this)
                        }
                    }, {
                        key: "onPublishAct",
                        value: function(e) {
                            var t = e.act;
                            this.addToStateCollectionIfViewable(this.publicActCollection(t), t)
                        }
                    }, {
                        key: "onUnpublishAct",
                        value: function(e) {
                            var t = e.act;
                            this.removeFromStateCollection(this.publicActCollection(t), t)
                        }
                    }, {
                        key: "publicActCollection",
                        value: function(e) {
                            return "submission" == e.actType ? "demandPublicActs" : "performPublicActs"
                        }
                    }, {
                        key: "addToStateCollectionIfViewable",
                        value: function(e, t) {
                            var n = this.stateHolder.state[e],
                                r = this.actsWithout(n.acts, t);
                            this.visibilityChecker.actVisibleToCurrentUser(t) && r.unshift(t);
                            var i = this.calculateCount(n, r);
                            this.updateActsStateCollection(e, r, i)
                        }
                    }, {
                        key: "removeFromStateCollection",
                        value: function(e, t) {
                            var n = this.stateHolder.state[e],
                                r = this.actsWithout(n.acts, t),
                                i = this.calculateCount(n, r);
                            this.updateActsStateCollection(e, r, i)
                        }
                    }, {
                        key: "calculateCount",
                        value: function(e, t) {
                            return e.count + this.lengthDifference(e.acts, t)
                        }
                    }, {
                        key: "lengthDifference",
                        value: function(e, t) {
                            return t.length - e.length
                        }
                    }, {
                        key: "updateActsStateCollection",
                        value: function(e, t, n) {
                            var r = {};
                            r[e] = {
                                count: n,
                                acts: t
                            }, this.stateHolder.setState(r)
                        }
                    }, {
                        key: "actsWithout",
                        value: function(e, t) {
                            return _.reject(e, function(e) {
                                return e.id == t.id
                            })
                        }
                    }]), e
                }();
            t["default"] = c, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }

            function i(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
            var o = function() {
                    function e(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var r = t[n];
                            r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r)
                        }
                    }
                    return function(t, n, r) {
                        return n && e(t.prototype, n), r && e(t, r), t
                    }
                }(),
                a = n(88),
                s = r(a),
                l = n(65),
                u = r(l),
                c = function() {
                    function e(t, n) {
                        i(this, e), this.actType = n, this.stateHolder = t, this.publicActsChannel = u["default"].pusherSubscription("public_acts"), this.visibilityChecker = new s["default"]
                    }
                    return o(e, [{
                        key: "bind",
                        value: function() {
                            this.publicActsChannel.bind("publish", this.onPublishAct, this), this.publicActsChannel.bind("unpublish", this.onUnpublishAct, this)
                        }
                    }, {
                        key: "onPublishAct",
                        value: function(e) {
                            var t = e.act;
                            t.actType == this.actType && this.addToStateCollectionIfViewable("acts", t)
                        }
                    }, {
                        key: "onUnpublishAct",
                        value: function(e) {
                            var t = e.act;
                            t.actType == this.actType && this.removeFromStateCollection("acts", t)
                        }
                    }, {
                        key: "addToStateCollectionIfViewable",
                        value: function(e, t) {
                            var n = this.stateHolder.state[e],
                                r = this.actsWithout(n, t);
                            this.visibilityChecker.actVisibleToCurrentUser(t) && r.unshift(t), this.updateActsStateCollection(e, r)
                        }
                    }, {
                        key: "removeFromStateCollection",
                        value: function(e, t) {
                            var n = this.stateHolder.state[e],
                                r = this.actsWithout(n, t);
                            this.updateActsStateCollection(e, r)
                        }
                    }, {
                        key: "lengthDifference",
                        value: function(e, t) {
                            return t.length - e.length
                        }
                    }, {
                        key: "updateActsStateCollection",
                        value: function(e, t) {
                            var n = {};
                            n[e] = t, this.stateHolder.setState(n)
                        }
                    }, {
                        key: "actsWithout",
                        value: function(e, t) {
                            return _.reject(e, function(e) {
                                return e.id == t.id
                            })
                        }
                    }]), e
                }();
            t["default"] = c, e.exports = t["default"]
        }, function(e, t, n) {
            "use strict";

            function r(e) {
                return e && e.__esModule ? e : {
                    "default": e
                }
            }
            var i = n(1),
                o = r(i),
                a = n(17),
                s = r(a),
                l = n(139),
                u = r(l),
                c = n(390),
                d = r(c),
                p = n(398),
                f = r(p),
                h = n(369),
                m = r(h),
                v = n(383),
                g = r(v),
                y = n(400),
                _ = r(y),
                b = n(364),
                w = r(b);
            window.React = o["default"], window.ReactDOM = s["default"], registerComponent("AssociatePreview", u["default"]), registerComponent("ProfileBar", d["default"]), registerComponent("DashboardContainer", f["default"]), registerComponent("MainNav", m["default"]), registerComponent("Profile", g["default"]), registerComponent("PublicActsContainer", _["default"]), registerComponent("ContentDeletionSetting", w["default"])
        }, function(e, t, n) {
            e.exports = {
                "default": n(414),
                __esModule: !0
            }
        }, function(e, t, n) {
            var r, i;
            /*!
             * Chart.js
             * http://chartjs.org/
             * Version: 1.1.1
             *
             * Copyright 2015 Nick Downie
             * Released under the MIT license
             * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
             */
            (function() {
                "use strict";
                var o = this,
                    a = o.Chart,
                    s = function(e) {
                        this.canvas = e.canvas, this.ctx = e;
                        var t = function(e, t) {
                            return e["offset" + t] ? e["offset" + t] : document.defaultView.getComputedStyle(e).getPropertyValue(t)
                        };
                        return this.width = t(e.canvas, "Width") || e.canvas.width, this.height = t(e.canvas, "Height") || e.canvas.height, this.aspectRatio = this.width / this.height, l.retinaScale(this), this
                    };
                s.defaults = {
                    global: {
                        animation: !0,
                        animationSteps: 60,
                        animationEasing: "easeOutQuart",
                        showScale: !0,
                        scaleOverride: !1,
                        scaleSteps: null,
                        scaleStepWidth: null,
                        scaleStartValue: null,
                        scaleLineColor: "rgba(0,0,0,.1)",
                        scaleLineWidth: 1,
                        scaleShowLabels: !0,
                        scaleLabel: "<%=value%>",
                        scaleIntegersOnly: !0,
                        scaleBeginAtZero: !1,
                        scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                        scaleFontSize: 12,
                        scaleFontStyle: "normal",
                        scaleFontColor: "#666",
                        responsive: !1,
                        maintainAspectRatio: !0,
                        showTooltips: !0,
                        customTooltips: !1,
                        tooltipEvents: ["mousemove", "touchstart", "touchmove", "mouseout"],
                        tooltipFillColor: "rgba(0,0,0,0.8)",
                        tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                        tooltipFontSize: 14,
                        tooltipFontStyle: "normal",
                        tooltipFontColor: "#fff",
                        tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                        tooltipTitleFontSize: 14,
                        tooltipTitleFontStyle: "bold",
                        tooltipTitleFontColor: "#fff",
                        tooltipTitleTemplate: "<%= label%>",
                        tooltipYPadding: 6,
                        tooltipXPadding: 6,
                        tooltipCaretSize: 8,
                        tooltipCornerRadius: 6,
                        tooltipXOffset: 10,
                        tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",
                        multiTooltipTemplate: "<%= datasetLabel %>: <%= value %>",
                        multiTooltipKeyBackground: "#fff",
                        segmentColorDefault: ["#A6CEE3", "#1F78B4", "#B2DF8A", "#33A02C", "#FB9A99", "#E31A1C", "#FDBF6F", "#FF7F00", "#CAB2D6", "#6A3D9A", "#B4B482", "#B15928"],
                        segmentHighlightColorDefaults: ["#CEF6FF", "#47A0DC", "#DAFFB2", "#5BC854", "#FFC2C1", "#FF4244", "#FFE797", "#FFA728", "#F2DAFE", "#9265C2", "#DCDCAA", "#D98150"],
                        onAnimationProgress: function() {},
                        onAnimationComplete: function() {}
                    }
                }, s.types = {};
                var l = s.helpers = {},
                    u = l.each = function(e, t, n) {
                        var r = Array.prototype.slice.call(arguments, 3);
                        if (e)
                            if (e.length === +e.length) {
                                var i;
                                for (i = 0; i < e.length; i++) t.apply(n, [e[i], i].concat(r))
                            } else
                                for (var o in e) t.apply(n, [e[o], o].concat(r))
                    },
                    c = l.clone = function(e) {
                        var t = {};
                        return u(e, function(n, r) {
                            e.hasOwnProperty(r) && (t[r] = n)
                        }), t
                    },
                    d = l.extend = function(e) {
                        return u(Array.prototype.slice.call(arguments, 1), function(t) {
                            u(t, function(n, r) {
                                t.hasOwnProperty(r) && (e[r] = n)
                            })
                        }), e
                    },
                    p = l.merge = function() {
                        var e = Array.prototype.slice.call(arguments, 0);
                        return e.unshift({}), d.apply(null, e)
                    },
                    f = l.indexOf = function(e, t) {
                        if (Array.prototype.indexOf) return e.indexOf(t);
                        for (var n = 0; n < e.length; n++)
                            if (e[n] === t) return n;
                        return -1
                    },
                    h = (l.where = function(e, t) {
                        var n = [];
                        return l.each(e, function(e) {
                            t(e) && n.push(e)
                        }), n
                    }, l.findNextWhere = function(e, t, n) {
                        n || (n = -1);
                        for (var r = n + 1; r < e.length; r++) {
                            var i = e[r];
                            if (t(i)) return i
                        }
                    }, l.findPreviousWhere = function(e, t, n) {
                        n || (n = e.length);
                        for (var r = n - 1; r >= 0; r--) {
                            var i = e[r];
                            if (t(i)) return i
                        }
                    }, l.inherits = function(e) {
                        var t = this,
                            n = e && e.hasOwnProperty("constructor") ? e.constructor : function() {
                                return t.apply(this, arguments)
                            },
                            r = function() {
                                this.constructor = n
                            };
                        return r.prototype = t.prototype, n.prototype = new r, n.extend = h, e && d(n.prototype, e), n.__super__ = t.prototype, n
                    }),
                    m = l.noop = function() {},
                    v = l.uid = function() {
                        var e = 0;
                        return function() {
                            return "chart-" + e++
                        }
                    }(),
                    g = l.warn = function(e) {
                        window.console && "function" == typeof window.console.warn && console.warn(e)
                    },
                    y = l.amd = n(698),
                    _ = l.isNumber = function(e) {
                        return !isNaN(parseFloat(e)) && isFinite(e)
                    },
                    b = l.max = function(e) {
                        return Math.max.apply(Math, e)
                    },
                    w = l.min = function(e) {
                        return Math.min.apply(Math, e)
                    },
                    k = (l.cap = function(e, t, n) {
                        if (_(t)) {
                            if (e > t) return t
                        } else if (_(n) && n > e) return n;
                        return e
                    }, l.getDecimalPlaces = function(e) {
                        if (e % 1 !== 0 && _(e)) {
                            var t = e.toString();
                            if (t.indexOf("e-") < 0) return t.split(".")[1].length;
                            if (t.indexOf(".") < 0) return parseInt(t.split("e-")[1]);
                            var n = t.split(".")[1].split("e-");
                            return n[0].length + parseInt(n[1])
                        }
                        return 0
                    }),
                    M = l.radians = function(e) {
                        return e * (Math.PI / 180)
                    },
                    x = (l.getAngleFromPoint = function(e, t) {
                        var n = t.x - e.x,
                            r = t.y - e.y,
                            i = Math.sqrt(n * n + r * r),
                            o = 2 * Math.PI + Math.atan2(r, n);
                        return 0 > n && 0 > r && (o += 2 * Math.PI), {
                            angle: o,
                            distance: i
                        }
                    }, l.aliasPixel = function(e) {
                        return e % 2 === 0 ? 0 : .5
                    }),
                    T = (l.splineCurve = function(e, t, n, r) {
                        var i = Math.sqrt(Math.pow(t.x - e.x, 2) + Math.pow(t.y - e.y, 2)),
                            o = Math.sqrt(Math.pow(n.x - t.x, 2) + Math.pow(n.y - t.y, 2)),
                            a = r * i / (i + o),
                            s = r * o / (i + o);
                        return {
                            inner: {
                                x: t.x - a * (n.x - e.x),
                                y: t.y - a * (n.y - e.y)
                            },
                            outer: {
                                x: t.x + s * (n.x - e.x),
                                y: t.y + s * (n.y - e.y)
                            }
                        }
                    }, l.calculateOrderOfMagnitude = function(e) {
                        return Math.floor(Math.log(e) / Math.LN10)
                    }),
                    E = (l.calculateScaleRange = function(e, t, n, r, i) {
                        var o = 2,
                            a = Math.floor(t / (1.5 * n)),
                            s = o >= a,
                            l = [];
                        u(e, function(e) {
                            null == e || l.push(e)
                        });
                        var c = w(l),
                            d = b(l);
                        d === c && (d += .5, c >= .5 && !r ? c -= .5 : d += .5);
                        for (var p = Math.abs(d - c), f = T(p), h = Math.ceil(d / (1 * Math.pow(10, f))) * Math.pow(10, f), m = r ? 0 : Math.floor(c / (1 * Math.pow(10, f))) * Math.pow(10, f), v = h - m, g = Math.pow(10, f), y = Math.round(v / g);
                            (y > a || a > 2 * y) && !s;)
                            if (y > a) g *= 2, y = Math.round(v / g), y % 1 !== 0 && (s = !0);
                            else if (i && f >= 0) {
                            if (g / 2 % 1 !== 0) break;
                            g /= 2, y = Math.round(v / g)
                        } else g /= 2, y = Math.round(v / g);
                        return s && (y = o, g = v / y), {
                            steps: y,
                            stepValue: g,
                            min: m,
                            max: m + y * g
                        }
                    }, l.template = function(e, t) {
                        function n(e, t) {
                            var n = /\W/.test(e) ? new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('" + e.replace(/[\r\t\n]/g, " ").split("<%").join("	").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("	").join("');").split("%>").join("p.push('").split("\r").join("\\'") + "');}return p.join('');") : r[e] = r[e];
                            return t ? n(t) : n
                        }
                        if (e instanceof Function) return e(t);
                        var r = {};
                        return n(e, t)
                    }),
                    C = (l.generateLabels = function(e, t, n, r) {
                        var i = new Array(t);
                        return e && u(i, function(t, o) {
                            i[o] = E(e, {
                                value: n + r * (o + 1)
                            })
                        }), i
                    }, l.easingEffects = {
                        linear: function(e) {
                            return e
                        },
                        easeInQuad: function(e) {
                            return e * e
                        },
                        easeOutQuad: function(e) {
                            return -1 * e * (e - 2)
                        },
                        easeInOutQuad: function(e) {
                            return (e /= .5) < 1 ? .5 * e * e : -.5 * (--e * (e - 2) - 1)
                        },
                        easeInCubic: function(e) {
                            return e * e * e
                        },
                        easeOutCubic: function(e) {
                            return 1 * ((e = e / 1 - 1) * e * e + 1)
                        },
                        easeInOutCubic: function(e) {
                            return (e /= .5) < 1 ? .5 * e * e * e : .5 * ((e -= 2) * e * e + 2)
                        },
                        easeInQuart: function(e) {
                            return e * e * e * e
                        },
                        easeOutQuart: function(e) {
                            return -1 * ((e = e / 1 - 1) * e * e * e - 1)
                        },
                        easeInOutQuart: function(e) {
                            return (e /= .5) < 1 ? .5 * e * e * e * e : -.5 * ((e -= 2) * e * e * e - 2)
                        },
                        easeInQuint: function(e) {
                            return 1 * (e /= 1) * e * e * e * e
                        },
                        easeOutQuint: function(e) {
                            return 1 * ((e = e / 1 - 1) * e * e * e * e + 1)
                        },
                        easeInOutQuint: function(e) {
                            return (e /= .5) < 1 ? .5 * e * e * e * e * e : .5 * ((e -= 2) * e * e * e * e + 2)
                        },
                        easeInSine: function(e) {
                            return -1 * Math.cos(e / 1 * (Math.PI / 2)) + 1
                        },
                        easeOutSine: function(e) {
                            return 1 * Math.sin(e / 1 * (Math.PI / 2))
                        },
                        easeInOutSine: function(e) {
                            return -.5 * (Math.cos(Math.PI * e / 1) - 1)
                        },
                        easeInExpo: function(e) {
                            return 0 === e ? 1 : 1 * Math.pow(2, 10 * (e / 1 - 1))
                        },
                        easeOutExpo: function(e) {
                            return 1 === e ? 1 : 1 * (-Math.pow(2, -10 * e / 1) + 1)
                        },
                        easeInOutExpo: function(e) {
                            return 0 === e ? 0 : 1 === e ? 1 : (e /= .5) < 1 ? .5 * Math.pow(2, 10 * (e - 1)) : .5 * (-Math.pow(2, -10 * --e) + 2)
                        },
                        easeInCirc: function(e) {
                            return e >= 1 ? e : -1 * (Math.sqrt(1 - (e /= 1) * e) - 1)
                        },
                        easeOutCirc: function(e) {
                            return 1 * Math.sqrt(1 - (e = e / 1 - 1) * e)
                        },
                        easeInOutCirc: function(e) {
                            return (e /= .5) < 1 ? -.5 * (Math.sqrt(1 - e * e) - 1) : .5 * (Math.sqrt(1 - (e -= 2) * e) + 1)
                        },
                        easeInElastic: function(e) {
                            var t = 1.70158,
                                n = 0,
                                r = 1;
                            return 0 === e ? 0 : 1 == (e /= 1) ? 1 : (n || (n = .3), r < Math.abs(1) ? (r = 1, t = n / 4) : t = n / (2 * Math.PI) * Math.asin(1 / r), -(r * Math.pow(2, 10 * (e -= 1)) * Math.sin(2 * (1 * e - t) * Math.PI / n)))
                        },
                        easeOutElastic: function(e) {
                            var t = 1.70158,
                                n = 0,
                                r = 1;
                            return 0 === e ? 0 : 1 == (e /= 1) ? 1 : (n || (n = .3), r < Math.abs(1) ? (r = 1, t = n / 4) : t = n / (2 * Math.PI) * Math.asin(1 / r), r * Math.pow(2, -10 * e) * Math.sin(2 * (1 * e - t) * Math.PI / n) + 1)
                        },
                        easeInOutElastic: function(e) {
                            var t = 1.70158,
                                n = 0,
                                r = 1;
                            return 0 === e ? 0 : 2 == (e /= .5) ? 1 : (n || (n = .3 * 1.5), r < Math.abs(1) ? (r = 1, t = n / 4) : t = n / (2 * Math.PI) * Math.asin(1 / r), 1 > e ? -.5 * r * Math.pow(2, 10 * (e -= 1)) * Math.sin(2 * (1 * e - t) * Math.PI / n) : r * Math.pow(2, -10 * (e -= 1)) * Math.sin(2 * (1 * e - t) * Math.PI / n) * .5 + 1)
                        },
                        easeInBack: function(e) {
                            var t = 1.70158;
                            return 1 * (e /= 1) * e * ((t + 1) * e - t)
                        },
                        easeOutBack: function(e) {
                            var t = 1.70158;
                            return 1 * ((e = e / 1 - 1) * e * ((t + 1) * e + t) + 1)
                        },
                        easeInOutBack: function(e) {
                            var t = 1.70158;
                            return (e /= .5) < 1 ? .5 * e * e * (((t *= 1.525) + 1) * e - t) : .5 * ((e -= 2) * e * (((t *= 1.525) + 1) * e + t) + 2)
                        },
                        easeInBounce: function(e) {
                            return 1 - C.easeOutBounce(1 - e)
                        },
                        easeOutBounce: function(e) {
                            return (e /= 1) < 1 / 2.75 ? 7.5625 * e * e : 2 / 2.75 > e ? 1 * (7.5625 * (e -= 1.5 / 2.75) * e + .75) : 2.5 / 2.75 > e ? 1 * (7.5625 * (e -= 2.25 / 2.75) * e + .9375) : 1 * (7.5625 * (e -= 2.625 / 2.75) * e + .984375)
                        },
                        easeInOutBounce: function(e) {
                            return .5 > e ? .5 * C.easeInBounce(2 * e) : .5 * C.easeOutBounce(2 * e - 1) + .5
                        }
                    }),
                    D = l.requestAnimFrame = function() {
                        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(e) {
                            return window.setTimeout(e, 1e3 / 60)
                        }
                    }(),
                    L = (l.cancelAnimFrame = function() {
                        return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame || function(e) {
                            return window.clearTimeout(e, 1e3 / 60)
                        }
                    }(), l.animationLoop = function(e, t, n, r, i, o) {
                        var a = 0,
                            s = C[n] || C.linear,
                            l = function() {
                                a++;
                                var n = a / t,
                                    u = s(n);
                                e.call(o, u, n, a), r.call(o, u, n), t > a ? o.animationFrame = D(l) : i.apply(o)
                            };
                        D(l)
                    }, l.getRelativePosition = function(e) {
                        var t, n, r = e.originalEvent || e,
                            i = e.currentTarget || e.srcElement,
                            o = i.getBoundingClientRect();
                        return r.touches ? (t = r.touches[0].clientX - o.left, n = r.touches[0].clientY - o.top) : (t = r.clientX - o.left, n = r.clientY - o.top), {
                            x: t,
                            y: n
                        }
                    }, l.addEvent = function(e, t, n) {
                        e.addEventListener ? e.addEventListener(t, n) : e.attachEvent ? e.attachEvent("on" + t, n) : e["on" + t] = n
                    }),
                    S = l.removeEvent = function(e, t, n) {
                        e.removeEventListener ? e.removeEventListener(t, n, !1) : e.detachEvent ? e.detachEvent("on" + t, n) : e["on" + t] = m
                    },
                    P = (l.bindEvents = function(e, t, n) {
                        e.events || (e.events = {}), u(t, function(t) {
                            e.events[t] = function() {
                                n.apply(e, arguments)
                            }, L(e.chart.canvas, t, e.events[t])
                        })
                    }, l.unbindEvents = function(e, t) {
                        u(t, function(t, n) {
                            S(e.chart.canvas, n, t)
                        })
                    }),
                    N = l.getMaximumWidth = function(e) {
                        var t = e.parentNode,
                            n = parseInt(A(t, "padding-left")) + parseInt(A(t, "padding-right"));
                        return t ? t.clientWidth - n : 0
                    },
                    O = l.getMaximumHeight = function(e) {
                        var t = e.parentNode,
                            n = parseInt(A(t, "padding-bottom")) + parseInt(A(t, "padding-top"));
                        return t ? t.clientHeight - n : 0
                    },
                    A = l.getStyle = function(e, t) {
                        return e.currentStyle ? e.currentStyle[t] : document.defaultView.getComputedStyle(e, null).getPropertyValue(t)
                    },
                    Y = (l.getMaximumSize = l.getMaximumWidth, l.retinaScale = function(e) {
                        var t = e.ctx,
                            n = e.canvas.width,
                            r = e.canvas.height;
                        window.devicePixelRatio && (t.canvas.style.width = n + "px", t.canvas.style.height = r + "px", t.canvas.height = r * window.devicePixelRatio, t.canvas.width = n * window.devicePixelRatio, t.scale(window.devicePixelRatio, window.devicePixelRatio))
                    }),
                    j = l.clear = function(e) {
                        e.ctx.clearRect(0, 0, e.width, e.height)
                    },
                    I = l.fontString = function(e, t, n) {
                        return t + " " + e + "px " + n
                    },
                    R = l.longestText = function(e, t, n) {
                        e.font = t;
                        var r = 0;
                        return u(n, function(t) {
                            var n = e.measureText(t).width;
                            r = n > r ? n : r
                        }), r
                    },
                    H = l.drawRoundedRectangle = function(e, t, n, r, i, o) {
                        e.beginPath(), e.moveTo(t + o, n), e.lineTo(t + r - o, n), e.quadraticCurveTo(t + r, n, t + r, n + o), e.lineTo(t + r, n + i - o), e.quadraticCurveTo(t + r, n + i, t + r - o, n + i), e.lineTo(t + o, n + i), e.quadraticCurveTo(t, n + i, t, n + i - o), e.lineTo(t, n + o), e.quadraticCurveTo(t, n, t + o, n), e.closePath()
                    };
                s.instances = {}, s.Type = function(e, t, n) {
                    this.options = t, this.chart = n, this.id = v(), s.instances[this.id] = this, t.responsive && this.resize(), this.initialize.call(this, e)
                }, d(s.Type.prototype, {
                    initialize: function() {
                        return this
                    },
                    clear: function() {
                        return j(this.chart), this
                    },
                    stop: function() {
                        return s.animationService.cancelAnimation(this), this
                    },
                    resize: function(e) {
                        this.stop();
                        var t = this.chart.canvas,
                            n = N(this.chart.canvas),
                            r = this.options.maintainAspectRatio ? n / this.chart.aspectRatio : O(this.chart.canvas);
                        return t.width = this.chart.width = n, t.height = this.chart.height = r, Y(this.chart), "function" == typeof e && e.apply(this, Array.prototype.slice.call(arguments, 1)), this
                    },
                    reflow: m,
                    render: function(e) {
                        if (e && this.reflow(), this.options.animation && !e) {
                            var t = new s.Animation;
                            t.numSteps = this.options.animationSteps, t.easing = this.options.animationEasing, t.render = function(e, t) {
                                var n = l.easingEffects[t.easing],
                                    r = t.currentStep / t.numSteps,
                                    i = n(r);
                                e.draw(i, r, t.currentStep)
                            }, t.onAnimationProgress = this.options.onAnimationProgress, t.onAnimationComplete = this.options.onAnimationComplete, s.animationService.addAnimation(this, t)
                        } else this.draw(), this.options.onAnimationComplete.call(this);
                        return this
                    },
                    generateLegend: function() {
                        return l.template(this.options.legendTemplate, this)
                    },
                    destroy: function() {
                        this.stop(), this.clear(), P(this, this.events);
                        var e = this.chart.canvas;
                        e.width = this.chart.width, e.height = this.chart.height, e.style.removeProperty ? (e.style.removeProperty("width"), e.style.removeProperty("height")) : (e.style.removeAttribute("width"), e.style.removeAttribute("height")), delete s.instances[this.id]
                    },
                    showTooltip: function(e, t) {
                        "undefined" == typeof this.activeElements && (this.activeElements = []);
                        var n = function(e) {
                            var t = !1;
                            return e.length !== this.activeElements.length ? t = !0 : (u(e, function(e, n) {
                                e !== this.activeElements[n] && (t = !0)
                            }, this), t)
                        }.call(this, e);
                        if (n || t) {
                            if (this.activeElements = e, this.draw(), this.options.customTooltips && this.options.customTooltips(!1), e.length > 0)
                                if (this.datasets && this.datasets.length > 1) {
                                    for (var r, i, o = this.datasets.length - 1; o >= 0 && (r = this.datasets[o].points || this.datasets[o].bars || this.datasets[o].segments, i = f(r, e[0]), -1 === i); o--);
                                    var a = [],
                                        c = [],
                                        d = function() {
                                            var e, t, n, r, o, s = [],
                                                u = [],
                                                d = [];
                                            return l.each(this.datasets, function(t) {
                                                e = t.points || t.bars || t.segments, e[i] && e[i].hasValue() && s.push(e[i])
                                            }), l.each(s, function(e) {
                                                u.push(e.x), d.push(e.y), a.push(l.template(this.options.multiTooltipTemplate, e)), c.push({
                                                    fill: e._saved.fillColor || e.fillColor,
                                                    stroke: e._saved.strokeColor || e.strokeColor
                                                })
                                            }, this), o = w(d), n = b(d), r = w(u), t = b(u), {
                                                x: r > this.chart.width / 2 ? r : t,
                                                y: (o + n) / 2
                                            }
                                        }.call(this, i);
                                    new s.MultiTooltip({
                                        x: d.x,
                                        y: d.y,
                                        xPadding: this.options.tooltipXPadding,
                                        yPadding: this.options.tooltipYPadding,
                                        xOffset: this.options.tooltipXOffset,
                                        fillColor: this.options.tooltipFillColor,
                                        textColor: this.options.tooltipFontColor,
                                        fontFamily: this.options.tooltipFontFamily,
                                        fontStyle: this.options.tooltipFontStyle,
                                        fontSize: this.options.tooltipFontSize,
                                        titleTextColor: this.options.tooltipTitleFontColor,
                                        titleFontFamily: this.options.tooltipTitleFontFamily,
                                        titleFontStyle: this.options.tooltipTitleFontStyle,
                                        titleFontSize: this.options.tooltipTitleFontSize,
                                        cornerRadius: this.options.tooltipCornerRadius,
                                        labels: a,
                                        legendColors: c,
                                        legendColorBackground: this.options.multiTooltipKeyBackground,
                                        title: E(this.options.tooltipTitleTemplate, e[0]),
                                        chart: this.chart,
                                        ctx: this.chart.ctx,
                                        custom: this.options.customTooltips
                                    }).draw()
                                } else u(e, function(e) {
                                    var t = e.tooltipPosition();
                                    new s.Tooltip({
                                        x: Math.round(t.x),
                                        y: Math.round(t.y),
                                        xPadding: this.options.tooltipXPadding,
                                        yPadding: this.options.tooltipYPadding,
                                        fillColor: this.options.tooltipFillColor,
                                        textColor: this.options.tooltipFontColor,
                                        fontFamily: this.options.tooltipFontFamily,
                                        fontStyle: this.options.tooltipFontStyle,
                                        fontSize: this.options.tooltipFontSize,
                                        caretHeight: this.options.tooltipCaretSize,
                                        cornerRadius: this.options.tooltipCornerRadius,
                                        text: E(this.options.tooltipTemplate, e),
                                        chart: this.chart,
                                        custom: this.options.customTooltips
                                    }).draw()
                                }, this);
                            return this
                        }
                    },
                    toBase64Image: function() {
                        return this.chart.canvas.toDataURL.apply(this.chart.canvas, arguments)
                    }
                }), s.Type.extend = function(e) {
                    var t = this,
                        n = function() {
                            return t.apply(this, arguments)
                        };
                    if (n.prototype = c(t.prototype), d(n.prototype, e), n.extend = s.Type.extend, e.name || t.prototype.name) {
                        var r = e.name || t.prototype.name,
                            i = s.defaults[t.prototype.name] ? c(s.defaults[t.prototype.name]) : {};
                        s.defaults[r] = d(i, e.defaults), s.types[r] = n, s.prototype[r] = function(e, t) {
                            var i = p(s.defaults.global, s.defaults[r], t || {});
                            return new n(e, i, this)
                        }
                    } else g("Name not provided for this chart, so it hasn't been registered");
                    return t
                }, s.Element = function(e) {
                    d(this, e), this.initialize.apply(this, arguments), this.save()
                }, d(s.Element.prototype, {
                    initialize: function() {},
                    restore: function(e) {
                        return e ? u(e, function(e) {
                            this[e] = this._saved[e]
                        }, this) : d(this, this._saved), this
                    },
                    save: function() {
                        return this._saved = c(this), delete this._saved._saved, this
                    },
                    update: function(e) {
                        return u(e, function(e, t) {
                            this._saved[t] = this[t], this[t] = e
                        }, this), this
                    },
                    transition: function(e, t) {
                        return u(e, function(e, n) {
                            this[n] = (e - this._saved[n]) * t + this._saved[n]
                        }, this), this
                    },
                    tooltipPosition: function() {
                        return {
                            x: this.x,
                            y: this.y
                        }
                    },
                    hasValue: function() {
                        return _(this.value)
                    }
                }), s.Element.extend = h, s.Point = s.Element.extend({
                    display: !0,
                    inRange: function(e, t) {
                        var n = this.hitDetectionRadius + this.radius;
                        return Math.pow(e - this.x, 2) + Math.pow(t - this.y, 2) < Math.pow(n, 2)
                    },
                    draw: function() {
                        if (this.display) {
                            var e = this.ctx;
                            e.beginPath(), e.arc(this.x, this.y, this.radius, 0, 2 * Math.PI), e.closePath(), e.strokeStyle = this.strokeColor, e.lineWidth = this.strokeWidth, e.fillStyle = this.fillColor, e.fill(), e.stroke()
                        }
                    }
                }), s.Arc = s.Element.extend({
                    inRange: function(e, t) {
                        var n = l.getAngleFromPoint(this, {
                                x: e,
                                y: t
                            }),
                            r = n.angle % (2 * Math.PI),
                            i = (2 * Math.PI + this.startAngle) % (2 * Math.PI),
                            o = (2 * Math.PI + this.endAngle) % (2 * Math.PI) || 360,
                            a = i > o ? o >= r || r >= i : r >= i && o >= r,
                            s = n.distance >= this.innerRadius && n.distance <= this.outerRadius;
                        return a && s
                    },
                    tooltipPosition: function() {
                        var e = this.startAngle + (this.endAngle - this.startAngle) / 2,
                            t = (this.outerRadius - this.innerRadius) / 2 + this.innerRadius;
                        return {
                            x: this.x + Math.cos(e) * t,
                            y: this.y + Math.sin(e) * t
                        }
                    },
                    draw: function() {
                        var e = this.ctx;
                        e.beginPath(), e.arc(this.x, this.y, this.outerRadius < 0 ? 0 : this.outerRadius, this.startAngle, this.endAngle), e.arc(this.x, this.y, this.innerRadius < 0 ? 0 : this.innerRadius, this.endAngle, this.startAngle, !0), e.closePath(), e.strokeStyle = this.strokeColor, e.lineWidth = this.strokeWidth, e.fillStyle = this.fillColor, e.fill(), e.lineJoin = "bevel", this.showStroke && e.stroke()
                    }
                }), s.Rectangle = s.Element.extend({
                    draw: function() {
                        var e = this.ctx,
                            t = this.width / 2,
                            n = this.x - t,
                            r = this.x + t,
                            i = this.base - (this.base - this.y),
                            o = this.strokeWidth / 2;
                        this.showStroke && (n += o, r -= o, i += o), e.beginPath(), e.fillStyle = this.fillColor, e.strokeStyle = this.strokeColor, e.lineWidth = this.strokeWidth, e.moveTo(n, this.base), e.lineTo(n, i), e.lineTo(r, i), e.lineTo(r, this.base), e.fill(), this.showStroke && e.stroke()
                    },
                    height: function() {
                        return this.base - this.y
                    },
                    inRange: function(e, t) {
                        return e >= this.x - this.width / 2 && e <= this.x + this.width / 2 && t >= this.y && t <= this.base
                    }
                }), s.Animation = s.Element.extend({
                    currentStep: null,
                    numSteps: 60,
                    easing: "",
                    render: null,
                    onAnimationProgress: null,
                    onAnimationComplete: null
                }), s.Tooltip = s.Element.extend({
                    draw: function() {
                        var e = this.chart.ctx;
                        e.font = I(this.fontSize, this.fontStyle, this.fontFamily), this.xAlign = "center", this.yAlign = "above";
                        var t = this.caretPadding = 2,
                            n = e.measureText(this.text).width + 2 * this.xPadding,
                            r = this.fontSize + 2 * this.yPadding,
                            i = r + this.caretHeight + t;
                        this.x + n / 2 > this.chart.width ? this.xAlign = "left" : this.x - n / 2 < 0 && (this.xAlign = "right"), this.y - i < 0 && (this.yAlign = "below");
                        var o = this.x - n / 2,
                            a = this.y - i;
                        if (e.fillStyle = this.fillColor, this.custom) this.custom(this);
                        else {
                            switch (this.yAlign) {
                                case "above":
                                    e.beginPath(), e.moveTo(this.x, this.y - t), e.lineTo(this.x + this.caretHeight, this.y - (t + this.caretHeight)), e.lineTo(this.x - this.caretHeight, this.y - (t + this.caretHeight)), e.closePath(), e.fill();
                                    break;
                                case "below":
                                    a = this.y + t + this.caretHeight, e.beginPath(), e.moveTo(this.x, this.y + t), e.lineTo(this.x + this.caretHeight, this.y + t + this.caretHeight), e.lineTo(this.x - this.caretHeight, this.y + t + this.caretHeight), e.closePath(), e.fill()
                            }
                            switch (this.xAlign) {
                                case "left":
                                    o = this.x - n + (this.cornerRadius + this.caretHeight);
                                    break;
                                case "right":
                                    o = this.x - (this.cornerRadius + this.caretHeight)
                            }
                            H(e, o, a, n, r, this.cornerRadius), e.fill(), e.fillStyle = this.textColor, e.textAlign = "center", e.textBaseline = "middle", e.fillText(this.text, o + n / 2, a + r / 2)
                        }
                    }
                }), s.MultiTooltip = s.Element.extend({
                    initialize: function() {
                        this.font = I(this.fontSize, this.fontStyle, this.fontFamily), this.titleFont = I(this.titleFontSize, this.titleFontStyle, this.titleFontFamily), this.titleHeight = this.title ? 1.5 * this.titleFontSize : 0, this.height = this.labels.length * this.fontSize + (this.labels.length - 1) * (this.fontSize / 2) + 2 * this.yPadding + this.titleHeight, this.ctx.font = this.titleFont;
                        var e = this.ctx.measureText(this.title).width,
                            t = R(this.ctx, this.font, this.labels) + this.fontSize + 3,
                            n = b([t, e]);
                        this.width = n + 2 * this.xPadding;
                        var r = this.height / 2;
                        this.y - r < 0 ? this.y = r : this.y + r > this.chart.height && (this.y = this.chart.height - r), this.x > this.chart.width / 2 ? this.x -= this.xOffset + this.width : this.x += this.xOffset
                    },
                    getLineHeight: function(e) {
                        var t = this.y - this.height / 2 + this.yPadding,
                            n = e - 1;
                        return 0 === e ? t + this.titleHeight / 3 : t + (1.5 * this.fontSize * n + this.fontSize / 2) + this.titleHeight
                    },
                    draw: function() {
                        if (this.custom) this.custom(this);
                        else {
                            H(this.ctx, this.x, this.y - this.height / 2, this.width, this.height, this.cornerRadius);
                            var e = this.ctx;
                            e.fillStyle = this.fillColor, e.fill(), e.closePath(), e.textAlign = "left", e.textBaseline = "middle", e.fillStyle = this.titleTextColor, e.font = this.titleFont, e.fillText(this.title, this.x + this.xPadding, this.getLineHeight(0)), e.font = this.font, l.each(this.labels, function(t, n) {
                                e.fillStyle = this.textColor, e.fillText(t, this.x + this.xPadding + this.fontSize + 3, this.getLineHeight(n + 1)), e.fillStyle = this.legendColorBackground, e.fillRect(this.x + this.xPadding, this.getLineHeight(n + 1) - this.fontSize / 2, this.fontSize, this.fontSize), e.fillStyle = this.legendColors[n].fill, e.fillRect(this.x + this.xPadding, this.getLineHeight(n + 1) - this.fontSize / 2, this.fontSize, this.fontSize)
                            }, this)
                        }
                    }
                }), s.Scale = s.Element.extend({
                    initialize: function() {
                        this.fit()
                    },
                    buildYLabels: function() {
                        this.yLabels = [];
                        for (var e = k(this.stepValue), t = 0; t <= this.steps; t++) this.yLabels.push(E(this.templateString, {
                            value: (this.min + t * this.stepValue).toFixed(e)
                        }));
                        this.yLabelWidth = this.display && this.showLabels ? R(this.ctx, this.font, this.yLabels) + 10 : 0
                    },
                    addXLabel: function(e) {
                        this.xLabels.push(e), this.valuesCount++, this.fit()
                    },
                    removeXLabel: function() {
                        this.xLabels.shift(), this.valuesCount--, this.fit()
                    },
                    fit: function() {
                        this.startPoint = this.display ? this.fontSize : 0, this.endPoint = this.display ? this.height - 1.5 * this.fontSize - 5 : this.height, this.startPoint += this.padding, this.endPoint -= this.padding;
                        var e, t = this.endPoint,
                            n = this.endPoint - this.startPoint;
                        for (this.calculateYRange(n), this.buildYLabels(), this.calculateXLabelRotation(); n > this.endPoint - this.startPoint;) n = this.endPoint - this.startPoint, e = this.yLabelWidth, this.calculateYRange(n), this.buildYLabels(), e < this.yLabelWidth && (this.endPoint = t, this.calculateXLabelRotation())
                    },
                    calculateXLabelRotation: function() {
                        this.ctx.font = this.font;
                        var e, t, n = this.ctx.measureText(this.xLabels[0]).width,
                            r = this.ctx.measureText(this.xLabels[this.xLabels.length - 1]).width;
                        if (this.xScalePaddingRight = r / 2 + 3, this.xScalePaddingLeft = n / 2 > this.yLabelWidth ? n / 2 : this.yLabelWidth, this.xLabelRotation = 0, this.display) {
                            var i, o = R(this.ctx, this.font, this.xLabels);
                            this.xLabelWidth = o;
                            for (var a = Math.floor(this.calculateX(1) - this.calculateX(0)) - 6; this.xLabelWidth > a && 0 === this.xLabelRotation || this.xLabelWidth > a && this.xLabelRotation <= 90 && this.xLabelRotation > 0;) i = Math.cos(M(this.xLabelRotation)), e = i * n, t = i * r, e + this.fontSize / 2 > this.yLabelWidth && (this.xScalePaddingLeft = e + this.fontSize / 2), this.xScalePaddingRight = this.fontSize / 2, this.xLabelRotation++, this.xLabelWidth = i * o;
                            this.xLabelRotation > 0 && (this.endPoint -= Math.sin(M(this.xLabelRotation)) * o + 3)
                        } else this.xLabelWidth = 0, this.xScalePaddingRight = this.padding, this.xScalePaddingLeft = this.padding
                    },
                    calculateYRange: m,
                    drawingArea: function() {
                        return this.startPoint - this.endPoint
                    },
                    calculateY: function(e) {
                        var t = this.drawingArea() / (this.min - this.max);
                        return this.endPoint - t * (e - this.min)
                    },
                    calculateX: function(e) {
                        var t = (this.xLabelRotation > 0, this.width - (this.xScalePaddingLeft + this.xScalePaddingRight)),
                            n = t / Math.max(this.valuesCount - (this.offsetGridLines ? 0 : 1), 1),
                            r = n * e + this.xScalePaddingLeft;
                        return this.offsetGridLines && (r += n / 2), Math.round(r)
                    },
                    update: function(e) {
                        l.extend(this, e), this.fit()
                    },
                    draw: function() {
                        var e = this.ctx,
                            t = (this.endPoint - this.startPoint) / this.steps,
                            n = Math.round(this.xScalePaddingLeft);
                        this.display && (e.fillStyle = this.textColor, e.font = this.font, u(this.yLabels, function(r, i) {
                            var o = this.endPoint - t * i,
                                a = Math.round(o),
                                s = this.showHorizontalLines;
                            e.textAlign = "right", e.textBaseline = "middle", this.showLabels && e.fillText(r, n - 10, o), 0 !== i || s || (s = !0), s && e.beginPath(), i > 0 ? (e.lineWidth = this.gridLineWidth, e.strokeStyle = this.gridLineColor) : (e.lineWidth = this.lineWidth, e.strokeStyle = this.lineColor), a += l.aliasPixel(e.lineWidth), s && (e.moveTo(n, a), e.lineTo(this.width, a), e.stroke(), e.closePath()), e.lineWidth = this.lineWidth, e.strokeStyle = this.lineColor, e.beginPath(), e.moveTo(n - 5, a), e.lineTo(n, a), e.stroke(), e.closePath()
                        }, this), u(this.xLabels, function(t, n) {
                            var r = this.calculateX(n) + x(this.lineWidth),
                                i = this.calculateX(n - (this.offsetGridLines ? .5 : 0)) + x(this.lineWidth),
                                o = this.xLabelRotation > 0,
                                a = this.showVerticalLines;
                            0 !== n || a || (a = !0), a && e.beginPath(), n > 0 ? (e.lineWidth = this.gridLineWidth, e.strokeStyle = this.gridLineColor) : (e.lineWidth = this.lineWidth, e.strokeStyle = this.lineColor), a && (e.moveTo(i, this.endPoint), e.lineTo(i, this.startPoint - 3), e.stroke(), e.closePath()), e.lineWidth = this.lineWidth, e.strokeStyle = this.lineColor, e.beginPath(), e.moveTo(i, this.endPoint), e.lineTo(i, this.endPoint + 5), e.stroke(), e.closePath(), e.save(), e.translate(r, o ? this.endPoint + 12 : this.endPoint + 8), e.rotate(-1 * M(this.xLabelRotation)), e.font = this.font, e.textAlign = o ? "right" : "center", e.textBaseline = o ? "middle" : "top", e.fillText(t, 0, 0), e.restore()
                        }, this))
                    }
                }), s.RadialScale = s.Element.extend({
                    initialize: function() {
                        this.size = w([this.height, this.width]), this.drawingArea = this.display ? this.size / 2 - (this.fontSize / 2 + this.backdropPaddingY) : this.size / 2
                    },
                    calculateCenterOffset: function(e) {
                        var t = this.drawingArea / (this.max - this.min);
                        return (e - this.min) * t
                    },
                    update: function() {
                        this.lineArc ? this.drawingArea = this.display ? this.size / 2 - (this.fontSize / 2 + this.backdropPaddingY) : this.size / 2 : this.setScaleSize(), this.buildYLabels()
                    },
                    buildYLabels: function() {
                        this.yLabels = [];
                        for (var e = k(this.stepValue), t = 0; t <= this.steps; t++) this.yLabels.push(E(this.templateString, {
                            value: (this.min + t * this.stepValue).toFixed(e)
                        }))
                    },
                    getCircumference: function() {
                        return 2 * Math.PI / this.valuesCount
                    },
                    setScaleSize: function() {
                        var e, t, n, r, i, o, a, s, l, u, c, d, p = w([this.height / 2 - this.pointLabelFontSize - 5, this.width / 2]),
                            f = this.width,
                            h = 0;
                        for (this.ctx.font = I(this.pointLabelFontSize, this.pointLabelFontStyle, this.pointLabelFontFamily), t = 0; t < this.valuesCount; t++) e = this.getPointPosition(t, p), n = this.ctx.measureText(E(this.templateString, {
                            value: this.labels[t]
                        })).width + 5, 0 === t || t === this.valuesCount / 2 ? (r = n / 2, e.x + r > f && (f = e.x + r, i = t), e.x - r < h && (h = e.x - r, a = t)) : t < this.valuesCount / 2 ? e.x + n > f && (f = e.x + n, i = t) : t > this.valuesCount / 2 && e.x - n < h && (h = e.x - n, a = t);
                        l = h, u = Math.ceil(f - this.width), o = this.getIndexAngle(i), s = this.getIndexAngle(a), c = u / Math.sin(o + Math.PI / 2), d = l / Math.sin(s + Math.PI / 2), c = _(c) ? c : 0, d = _(d) ? d : 0, this.drawingArea = p - (d + c) / 2, this.setCenterPoint(d, c)
                    },
                    setCenterPoint: function(e, t) {
                        var n = this.width - t - this.drawingArea,
                            r = e + this.drawingArea;
                        this.xCenter = (r + n) / 2, this.yCenter = this.height / 2
                    },
                    getIndexAngle: function(e) {
                        var t = 2 * Math.PI / this.valuesCount;
                        return e * t - Math.PI / 2
                    },
                    getPointPosition: function(e, t) {
                        var n = this.getIndexAngle(e);
                        return {
                            x: Math.cos(n) * t + this.xCenter,
                            y: Math.sin(n) * t + this.yCenter
                        }
                    },
                    draw: function() {
                        if (this.display) {
                            var e = this.ctx;
                            if (u(this.yLabels, function(t, n) {
                                    if (n > 0) {
                                        var r, i = n * (this.drawingArea / this.steps),
                                            o = this.yCenter - i;
                                        if (this.lineWidth > 0)
                                            if (e.strokeStyle = this.lineColor, e.lineWidth = this.lineWidth, this.lineArc) e.beginPath(), e.arc(this.xCenter, this.yCenter, i, 0, 2 * Math.PI), e.closePath(), e.stroke();
                                            else {
                                                e.beginPath();
                                                for (var a = 0; a < this.valuesCount; a++) r = this.getPointPosition(a, this.calculateCenterOffset(this.min + n * this.stepValue)), 0 === a ? e.moveTo(r.x, r.y) : e.lineTo(r.x, r.y);
                                                e.closePath(), e.stroke()
                                            } if (this.showLabels) {
                                            if (e.font = I(this.fontSize, this.fontStyle, this.fontFamily), this.showLabelBackdrop) {
                                                var s = e.measureText(t).width;
                                                e.fillStyle = this.backdropColor, e.fillRect(this.xCenter - s / 2 - this.backdropPaddingX, o - this.fontSize / 2 - this.backdropPaddingY, s + 2 * this.backdropPaddingX, this.fontSize + 2 * this.backdropPaddingY)
                                            }
                                            e.textAlign = "center", e.textBaseline = "middle", e.fillStyle = this.fontColor, e.fillText(t, this.xCenter, o)
                                        }
                                    }
                                }, this), !this.lineArc) {
                                e.lineWidth = this.angleLineWidth, e.strokeStyle = this.angleLineColor;
                                for (var t = this.valuesCount - 1; t >= 0; t--) {
                                    var n = null,
                                        r = null;
                                    if (this.angleLineWidth > 0 && t % this.angleLineInterval === 0 && (n = this.calculateCenterOffset(this.max), r = this.getPointPosition(t, n), e.beginPath(), e.moveTo(this.xCenter, this.yCenter), e.lineTo(r.x, r.y), e.stroke(), e.closePath()), this.backgroundColors && this.backgroundColors.length == this.valuesCount) {
                                        null == n && (n = this.calculateCenterOffset(this.max)), null == r && (r = this.getPointPosition(t, n));
                                        var i = this.getPointPosition(0 === t ? this.valuesCount - 1 : t - 1, n),
                                            o = this.getPointPosition(t === this.valuesCount - 1 ? 0 : t + 1, n),
                                            a = {
                                                x: (i.x + r.x) / 2,
                                                y: (i.y + r.y) / 2
                                            },
                                            s = {
                                                x: (r.x + o.x) / 2,
                                                y: (r.y + o.y) / 2
                                            };
                                        e.beginPath(), e.moveTo(this.xCenter, this.yCenter), e.lineTo(a.x, a.y), e.lineTo(r.x, r.y), e.lineTo(s.x, s.y), e.fillStyle = this.backgroundColors[t], e.fill(), e.closePath()
                                    }
                                    var l = this.getPointPosition(t, this.calculateCenterOffset(this.max) + 5);
                                    e.font = I(this.pointLabelFontSize, this.pointLabelFontStyle, this.pointLabelFontFamily), e.fillStyle = this.pointLabelFontColor;
                                    var c = this.labels.length,
                                        d = this.labels.length / 2,
                                        p = d / 2,
                                        f = p > t || t > c - p,
                                        h = t === p || t === c - p;
                                    e.textAlign = 0 === t ? "center" : t === d ? "center" : d > t ? "left" : "right", e.textBaseline = h ? "middle" : f ? "bottom" : "top", e.fillText(this.labels[t], l.x, l.y)
                                }
                            }
                        }
                    }
                }), s.animationService = {
                    frameDuration: 17,
                    animations: [],
                    dropFrames: 0,
                    addAnimation: function(e, t) {
                        for (var n = 0; n < this.animations.length; ++n)
                            if (this.animations[n].chartInstance === e) return void(this.animations[n].animationObject = t);
                        this.animations.push({
                            chartInstance: e,
                            animationObject: t
                        }), 1 == this.animations.length && l.requestAnimFrame.call(window, this.digestWrapper)
                    },
                    cancelAnimation: function(e) {
                        var t = l.findNextWhere(this.animations, function(t) {
                            return t.chartInstance === e
                        });
                        t && this.animations.splice(t, 1)
                    },
                    digestWrapper: function() {
                        s.animationService.startDigest.call(s.animationService)
                    },
                    startDigest: function() {
                        var e = Date.now(),
                            t = 0;
                        this.dropFrames > 1 && (t = Math.floor(this.dropFrames), this.dropFrames -= t);
                        for (var n = 0; n < this.animations.length; n++) null === this.animations[n].animationObject.currentStep && (this.animations[n].animationObject.currentStep = 0), this.animations[n].animationObject.currentStep += 1 + t, this.animations[n].animationObject.currentStep > this.animations[n].animationObject.numSteps && (this.animations[n].animationObject.currentStep = this.animations[n].animationObject.numSteps), this.animations[n].animationObject.render(this.animations[n].chartInstance, this.animations[n].animationObject), this.animations[n].animationObject.currentStep == this.animations[n].animationObject.numSteps && (this.animations[n].animationObject.onAnimationComplete.call(this.animations[n].chartInstance), this.animations.splice(n, 1), n--);
                        var r = Date.now(),
                            i = r - e - this.frameDuration,
                            o = i / this.frameDuration;
                        o > 1 && (this.dropFrames += o), this.animations.length > 0 && l.requestAnimFrame.call(window, this.digestWrapper)
                    }
                }, l.addEvent(window, "resize", function() {
                    var e;
                    return function() {
                        clearTimeout(e), e = setTimeout(function() {
                            u(s.instances, function(e) {
                                e.options.responsive && e.resize(e.render, !0)
                            })
                        }, 50)
                    }
                }()), y ? (r = [], i = function() {
                    return s
                }.apply(t, r), !(void 0 !== i && (e.exports = i))) : "object" == typeof e && e.exports && (e.exports = s), o.Chart = s, s.noConflict = function() {
                    return o.Chart = a, s
                }
            }).call(this),
                function() {
                    "use strict";
                    var e = this,
                        t = e.Chart,
                        n = t.helpers,
                        r = {
                            scaleBeginAtZero: !0,
                            scaleShowGridLines: !0,
                            scaleGridLineColor: "rgba(0,0,0,.05)",
                            scaleGridLineWidth: 1,
                            scaleShowHorizontalLines: !0,
                            scaleShowVerticalLines: !0,
                            barShowStroke: !0,
                            barStrokeWidth: 2,
                            barValueSpacing: 5,
                            barDatasetSpacing: 1,
                            legendTemplate: '<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span class="<%=name.toLowerCase()%>-legend-icon" style="background-color:<%=datasets[i].fillColor%>"></span><span class="<%=name.toLowerCase()%>-legend-text"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></span></li><%}%></ul>'
                        };
                    t.Type.extend({
                        name: "Bar",
                        defaults: r,
                        initialize: function(e) {
                            var r = this.options;
                            this.ScaleClass = t.Scale.extend({
                                offsetGridLines: !0,
                                calculateBarX: function(e, t, n) {
                                    var i = this.calculateBaseWidth(),
                                        o = this.calculateX(n) - i / 2,
                                        a = this.calculateBarWidth(e);
                                    return o + a * t + t * r.barDatasetSpacing + a / 2
                                },
                                calculateBaseWidth: function() {
                                    return this.calculateX(1) - this.calculateX(0) - 2 * r.barValueSpacing
                                },
                                calculateBarWidth: function(e) {
                                    var t = this.calculateBaseWidth() - (e - 1) * r.barDatasetSpacing;
                                    return t / e
                                }
                            }), this.datasets = [], this.options.showTooltips && n.bindEvents(this, this.options.tooltipEvents, function(e) {
                                var t = "mouseout" !== e.type ? this.getBarsAtEvent(e) : [];
                                this.eachBars(function(e) {
                                    e.restore(["fillColor", "strokeColor"])
                                }), n.each(t, function(e) {
                                    e && (e.fillColor = e.highlightFill, e.strokeColor = e.highlightStroke)
                                }), this.showTooltip(t)
                            }), this.BarClass = t.Rectangle.extend({
                                strokeWidth: this.options.barStrokeWidth,
                                showStroke: this.options.barShowStroke,
                                ctx: this.chart.ctx
                            }), n.each(e.datasets, function(t) {
                                var r = {
                                    label: t.label || null,
                                    fillColor: t.fillColor,
                                    strokeColor: t.strokeColor,
                                    bars: []
                                };
                                this.datasets.push(r), n.each(t.data, function(n, i) {
                                    r.bars.push(new this.BarClass({
                                        value: n,
                                        label: e.labels[i],
                                        datasetLabel: t.label,
                                        strokeColor: "object" == typeof t.strokeColor ? t.strokeColor[i] : t.strokeColor,
                                        fillColor: "object" == typeof t.fillColor ? t.fillColor[i] : t.fillColor,
                                        highlightFill: t.highlightFill ? "object" == typeof t.highlightFill ? t.highlightFill[i] : t.highlightFill : "object" == typeof t.fillColor ? t.fillColor[i] : t.fillColor,
                                        highlightStroke: t.highlightStroke ? "object" == typeof t.highlightStroke ? t.highlightStroke[i] : t.highlightStroke : "object" == typeof t.strokeColor ? t.strokeColor[i] : t.strokeColor
                                    }))
                                }, this)
                            }, this), this.buildScale(e.labels), this.BarClass.prototype.base = this.scale.endPoint, this.eachBars(function(e, t, r) {
                                n.extend(e, {
                                    width: this.scale.calculateBarWidth(this.datasets.length),
                                    x: this.scale.calculateBarX(this.datasets.length, r, t),
                                    y: this.scale.endPoint
                                }), e.save()
                            }, this), this.render()
                        },
                        update: function() {
                            this.scale.update(), n.each(this.activeElements, function(e) {
                                e.restore(["fillColor", "strokeColor"])
                            }), this.eachBars(function(e) {
                                e.save()
                            }), this.render()
                        },
                        eachBars: function(e) {
                            n.each(this.datasets, function(t, r) {
                                n.each(t.bars, e, this, r)
                            }, this)
                        },
                        getBarsAtEvent: function(e) {
                            for (var t, r = [], i = n.getRelativePosition(e), o = function(e) {
                                    r.push(e.bars[t])
                                }, a = 0; a < this.datasets.length; a++)
                                for (t = 0; t < this.datasets[a].bars.length; t++)
                                    if (this.datasets[a].bars[t].inRange(i.x, i.y)) return n.each(this.datasets, o), r;
                            return r
                        },
                        buildScale: function(e) {
                            var t = this,
                                r = function() {
                                    var e = [];
                                    return t.eachBars(function(t) {
                                        e.push(t.value)
                                    }), e
                                },
                                i = {
                                    templateString: this.options.scaleLabel,
                                    height: this.chart.height,
                                    width: this.chart.width,
                                    ctx: this.chart.ctx,
                                    textColor: this.options.scaleFontColor,
                                    fontSize: this.options.scaleFontSize,
                                    fontStyle: this.options.scaleFontStyle,
                                    fontFamily: this.options.scaleFontFamily,
                                    valuesCount: e.length,
                                    beginAtZero: this.options.scaleBeginAtZero,
                                    integersOnly: this.options.scaleIntegersOnly,
                                    calculateYRange: function(e) {
                                        var t = n.calculateScaleRange(r(), e, this.fontSize, this.beginAtZero, this.integersOnly);
                                        n.extend(this, t)
                                    },
                                    xLabels: e,
                                    font: n.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
                                    lineWidth: this.options.scaleLineWidth,
                                    lineColor: this.options.scaleLineColor,
                                    showHorizontalLines: this.options.scaleShowHorizontalLines,
                                    showVerticalLines: this.options.scaleShowVerticalLines,
                                    gridLineWidth: this.options.scaleShowGridLines ? this.options.scaleGridLineWidth : 0,
                                    gridLineColor: this.options.scaleShowGridLines ? this.options.scaleGridLineColor : "rgba(0,0,0,0)",
                                    padding: this.options.showScale ? 0 : this.options.barShowStroke ? this.options.barStrokeWidth : 0,
                                    showLabels: this.options.scaleShowLabels,
                                    display: this.options.showScale
                                };
                            this.options.scaleOverride && n.extend(i, {
                                calculateYRange: n.noop,
                                steps: this.options.scaleSteps,
                                stepValue: this.options.scaleStepWidth,
                                min: this.options.scaleStartValue,
                                max: this.options.scaleStartValue + this.options.scaleSteps * this.options.scaleStepWidth
                            }), this.scale = new this.ScaleClass(i)
                        },
                        addData: function(e, t) {
                            n.each(e, function(e, n) {
                                this.datasets[n].bars.push(new this.BarClass({
                                    value: e,
                                    label: t,
                                    datasetLabel: this.datasets[n].label,
                                    x: this.scale.calculateBarX(this.datasets.length, n, this.scale.valuesCount + 1),
                                    y: this.scale.endPoint,
                                    width: this.scale.calculateBarWidth(this.datasets.length),
                                    base: this.scale.endPoint,
                                    strokeColor: this.datasets[n].strokeColor,
                                    fillColor: this.datasets[n].fillColor
                                }))
                            }, this), this.scale.addXLabel(t), this.update()
                        },
                        removeData: function() {
                            this.scale.removeXLabel(), n.each(this.datasets, function(e) {
                                e.bars.shift()
                            }, this), this.update()
                        },
                        reflow: function() {
                            n.extend(this.BarClass.prototype, {
                                y: this.scale.endPoint,
                                base: this.scale.endPoint
                            });
                            var e = n.extend({
                                height: this.chart.height,
                                width: this.chart.width
                            });
                            this.scale.update(e)
                        },
                        draw: function(e) {
                            var t = e || 1;
                            this.clear(), this.chart.ctx, this.scale.draw(t), n.each(this.datasets, function(e, r) {
                                n.each(e.bars, function(e, n) {
                                    e.hasValue() && (e.base = this.scale.endPoint, e.transition({
                                        x: this.scale.calculateBarX(this.datasets.length, r, n),
                                        y: this.scale.calculateY(e.value),
                                        width: this.scale.calculateBarWidth(this.datasets.length)
                                    }, t).draw())
                                }, this)
                            }, this)
                        }
                    })
                }.call(this),
                function() {
                    "use strict";
                    var e = this,
                        t = e.Chart,
                        n = t.helpers,
                        r = {
                            segmentShowStroke: !0,
                            segmentStrokeColor: "#fff",
                            segmentStrokeWidth: 2,
                            percentageInnerCutout: 50,
                            animationSteps: 100,
                            animationEasing: "easeOutBounce",
                            animateRotate: !0,
                            animateScale: !1,
                            legendTemplate: '<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<segments.length; i++){%><li><span class="<%=name.toLowerCase()%>-legend-icon" style="background-color:<%=segments[i].fillColor%>"></span><span class="<%=name.toLowerCase()%>-legend-text"><%if(segments[i].label){%><%=segments[i].label%><%}%></span></li><%}%></ul>'
                        };
                    t.Type.extend({
                        name: "Doughnut",
                        defaults: r,
                        initialize: function(e) {
                            this.segments = [], this.outerRadius = (n.min([this.chart.width, this.chart.height]) - this.options.segmentStrokeWidth / 2) / 2, this.SegmentArc = t.Arc.extend({
                                ctx: this.chart.ctx,
                                x: this.chart.width / 2,
                                y: this.chart.height / 2
                            }), this.options.showTooltips && n.bindEvents(this, this.options.tooltipEvents, function(e) {
                                var t = "mouseout" !== e.type ? this.getSegmentsAtEvent(e) : [];
                                n.each(this.segments, function(e) {
                                    e.restore(["fillColor"])
                                }), n.each(t, function(e) {
                                    e.fillColor = e.highlightColor
                                }), this.showTooltip(t)
                            }), this.calculateTotal(e), n.each(e, function(t, n) {
                                t.color || (t.color = "hsl(" + 360 * n / e.length + ", 100%, 50%)"), this.addData(t, n, !0)
                            }, this), this.render()
                        },
                        getSegmentsAtEvent: function(e) {
                            var t = [],
                                r = n.getRelativePosition(e);
                            return n.each(this.segments, function(e) {
                                e.inRange(r.x, r.y) && t.push(e)
                            }, this), t
                        },
                        addData: function(e, n, r) {
                            var i = void 0 !== n ? n : this.segments.length;
                            "undefined" == typeof e.color && (e.color = t.defaults.global.segmentColorDefault[i % t.defaults.global.segmentColorDefault.length], e.highlight = t.defaults.global.segmentHighlightColorDefaults[i % t.defaults.global.segmentHighlightColorDefaults.length]), this.segments.splice(i, 0, new this.SegmentArc({
                                value: e.value,
                                outerRadius: this.options.animateScale ? 0 : this.outerRadius,
                                innerRadius: this.options.animateScale ? 0 : this.outerRadius / 100 * this.options.percentageInnerCutout,
                                fillColor: e.color,
                                highlightColor: e.highlight || e.color,
                                showStroke: this.options.segmentShowStroke,
                                strokeWidth: this.options.segmentStrokeWidth,
                                strokeColor: this.options.segmentStrokeColor,
                                startAngle: 1.5 * Math.PI,
                                circumference: this.options.animateRotate ? 0 : this.calculateCircumference(e.value),
                                label: e.label
                            })), r || (this.reflow(), this.update())
                        },
                        calculateCircumference: function(e) {
                            return this.total > 0 ? 2 * Math.PI * (e / this.total) : 0
                        },
                        calculateTotal: function(e) {
                            this.total = 0, n.each(e, function(e) {
                                this.total += Math.abs(e.value)
                            }, this)
                        },
                        update: function() {
                            this.calculateTotal(this.segments), n.each(this.activeElements, function(e) {
                                e.restore(["fillColor"])
                            }), n.each(this.segments, function(e) {
                                e.save()
                            }), this.render()
                        },
                        removeData: function(e) {
                            var t = n.isNumber(e) ? e : this.segments.length - 1;
                            this.segments.splice(t, 1), this.reflow(), this.update()
                        },
                        reflow: function() {
                            n.extend(this.SegmentArc.prototype, {
                                x: this.chart.width / 2,
                                y: this.chart.height / 2
                            }), this.outerRadius = (n.min([this.chart.width, this.chart.height]) - this.options.segmentStrokeWidth / 2) / 2, n.each(this.segments, function(e) {
                                e.update({
                                    outerRadius: this.outerRadius,
                                    innerRadius: this.outerRadius / 100 * this.options.percentageInnerCutout
                                })
                            }, this)
                        },
                        draw: function(e) {
                            var t = e ? e : 1;
                            this.clear(), n.each(this.segments, function(e, n) {
                                e.transition({
                                    circumference: this.calculateCircumference(e.value),
                                    outerRadius: this.outerRadius,
                                    innerRadius: this.outerRadius / 100 * this.options.percentageInnerCutout
                                }, t), e.endAngle = e.startAngle + e.circumference, e.draw(), 0 === n && (e.startAngle = 1.5 * Math.PI), n < this.segments.length - 1 && (this.segments[n + 1].startAngle = e.endAngle)
                            }, this)
                        }
                    }), t.types.Doughnut.extend({
                        name: "Pie",
                        defaults: n.merge(r, {
                            percentageInnerCutout: 0
                        })
                    })
                }.call(this),
                function() {
                    "use strict";
                    var e = this,
                        t = e.Chart,
                        n = t.helpers,
                        r = {
                            scaleShowGridLines: !0,
                            scaleGridLineColor: "rgba(0,0,0,.05)",
                            scaleGridLineWidth: 1,
                            scaleShowHorizontalLines: !0,
                            scaleShowVerticalLines: !0,
                            bezierCurve: !0,
                            bezierCurveTension: .4,
                            pointDot: !0,
                            pointDotRadius: 4,
                            pointDotStrokeWidth: 1,
                            pointHitDetectionRadius: 20,
                            datasetStroke: !0,
                            datasetStrokeWidth: 2,
                            datasetFill: !0,
                            legendTemplate: '<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span class="<%=name.toLowerCase()%>-legend-icon" style="background-color:<%=datasets[i].strokeColor%>"></span><span class="<%=name.toLowerCase()%>-legend-text"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></span></li><%}%></ul>',
                            offsetGridLines: !1
                        };
                    t.Type.extend({
                        name: "Line",
                        defaults: r,
                        initialize: function(e) {
                            this.PointClass = t.Point.extend({
                                offsetGridLines: this.options.offsetGridLines,
                                strokeWidth: this.options.pointDotStrokeWidth,
                                radius: this.options.pointDotRadius,
                                display: this.options.pointDot,
                                hitDetectionRadius: this.options.pointHitDetectionRadius,
                                ctx: this.chart.ctx,
                                inRange: function(e) {
                                    return Math.pow(e - this.x, 2) < Math.pow(this.radius + this.hitDetectionRadius, 2)
                                }
                            }), this.datasets = [], this.options.showTooltips && n.bindEvents(this, this.options.tooltipEvents, function(e) {
                                var t = "mouseout" !== e.type ? this.getPointsAtEvent(e) : [];
                                this.eachPoints(function(e) {
                                    e.restore(["fillColor", "strokeColor"])
                                }), n.each(t, function(e) {
                                    e.fillColor = e.highlightFill, e.strokeColor = e.highlightStroke
                                }), this.showTooltip(t)
                            }), n.each(e.datasets, function(t) {
                                var r = {
                                    label: t.label || null,
                                    fillColor: t.fillColor,
                                    strokeColor: t.strokeColor,
                                    pointColor: t.pointColor,
                                    pointStrokeColor: t.pointStrokeColor,
                                    points: []
                                };
                                this.datasets.push(r), n.each(t.data, function(n, i) {
                                    r.points.push(new this.PointClass({
                                        value: n,
                                        label: e.labels[i],
                                        datasetLabel: t.label,
                                        strokeColor: t.pointStrokeColor,
                                        fillColor: t.pointColor,
                                        highlightFill: t.pointHighlightFill || t.pointColor,
                                        highlightStroke: t.pointHighlightStroke || t.pointStrokeColor
                                    }))
                                }, this), this.buildScale(e.labels), this.eachPoints(function(e, t) {
                                    n.extend(e, {
                                        x: this.scale.calculateX(t),
                                        y: this.scale.endPoint
                                    }), e.save()
                                }, this)
                            }, this), this.render()
                        },
                        update: function() {
                            this.scale.update(), n.each(this.activeElements, function(e) {
                                e.restore(["fillColor", "strokeColor"])
                            }), this.eachPoints(function(e) {
                                e.save()
                            }), this.render()
                        },
                        eachPoints: function(e) {
                            n.each(this.datasets, function(t) {
                                n.each(t.points, e, this)
                            }, this)
                        },
                        getPointsAtEvent: function(e) {
                            var t = [],
                                r = n.getRelativePosition(e);
                            return n.each(this.datasets, function(e) {
                                n.each(e.points, function(e) {
                                    e.inRange(r.x, r.y) && t.push(e)
                                })
                            }, this), t
                        },
                        buildScale: function(e) {
                            var r = this,
                                i = function() {
                                    var e = [];
                                    return r.eachPoints(function(t) {
                                        e.push(t.value)
                                    }), e
                                },
                                o = {
                                    templateString: this.options.scaleLabel,
                                    height: this.chart.height,
                                    width: this.chart.width,
                                    ctx: this.chart.ctx,
                                    textColor: this.options.scaleFontColor,
                                    offsetGridLines: this.options.offsetGridLines,
                                    fontSize: this.options.scaleFontSize,
                                    fontStyle: this.options.scaleFontStyle,
                                    fontFamily: this.options.scaleFontFamily,
                                    valuesCount: e.length,
                                    beginAtZero: this.options.scaleBeginAtZero,
                                    integersOnly: this.options.scaleIntegersOnly,
                                    calculateYRange: function(e) {
                                        var t = n.calculateScaleRange(i(), e, this.fontSize, this.beginAtZero, this.integersOnly);
                                        n.extend(this, t)
                                    },
                                    xLabels: e,
                                    font: n.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
                                    lineWidth: this.options.scaleLineWidth,
                                    lineColor: this.options.scaleLineColor,
                                    showHorizontalLines: this.options.scaleShowHorizontalLines,
                                    showVerticalLines: this.options.scaleShowVerticalLines,
                                    gridLineWidth: this.options.scaleShowGridLines ? this.options.scaleGridLineWidth : 0,
                                    gridLineColor: this.options.scaleShowGridLines ? this.options.scaleGridLineColor : "rgba(0,0,0,0)",
                                    padding: this.options.showScale ? 0 : this.options.pointDotRadius + this.options.pointDotStrokeWidth,
                                    showLabels: this.options.scaleShowLabels,
                                    display: this.options.showScale
                                };
                            this.options.scaleOverride && n.extend(o, {
                                calculateYRange: n.noop,
                                steps: this.options.scaleSteps,
                                stepValue: this.options.scaleStepWidth,
                                min: this.options.scaleStartValue,
                                max: this.options.scaleStartValue + this.options.scaleSteps * this.options.scaleStepWidth
                            }), this.scale = new t.Scale(o)
                        },
                        addData: function(e, t) {
                            n.each(e, function(e, n) {
                                this.datasets[n].points.push(new this.PointClass({
                                    value: e,
                                    label: t,
                                    datasetLabel: this.datasets[n].label,
                                    x: this.scale.calculateX(this.scale.valuesCount + 1),
                                    y: this.scale.endPoint,
                                    strokeColor: this.datasets[n].pointStrokeColor,
                                    fillColor: this.datasets[n].pointColor
                                }))
                            }, this), this.scale.addXLabel(t), this.update()
                        },
                        removeData: function() {
                            this.scale.removeXLabel(), n.each(this.datasets, function(e) {
                                e.points.shift()
                            }, this), this.update()
                        },
                        reflow: function() {
                            var e = n.extend({
                                height: this.chart.height,
                                width: this.chart.width
                            });
                            this.scale.update(e)
                        },
                        draw: function(e) {
                            var t = e || 1;
                            this.clear();
                            var r = this.chart.ctx,
                                i = function(e) {
                                    return null !== e.value
                                },
                                o = function(e, t, r) {
                                    return n.findNextWhere(t, i, r) || e
                                },
                                a = function(e, t, r) {
                                    return n.findPreviousWhere(t, i, r) || e
                                };
                            this.scale && (this.scale.draw(t), n.each(this.datasets, function(e) {
                                var s = n.where(e.points, i);
                                n.each(e.points, function(e, n) {
                                    e.hasValue() && e.transition({
                                        y: this.scale.calculateY(e.value),
                                        x: this.scale.calculateX(n)
                                    }, t)
                                }, this), this.options.bezierCurve && n.each(s, function(e, t) {
                                    var r = t > 0 && t < s.length - 1 ? this.options.bezierCurveTension : 0;
                                    e.controlPoints = n.splineCurve(a(e, s, t), e, o(e, s, t), r), e.controlPoints.outer.y > this.scale.endPoint ? e.controlPoints.outer.y = this.scale.endPoint : e.controlPoints.outer.y < this.scale.startPoint && (e.controlPoints.outer.y = this.scale.startPoint), e.controlPoints.inner.y > this.scale.endPoint ? e.controlPoints.inner.y = this.scale.endPoint : e.controlPoints.inner.y < this.scale.startPoint && (e.controlPoints.inner.y = this.scale.startPoint)
                                }, this), r.lineWidth = this.options.datasetStrokeWidth, r.strokeStyle = e.strokeColor, r.beginPath(), n.each(s, function(e, t) {
                                    if (0 === t) r.moveTo(e.x, e.y);
                                    else if (this.options.bezierCurve) {
                                        var n = a(e, s, t);
                                        r.bezierCurveTo(n.controlPoints.outer.x, n.controlPoints.outer.y, e.controlPoints.inner.x, e.controlPoints.inner.y, e.x, e.y)
                                    } else r.lineTo(e.x, e.y)
                                }, this), this.options.datasetStroke && r.stroke(), this.options.datasetFill && s.length > 0 && (r.lineTo(s[s.length - 1].x, this.scale.endPoint), r.lineTo(s[0].x, this.scale.endPoint), r.fillStyle = e.fillColor, r.closePath(), r.fill()), n.each(s, function(e) {
                                    e.draw()
                                })
                            }, this))
                        }
                    })
                }.call(this),
                function() {
                    "use strict";
                    var e = this,
                        t = e.Chart,
                        n = t.helpers,
                        r = {
                            scaleShowLabelBackdrop: !0,
                            scaleBackdropColor: "rgba(255,255,255,0.75)",
                            scaleBeginAtZero: !0,
                            scaleBackdropPaddingY: 2,
                            scaleBackdropPaddingX: 2,
                            scaleShowLine: !0,
                            segmentShowStroke: !0,
                            segmentStrokeColor: "#fff",
                            segmentStrokeWidth: 2,
                            animationSteps: 100,
                            animationEasing: "easeOutBounce",
                            animateRotate: !0,
                            animateScale: !1,
                            legendTemplate: '<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<segments.length; i++){%><li><span class="<%=name.toLowerCase()%>-legend-icon" style="background-color:<%=segments[i].fillColor%>"></span><span class="<%=name.toLowerCase()%>-legend-text"><%if(segments[i].label){%><%=segments[i].label%><%}%></span></li><%}%></ul>'
                        };
                    t.Type.extend({
                        name: "PolarArea",
                        defaults: r,
                        initialize: function(e) {
                            this.segments = [], this.SegmentArc = t.Arc.extend({
                                showStroke: this.options.segmentShowStroke,
                                strokeWidth: this.options.segmentStrokeWidth,
                                strokeColor: this.options.segmentStrokeColor,
                                ctx: this.chart.ctx,
                                innerRadius: 0,
                                x: this.chart.width / 2,
                                y: this.chart.height / 2
                            }), this.scale = new t.RadialScale({
                                display: this.options.showScale,
                                fontStyle: this.options.scaleFontStyle,
                                fontSize: this.options.scaleFontSize,
                                fontFamily: this.options.scaleFontFamily,
                                fontColor: this.options.scaleFontColor,
                                showLabels: this.options.scaleShowLabels,
                                showLabelBackdrop: this.options.scaleShowLabelBackdrop,
                                backdropColor: this.options.scaleBackdropColor,
                                backdropPaddingY: this.options.scaleBackdropPaddingY,
                                backdropPaddingX: this.options.scaleBackdropPaddingX,
                                lineWidth: this.options.scaleShowLine ? this.options.scaleLineWidth : 0,
                                lineColor: this.options.scaleLineColor,
                                lineArc: !0,
                                width: this.chart.width,
                                height: this.chart.height,
                                xCenter: this.chart.width / 2,
                                yCenter: this.chart.height / 2,
                                ctx: this.chart.ctx,
                                templateString: this.options.scaleLabel,
                                valuesCount: e.length
                            }), this.updateScaleRange(e), this.scale.update(), n.each(e, function(e, t) {
                                this.addData(e, t, !0)
                            }, this), this.options.showTooltips && n.bindEvents(this, this.options.tooltipEvents, function(e) {
                                var t = "mouseout" !== e.type ? this.getSegmentsAtEvent(e) : [];
                                n.each(this.segments, function(e) {
                                    e.restore(["fillColor"])
                                }), n.each(t, function(e) {
                                    e.fillColor = e.highlightColor
                                }), this.showTooltip(t)
                            }), this.render()
                        },
                        getSegmentsAtEvent: function(e) {
                            var t = [],
                                r = n.getRelativePosition(e);
                            return n.each(this.segments, function(e) {
                                e.inRange(r.x, r.y) && t.push(e)
                            }, this), t
                        },
                        addData: function(e, t, n) {
                            var r = t || this.segments.length;
                            this.segments.splice(r, 0, new this.SegmentArc({
                                fillColor: e.color,
                                highlightColor: e.highlight || e.color,
                                label: e.label,
                                value: e.value,
                                outerRadius: this.options.animateScale ? 0 : this.scale.calculateCenterOffset(e.value),
                                circumference: this.options.animateRotate ? 0 : this.scale.getCircumference(),
                                startAngle: 1.5 * Math.PI
                            })), n || (this.reflow(), this.update())
                        },
                        removeData: function(e) {
                            var t = n.isNumber(e) ? e : this.segments.length - 1;
                            this.segments.splice(t, 1), this.reflow(), this.update()
                        },
                        calculateTotal: function(e) {
                            this.total = 0, n.each(e, function(e) {
                                this.total += e.value
                            }, this), this.scale.valuesCount = this.segments.length
                        },
                        updateScaleRange: function(e) {
                            var t = [];
                            n.each(e, function(e) {
                                t.push(e.value)
                            });
                            var r = this.options.scaleOverride ? {
                                steps: this.options.scaleSteps,
                                stepValue: this.options.scaleStepWidth,
                                min: this.options.scaleStartValue,
                                max: this.options.scaleStartValue + this.options.scaleSteps * this.options.scaleStepWidth
                            } : n.calculateScaleRange(t, n.min([this.chart.width, this.chart.height]) / 2, this.options.scaleFontSize, this.options.scaleBeginAtZero, this.options.scaleIntegersOnly);
                            n.extend(this.scale, r, {
                                size: n.min([this.chart.width, this.chart.height]),
                                xCenter: this.chart.width / 2,
                                yCenter: this.chart.height / 2
                            })
                        },
                        update: function() {
                            this.calculateTotal(this.segments), n.each(this.segments, function(e) {
                                e.save()
                            }), this.reflow(), this.render()
                        },
                        reflow: function() {
                            n.extend(this.SegmentArc.prototype, {
                                x: this.chart.width / 2,
                                y: this.chart.height / 2
                            }), this.updateScaleRange(this.segments), this.scale.update(), n.extend(this.scale, {
                                xCenter: this.chart.width / 2,
                                yCenter: this.chart.height / 2
                            }), n.each(this.segments, function(e) {
                                e.update({
                                    outerRadius: this.scale.calculateCenterOffset(e.value)
                                })
                            }, this)
                        },
                        draw: function(e) {
                            var t = e || 1;
                            this.clear(), n.each(this.segments, function(e, n) {
                                e.transition({
                                    circumference: this.scale.getCircumference(),
                                    outerRadius: this.scale.calculateCenterOffset(e.value)
                                }, t), e.endAngle = e.startAngle + e.circumference, 0 === n && (e.startAngle = 1.5 * Math.PI), n < this.segments.length - 1 && (this.segments[n + 1].startAngle = e.endAngle), e.draw()
                            }, this), this.scale.draw()
                        }
                    })
                }.call(this),
                function() {
                    "use strict";
                    var e = this,
                        t = e.Chart,
                        n = t.helpers;
                    t.Type.extend({
                        name: "Radar",
                        defaults: {
                            scaleShowLine: !0,
                            angleShowLineOut: !0,
                            scaleShowLabels: !1,
                            scaleBeginAtZero: !0,
                            angleLineColor: "rgba(0,0,0,.1)",
                            angleLineWidth: 1,
                            angleLineInterval: 1,
                            pointLabelFontFamily: "'Arial'",
                            pointLabelFontStyle: "normal",
                            pointLabelFontSize: 10,
                            pointLabelFontColor: "#666",
                            pointDot: !0,
                            pointDotRadius: 3,
                            pointDotStrokeWidth: 1,
                            pointHitDetectionRadius: 20,
                            datasetStroke: !0,
                            datasetStrokeWidth: 2,
                            datasetFill: !0,
                            legendTemplate: '<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span class="<%=name.toLowerCase()%>-legend-icon" style="background-color:<%=datasets[i].strokeColor%>"></span><span class="<%=name.toLowerCase()%>-legend-text"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></span></li><%}%></ul>'
                        },
                        initialize: function(e) {
                            this.PointClass = t.Point.extend({
                                strokeWidth: this.options.pointDotStrokeWidth,
                                radius: this.options.pointDotRadius,
                                display: this.options.pointDot,
                                hitDetectionRadius: this.options.pointHitDetectionRadius,
                                ctx: this.chart.ctx
                            }), this.datasets = [], this.buildScale(e), this.options.showTooltips && n.bindEvents(this, this.options.tooltipEvents, function(e) {
                                var t = "mouseout" !== e.type ? this.getPointsAtEvent(e) : [];
                                this.eachPoints(function(e) {
                                    e.restore(["fillColor", "strokeColor"])
                                }), n.each(t, function(e) {
                                    e.fillColor = e.highlightFill, e.strokeColor = e.highlightStroke
                                }), this.showTooltip(t)
                            }), n.each(e.datasets, function(t) {
                                var r = {
                                    label: t.label || null,
                                    fillColor: t.fillColor,
                                    strokeColor: t.strokeColor,
                                    pointColor: t.pointColor,
                                    pointStrokeColor: t.pointStrokeColor,
                                    points: []
                                };
                                this.datasets.push(r), n.each(t.data, function(n, i) {
                                    var o;
                                    this.scale.animation || (o = this.scale.getPointPosition(i, this.scale.calculateCenterOffset(n))), r.points.push(new this.PointClass({
                                        value: n,
                                        label: e.labels[i],
                                        datasetLabel: t.label,
                                        x: this.options.animation ? this.scale.xCenter : o.x,
                                        y: this.options.animation ? this.scale.yCenter : o.y,
                                        strokeColor: t.pointStrokeColor,
                                        fillColor: t.pointColor,
                                        highlightFill: t.pointHighlightFill || t.pointColor,
                                        highlightStroke: t.pointHighlightStroke || t.pointStrokeColor
                                    }))
                                }, this)
                            }, this), this.render()
                        },
                        eachPoints: function(e) {
                            n.each(this.datasets, function(t) {
                                n.each(t.points, e, this)
                            }, this)
                        },
                        getPointsAtEvent: function(e) {
                            var t = n.getRelativePosition(e),
                                r = n.getAngleFromPoint({
                                    x: this.scale.xCenter,
                                    y: this.scale.yCenter
                                }, t),
                                i = 2 * Math.PI / this.scale.valuesCount,
                                o = Math.round((r.angle - 1.5 * Math.PI) / i),
                                a = [];
                            return (o >= this.scale.valuesCount || 0 > o) && (o = 0), r.distance <= this.scale.drawingArea && n.each(this.datasets, function(e) {
                                a.push(e.points[o])
                            }), a
                        },
                        buildScale: function(e) {
                            this.scale = new t.RadialScale({
                                display: this.options.showScale,
                                fontStyle: this.options.scaleFontStyle,
                                fontSize: this.options.scaleFontSize,
                                fontFamily: this.options.scaleFontFamily,
                                fontColor: this.options.scaleFontColor,
                                showLabels: this.options.scaleShowLabels,
                                showLabelBackdrop: this.options.scaleShowLabelBackdrop,
                                backdropColor: this.options.scaleBackdropColor,
                                backgroundColors: this.options.scaleBackgroundColors,
                                backdropPaddingY: this.options.scaleBackdropPaddingY,
                                backdropPaddingX: this.options.scaleBackdropPaddingX,
                                lineWidth: this.options.scaleShowLine ? this.options.scaleLineWidth : 0,
                                lineColor: this.options.scaleLineColor,
                                angleLineColor: this.options.angleLineColor,
                                angleLineWidth: this.options.angleShowLineOut ? this.options.angleLineWidth : 0,
                                angleLineInterval: this.options.angleLineInterval ? this.options.angleLineInterval : 1,
                                pointLabelFontColor: this.options.pointLabelFontColor,
                                pointLabelFontSize: this.options.pointLabelFontSize,
                                pointLabelFontFamily: this.options.pointLabelFontFamily,
                                pointLabelFontStyle: this.options.pointLabelFontStyle,
                                height: this.chart.height,
                                width: this.chart.width,
                                xCenter: this.chart.width / 2,
                                yCenter: this.chart.height / 2,
                                ctx: this.chart.ctx,
                                templateString: this.options.scaleLabel,
                                labels: e.labels,
                                valuesCount: e.datasets[0].data.length
                            }), this.scale.setScaleSize(), this.updateScaleRange(e.datasets), this.scale.buildYLabels()
                        },
                        updateScaleRange: function(e) {
                            var t = function() {
                                    var t = [];
                                    return n.each(e, function(e) {
                                        e.data ? t = t.concat(e.data) : n.each(e.points, function(e) {
                                            t.push(e.value)
                                        })
                                    }), t
                                }(),
                                r = this.options.scaleOverride ? {
                                    steps: this.options.scaleSteps,
                                    stepValue: this.options.scaleStepWidth,
                                    min: this.options.scaleStartValue,
                                    max: this.options.scaleStartValue + this.options.scaleSteps * this.options.scaleStepWidth
                                } : n.calculateScaleRange(t, n.min([this.chart.width, this.chart.height]) / 2, this.options.scaleFontSize, this.options.scaleBeginAtZero, this.options.scaleIntegersOnly);
                            n.extend(this.scale, r)
                        },
                        addData: function(e, t) {
                            this.scale.valuesCount++, n.each(e, function(e, n) {
                                var r = this.scale.getPointPosition(this.scale.valuesCount, this.scale.calculateCenterOffset(e));
                                this.datasets[n].points.push(new this.PointClass({
                                    value: e,
                                    label: t,
                                    datasetLabel: this.datasets[n].label,
                                    x: r.x,
                                    y: r.y,
                                    strokeColor: this.datasets[n].pointStrokeColor,
                                    fillColor: this.datasets[n].pointColor
                                }))
                            }, this), this.scale.labels.push(t), this.reflow(), this.update()
                        },
                        removeData: function() {
                            this.scale.valuesCount--, this.scale.labels.shift(), n.each(this.datasets, function(e) {
                                e.points.shift()
                            }, this), this.reflow(), this.update()
                        },
                        update: function() {
                            this.eachPoints(function(e) {
                                e.save()
                            }), this.reflow(), this.render()
                        },
                        reflow: function() {
                            n.extend(this.scale, {
                                width: this.chart.width,
                                height: this.chart.height,
                                size: n.min([this.chart.width, this.chart.height]),
                                xCenter: this.chart.width / 2,
                                yCenter: this.chart.height / 2
                            }), this.updateScaleRange(this.datasets), this.scale.setScaleSize(), this.scale.buildYLabels()
                        },
                        draw: function(e) {
                            var t = e || 1,
