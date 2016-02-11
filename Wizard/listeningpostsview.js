define([
  'underscore',
  'backbone',
  'text!passion/wizard/templates/listeningpoststpl.html'
], function(_, Backbone, listeningpoststpl) {
	
	var RELATIONSHIP_TYPE = 'RELATIONSHIP';
	var TRANSACTION_TYPE = 'TRANSACTION';
	var SCONFIG = {'survey':{stepNo:6,percentage:80,customText:true,text: getMessage('WIZARD_SURVEY_STEP'),nonclickable:true},'import':{stepNo:6,percentage:80,customText:true,text: getMessage('WIZARD_IMPORT_STEP'),nonclickable:true}}
	var ChannelView = Backbone.View.extend({
		tagName: 'div',
		className:'padding-10-box-10',
		events: {
        	//'click a': 'addDefaultchannel'
		},
		initialize : function() {
			this.setTpl();
		},
		render: function(){
			$(this.el).html(this.tpl);
			
			return this;
		},
		getRlpTpl: function(){
			return '<div class="box-12 box-12-2 dak-gray-bg"><div class="box-12-icon">'+
			'<i class="icon-relationship-graph-2"></i></div><div class="box-12-label-1">'+this.model.get('channelName')+'</div><div class="box-12-label-2"></div></div>';
		},
		getTrsTpl: function(){
			return '<div class="box-12 box-12-2 dak-gray-bg"><div class="box-12-icon"><i class="icon-touchpoint-3"></i>'+
            '</div><div class="box-12-label-1">'+this.model.get('channelName')+'</div><div class="box-12-label-2"></div></div>';
		}
		,
		setTpl: function(){
			switch(this.model.get("channelType").toUpperCase())
			{
			   case TRANSACTION_TYPE : this.tpl = this.getTrsTpl();
			   						break;
			   case RELATIONSHIP_TYPE : this.tpl = this.getRlpTpl();
					                break;
			   default: this.tpl = '';
			}
		}
	});
	var TouchpointView = Backbone.View.extend({
		tagName: 'td',
		className:'controlar-carousel-column',
		events: {
			'click input': 'setTPoint'
		},
		initialize : function() {
			this.channelType = this.model.get('channelType');
			this.model.set("surveyName",getMessage('PROM_TOUCHPOINT_SURVEY').replace('{1}',this.model.get("touchpointName")));
			this.tpl = this.getTpl();
			this.model.view = this;
			if(this.options.type == 'header')
			{
				//$(this.el).addClass('controlar-carousel-column');
				this.tpl = this.getHeaderTpl();
			}
			else if(this.options.type == RELATIONSHIP_TYPE){
				this.model.set('selected',true);
				this.model.set("surveyName",getMessage('PROM_RELATIONSHIP_SURVEY'));
				$(this.el).css({'paddingRight':5}).attr('colspan',this.options.colspan);
				this.tpl = this.getRTpl();
			}
		},
		render: function(){
			$(this.el).html(this.tpl);
			$("[rel=tooltip]",this.el).tooltip({container:this.options.parent.el});
			return this;
		},
		setTPoint: function(event){
			_.each(this.model.collection.models,function(item){
				item.set('selected',false);				
			},this);
			this.model.set('selected',$(event.currentTarget).is(':checked'));
		},
		getHeaderTpl: function(){
			return '<i class="icon-touchpoint-3"></i> <span class="hdr-span" rel="tooltip" title="'+this.model.get("touchpointName")+'">'+this.model.get("touchpointName")+'</span>';
		},
		getTpl: function(){
			return '<div class="box-12 box-12-white"><div class="box-12-icon-2"><div class="smart-form radiobox-style3 text-center">'+
			'<label class="radio"><input name="channelType" type="radio" value="'+this.options.type+'"><i></i></label></div></div><div class="box-12-label-1 text-left" rel="tooltip" title="'+this.model.get("surveyName")+'">'+this.model.get("surveyName")+'</div></div>';
		}
		,
		getRTpl: function(){
			return '<div class="box-12 box-12-2 light-blue"><div class="box-12-icon-2"><div class="smart-form radiobox-style3 text-center">'+
			'<label class="radio"><input type="radio" name="channelType" checked="checked" value="'+this.options.type+'"><i></i></label></div></div>'+
			'<div class="box-12-label-1 text-left" rel="tooltip" title="'+this.model.get("surveyName")+'">'+this.model.get("surveyName")+'</div></div>';
		}
		
	});
	return Backbone.View.extend({
		className:'no-padding',
		initialize : function() {
			_.bindAll(this, 'onPageResize');
			$('#hide-menu').bind('click', this.onPageResize);
			this.template = _.template(listeningpoststpl);
			this.model = new Backbone.Model();
			this.channelTouchpoints = new Backbone.Collection();
			this.currentStep = 0;
			this.surveySource = 'survey';
			viewEvents.trigger('update:wizardStepConfig',SCONFIG[this.surveySource],'survey',true);
        },
        events: {
        	'click #listeningpost .tabheader li a': 'selectStep',
        	'click .surveycreationtype input': 'switchSurveySource',
        	'click #right-program-icon': 'moveToRight',
        	'click #left-program-icon': 'moveToLeft'
        },
    
        render: function(){
        	$(this.el).html(this.template({}));
        	var self = this;
        	this.model.fetch({
                global: true,
                url: '../service/program?method=getDefaultChannelsAndTouchpoints',
                success: function(model, response) {
                	self.setChannelsAndTouchpoints();
                }
            });
        	this.showStep(0);
        	return this;
        },
        switchSurveySource: function(event){
        	this.surveySource = $(event.currentTarget).val();
        	viewEvents.trigger('update:wizardStepConfig',SCONFIG[this.surveySource],'survey',true);
        },
        setChannelsAndTouchpoints: function(channels)
		{
        	this.initTP = false;
			$('#program-touchpoints-ctr',this.el).append('<tr id="channeltouchpoints-header" class="program_table_row_2"></tr>');
			
			_.each(this.model.get('touchpoints'),function(tpitem){
				var model = new Backbone.Model();
				model.set(tpitem);
				var headerTouchpoint = new TouchpointView({model:model,type:'header',tagName:'th',parent:this});
				$("#channeltouchpoints-header",this.el).append(headerTouchpoint.render().el);	
			},this);
			
			_.each(this.model.get('channels'),function(item) {
				var model = new Backbone.Model();
				model.set(item);
                this.addChannel(model);
            }, this);
			
			viewEvents.trigger('wizard:updateRenderStatus',true);
		},
		addChannel: function(item){
			var channelView = new ChannelView({model:item});
			var self = this;
			$('#program_channels',this.el).append(channelView.render().el);
			$('#program-touchpoints-ctr',this.el).append('<tr id="channeltouchpoints-'+item.get('channelType')+'"></tr>');
			if(item.get('channelType') == RELATIONSHIP_TYPE){
				var touchpoint = new TouchpointView({model:item,type:item.get('channelType'),colspan:this.model.get('touchpoints').length,parent:this});
				$('#channeltouchpoints-'+item.get('channelType'),this.el).addClass('single-survey-tab-row').append(touchpoint.render().el);
				this.channelTouchpoints.add(item);
			}
			else{
				_.each(this.model.get('touchpoints'),function(tpitem){
					var model = new Backbone.Model();
					model.set(tpitem);
					model.set('channelType',item.get('channelType'));
					model.set('channelName',item.get('channelName'));
					this.channelTouchpoints.add(model);
					var touchpoint = new TouchpointView({model:model,type:'touchpoint',parent:this});
					$('#channeltouchpoints-'+item.get('channelType'),this.el).append(touchpoint.render().el);
				},this);
			}
		},
		onPageResize: function(){
			var self = this;
			setTimeout(function(){
				self.moveToRight(null,true);
				self.moveToLeft(null,true);
			}, 500);
		},
		moveToRight: function(event,showOrHide,gotoEnd){
        	
			var containerWidth = parseInt($("#program-channeltouchpoint-ctr",this.el).outerWidth());
    		var totalWidth = parseInt($("#channel-touchpoints-ctr",this.el).innerWidth());
    		var leftMargin = parseInt($("#channel-touchpoints-ctr",this.el).css("marginLeft"));
    		var total = totalWidth - containerWidth + leftMargin;
    		if(total > 50){
    			 if(showOrHide){
     				$('#right-program-icon',this.el).addClass('visible').show();
     			}
    			else if((gotoEnd || total < 206)){
    				$("#channel-touchpoints-ctr",this.el).css({'marginLeft' : "-="+total+"px" });
    				$('#left-program-icon',this.el).show();
    				$('#right-program-icon',this.el).removeClass('visible').hide();
    			} else {
    				$("#channel-touchpoints-ctr",this.el).css({'marginLeft' : "-=155px" });
    				$('#left-program-icon',this.el).show();
    				if(total < 206 ){
    					$('#right-program-icon',this.el).removeClass('visible').hide();
    				}
    				//this.moveToRight(event,true);
    				//this.moveToLeft(event,true);
    			}
    		}
    		else{
    			if(total < 0 && totalWidth > containerWidth){
	    			$("#channel-touchpoints-ctr",this.el).css({'marginLeft' : "-="+total+"px" });
	    		}
    			$('#right-program-icon',this.el).removeClass('visible').hide();
    		}
    		
    		
        },
        moveToLeft: function(event,showOrHide){
        	var containerWidth = $("#program-channeltouchpoint-ctr",this.el).outerWidth();
    		var totalWidth = $("#channel-touchpoints-ctr",this.el).innerWidth();
        	var leftMargin = parseInt($("#channel-touchpoints-ctr",this.el).css("marginLeft"));
        	var total = parseInt(totalWidth) - parseInt(containerWidth);
    		if(leftMargin < 0){
    			if(showOrHide){
    				if(leftMargin > -156 ){
    					$('#left-program-icon',this.el).hide();
    					$("#channel-touchpoints-ctr",this.el).css({'marginLeft' : "0px" });
    				}
    				else{
    					$('#left-program-icon',this.el).show();
    				}
    			}else{
    				var toleft = 0;
    				if(leftMargin > -156 ){
    					$('#left-program-icon',this.el).hide();
    					$("#channel-touchpoints-ctr",this.el).css({'marginLeft' : "0px" });
    				}
    				else{
    					toleft = 155;
    					$("#channel-touchpoints-ctr",this.el).css({'marginLeft' : "+="+toleft+"px" });
    				}
    				total = total + parseInt(toleft);
    				if(total > 50){
    					$('#right-program-icon',this.el).addClass('visible').show();
    				}    				
    				
    				//this.moveToLeft(event,true);
    			}
    		}
    		else{
    			$("#channel-touchpoints-ctr",this.el).css({'marginLeft' : "0px" });
    			$('#left-program-icon',this.el).hide();
    		}
        },
        selectStep: function(event){
        	event.preventDefault();
            event.stopPropagation();
        	var step = parseInt($(event.currentTarget).attr('step'),0);
        	this.showStep(step);
        },
        showStep: function(step){
        	this.currentStep = step;
        	$('#listeningpost .tabheader li,.tab-content .tab-pane',this.el).removeClass('active');
        	$('#listeningpost .tabheader li a[step="'+step+'"]',this.el).parent('li').addClass('active');
        	$('.tab-content #stepcontent'+step,this.el).addClass('active');
        	$('.stepheader',this.el).hide();
        	$('.stepheader'+step,this.el).show();
        	if(step == 1){
        		if(!this.initTP){
        			this.moveToRight(null,true);
        			this.moveToLeft(null,true);
        			this.initTP = true;
        		}
        		setPageLevelHelpKey('LISTENING_POSTS_2');
        		viewEvents.trigger('update:wizardStepConfig',{stepNo:5,percentage:75});
        	}
        	if(this.initTP){
        		viewEvents.trigger('wizard:updateRenderStatus',true);
        	}
        },
        beforeClose: function(){
        	$(".tooltip").hide();	
        	$("[rel=tooltip]",this.el).tooltip('destroy');
        	$('#hide-menu').unbind('click', this.onPageResize);
        	this.channelTouchpoints.clear();
        },
        doPrev: function(callback){
			if(this.currentStep == 0){
				callback();
			}
			else{
				$('#listeningpost .tabheader li a[step="'+(this.currentStep - 1)+'"]',this.el).click();
			}
        },
        doNext: function(callback){
        	//do validate & save and return call back
        	if(this.currentStep == 0){
        		this.showStep(1);
        	}
        	else{
        		this.doSave(callback);
        	}        	
        },
        doSave: function(callback)
        {
        	// do necessary save and return
        	var serverData = {};
        	var config = SCONFIG[this.surveySource];
        	_.each(this.channelTouchpoints.models,function(item){
        		if(item.get('selected')){
        			serverData = item.toJSON();
        		}
        	},this);
        	//serverData['surveySource'] = $('#surveybyimportdata',this.el).is(":checked") ?'import':'template';
        	if(serverData.channelType == RELATIONSHIP_TYPE){
        		serverData['surveyName'] = serverData['channelName'];
        	}else{
        		serverData['surveyName'] = serverData['touchpointName'] + ' - ' + serverData['channelName'];
        	}
        	serverData['surveyName'] = serverData['surveyName'].replace(/surveys$/i, 'Survey');
        	serverData['programId'] = this.model.get('programId');
        	serverData['industryType'] = this.model.get('industryTypeCode');
        	serverData['sequenceNo'] = (this.model.get('sequenceNo') || 0) + 1;
        	serverData['channelName'] = serverData['channelName'] + ' ' + serverData['sequenceNo'];
        	serverData['validateSurveyName'] = true;
        	serverData['findUnAsssignedChannel'] = true;
        	serverData['template'] = PROGRAM_CHANNELS[serverData['channelType'] || RELATIONSHIP_TYPE].template;
        	config['options'] = {channelDetails:serverData};
        	config['options']['type'] = this.surveySource;
    		
        	if(true){
        		//config['nonclickable'] = false;
        		viewEvents.trigger('update:wizardStepConfig',config,'survey',true);
        		callback();
        	}
        	else{
        		$.ajax({
  				  global:true,
  				  url: "../service/program?method=createChannelSurvey",
  				  progessTxt:'Please wait while we create your survey. This might take a few minutes.',
  	              data: serverData,
  	              complete : function(response){
  	            	  if(response.responseText)
  	            	    response = JSON.parse(response.responseText);
  	            	  if(response.Error)
  	            	  {
  	            		  showToastMessage('error',response.Error,'Error');
  	            	  }
  	            	  else
  	            	  {
  	            		  config['options']['datacollectionIdfier'] = response['datacollectionIdfier'];
  	            		  //config['nonclickable'] = false;
  	            		  viewEvents.trigger('update:wizardStepConfig',config,'survey',true);
  	            		  callback();
  	            	  }
  	              },
          
                 error: function (response) {
  				
  			     }
  		      });
        	}
        	
        	
        }        
	});	
});