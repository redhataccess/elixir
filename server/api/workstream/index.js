'use strict';

var express = require('express');
var controller = require('./workstream.controller');

var router = express.Router();

router.get('/', controller.index);
router.post('/', controller.create);
router.get('/:workstream', controller.getWorkstream);
router.post('/:workstream', controller.updateWorkstream);
router.delete('/:workstream', controller.delete);
router.get('/:workstream/tasks', controller.getWorkstreamTasks);
router.post('/:workstream/tasks', controller.saveWorkstreamTask);
router.post('/:workstream/tasks/:task', controller.updateWorkstreamTask);
router.delete('/:workstream/tasks/:task', controller.deleteWorkstreamTask);

module.exports = router;
