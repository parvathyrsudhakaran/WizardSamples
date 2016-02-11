define([
  'underscore',
  'backbone',
  'passion/programlistview',
  'text!passion/wizard/templates/programtouchpoints.html'
], function(_, Backbone,ProgramView, touchpnttpl) {
	return Backbone.View.extend({
		className:'no-padding',
		initialize : function() {
			this.template = _.template(touchpnttpl);
			viewEvents.trigger('update:wizardStepConfig',{stepNo:6,percentage:80,customText:true,text:getMessage('WIZARD_SURVEY_STEP_LABEL'),nonclickable:true},'survey',true);
        },
        events: {
            
        },
    
        render: function(){
        	$(this.el).html(this.template({}));
        	this.program = new ProgramView({pageType:'wizard',el:$('#programsetuppage',this.el)});
        	this.program.render();
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
        },
        beforeClose: function(){
        	if(this.program)
          	{
        		 this.program.destroy();
          	}
        }        
	});	
});