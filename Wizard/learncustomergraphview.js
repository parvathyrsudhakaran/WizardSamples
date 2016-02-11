define([
  'underscore',
  'backbone',
  'text!passion/wizard/templates/learncustomergraphtpl.html',
  'passion/videoComponent'
], function(_, Backbone, custpl, videoComponent) {
	return Backbone.View.extend({
		className:'no-padding',
		initialize : function() {
			this.template = _.template(custpl);
        },
        events: {
            
        },
    
        render: function(){
        	$(this.el).html(this.template({}));
        	viewEvents.trigger('update:wizardStepConfig',{stepNo:6,percentage:80,customText:true,text: getMessage('WIZARD_SURVEY_STEP_LABEL'),nonclickable:true},'survey',true);
        	viewEvents.trigger('wizard:updateRenderStatus',true);
        	$('#programVideoContainer', this.el).append(new videoComponent('../passionhelp/en_US/content/resources/multimedia/videocover/Video Covers-04.jpg','../passionhelp/en_US/content/resources/multimedia/Program.mp4','Program Overview').el);
        	
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