define([
  'underscore',
  'backbone',
  'passion/basepopup',
  'text!passion/wizard/templates/welcometpl.html',
  'passion/videoComponent'
], function(_, Backbone, BasePopup, welcometpl, videoComponent) {
	return Backbone.View.extend({
		//el : $("#wizard-stepcontent"), 
		className:'no-padding',
		initialize : function() {
			this.template = _.template(welcometpl);
        },
        events: {
        },        
        render: function(){
        	$(this.el).html(this.template({}));
        	viewEvents.trigger('wizard:updateRenderStatus',true);		
			$('#welcomeVideoContainer', this.el).append(new videoComponent('../passionhelp/en_US/content/resources/multimedia/videocover/Video Covers-01.jpg','../passionhelp/en_US/content/resources/multimedia/Welcome.mp4','Welcome').el);
			
			$(".videoImgContainer", this.el).each(function(index, element) {
	        	 var myHeight = Math.round($(window).height() - ( $(this).offset().top + $(".contents10-paging").outerHeight() + 6));
	        	 	if(myHeight > 400){
	        	 		myHeight = 400;
	        	 	}	        	 
	        	    $(this).height(myHeight);
	        });
        	return this;
        },
        doNext: function(callback){
        	//do validate & save and return call back
        	callback();
        },
        doSave: function(callback)
        {
        	// do necessary save and return
        	callback();
        }        
	});	
});