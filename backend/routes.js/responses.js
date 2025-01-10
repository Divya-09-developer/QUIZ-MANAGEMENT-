const express = require('express');
const router = express.Router();
const Response = require('../models/response');
const Quiz = require('../models/quiz'); // Ensure you have a Question model
const auth = require('../middleware/auth');

// Submit quiz responses
router.post('/', auth, async (req, res) => {
  try {
    const { quizId, responses } = req.body; // Destructure quizId and responses from the request body
    const studentId = req.user.id;

    // Fetch all questions for the quiz
    const correctAnswers = {};
    var questions = [];
    const quiz = await Quiz.findById(quizId).populate('questions');

if (quiz && Array.isArray(quiz.questions)) { 
  questions = quiz.questions;
  questions.forEach(question => {
    console.log(question);
    correctAnswers[question.id] = question.answer;
  });
}

    let score = 0;
    const resultResponses = responses.map(response => {
      const isCorrect = response.selectedOption === correctAnswers[response.question];
      if (isCorrect) {
        score++; // Increment score for correct answers
      }
      return {
        question: response.question,
        selectedOption: response.selectedOption,
        correctOption: correctAnswers[response.question], // Store correct answer for reference
        isCorrect: isCorrect,
      };
    });

    // Log score and total before sending the response
    console.log('Score:', score);
    console.log('Total Questions:', questions.length);

    // Create a new response entry in the database
    const responseEntry = new Response({
      quizId,
      student: studentId,
      score,
      total: questions.length,
      responses: resultResponses, // Save the detailed responses
    });

    await responseEntry.save();
    
    // Return the score and responses
    res.status(201).json({
      score,
      total: questions.length,
      responses: resultResponses,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
