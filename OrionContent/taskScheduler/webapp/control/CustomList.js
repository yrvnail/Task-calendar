sap.ui.define([
	"sap/m/List"
], function(List) {
	"use strict";
	return List.extend("taskScheduler.control.CustomList", {
		metadata: {
			dnd: {
				draggable: true,
				droppable: true
			},
			aggregations: {
				header: {
					type: "sap.ui.core.Control",
					multiple: false,
					dnd: true
				},
				items: {
					type: 'sap.m.CustomListItem',
					multiple: true,
					selector: "#{id}-items",
					dnd: {
						draggable: true,
						dropppable: true,
						layout: "Horizontal"
					}
				},
			}
		},
		renderer: {}
	});
});