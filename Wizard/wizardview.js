define([
'underscore',
'backbone',
'passion/basepopup',
'passion/confirmdialog',
 'text!passion/wizard/templates/programswitchpopuptpl.html',
 'text!passion/wizard/templates/exploreanalyticspopuptpl.html',
 'text!passion/wizard/templates/demoanalyticspopup.html',
 'text!passion/wizard/templates/wizardtpl.html'
], function(_, Backbone,Popup,ConfirmD,prgmswtchtpl,anapoptpl,demoanpoptpl, wizardtpl) {
	var STEPCONFIG = {
			'welcome':{stepNo:0,percentage:10,firststep:true,options:{}},
			'companyprofile':{stepNo:1,percentage:20,options:{}},
			'addusers':{stepNo:2,percentage:40,options:{}},
			'customergraph':{stepNo:3,percentage:50,popup:'program',options:{}},
			'touchpoints':{stepNo:4,percentage:60,options:{}},
			'listeningposts':{stepNo:5,percentage:70,options:{}},
			'survey':{stepNo:6,percentage:80,customText:true,text: getMessage('WIZARD_SURVEY_STEP_LABEL'),options:{},nonclickable:true},
			'programpriview':{stepNo:7,percentage:90,options:{},skippable:true},
			'learnanalytics':{stepNo:8,percentage:95,options:{}},
			'exploreanalytics':{stepNo:9,percentage:100,laststep:true}
			};
	var STEPS = ['welcome','companyprofile','addusers','customergraph','touchpoints','listeningposts','survey','programpriview','learnanalytics','exploreanalytics'];
	var StepPopup = Popup.extend({
		events: {
			'click a.gotostep'  	  : 'gotoStep',
			'click .close'  	  : 'close'
		},
		postinitialize: function () {
			var tpl = prgmswtchtpl;
			this.clicked = false;
			if(this.options.analytics){
				tpl = anapoptpl;
			}
			else if(this.options.demoanalytics){
				tpl = demoanpoptpl;
			}
			this.template = _.template(tpl);
			$(this.bodyel).html(this.template({}));
			this.headel.addClass('hide');
            this.footel.addClass('hide');
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
            	this.options.parent.goToStep($(event.currentTarget).attr('step'),"true" == $(event.currentTarget).attr('skipped'));
            }
            this.close();
		}
	});
	return Backbone.View.extend({
		className:'templateselection',
		initialize : function() {
			$('#process-step-container',this.el).css('minHeight',$('#left-panel').css('minHeight'));
			$('#ribbon').hide();
			$('body').addClass('minified').removeClass("fixed-ribbon");
			/*_.bindAll(this, 'showWizFooter');
			$(window).bind('scroll', this.showWizFooter);*/
			this._completedStep = 0;
			this._currentStep =	null;
			window.surveyIdfier = null;
            this._currentStepId = 'welcome';
            this.stepCtrMHeight = 300;
            this.canSetupProgram = !!userAppservices['SURVEYS_LIST_PAGE'];
            if(this.options.programExist){
            	this._currentStepId = 'customergraph';
            }
            if(!this.canSetupProgram){
            	this._currentStepId = 'learnanalytics';
            	STEPCONFIG['learnanalytics']['firststep'] = true;
            }
            if(this.options.programExist != undefined){
            	window.programExist = this.options.programExist;
            }
            this.checkProgramExist();
            this.template = _.template(wizardtpl);
			viewEvents.on('update:wizardStepConfig', this.updateStepConfig,this);
			viewEvents.on('wizard:gotoNext', this.gotoNext,this);
			viewEvents.on('wizard:toggleWizFooter', this.enableToggleWizFooter,this);
			viewEvents.on('wizard:updateRenderStatus', this.updateRenderStatus,this);
        },
        events: {
            'click #wizard-nextbutton' : 'doNextStep',
            'click #wizard-previousbutton' : 'doPrevStep',
            'click li.wizard-step,.wizard-parent li' : 'selectStep',
            'click a.closewizard': 'close'
        },
    
        render: function(){
        	$(this.el).html(this.template({data:this.options,canSetupProgram:this.canSetupProgram}));
        	$('#process-step-container .hasscroll', this.el).css({
				 maxHeight:this.stepCtrMHeight
			});
        	$('#process-step-container .hasscroll', this.el).enscroll({
                showOnHover: true,
                horizontalScrolling: false,
                verticalTrackClass: 'vertical-track',
                verticalHandleClass: 'vertical-handle',
                horizontalTrackClass: 'horizontal-track',
                horizontalHandleClass: 'horizontal-handle'
            });
            this.goToStep(this._currentStepId);            
            return this;
        },
        checkProgramExist: function(){
        	var self = this;
        	$.ajax({
                global: true,
                async: false,
                url: '../service/program?method=getProgramSetupStatus',
                type: 'POST',
                success: function(data) {
                	window.programExist = !!data['programExist'];
                	if(data['mapping']){
                		self._completedStep = STEPS.length;
                		self.mapping = true;
                	}
                	else{
                		if(programExist){
                			self._completedStep = 3;
                		}
                		if(!isDemoEnterprise)
                		{
                			$('#wizardflow').removeClass('hide');
                		}
                		$('#wizardflow-header').addClass('hide');
                	}
                }
            });
        },
        showPopup: function(type){
        	var opt = {width: '550',height: 'auto',parent:this};
        	opt[type] = true;
        	var popup = new StepPopup(opt);
        	popup.show();
        	this.updateRenderStatus(true);
        },
        updateRenderStatus: function(status){
        	this.pageRendered = !!status;
        	if(this.pageRendered){
        		this.updateCtrHeight();
        		stopGlobalLoader();
        	}
        	else{
        		showGlobalLoader();
        	}
        },
        updateCtrHeight: function(){
        	var height = parseInt($('#left-panel').css('minHeight'));
        	var self = this;
        	$('#process-step-container',self.el).css('minHeight',height);
        	height = height - 30 - $('#process-step-container .processing-box',this.el).outerHeight(true) - $('#process-step-container .processing-close',this.el).outerHeight(true) - $('#process-step-container .heading',this.el).outerHeight(true);
        	if(this.stepCtrMHeight > 50){
        		this.stepCtrMHeight = height;
        	}
        	var scrollCrt = $('#process-step-container .hasscroll', this.el);
        	scrollCrt.css({
				 maxHeight:this.stepCtrMHeight
			});
        	setTimeout(function(){
        		scrollCrt = $('#process-step-container .hasscroll', self.el);
            	if(scrollCrt[0].scrollHeight > scrollCrt[0].clientHeight){
            		scrollCrt.scrollTop(scrollCrt[0].scrollHeight - 40);
            	}
        	},200);
        	
        },
        selectStep: function(event)
        {
        	event.preventDefault();
            event.stopPropagation();
            if(!this.pageRendered || $(event.currentTarget).hasClass('notselectable')){
            	return;
            }
            this.updateRenderStatus(false);
        	var step = $(event.currentTarget).attr('step');
        	if($(event.currentTarget).hasClass('wizard-parent')){
        		step = $(event.currentTarget).attr('startstep');
        	}
        	step = parseInt(step);
        	if(step > this._completedStep || (this.skippedStepNo && step > this.skippedStepNo)){
        		this.updateRenderStatus(true);
        		return;
        	}
        	
        	this.goToStep(STEPS[step]);
        },
        handleStep: function(stepId,event)
        {
        	var self = this;
            if(this._currentStep)
        	{
                this._currentStep.doSave.call(this._currentStep, function(){
                	self._currentStep.destroy();
                	self.goToStep(stepId);
                });
                self._currentStep.destroy();
        	}
        	self.goToStep(stepId);
        },
        abandonSurvey: function(stepId){
        	var self = this;
        	if(stepId && window.surveyIdfier){
        		$.ajax({
                    global: true,
                    url: '../service/surveyManager?method=deleteSurvey&surveyId=-1&surveyIdfier='+window.surveyIdfier,
                    success: function(data) {
                    	window.surveyIdfier = null;
                    	self.goToStep(stepId);
                    }
                });
        	}
        	else{
        		self.goToStep(stepId);
        	}
        },
        doPrevStep: function(event)
        {
        	 event.preventDefault();
             event.stopPropagation();
             if(!this.pageRendered || this.stepIdex<1 || $(event.currentTarget).hasClass('disable-page'))
             {
            	 return;
             }
             this.updateRenderStatus(false);
             var self = this;
             var stepIdex = this.stepIdex;
             if(this._currentStep && this._currentStep.doPrev)
         	 {
                 this._currentStep.doPrev.call(this._currentStep, function(){
                	 stepIdex--;
                     self.goToStep(STEPS[stepIdex]);
                 });
                 if(!this.disableScrollTop)window.scrollTo(0, 0);
                 return;
         	 }
             stepIdex--;             
             if(STEPCONFIG[STEPS[stepIdex]].skippable && this.skippedStep)
             {
            	 this.goToStep(this.skippedStep);
            	 this.skippedStep = null;
            	 return;
             }
             else if(STEPCONFIG[STEPS[stepIdex]].nonclickable){
            	 stepIdex--;
             }
             this.goToStep(STEPS[stepIdex]);
             
        },
        doNextStep: function(event)
        {
        	 event.preventDefault();
             event.stopPropagation();
             var self = this;
             if(!this.pageRendered){
            	 return;
             }
             this.updateRenderStatus(false);
             if(this._currentStep && this._currentStep.doNext)
         	 {
                 this._currentStep.doNext.call(this._currentStep, function(){
                 	self.gotoNext();
                 });
                 if(!this.disableScrollTop)window.scrollTo(0, 0);
                 return;
         	 }
             this.gotoNext();
        },
        gotoNext: function(){
        	var stepIdex = this.stepIdex  + 1;
        	
        	if(stepIdex < STEPS.length ){
            	if(STEPCONFIG[STEPS[stepIdex]].popup){
            		this.showPopup(STEPCONFIG[STEPS[stepIdex]].popup);
            		return;
            	}
        		this.goToStep(STEPS[stepIdex]);
        	}
        	else{
        		//close
        		$('#wizardflow').addClass('hide');
        		if(!isDemoEnterprise)
        		{
        			$('#wizardflow-header').removeClass('hide');
        		}
        		this.close();
        	}
        },
        close: function(){
        	$('body').removeClass("minified");
        	Backbone.history.navigate("home", true);
        },
        destroyOldStep: function(stepId)
        {
        	if(this._currentStep)
        	{
                this._currentStep.destroy();
        	}
        },
        updateStepText: function(config,stepId){
        	if(config.customText && config.text){
        		$('#wizard_'+stepId+' em',this.el).text(config.text);
        	}
        },
        updateStepConfig: function(config,stepId,updateConfig){
        	config = config ||  STEPCONFIG[stepId];
        	if(stepId && updateConfig){
        		STEPCONFIG[stepId] = config;
        		this.updateStepText(config,stepId);
        		return;
        	}
        	this.disableScrollTop = !!config.disableScrollTop;
        	$('#wizard_progressbar .processing-bar-completed',this.el).css('width',config.percentage+'%');
        	$('.wizard-buttons',this.el).removeClass('disable-page hide');
        	if(config.firststep){
        		$('#wizard-previousbutton',this.el).addClass('disable-page hide');
        		$('#wizard-nextbutton',this.el).parent().addClass('single-btn');
        	}
        	else{
        		$('#wizard-nextbutton',this.el).parent().removeClass('single-btn');
        	}
        	if(config.laststep){
        		$('#wizard-nextbutton',this.el).removeClass('text-left').addClass('done text-center').text(getMessage('WIZARD_DONE_BTN'));
        	}
        	else if(this.skippedStep){
        		$('#wizard-nextbutton',this.el).removeClass('text-left').addClass('done text-center').text(getMessage('WIZARD_GOTOAPP_BTN'));
        	}
        	else{
        		$('#wizard-nextbutton',this.el).removeClass('done text-center').addClass('text-left').html(getMessage('WIZARD_NEXT_BTN')+'<i class="icon-arrowthin-right right"></i>');
        	}
        },
        goToStep: function(stepId,skippedStep)
        {
        	this.updateRenderStatus(false);
        	$('li.wizard-step',this.el).removeClass('active-step');
        	var stepNo = parseInt($('#wizard_'+stepId,this.el).attr('step'),0);
        	var self = this;
        	if(stepNo < 6 && window.surveyIdfier){
        		var confirmD = new ConfirmD({okLabel: localeMsgs["label.yes"], cancelLabel: localeMsgs["label.no"], 'message': getMessage('WIZARD_DISCARD_SURVEY_CONF')});
        		confirmD.on("ok", function() {
                    self.abandonSurvey(stepId);
                });
        		self.updateRenderStatus(true);
        		return;
        	}
        	if(skippedStep){
        		this.skippedStep = this._currentStepId;
        		if(!this.mapping){
        			this.skippedStepNo = this.stepIdex;
        		}
        		$('#wizard_exploreanalytics',this.el).addClass('hide');
        	}
        	else if(stepNo < 7){
        		if(this.skippedStepNo && this.skippedStepNo >= stepNo){
        			this._completedStep = this.skippedStepNo + 1;
        		}
        		this.skippedStep = null;
        		this.skippedStepNo = null;
        		$('#wizard_exploreanalytics',this.el).removeClass('hide');
        	}
        	else{
        		window.surveyIdfier = null;
        	}
        	
        	this.stepIdex = stepNo;
        	this._currentStepId = stepId;
        	if(this._completedStep < stepNo){
        		this._completedStep = stepNo;
        	}
        	
        	/*if(stepEl.parent('ul').hasClass('child')){
        		stepEl.parent('ul').find('li').removeClass('active-sub-step');
        		stepEl.addClass('active-sub-step');
        		stepEl.parents('li').addClass('active-step');
        	}
        	else{
        		stepEl.addClass('active-step');
        	}*/
        	$('.completedstep,.currentstep',this.el).hide();
        	var found = false;
        	var completedStep = this._completedStep;
        	$('li.wizard-step',this.el).each(function(){
        		var sno = parseInt($(this).attr('step'),0);
        		 $(this).find('a').removeClass('cursor-default');
        		 if($(this).hasClass('wizard-parent')){
        			var start = parseInt($(this).attr('startstep'),0);
        			if(start <= stepNo && sno >= stepNo){
        				$(this).find('ul > li').removeClass('active-sub-step');
        				$(this).addClass('open').find('ul').show('slow');
        				$(this).find('ul > li').each(function(){
        					
        					sno = parseInt($(this).attr('step'),0);
        					$(this).removeClass('completed-step')
        					if(sno == stepNo){
        						$(this).attr('status','current step').addClass('active-sub-step');
        					} 
        					if(sno < completedStep){
        						$(this).attr('status','completed step').addClass('completed-step');
        	        			$('.completedstep',$(this)).show();
        	        		}
        					else if(sno != stepNo){
        						$(this).attr('status','not started');
        						$(this).find('a').addClass('cursor-default');
        					}
        				});
        				$(this).attr('status','current step').addClass('active-step');
        				$('.currentstep',$(this)).show();
        				found = true;
        			}else if(sno < completedStep && (!($(this).hasClass('programstep')) || self.mapping || !self.skippedStep)){
        				$(this).attr('status','completed step').removeClass('open').find('ul').hide();
        				$('.completedstep',$(this)).show();
        			}else if(sno > stepNo){
        				$(this).attr('status','not started').removeClass('open').find('ul').hide();
        				$(this).find('a').addClass('cursor-default');
        			}
        		} else if(sno == stepNo){
        			$(this).attr('status','current step').addClass('active-step');
        			$('.currentstep',$(this)).show();
        			found = true;
        		} else if(sno < completedStep){
        			$(this).attr('status','completed step');
        			$('.completedstep',$(this)).show();
        			if($(this).hasClass('wizard-parent')){
        				$(this).removeClass('open').find('ul').hide();
        			}
        		}
        		
        		 
        	});
        	var stepName = null;
        	var options = STEPCONFIG[stepId]['options'] || {parent:this};
        	switch(stepNo)
        	{
        	   case 1 : stepName = "passion/wizard/companyprofileview";  //companyprofile 
        	            setPageLevelHelpKey('COMPANY_PROFILE');
        		   	    break;
        	   case 2 : stepName = "passion/wizard/addusersview";  //addusers   
        	            setPageLevelHelpKey('ADD_USERS'); 
                        break;
        	   case 3 : stepName = "passion/wizard/learncustomergraphview";  //learn customergraph 
        	            setPageLevelHelpKey('CUSTOMER_GRAPH_VIEW'); 
               			break;
        	   case 4 : stepName = "passion/wizard/touchpointsview";  //learn touchpoints 
        	            setPageLevelHelpKey('TOUCHPOINTS'); 
               			break;
        	   case 5 : stepName = "passion/wizard/listeningpostsview";  //learn listening posts 
        	            setPageLevelHelpKey('LISTENING_POSTS'); 
               			break;
        	   case 6 : stepName = "passion/wizard/surveycreationview";  //survey creation    
        	            setPageLevelHelpKey('LISTENING_POSTS_2'); 
        	            break;
        	   case 7 : stepName = "passion/wizard/programpriview";  //program priview     
        	            setPageLevelHelpKey('INTRO_TO_PROGRAM_VIDEO'); 
               			break;    
        	   case 8 : stepName = "passion/wizard/learnanalyticsview";  //learn analytics        	   
        	            setPageLevelHelpKey('ANALYTICS_VIDEO'); 
      					break; 
        	   case 9 : stepName = "passion/wizard/exploreanalyticsview";  //explore analytics  
        	            options['skippedStep'] = !!this.skippedStep;
        	            if(options['skippedStep']){
        	            	switchEnterprise();
        	            	this.stepIdex = stepNo - 1;
        	            	return;
        	            }
        	            setPageLevelHelpKey('FINAL_WIZARD_PAGE'); 
					break; 		

        	   default: 
        		        stepName = "passion/wizard/welcomeview";
        	            setPageLevelHelpKey('GETTING_STARTED_WIZARD'); 
        	}
        	this.destroyOldStep(stepId);
        	$.extend(options, this.options);
        	this.updateStepConfig(STEPCONFIG[stepId]);
        	this.enableToggleWizFooter(false);
        	
            require([stepName], function (Step) {
                var step = new Step(options);                
                self._currentStep = step;
                $('#wizard-stepcontent',self.el).html(step.el);
                step.render();
                //self.updateRenderStatus(true);;
                self.updateCtrHeight();
                window.scrollTo(0, 0);
            });
            
        },
        enableToggleWizFooter: function(enable){
        	if(enable){
        		this.toggleWFooter = true;
        		$('#wizard-footer',this.el).removeClass("active");
        	}
        	else{
        		this.toggleWFooter = false;
        		$('#wizard-footer',this.el).addClass("active");
        	}
        },
        showWizFooter: function(){
        	if(!this.toggleWFooter) return;
        	var h = Math.abs($(document).height() - $(window).height()) - $('#wizard-footer',this.el).height();
        	if($(window).scrollTop() > h){
        		$('#wizard-footer',this.el).addClass("active")
        	}
        	else{
        		$('#wizard-footer',this.el).removeClass("active")
        	}
        },
        beforeDestroy: function(){
        	//$(window).unbind('scroll', this.showWizFooter);
        	this.destroyOldStep(this._completedStep);
        },
        beforeClose : function() {
        	this.beforeDestroy();
        }
	});	
});