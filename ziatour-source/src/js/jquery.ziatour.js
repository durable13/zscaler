/* Zia Tour Plugin v1.0
   Author: Erich Richter <studio@erichrichter.com>
   Date: 2021.03.23
   */

!function($){

	$.fn.ziatour = function(opt){

		defaults = {
			debug: false, // Set to true to enable the debugging navbar and show visible outlines on click targets.
			formId: 'email-capture', // any unique form ID
			emailFieldName: 'email', // Marketo form field name
			formError: 'Please enter a valid business email.' // the placeholder text that shows if a user make an invalid entry
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

				if( i>-1 && i<$nodes.length) {

					// Stop here if the tour requires email validation and the user hasn't submitted the form yet.
					if( i > $this.data('gatedStartNode') && $this.data('emailCaptured') == false ) {
						return;
					}

					curNode = (!isNaN(i) && i >= 0) ? i : $this.data('curNode');
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
			initEmailCapture = function(){

				$this.data('emailCaptured',true); // Default is true, in case there is no capture form.
				var $emailCaptureForm = $nodes.eq(0).find('#'+opt.formId+' form');

				if( $emailCaptureForm.length ) {

					// We are doing an email capture so set emailCaptured to false. A successful login will reset this to true.
					$this.data('emailCaptured',false);

					/*	Locate the node this form is in and set gatedStartNode to the NEXT node index.
							That's where the gated section fo the tour begins.
							This value is used by goto() to determine whether to proceed or not.
							*/
					$this.data('gatedStartNode', $emailCaptureForm.parents('.node').index()+1 );

					var
						$emailField = $emailCaptureForm.find('[name='+opt.emailFieldName+']'),
						placeholderText = $emailField.length? $emailField.attr('placeholder') : opt.formError,
						aniTimer = 0;

					if( $emailField.length ) {
						$emailField.on('mouseenter', function(){
							$emailField.removeClass('flash-field');
							clearTimeout(aniTimer);
						});
					}

					$emailCaptureForm.on('submit',function(e){

						e.preventDefault();

						// TEMPORARY poor-man's validation. REMOVE when Marketo is plugged in.
						if( $emailField.val().length > 5 && $emailField.val().indexOf('@')>0 ) $this.data('emailCaptured',true);

						if( $this.data('emailCaptured') ) {
							goto(1);
						}
						else {

							// Parse Marketo response into a short error string.
							var errStr = opt.formError;
							if( $emailField.length ) {

								// Add CSS animation to get the user's attention.
								$emailField.addClass('flash-field');
								var
									aniDuration = parseFloat($emailField.css('animation-duration')),
									aniDelay = parseFloat($emailField.css('animation-delay')),
									aniCount = parseInt($emailField.css('animation-iteration-count')),
									flashAniDurationMs = ((aniDuration * aniCount) + aniDelay) * 1000 + 300;

								aniTimer = setTimeout( function(){
									$emailField.removeClass('flash-field');
									$emailField.val('');
								}, flashAniDurationMs);
							}
						}
						return false;
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

							// console.log('params: '+ JSON.stringify(params));

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

				var
					$node,
					isMobile = checkMobile();

				$this.find('#desktop').addClass('nodes');
				$this.find('#mobile').addClass('nodes');
				$nodes = isMobile ? $this.find('#mobile > div') : $this.find('#desktop > div');

				$nodes.each( function(i){

					$node = $nodes.eq(i);
					$node.addClass('node');

					// Tooltips need an inner div for CSS filter:drop-shadow to work on CSS clipped shapes
					// (tooltips have a clipped upper left corner)
					$node.find('.tooltip').wrapInner('<div class="shape"><div class="text"/></div>');

					$node.find('.target').on('click', function(){
						$node = $(this).parents('.node');
						$node.removeClass('hover');
						$node.removeClass('focus');
						next(i);
					});
					$node.find('.btn-back').on('click', function(){
						var goToId = $(this).data('goto');
						if( goToId && $nodes.siblings('#'+goToId).length ) {
							var idx = $nodes.siblings('#'+goToId).index();
							i = idx > 0 ? idx+1 : i;
						}
						prev(i);
					});
					$node.find('.target').hover(
						function() {
							$node = $(this).parents('.node');
							$node.removeClass('focus');
							$node.addClass('hover');
						}, function() {
							$node = $(this).parents('.node');
							$node.removeClass('hover');
						}
					);
					$node.find('.target').on('mousedown',
						function() {
							$node = $(this).parents('.node');
							$node.removeClass('hover');
							$node.addClass('focus');
						}
					);
				});
			},

			/* Show the first node. */
			startTour = function(){
				var arrImg = listImages();
				if( arrImg.length ) {
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

 				/* nodeTimer is used to cancel already running node/page timed transitions (if present) */
				$this.data('nodeTimer',0);

 				/*	gatedStartNode tells the tour which nodes are gated/locked prior to email capture.
						initEmailCapture looks for the email signup form abd sets this number to the node index
						immediately AFTER the email capture form (eg: everything after that node is gated).
						If this is never set by initEmailCapture to a number higher than 0 it means nodes
						are not gated or emailcapture is not being used.
						*/
				$this.data('gatedStartNode',0);


				/* Initialize node click targets and various node element hover states. */
				initNodes();

				/* Optional tour login/gating, processes the Marketo form callback. */
				initEmailCapture();

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

