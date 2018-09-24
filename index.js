// TODO:
// - Conversion SVG => screen in mousemove function
// - Get mouse pointer working on text elements (need square element, can't rely simply on the path elements...)
// - On click fnc => simple out transition + alert (say TODO, detach ev. listeners + transition to section clicked)
// - Enclose in IIFE

// Constructor function
var SvgAnim = function(){
	// Get references to document elements that needs to be altered
	this.svg = document.querySelector('svg');
	var viewBox = this.svg.viewBox.baseVal;
	this.svgDim = {
		'width': viewBox.width - viewBox.x,
		'height': viewBox.height - viewBox.y
	};

	this.greyText = document.querySelector('#greyText');
	this.colorText = document.querySelector('#colorText');


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
	this.svg.classList.remove('hidden')
	// Start circle animation
	this.circleAnimIn();

	// Attach event listeners
	this.attachEventListeners();

};


SvgAnim.prototype.circleAnimIn = function(){
	this.circleArr.forEach((circleMod) => {
		this.animateElementAttribute(circleMod.el);
	});
};

SvgAnim.prototype.animateElementAttribute = function(el){
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

SvgAnim.prototype.attachEventListeners = function(){
	// TODO: Clickable elements need to have calculation, perhaps calculating element.getBBox() as check... But also want cursor to be displayed as pointer......
	// this.svg.addEventListener('click', function(e){ console.log(e); });
	this.svg.addEventListener('mousemove', throttle(this.moveTowardsMouse.bind(this), 30));

};


var linearConversion = function(val, oldRange, newRange){
	if(!newRange) { newRange = [0,1]; }
	return (val - oldRange[0]) * (newRange[1]-newRange[0]) / (oldRange[1]-oldRange[0]) + newRange[0];
};

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

