sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
], function (Controller, MessageToast, MessageBox, History) {
    "use strict";

    return Controller.extend("com.hackathon.employeeui5.controller.EmployeeDetail", {

        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("EmployeeDetail").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            const sId = decodeURIComponent(oEvent.getParameter("arguments").employeeId);
            this.getView().bindElement({
                path: `/Employees('${sId}')`,
                parameters: { $select: "ID,firstName,lastName,email,department,jobTitle,hireDate,salary,status,phoneNumber,address" }
            });
        },

        onNavBack: function () {
            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("EmployeeList");
            }
        },

        onEditPress: function () {
            const oCtx = this.getView().getBindingContext();
            if (oCtx) {
                this._openEditDialog(oCtx.getProperty("ID"), oCtx.getObject());
            }
        },

        onDeletePress: function () {
            const oCtx = this.getView().getBindingContext();
            if (!oCtx) return;
            const sName = `${oCtx.getProperty("firstName")} ${oCtx.getProperty("lastName")}`;

            MessageBox.confirm(`Delete employee ${sName}?`, {
                title: "Confirm Delete",
                onClose: (sAction) => {
                    if (sAction !== MessageBox.Action.OK) return;
                    const sId = oCtx.getProperty("ID");
                    fetch(`/employee/Employees('${sId}')`, { method: "DELETE" })
                        .then(res => {
                            if (!res.ok) throw new Error(`HTTP ${res.status}`);
                            MessageToast.show(`${sName} deleted`);
                            this.getOwnerComponent().getRouter().navTo("EmployeeList");
                        })
                        .catch(err => MessageBox.error("Delete failed: " + err.message));
                }
            });
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
            const oEditModel = new sap.ui.model.json.JSONModel(Object.assign({ _id: sId }, oEmployee));
            this._oEditDialog.setModel(oEditModel, "edit");
        },

        onEditSave: function () {
            const oEditModel = this._oEditDialog.getModel("edit");
            const oData = oEditModel.getData();
            const sId = oData._id;

            fetch(`/employee/Employees('${sId}')`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
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
                })
            }).then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                MessageToast.show("Employee updated");
                this._oEditDialog.close();
                this.getView().getElementBinding().refresh(true);
            }).catch(err => {
                MessageBox.error("Update failed: " + err.message);
            });
        },

        onEditCancel: function () {
            this._oEditDialog.close();
        }
    });
});
