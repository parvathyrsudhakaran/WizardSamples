define([
  'underscore',
  'backbone',
  'passion/surveybuilderwizardview',
  'passion/byodsurveychannelview',
  'text!passion/wizard/templates/templatesurveytpl.html',
  'text!passion/wizard/templates/importsurveytpl.html',
  'passion/videoComponent'
], function(_, Backbone,SurveyBuilderView,SurveyImportView, surveysteptpl,importsurveytpl, videoComponent) {
	var BaseView   = Backbone.View.extend({
		initialize : function() {
			this.subStep = -1;
		},
		showStep: function(step){
			if(step!=0){
				var subview = this.options.parent.intitSubview(step);
				if(subview){
					subview.showStep(step);
				}
        	}
		},
		doSave: function(callback,currentStep,newStep){
        	callback();
		},
		isLastStep: function(step){
			return false;
		},
		hasSubStep: function(){
			return false;
		}
	});
	var SurveyView = SurveyBuilderView.extend({
		showStep: function(step){
			if(step == 1 && this._currentStepId != 'SURVEY_BUILD'){
				this.subView = '';
				$('#SURVEY_BUILD-tab',this.el).click();
			}
			else if(step == 2 && this._currentStepId != 'SURVEY_DISTRIBUTE'){
				this.subView = '';
				$('#SURVEY_DISTRIBUTE-tab',this.el).click();
			}
			else if(step == 2 && this._currentStepId == 'SURVEY_DISTRIBUTE'){
				this.showSubStep(true);
			}
			else{
				viewEvents.trigger('wizard:updateRenderStatus',true);
			}
			//viewEvents.trigger('wizard:toggleWizFooter',(step == 2));
		},
		afterRender: function(){
			$('.cancelsavesurvey,#surveyeditorhelpinline',this.el).hide();
			this.subStep = -1;
			viewEvents.on('surveywizard:setDistSubStep', this.setDistSubStep,this);
			viewEvents.on('surveywizard:lastStepComplete', this.lastStepComplete,this);
		},
		setDistSubStep: function(stepDetails){
			this.subView = stepDetails.subView || '';
			this.subStep = stepDetails.subStep || -1;
		},
		lastStepComplete: function() {
			if (this.callback)
			{
				this.callback();
				this.callback = null;
			}
		},
		afterStepRendered: function(){
			viewEvents.trigger('wizard:updateRenderStatus',true);
		},
        doSave: function(callback,currentStep,newStep){
        	if(this.hasSubStep() && this.subStep == 4){
        		this.callback = callback ;
        		this.showSubStep(true);//to do:: change this approach
        		//setTimeout(function(){ callback(); }, 1000);
        	}
        	else{
        		callback();
        	}
		},
		isLastStep: function(step){
			return (step == 2 && (!this.hasSubStep() || this.subStep == 4));
		},
		showSubStep:function(fwd){
			if(fwd){
				if(this.subStep == 4 && this.subView == 'website'){
					$('.survey-distribute-wizard-panel .donebutton',this.el).click();
				}
				else{
					$('.survey-distribute-wizard-panel .wnext',this.el).click();
				}
			}
			else{
				$('.survey-distribute-wizard-panel .wprevious',this.el).click();
			}
			//viewEvents.trigger('update:wizardStepConfig',{disableScrollTop:true},'survey');
		},
		gotoPrev: function(currentStep,callback){
			var self = this;
			if(this.hasSubStep() && this.subStep > 1){
				this.showSubStep(false);
			}
			else{
				//$('#surveywizardstep .tabheader li a[step="'+(currentStep - 1)+'"]',this.options.parent.el).click();
				callback();
			}
			
		},
		hasSubStep: function(){
			return (this.subView == 'email' || this.subView == 'website');
		}
	});
    var ImportView = SurveyImportView.extend({
    	showStep: function(step){
    		var currentStepId = this.currentTab ? parseInt($(this.currentTab.el).attr("id"),0) : 0;
        	if(step == 1 && currentStepId != step){
        		this.renderStep('uploadtab');
				setPageLevelHelpKey('IMPORT_FEEDBACK');
        	}else if(step == 2 && currentStepId != step){
        		this.renderStep('mappingtab');
				setPageLevelHelpKey('IMPORT_MAPPING');
        	}
        	if(this.isLastStep(step)){
        		$('#importstepctr',this.options.parent.el).hide();
        	}
        	else{
        		$('#importstepctr',this.options.parent.el).show();
        	}
        	viewEvents.trigger('wizard:updateRenderStatus',true);
		},
		doSave: function(callback,currentStep,newStep){
			if(this.isLastStep(currentStep)){
				this.saveAndImport();
			} 
			else if(currentStep > 0 && newStep > currentStep){
				this.currentTab.doSave(function(){callback();},function(){viewEvents.trigger('wizard:updateRenderStatus',true);});
			}
			else{
				callback();
			}
		},
		gotoPrev: function(currentStep,callback){
			var self = this;
			if(this.isLastStep(currentStep)){
				this.cancelImport();
			}
			else{
				$('#surveywizardstep .tabheader li a[step="'+(currentStep - 1)+'"]',this.options.parent.el).click();
			}
			
		},
		enableImportBtn: function(event){
			$('#nextBtn', this.el).removeAttr('disabled');
			viewEvents.trigger('wizard:updateRenderStatus',true);
		},
		isLastStep: function(step){
			return step == 3;
		},
		afterRender: function(){
			$('#byodfooter,#tabhead,div.row.titlepanel, #importHeader',this.el).hide();
			this.subStep = -1;
		},
		cancelImportCompleted: function(){ 
			this.options.parent.showStep(2);
			this.afterRender();
		},
		importCompleted: function(){ 
			viewEvents.trigger('wizard:gotoNext');
		},
		hasSubStep: function(){
			return false;
		}
	});
	return Backbone.View.extend({
		className:'no-padding',
		initialize : function() {
			this.currentStep = 0;
			this.opt = {}
			this.SubView = null;
			viewEvents.on('wizard:reloadSurvey',this.reloadSurvey,this);
			this.channelType = this.options.channelDetails['channelType'];
            setPageLevelHelpKey('EDIT_YOUR_RELATIONSHIP_SURVEY');        	
			if(this.options.type == 'import'){
				$.extend(this.opt, this.options);
				this.opt['parent'] = this;	
				this.SubView = ImportView;
				//this.subview = new ImportView(opt);
				this.template = _.template(importsurveytpl);
				setPageLevelHelpKey('IMPORT_FEEDBACK');
			}
			else{
				this.opt = {createSurvey:true,
					      'pageType': 'wizard',
					      isLiveSurvey: false,
					      'localeCode' : 'en_US',
		                  'includeChanges' : "false"
					      };
				this.SubView = SurveyView;
				//this.subview = new SurveyView(opt);
				this.template = _.template(surveysteptpl);
			}
			$(this.el).html(this.template({}));        	
			
        },
        events: {
        	'click #surveywizardstep .tabheader li a': 'selectStep'
        },
    
        render: function(){
        	this.subview = new BaseView({parent:this});
        	this.showStep(this.currentStep);
        	$('.'+this.channelType, this.el).removeClass('hide');
        	viewEvents.trigger('wizard:updateRenderStatus',true);
        	if(this.options.type == 'import'){
        		$('.importVideoContainer', this.el).append(new videoComponent('../passionhelp/en_US/content/resources/multimedia/videocover/Video Covers-03.jpg','../passionhelp/en_US/content/resources/multimedia/Import.mp4','Import').el);
        		
        		$(".videoImgContainer", this.el).each(function(index, element) {
   	        	 var myHeight = Math.round($(window).height() - ( $(this).offset().top + $(".contents10-paging").outerHeight() + 6));
	   	        	if(myHeight > 400){
	        	 		myHeight = 400;
	        	 	}
   	        	    $(this).height(myHeight);
   	        });
        	}else if(this.options.type == 'survey'){
        		$('.surveyVideoContainer', this.el).append(new videoComponent('../passionhelp/en_US/content/resources/multimedia/videocover/Video Covers-05.jpg','../passionhelp/en_US/content/resources/multimedia/Survey.mp4','Survey').el);
        		
        		$(".videoImgContainer", this.el).each(function(index, element) {
   	        	 var myHeight = Math.round($(window).height() - ( $(this).offset().top + $(".contents10-paging").outerHeight() + 6));
	   	        	if(myHeight > 400){
	        	 		myHeight = 400;
	        	 	}
   	        	    $(this).height(myHeight);
   	        });
        	}
        	return this;
        },
        intitSubview: function(step){
        	if(this.initsubview){
        		return this.subview;
        	}
        	if(this.opt['createSurvey']){
        		if(step == 2){
        			this.opt['stepId'] = 'SURVEY_DISTRIBUTE';
        		}
        		this.createSurvey(step);
        		return null;
        	}
        	this.subview = new this.SubView(this.opt);
        	$('#wizstepcontent1',this.el).html(this.subview.render().el);
        	this.initsubview = true;
        	return this.subview;
        },
        createSurvey: function(step){
        	var self = this;
        	$.ajax({
				  global:true,
				  //async:false,
				  url: "../service/program?method=createChannelSurvey",
				  progessTxt: getMessage('WIZARD_SURVEY_CREATION_LOAD_MSG'),
	              data: this.options.channelDetails,
	              complete : function(response){
	            	  if(response.responseText)
	            	    response = JSON.parse(response.responseText);
	            	  if(response.Error)
	            	  {
	            		  showToastMessage('error',(response.Error['message'] || response.Error),'Error');
	            		  viewEvents.trigger('wizard:updateRenderStatus',true);
	            	  }
	            	  else
	            	  {
	            		  window.surveyIdfier = response['datacollectionIdfier'];
	            		  self.opt['datacollectionIdfier'] = response['datacollectionIdfier'];
	            		  self.opt['createSurvey'] = false;
	            		  self.subview.showStep(step);
	            	  }
	              },
        
               error: function (response) {
				
			     }
		      });
        },
        reloadSurvey: function(params){
        	params = params || {};
        	params = $.extend(this.opt,params);
        	if(params.isLiveSurvey){
        		window.surveyIdfier = null;
        	}
        		
        	this.subview = new this.SubView(params);
        	$('#wizstepcontent1',this.el).html(this.subview.render().el);
        	if(params.stepId && params.stepId == 'SURVEY_BUILD' && this.currentStep !=1)
        	{
        		this.showStep(1);
        	}
        },
        selectStep: function(event){
        	event.preventDefault();
            event.stopPropagation();
        	var step = parseInt($(event.currentTarget).attr('step'),0);
        	if($(event.currentTarget).hasClass('validate') && (this.currentStep + 1) < step ){
        		return;
        	}
        	var self = this;
        	this.subview.doSave(function(){
        		self.showStep(step);
        	},this.currentStep,step);
        	viewEvents.trigger('surveywizard:setDistSubStep',{subStep:-1,subView:''});
        },
        showStep: function(step,action){
        	this.subview.showStep(step);
        	this.currentStep = step;
        	$('#surveywizardstep .tabheader li,.tab-content .wiz-tab-pane',this.el).removeClass('active');
        	$('#surveywizardstep .tabheader li a[step="'+step+'"]',this.el).parent('li').addClass('active');
        	$('.tab-content #wizstepcontent'+(step == 0 ? 0 : 1),this.el).addClass('active');
        	$('.stepheader',this.el).hide();
        	$('.stepheader'+step,this.el).show();
        	var per = step * 3;
        	viewEvents.trigger('update:wizardStepConfig',{stepNo:5,percentage:(80 + per),disableScrollTop:this.subview.hasSubStep()},'survey');
        },
        doPrev: function(callback){
        	var self = this;
			if(this.currentStep == 0){
				callback();
			}
			else if(this.subview.gotoPrev){
				this.subview.gotoPrev(this.currentStep,function(){
					$('#surveywizardstep .tabheader li a[step="'+(self.currentStep - 1)+'"]',self.el).click();
				});
			}
			else{
				$('#surveywizardstep .tabheader li a[step="'+(this.currentStep - 1)+'"]',this.el).click();
			}
        },
        doNext: function(callback){
        	//do validate & save and return call back
        	var self = this;
        	if(!this.subview.isLastStep(this.currentStep)){
        		this.subview.doSave(function(){
            		self.showStep(self.currentStep + (self.subview.hasSubStep()? 0 : 1));
            	},this.currentStep,this.currentStep + 1);
        	}
        	else if(this.subview.isLastStep(this.currentStep) && this.subview.hasSubStep()){
        		this.subview.doSave(function(){
        			self.doSave(callback);
            	},this.currentStep,this.currentStep + 1);
        	}
        	else{
        		this.doSave(callback);
        	}        	
        },
        doSave: function(callback)
        {
        	// do necessary save and return
        	callback();
        },
        beforeClose: function(){
        	if(this.subview)
          	{
        		 this.subview.destroy();
          	}
        }
	});	
});