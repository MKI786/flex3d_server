const express = require('express');
const router = express.Router();
const { register,
    fetchorders,
    assigncustomizer,
    deleteclient,
    handlestatusaction,
    authenticatecustomizer,
    assignmodel,
    deletemodel,
    deletecustomizer,
    customerordersubmit,
    getorderpreview,
} = require('../Controllers/Clientcontroller.js');



router.post('/ordersubmit', register);
router.get('/fetchorders', fetchorders);
router.post('/assigncustomizer', assigncustomizer);
router.post('/deleteclient', deleteclient);
router.post('/handlestatusaction', handlestatusaction);
router.post('/authenticatecustomizer', authenticatecustomizer);
router.post('/assignmodel', assignmodel);
router.post('/deletemodel', deletemodel);
router.post('/deletecustomizer', deletecustomizer);
router.post('/customerordersubmit', customerordersubmit);
router.get('/getorderpreview/:id', getorderpreview);


module.exports = router;