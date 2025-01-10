const mongoose = require('mongoose');

// Define the schema for each question
const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    options: [
        {
            type: String,
            required: true
        }
    ],
    answer: {
        type: String,
        required: true
    }
});

const quizSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Refers to the User model
    required: true
  },
  questions: {
    type: [questionSchema], // Embedding question schema
    required: true
  },
  title: {
    type: String,
    required : true
  }
});

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;


