const { param } = require('express-validator');

const validateGetImagesByFolderId = [
    param('folderId')
      .exists().withMessage('Folder ID is required')
      .matches(/^[A-Za-z0-9_-]+$/, 'i') 
      .withMessage('Folder ID must contain only alphanumeric characters, dashes, and underscores.'),
  ];


module.exports = { validateGetImagesByFolderId }