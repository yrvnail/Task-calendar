sap.ui.define([
	"sap/m/PlanningCalendar",
	"sap/m/library",
	"sap/ui/unified/library",
	"sap/m/PlanningCalendarView",
	"sap/base/Log"
], function(PlanningCalendar, library, unifiedLibrary, PlanningCalendarView, Log) {
	"use strict";
	return PlanningCalendar.extend("taskScheduler.control.CustomPlanningCalendar", {

		// shortcut for sap.m.PlanningCalendarBuiltInView
		PlanningCalendarBuiltInView: library.PlanningCalendarBuiltInView,

		// shortcut for sap.ui.unified.CalendarIntervalType
		CalendarIntervalType: unifiedLibrary.CalendarIntervalType,

		_getViews: function() {
			//All supported built-in views
			var KEYS_FOR_ALL_BUILTIN_VIEWS = [
				this.PlanningCalendarBuiltInView.Hour,
				this.PlanningCalendarBuiltInView.Day,
				this.PlanningCalendarBuiltInView.Month,
				this.PlanningCalendarBuiltInView.Week,
				this.PlanningCalendarBuiltInView.OneMonth
			];
			var aCustomViews = this.getViews(),
				aBuildInViews = this.getBuiltInViews(),
				aResultViews,
				aKeysForBuiltInViews = [],
				oViewType = this.PlanningCalendarBuiltInView,
				oIntervalType = this.CalendarIntervalType;

			if (!this._oViews) {
				this._oViews = {};
			}

			if (aBuildInViews.length) {
				aKeysForBuiltInViews = aBuildInViews;
			} else {
				aKeysForBuiltInViews = aCustomViews.length ? [] : KEYS_FOR_ALL_BUILTIN_VIEWS;
			}

			aResultViews = aKeysForBuiltInViews.map(function(sViewKey) {
				switch (sViewKey) {
					case oViewType.Hour:
						return this._oViews[oViewType.Hour] ||
							(this._oViews[oViewType.Hour] = new PlanningCalendarView(this.getId() + "-HourView", {
								key: oViewType.Hour,
								intervalType: oIntervalType.Hour,
								description: this._oRB && this._oRB.getText("PLANNINGCALENDAR_HOURS"),
								intervalsS: 9,
								intervalsM: 9,
								intervalsL: 9
							}));
					case oViewType.Day:
						return this._oViews[oViewType.Day] ||
							(this._oViews[oViewType.Day] = new PlanningCalendarView(this.getId() + "-DayView", {
								key: oViewType.Day,
								intervalType: oIntervalType.Day,
								description: this._oRB && this._oRB.getText("PLANNINGCALENDAR_DAYS"),
								intervalsS: 5,
								intervalsM: 5,
								intervalsL: 5
							}));
					case oViewType.Month:
						return this._oViews[oViewType.Month] ||
							(this._oViews[oViewType.Month] = new PlanningCalendarView(this.getId() + "-MonthView", {
								key: oViewType.Month,
								intervalType: oIntervalType.Month,
								description: this._oRB && this._oRB.getText("PLANNINGCALENDAR_MONTHS"),
								intervalsS: 3,
								intervalsM: 12,
								intervalsL: 12
							}));
					case oViewType.Week:
						return this._oViews[oViewType.Week] ||
							(this._oViews[oViewType.Week] = new PlanningCalendarView(this.getId() + "-WeekView", {
								key: oViewType.Week,
								intervalType: oIntervalType.Week,
								description: this._oRB && this._oRB.getText("PLANNINGCALENDAR_WEEK"),
								intervalsS: 7,
								intervalsM: 7,
								intervalsL: 7
							}));
					case oViewType.OneMonth:
						return this._oViews[oViewType.OneMonth] ||
							(this._oViews[oViewType.OneMonth] = new PlanningCalendarView(this.getId() + "-OneMonthView", {
								key: oViewType.OneMonth,
								intervalType: oIntervalType.OneMonth,
								description: this._oRB && this._oRB.getText("PLANNINGCALENDAR_ONE_MONTH"),
								intervalsS: 1,
								intervalsM: 1,
								intervalsL: 31
							}));
					default:
						Log.error("Cannot get PlanningCalendar views. Invalid view key " + sViewKey);
						break;
				}
			}, this);

			for (var sKeyExistingViews in this._oViews) { //remove all redundant views
				if (aKeysForBuiltInViews.indexOf(sKeyExistingViews) < 0) {
					this._oViews[sKeyExistingViews].destroy();
					delete this._oViews[sKeyExistingViews];
				}
			}

			if (aCustomViews.length) {
				aResultViews = aResultViews.concat(aCustomViews);
			}

			return aResultViews;
		},
		renderer: {}
	});
});