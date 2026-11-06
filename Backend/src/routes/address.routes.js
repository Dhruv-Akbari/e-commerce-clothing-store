const express = require('express');
const AddressController = require('../controller/adrress.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express()

router.post('/AddAddress',verifyToken,AddressController.addAddress)
router.put('/UpdateAddress/:id',verifyToken,AddressController.updateAddress)
router.get('/GetAddress/:id',verifyToken,AddressController.getUserAddresses)
router.delete('/DeleteAddress/:id',AddressController.deleteAddress)

module.exports = router