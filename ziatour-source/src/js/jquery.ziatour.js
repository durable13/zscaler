/* Zia Tour Plugin v1.0
   Author: Erich Richter <studio@erichrichter.com>
   Date: 2021.03.23
   */
 
!function($){

	$.fn.ziatour = function(opt){

		defaults = {
			debug: false // Set to true to enable the debugging navbar and show visible outlines on click targets.
		},
		opt = $.extend(defaults, opt);

		var
			$this = $(this),
			$body,
			$nodes,
			$navBtns,
			videoId,


			/* goto() is the tour workhorse. It handles the node/page changes and triggers various node related actions. */
			goto = function(i){

				var $node, curNode;
				if( i >= 0 && i<$nodes.length) {

					// Stop here if the tour requires email validation and the user hasn't submitted the form yet.
					if( i >= $this.data('gatedStartNode') && $this.data('isLoggedIn') == false ) {
						return;
					}

					curNode = !isNaN(i) ? i : 1;
					$this.data('curNode',curNode);

					$node = $nodes.eq(i);

					/* Set location bar hash to the current node id, gotoHash uses this to navigate using the browser 'back' button. */
					document.location.hash = $node.attr('id');

					/*	Adjust various elements for dark or light backgrounds.
						'dark-color-scheme' is a node-level CSS class used to adjust various elements for dark or light backgrounds.
						When present it tells us to add/remove a corresponding 'dark-color-scheme' to the top-level tour element.
						*/
					if($node.hasClass('dark-color-scheme')) {
						$this.addClass('dark-color-scheme');
					} else {
						$this.removeClass('dark-color-scheme');
					}

					/*	Some nodes don't require the top-level tour logo.
							'hide-logo' is a node-level CSS class used to flag this show/hide toggle.
							When present it tells us to add/remove a corresponding '.hide' class to the logo.
							*/
					if($node.hasClass('hide-logo')){
						$this.find('.logo').addClass('hide');
					}	else {
						$this.find('.logo').removeClass('hide');
					}

					/*	Some nodes don't require the top-level tour exit button.
							'hide-exit-btn' is a node-level CSS class used to flag thisshow/hide toggle.
							When present it tells us to add/remove a corresponding '.hide' class to the exit button.
							*/
					if($node.hasClass('hide-exit-btn')){
						$this.find('.btn-exit:not(.target)').addClass('hide');
					} else {
						$this.find('.btn-exit:not(.target)').removeClass('hide');
					}

					/* If a node has a data-delay-next="n" attribute the tour will automatically advance to the next node in 'n' seconds. */
					clearTimeout( $this.data('nodeTimer') );
					var nextSecs = $node.data('delay-next');
					if(nextSecs && !isNaN(nextSecs) && nextSecs >=0 ) {
						var timer = setTimeout( function(){ goto(i+1); }, nextSecs * 1000);
						$this.data('nodeTimer', timer);
					}

					// Hilite the corresponding nav button (applies to debug mode only)
					if(opt.debug) {
						$navBtns.removeClass('active');
						$navBtns.eq(i).addClass('active');
					}

					/* All done, now hide the previous node and show the current node. */
					$nodes.removeClass('show'); // hide all
					$node.addClass('show'); // show current

				}
			},

			next = function(i){
				stopVideo( $nodes.eq(i) );
				goto(i+1);
			},

			prev = function(i){
				goto(i-1);
			},

			/* Allows the browser to read the URL hash and navigate the tour to a specific node.  */
			gotoHash = function() {

				var $node;
				$nodes.each(function(){
					if(location.hash === '#'+$(this).attr('id')){

						$node = $(this);

						// This line prevents a double call when goto() is called by a user click.
						if( $this.data('curNode') == $node.index()) return false;

						$this.data('curNode', $node.index());
						goto( $this.data('curNode') );
						return false;
					}
				});
			},

			/* Adds hashchange event listener to enable browser back button functionality. */
			initBackButtonSafe = function(){
				window.onhashchange = gotoHash;
			},

			// Process Marketo script response here.
			initLoginForm = function(){

				$this.data('isLoggedIn',true); // Default is true in case there is no capture form in use.

				var
					$loginContainer = $('.login-container'),
					$primaryLoginContainer = $loginContainer.eq(0),
					$form = $primaryLoginContainer.find('form');

				if($form.length){

					// Initialize the Marketo form.
					MktoForms2.loadForm('//info.zscaler.com', '306-ZEJ-256', 4776, function(form){


						// Change the submit button text to 'continue'.
						$form.find('.mktoButton[type=submit]').html('continue');

						// Set the gatedStartNode to the node immediately following whatever node the Marketo form is on.
						// This tells goto() which nodes are locked prior to submitting the form.

						if(!$this.data('isMobile')) {
							$this.data('gatedStartNode', $primaryLoginContainer.parents('.node').index()+1 );
						}
						else {
							var $mobileLoginContainer = $loginContainer.eq(1);
							if($mobileLoginContainer.length){

								$this.data('gatedStartNode', $mobileLoginContainer.parents('.node').index()+1 );

								// Move the form to its mobile node.
								$mobileLoginContainer.append($form);
							}
						}

						// We are doing an email capture so set emailCaptured to false. A successful login will reset this to true.
						$this.data('isLoggedIn',false);

						form.onSuccess(function(values, followUpUrl) {
							$this.data('isLoggedIn',true);
							goto($this.data('gatedStartNode'));
							return false;
						});

						// Override form validation in debug mode.
						if(opt.debug) {
							$form.on('submit',function(e){
								e.preventDefault();
								$this.data('isLoggedIn',true);
								goto($this.data('gatedStartNode'));
								return false;
							});
						}

					});
				}
			},

			preloadImgs = function(urls, fn) {

				if( !urls || !urls.length ) return;
				var i, j, loaded = 0;

				for( i=0, j=urls.length; i<j; i++ ) {
					( function (img, src) {
						img.onload = function () {              
 							if (++loaded == urls.length && fn) fn();
						};
            img.onerror = fn;
            img.onabort = fn;
						img.src = src;
					} ( new Image(), urls[i] ) );
				}
			},

			listImages = function() {
				var
					$node,
					$screen,
					$img,
					arr = [];
				$nodes.each( function(){

					$node = $(this);
					$screen = $node.find('.screen');
					if($screen.length) {
						$screen.find('img').each( function(i){
							$img = $(this);
							if( $img.attr('src') ) {
								arr.push( $img.attr('src') );
							}
						});
					}
				});
				return arr;
			},

			initVideos = function(params){

				params = params ? params : {};
				var hasVideos = $nodes.find('.video').length;

				/*	This no-cookie call to YouTube has the advantage of hiding the
						'watch later' and 'share' links in the upper right corner of the player.
						*/
				setYouTubePrivacyEnhancedMode = function(url){
					return url.replace( /(^https?\:\/\/)([^\/*])+(\/*)/i , '$1'+'www.youtube-nocookie.com'+'$3' );
				}

				parseYouTubeVideoId = function(url){
					var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
					var match = url.match(regExp);
					return (match&&match[7].length==11)? match[7] : false;
				}

				urlAddParams = function(url,params){
					var qsStart = url.indexOf('?')>0 ? '&':'?';
					for(p in params) {
						url += qsStart + p+'='+params[p];
						qsStart = '&';
					}
					return url;
				}

				loadYouTubeApi = function(url,params){
					var tag = document.createElement('script');
					tag.src = '//www.youtube.com/iframe_api';
					tag.type = 'text/javascript';
					tag.id = 'yt-script';
					document.getElementsByTagName('head')[0].appendChild(tag);
				}

				function onPlayerReady(e){
					e.target.setVolume(50);
				}

				function onPlayerStateChange(e){
 
					var
						i = $this.data('curNode');
						$node = $nodes.eq(i);

					// e.data: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued).

					// This allows specific CSS styling for when the player is running.
					if(e.data == 1){
						$body.addClass('video-playing');
					}
					else {
						$body.removeClass('video-playing');
					}

					// Automatically go to the next node when the video finishes.
					if(e.data == 0){
						setTimeout( function(){ next(i) }, 5000);
					}

				}

				window.onYouTubePlayerAPIReady = function() {

					$nodes.each( function(i){

						var
							$node = $nodes.eq(i);
							$video = $node.find('.video');

						if($video.length) {

							var
								src = $video.data('youtube-url'), // URL, a data attribute on the HTML  div.video tag 
								videoId = parseYouTubeVideoId(src), // the YouTube clip ID
								playerId = 'yt-'+$node.attr('id'); // a unique ID for the iFrame

							$video.attr('id', playerId);

							// The two would be useful if embedding the video as an iFrame.
							src = setYouTubePrivacyEnhancedMode(src); // PrivacyEnhancedMode removes 'watch later' and 'share' links. 
							src = urlAddParams(src,params);

							var ytplayer = new YT.Player(playerId, {
								videoId: videoId,
								wmode: 'opaque',
								playerVars: params,
								events: {
									'onReady': onPlayerReady,
									'onStateChange': onPlayerStateChange
								}
							});

							// Pass a reference to this player to the $node so we can use it elsewhere, not just on the API callbacks.
							$node.data('player',ytplayer);
						}
					});
				}

				if(hasVideos) loadYouTubeApi();

			},

			stopVideo = function($node){
				ytplayer = $node.data('player');
				if(ytplayer) {
					ytplayer.stopVideo();
				}
			},


			/*	Use CSS property testing on media query to determine mobile state.
					This allows the plugin to rely on the CSS mobile breakpoint rather
					than scripting a duplicate breakpoint test here.
					*/
			checkMobile = function(){
				if($this.find('#desktop').css('display') == 'none') return true;
				return false;
			},

			/* Loop over nodes and initialize click and hover states for various node elements. */
			initNodes = function(){

				$this.find('#desktop').addClass('nodes');
				$this.find('#mobile').addClass('nodes');
				$nodes = $this.data('isMobile') ? $this.find('#mobile > div') : $this.find('#desktop > div');

				var $node;
				$nodes.each( function(i){

					$node = $nodes.eq(i);
					$node.addClass('node');

					// Tooltips need an inner div for CSS filter:drop-shadow to work on CSS clipped shapes
					// (tooltips have a clipped upper left corner)
					$node.find('.tooltip').wrapInner('<div class="shape"><div class="text"/></div>');

					$node.find('.target').on('click', function(){
						$node = $(this).parents('.node');
						$node.removeClass('focus');
						var idx = $node.index();
						next(idx);
					});
					$node.find('.target').hover(
						function() {
							$node = $(this).parents('.node');
							$node.addClass('hover');
						}, function() {
							$node = $(this).parents('.node');
							$node.removeClass('hover');
						}
					);
					$node.find('.target').on('mousedown',
						function() {
							$node = $(this).parents('.node');
							if($node.find('img.focus').length){
								$node.removeClass('hover');
								$node.addClass('focus');
							}
						}
					);
					$node.find('.btn-back').on('click', function(){
						var goToId = $(this).data('goto');
						if( goToId && goToId!='undefined' && $nodes.siblings('#'+goToId).length ) {
							var idx = $nodes.siblings('#'+goToId).index();
							i = idx > 0 ? idx+1 : i;
						}
						prev(i);
					});
				});
			},

			/* Show the first node. */
			startTour = function(){

				var arrImg = listImages();

				// If we are reloading images wait until they are all laoded before starting tour.
				if(arrImg.length) {
					preloadImgs(arrImg, function(){
						goto(0);
					});
				}
				else {
					goto(0);
				}
			},

			/*	This adds a handy navbar at the bottom of the screen and adds keyboard right-left
					arrow navigation for jumping to specific nodes.
					It also enables CSS classes that add a visible outline to the transparent click targets
					so they can be adjusted more easily when background images are changed.
					This has to be called after nodes have been initialized.
					This is toggled on and off with the plugin parameter 'debug:false'.
					DEV only, NOT for production.
					*/
			initDebugMode = function(){

				$this.addClass('debug');

				$this.append('<div id="navbar"/>');
				var $navbar = $this.find('#navbar');
				$nodes.each( function(i){ $navbar.append('<div/>'); });
				$navBtns = $navbar.find('> div');

				$navBtns.on('click',function(){
					goto( $(this).index() );
				});

				$(document).on('keydown', function(e) {
					switch (e.which) {
						case 37: { /* arrow left */
							prev( $this.data('curNode') );
							return false;
							break;
						}
						case 39: { /* arrow right */
							next( $this.data('curNode') );
							return false;
							break;
						}
					}
				});
			},

			init = function(){

				// Global vars

				$body = $('body');

 				/* curNode tracks which node we are currently on. */
				$this.data('curNode',0);

 				/* isMobile, A global to help manage responsive interface. */
				$this.data('isMobile',checkMobile());

 				/* nodeTimer is used to cancel already running node/page timed transitions (if present) */
				$this.data('nodeTimer',0);

 				/*	gatedStartNode tells the tour which nodes are gated/locked prior to email capture.
						initLoginForm looks for the email signup form and sets this number to the node index
						immediately AFTER the email capture form (eg: everything after that node is gated).
						If emailcapture is not being used this does nothing.
						*/
				$this.data('gatedStartNode',0);


				/* Initialize node click targets and various node element hover states. */
				initNodes();

				/* Optional tour login/gating, processes the Marketo form callback. */
				initLoginForm();

				/* Enable browser back button functionality. */
				initBackButtonSafe();

				// Initialize YouTube video with YouTube API parameters.
				initVideos({
					'enablejsapi': 1, /* required */
					'wmode': 'opaque' /* required */
					});

				/* Debug mode adds a handy navbar and outlines the transparent click targets for easy editing. */
				if(opt.debug) initDebugMode();

				// Various CSS classes depend on this top level class name.
				$body.addClass('zia-loaded');

				startTour();

			}

		init();
	}
	return this;
}(jQuery);
