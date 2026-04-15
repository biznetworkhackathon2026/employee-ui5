sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("com.hackathon.employeeui5.controller.EmployeeList", {

        onInit: function () {
            const oViewModel = new JSONModel({ selectedCount: 0 });
            this.getView().setModel(oViewModel, "employeeList");
        },

        onOnboardPress: function () {
            this.getOwnerComponent().getRouter().navTo("EmployeeOnboard");
        },

        onEmployeePress: function (oEvent) {
            const oItem = oEvent.getSource();
            const oCtx = oItem.getBindingContext();
            const sId = oCtx.getProperty("ID");
            this.getOwnerComponent().getRouter().navTo("EmployeeDetail", { employeeId: encodeURIComponent(sId) });
        },

        onEditPress: function (oEvent) {
            const oBtn = oEvent.getSource();
            const oCtx = oBtn.getBindingContext();
            const sId = oCtx.getProperty("ID");
            this._openEditDialog(sId, oCtx.getObject());
        },

        onSearch: function (oEvent) {
            const sQuery = oEvent.getParameter("newValue") || oEvent.getParameter("query") || "";
            const oTable = this.byId("employeeTable");
            const oBinding = oTable.getBinding("items");

            const aFilters = [];
            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("firstName", FilterOperator.Contains, sQuery),
                        new Filter("lastName", FilterOperator.Contains, sQuery),
                        new Filter("email", FilterOperator.Contains, sQuery),
                        new Filter("department", FilterOperator.Contains, sQuery),
                        new Filter("jobTitle", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }
            oBinding.filter(aFilters);
        },

        onFilterByStatus: function (oEvent) {
            const sKey = oEvent.getParameter("selectedItem").getKey();
            const oTable = this.byId("employeeTable");
            const oBinding = oTable.getBinding("items");

            const aFilters = [];
            if (sKey !== "All") {
                aFilters.push(new Filter("status", FilterOperator.EQ, sKey));
            }
            oBinding.filter(aFilters);
        },

        onDeleteSelected: function () {
            const oTable = this.byId("employeeTable");
            const aItems = oTable.getSelectedItems();
            if (!aItems.length) return;

            MessageBox.confirm(
                `Delete ${aItems.length} selected employee(s)?`,
                {
                    title: "Confirm Delete",
                    onClose: (sAction) => {
                        if (sAction !== MessageBox.Action.OK) return;
                        const oModel = this.getView().getModel();
                        const aPromises = aItems.map(oItem => {
                            const oCtx = oItem.getBindingContext();
                            return oCtx.delete();
                        });
                        Promise.all(aPromises)
                            .then(() => MessageToast.show("Deleted successfully"))
                            .catch(err => MessageBox.error(err.message));
                    }
                }
            );
        },

        _openEditDialog: function (sId, oEmployee) {
            if (!this._oEditDialog) {
                sap.ui.core.Fragment.load({
                    name: "com.hackathon.employeeui5.view.EditEmployeeDialog",
                    controller: this
                }).then(oDialog => {
                    this._oEditDialog = oDialog;
                    this.getView().addDependent(oDialog);
                    this._setEditDialogData(sId, oEmployee);
                    oDialog.open();
                });
            } else {
                this._setEditDialogData(sId, oEmployee);
                this._oEditDialog.open();
            }
        },

        _setEditDialogData: function (sId, oEmployee) {
            const oEditModel = new JSONModel(Object.assign({ _id: sId }, oEmployee));
            this._oEditDialog.setModel(oEditModel, "edit");
        },

        onEditSave: function () {
            const oEditModel = this._oEditDialog.getModel("edit");
            const oData = oEditModel.getData();
            const sId = oData._id;

            const oModel = this.getView().getModel();
            const oContext = oModel.bindContext(`/Employees('${sId}')`);

            oContext.requestObject().then(() => {
                const oUpdateData = {
                    firstName:   oData.firstName,
                    lastName:    oData.lastName,
                    email:       oData.email,
                    department:  oData.department,
                    jobTitle:    oData.jobTitle,
                    hireDate:    oData.hireDate,
                    salary:      parseFloat(oData.salary),
                    phoneNumber: oData.phoneNumber,
                    address:     oData.address,
                    status:      oData.status
                };

                return fetch(`/employee/Employees('${sId}')`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(oUpdateData)
                });
            }).then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                MessageToast.show("Employee updated successfully");
                this._oEditDialog.close();
                this.byId("employeeTable").getBinding("items").refresh();
            }).catch(err => {
                sap.m.MessageBox.error("Update failed: " + err.message);
            });
        },

        onEditCancel: function () {
            this._oEditDialog.close();
        }
    });
});
