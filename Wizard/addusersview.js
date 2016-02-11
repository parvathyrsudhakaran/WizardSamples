define([
  'underscore',
  'backbone',
  'text!passion/wizard/templates/adduserstpl.html'
], function(_, Backbone, adduserstpl) {
	
	var UserView = Backbone.View.extend({
        tagName: 'tr',
        className: 'wizard_user',
        
        events: {
            'change input': 'valueChanged',
            'click .delete_user': 'deleteUser'
        },
        
        initialize: function(flag) {
            this.deleteFlag = flag;
            this.model.view = this;
        },
        
        render: function() {
            $(this.el).html(this.getTpl());
            return this;
        },
        
        getTpl: function() {
        	var deleteUserContent = '';
            var random_id = (new Date().getTime() - 1200000000000);
        	if (this.options.deleteFlag != undefined && this.options.deleteFlag) {
        		deleteUserContent = '<td id="'+random_id+'" class="user_table_col4 delete_user" classname="user_table_col4" ><i class="fa fa-minus-circle user_delete_flag" classname="fa fa-minus-circle" ></i></td>';
        	} else {
        		deleteUserContent = '<td id="'+random_id+'" class="user_table_col4" classname="user_table_col4" ></td>';
        	}

            return ('<td class="user_table_col1" classname="user_table_col1"><input type="text" class="form-control first-name" classname="form-control" placeholder="First Name" value="'+this.model.get('firstname')+'" maxlength="50">'+
            		'</td><td class="user_table_col2" classname="user_table_col2"><input type="text" class="form-control last-name" classname="form-control" placeholder="Last Name" value="'+this.model.get('lastname')+'" maxlength="50"></td>'+
  		          '<td class="user_table_col3" classname="user_table_col3"><input type="text" class="form-control email" classname="form-control" placeholder="Email"value="'+this.model.get('email')+'"></td>'+deleteUserContent);
        },
        
        valueChanged: function() {
        	this.model.set('firstname', $('input.first-name', this.el).val().trim());	
        	this.model.set('lastname', $('input.last-name', this.el).val().trim());
        	this.model.set('email', $('input.email', this.el).val().trim());
        },

        deleteUser: function(event, deleteFlag) {
        	this.model.collection.remove(this.model);
        	if (deleteFlag != true) {
        		this.options.parentView.trigger('delete:error',event);
        	}
    		
        },
        
        resetUser: function() {
        	this.model.set('firstname','');
        	this.model.set('lastname','');
        	this.model.set('email','');
        	this.validEmailFlag = true;
        	this.mandatoryFlag = true;
        	this.uniqueEmailFlag = true;
        	this.nodata = false;
        	$(this.el).html(this.getTpl());
        },
        
        validateUser: function(validemails){
        	this.validEmailFlag = true;
        	this.mandatoryFlag = true;
        	this.uniqueEmailFlag = true;
        	this.nodata = false;
        	var validemails = validemails;
        	var isValid = true;
        	var firstName = this.model.get('firstname');
        	var lastname = this.model.get('lastname');
        	var email = this.model.get('email');
	        if (firstName.length || lastname.length || email.length) {
	        	//validate first name
	        	if (!firstName.length)  {
	        		$('.user_table_col1', this.el).addClass('state-error');
					isValid = false;
				}
	        	else{
					$('.user_table_col1', this.el).removeClass('state-error');
				}
	        	//validate last name
	        	if (!lastname.length)  {
	        		$('.user_table_col2', this.el).addClass('state-error');
					isValid = false;
				}
	        	else{
					$('.user_table_col2', this.el).removeClass('state-error');
				}
	        	
	        	//Check validity and uniqueness of email
	        	if (!this.validateEmail(email) || !email.length) {
	        		$('.user_table_col3', this.el).addClass('state-error');
	        		if (email.length) {
	        			this.validEmailFlag = false;
	        		}
	        		isValid = false;
	        	}
	        	else{
		       		if (!_.contains(validemails, email.toLowerCase()) ) {
		       			$('.user_table_col3', this.el).removeClass('state-error');
		       		} 
		       		else {
		       			this.uniqueEmailFlag = false;
		       			isValid = false;
		       			$('.user_table_col3', this.el).addClass('state-error');
		       		}
				}
	            	
	        	//Set mandatory flag 
	        	if (!(firstName.length && lastname.length && email.length)) {
	        		this.mandatoryFlag = false;
	        	}
        	}
	        else{
	        	this.nodata = true;
	        	$('.user_table_col1', this.el).removeClass('state-error');
	        	$('.user_table_col2', this.el).removeClass('state-error');
	        	$('.user_table_col3', this.el).removeClass('state-error');
	        }
        	
        	return isValid;
        },
        
        //Validate email address
        validateEmail: function($email) {
        	var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        	if( !emailReg.test( $email ) ) {
        		return false;
        	} else {
        		return true;
        	}
        }
        
    });
	
	
	return Backbone.View.extend({
		className:'no-padding',
		
		events: {
            'click #add-users': 'addUsers',
            'click #wizard-nextbutton': 'doNext'
        },
        
        initialize: function() {
        	var self = this;
        	this.deleteFlag = false
        	this.template = _.template(adduserstpl);
        	this.users = new Backbone.Collection();
            this.users.on("add", this.addUser, this);
        	this.nodataFlag = true;
        },
        
        render: function() {
        	$(this.el).html(this.template);
        	this.users.add(new Backbone.Model());
        	this.users.add(new Backbone.Model());
            this.on('delete:error',this.deleteError,this);
            viewEvents.trigger('wizard:updateRenderStatus',true);
            return this;
        },
        
        addUsers: function(){
        	this.deleteFlag = true;
        	this.users.add(new Backbone.Model());
        },
        
        addUser: function(model) {
        	model.set('firstname','');
        	model.set('lastname','');
        	model.set('email','');
            var userview = new UserView({model: model, deleteFlag: this.deleteFlag, parentView: this});
            userview.render();
            $('#user_table_labels tr:last', this.el).after(userview.el);
            $('#user_table_labels tr:last', this.el).after('<tr class="hide txt-color-red form-error-table error_row"><td class="user_table_col1"><em class="invalid">'+localeMsgs['USER.EDIT.PAGE.MANDATORY.ERROR.MESSAGE']+'</em></td><td class="user_table_col2"><em class="invalid">'+localeMsgs['USER.EDIT.PAGE.MANDATORY.ERROR.MESSAGE']+'</em></td><td class="user_table_col3"><em class="invalid">'+localeMsgs['USER.EDIT.PAGE.MANDATORY.ERROR.MESSAGE']+'</em></td><td class="user_table_col4"></td></tr>');
        },
        
        deleteError: function(event)
        {
        	var deleteColumn = event.currentTarget;
        	$(deleteColumn, this.el).parent().next().remove();
        	$(deleteColumn, this.el).parent().remove();
        },
        
        saveUsers: function(callback){
        	var self = this;
        	var isValid = this.validateMandatoryFields();
        	
        	if (isValid && !this.nodataFlag) 
        	{
	        	$.ajax({
	    			type:'POST',
	    			global:true,
	    			progessTxt:localeMsgs['PROGRESS_ALERT_SAVING'],
	    			url: '../service/user?method=createUsers',
	    			data: {'users': JSON.stringify(self.userData)},
	    			success: function(data) {
	    				//var resultMp = JSON.parse(data.responseText);
	    				if(data["ERROR"] == true)
    					{
    						if (data["SUCCESS_MAIL_LIST"] != undefined) 
    						{
    							_.each(data["SUCCESS_MAIL_LIST"], function(userEmail) 
								{
	    							var SuccessUserModel = _.find(self.users.models,function(user)
	    							{ 
	    								return user.get('email') == userEmail;
	    							});
	    							
	    							var updateErrorColumn = SuccessUserModel.view.$el;
	    							if ($("i", updateErrorColumn).hasClass('user_delete_flag') == true) 
	    							{
	    								SuccessUserModel.view.deleteUser(null, true);
	    								$(updateErrorColumn, this.el).next().remove();
		    							$(updateErrorColumn, this.el).remove();
	    							} 
	    							else 
	    							{
	    								SuccessUserModel.view.resetUser();
	    								$(updateErrorColumn, this.el).next().addClass('hide');
	    							}
	    							
	    							if ('N' == Hubspot_Tracking["DISABLE_HUBSPOT_TRACKING"] && isTrialEnterprise) {
                            			var JSONHBUserDetails = {};
                            			JSONHBUserDetails[Hubspot_Tracking["hb_tracking_enterprise_name"]] = enterpriseName;
                            			JSONHBUserDetails[Hubspot_Tracking["hb_tracking_email"]] = userEmail;
                            			JSONHBUserDetails[Hubspot_Tracking["hb_tracking_first_name"]] = SuccessUserModel.get('firstname');
                            			JSONHBUserDetails[Hubspot_Tracking["hb_tracking_last_name"]] = SuccessUserModel.get('lastname');
                            			trackHBEvent(Hubspot_Tracking["free_trial_new_user_event_id"], JSONHBUserDetails);
                            		}
								});
    	    					showToastMessage("success", 'Success', localeMsgs['USER.EDIT.PAGE.SAVED.MESSAGE'].replace(/\{0\}/g,data["SUCCESS_MAIL_LIST"].length),true);
    						}
    						_.each(data["FAILED_MAIL_LIST"], function(errorMap, userEmail)
							{
    							var FailureUserModel = _.find(self.users.models,function(user)
    							{ 
    								return user.get('email') == userEmail;
    							});
    							
    							var updateErrorColumn = FailureUserModel.view.$el;
    							$(($("td:nth-child(3)", updateErrorColumn)), this.el).addClass('state-error');
    							if ('ERROR.PARTY.NOT.UNIQUE.5' == errorMap.errorcode || 'ERROR.USER.BLACKLISTED.EMAIL.0' == errorMap.errorcode || 'ERROR.USERNAME.MUSTBE.UNIQUE.5' == errorMap.errorcode ) {
    								$(updateErrorColumn, this.el).next().html('<td class="user_table_col1"><em class="invalid"></em></td><td class="user_table_col2"><em class="invalid"></em></td><td class="user_table_col3"><em class="invalid">'+errorMap.errors+'</em></td><td class="user_table_col4"></td>');
    							}
    							else {
    								$(updateErrorColumn, this.el).next().html('<td class="user_table_col2" colspan="4"><em class="invalid">'+errorMap.errors+'</em></td>');
    							}
    							$(updateErrorColumn, this.el).next().removeClass('hide');
							});
    						viewEvents.trigger('wizard:updateRenderStatus',true);
	    				}
		    			else 
		    			{
		    				_.each(data["SUCCESS_MAIL_LIST"], function(userEmail) 
							{
    							var SuccessUserModel = _.find(self.users.models,function(user)
    							{ 
    								return user.get('email') == userEmail;
    							});
    							
    							if ('N' == Hubspot_Tracking["DISABLE_HUBSPOT_TRACKING"] && isTrialEnterprise) {
                        			var JSONHBUserDetails = {};
                        			JSONHBUserDetails[Hubspot_Tracking["hb_tracking_enterprise_name"]] = enterpriseName;
                        			JSONHBUserDetails[Hubspot_Tracking["hb_tracking_email"]] = userEmail;
                        			JSONHBUserDetails[Hubspot_Tracking["hb_tracking_first_name"]] = SuccessUserModel.get('firstname');
                        			JSONHBUserDetails[Hubspot_Tracking["hb_tracking_last_name"]] = SuccessUserModel.get('lastname');
                        			trackHBEvent(Hubspot_Tracking["free_trial_new_user_event_id"], JSONHBUserDetails);
                        		}
							});
		    				self.users.reset();
		    				$("#user_table_labels", self.el).find("tr:gt(0)").remove();
		    				self.users.add(new Backbone.Model());
		    	        	self.users.add(new Backbone.Model());
		    	        	self.userData = [];
		    	        	//showToastMessage("success", 'Success', data["MESSAGE"],true);
		    	        	showToastMessage("success", 'Success', localeMsgs['USER.EDIT.PAGE.SAVED.MESSAGE'].replace(/\{0\}/g,data["SUCCESS_MAIL_LIST"].length),true);
		    				callback();
		    			}
					}, 
					error: function(jqXHR, status, data) {
					}
	    		});
        	}
        	else if (this.nodataFlag){
        		callback();
        	}
        	else{
        		viewEvents.trigger('wizard:updateRenderStatus',true);
        	}
        	
        },
        
        validateMandatoryFields: function(){
        	var modelCount = 0 ;
        	var errorRowCount = 0;
        	this.validEmailFlag = true;
        	this.mandatoryFlag = true;
        	this.uniqueEmailFlag = true;
        	this.nodataFlag = true;
        	this.userData = [];
        	this.validemails = [];
        	var self = this;
        	var isValid = true;
        	 _.each(this.users.models, function(user) {
        		modelCount++;
        		errorRowCount = 2*modelCount+1;
             	var data = {};
                var valid = user.view.validateUser(this.validemails);
                //Set Mandatory, Valid and Unique email flags
                if (user.view.uniqueEmailFlag && user.view.validEmailFlag) {
                	this.validemails.push(user.get('email').toLowerCase());
                }
                this.mandatoryFlag = this.mandatoryFlag && user.view.mandatoryFlag;
            	this.validEmailFlag = this.validEmailFlag && user.view.validEmailFlag;
            	this.uniqueEmailFlag = this.uniqueEmailFlag && user.view.uniqueEmailFlag;
            	this.nodataFlag = this.nodataFlag && user.view.nodata;
        		$("#user_table_labels tr:nth-child("+errorRowCount+")", this.el).html('<td class="user_table_col1"><em class="invalid">'+localeMsgs['USER.EDIT.PAGE.MANDATORY.ERROR.MESSAGE']+'</em></td><td class="user_table_col2"><em class="invalid">'+localeMsgs['USER.EDIT.PAGE.MANDATORY.ERROR.MESSAGE']+'</em></td><td class="user_table_col3"><em class="invalid">'+localeMsgs['USER.EDIT.PAGE.MANDATORY.ERROR.MESSAGE']+'</em></td><td class="user_table_col4"></td>');
            	if (!(user.view.mandatoryFlag && user.view.validEmailFlag && user.view.uniqueEmailFlag)) {
            		$("#user_table_labels tr:nth-child("+errorRowCount+")", this.el).removeClass('hide');
            		if (user.get('firstname').length) {
            			$("#user_table_labels tr:nth-child("+errorRowCount+") td:nth-child(1)", this.el).empty();
            		}
            		else {
            			$("#user_table_labels tr:nth-child("+errorRowCount+") td:nth-child(1)", this.el).html('<em class="invalid">'+localeMsgs['USER.EDIT.PAGE.MANDATORY.ERROR.MESSAGE']+'</em>');
            		}
            		
            		if (user.get('lastname').length) {
            			$("#user_table_labels tr:nth-child("+errorRowCount+") td:nth-child(2)", this.el).empty();
            		}
            		else {
            			$("#user_table_labels tr:nth-child("+errorRowCount+") td:nth-child(2)", this.el).html('<em class="invalid">'+localeMsgs['USER.EDIT.PAGE.MANDATORY.ERROR.MESSAGE']+'</em>');
            		}
            		
            		if (user.get('email').length) {
            			$("#user_table_labels tr:nth-child("+errorRowCount+") td:nth-child(3)", this.el).empty();
            		}
            		else {
            			$("#user_table_labels tr:nth-child("+errorRowCount+") td:nth-child(3)", this.el).html('<em class="invalid">'+localeMsgs['USER.EDIT.PAGE.MANDATORY.ERROR.MESSAGE']+'</em>');
            		}
            		
            		if (user.view.validEmailFlag && user.get('email').length) {
            			$("#user_table_labels tr:nth-child("+errorRowCount+") td:nth-child(3)", this.el).empty();
            		}
            		else if (!user.view.validEmailFlag) {
            			$("#user_table_labels tr:nth-child("+errorRowCount+") td:nth-child(3)", this.el).html('<em class="invalid">'+localeMsgs['USER.EDIT.PAGE.VALID.ERROR.MESSAGE']+'</em>');
            		}
            		
            		if (user.view.uniqueEmailFlag && user.get('email').length && user.view.validEmailFlag) {
            			$("#user_table_labels tr:nth-child("+errorRowCount+") td:nth-child(3)", this.el).empty();
            		}
            		else if (!user.view.uniqueEmailFlag){
            			$("#user_table_labels tr:nth-child("+errorRowCount+") td:nth-child(3)", this.el).html('<em class="invalid">'+localeMsgs['USER.EDIT.PAGE.UNIQUE.ERROR.MESSAGE']+'</em>');
            		}
            		
            	}
            	if (user.view.nodata || valid) {
            		$("#user_table_labels tr:nth-child("+errorRowCount+")", this.el).addClass('hide');
            	}
                isValid = isValid && valid;
                //Set Valid user data
                if (valid && !user.view.nodata) {
	                data['personFNameT'] = user.get('firstname');
	                data['personLNameT'] = user.get('lastname');
	                data['primaryEmailAddressIdfier'] = user.get('email');
	                self.userData.push(data);
                }
             }, this);
        	 
        	 //Show toast message
        	 /*if (!isValid) {
        		 
        		 if (!this.mandatoryFlag) {
        			 showToastMessage("error", '', localeMsgs['USER.EDIT.PAGE.MANDATORY.ERROR.MESSAGE'],true);
        		 }
        		 if (!(this.validEmailFlag || this.uniqueEmailFlag)) {
        			 showToastMessage("error", '', localeMsgs['USER.EDIT.PAGE.VALID.UNIQUE.ERROR.MESSAGE'],true);
        		 }
        		 else if (!this.validEmailFlag) {
        			 showToastMessage("error", '', localeMsgs['USER.EDIT.PAGE.VALID.ERROR.MESSAGE'],true);
        		 } 
        		 else if (!this.uniqueEmailFlag){
        			 showToastMessage("error", '', localeMsgs['USER.EDIT.PAGE.UNIQUE.ERROR.MESSAGE'],true);
        		 }
        	 }*/
        	 
        	 return isValid;
        },
        
        doNext: function(callback){
        	//do validate & save and return call back
        	this.saveUsers(callback);
        },
        doSave: function(callback)
        {
        	this.saveUsers(callback);
        },
        beforeClose: function(){
        	this.users.clear();
        }
	});	
});