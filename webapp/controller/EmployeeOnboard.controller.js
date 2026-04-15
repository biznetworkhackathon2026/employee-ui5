sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
], function (Controller, JSONModel, MessageToast, MessageBox, History) {
    "use strict";

    return Controller.extend("com.hackathon.employeeui5.controller.EmployeeOnboard", {

        onInit: function () {
            this._resetForm();
        },

        _resetForm: function () {
            const oModel = new JSONModel({
                firstName: "",
                lastName: "",
                email: "",
                phoneNumber: "",
                address: "",
                department: "",
                jobTitle: "",
                hireDate: "",
                salary: ""
            });
            this.getView().setModel(oModel, "onboard");
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

        onSubmit: function () {
            const oData = this.getView().getModel("onboard").getData();

            // Basic validation
            if (!oData.firstName || !oData.lastName || !oData.email) {
                MessageBox.error("First name, last name and email are required.");
                return;
            }

            // Email format check
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(oData.email)) {
                MessageBox.error("Please enter a valid email address.");
                return;
            }

            const oPayload = {
                firstName:   oData.firstName.trim(),
                lastName:    oData.lastName.trim(),
                email:       oData.email.trim(),
                phoneNumber: oData.phoneNumber || null,
                address:     oData.address || null,
                department:  oData.department || null,
                jobTitle:    oData.jobTitle || null,
                hireDate:    oData.hireDate || null,
                salary:      oData.salary ? parseFloat(oData.salary) : null
            };

            this.byId("submitBtn").setEnabled(false);

            fetch("/employee/onboardEmployee", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(oPayload)
            })
            .then(res => res.json().then(data => ({ status: res.status, data })))
            .then(({ status, data }) => {
                if (status >= 400) {
                    throw new Error(data.error?.message || `HTTP ${status}`);
                }
                MessageToast.show(`${oPayload.firstName} ${oPayload.lastName} onboarded successfully!`);
                this._resetForm();
                this.getOwnerComponent().getRouter().navTo("EmployeeList");
            })
            .catch(err => {
                MessageBox.error("Onboarding failed: " + err.message);
            })
            .finally(() => {
                this.byId("submitBtn").setEnabled(true);
            });
        }
    });
});
