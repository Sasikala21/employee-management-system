const DepartmentModel = require("../models/department.model");
const departmentData = [
    {
        departmentName : "Company",
        status:'ACTIVE'
    },
    {
        departmentName : "Individual",
        status:'ACTIVE'
    }
];

const seedDepartmentTypeData = async() => {
    try {
        await DepartmentModel.deleteMany({});
        await DepartmentModel.insertMany(departmentData);
        console.info('Department Type Seeded Successfully');
    } catch (err) {
        console.error('Error during seeding:', err);
    }
}

module.exports = seedDepartmentTypeData;