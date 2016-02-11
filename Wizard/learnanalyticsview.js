define([
  'underscore',
  'backbone',
  'text!passion/wizard/templates/learnanalytics.html',
  'passion/videoComponent'
], function(_, Backbone, antcstpl, videoComponent) {
	return Backbone.View.extend({
		className:'no-padding',
		initialize : function() {
			this.template = _.template(antcstpl);
        },
        events: {
            
        },
    
        render: function(){
        	$(this.el).html(this.template({}));
        	viewEvents.trigger('wizard:updateRenderStatus',true);
        	$('#expoloreanalytics', this.el).append(new videoComponent('../passionhelp/en_US/content/resources/multimedia/videocover/Video Covers-02.jpg','../passionhelp/en_US/content/resources/multimedia/Analytics.mp4','Explore Analytics').el);
        	
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