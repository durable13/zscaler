!function($) {
    $.fn.ziatour = function(opt) {
        defaults = {
            debug: !1,
            formId: "email-capture",
            emailFieldName: "email",
            formError: "Please enter a valid business email."
        }, opt = $.extend(defaults, opt);
        function next(i) {
            stopVideo($nodes.eq(i)), goto(i + 1);
        }
        function prev(i) {
            goto(i - 1);
        }
        function gotoHash() {
            var $node;
            $nodes.each(function() {
                if (location.hash === "#" + $(this).attr("id")) return $node = $(this), $this.data("curNode") == $node.index() || ($this.data("curNode", $node.index()), 
                goto($this.data("curNode"))), !1;
            });
        }
        function initNodes() {
            var $node, isMobile = "none" == $this.find("#desktop").css("display");
            $this.find("#desktop").addClass("nodes"), $this.find("#mobile").addClass("nodes"), 
            ($nodes = isMobile ? $this.find("#mobile > div") : $this.find("#desktop > div")).each(function(i) {
                ($node = $nodes.eq(i)).addClass("node"), $node.find(".tooltip").wrapInner('<div class="shape"><div class="text"/></div>'), 
                $node.find(".target").on("click", function() {
                    ($node = $(this).parents(".node")).removeClass("hover"), $node.removeClass("focus"), 
                    next(i);
                }), $node.find(".btn-back").on("click", function() {
                    var idx = $(this).data("goto");
                    idx && $nodes.siblings("#" + idx).length && (idx = $nodes.siblings("#" + idx).index(), 
                    i = 0 < idx ? idx + 1 : i), prev(i);
                }), $node.find(".target").hover(function() {
                    ($node = $(this).parents(".node")).removeClass("focus"), $node.addClass("hover");
                }, function() {
                    ($node = $(this).parents(".node")).removeClass("hover");
                }), $node.find(".target").on("mousedown", function() {
                    ($node = $(this).parents(".node")).removeClass("hover"), $node.addClass("focus");
                });
            });
        }
        function startTour() {
            var $screen, $img, arr, arrImg = (arr = [], $nodes.each(function() {
                $screen = $(this), ($screen = $screen.find(".screen")).length && $screen.find("img").each(function(i) {
                    ($img = $(this)).attr("src") && arr.push($img.attr("src"));
                });
            }), arr);
            arrImg.length ? function(urls, fn) {
                if (urls && urls.length) for (var img, src, loaded = 0, i = 0, j = urls.length; i < j; i++) img = new Image(), 
                src = urls[i], img.onload = function() {
                    ++loaded == urls.length && fn && fn();
                }, img.onerror = fn, img.onabort = fn, img.src = src;
            }(arrImg, function() {
                goto(0);
            }) : goto(0);
        }
        var $body, $nodes, $navBtns, $this = $(this), goto = function(i) {
            var $node, timer;
            -1 < i && i < $nodes.length && (i > $this.data("gatedStartNode") && 0 == $this.data("emailCaptured") || (timer = !isNaN(i) && 0 <= i ? i : $this.data("curNode"), 
            $this.data("curNode", timer), $node = $nodes.eq(i), document.location.hash = $node.attr("id"), 
            $node.hasClass("dark-color-scheme") ? $this.addClass("dark-color-scheme") : $this.removeClass("dark-color-scheme"), 
            $node.hasClass("hide-logo") ? $this.find(".logo").addClass("hide") : $this.find(".logo").removeClass("hide"), 
            $node.hasClass("hide-exit-btn") ? $this.find(".btn-exit:not(.target)").addClass("hide") : $this.find(".btn-exit:not(.target)").removeClass("hide"), 
            clearTimeout($this.data("nodeTimer")), (timer = $node.data("delay-next")) && !isNaN(timer) && 0 <= timer && (timer = setTimeout(function() {
                goto(i + 1);
            }, 1e3 * timer), $this.data("nodeTimer", timer)), opt.debug && ($navBtns.removeClass("active"), 
            $navBtns.eq(i).addClass("active")), $nodes.removeClass("show"), $node.addClass("show")));
        }, stopVideo = function($node) {
            ytplayer = $node.data("player"), ytplayer && ytplayer.stopVideo();
        };
        $body = $("body"), $this.data("curNode", 0), $this.data("nodeTimer", 0), $this.data("gatedStartNode", 0), 
        initNodes(), function() {
            $this.data("emailCaptured", !0);
            var $emailField, aniTimer, $emailCaptureForm = $nodes.eq(0).find("#" + opt.formId + " form");
            $emailCaptureForm.length && ($this.data("emailCaptured", !1), $this.data("gatedStartNode", $emailCaptureForm.parents(".node").index() + 1), 
            ($emailField = $emailCaptureForm.find("[name=" + opt.emailFieldName + "]")).length ? $emailField.attr("placeholder") : opt.formError, 
            aniTimer = 0, $emailField.length && $emailField.on("mouseenter", function() {
                $emailField.removeClass("flash-field"), clearTimeout(aniTimer);
            }), $emailCaptureForm.on("submit", function(aniCount) {
                var aniDuration, aniDelay;
                return aniCount.preventDefault(), 5 < $emailField.val().length && 0 < $emailField.val().indexOf("@") && $this.data("emailCaptured", !0), 
                $this.data("emailCaptured") ? goto(1) : (opt.formError, $emailField.length && ($emailField.addClass("flash-field"), 
                aniDuration = parseFloat($emailField.css("animation-duration")), aniDelay = parseFloat($emailField.css("animation-delay")), 
                aniCount = parseInt($emailField.css("animation-iteration-count")), aniTimer = setTimeout(function() {
                    $emailField.removeClass("flash-field"), $emailField.val("");
                }, 1e3 * (aniDuration * aniCount + aniDelay) + 300))), !1;
            }));
        }(), window.onhashchange = gotoHash, function(params) {
            params = params || {};
            var hasVideos = $nodes.find(".video").length;
            function onPlayerReady(e) {
                e.target.setVolume(50);
            }
            function onPlayerStateChange(e) {
                var i = $this.data("curNode");
                $node = $nodes.eq(i), 1 == e.data ? $body.addClass("video-playing") : $body.removeClass("video-playing"), 
                0 == e.data && setTimeout(function() {
                    next(i);
                }, 5e3);
            }
            setYouTubePrivacyEnhancedMode = function(url) {
                return url.replace(/(^https?\:\/\/)([^\/*])+(\/*)/i, "$1www.youtube-nocookie.com$3");
            }, parseYouTubeVideoId = function(match) {
                match = match.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/);
                return !(!match || 11 != match[7].length) && match[7];
            }, urlAddParams = function(url, params) {
                var qsStart = 0 < url.indexOf("?") ? "&" : "?";
                for (p in params) url += qsStart + p + "=" + params[p], qsStart = "&";
                return url;
            }, loadYouTubeApi = function(url, params) {
                var tag = document.createElement("script");
                tag.src = "//www.youtube.com/iframe_api", tag.type = "text/javascript", tag.id = "yt-script", 
                document.getElementsByTagName("head")[0].appendChild(tag);
            }, window.onYouTubePlayerAPIReady = function() {
                $nodes.each(function(playerId) {
                    var src, ytplayer, $node = $nodes.eq(playerId);
                    $video = $node.find(".video"), $video.length && (src = $video.data("youtube-url"), 
                    ytplayer = parseYouTubeVideoId(src), playerId = "yt-" + $node.attr("id"), $video.attr("id", playerId), 
                    src = setYouTubePrivacyEnhancedMode(src), src = urlAddParams(src, params), ytplayer = new YT.Player(playerId, {
                        videoId: ytplayer,
                        wmode: "opaque",
                        playerVars: params,
                        events: {
                            onReady: onPlayerReady,
                            onStateChange: onPlayerStateChange
                        }
                    }), $node.data("player", ytplayer));
                });
            }, hasVideos && loadYouTubeApi();
        }({
            enablejsapi: 1,
            wmode: "opaque"
        }), opt.debug && function() {
            $this.addClass("debug"), $this.append('<div id="navbar"/>');
            var $navbar = $this.find("#navbar");
            $nodes.each(function(i) {
                $navbar.append("<div/>");
            }), ($navBtns = $navbar.find("> div")).on("click", function() {
                goto($(this).index());
            }), $(document).on("keydown", function(e) {
                switch (e.which) {
                  case 37:
                    return prev($this.data("curNode")), !1;

                  case 39:
                    return next($this.data("curNode")), !1;
                }
            });
        }(), $body.addClass("zia-loaded"), startTour();
    };
}(jQuery);