sap.ui.define([], function() {
	"use strict";

	return {

		formatShortDate: function(sDate) {
			var oDate = new Date(sDate);
			var sDay = String(oDate.getDate()).padStart(2, "0");
			var sMonth = String(oDate.getMonth() + 1).padStart(2, "0");
			var sYear = oDate.getFullYear();
			return sDay + "." + sMonth + "." + sYear;
		},

		formatDate: function(sDate) {
			if (sDate) {
				var oDate = new Date(sDate);
				return oDate;
			}

			return sDate;
		},

		getI18nText: function(sText) {
			var oI18n = this.getResourceBundle();
			return oI18n.getText(sText);
		},

		getTaskType: function(sIconId, aTaskType) {
			// var aTaskType = this.getModel("tasks").getProperty("TaskType");
			var aNeededTaskType = aTaskType.filter(function(oTaskType) {
				return oTaskType.iconId == sIconId;
			});
			return aNeededTaskType[0].icon ? aNeededTaskType[0].icon : "";
		}

	};

});