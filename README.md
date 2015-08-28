# jquery-scrollGallery
Script for scroll something like photo gallery.<br />
Has functional of forward and back buttons, mouse wheel and scroll bar click or drag.<br />
Uses your html with your styling, does not include precompiled html or css.<br />
Works in google chrome and ie >= 7.<br />
[Link to source.](./scrollGallery.js)<br />
<br />

What is needed:
- included jquery (tested with 1.9.1),
- element that is body of gallery,
- parent element of gallery body with style="overflow: hidden",
- other is optional.
<br /><br />

How it works:
- in javascript you write something like this:

  ```javascript
  $(document).ready(function() {
    var gal = $('#mekVacBottomPlaceholder').scrollGallery({options});
  });
  ```
- where options are:

  ```javascript
  var options = {
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
		}
	};
  ```
- if you need you can use than:
  
  ```javascript
  gal.goTo(newMarginOfGalleryBodyInPx); // goTo for outer logic
  ```
- and to remove all delegated handlers you can use:
  
  ```javascript
  gal.destroy();
  ```
<br />
Some notes:
- do not set scroller as child element of scroll bar or after drag it would make also click,
- in ie < 9 first click on scroll bar or scroller move does not react if you doesn't set scroller style="margin-left: 0" (or margin-top if vertical),
- first lines (if) is bugfix for undefined console and console.log (for ie) if you already have it on page remove this lines.
- auto setting class "on" or "off" for buttons if we can or can't go in this direction
<br /><br />

Examples:
-	[vertical scroll with buttons and mouse wheel on off buttons colored](https://htmlpreview.github.io/?https://github.com/mechanicum/jquery-scrollGallery/blob/master/examples/vertical.html)
-	[photogallery with most of futures with usage of goTo from outside code](https://htmlpreview.github.io/?https://github.com/mechanicum/jquery-scrollGallery/blob/master/examples/photogallery.html)
-	[scrolling of complex html elements whith scrolling by steps (without buttons)](https://htmlpreview.github.io/?https://github.com/mechanicum/jquery-scrollGallery/blob/master/examples/calendar.html)
