const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  responses: [{ question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }, selectedOption: String }],
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Response', responseSchema);
