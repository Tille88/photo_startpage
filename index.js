// TODO:
// - Conversion SVG => screen in mousemove function
// - Get pointer working on text elements
// - On click fnc => simple out transition + alert (say TODO, detach ev. listeners + transition to section clicked)
// - Enclose in IIFE

// Constructor function
var SvgAnim = function(){
	// Get references to document elements that needs to be altered
	this.svg = document.querySelector('svg');

	this.greyText = document.querySelector('#greyText');
	this.colorText = document.querySelector('#colorText');


	this.bigCircle = document.getElementById("bigCircle");
	this.midCircle = document.getElementById("midCircle");
	this.smallCircle = document.getElementById("smallCircle");
	this.circleArr = [bigCircle, midCircle, smallCircle];

	// Display on load
	this.svg.classList.remove('hidden')
	// Start circle animation
	this.circleAnimIn();

	// Attach event listeners
	this.attachEventListeners();

};


SvgAnim.prototype.circleAnimIn = function(){
	this.circleArr.forEach((circleEl) => {
		this.animateElementAttribute(circleEl);
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
	this.svg.addEventListener('mousemove', throttle(this.moveTowardsMouse.bind(this), 200));

};



SvgAnim.prototype.moveTowardsMouse = function(e){
	// Get distance to each of the circles...
	var self = this;
	this.circleArr.forEach(function(circle){
		// debugger;
		var bb = circle.getBoundingClientRect()
		var xCenter = bb.x + bb.width/2;
		var yCenter = bb.y + bb.height/2;
		var xSvgCenter = +circle.getAttribute("cx")
		var ySvgCenter = +circle.getAttribute("cy")
		console.log(self.svg);
		// debugger;
	});
	// debugger;
};

document.addEventListener('DOMContentLoaded', function() {
	new SvgAnim();
});






































// var svgAnim = {

// };

// var init = function(){
// 	// Get references to document elements that needs to be altered
// 	// Display on load
// 	var svg = document.querySelector('svg');
// 	svg.classList.remove('hidden')

// 	var bigCircle = document.getElementById("bigCircle");
// 	var midCircle = document.getElementById("midCircle");
// 	var smallCircle = document.getElementById("smallCircle");
// 	var circleArr = [bigCircle, midCircle, smallCircle];
// 	// Start circle animation
// 	circleAnimIn(circleArr);

// 	// Attach event listeners
// 	attachEventListeners();


// };

// var circleAnimIn = function(circleArr){
// 	circleArr.forEach(function(circleEl){
// 		animateElementAttribute(circleEl);
// 	});
// };

// var animateElementAttribute = function(el){
// 	var originalAttrVal, attributeVal;
// 	originalAttrVal = attributeVal = +el.getAttribute("r");
// 	var shrinking = false;
// 	function step(time) {
// 		if(!shrinking){
// 			// el.setAttribute("r", attributeVal+=10);
// 			el.setAttribute("r", attributeVal*=1.08);
// 		}
// 		if(attributeVal >= 3*originalAttrVal){
// 			shrinking = true;
// 		}
// 		if(shrinking){
// 			if(attributeVal < originalAttrVal){
// 				// debugger;
// 				el.setAttribute("r", originalAttrVal);
// 				cancelAnimationFrame(step);
// 				return;
// 			}
// 			// el.setAttribute("r", attributeVal-=15);
// 			el.setAttribute("r", attributeVal*=0.92);
// 		}
// 		requestAnimationFrame(step);
// 	}
// 	requestAnimationFrame(step);
// };

// var attachEventListeners = function(){

// };

// document.addEventListener('DOMContentLoaded', function() {
// 	init();
// });
