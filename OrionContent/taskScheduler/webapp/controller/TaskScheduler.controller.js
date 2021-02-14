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
			this._oEditTaskMDialog = this.byId("EditTask-MDialog");
			this.setJsonModel("editModel", this._oEditTaskMDialog);
			this._oAssignTaskMDialog = this.byId("AssignTask-MDialog");
			this.setJsonModel("assignModel", this._oAssignTaskMDialog);
			this._oAddNewEmployeeMDialog = this.byId("AddNewEmployee-MDialog");

			this._oNewTaskTypeMSelect = this.byId("NewTaskType-MSelect");
			this._oNewTaskDescriptionMInput = this.byId("NewTaskDescription-MInput");
			this._oNewTaskDateMPicker = this.byId("NewTaskDate-MPicker");
			this._oNewTaskDaysMInput = this.byId("NewTaskDays-MInput");

			this._oEditTypeMSelect = this.byId("EditTaskType-MSelect");
			this._oEditDescriptionMInput = this.byId("EditTaskDescription-MInput");
			this._oEditDateMPicker = this.byId("EditTaskDate-MPicker");
			this._oEditDaysMInput = this.byId("EditTaskDays-MInput");

			this._oAddNewEmployeeNameMInput = this.byId("AddNewEmployeeName-MInput");
			this._oNewTaskFormContainerM = this.byId("NewTaskFormContainer-M");
			this._oEditFormContainerM = this.byId("EditFormContainer-M");

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
				"Days": this._oNewTaskDaysMInput.getValue()
			};
			oTaskModel.setProperty("/TaskIdCounter", ++oNewTask.TaskId);
			oTaskModel.getProperty("/UnassignedTasks").push(oNewTask);
			this.showMessageToast("ts.taskScheduler.addNewTask.success");
			oTaskModel.refresh();
			this.onPressAddNewTaskCancel();
		},

		onPressAddNewTaskCancel: function(oEvent) {
			this._oAddNewTaskMDialog.close();
		},

		onPressAddNewUserOk: function(oEvent) {
			var oTaskModel = this.getModel("tasks");
			var oNewEmployee = {
				"employeeId": oTaskModel.getProperty("/EmployeeIdCounter"),
				"EmployeeName": this._oAddNewEmployeeNameMInput.getValue(),
				"Tasks": []

			};
			oTaskModel.setProperty("/EmployeeIdCounter", ++oNewEmployee.employeeId);
			oTaskModel.getProperty("/Employees").push(oNewEmployee);
			this.showMessageToast("ts.taskScheduler.addNewEmployee.success");
			oTaskModel.refresh();
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

		handleAppointmentDragEnter: function(oEvent) {
			// if (this.isAppointmentOverlap(oEvent, oEvent.getParameter("calendarRow"))) {
			// 	oEvent.preventDefault();
			// }
		},

		handleAppointmentDrop: function(oEvent) {
			var oAppointment = oEvent.getParameter("appointment"),
				oStartDate = oEvent.getParameter("startDate"),
				oEndDate = oEvent.getParameter("endDate"),
				oCalendarRow = oEvent.getParameter("calendarRow"),
				bCopy = oEvent.getParameter("copy"),
				oModel = this.getView().getModel("tasks"),
				oAppBindingContext = oAppointment.getBindingContext("tasks"),
				oRowBindingContext = oCalendarRow.getBindingContext("tasks"),
				handleAppointmentDropBetweenRows = function() {
					var aPath = oAppBindingContext.getPath().split("/"),
						iIndex = aPath.pop(),
						sRowAppointmentsPath = aPath.join("/");

					oRowBindingContext.getObject().Tasks.push(
						oModel.getProperty(oAppBindingContext.getPath())
					);

					oModel.getProperty(sRowAppointmentsPath).splice(iIndex, 1);
				};

			if (bCopy) {
				var oProps = Object.assign({}, oModel.getProperty(oAppointment.getBindingContext().getPath()));
				oProps.start = oStartDate;
				oProps.end = oEndDate;

				oRowBindingContext.getObject().appointments.push(oProps);
			} else {
				oModel.setProperty("StartDate", oStartDate, oAppBindingContext);
				oModel.setProperty("EndDate", oEndDate, oAppBindingContext);

				if (oAppointment.getParent() !== oCalendarRow) {
					handleAppointmentDropBetweenRows();
				}
			}

			oModel.refresh(true);

			this.showMessageToast("ts.taskScheduler.dndTaskInCalendar.success");
		},

		isAppointmentOverlap: function(oEvent, oCalendarRow) {
			var oAppointment = oEvent.getParameter("appointment"),
				oStartDate = oEvent.getParameter("startDate"),
				oEndDate = oEvent.getParameter("endDate"),
				bAppointmentOverlapped;

			bAppointmentOverlapped = oCalendarRow.getAppointments().some(function(oCurrentAppointment) {
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

			return bAppointmentOverlapped;
		},

		onValidateEmployee: function(oEvent) {
			var oTasksModel = this.getOwnerComponent().getModel("tasks");
			var oControl = oEvent.getSource();
			var bEmployeeNameFilled = oControl.getValue() ? true : false;
			var oValueState = bEmployeeNameFilled ? ValueState.None : ValueState.Error;
			oTasksModel.setProperty("/validateNewEmployee", bEmployeeNameFilled);
			oControl.setValueState(oValueState);
		},

		onValidateTask: function(oEvent) {
			var oTasksModel = this.getModel("tasks");
			var oControl;
			var oValueState;
			var bIsFilledForm = true;

			this._oNewTaskFormContainerM.getFormElements().forEach(function(oFormElement, iIndex) {

				var bIsEmptyMandatory = false;
				switch (iIndex) {
					case 0:
						oControl = oFormElement.getFields()[0];
						bIsEmptyMandatory = !oControl.getSelectedItem();
						oValueState = bIsEmptyMandatory ? ValueState.Error : ValueState.None;
						oControl.setValueState(oValueState);
						break;
					case 1:
						oControl = oFormElement.getFields()[0];
						bIsEmptyMandatory = !oControl.getValue();
						oValueState = bIsEmptyMandatory ? ValueState.Error : ValueState.None;
						oControl.setValueState(oValueState);
						break;
					case 2:
						var oDatePicker = oFormElement.getFields()[0];
						var bIsEmptyMandatoryDatePicker = !oDatePicker.getValue();
						var oValueStateDatePicker = bIsEmptyMandatoryDatePicker ? ValueState.Error : ValueState.None;
						oDatePicker.setValueState(oValueStateDatePicker);

						var oDaysInput = oFormElement.getFields()[1];
						var sDaysValue = oDaysInput.getValue();

						var oNumericRegex = /([0-9]([0-9]{0,1})((?=[\.,\,])([\.,\,][0-9]{0,1})))|[1-9]([0-9]{0,1})/;

						var aMatchValue = sDaysValue.match(oNumericRegex);
						var sNewValue = aMatchValue ? aMatchValue[0].replace(",", ".") : null;
						if (sNewValue) {
							oDaysInput.setValue(sNewValue);
						} else {
							oDaysInput.setValue(0.0);
						}
						var bIsEmptyMandatoryosDaysValueInput = parseFloat(oDaysInput.getValue()).toFixed(1) <= "0.0";
						var oValueStateDaysInput = bIsEmptyMandatoryosDaysValueInput ? ValueState.Error : ValueState.None;
						oDaysInput.setValueState(oValueStateDaysInput);

						bIsEmptyMandatory = bIsEmptyMandatoryDatePicker || bIsEmptyMandatoryosDaysValueInput;
						break;
					default:
						break;
				}
				if (bIsEmptyMandatory) {
					bIsFilledForm = false;
				}
			}.bind(this));
			oTasksModel.setProperty("/validateNewTask", bIsFilledForm);
			oTasksModel.refresh();
		},

		onListPlanningCalendardragStart: function(oEvent) {
			var oDragSession = oEvent.getParameter("dragSession");
			var oDraggedRow = oEvent.getParameter("target");
			oDragSession.setComplexData("onListDragContext", oDraggedRow);
		},

		onListPlanningCalendarDrop: function(oEvent) {
			var oDroppedControl = oEvent.getParameter("droppedControl");
			var oDragSession = oEvent.getParameter("dragSession");
			var cliId = oDroppedControl.getId();
			var rowId = cliId.replace("-CLI", "");
			var pcRow = sap.ui.getCore().byId(rowId);
			var oBindingContext = pcRow.getBindingContext("tasks");
			var resourceObj = oBindingContext.getObject();
			var oDraggedRowContext = oDragSession.getComplexData("onListDragContext");
			var oDraggedRowObject = oDraggedRowContext.getBindingContext("tasks").getObject();

			this.getModel("assignModel").setData({
				TaskId: oDraggedRowObject.TaskId,
				TaskName: oDraggedRowObject.TaskName,
				StartDate: oDraggedRowObject.StartDate,
				Days: oDraggedRowObject.Days,
				iconId: oDraggedRowObject.iconId,
				DraggedTaskPath: oDraggedRowContext.getBindingContext("tasks").getPath(),
				EmployeeName: resourceObj.EmployeeName,
				TargetEmployeePath: oBindingContext.getPath()
			});

			this._oAssignTaskMDialog.open();
		},

		onUnassignTaskFromEmployee: function(oEvent) {
			var oDraggedControlBindingContext = oEvent.getParameter("draggedControl").getBindingContext("tasks");
			var oDraggedControlObject = oDraggedControlBindingContext.getObject();
			var sBindingPath = oDraggedControlBindingContext.getPath();
			var sPathToTaskArray = sBindingPath.substring(0, sBindingPath.lastIndexOf("/") + 1);
			var oTaskModel = this.getModel("tasks");
			var iCounter = sBindingPath.substring(sBindingPath.lastIndexOf("/") + 1, sBindingPath.length);
			var oTaskSet = oTaskModel.getProperty(sPathToTaskArray);
			oTaskModel.getProperty("/UnassignedTasks").push(oDraggedControlObject);
			oTaskSet.splice(iCounter, 1);
			oTaskModel.refresh(true);
		},

		onTaskDeletePress: function(oEvent) {
			var sBindingPath = oEvent.getSource().getBindingContext("tasks").getPath();
			MessageBox.confirm(this.getResourceBundle().getText("ts.taskScheduler.master.list.delete.confirmDelete"), {
				onClose: function(sAction) {
					if (sAction === "OK") {

						var oTaskModel = this.getModel("tasks");
						var aPath = sBindingPath.split("/");
						var iCounter = aPath[aPath.length - 1];
						var oTaskSet = oTaskModel.getProperty("/UnassignedTasks");
						oTaskSet.splice(iCounter, 1);
						this.showMessageToast("ts.taskScheduler.master.list.deleteTask.success");
						oTaskModel.refresh(true);

					}
				}.bind(this)
			});
		},

		onTaskEditPress: function(oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext("tasks");
			var oBindingContextObject = oBindingContext.getObject();
			this.getModel("editModel").setData({
				iconId: oBindingContextObject.iconId,
				TaskName: oBindingContextObject.TaskName,
				StartDate: oBindingContextObject.StartDate,
				Days: oBindingContextObject.Days,
				TaskPath: oBindingContext.getPath()
			});

			this._oEditTaskMDialog.open();
		},

		onPressEditTaskCancel: function(oEvent) {
			this._oEditTaskMDialog.close();
		},

		onPressEditTaskOk: function(oEvent) {
			var oTasksModel = this.getModel("tasks");
			this.onValidateEditTask();
			if (oTasksModel.getProperty("/validateEditTask")) {
				var oEditTaskData = this.getView().getModel("editModel").getData();
				var oTaskData = this.getView().getModel("tasks").getProperty(oEditTaskData.TaskPath);

				oTaskData.Days = oEditTaskData.Days;
				oTaskData.iconId = oEditTaskData.iconId;
				oTaskData.StartDate = oEditTaskData.StartDate ? oEditTaskData.StartDate : new Date(Date.now());
				oTaskData.TaskName = oEditTaskData.TaskName;
				this.showMessageToast("ts.taskScheduler.master.list.editTask.success");
				oTasksModel.refresh(true);
				this._oEditTaskMDialog.close();
			} else {
				this.showMessageToast("ts.taskScheduler.master.list.editTask.fillFields");
			}

		},
		onPressAssignTaskOk: function(oEvent) {
			var oTasksModel = this.getModel("tasks");
			var oAssignTaskData = this.getView().getModel("assignModel").getData();
			var sSourcePath = oAssignTaskData.DraggedTaskPath;
			var oTargetTaskData = oTasksModel.getProperty(oAssignTaskData.TargetEmployeePath + "/Tasks");
			var oEndDate = this.addDays(oAssignTaskData.StartDate, oAssignTaskData.Days);
			var oTargetObject = {
				Days: oAssignTaskData.Days,
				EndDate: oEndDate,
				StartDate: oAssignTaskData.StartDate,
				TaskId: oAssignTaskData.TaskId,
				TaskName: oAssignTaskData.TaskName,
				iconId: oAssignTaskData.iconId
			};
			oTargetTaskData.push(oTargetObject);

			var aPath = sSourcePath.split("/");
			var iCounter = aPath[aPath.length - 1];
			var oTaskSet = oTasksModel.getProperty("/UnassignedTasks");
			oTaskSet.splice(iCounter, 1);
			this.showMessageToast("ts.taskScheduler.assignTask.success");
			oTasksModel.refresh(true);
			this._oAssignTaskMDialog.close();
		},

		addDays: function(sStartDate, sDays) {
			return new Date(Date.parse(sStartDate) + 24 * 60 * 60 * 1000 * sDays);
		},

		onPressAssignTaskCancel: function(oEvent) {
			this._oAssignTaskMDialog.close();
		},

		onValidateEditTask: function(oEvent) {
			var oTasksModel = this.getModel("tasks");
			var oControl;
			var oValueState;
			var bIsFilledForm = true;

			this._oEditFormContainerM.getFormElements().forEach(function(oFormElement, iIndex) {

				var bIsEmptyMandatory = false;
				switch (iIndex) {
					case 0:
						oControl = oFormElement.getFields()[0];
						bIsEmptyMandatory = !oControl.getSelectedItem();
						oValueState = bIsEmptyMandatory ? ValueState.Error : ValueState.None;
						oControl.setValueState(oValueState);
						break;
					case 1:
						oControl = oFormElement.getFields()[0];
						bIsEmptyMandatory = !oControl.getValue();
						oValueState = bIsEmptyMandatory ? ValueState.Error : ValueState.None;
						oControl.setValueState(oValueState);
						break;
					case 2:
						var oDatePicker = oFormElement.getFields()[0];
						var bIsEmptyMandatoryDatePicker = !oDatePicker.getValue();
						var oValueStateDatePicker = bIsEmptyMandatoryDatePicker ? ValueState.Error : ValueState.None;
						oDatePicker.setValueState(oValueStateDatePicker);

						var oDaysInput = oFormElement.getFields()[1];
						var sDaysValue = oDaysInput.getValue();

						var oNumericRegex = /([0-9]([0-9]{0,1})((?=[\.,\,])([\.,\,][0-9]{0,1})))|[1-9]([0-9]{0,1})/;

						var aMatchValue = sDaysValue.match(oNumericRegex);
						var sNewValue = aMatchValue ? aMatchValue[0].replace(",", ".") : null;
						if (sNewValue) {
							oDaysInput.setValue(sNewValue);
						} else {
							oDaysInput.setValue(0.0);
						}
						var bIsEmptyMandatoryosDaysValueInput = parseFloat(oDaysInput.getValue()).toFixed(1) <= "0.0";
						var oValueStateDaysInput = bIsEmptyMandatoryosDaysValueInput ? ValueState.Error : ValueState.None;
						oDaysInput.setValueState(oValueStateDaysInput);

						bIsEmptyMandatory = bIsEmptyMandatoryDatePicker || bIsEmptyMandatoryosDaysValueInput;
						break;
					default:
						break;
				}
				if (bIsEmptyMandatory) {
					bIsFilledForm = false;
				}
			}.bind(this));
			oTasksModel.setProperty("/validateEditTask", bIsFilledForm);
			oTasksModel.refresh();
		}

	});
});