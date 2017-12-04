var stop = false;
function sb_createCookie(a, b, c) {
    if (c) {
        var d = new Date;
        d.setTime(d.getTime() + 1e3 * 60 * 60 * 24 * c);
        var e = "; expires=" + d.toGMTString()
    } else var e = "";
    document.cookie = a + "=" + b + e + "; path=/"
}

function sb_readCookie(a) {
    for (var b = a + "=", c = document.cookie.split(";"), d = 0; d < c.length; d++) {
        for (var e = c[d];
            " " == e.charAt(0);) e = e.substring(1, e.length);
        if (0 == e.indexOf(b)) return e.substring(b.length, e.length)
    }
    return null
}

function hostname(s) {
    s = s.replace(/\^0/g, '</span><span style="color: #000000">')
    s = s.replace(/\^1/g, '</span><span style="color: #DA0120">')
    s = s.replace(/\^2/g, '</span><span style="color: #00B906">')
    s = s.replace(/\^3/g, '</span><span style="color: #AFC013">')
    s = s.replace(/\^4/g, '</span><span style="color: #170BDB">')
    s = s.replace(/\^5/g, '</span><span style="color: #23C2C6">')
    s = s.replace(/\^6/g, '</span><span style="color: #E201DB">')
    s = s.replace(/\^7/g, '</span><span style="color: #000000">')
    s = s.replace(/\^8/g, '</span><span style="color: #CA7C27">')
    s = s.replace(/\^9/g, '</span><span style="color: #757575">')
    return '<span>' + s + '</span>'
}

function sb_eraseCookie(a) {
    createCookie(a, "", -1)
}
var sb_friends, friendslist, searchlist, lists, addFriend, getRequests, getFriends, getFriendsLoop, sb_action = document.getElementById("sb_action"),
    sb_play = document.getElementById("sb_play"),
    getRequestsLoop, knowRequests = [],
    defaultAvatar = "friends/static/soldier.png",
    setSideBarHeight,
    friendTemplate = '<li class="sb_friend {CLASS}" rel="{ID}" current_server="{CURRENT_SERVER}">'+
                        '<a class="sb_avatar {ONLINE}" style="background-image:url({AVATAR});" href="#"></a><a class="sb_username">{USERNAME}</a>'+
                        '<div class="sb_actionButton {BUTTON} {BUTTON_STATUS}"></div>'+
                        '<a class="sb_hostname">{HOSTNAME}</a>'+
                     '</li>';

$(document).ready(function() {
        function b(a, b) {
            f("respondRequest", {
                from: a,
                answer: b ? 1 : 0
            }, function() {
                getFriends()
            })
        }

        function c(a) {
            f("unfriend", {
                id: a
            }, function() {
                getFriends(), noty({
                    text: "Friend has been unfriended",
                    timeout: 1e3,
                    type: "success"
                })
            })
        }

        function d(a) {
            noty({
                text: a.result,
                timeout: 1e3,
                type: "error"
            }), e(a)
        }

        function e() {
            clearInterval(getFriendsLoop), clearInterval(getRequestsLoop)
        }

        function f(a, b, c) {
            if(stop)
                return;
            return !b instanceof Array && (b = {}), $.ajax({
                type: "POST",
                data: Object.extend({
                    handle: a
                }, b),
                cache: !1,
                url: "friends/api.php",
                dataType: "json",
                success: function(a) {
                    return 401 == a.status ? e(a) : 503 == a.status ? d(a) : (c(a), void 0)
                }
            })
        }
        sb_friends = $("#sb_friends"), friendslist = $("#sb_friends #sb_friendslist"), friendslistUl = friendslist.find("ul"), searchlist = $("#sb_friends #sb_searchlist"), searchlistUl = searchlist.find("ul"), lists = $("#sb_friends .sb_list ul"), addFriend = $("#sb_addFriend input");
        var a = navigator.userAgent.toLowerCase();
        return /msie/.test(a) && parseFloat((a.match(/.*(?:rv|ie)[\/: ](.+?)([ \);]|$)/) || [])[1]) < 9 ? (document.location = "https://browser-update.org/nl/update.html", e(), void 0) : (sb_action.volume = .1, addFriend.autocomplete({
            serviceUrl: "friends/api.php?handle=searchFriend",
            dataType: "json",
            delimiter: /(,|;)\s*/,
            appendTo: "#sb_friends"
        }), $(document).on("mouseenter", ".sb_friend", function() {
            /msie/.test(a) || (sb_action.currentTime = 0, sb_action.play())
        }), $(document).on("click", ".sb_friend", function(b) {
            return $(this).hasClass("searchResult") ? void 0 : $(b.target).hasClass("sb_play") ? (/msie/.test(a) || (sb_play.currentTime = 0, sb_play.play()), document.location.href = "repziw4m://" + $(this).find(".sb_username").closest(".sb_friend").attr("current_server"), void 0) : (document.location.href = "/memberlist.php?mode=viewprofile&u=" + $(this).find(".sb_username").closest(".sb_friend").attr("rel"), void 0)
        }), $(document).on("click", ".sb_resize", function() {
            sb_friends.hasClass("minimized") ? (sb_friends.removeClass("minimized"), $(this).html("-")) : (sb_friends.addClass("minimized"), $(this).html("+")), sb_createCookie("sb_resize", sb_friends.hasClass("minimized") ? 1 : 0, 180)
        }), 1 == sb_readCookie("sb_resize") && $(".sb_resize").click(), $(document).on("click", ".sb_remove", function() {
            var a = $(this).closest(".searchResult").attr("rel");
            c(a)
        }), $(document).on("click", ".searchResult", function() {
            var a = $(this).attr("rel");
            $(this).find(".sb_actionButton").hasClass("friend") || f("inviteFriend", {
                id: a
            }, function(a) {
                var b = "",
                    c = "notice";
                return 0 == a.status && (b = "Something unexpected happen ;(", c = "error"), 1 == a.status && (b = "Invite has been sent.", c = "success"), 2 == a.status && (b = "Invitation has already been sent.", c = "error"), 3 == a.status && (b = "Invitation has been declined, other user must sent a friend Invitation.", c = "error"), 4 == a.status && (b = "Declined invitation has been accepted", c = "success"), 5 == a.status && (b = "You are already friends with this player", c = "notice"), 6 == a.status ? noty({
                    text: "Friend request has been accepted",
                    timeout: 1e3,
                    type: "success"
                }) : ("" != b && noty({
                    text: b,
                    timeout: 1e3,
                    type: c,
                    layout: "bottomLeft"
                }), addFriend.val(""), void 0)
            })
        }), getFriends = function() {
            f("getFriends", {}, function(a) {
                if (friendslistUl.html(""), 200 == a.status)
                    for (var b in a.result) {
                        var c = a.result[b];
                        var friend = friendTemplate.
                        replace(/{ID}/g, c.user_id).
                        replace("{CLASS}", "").
                        replace(/{USERNAME}/g, c.username).
                        replace("{CURRENT_SERVER}", c.current_server).
                        replace("{BUTTON}", "sb_play").
                        replace(/{ONLINE}/g, 1 == c.isonline ? "playing" : "").
                        replace("{AVATAR}", "" == c.avatar || null == c.avatar ? defaultAvatar : c.avatar).
                        replace("{BUTTON_STATUS}", "" == c.current_server || "none" == c.current_server || null == c.current_server || 0 == c.isonline ? "" : "playing").
                        replace("{HOSTNAME}", "" == c.current_server || "none" == c.current_server || null == c.current_server || 0 == c.isonline ? "" : hostname(c.hostname));
                        friendslistUl.append(friend);
                    }
                return 401 == a.status ? sb_friends.hide() : (sb_friends.show(), void 0)
            })
        }, getFriends(), getFriendsLoop = setInterval(getFriends, 8e3), getRequests = function() {
            f("getRequests", {}, function(a) {
                if (200 == a.status)
                    for (var c in a.result) {
                        var d = a.result[c],
                            e = d.from + d.to;
                        if (-1 != knowRequests.indexOf(e)) return;
                        knowRequests.push(e), noty({
                            requestKey: c,
                            text: d.username + " has sent you a friend request.",
                            timeout: 0,
                            type: "confirm",
                            layout: "bottomLeft",
                            buttons: [{
                                addClass: "btn btn-primary",
                                text: "Accept",
                                onClick: function(c) {
                                    d = a.result[c.options.requestKey], b(d.from, !0), noty({
                                        text: "Friend request has been accepted",
                                        timeout: 1e3,
                                        type: "success"
                                    }), c.close()
                                }
                            }, {
                                addClass: "btn btn-danger",
                                text: "Decline",
                                onClick: function(a) {
                                    b(d.from, !1), a.close()
                                }
                            }]
                        })
                    }
            })
        }, getRequests(), getRequestsLoop = setInterval(getRequests, 4e3), void 0)
    }),
    function(a) {
        "use strict";
        "function" == typeof define && define.amd ? define(["jquery"], a) : a(jQuery)
    }(function(a) {
        "use strict";

        function d(b, c) {
            var e = function() {},
                f = this,
                g = {
                    autoSelectFirst: !1,
                    appendTo: "body",
                    serviceUrl: null,
                    lookup: null,
                    onSelect: null,
                    width: "auto",
                    minChars: 1,
                    maxHeight: 300,
                    deferRequestBy: 0,
                    params: {},
                    formatResult: d.formatResult,
                    delimiter: null,
                    zIndex: 9999,
                    type: "GET",
                    noCache: !1,
                    onSearchStart: e,
                    onSearchComplete: e,
                    containerClass: "sb_searchlist",
                    tabDisabled: !1,
                    dataType: "text",
                    currentRequest: null,
                    lookupFilter: function(a, b, c) {
                        return -1 !== a.value.toLowerCase().indexOf(c)
                    },
                    paramName: "query",
                    transformResult: function(b) {
                        return "string" == typeof b ? a.parseJSON(b) : b
                    }
                };
            f.element = b, f.el = a(b), f.suggestions = [], f.badQueries = [], f.selectedIndex = -1, f.currentValue = f.element.value, f.intervalId = 0, f.cachedResponse = [], f.onChangeInterval = null, f.onChange = null, f.isLocal = !1, f.suggestionsContainer = null, f.options = a.extend({}, g, c), f.classes = {
                selected: "autocomplete-selected",
                suggestion: "autocomplete-suggestion"
            }, f.hint = null, f.hintValue = "", f.selection = null, f.initialize(), f.setOptions(c)
        }
        var b = function() {
                return {
                    escapeRegExChars: function(a) {
                        return a.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
                    },
                    createNode: function(a) {
                        var b = document.createElement("div");
                        return b.innerHTML = a, b.firstChild
                    }
                }
            }(),
            c = {
                ESC: 27,
                TAB: 9,
                RETURN: 13,
                LEFT: 37,
                UP: 38,
                RIGHT: 39,
                DOWN: 40
            };
        d.utils = b, a.Autocomplete = d, d.formatResult = function(a, c) {
            var d = "(" + b.escapeRegExChars(c) + ")";
            return a.value.replace(new RegExp(d, "gi"), "<strong>$1</strong>")
        }, d.prototype = {
            killerFn: null,
            initialize: function() {
                var g, b = this,
                    c = "." + b.classes.suggestion,
                    e = b.classes.selected,
                    f = b.options;
                b.element.setAttribute("autocomplete", "off"), b.killerFn = function(c) {
                    0 === a(c.target).closest("#" + b.options.containerClass).length && (b.killSuggestions(), b.disableKillerFn())
                }, b.suggestionsContainer = d.utils.createNode('<div id="' + f.containerClass + '" class="sb_list"><ul></ul></div>'), g = a(b.suggestionsContainer), g.appendTo(f.appendTo).after(a("#sb_addFriend")), "auto" !== f.width && g.width(f.width), g.on("mouseover.autocomplete", c, function() {
                    b.activate(a(this).data("index"))
                }), g.on("mouseout.autocomplete", function() {
                    b.selectedIndex = -1, g.children("." + e).removeClass(e)
                }), g.on("click.autocomplete", c, function() {
                    b.select(a(this).data("index"))
                }), b.fixPosition(), b.fixPositionCapture = function() {
                    b.visible && b.fixPosition()
                }, a(window).on("resize", b.fixPositionCapture), b.el.on("keydown.autocomplete", function(a) {
                    b.onKeyPress(a)
                }), b.el.on("keyup.autocomplete", function(a) {
                    b.onKeyUp(a)
                }), b.el.on("blur.autocomplete", function() {
                    b.onBlur()
                }), b.el.on("focus.autocomplete", function() {
                    b.fixPosition()
                }), b.el.on("change.autocomplete", function(a) {
                    b.onKeyUp(a)
                })
            },
            onBlur: function() {
                this.enableKillerFn()
            },
            setOptions: function(b) {
                var c = this,
                    d = c.options;
                a.extend(d, b), c.isLocal = a.isArray(d.lookup), c.isLocal && (d.lookup = c.verifySuggestionsFormat(d.lookup))
            },
            clearCache: function() {
                this.cachedResponse = [], this.badQueries = []
            },
            clear: function() {
                this.clearCache(), this.currentValue = "", this.suggestions = []
            },
            disable: function() {
                this.disabled = !0
            },
            enable: function() {
                this.disabled = !1
            },
            fixPosition: function() {
                var c, b = this;
                "body" === b.options.appendTo && (c = b.el.offset(), a(b.suggestionsContainer).css({
                    top: c.top + b.el.outerHeight() + "px",
                    left: c.left + "px"
                }))
            },
            enableKillerFn: function() {
                var b = this;
                a(document).on("click.autocomplete", b.killerFn)
            },
            disableKillerFn: function() {
                var b = this;
                a(document).off("click.autocomplete", b.killerFn)
            },
            killSuggestions: function() {
                var a = this;
                a.stopKillSuggestions(), a.intervalId = window.setInterval(function() {
                    a.hide(), addFriend.val(""), a.stopKillSuggestions()
                }, 300)
            },
            stopKillSuggestions: function() {
                window.clearInterval(this.intervalId)
            },
            isCursorAtEnd: function() {
                var d, a = this,
                    b = a.el.val().length,
                    c = a.element.selectionStart;
                return "number" == typeof c ? c === b : document.selection ? (d = document.selection.createRange(), d.moveStart("character", -b), b === d.text.length) : !0
            },
            onKeyPress: function(a) {
                var b = this;
                if (!b.disabled && !b.visible && a.which === c.DOWN && b.currentValue) return b.suggest(), void 0;
                if (!b.disabled && b.visible) {
                    switch (a.which) {
                        case c.ESC:
                            b.el.val(b.currentValue), b.hide();
                            break;
                        case c.RIGHT:
                            if (b.hint && b.options.onHint && b.isCursorAtEnd()) {
                                b.selectHint();
                                break
                            }
                            return;
                        case c.TAB:
                            if (b.hint && b.options.onHint) return b.selectHint(), void 0;
                        case c.RETURN:
                            if (-1 === b.selectedIndex) return b.hide(), void 0;
                            if (b.select(b.selectedIndex), a.which === c.TAB && b.options.tabDisabled === !1) return;
                            break;
                        case c.UP:
                            b.moveUp();
                            break;
                        case c.DOWN:
                            b.moveDown();
                            break;
                        default:
                            return
                    }
                    a.stopImmediatePropagation(), a.preventDefault()
                }
            },
            onKeyUp: function(a) {
                var b = this;
                if (!b.disabled) {
                    switch (a.which) {
                        case c.UP:
                        case c.DOWN:
                            return
                    }
                    clearInterval(b.onChangeInterval), b.currentValue !== b.el.val() && (b.findBestHint(), b.options.deferRequestBy > 0 ? b.onChangeInterval = setInterval(function() {
                        b.onValueChange()
                    }, b.options.deferRequestBy) : b.onValueChange())
                }
            },
            onValueChange: function() {
                var c, b = this;
                b.selection && (b.selection = null, (b.options.onInvalidateSelection || a.noop)()), clearInterval(b.onChangeInterval), b.currentValue = b.el.val(), c = b.getQuery(b.currentValue), b.selectedIndex = -1, c.length < b.options.minChars ? b.hide() : b.getSuggestions(c)
            },
            getQuery: function(b) {
                var d, c = this.options.delimiter;
                return c ? (d = b.split(c), a.trim(d[d.length - 1])) : a.trim(b)
            },
            getSuggestionsLocal: function(b) {
                var c = this,
                    d = b.toLowerCase(),
                    e = c.options.lookupFilter;
                return {
                    suggestions: a.grep(c.options.lookup, function(a) {
                        return e(a, b, d)
                    })
                }
            },
            getSuggestions: function(b) {
                var c, d = this,
                    e = d.options,
                    f = e.serviceUrl;
                if (c = d.isLocal ? d.getSuggestionsLocal(b) : d.cachedResponse[b], c && a.isArray(c.suggestions)) d.suggestions = c.suggestions, d.suggest();
                else if (!d.isBadQuery(b)) {
                    if (e.params[e.paramName] = b, e.onSearchStart.call(d.element, e.params) === !1) return;
                    a.isFunction(e.serviceUrl) && (f = e.serviceUrl.call(d.element, b)), null != this.currentRequest && this.currentRequest.abort(), this.currentRequest = a.ajax({
                        url: f,
                        data: e.ignoreParams ? null : e.params,
                        type: e.type,
                        dataType: e.dataType
                    }).done(function(a) {
                        d.processResponse(a, b), e.onSearchComplete.call(d.element, b)
                    })
                }
            },
            isBadQuery: function(a) {
                for (var b = this.badQueries, c = b.length; c--;)
                    if (0 === a.indexOf(b[c])) return !0;
                return !1
            },
            hide: function() {
                var b = this;
                b.visible = !1, b.selectedIndex = -1, a(b.suggestionsContainer).children("ul").hide(), b.signalHint(null), friendslist.show(), getFriends()
            },
            suggest: function() {
                if (0 === this.suggestions.length) return this.hide(), void 0;
                searchlist.show();
                var i, b = this,
                    c = b.options.formatResult,
                    d = b.getQuery(b.currentValue),
                    f = (b.classes.suggestion, b.classes.selected),
                    g = a(b.suggestionsContainer),
                    h = "";
                a.each(b.suggestions, function(a, b) {
                    console.log(b.hostname);
                    h += friendTemplate
                    .replace(/{ID}/g, b.data)
                    .replace("{CLASS}", "searchResult")
                    .replace("{CURRENT_SERVER}", "")
                    .replace(/{USERNAME}/g, c(b, d))
                    .replace("{BUTTON}", "sb_remove")
                    .replace("{BUTTON_STATUS}", b.friend ? "friend" : "")
                    .replace(/{ONLINE}/g, 1 == b.isonline ? "playing" : "")
                    .replace("{AVATAR}", null == b.avatar || "" == b.avatar ? defaultAvatar : b.avatar)
                    .replace("{HOSTNAME}", "" == b.current_server || "none" == b.current_server || null == b.current_server || 0 == b.isonline ? "" : hostname(b.hostname));

                }), "auto" === b.options.width && (i = b.el.outerWidth() - 2, g.width(i > 0 ? i : 300)), g.children("ul").html(h).fadeIn("slow").show(), b.visible = !0, b.options.autoSelectFirst && (b.selectedIndex = 0, g.children().first().addClass(f)), b.findBestHint(), friendslist.hide()
            },
            findBestHint: function() {
                var b = this,
                    c = b.el.val().toLowerCase(),
                    d = null;
                c && (a.each(b.suggestions, function(a, b) {
                    var e = 0 === b.value.toLowerCase().indexOf(c);
                    return e && (d = b), !e
                }), b.signalHint(d))
            },
            signalHint: function(b) {
                var c = "",
                    d = this;
                b && (c = d.currentValue + b.value.substr(d.currentValue.length)), d.hintValue !== c && (d.hintValue = c, d.hint = b, (this.options.onHint || a.noop)(c))
            },
            verifySuggestionsFormat: function(b) {
                return a.map(b, function(a) {
                    return {
                        value: a.username,
                        data: a.user_id,
                        isonline: a.isonline,
                        avatar: a.avatar,
                        friend: a.friend,
                        current_server: a.current_server,
                        hostname: a.hostname
                    }
                })
            },
            processResponse: function(a, b) {
                var c = this,
                    d = c.options,
                    e = d.transformResult(a, b);
                return 401 == e.status ? c.hide() : (200 == e.status && (e.suggestions = c.verifySuggestionsFormat(e.result)), d.noCache || (c.cachedResponse[e[d.paramName]] = e, "undefined" != typeof e.suggestions && "string" !== e.suggestions.result) ? (b === c.getQuery(c.currentValue) && (c.suggestions = e.suggestions, c.suggest()), void 0) : c.hide())
            },
            activate: function(b) {
                var d, c = this,
                    e = c.classes.selected,
                    f = a(c.suggestionsContainer),
                    g = f.children();
                return f.children("." + e).removeClass(e), c.selectedIndex = b, -1 !== c.selectedIndex && g.length > c.selectedIndex ? (d = g.get(c.selectedIndex), a(d).addClass(e), d) : null
            },
            selectHint: function() {
                var b = this,
                    c = a.inArray(b.hint, b.suggestions);
                b.select(c)
            },
            select: function(a) {
                var b = this;
                b.hide(), b.onSelect(a)
            },
            moveUp: function() {
                var b = this;
                if (-1 !== b.selectedIndex) return 0 === b.selectedIndex ? (a(b.suggestionsContainer).children().first().removeClass(b.classes.selected), b.selectedIndex = -1, b.el.val(b.currentValue), b.findBestHint(), void 0) : (b.adjustScroll(b.selectedIndex - 1), void 0)
            },
            moveDown: function() {
                var a = this;
                a.selectedIndex !== a.suggestions.length - 1 && a.adjustScroll(a.selectedIndex + 1)
            },
            adjustScroll: function(b) {
                var e, f, g, c = this,
                    d = c.activate(b),
                    h = 25;
                d && (e = d.offsetTop, f = a(c.suggestionsContainer).scrollTop(), g = f + c.options.maxHeight - h, f > e ? a(c.suggestionsContainer).scrollTop(e) : e > g && a(c.suggestionsContainer).scrollTop(e - c.options.maxHeight + h), c.el.val(c.getValue(c.suggestions[b].value)), c.signalHint(null))
            },
            onSelect: function(b) {
                var c = this,
                    d = c.options.onSelect,
                    e = c.suggestions[b];
                c.currentValue = c.getValue(e.value), c.el.val(c.currentValue), c.signalHint(null), c.suggestions = [], c.selection = e, a.isFunction(d) && d.call(c.element, e)
            },
            getValue: function(a) {
                var d, e, b = this,
                    c = b.options.delimiter;
                return c ? (d = b.currentValue, e = d.split(c), 1 === e.length ? a : d.substr(0, d.length - e[e.length - 1].length) + a) : a
            },
            dispose: function() {
                var b = this;
                b.el.off(".autocomplete").removeData("autocomplete"), b.disableKillerFn(), a(window).off("resize", b.fixPositionCapture), a(b.suggestionsContainer).remove()
            }
        }, a.fn.autocomplete = function(b, c) {
            var e = "autocomplete";
            return 0 === arguments.length ? this.first().data(e) : this.each(function() {
                var f = a(this),
                    g = f.data(e);
                "string" == typeof b ? g && "function" == typeof g[b] && g[b](c) : (g && g.dispose && g.dispose(), g = new d(this, b), f.data(e, g))
            })
        }
    }), "function" != typeof Object.create && (Object.create = function(a) {
        function b() {}
        return b.prototype = a, new b
    }),
    function(a) {
        var b = {
            init: function(b) {
                return this.options = a.extend({}, a.noty.defaults, b), this.options.layout = this.options.custom ? a.noty.layouts.inline : a.noty.layouts[this.options.layout], a.noty.themes[this.options.theme] ? this.options.theme = a.noty.themes[this.options.theme] : b.themeClassName = this.options.theme, delete b.layout, delete b.theme, this.options = a.extend({}, this.options, this.options.layout.options), this.options.id = "noty_" + (new Date).getTime() * Math.floor(1e6 * Math.random()), this.options = a.extend({}, this.options, b), this._build(), this
            },
            _build: function() {
                var b = a('<div class="noty_bar noty_type_' + this.options.type + '"></div>').attr("id", this.options.id);
                if (b.append(this.options.template).find(".noty_text").html(this.options.text), this.$bar = null !== this.options.layout.parent.object ? a(this.options.layout.parent.object).css(this.options.layout.parent.css).append(b) : b, this.options.themeClassName && this.$bar.addClass(this.options.themeClassName).addClass("noty_container_type_" + this.options.type), this.options.buttons) {
                    this.options.closeWith = [], this.options.timeout = !1;
                    var c = a("<div/>").addClass("noty_buttons");
                    null !== this.options.layout.parent.object ? this.$bar.find(".noty_bar").append(c) : this.$bar.append(c);
                    var d = this;
                    a.each(this.options.buttons, function(b, c) {
                        var e = a("<button/>").addClass(c.addClass ? c.addClass : "gray").html(c.text).attr("id", c.id ? c.id : "button-" + b).appendTo(d.$bar.find(".noty_buttons")).on("click", function() {
                            a.isFunction(c.onClick) && c.onClick.call(e, d)
                        })
                    })
                }
                this.$message = this.$bar.find(".noty_message"), this.$closeButton = this.$bar.find(".noty_close"), this.$buttons = this.$bar.find(".noty_buttons"), a.noty.store[this.options.id] = this
            },
            show: function() {
                var b = this;
                return b.options.custom ? b.options.custom.find(b.options.layout.container.selector).append(b.$bar) : a(b.options.layout.container.selector).append(b.$bar), b.options.theme && b.options.theme.style && b.options.theme.style.apply(b), "function" === a.type(b.options.layout.css) ? this.options.layout.css.apply(b.$bar) : b.$bar.css(this.options.layout.css || {}), b.$bar.addClass(b.options.layout.addClass), b.options.layout.container.style.apply(a(b.options.layout.container.selector)), b.showing = !0, b.options.theme && b.options.theme.style && b.options.theme.callback.onShow.apply(this), a.inArray("click", b.options.closeWith) > -1 && b.$bar.css("cursor", "pointer").one("click", function(a) {
                    b.stopPropagation(a), b.options.callback.onCloseClick && b.options.callback.onCloseClick.apply(b), b.close()
                }), a.inArray("hover", b.options.closeWith) > -1 && b.$bar.one("mouseenter", function() {
                    b.close()
                }), a.inArray("button", b.options.closeWith) > -1 && b.$closeButton.one("click", function(a) {
                    b.stopPropagation(a), b.close()
                }), -1 == a.inArray("button", b.options.closeWith) && b.$closeButton.remove(), b.options.callback.onShow && b.options.callback.onShow.apply(b), b.$bar.animate(b.options.animation.open, b.options.animation.speed, b.options.animation.easing, function() {
                    b.options.callback.afterShow && b.options.callback.afterShow.apply(b), b.showing = !1, b.shown = !0
                }), b.options.timeout && b.$bar.delay(b.options.timeout).promise().done(function() {
                    b.close()
                }), this
            },
            close: function() {
                if (!(this.closed || this.$bar && this.$bar.hasClass("i-am-closing-now"))) {
                    var b = this;
                    if (this.showing) return b.$bar.queue(function() {
                        b.close.apply(b)
                    }), void 0;
                    if (!this.shown && !this.showing) {
                        var c = [];
                        return a.each(a.noty.queue, function(a, d) {
                            d.options.id != b.options.id && c.push(d)
                        }), a.noty.queue = c, void 0
                    }
                    b.$bar.addClass("i-am-closing-now"), b.options.callback.onClose && b.options.callback.onClose.apply(b), b.$bar.clearQueue().stop().animate(b.options.animation.close, b.options.animation.speed, b.options.animation.easing, function() {
                        b.options.callback.afterClose && b.options.callback.afterClose.apply(b)
                    }).promise().done(function() {
                        b.options.modal && (a.notyRenderer.setModalCount(-1), 0 == a.notyRenderer.getModalCount() && a(".noty_modal").fadeOut("fast", function() {
                            a(this).remove()
                        })), a.notyRenderer.setLayoutCountFor(b, -1), 0 == a.notyRenderer.getLayoutCountFor(b) && a(b.options.layout.container.selector).remove(), "undefined" != typeof b.$bar && null !== b.$bar && (b.$bar.remove(), b.$bar = null, b.closed = !0), delete a.noty.store[b.options.id], b.options.theme.callback && b.options.theme.callback.onClose && b.options.theme.callback.onClose.apply(b), b.options.dismissQueue || (a.noty.ontap = !0, a.notyRenderer.render()), b.options.maxVisible > 0 && b.options.dismissQueue && a.notyRenderer.render()
                    })
                }
            },
            setText: function(a) {
                return this.closed || (this.options.text = a, this.$bar.find(".noty_text").html(a)), this
            },
            setType: function(a) {
                return this.closed || (this.options.type = a, this.options.theme.style.apply(this), this.options.theme.callback.onShow.apply(this)), this
            },
            setTimeout: function(a) {
                if (!this.closed) {
                    var b = this;
                    this.options.timeout = a, b.$bar.delay(b.options.timeout).promise().done(function() {
                        b.close()
                    })
                }
                return this
            },
            stopPropagation: function(a) {
                a = a || window.event, "undefined" != typeof a.stopPropagation ? a.stopPropagation() : a.cancelBubble = !0
            },
            closed: !1,
            showing: !1,
            shown: !1
        };
        a.notyRenderer = {}, a.notyRenderer.init = function(c) {
            var d = Object.create(b).init(c);
            return d.options.killer && a.noty.closeAll(), d.options.force ? a.noty.queue.unshift(d) : a.noty.queue.push(d), a.notyRenderer.render(), "object" == a.noty.returns ? d : d.options.id
        }, a.notyRenderer.render = function() {
            var b = a.noty.queue[0];
            "object" === a.type(b) ? b.options.dismissQueue ? b.options.maxVisible > 0 ? a(b.options.layout.container.selector + " li").length < b.options.maxVisible && a.notyRenderer.show(a.noty.queue.shift()) : a.notyRenderer.show(a.noty.queue.shift()) : a.noty.ontap && (a.notyRenderer.show(a.noty.queue.shift()), a.noty.ontap = !1) : a.noty.ontap = !0
        }, a.notyRenderer.show = function(b) {
            b.options.modal && (a.notyRenderer.createModalFor(b), a.notyRenderer.setModalCount(1)), b.options.custom ? 0 == b.options.custom.find(b.options.layout.container.selector).length ? b.options.custom.append(a(b.options.layout.container.object).addClass("i-am-new")) : b.options.custom.find(b.options.layout.container.selector).removeClass("i-am-new") : 0 == a(b.options.layout.container.selector).length ? a("body").append(a(b.options.layout.container.object).addClass("i-am-new")) : a(b.options.layout.container.selector).removeClass("i-am-new"), a.notyRenderer.setLayoutCountFor(b, 1), b.show()
        }, a.notyRenderer.createModalFor = function(b) {
            if (0 == a(".noty_modal").length) {
                var c = a("<div/>").addClass("noty_modal").addClass(b.options.theme).data("noty_modal_count", 0);
                b.options.theme.modal && b.options.theme.modal.css && c.css(b.options.theme.modal.css), c.prependTo(a("body")).fadeIn("fast")
            }
        }, a.notyRenderer.getLayoutCountFor = function(b) {
            return a(b.options.layout.container.selector).data("noty_layout_count") || 0
        }, a.notyRenderer.setLayoutCountFor = function(b, c) {
            return a(b.options.layout.container.selector).data("noty_layout_count", a.notyRenderer.getLayoutCountFor(b) + c)
        }, a.notyRenderer.getModalCount = function() {
            return a(".noty_modal").data("noty_modal_count") || 0
        }, a.notyRenderer.setModalCount = function(b) {
            return a(".noty_modal").data("noty_modal_count", a.notyRenderer.getModalCount() + b)
        }, a.fn.noty = function(b) {
            return b.custom = a(this), a.notyRenderer.init(b)
        }, a.noty = {}, a.noty.queue = [], a.noty.ontap = !0, a.noty.layouts = {}, a.noty.themes = {}, a.noty.returns = "object", a.noty.store = {}, a.noty.get = function(b) {
            return a.noty.store.hasOwnProperty(b) ? a.noty.store[b] : !1
        }, a.noty.close = function(b) {
            return a.noty.get(b) ? a.noty.get(b).close() : !1
        }, a.noty.setText = function(b, c) {
            return a.noty.get(b) ? a.noty.get(b).setText(c) : !1
        }, a.noty.setType = function(b, c) {
            return a.noty.get(b) ? a.noty.get(b).setType(c) : !1
        }, a.noty.clearQueue = function() {
            a.noty.queue = []
        }, a.noty.closeAll = function() {
            a.noty.clearQueue(), a.each(a.noty.store, function(a, b) {
                b.close()
            })
        };
        var c = window.alert;
        a.noty.consumeAlert = function(b) {
            window.alert = function(c) {
                b ? b.text = c : b = {
                    text: c
                }, a.notyRenderer.init(b)
            }
        }, a.noty.stopConsumeAlert = function() {
            window.alert = c
        }, a.noty.defaults = {
            layout: "top",
            theme: "defaultTheme",
            type: "alert",
            text: "",
            dismissQueue: !0,
            template: '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',
            animation: {
                open: {
                    height: "toggle"
                },
                close: {
                    height: "toggle"
                },
                easing: "swing",
                speed: 500
            },
            timeout: !1,
            force: !1,
            modal: !1,
            maxVisible: 5,
            killer: !1,
            closeWith: ["click"],
            callback: {
                onShow: function() {},
                afterShow: function() {},
                onClose: function() {},
                afterClose: function() {},
                onCloseClick: function() {}
            },
            buttons: !1
        }, a(window).on("resize", function() {
            a.each(a.noty.layouts, function(b, c) {
                c.container.style.apply(a(c.container.selector))
            })
        })
    }(jQuery), window.noty = function(a) {
        return jQuery.notyRenderer.init(a)
    },
    function(a) {
        a.noty.layouts.bottom = {
            name: "bottom",
            options: {},
            container: {
                object: '<ul id="noty_bottom_layout_container" />',
                selector: "ul#noty_bottom_layout_container",
                style: function() {
                    a(this).css({
                        bottom: 0,
                        left: "5%",
                        position: "fixed",
                        width: "90%",
                        height: "auto",
                        margin: 0,
                        padding: 0,
                        listStyleType: "none",
                        zIndex: 9999999
                    })
                }
            },
            parent: {
                object: "<li />",
                selector: "li",
                css: {}
            },
            css: {
                display: "none"
            },
            addClass: ""
        }
    }(jQuery),
    function(a) {
        a.noty.layouts.bottomCenter = {
            name: "bottomCenter",
            options: {},
            container: {
                object: '<ul id="noty_bottomCenter_layout_container" />',
                selector: "ul#noty_bottomCenter_layout_container",
                style: function() {
                    a(this).css({
                        bottom: 20,
                        left: 0,
                        position: "fixed",
                        width: "310px",
                        height: "auto",
                        margin: 0,
                        padding: 0,
                        listStyleType: "none",
                        zIndex: 1e7
                    }), a(this).css({
                        left: (a(window).width() - a(this).outerWidth(!1)) / 2 + "px"
                    })
                }
            },
            parent: {
                object: "<li />",
                selector: "li",
                css: {}
            },
            css: {
                display: "none",
                width: "310px"
            },
            addClass: ""
        }
    }(jQuery),
    function(a) {
        a.noty.layouts.bottomLeft = {
            name: "bottomLeft",
            options: {},
            container: {
                object: '<ul id="noty_bottomLeft_layout_container" />',
                selector: "ul#noty_bottomLeft_layout_container",
                style: function() {
                    a(this).css({
                        bottom: 20,
                        left: 20,
                        position: "fixed",
                        width: "310px",
                        height: "auto",
                        margin: 0,
                        padding: 0,
                        listStyleType: "none",
                        zIndex: 1e7
                    }), window.innerWidth < 600 && a(this).css({
                        left: 5
                    })
                }
            },
            parent: {
                object: "<li />",
                selector: "li",
                css: {}
            },
            css: {
                display: "none",
                width: "310px"
            },
            addClass: ""
        }
    }(jQuery),
    function(a) {
        a.noty.layouts.bottomRight = {
            name: "bottomRight",
            options: {},
            container: {
                object: '<ul id="noty_bottomRight_layout_container" />',
                selector: "ul#noty_bottomRight_layout_container",
                style: function() {
                    a(this).css({
                        bottom: 20,
                        right: 20,
                        position: "fixed",
                        width: "310px",
                        height: "auto",
                        margin: 0,
                        padding: 0,
                        listStyleType: "none",
                        zIndex: 1e7
                    }), window.innerWidth < 600 && a(this).css({
                        right: 5
                    })
                }
            },
            parent: {
                object: "<li />",
                selector: "li",
                css: {}
            },
            css: {
                display: "none",
                width: "310px"
            },
            addClass: ""
        }
    }(jQuery),
    function(a) {
        a.noty.layouts.center = {
            name: "center",
            options: {},
            container: {
                object: '<ul id="noty_center_layout_container" />',
                selector: "ul#noty_center_layout_container",
                style: function() {
                    a(this).css({
                        position: "fixed",
                        width: "310px",
                        height: "auto",
                        margin: 0,
                        padding: 0,
                        listStyleType: "none",
                        zIndex: 1e7
                    });
                    var b = a(this).clone().css({
                        visibility: "hidden",
                        display: "block",
                        position: "absolute",
                        top: 0,
                        left: 0
                    }).attr("id", "dupe");
                    a("body").append(b), b.find(".i-am-closing-now").remove(), b.find("li").css("display", "block");
                    var c = b.height();
                    b.remove(), a(this).hasClass("i-am-new") ? a(this).css({
                        left: (a(window).width() - a(this).outerWidth(!1)) / 2 + "px",
                        top: (a(window).height() - c) / 2 + "px"
                    }) : a(this).animate({
                        left: (a(window).width() - a(this).outerWidth(!1)) / 2 + "px",
                        top: (a(window).height() - c) / 2 + "px"
                    }, 500)
                }
            },
            parent: {
                object: "<li />",
                selector: "li",
                css: {}
            },
            css: {
                display: "none",
                width: "310px"
            },
            addClass: ""
        }
    }(jQuery),
    function(a) {
        a.noty.layouts.centerLeft = {
            name: "centerLeft",
            options: {},
            container: {
                object: '<ul id="noty_centerLeft_layout_container" />',
                selector: "ul#noty_centerLeft_layout_container",
                style: function() {
                    a(this).css({
                        left: 20,
                        position: "fixed",
                        width: "310px",
                        height: "auto",
                        margin: 0,
                        padding: 0,
                        listStyleType: "none",
                        zIndex: 1e7
                    });
                    var b = a(this).clone().css({
                        visibility: "hidden",
                        display: "block",
                        position: "absolute",
                        top: 0,
                        left: 0
                    }).attr("id", "dupe");
                    a("body").append(b), b.find(".i-am-closing-now").remove(), b.find("li").css("display", "block");
                    var c = b.height();
                    b.remove(), a(this).hasClass("i-am-new") ? a(this).css({
                        top: (a(window).height() - c) / 2 + "px"
                    }) : a(this).animate({
                        top: (a(window).height() - c) / 2 + "px"
                    }, 500), window.innerWidth < 600 && a(this).css({
                        left: 5
                    })
                }
            },
            parent: {
                object: "<li />",
                selector: "li",
                css: {}
            },
            css: {
                display: "none",
                width: "310px"
            },
            addClass: ""
        }
    }(jQuery),
    function(a) {
        a.noty.layouts.centerRight = {
            name: "centerRight",
            options: {},
            container: {
                object: '<ul id="noty_centerRight_layout_container" />',
                selector: "ul#noty_centerRight_layout_container",
                style: function() {
                    a(this).css({
                        right: 20,
                        position: "fixed",
                        width: "310px",
                        height: "auto",
                        margin: 0,
                        padding: 0,
                        listStyleType: "none",
                        zIndex: 1e7
                    });
                    var b = a(this).clone().css({
                        visibility: "hidden",
                        display: "block",
                        position: "absolute",
                        top: 0,
                        left: 0
                    }).attr("id", "dupe");
                    a("body").append(b), b.find(".i-am-closing-now").remove(), b.find("li").css("display", "block");
                    var c = b.height();
                    b.remove(), a(this).hasClass("i-am-new") ? a(this).css({
                        top: (a(window).height() - c) / 2 + "px"
                    }) : a(this).animate({
                        top: (a(window).height() - c) / 2 + "px"
                    }, 500), window.innerWidth < 600 && a(this).css({
                        right: 5
                    })
                }
            },
            parent: {
                object: "<li />",
                selector: "li",
                css: {}
            },
            css: {
                display: "none",
                width: "310px"
            },
            addClass: ""
        }
    }(jQuery),
    function(a) {
        a.noty.layouts.inline = {
            name: "inline",
            options: {},
            container: {
                object: '<ul class="noty_inline_layout_container" />',
                selector: "ul.noty_inline_layout_container",
                style: function() {
                    a(this).css({
                        width: "100%",
                        height: "auto",
                        margin: 0,
                        padding: 0,
                        listStyleType: "none",
                        zIndex: 9999999
                    })
                }
            },
            parent: {
                object: "<li />",
                selector: "li",
                css: {}
            },
            css: {
                display: "none"
            },
            addClass: ""
        }
    }(jQuery),
    function(a) {
        a.noty.layouts.top = {
            name: "top",
            options: {},
            container: {
                object: '<ul id="noty_top_layout_container" />',
                selector: "ul#noty_top_layout_container",
                style: function() {
                    a(this).css({
                        top: 0,
                        left: "5%",
                        position: "fixed",
                        width: "90%",
                        height: "auto",
                        margin: 0,
                        padding: 0,
                        listStyleType: "none",
                        zIndex: 9999999
                    })
                }
            },
            parent: {
                object: "<li />",
                selector: "li",
                css: {}
            },
            css: {
                display: "none"
            },
            addClass: ""
        }
    }(jQuery),
    function(a) {
        a.noty.layouts.topCenter = {
            name: "topCenter",
            options: {},
            container: {
                object: '<ul id="noty_topCenter_layout_container" />',
                selector: "ul#noty_topCenter_layout_container",
                style: function() {
                    a(this).css({
                        top: 20,
                        left: 0,
                        position: "fixed",
                        width: "310px",
                        height: "auto",
                        margin: 0,
                        padding: 0,
                        listStyleType: "none",
                        zIndex: 1e7
                    }), a(this).css({
                        left: (a(window).width() - a(this).outerWidth(!1)) / 2 + "px"
                    })
                }
            },
            parent: {
                object: "<li />",
                selector: "li",
                css: {}
            },
            css: {
                display: "none",
                width: "310px"
            },
            addClass: ""
        }
    }(jQuery),
    function(a) {
        a.noty.layouts.topLeft = {
            name: "topLeft",
            options: {},
            container: {
                object: '<ul id="noty_topLeft_layout_container" />',
                selector: "ul#noty_topLeft_layout_container",
                style: function() {
                    a(this).css({
                        top: 20,
                        left: 20,
                        position: "fixed",
                        width: "310px",
                        height: "auto",
                        margin: 0,
                        padding: 0,
                        listStyleType: "none",
                        zIndex: 1e7
                    }), window.innerWidth < 600 && a(this).css({
                        left: 5
                    })
                }
            },
            parent: {
                object: "<li />",
                selector: "li",
                css: {}
            },
            css: {
                display: "none",
                width: "310px"
            },
            addClass: ""
        }
    }(jQuery),
    function(a) {
        a.noty.layouts.topRight = {
            name: "topRight",
            options: {},
            container: {
                object: '<ul id="noty_topRight_layout_container" />',
                selector: "ul#noty_topRight_layout_container",
                style: function() {
                    a(this).css({
                        top: 20,
                        right: 20,
                        position: "fixed",
                        width: "310px",
                        height: "auto",
                        margin: 0,
                        padding: 0,
                        listStyleType: "none",
                        zIndex: 1e7
                    }), window.innerWidth < 600 && a(this).css({
                        right: 5
                    })
                }
            },
            parent: {
                object: "<li />",
                selector: "li",
                css: {}
            },
            css: {
                display: "none",
                width: "310px"
            },
            addClass: ""
        }
    }(jQuery),
    function(a) {
        a.noty.themes.defaultTheme = {
            name: "defaultTheme",
            helpers: {
                borderFix: function() {
                    if (this.options.dismissQueue) {
                        var b = this.options.layout.container.selector + " " + this.options.layout.parent.selector;
                        switch (this.options.layout.name) {
                            case "top":
                                a(b).css({
                                    borderRadius: "0px 0px 0px 0px"
                                }), a(b).last().css({
                                    borderRadius: "0px 0px 5px 5px"
                                });
                                break;
                            case "topCenter":
                            case "topLeft":
                            case "topRight":
                            case "bottomCenter":
                            case "bottomLeft":
                            case "bottomRight":
                            case "center":
                            case "centerLeft":
                            case "centerRight":
                            case "inline":
                                a(b).css({
                                    borderRadius: "0px 0px 0px 0px"
                                }), a(b).first().css({
                                    "border-top-left-radius": "5px",
                                    "border-top-right-radius": "5px"
                                }), a(b).last().css({
                                    "border-bottom-left-radius": "5px",
                                    "border-bottom-right-radius": "5px"
                                });
                                break;
                            case "bottom":
                                a(b).css({
                                    borderRadius: "0px 0px 0px 0px"
                                }), a(b).first().css({
                                    borderRadius: "5px 5px 0px 0px"
                                })
                        }
                    }
                }
            },
            modal: {
                css: {
                    position: "fixed",
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#000",
                    zIndex: 1e4,
                    opacity: .6,
                    display: "none",
                    left: 0,
                    top: 0
                }
            },
            style: function() {
                switch (this.$bar.css({
                    overflow: "hidden",
                    background: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAoCAYAAAAPOoFWAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAPZJREFUeNq81tsOgjAMANB2ov7/7ypaN7IlIwi9rGuT8QSc9EIDAsAznxvY4pXPKr05RUE5MEVB+TyWfCEl9LZApYopCmo9C4FKSMtYoI8Bwv79aQJU4l6hXXCZrQbokJEksxHo9KMOgc6w1atHXM8K9DVC7FQnJ0i8iK3QooGgbnyKgMDygBWyYFZoqx4qS27KqLZJjA1D0jK6QJcYEQEiWv9PGkTsbqxQ8oT+ZtZB6AkdsJnQDnMoHXHLGKOgDYuCWmYhEERCI5gaamW0bnHdA3k2ltlIN+2qKRyCND0bhqSYCyTB3CAOc4WusBEIpkeBuPgJMAAX8Hs1NfqHRgAAAABJRU5ErkJggg==') repeat-x scroll left top #fff"
                }), this.$message.css({
                    fontSize: "13px",
                    lineHeight: "16px",
                    textAlign: "center",
                    padding: "8px 10px 9px",
                    width: "auto",
                    position: "relative"
                }), this.$closeButton.css({
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 10,
                    height: 10,
                    background: "url(data:image/png;base64,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)",
                    display: "none",
                    cursor: "pointer"
                }), this.$buttons.css({
                    padding: 5,
                    textAlign: "right",
                    borderTop: "1px solid #ccc",
                    backgroundColor: "#fff"
                }), this.$buttons.find("button").css({
                    marginLeft: 5
                }), this.$buttons.find("button:first").css({
                    marginLeft: 0
                }), this.$bar.on({
                    mouseenter: function() {
                        a(this).find(".noty_close").stop().fadeTo("normal", 1)
                    },
                    mouseleave: function() {
                        a(this).find(".noty_close").stop().fadeTo("normal", 0)
                    }
                }), this.options.layout.name) {
                    case "top":
                        this.$bar.css({
                            borderRadius: "0px 0px 5px 5px",
                            borderBottom: "2px solid #eee",
                            borderLeft: "2px solid #eee",
                            borderRight: "2px solid #eee",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                        });
                        break;
                    case "topCenter":
                    case "center":
                    case "bottomCenter":
                    case "inline":
                        this.$bar.css({
                            borderRadius: "5px",
                            border: "1px solid #eee",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                        }), this.$message.css({
                            fontSize: "13px",
                            textAlign: "center"
                        });
                        break;
                    case "topLeft":
                    case "topRight":
                    case "bottomLeft":
                    case "bottomRight":
                    case "centerLeft":
                    case "centerRight":
                        this.$bar.css({
                            borderRadius: "5px",
                            border: "1px solid #eee",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                        }), this.$message.css({
                            fontSize: "13px",
                            textAlign: "left"
                        });
                        break;
                    case "bottom":
                        this.$bar.css({
                            borderRadius: "5px 5px 0px 0px",
                            borderTop: "2px solid #eee",
                            borderLeft: "2px solid #eee",
                            borderRight: "2px solid #eee",
                            boxShadow: "0 -2px 4px rgba(0, 0, 0, 0.1)"
                        });
                        break;
                    default:
                        this.$bar.css({
                            border: "2px solid #eee",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                        })
                }
                switch (this.options.type) {
                    case "alert":
                    case "notification":
                        this.$bar.css({
                            backgroundColor: "#FFF",
                            borderColor: "#CCC",
                            color: "#444"
                        });
                        break;
                    case "warning":
                        this.$bar.css({
                            backgroundColor: "#FFEAA8",
                            borderColor: "#FFC237",
                            color: "#826200"
                        }), this.$buttons.css({
                            borderTop: "1px solid #FFC237"
                        });
                        break;
                    case "error":
                        this.$bar.css({
                            backgroundColor: "red",
                            borderColor: "darkred",
                            color: "#FFF"
                        }), this.$message.css({
                            fontWeight: "bold"
                        }), this.$buttons.css({
                            borderTop: "1px solid darkred"
                        });
                        break;
                    case "information":
                        this.$bar.css({
                            backgroundColor: "#57B7E2",
                            borderColor: "#0B90C4",
                            color: "#FFF"
                        }), this.$buttons.css({
                            borderTop: "1px solid #0B90C4"
                        });
                        break;
                    case "success":
                        this.$bar.css({
                            backgroundColor: "lightgreen",
                            borderColor: "#50C24E",
                            color: "darkgreen"
                        }), this.$buttons.css({
                            borderTop: "1px solid #50C24E"
                        });
                        break;
                    default:
                        this.$bar.css({
                            backgroundColor: "#FFF",
                            borderColor: "#CCC",
                            color: "#444"
                        })
                }
            },
            callback: {
                onShow: function() {
                    a.noty.themes.defaultTheme.helpers.borderFix.apply(this)
                },
                onClose: function() {
                    a.noty.themes.defaultTheme.helpers.borderFix.apply(this)
                }
            }
        }
    }(jQuery),
    function(a) {
        a.fn.placeholder = function() {
            "undefined" == typeof document.createElement("input").placeholder && a("[placeholder]").focus(function() {
                var b = a(this);
                b.val() == b.attr("placeholder") && (b.val(""), b.removeClass("placeholder"))
            }).blur(function() {
                var b = a(this);
                ("" == b.val() || b.val() == b.attr("placeholder")) && (b.addClass("placeholder"), b.val(b.attr("placeholder")))
            }).blur().parents("form").submit(function() {
                a(this).find("[placeholder]").each(function() {
                    var b = a(this);
                    b.val() == b.attr("placeholder") && b.val("")
                })
            })
        }
    }(jQuery), $.fn.placeholder(), Object.extend = function(a, b) {
        for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
        return a
    };