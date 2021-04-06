function ziaTour(params) {
    params.cache = !0 === params.cache, params.debug = !0 === params.debug;
    function loadScript(url, params, callback) {
        d = document.createElement("script"), d.type = "text/javascript", d.src = url + timestamp, 
        el = document.getElementsByTagName("script"), el[0].parentNode.insertBefore(d, el[0]), 
        callback && (d.onload = d.onreadystatechange = function() {
            this.readyState && "complete" != this.readyState || callback(params);
        });
    }
    var timestamp = params.cache ? "" : "?" + Date.now();
    !function(url, timestamp) {
        var d = document.createElement("link");
        d.setAttribute("rel", "stylesheet"), d.setAttribute("type", "text/css"), d.setAttribute("href", url + timestamp), 
        document.getElementsByTagName("head")[0].appendChild(d);
    }("lib/css/ziatour.css", timestamp), window.addEventListener("load", event => {
        window.jQuery ? loadScript("lib/js/jquery.ziatour.min.js", params, ziaTourInit) : loadScript("//code.jquery.com/jquery-3.5.1.min.js", params, function(params) {
            loadScript("lib/js/jquery.ziatour.min.js", params, ziaTourInit);
        });
    });
}

ziaTour({
    cache: !0,
    debug: !(ziaTourInit = function(params) {
        $("body").wrapInner('<div class="ziatour-existing-content"/>'), $("body").append('<div id="ziatour"/>');
        var timestamp = params.cache ? "" : "?" + Date.now();
        $("#ziatour").load("htm/tour-content.htm" + timestamp, function() {
            $("#ziatour").ziatour({
                debug: params.debug,
                formId: "email-capture",
                emailFieldName: "email",
                formError: "Please enter a valid business email."
            });
        });
    })
});