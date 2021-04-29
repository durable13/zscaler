function ziaTour(params) {
    params.cache = params.cache === true ? true : false;
    params.debug = params.debug === true ? true : false;
    var tourCss = "lib/css/ziatour.css", tourPlugin = "lib/js/jquery.ziatour.js", tourContent = "tour-content.htm", marketoScript = "//info.zscaler.com/js/forms2/js/forms2.min.js", jquery = "//code.jquery.com/jquery-3.5.1.min.js", timestamp = params.cache ? "" : "?" + Date.now(), loadCss = function(url, timestamp) {
        var d = document.createElement("link");
        d.setAttribute("rel", "stylesheet");
        d.setAttribute("type", "text/css");
        d.setAttribute("href", url + timestamp);
        document.getElementsByTagName("head")[0].appendChild(d);
    }, loadScript = function(url, params, callback) {
        d = document.createElement("script");
        d.type = "text/javascript";
        d.src = url + timestamp;
        el = document.getElementsByTagName("script");
        el[0].parentNode.insertBefore(d, el[0]);
        if (callback) {
            d.onload = d.onreadystatechange = function() {
                if (!this.readyState || this.readyState == "complete") {
                    callback(params);
                }
            };
        }
    };
    loadCss(tourCss, timestamp);
    window.addEventListener("load", event => {
        params.tourContent = tourContent;
        if (window.jQuery) {
            loadScript(marketoScript, params, function() {
                loadScript(tourPlugin, params, ziaTourInit);
            });
        } else {
            loadScript(jquery, params, function(params) {
                loadScript(marketoScript, params, function() {
                    loadScript(tourPlugin, params, ziaTourInit);
                });
            });
        }
    });
}

ziaTourInit = function(params) {
    $("body").wrapInner('<div class="ziatour-existing-content"/>');
    $("body").append('<div id="ziatour"/>');
    var timestamp = params.cache ? "" : "?" + Date.now();
    $("#ziatour").load(params.tourContent + timestamp, function() {
        $("#ziatour").ziatour({
            debug: params.debug
        });
    });
};

ziaTour({
    cache: true,
    debug: false
});