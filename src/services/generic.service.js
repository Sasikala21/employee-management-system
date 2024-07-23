exports.getAll = async (Model, filters, data, fields) => {
    return await Model.find(filters).populate(data).select(fields);
};

exports.create = async (Model, data) => {
    return await Model.create(data);
};

exports.update = async (Model, id, data) => {
    return await Model.findByIdAndUpdate(id, data);
};

exports.findAndUpdate = async (Model, criteria, data) => {
    return await Model.findOneAndUpdate(criteria, data);
};

exports.getById = async (Model, id, data, fields) => {
    return await Model.findById(id).populate(data).select(fields);
};

exports.deleteById = async (Model, id) => {
    return await Model.findByIdAndDelete(id);
};

exports.getData = async (Model, criteria, data, fields) => {
    return await Model.findOne(criteria).populate(data).select(fields);
};

exports.updateStatus = async (Model, id, changeStatus) => {
    if (!['Active', 'Inactive'].includes(changeStatus)) {
        throw new Error('Invalid status value');
    }
    return await Model.findByIdAndUpdate(id, { status: changeStatus });
};

exports.findAndUpdateStatus = async (Model, criteria, changeStatus) => {
    if (!['Active', 'Inactive'].includes(changeStatus)) {
        throw new Error('Invalid status value');
    }
    return await Model.findOneAndUpdate(criteria, { status: changeStatus });
};