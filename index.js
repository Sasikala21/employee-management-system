const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = require('./src/db/config');
const EmployeeRoute = require('./src/routes/employee.routes.js');
const DepartmentRoute = require('./src/routes/department.routes.js');
const LeavetypeRoute = require('./src/routes/leavetype.routes.js');
const SalaryRoute = require('./src/routes/salary.routes.js');
const DashboardRoute = require('./src/routes/dashboard.routes.js');
const LeaveRoute = require('./src/routes/leave.routes.js');
const ReportRoute = require('./src/routes/report.routes.js');
const AuthRoute = require('./src/routes/auth.routes.js');
const cors = require('cors');
const axios = require('axios');
const corsOptions = {
    origin: process.env.CORSOPTIONS
};
console.log(corsOptions);
app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
    res.json({ message: "Welcome to EMS application." });
});
app.use('/employee', EmployeeRoute);
app.use('/department', DepartmentRoute);
app.use('/leavetype', LeavetypeRoute);
app.use('/salary', SalaryRoute);
app.use('/dashboard', DashboardRoute);
app.use('/leave', LeaveRoute);
app.use('/report', ReportRoute);
app.use('/ems', AuthRoute);

app.get("/ems", (req, res) => {
    res.json({ message: "Welcome to Employee Management System." });
});
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log("Server is listening on port", `${PORT}`);
});
