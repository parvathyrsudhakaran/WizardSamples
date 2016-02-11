define([
  'underscore',
  'backbone',
  'passion/programlistview',
  'text!passion/wizard/templates/programpriviewtpl.html'
], function(_, Backbone,ProgramView, priviewtpl) {
	return Backbone.View.extend({
		className:'no-padding',
		initialize : function() {
			this.template = _.template(priviewtpl);
        },
        events: {
            
        },
    
        render: function(){
        	$(this.el).html(this.template({}));
        	this.program = new ProgramView({pageType:'wizard',viewType:'preview',el:$('#programpriviewpage',this.el)});
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
        }        
	});	
});