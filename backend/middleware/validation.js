const { body } = require('express-validator');

const validateQuizCreation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  body('questions.*.text').notEmpty().withMessage('Question text is required'),
  body('questions.*.options').isArray({ min: 2 }).withMessage('At least two options are required per question'),
];

module.exports = { validateQuizCreation };
