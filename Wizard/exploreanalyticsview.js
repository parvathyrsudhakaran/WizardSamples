define([
  'underscore',
  'backbone',
  'text!passion/wizard/templates/learnanalytics.html',
  'text!passion/wizard/templates/demoanalyticspopup.html'
], function(_, Backbone, antcspl,dmants) {
	return Backbone.View.extend({
		className:'no-padding',
		initialize : function() {
			if(this.options.skippedStep)
			{
        		//switchEnterprise();
        		//return;
        	}
			this.template = _.template(antcspl);
			this.demoswitch = _.template(dmants);
			this.clicked = false;
        },
        events: {
        	'click a.gotostep'  	  : 'gotoStep',
        },
    
        render: function(){
        	
        	$(this.el).html(this.template({}));
        	if(!this.options.skippedStep)
			{
        		$('#expoloreanalytics',this.el).html(this.demoswitch({}));
            	$('.learnanalyticsheader',this.el).html($('.exploreanalyticsheader',this.el).html());
            	$('.headerdescription',this.el).html($('.exploreanalyticsheaderdesc',this.el).html());
			}
        	if(!programExist){
        		$('#expoloreanalytics',this.el).html('<h1><i>'+getMessage('WIZARD_PROM_NOT_READY')+'</i></h1>');
        	}
        	viewEvents.trigger('wizard:updateRenderStatus',true);
        	return this;
        },
        gotoStep:function(event){
			event.preventDefault();
            event.stopPropagation();
            if(this.clicked) return;
            this.clicked = true;
            if($(event.currentTarget).attr('step') == 'liveanalytics'){
            	this.options.parent.close();
            }
            else{
            	switchEnterprise();
            }
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