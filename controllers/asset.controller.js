const db = require('../models');
const Asset = db.Asset;
const Transaction = db.Transaction;
const { Op } = require('sequelize');


exports.getAllAssets = async (req, res) => {
  try {
    const { status, categoryId, search, branch } = req.query;
    
    let whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    
    if (branch) {
      whereClause.branch = branch;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { assetId: { [Op.like]: `%${search}%` } },
        { serialNumber: { [Op.like]: `%${search}%` } },
        { make: { [Op.like]: `%${search}%` } },
        { model: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const assets = await Asset.findAll({
      where: whereClause,
      include: [
        {
          model: db.Category,
          as: 'category'
        },
        {
          model: db.Employee,
          as: 'assignedEmployee'
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getStockView = async (req, res) => {
  try {
    const stockData = await Asset.findAll({
      where: { 
        status: 'available',
        branch: { [Op.ne]: null }
      },
      include: [{
        model: db.Category,
        as: 'category'
      }],
      attributes: [
        'branch',
        [db.sequelize.fn('COUNT', db.sequelize.col('Asset.id')), 'count'],
        [db.sequelize.fn('SUM', db.sequelize.col('purchasePrice')), 'totalValue']
      ],
      group: ['branch', 'category.id']
    });
    
    res.json(stockData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id, {
      include: [
        {
          model: db.Category,
          as: 'category'
        },
        {
          model: db.Employee,
          as: 'assignedEmployee'
        }
      ]
    });
    
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.createAsset = async (req, res) => {
  try {
    const asset = await Asset.create(req.body);
    res.status(201).json(asset);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    await asset.update(req.body);
    res.json(asset);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.issueAsset = async (req, res) => {
  const t = await db.sequelize.transaction();
  
  try {
    const { assetId, employeeId, remarks } = req.body;
    
    const asset = await Asset.findByPk(assetId);
    if (!asset || asset.status !== 'available') {
      await t.rollback();
      return res.status(400).json({ message: 'Asset not available for issue' });
    }
    
    await asset.update({
      status: 'assigned',
      assignedTo: employeeId,
      assignedDate: new Date()
    }, { transaction: t });
    
    await Transaction.create({
      assetId,
      employeeId,
      type: 'issue',
      transactionDate: new Date(),
      remarks
    }, { transaction: t });
    
    await t.commit();
    res.json({ message: 'Asset issued successfully', asset });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};


exports.returnAsset = async (req, res) => {
  const t = await db.sequelize.transaction();
  
  try {
    const { assetId, reason, remarks } = req.body;
    
    const asset = await Asset.findByPk(assetId);
    if (!asset || asset.status !== 'assigned') {
      await t.rollback();
      return res.status(400).json({ message: 'Asset not currently assigned' });
    }
    
    const employeeId = asset.assignedTo;
    
    await asset.update({
      status: 'available',
      assignedTo: null,
      assignedDate: null
    }, { transaction: t });
    
    await Transaction.create({
      assetId,
      employeeId,
      type: 'return',
      transactionDate: new Date(),
      reason,
      remarks
    }, { transaction: t });
    
    await t.commit();
    res.json({ message: 'Asset returned successfully', asset });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};


exports.scrapAsset = async (req, res) => {
  const t = await db.sequelize.transaction();
  
  try {
    const { assetId, reason, remarks } = req.body;
    
    const asset = await Asset.findByPk(assetId);
    if (!asset) {
      await t.rollback();
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    const employeeId = asset.assignedTo || null;
    
    await asset.update({
      status: 'scrapped',
      assignedTo: null,
      assignedDate: null
    }, { transaction: t });
    
    await Transaction.create({
      assetId,
      employeeId,
      type: 'scrap',
      transactionDate: new Date(),
      reason,
      remarks
    }, { transaction: t });
    
    await t.commit();
    res.json({ message: 'Asset scrapped successfully', asset });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};


exports.getAssetHistory = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id, {
      include: [{
        model: db.Category,
        as: 'category'
      }]
    });
    
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    const transactions = await Transaction.findAll({
      where: { assetId: req.params.id },
      include: [{
        model: db.Employee,
        as: 'employee'
      }],
      order: [['transactionDate', 'DESC']]
    });
    
    res.json({ asset, transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};