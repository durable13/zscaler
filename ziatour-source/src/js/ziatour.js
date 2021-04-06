/* Zia Tour Script Loader v1.0
   Author: Erich Richter <studio@erichrichter.com>
   Date: 2021.03.23

   The function ziaTour() loads and initializes the required tour scripts and stylesheets:
     - zia-tour.min.css
     - jquery.ziatour.min.js
     - https://code.jquery.com/jquery-3.5.1.min.js *
     - tour-content.htm

   While these JS and CSS files could be loaded individually in the page header this
   allows the tour to be loaded on any page with a single line of code:

   Example: <script src="lib/js/zia-tour.min.js"></script>

   * If jQuery isn't already running on this page the plugin loader will load an instance of Jquery.

   Parameters:

     cache (boolean, optional) - false to force reloading of all files when editing scripts and CSS
     debug (boolean, optional) - true to enable navbar and outline transparent click targets when editing

     DEV: ziaTour({ cache:false, debug:true });
     PRODUCTION: ziaTour({ cache:true, debug:false });

	*/

function ziaTour(params){

	// cache: Set to false to prevent browser caching of scripts/CSS.
	params.cache = params.cache===true ? true: false;

	// debug: Set to true to enable navbar and outline transparent click targets.
	params.debug = params.debug===true ? true: false;

	// File URLs
	var
		tourCss = 'lib/css/ziatour.css', // or zia-tour.min.css
		tourPlugin = 'lib/js/jquery.ziatour.min.js',
		tourContent = 'htm/tour-content.htm',
		jquery = '//code.jquery.com/jquery-3.5.1.min.js',

		timestamp = params.cache ? '' : ('?'+Date.now()),

		loadCss = function (url, timestamp){
			var d = document.createElement('link');
			d.setAttribute('rel', 'stylesheet');
			d.setAttribute('type', 'text/css');
			d.setAttribute('href', url + timestamp);
			document.getElementsByTagName('head')[0].appendChild(d);
		},

		loadScript = function (url, params, callback){
			d = document.createElement('script');
			d.type = 'text/javascript';
			d.src = url + timestamp;
			el = document.getElementsByTagName('script');
			el[0].parentNode.insertBefore(d, el[0]);
			if(callback) {
				d.onload = d.onreadystatechange = function() {
					if(!this.readyState || this.readyState == 'complete' ){
						callback(params);
					}
				}
			}
		}


	// Load the tour CSS first.
	loadCss( tourCss, timestamp );

	// Check for jQuery. If there isn't an instance load one.
	// When all scripts have been loaded the callback tourInit() starts the tour.
	window.addEventListener('load', (event) => {

		if( window.jQuery ) {

			// Load the tour plugin.
			loadScript( tourPlugin, params, ziaTourInit );

		} else {

			// Load JQuery first, then load the tour plugin.
			loadScript( jquery, params, function(params){
				loadScript( tourPlugin, params, ziaTourInit );
			});
		}
	});

}


/* Initialize the tour object and start the tour. */
ziaTourInit = function(params){

	$('body').wrapInner('<div class="ziatour-existing-content"/>');
	$('body').append('<div id="ziatour"/>');

	// Append the tour content.
	var timestamp = params.cache ? '' : ('?'+Date.now());
	$('#ziatour').load( 'htm/tour-content.htm' + timestamp, function() {

		// Start the tour.
		$('#ziatour').ziatour({
			debug: params.debug, // Set to true to enable the debuggin navbar and show visible outlines on click targets.
			formId: 'email-capture', // any unique form ID
			emailFieldName: 'email', // Marketo form field name
			formError: 'Please enter a valid business email.' // the placeholder text that shows if a user make an invalid entry
		});
	});
}

ziaTour({ cache:true, debug:false });

