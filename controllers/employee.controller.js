
const db = require('../models');
const Employee = db.Employee;
const { Op } = require('sequelize');


exports.getAllEmployees = async (req, res) => {
  try {
    const { status, search, department, branch } = req.query;
    
    let whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { employeeId: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (department) {
      whereClause.department = department;
    }
    
    if (branch) {
      whereClause.branch = branch;
    }
    
    const employees = await Employee.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [{
        model: db.Asset,
        as: 'assignedAssets',
        include: [{
          model: db.Category,
          as: 'category'
        }]
      }]
    });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    await employee.update(req.body);
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    await employee.destroy();
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};