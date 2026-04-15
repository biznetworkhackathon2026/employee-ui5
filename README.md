# Employee UI5 App

SAP UI5 Fiori application for Employee Management.

## Features
- **Employee List** — searchable, filterable table with status indicators
- **Employee Onboard** — form with validation + calls CAP `onboardEmployee` action
- **Employee Detail** — full view with edit & delete
- **Edit Dialog** — inline edit for any employee

## Local Development

```bash
npm install
npm start      # http://localhost:8080
```

Requires `employee-service` running at http://localhost:4004.

## Build & Deploy to BTP CF

```bash
# 1. Login
cf login -a api.cf.us10.hana.ondemand.com -o b0362cb0trial -s dev

# 2. Build MTA
mbt build -p=cf

# 3. Deploy
cf deploy mta_archives/employee-ui5_1.0.0.mtar

# 4. Bind alert-notification to service (if needed manually)
cf bind-service employee-service-srv alert-notification
cf restage employee-service-srv
```

## App Structure

```
webapp/
├── Component.js
├── manifest.json
├── index.html
├── xs-app.json
├── view/
│   ├── App.view.xml
│   ├── EmployeeList.view.xml       ← Main list + search + filter
│   ├── EmployeeOnboard.view.xml    ← New employee form
│   ├── EmployeeDetail.view.xml     ← Detail view
│   └── EditEmployeeDialog.fragment.xml ← Reusable edit dialog
├── controller/
│   ├── App.controller.js
│   ├── EmployeeList.controller.js
│   ├── EmployeeOnboard.controller.js
│   └── EmployeeDetail.controller.js
└── i18n/
    └── i18n.properties
```
