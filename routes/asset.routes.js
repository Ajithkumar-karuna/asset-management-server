const express = require('express');
const router = express.Router();
const assetController = require('../controllers/asset.controller');

router.get('/', assetController.getAllAssets);
router.get('/stock', assetController.getStockView);
router.get('/:id', assetController.getAssetById);
router.get('/:id/history', assetController.getAssetHistory);
router.post('/', assetController.createAsset);
router.put('/:id', assetController.updateAsset);
router.post('/issue', assetController.issueAsset);
router.post('/return', assetController.returnAsset);
router.post('/scrap', assetController.scrapAsset);

module.exports = router;