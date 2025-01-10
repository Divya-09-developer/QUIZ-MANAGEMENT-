const express = require('express');
const Quiz = require('../models/quiz');
const Question = require('../models/question');
const auth = require('../middleware/auth'); // Authentication middleware
const router = express.Router();
const mongoose = require('mongoose');

router.post('/', auth, async (req, res) => {
    try {
        const { title, questions } = req.body;

        // Ensure req.user.userId exists (user is authenticated)
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ error: 'User not authenticated.' });
        }

        // Validate that title and questions are present
        if (!title || !questions || questions.length === 0) {
            return res.status(400).json({ error: 'Title and questions are required.' });
        }

        // Validate each question in detail
        for (const questionData of questions) {
            if (!questionData.text || questionData.text.trim() === "") {
                return res.status(400).json({ error: 'Each question must have text.' });
            }
            if (!questionData.answer || questionData.answer.trim() === "") {
                return res.status(400).json({ error: 'Each question must have an answer.' });
            }
            if (!questionData.options || questionData.options.length === 0) {
                return res.status(400).json({ error: 'Each question must have at least one option.' });
            }
        }

        // Create quiz
        const quiz = new Quiz({
            title,
            questions,
            createdBy: new mongoose.Types.ObjectId(req.user.userId),
        });

        await quiz.save();
        res.status(201).json(quiz);

    } catch (err) {
        console.error('Error creating quiz:', err);
        res.status(500).json({ error: err.message });
    }
});


router.get('/', async (req, res) => {
    try {
        const quizs = await Quiz.find();
      res.status(200).json(quizs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Fetch all quizzes
router.get('/quizzes/:quizId', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId).populate('questions');
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        res.json(quiz);  // Send the full quiz data back to the frontend
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});


// Get a single quiz by ID
router.get('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('questions'); // Populate question details
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
        res.json(quiz);
    } catch (err) {
        console.error('Error fetching quiz:', err);
        res.status(500).json({ error: 'Failed to fetch quiz' });
    }
});

// Update a quiz by ID
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, questions } = req.body;

        // Validate the title and questions
        if (!title || !questions || questions.length === 0) {
            return res.status(400).json({ error: 'Title and questions are required.' });
        }

        // Update each question
        const updatedQuestions = await Promise.all(
            questions.map(async (questionData) => {
                return await Question.findByIdAndUpdate(questionData._id, questionData, { new: true });
            })
        );

        // Update the quiz with the new title and questions
        const quiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            { title, questions: updatedQuestions.map(q => q._id), createdBy: req.user.id },
            { new: true }
        );

        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

        res.json(quiz);
    } catch (err) {
        console.error('Error updating quiz:', err);
        res.status(400).json({ error: err.message });
    }
});

// Delete a quiz by ID
router.delete('/:id', auth, async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndDelete(req.params.id);
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
        res.json({ message: 'Quiz deleted successfully' });
    } catch (err) {
        console.error('Error deleting quiz:', err);
        res.status(500).json({ error: 'Failed to delete quiz' });
    }
});

// Add this route to handle quiz submissions
router.post('/:quizId/submit', auth, async (req, res) => {
    const { quizId } = req.params;
    const { answers } = req.body; // `answers` should be an object containing question IDs and selected options

    try {
        const quiz = await Quiz.findById(quizId).populate('questions');
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
        
        let score = 0;

        // Calculate score
        quiz.questions.forEach(question => {
            const correctAnswer = question.options.find(option => option.isCorrect); // Assuming options have an `isCorrect` property
            if (correctAnswer && answers[question._id] === correctAnswer.text) {
                score++;
            }
        });

        res.status(200).json({ score, total: quiz.questions.length });
    } catch (err) {
        console.error('Error submitting quiz:', err);
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
