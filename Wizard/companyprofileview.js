define([
  'underscore',
  'backbone',
  'passion/createprogramview'
], function(_, Backbone, CreateProgramView) {
	return CreateProgramView.extend({
		className:'no-padding',
		afterInit: function(){
			this.wizardview = true;
		},
		afterRenderComplete: function(){
			viewEvents.trigger('wizard:updateRenderStatus',true);
		},
		doPrev: function(callback){
			if(this.currentStep == 0){
				callback();
			}
			else{
				$('.program-step li a[step="'+(this.currentStep - 1)+'"]',this.el).click();
			}
        },
        doNext: function(callback){
        	if(this.currentStep == 1){
            	this.saveProgram(callback);
            	return;
            }
        	else{
        		$('.program-step li a[step="'+(this.currentStep + 1)+'"]',this.el).click();
        	}

        },
        doSave: function(callback)
        {
        	// do necessary save and return
        	callback();
        }        
	});	
});