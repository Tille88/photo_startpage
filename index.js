// NOTE TO SELF:
// Avoid all kinds of array as elements for implementation, left now since easier. Have correct data structure from beginning when knowing mockup structure (makes it a hassle to get to eventlistener handlers to detach)
// Hovering slow transition, now opacity only on/off. Can have clippath moving in from left for all letters, and from above for all characters
(function(){
	// Constructor function
	var SvgAnim = function(){
		// Get references to document elements that needs to be altered
		this.svg = document.querySelector('svg');
		this.NS = this.svg.getAttribute('xmlns');
		var viewBox = this.svg.viewBox.baseVal;
		this.svgDim = {
			'width': viewBox.width - viewBox.x,
			'height': viewBox.height - viewBox.y
		};


		var bigCircle = document.getElementById("bigCircle");
		var midCircle = document.getElementById("midCircle");
		var smallCircle = document.getElementById("smallCircle");
		this.circleArr = [bigCircle, midCircle, smallCircle].map(function(el){
			return {'el': el,
							'pos': {
								'x': +el.getAttribute("cx"),
								'y': +el.getAttribute("cy"),
								'r': +el.getAttribute("r")
							}
			};
		});

		// Display on load
		this.svg.classList.remove('hidden');

		var greyTextBoxes = document.querySelectorAll('.greyTextBox');
		var colorTextBoxes = document.querySelectorAll('.colorTextBox');

		this.overlayText = {
			'grey': this.overlayText.call(this, 'grey', greyTextBoxes),
			'color': this.overlayText.call(this, 'color', colorTextBoxes)
		};
		this.greyTextBox = this.createShadowBB(greyTextBoxes);
		this.colorTextBox = this.createShadowBB(colorTextBoxes);

		// Start circle animation
		this.circleAnimIn();

		// Attach event listeners
		this.attachEventListeners();

	};

	var styles = {
		'grey': "fill:#111;stroke:rgba(198, 21, 8, 0.4)",
		'color': "fill:#b6100b;stroke:#aaa"
	}

	// Returns a given value in new range (e.g. 50 in [0,100] ro 0.5 in [0,1])
	var linearConversion = function(val, oldRange, newRange){
		if(!newRange) { newRange = [0,1]; }
		return (val - oldRange[0]) * (newRange[1]-newRange[0]) / (oldRange[1]-oldRange[0]) + newRange[0];
	};

	// Need overlay of text since masks applied using <use> element
	SvgAnim.prototype.overlayText = function(col, textBoxArr) {
		var self = this;
		var elemArr = [];
		textBoxArr.forEach(function(group){
			var clone = group.cloneNode(true);
			clone.setAttributeNS(null, "opacity", 0);
			clone.setAttributeNS(null, "style", styles[col]);
			self.svg.appendChild(clone);
			elemArr.push(clone);
		});
		return elemArr;
	};

	// Creates shadow boxes of text element for cursor to chenge during hover
	SvgAnim.prototype.createShadowBB = function(svgGroup) {
		var self = this;
		var elementCont = [];
		svgGroup.forEach(function(svgGroupEl){
			var bb = svgGroupEl.getBBox();
			var rect = document.createElementNS(self.NS, 'rect');
			rect.setAttributeNS(null, 'x', bb.x);
			rect.setAttributeNS(null, 'y', bb.y);
			rect.setAttributeNS(null, 'width', bb.width);
			rect.setAttributeNS(null, 'height', bb.height);
			rect.setAttributeNS(null, 'opacity', 0);
			rect.setAttributeNS(null, 'class', 'clickable');
			self.svg.appendChild(rect);
			elementCont.push(rect);
		});
		return elementCont;
	};

	// For each circle, kicks of start animation
	SvgAnim.prototype.circleAnimIn = function(){
		this.circleArr.forEach((circleMod) => {
			this.animateCircleIn(circleMod.el);
		});
	};

	// A bit pedestrian, but first grows circle elements and then shrinks them
	SvgAnim.prototype.animateCircleIn = function(el){
		var originalAttrVal, attributeVal;
		originalAttrVal = attributeVal = +el.getAttribute("r");
		var shrinking = false;
		function step(time) {
			if(!shrinking){
				el.setAttributeNS(null, "r", attributeVal*=1.08);
			}
			if(attributeVal >= 3*originalAttrVal){
				shrinking = true;
			}
			if(shrinking){
				if(attributeVal < originalAttrVal){
					el.setAttributeNS(null, "r", originalAttrVal);
					cancelAnimationFrame(step);
					return;
				}
				el.setAttributeNS(null, "r", attributeVal*=0.92);
			}
			requestAnimationFrame(step);
		}
		requestAnimationFrame(step);
	};

	// Makes sure that a function is not called more often than given time limit
	var throttle = function(fnc, lmt){
		var runDuringLmt;
		return function(){
			var args = arguments;
			var self = this;
			if(!runDuringLmt){
				fnc.apply(self, args);
				runDuringLmt = true;
				setTimeout(function(){
					runDuringLmt = false;
				}, lmt);
			}
		};
	};

	// Attach event listeners
	// DIRTY implementation since will not be detached
	SvgAnim.prototype.attachEventListeners = function(){
		var self = this;
		// TODO: gather listeners to be removed for non-mockup implementation
		this.svg.addEventListener('mousemove', throttle(this.moveTowardsMouse.bind(this), 30));

		this.greyTextBox.forEach(function(textBox){
			self.addTextClickListener.call(self, textBox, 'grey');
			self.addTextHoverListener.call(self, textBox, 'grey');
		});
		this.colorTextBox.forEach(function(textBox){
			self.addTextClickListener.call(self, textBox, 'color');
			self.addTextHoverListener.call(self, textBox, 'color');
		});


	};


	// Text click given shadow rect element as input
	SvgAnim.prototype.addTextClickListener = function(textBox, color){
		return textBox.addEventListener('click', function(e){
			var alertMsg = "Clicked: " + color.toUpperCase() + ". Todo: \n After outtransition, route to clicked section and cleanup (listeners etc.)"
			alert(alertMsg);
		});
	};



	// Hover is mouseover + mouseleave events
	// Attaching to shadow element, changing path elements
	SvgAnim.prototype.addTextHoverListener = function(textBox, color){
		textBox.addEventListener('mouseover', (e) => {
			this.overlayText[color].forEach(function(el){
				el.setAttributeNS(null, "opacity", 1);
			});
		});
		textBox.addEventListener('mouseleave', (e) => {
			this.overlayText[color].forEach(function(el){
				el.setAttributeNS(null, "opacity", 0);
			});
		});
	};

	// Clip-path/mask element (circles) are moved towards given mouseposition
	SvgAnim.prototype.moveTowardsMouse = function(e){
		var self = this;
		this.circleArr.forEach(function(circle){
			// convert mousemove coordinates to SVG coordinates
			var pt = self.svg.createSVGPoint();
			pt.x = e.clientX; pt.y = e.clientY;
			var transPoint = pt.matrixTransform(self.svg.getScreenCTM().inverse());
			// Get distance to circle pos and in normalized [0,1] range
			var distX = transPoint.x - circle.pos.x;
			var distNormX = linearConversion(Math.abs(distX), [0, self.svgDim.width]);
			var distY = transPoint.y - circle.pos.y;
			var distNormY = linearConversion(Math.abs(distY), [0, self.svgDim.height]);
			// Set a max-offset, as multiple of radius (here for experimentation)
			var maxOffset = 0.4;
			// Move to position
			circle.el.setAttributeNS(null, "cx", circle.pos.x + distNormX * Math.sign(distX) * maxOffset * circle.pos.r);
			circle.el.setAttributeNS(null, "cy", circle.pos.y + distNormY * Math.sign(distY) * maxOffset * circle.pos.r);
		});
	};

	document.addEventListener('DOMContentLoaded', function() {
		new SvgAnim();
	});
}());
