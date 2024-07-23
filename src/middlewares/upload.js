const multer = require('multer');
const fs = require('fs');
const path = require('path');

const createDestinationDirectory = (destination) => {
    const directory = path.resolve(destination);
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
    // console.log(directory,'directory');
};

const storage = multer.diskStorage({
    // destination: function (req, file, cb) {
    //     cb(null, './uploads/emp');
    // },
    destination: function (req, file, cb) {
        const destination = './uploads/emp';
        createDestinationDirectory(destination);
        cb(null, destination);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
}).single('employeeProfile');
module.exports = upload;