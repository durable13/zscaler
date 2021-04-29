!function($) {
    $.fn.ziatour = function(opt) {
        defaults = {
            debug: false
        }, opt = $.extend(defaults, opt);
        var $this = $(this), $body, $nodes, $navBtns, videoId, goto = function(i) {
            var $node, curNode;
            if (i >= 0 && i < $nodes.length) {
                if (i >= $this.data("gatedStartNode") && $this.data("isLoggedIn") == false) {
                    return;
                }
                curNode = !isNaN(i) ? i : 1;
                $this.data("curNode", curNode);
                $node = $nodes.eq(i);
                document.location.hash = $node.attr("id");
                if ($node.hasClass("dark-color-scheme")) {
                    $this.addClass("dark-color-scheme");
                } else {
                    $this.removeClass("dark-color-scheme");
                }
                if ($node.hasClass("hide-logo")) {
                    $this.find(".logo").addClass("hide");
                } else {
                    $this.find(".logo").removeClass("hide");
                }
                if ($node.hasClass("hide-exit-btn")) {
                    $this.find(".btn-exit:not(.target)").addClass("hide");
                } else {
                    $this.find(".btn-exit:not(.target)").removeClass("hide");
                }
                clearTimeout($this.data("nodeTimer"));
                var nextSecs = $node.data("delay-next");
                if (nextSecs && !isNaN(nextSecs) && nextSecs >= 0) {
                    var timer = setTimeout(function() {
                        goto(i + 1);
                    }, nextSecs * 1e3);
                    $this.data("nodeTimer", timer);
                }
                if (opt.debug) {
                    $navBtns.removeClass("active");
                    $navBtns.eq(i).addClass("active");
                }
                $nodes.removeClass("show");
                $node.addClass("show");
            }
        }, next = function(i) {
            stopVideo($nodes.eq(i));
            goto(i + 1);
        }, prev = function(i) {
            goto(i - 1);
        }, gotoHash = function() {
            var $node;
            $nodes.each(function() {
                if (location.hash === "#" + $(this).attr("id")) {
                    $node = $(this);
                    if ($this.data("curNode") == $node.index()) return false;
                    $this.data("curNode", $node.index());
                    goto($this.data("curNode"));
                    return false;
                }
            });
        }, initBackButtonSafe = function() {
            window.onhashchange = gotoHash;
        }, initLoginForm = function() {
            $this.data("isLoggedIn", true);
            var $loginContainer = $(".login-container"), $primaryLoginContainer = $loginContainer.eq(0), $form = $primaryLoginContainer.find("form");
            if ($form.length) {
                MktoForms2.loadForm("//info.zscaler.com", "306-ZEJ-256", 4776, function(form) {
                    $form.find(".mktoButton[type=submit]").html("continue");
                    if (!$this.data("isMobile")) {
                        $this.data("gatedStartNode", $primaryLoginContainer.parents(".node").index() + 1);
                    } else {
                        var $mobileLoginContainer = $loginContainer.eq(1);
                        if ($mobileLoginContainer.length) {
                            $this.data("gatedStartNode", $mobileLoginContainer.parents(".node").index() + 1);
                            $mobileLoginContainer.append($form);
                        }
                    }
                    $this.data("isLoggedIn", false);
                    form.onSuccess(function(values, followUpUrl) {
                        $this.data("isLoggedIn", true);
                        goto($this.data("gatedStartNode"));
                        return false;
                    });
                    if (opt.debug) {
                        $form.on("submit", function(e) {
                            e.preventDefault();
                            $this.data("isLoggedIn", true);
                            goto($this.data("gatedStartNode"));
                            return false;
                        });
                    }
                });
            }
        }, preloadImgs = function(urls, fn) {
            if (!urls || !urls.length) return;
            var i, j, loaded = 0;
            for (i = 0, j = urls.length; i < j; i++) {
                (function(img, src) {
                    img.onload = function() {
                        if (++loaded == urls.length && fn) fn();
                    };
                    img.onerror = fn;
                    img.onabort = fn;
                    img.src = src;
                })(new Image(), urls[i]);
            }
        }, listImages = function() {
            var $node, $screen, $img, arr = [];
            $nodes.each(function() {
                $node = $(this);
                $screen = $node.find(".screen");
                if ($screen.length) {
                    $screen.find("img").each(function(i) {
                        $img = $(this);
                        if ($img.attr("src")) {
                            arr.push($img.attr("src"));
                        }
                    });
                }
            });
            return arr;
        }, initVideos = function(params) {
            params = params ? params : {};
            var hasVideos = $nodes.find(".video").length;
            setYouTubePrivacyEnhancedMode = function(url) {
                return url.replace(/(^https?\:\/\/)([^\/*])+(\/*)/i, "$1" + "www.youtube-nocookie.com" + "$3");
            };
            parseYouTubeVideoId = function(url) {
                var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
                var match = url.match(regExp);
                return match && match[7].length == 11 ? match[7] : false;
            };
            urlAddParams = function(url, params) {
                var qsStart = url.indexOf("?") > 0 ? "&" : "?";
                for (p in params) {
                    url += qsStart + p + "=" + params[p];
                    qsStart = "&";
                }
                return url;
            };
            loadYouTubeApi = function(url, params) {
                var tag = document.createElement("script");
                tag.src = "//www.youtube.com/iframe_api";
                tag.type = "text/javascript";
                tag.id = "yt-script";
                document.getElementsByTagName("head")[0].appendChild(tag);
            };
            function onPlayerReady(e) {
                e.target.setVolume(50);
            }
            function onPlayerStateChange(e) {
                var i = $this.data("curNode");
                $node = $nodes.eq(i);
                if (e.data == 1) {
                    $body.addClass("video-playing");
                } else {
                    $body.removeClass("video-playing");
                }
                if (e.data == 0) {
                    setTimeout(function() {
                        next(i);
                    }, 5e3);
                }
            }
            window.onYouTubePlayerAPIReady = function() {
                $nodes.each(function(i) {
                    var $node = $nodes.eq(i);
                    $video = $node.find(".video");
                    if ($video.length) {
                        var src = $video.data("youtube-url"), videoId = parseYouTubeVideoId(src), playerId = "yt-" + $node.attr("id");
                        $video.attr("id", playerId);
                        src = setYouTubePrivacyEnhancedMode(src);
                        src = urlAddParams(src, params);
                        var ytplayer = new YT.Player(playerId, {
                            videoId: videoId,
                            wmode: "opaque",
                            playerVars: params,
                            events: {
                                onReady: onPlayerReady,
                                onStateChange: onPlayerStateChange
                            }
                        });
                        $node.data("player", ytplayer);
                    }
                });
            };
            if (hasVideos) loadYouTubeApi();
        }, stopVideo = function($node) {
            ytplayer = $node.data("player");
            if (ytplayer) {
                ytplayer.stopVideo();
            }
        }, checkMobile = function() {
            if ($this.find("#desktop").css("display") == "none") return true;
            return false;
        }, initNodes = function() {
            $this.find("#desktop").addClass("nodes");
            $this.find("#mobile").addClass("nodes");
            $nodes = $this.data("isMobile") ? $this.find("#mobile > div") : $this.find("#desktop > div");
            var $node;
            $nodes.each(function(i) {
                $node = $nodes.eq(i);
                $node.addClass("node");
                $node.find(".tooltip").wrapInner('<div class="shape"><div class="text"/></div>');
                $node.find(".target").on("click", function() {
                    $node = $(this).parents(".node");
                    $node.removeClass("focus");
                    next(i);
                });
                $node.find(".target").hover(function() {
                    $node = $(this).parents(".node");
                    $node.addClass("hover");
                }, function() {
                    $node = $(this).parents(".node");
                    $node.removeClass("hover");
                });
                $node.find(".target").on("mousedown", function() {
                    $node = $(this).parents(".node");
                    if ($node.find("img.focus").length) {
                        $node.removeClass("hover");
                        $node.addClass("focus");
                    }
                });
                $node.find(".btn-back").on("click", function() {
                    var goToId = $(this).data("goto");
                    if (goToId && goToId != "undefined" && $nodes.siblings("#" + goToId).length) {
                        var idx = $nodes.siblings("#" + goToId).index();
                        i = idx > 0 ? idx + 1 : i;
                    }
                    prev(i);
                });
            });
        }, startTour = function() {
            var arrImg = listImages();
            if (arrImg.length) {
                preloadImgs(arrImg, function() {
                    goto(0);
                });
            } else {
                goto(0);
            }
        }, initDebugMode = function() {
            $this.addClass("debug");
            $this.append('<div id="navbar"/>');
            var $navbar = $this.find("#navbar");
            $nodes.each(function(i) {
                $navbar.append("<div/>");
            });
            $navBtns = $navbar.find("> div");
            $navBtns.on("click", function() {
                goto($(this).index());
            });
            $(document).on("keydown", function(e) {
                switch (e.which) {
                  case 37:
                    {
                        prev($this.data("curNode"));
                        return false;
                        break;
                    }

                  case 39:
                    {
                        next($this.data("curNode"));
                        return false;
                        break;
                    }
                }
            });
        }, init = function() {
            $body = $("body");
            $this.data("curNode", 0);
            $this.data("isMobile", checkMobile());
            $this.data("nodeTimer", 0);
            $this.data("gatedStartNode", 0);
            initNodes();
            initLoginForm();
            initBackButtonSafe();
            initVideos({
                enablejsapi: 1,
                wmode: "opaque"
            });
            if (opt.debug) initDebugMode();
            $body.addClass("zia-loaded");
            startTour();
        };
        init();
    };
    return this;
}(jQuery);