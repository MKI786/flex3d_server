const express = require('express');
const router = express.Router();
const { register,
    fetchorders,
    assigncustomizer,
    deleteclient,
    handlestatusaction,
    authenticatecustomizer
} = require('../Controllers/Clientcontroller.js');


router.post('/ordersubmit', register);
router.get('/fetchorders', fetchorders);
router.post('/assigncustomizer', assigncustomizer);
router.post('/deleteclient', deleteclient);
router.post('/handlestatusaction', handlestatusaction);
router.post('/authenticatecustomizer', authenticatecustomizer);



module.exports = router;