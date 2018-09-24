// TODO:
// opacity change on text mouseover/out?
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

		// this.greyText = document.querySelector('#greyText');
		// this.colorText = document.querySelector('#colorText');
		// this.greyTextBox = document.querySelectorAll('.greyTextBox');

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

		this.greyTextBox = this.createShadowBB(document.querySelectorAll('.greyTextBox'));
		this.colorTextBox = this.createShadowBB(document.querySelectorAll('.colorTextBox'));
		// Start circle animation
		this.circleAnimIn();

		// Attach event listeners
		this.attachEventListeners();

	};

	// Returns a given value in new range (e.g. 50 in [0,100] ro 0.5 in [0,1])
	var linearConversion = function(val, oldRange, newRange){
		if(!newRange) { newRange = [0,1]; }
		return (val - oldRange[0]) * (newRange[1]-newRange[0]) / (oldRange[1]-oldRange[0]) + newRange[0];
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
				el.setAttribute("r", attributeVal*=1.08);
			}
			if(attributeVal >= 3*originalAttrVal){
				shrinking = true;
			}
			if(shrinking){
				if(attributeVal < originalAttrVal){
					el.setAttribute("r", originalAttrVal);
					cancelAnimationFrame(step);
					return;
				}
				el.setAttribute("r", attributeVal*=0.92);
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
	SvgAnim.prototype.attachEventListeners = function(){
		var self = this;
		// TODO: gather listeners to be removed for non-mockup implementation
		this.svg.addEventListener('mousemove', throttle(this.moveTowardsMouse.bind(this), 30));

		this.greyTextBox.map(function(textBox){
			return self.addTextClickListener(textBox, 'grey');
		});
		this.colorTextBox.map(function(textBox){
			return self.addTextClickListener(textBox, 'color');
		});
	};


	// Text click given shadow rect element as input
	SvgAnim.prototype.addTextClickListener = function(textBox, color){
		return textBox.addEventListener('click', function(e){
			var alertMsg = "Clicked: " + color.toUpperCase() + ". Todo: \n After outtransition, route to clicked section and cleanup (listeners etc.)"
			alert(alertMsg);
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
			circle.el.setAttribute("cx", circle.pos.x + distNormX * Math.sign(distX) * maxOffset * circle.pos.r);
			circle.el.setAttribute("cy", circle.pos.y + distNormY * Math.sign(distY) * maxOffset * circle.pos.r);
		});
	};

	document.addEventListener('DOMContentLoaded', function() {
		new SvgAnim();
	});
}());
