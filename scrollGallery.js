// bugfix for old ie console
if (typeof console === "undefined" || typeof console.log === "undefined") {
	console = {};
	console.log = function() {};
}
$.fn.scrollGallery = function(options) {
	function ScrollGallery (context, options) {
		options = $.extend(true, {
			vertical: false, // if true vertical if false horizontal
			body: undefined, // (needed) jquery selector of gallery body
			container: undefined, // (needed) jquery selector of gallery container
			animationTime: 200, // animation time in ms
			currentPosition: 0, // if we need start not from start
			containerWidth: 0, // if auto calculating is wrong
			bodyWidth: 0, // if auto calculating is wrong
			step: 0, // if auto calculating is wrong
			buttons: {
				on: false, // enable left and right buttons
				leftButton: undefined, // (needed if on) jquery selector of left button
				rightButton: undefined  // (needed if on) jquery selector of right button
			},
			scrollingOn: true, // enable scrolling by wheel on gallery
			bar: {
				on: false, // enable scrollbar
				scroller: undefined, // (needed if on) jquery selector of scroller
				scrollBar: undefined, // (needed if on) jquery selector of scroll bar
				scrollBarClickMoveToDirectionNotToPoint: false, // if true on scroll bar click will move to 1 step to direction else will move to clicked position
				dragToStep: false, // if true will drag where dragged but stops with auto-alignment by steps
				scrollBarScrolling: false // enable scrolling by wheel on scroll bar 
			} }, options || {});
		// copatibily with older version
		if (options.menuWidth)
			options.containerWidth = options.menuWidth;
		if (options.menuTrackWidth)
			options.bodyWidth = options.menuTrackWidth;
		if (options.time)
			options.animationTime = options.time;
		if (options.buttonOn)
			options.buttons.on = options.buttonOn;
		if (options.leftbtn)
			options.buttons.leftButton = options.leftbtn;
		if (options.rightbtn)
			options.buttons.rightButton = options.rightbtn;
		if (options.withBar)
			options.bar.on = options.withBar;
		if (options.scroller)
			options.bar.scroller = options.scroller;
		if (options.scroller_bar)
			options.bar.scrollBar = options.scroller_bar;
		// options check
		if ($(options.body) && $(options.container) &&
			(!options.buttons.on || (options.buttons.on && $(options.buttons.leftButton) && $(options.buttons.rightButton))) &&
			(!options.bar.on || (options.bar.on && $(options.bar.scroller) && $(options.bar.scrollBar)))) {
			// calculate starting parametres
			var animationTrigger = true, property = '',
				dontmove = false, moveby = '', shift_x,
				scrollBarWidth = 0, scrollerWidth = 0,
				canDrag = false, scrollingLeftTrigger = false,
				scrollingRightTrigger = false, draggedNotClicked = false;
			if (options.vertical) {
				property = 'top';
				if (options.containerWidth == 0)
					options.containerWidth = $(options.container).height();
				if (options.bodyWidth == 0)
					options.bodyWidth = $(options.body).height();
				if (options.step == 0)
					options.step = ($(options.body).children().outerHeight() + 1);
				if (options.bar.on) {
					scrollBarWidth = $(options.bar.scrollBar).height();
					calcInitialScrollParametres();
					$(options.bar.scroller).css({'padding-bottom' : scrollerWidth});
					moveby = 'Y';
				}
			} else {
				property = 'left';
				if (options.containerWidth == 0)
					options.containerWidth = $(options.container).width();
				if (options.bodyWidth == 0)
					options.bodyWidth = $(options.body).width();
				if (options.step == 0)
					options.step = ($(options.body).children().outerWidth() + 1);
				if (options.bar.on) {
					scrollBarWidth = $(options.bar.scrollBar).width();
					calcInitialScrollParametres();
					$(options.bar.scroller).css({'padding-right' : scrollerWidth});
					moveby = 'X';
				}
			}
			options.bodyWidth -= options.containerWidth;
			function calcInitialScrollParametres() {
				scrollerWidth = Math.round((options.containerWidth * scrollBarWidth) / options.bodyWidth);
				scrollerWidth = (scrollerWidth < 8) ? 8 : scrollerWidth;
				scrollerWidth = (scrollerWidth > scrollBarWidth) ? scrollBarWidth : scrollerWidth;
				scrollBarWidth -= scrollerWidth;
			};
			// check gallery size
			if ((options.bodyWidth > 0) && (options.containerWidth > 0)) {
				// for left right buttons
				if (options.buttons.on) {
					setButtons();
					$(context).delegate(options.buttons.leftButton, 'mousedown', function(e) {
						e = $.event.fix(e);
						e.preventDefault();
						scrollingLeftTrigger = true;
						buttonrunLeft();
						function buttonrunLeft () {
							setPosition(options.currentPosition - options.step, (function() {
								if (scrollingLeftTrigger)
									buttonrunLeft();
							}));
						};
					});
					$(context).delegate(options.buttons.rightButton, 'mousedown', function(e) {
						e = $.event.fix(e);
						e.preventDefault();
						scrollingRightTrigger = true;
						buttonrunRight();
						function buttonrunRight () {
							setPosition(options.currentPosition + options.step, (function() {
								if (scrollingRightTrigger)
									buttonrunRight();
							}));
						};
					});
					$(document).mouseup(function(e) {
						scrollingLeftTrigger = false;
						scrollingRightTrigger = false;
					});
				}
				// for gallery scrolling by wheel
				if (options.scrollingOn) {
					$(context).delegate(options.container, 'mousewheel', function(e) {
						wheelMove(e);
					});
				}
				// for scrollbar
				if (options.bar.on) {
					// move by click
					$(context).delegate(options.bar.scrollBar, 'click', function(e) {
						e = $.event.fix(e);
						// move to one step by direction
						if (options.bar.scrollBarClickMoveToDirectionNotToPoint) {
							var a = $(options.bar.scrollBar);
							var b = $(options.bar.scrollBar).offset();
							var c = $(options.bar.scrollBar).offset()[property];
							var delta = ((e['page' + moveby] - $(options.bar.scrollBar).offset()[property]) > parseInt($(options.bar.scroller).css('margin-' + property))) ? 1 : -1;
							setPosition(options.currentPosition + delta*options.step);
						// move to clicked position
						} else {
							var clickedPosition = (e['page' + moveby] - $(options.bar.scrollBar).offset()[property] - scrollerWidth/2) * options.bodyWidth / scrollBarWidth;
							var newPosition = options.currentPosition;
							var oldNewPosition = options.currentPosition;
							var delta = (clickedPosition > options.currentPosition) ? 1 : -1;
							while (Math.abs(newPosition - clickedPosition) <= Math.abs(oldNewPosition - clickedPosition)) {
								oldNewPosition = newPosition;
								newPosition += delta*options.step; 
							}
							setPosition(oldNewPosition);
						}
						fixForBrowsers(e);
					});
					// drag sroller
					$(context).delegate(options.bar.scroller, 'mousedown', function(e) {
						if (!e)
							e = window.event;
						canDrag = true;
						shift_x = e['client' + moveby] - parseInt($(options.bar.scroller).css('margin-' + property));
						fixForBrowsers(e);
					});
					$(document).mousemove(function(e) {
						if (!e)
							e = window.event;
						if (canDrag) {
							setPosition((e['client' + moveby] - shift_x) * options.bodyWidth / scrollBarWidth);
							fixForBrowsers(e);
						}
					}).mouseup(function(e) {
						if (canDrag) {
							canDrag = false;
							// stop drag on position that is aliquoted to step
							if (options.bar.dragToStep) {
								if (!e)
									e = window.event;
								if (!animationTrigger)
									animationTrigger = true;
								setPosition((((e['client' + moveby] - shift_x) * options.bodyWidth / scrollBarWidth / options.step + 0.5) | 0) * options.step);
							}
							fixForBrowsers(e);
						}
					});
					// for scrollbar scrolling by wheel
					if (options.bar.scrollBarScrolling) {
						$(context).delegate(options.bar.scrollBar, 'mousewheel', function(e) {
							wheelMove(e);
						});
						$(context).delegate(options.bar.scroller, 'mousewheel', function(e) {
							wheelMove(e);
						});
					}
				}
				function wheelMove(e) {
					if (!e)
						e = window.event;
					var delta = e.wheelDelta ? ((e.wheelDelta < 0) ? 1 : -1) : (e.detail ? ((e.detail > 0) ? 1 : -1) : ((e.originalEvent && e.originalEvent.wheelDelta) ? ((e.originalEvent.wheelDelta < 0) ? 1 : -1) : 0));
					setPosition(options.currentPosition + delta*options.step);
					fixForBrowsers(e);
				};
				function setPosition(newPosition, callback) {
					if(newPosition < options.bodyWidth && newPosition > 0)
						options.currentPosition = newPosition;
					else {
						if(newPosition >= options.bodyWidth)
							options.currentPosition = options.bodyWidth;
						if(newPosition <= 0)
							options.currentPosition = 0;
					}
					clearTimeout($(options.container).t);
					$(options.container).t = setTimeout(function(callback) {
						return function() {
							if (animationTrigger) {
								animationTrigger = false;
								var aniArgs = {};
								aniArgs['margin-' + property] = (options.currentPosition * (-1)) + "px";
								$(options.body).animate(aniArgs, options.animationTime, 'linear', function() {
									animationTrigger = true;
									if (callback != undefined)
										callback();
								});
								if (options.bar.on) {
									var scrollerAniArgs = {};
									scrollerAniArgs['margin-' + property] = Math.round(options.currentPosition * scrollBarWidth / options.bodyWidth) + "px";
									$(options.bar.scroller).animate(scrollerAniArgs, options.animationTime, 'linear');
								}
								if (options.buttons.on)
									setButtons();
							}
						}
					}(callback), 100);
				};
				function setButtons() {
					if(options.currentPosition <= 0) {
						$(options.buttons.leftButton).removeClass('on');
						$(options.buttons.leftButton).addClass('off');
					} else {
						$(options.buttons.leftButton).removeClass('off');
						$(options.buttons.leftButton).addClass('on');
					}
					if (options.bodyWidth - options.currentPosition <= 0) {
						$(options.buttons.rightButton).removeClass('on');
						$(options.buttons.rightButton).addClass('off');
					} else {
						$(options.buttons.rightButton).removeClass('off');
						$(options.buttons.rightButton).addClass('on');
					}
				};
				function fixForBrowsers(e) {
					if (!e)
						e = window.event;
					if (e.stopPropagation)
						e.stopPropagation();
					else
						e.cancelBubble = true;
					if (e.preventDefault)
						e.preventDefault();
					else
						e.returnValue = false;
				};
				// goTo function for outer logic
				function goTo(newPosition) {
					setPosition(newPosition);
				};
				this.goTo = goTo;
			} else
				console.log('size of gallery is 0');
		} else
			console.log('not enough parametres for initialize scrollGallery');
	};
	return new ScrollGallery(this.get(0), options);
};
