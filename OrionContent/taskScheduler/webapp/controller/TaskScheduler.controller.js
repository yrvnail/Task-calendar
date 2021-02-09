sap.ui.define([
	"taskScheduler/controller/BaseController",
	"taskScheduler/model/formatter",
	"sap/ui/core/ValueState",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(BaseController, formatter, ValueState, MessageToast, MessageBox) {
	"use strict";

	return BaseController.extend("taskScheduler.controller.TaskScheduler", {

		formatter: formatter,

		onInit: function() {
			var oTasksModel = this.getOwnerComponent().getModel("tasks");
			this.setModel(oTasksModel, "tasks");

			this._oTasksCalendar = this.byId("TasksPlanningCalendar-M");

			this._oAddNewTaskMDialog = this.byId("AddNewTask-MDialog");
			this._oAddNewEmployeeMDialog = this.byId("AddNewEmployee-MDialog");

			this._oNewTaskTypeMSelect = this.byId("NewTaskType-MSelect");
			this._oNewTaskDescriptionMInput = this.byId("NewTaskDescription-MInput");
			this._oNewTaskDateMPicker = this.byId("NewTaskDate-MPicker");
			this._oNewTaskHoursMInput = this.byId("NewTaskHours-MInput");

			this._oAddNewEmployeeNameMInput = this.byId("AddNewEmployeeName-MInput");

		},

		onAfterRendering: function() {
			var oTaskModel = this.getModel("tasks");
			oTaskModel.pSequentialImportCompleted.then(function() {

			}.bind(this));
		},

		assignTaskToUser: function(oTask, oUser) {

		},

		addNewTaskToPool: function(oEvent) {
			this._oAddNewTaskMDialog.open();
		},

		onCreateUserPress: function(oEvent) {
			this._oAddNewEmployeeMDialog.open();
		},

		onPressAddNewTaskOk: function(oEvent) {
			var oTaskModel = this.getModel("tasks");
			var oNewTask = {
				"TaskId": oTaskModel.getProperty("/TaskIdCounter"),
				"iconId": this._oNewTaskTypeMSelect.getSelectedKey(),
				"TaskName": this._oNewTaskDescriptionMInput.getValue(),
				"StartDate": this._oNewTaskDateMPicker.getValue(),
				"Hours": this._oNewTaskHoursMInput.getValue()
			};
			oTaskModel.setProperty("/TaskIdCounter", ++oNewTask.TaskId);
			oTaskModel.getProperty("/UnassignedTasks").push(oNewTask);
			this.showMessageToast("ts.taskScheduler.addNewTask.success");
			this.onPressAddNewTaskCancel();
		},

		onPressAddNewTaskCancel: function(oEvent) {
			this._oAddNewTaskMDialog.close();
		},

		onPressAddNewUserOk: function(oEvent) {
			var oTaskModel = this.getModel("tasks");
			var oNewEmployee = {
				"employeeId": oTaskModel.getProperty("/EmployeeIdCounter"),
				"EmployeeName": this._oNewTaskTypeMSelect.getSelectedKey(),
				"Tasks": []

			};
			oTaskModel.setProperty("/EmployeeIdCounter", ++oNewEmployee.employeeId);
			oTaskModel.getProperty("/Employees").push(oNewEmployee);
			this.showMessageToast("ts.taskScheduler.addNewEmployee.success");
			this.onPressAddNewUserCancel();
		},

		showMessageToast: function(sText) {
			var oI18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			MessageToast.show(oI18n.getText(sText), {
				duration: 3000,
				autoClose: true,
				animationTimingFunction: "ease",
				animationDuration: 1000,
				closeOnBrowserNavigation: false
			});
		},

		onPressAddNewUserCancel: function(oEvent) {
			this._oAddNewEmployeeMDialog.close();
		},

		onPressAssignTaskToUser: function(oEvent) {

		},

		//TODO: доделать
		getIconById: function(sIconId) {
			var oTaskModel = this.getModel("tasks");
			return;
		},

		onValidateHoursCount: function(oEvent) {
			var oInput = oEvent.getSource();
			var sValue = oInput.getValue();

			var oNumericRegex = /([0-9]([0-9]{0,2})((?=[\.,\,])([\.,\,][0-9]{0,1})))|[1-9]([0-9]{0,2})/;

			var aMatchValue = sValue.match(oNumericRegex);
			var sNewValue = aMatchValue ? aMatchValue[0].replace(",", ".") : null;
			if (sNewValue) {
				oInput.setValue(sNewValue);
			} else {
				oInput.setValue(0.0);
			}

			oInput.setValueState(ValueState.None);
			if (!sValue) {
				oInput.setValue(0.0);
				oInput.setValueState(ValueState.Error);
			}

		},
		
		handleAppointmentDragEnter: function(oEvent) {
				if (this.isAppointmentOverlap(oEvent, oEvent.getParameter("calendarRow"))) {
					oEvent.preventDefault();
				}
			},

			handleAppointmentDrop: function (oEvent) {
				var oAppointment = oEvent.getParameter("appointment"),
					oStartDate = oEvent.getParameter("startDate"),
					oEndDate = oEvent.getParameter("endDate"),
					oCalendarRow = oEvent.getParameter("calendarRow"),
					bCopy = oEvent.getParameter("copy"),
					sTitle = oAppointment.getTitle(),
					oModel = this.getView().getModel(),
					oAppBindingContext = oAppointment.getBindingContext(),
					oRowBindingContext = oCalendarRow.getBindingContext(),
					handleAppointmentDropBetweenRows = function () {
						var aPath = oAppBindingContext.getPath().split("/"),
							iIndex = aPath.pop(),
							sRowAppointmentsPath = aPath.join("/");

						oRowBindingContext.getObject().appointments.push(
							oModel.getProperty(oAppBindingContext.getPath())
						);

						oModel.getProperty(sRowAppointmentsPath).splice(iIndex, 1);
					};

				if (bCopy) { // "copy" appointment
					var oProps = Object.assign({}, oModel.getProperty(oAppointment.getBindingContext().getPath()));
					oProps.start = oStartDate;
					oProps.end = oEndDate;

					oRowBindingContext.getObject().appointments.push(oProps);
				} else { // "move" appointment
					oModel.setProperty("start", oStartDate, oAppBindingContext);
					oModel.setProperty("end", oEndDate, oAppBindingContext);

					if (oAppointment.getParent() !== oCalendarRow) {
						handleAppointmentDropBetweenRows();
					}
				}

				oModel.refresh(true);

				MessageToast.show(oCalendarRow.getTitle() + "'s '" + "Appointment '" + sTitle + "' now starts at \n" + oStartDate + "\n and end at \n" + oEndDate + ".");
			},

			handleAppointmentResize: function (oEvent) {
				var oAppointment = oEvent.getParameter("appointment"),
					oStartDate = oEvent.getParameter("startDate"),
					oEndDate = oEvent.getParameter("endDate");

				if (!this.isAppointmentOverlap(oEvent, oAppointment.getParent())) {
					MessageToast.show("Appointment '" + oAppointment.getTitle() + "' now starts at \n" + oStartDate + "\n and end at \n" + oEndDate + ".");

					oAppointment
						.setStartDate(oStartDate)
						.setEndDate(oEndDate);
				} else {
					MessageToast.show("As a manager you can not resize events if they overlap with another events");
				}
			},

			handleAppointmentCreate: function (oEvent) {
				var oStartDate = oEvent.getParameter("startDate"),
					oEndDate = oEvent.getParameter("endDate"),
					oPlanningCalendarRow = oEvent.getParameter("calendarRow"),
					oModel = this.getView().getModel(),
					sPath = oPlanningCalendarRow.getBindingContext().getPath();

				oModel.getProperty(sPath).appointments.push({
					title: "New Appointment",
					start: oStartDate,
					end: oEndDate
				});

				MessageToast.show("New Appointment is created at \n" + oStartDate + "\n and end at \n" + oEndDate + ".");

				oModel.refresh(true);
			},

			isAppointmentOverlap: function (oEvent, oCalendarRow) {
				var oAppointment = oEvent.getParameter("appointment"),
					oStartDate = oEvent.getParameter("startDate"),
					oEndDate = oEvent.getParameter("endDate"),
					bAppointmentOverlapped;

				if (this.getUserRole() === this.roles.manager) {
					bAppointmentOverlapped = oCalendarRow.getAppointments().some(function (oCurrentAppointment) {
						if (oCurrentAppointment === oAppointment) {
							return;
						}

						var oAppStartTime = oCurrentAppointment.getStartDate().getTime(),
							oAppEndTime = oCurrentAppointment.getEndDate().getTime();

						if (oAppStartTime <= oStartDate.getTime() && oStartDate.getTime() < oAppEndTime) {
							return true;
						}

						if (oAppStartTime < oEndDate.getTime() && oEndDate.getTime() <= oAppEndTime) {
							return true;
						}

						if (oStartDate.getTime() <= oAppStartTime && oAppStartTime < oEndDate.getTime()) {
							return true;
						}
					});
				}

				return bAppointmentOverlapped;
			}


	});
});