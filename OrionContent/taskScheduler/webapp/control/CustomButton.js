sap.ui.define([
	"sap/m/Button"
], function (Button) {
	"use strict";
	return Button.extend("taskScheduler.control.CustomButton", {
		metadata: {
			dnd: {
				droppable: true
			}
		},
		renderer: {}
	});
});