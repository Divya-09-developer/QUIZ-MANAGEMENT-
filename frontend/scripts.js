const apiUrl = 'http://localhost:5000';

// Register User
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
    });

    const data = await response.json();
    alert(data.message || data.error);
});

// Login User
document.getElementById('login-form')?.addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        
        const response = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
            // Store JWT token for future requests
        const data = await response.json();
        

        if (response.ok) {
            const role = data.role;

            // Store JWT token for future requests
            localStorage.setItem('token', data.token);

            // Redirect based on role
            if (role === 'teacher') {
                window.location.href = 'create_quiz.html'; // Redirect to quiz creation page
            } else if (role === 'student') {
                window.location.href = 'take_quiz.html'; // Redirect to quiz taking page
            }
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

//loadquizzes
async function loadQuizzes() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/quizzes`,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        // Log the raw response
        console.log('Response Status:', response.status);
        console.log('Response Headers:', response.headers);

        if (!response.ok) {
            const rawResponse = await response.text(); // Get raw HTML or error message
            console.error('Failed to load quizzes:', rawResponse);
            alert('Failed to load the quiz properly. Please try again.');
            return;
        }

        const data = await response.json();  // Parse JSON only if the response is OK

        if (Array.isArray(data) && data.length > 0) {
            const quizContainer = document.getElementById('quiz-container');
            quizContainer.innerHTML = ''; // Clear previous content

            data.forEach(quiz => {
                const quizElement = document.createElement('div');
                quizElement.innerHTML = `<h3>${quiz.title}</h3>
                                         <button onclick="takeQuiz('${quiz._id}')">Take Quiz</button>`;
                quizContainer.appendChild(quizElement);
            });
        } else {
            console.warn('No quizzes found or data is not an array:', data);
            alert('No quizzes available at the moment.');
        }

    } catch (error) {
        console.error('Error loading quizzes:', error);
    }
}



// Function to load quiz questions
async function takeQuiz(quizId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${apiUrl}/quizzes/${quizId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        // Log the response status
        console.log('Take Quiz Response Status:', response.status);

        if (!response.ok) {
            const errorMessage = await response.text();
            console.error('Error fetching quiz:', errorMessage);
            alert('Failed to load the quiz. Please try again.');
            return;
        }

        const quiz = await response.json();
        console.log('Quiz data received:', quiz); // Log the entire quiz data

        // Ensure the quiz data is properly formatted before passing to displayQuiz
        if (quiz.title && quiz.questions) {
            displayQuiz(quiz);
        } else {
            console.error('Invalid quiz structure:', quiz);
            alert('Failed to load the quiz properly. Please try again.');
        }
    } catch (error) {
        console.error('Error fetching quiz:', error);
        alert('An error occurred while fetching the quiz.');
    }
}


//diaplay quiz

function displayQuiz(quiz) {
    const quizContainer = document.getElementById('quiz-container');

    // Log the quiz title and questions array for verification
    console.log('Quiz Title:', quiz.title);
    console.log('Quiz Questions:', quiz.questions);

    // Display quiz title
    quizContainer.innerHTML = `<h2>${quiz.title}</h2>`;

    // Loop through each question and display it along with the options
    if (Array.isArray(quiz.questions) && quiz.questions.length > 0) {
        quiz.questions.forEach((question) => {
            // Display question text
            quizContainer.innerHTML += `<p>${question.text}</p>`;

            // Check if question has options
            if (Array.isArray(question.options) && question.options.length > 0) {
                let optionsHtml = '';
                question.options.forEach((option) => {
                    optionsHtml += `
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="question${question._id}" value="${option}" id="${option}">
                            <label class="form-check-label" for="${option}">${option}</label>
                        </div>`;
                });

                // Append options HTML to the quizContainer
                quizContainer.innerHTML += optionsHtml;
            } else {
                quizContainer.innerHTML += '<p>No options available.</p>';
            }
        });
    } else {
        quizContainer.innerHTML += '<p>No questions available.</p>';
    }

    // Add a submit button for the quiz
    quizContainer.innerHTML += `<button id="submit-quiz">Submit Quiz</button>`;
    document.getElementById('submit-quiz').addEventListener('click', () => submitQuiz(quiz._id));
}





// Submit Quiz Response
async function submitQuiz(quizId) {
    const token = localStorage.getItem('token');
    const responses = [];

    document.querySelectorAll(`[name^="question"]`).forEach((input) => {
        if (input.checked) {
            const questionId = input.name.replace('question', '');
            responses.push({ question: questionId, selectedOption: input.value });
        }
    });

    const response = await fetch(`${apiUrl}/responses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ quizId, responses })
    });

    const result = await response.json();
    if (response.ok) {
        localStorage.setItem('quizResult', JSON.stringify(result)); // Store result in localStorage
        window.location.href = 'result.html'; // Redirect to results page
    } else {
        alert(result.error);
    }
}

// Add Another Question Button Event Listener (create_quiz.html)
document.getElementById('add-question-btn')?.addEventListener('click', () => {
    const questionItem = document.createElement('div');
    questionItem.classList.add('question-item');
    questionItem.innerHTML = `
        <label for="question">Question:</label>
        <input type="text" class="question-text" name="question" required><br><br>

        <label for="option1">Option 1:</label>
        <input type="text" class="option" name="option1" required><br>
        <label for="option2">Option 2:</label>
        <input type="text" class="option" name="option2" required><br>
        <label for="option3">Option 3:</label>
        <input type="text" class="option" name="option3" required><br>
        <label for="option4">Option 4:</label>
        <input type="text" class="option" name="option4" required><br>

        <label for="correct-answer">Correct Answer:</label>
        <input type="text" class="correct-answer" name="correct-answer" required><br><br>
    `;
    document.getElementById('questions-container').appendChild(questionItem);
});

// Load Questions
async function loadQuestions() {
    // Placeholder function to load questions from the server or elsewhere
    console.log("Load Questions function called.");

    // Example code to fetch questions from the server (if applicable)
    /*
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/questions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        const questions = await response.json();
        // Process and display questions as needed.
    } catch (error) {
        console.error('Error loading questions:', error);
    }
    */
}

// Load Questions when the page is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Call loadQuizzes() on page load if on the student dashboard
    if (window.location.pathname.endsWith('take_quiz.html')) {
        loadQuizzes();
    }

    // Call loadQuestions() on page load if on the create_quiz.html
    if (window.location.pathname.endsWith('create_quiz.html')) {
        loadQuestions();
        
        document.getElementById('quiz-form')?.addEventListener('submit', async function (event) {
            event.preventDefault(); // Prevent default form submission
        
            const title = document.getElementById('quizTitle').value;
            const questions = [];
        
            // Collect and validate questions
            let isValid = true;
            document.querySelectorAll('.question-item').forEach((item) => {
                const questionText = item.querySelector('.question-text')?.value.trim();
                const options = Array.from(item.querySelectorAll('.option')).map(input => input.value.trim());
                const correctAnswer = item.querySelector('.correct-answer')?.value.trim();
        
                // Validate all fields
                if (!questionText || options.some(option => !option) || !correctAnswer) {
                    alert("Please fill out all fields for each question.");
                    isValid = false; // Mark form as invalid
                    return; // Skip further processing
                }
        
                questions.push({
                    text: questionText,
                    options: options,
                    answer: correctAnswer
                });
            });
        
            // If the form is not valid, stop submission
            if (!isValid || questions.length === 0) {
                return;
            }
        
            // Prepare the quiz data payload
            const quizData = { title, questions };
        
            try {
                const token = localStorage.getItem('token');  // Ensure the user is authenticated
        
                // Check if token is available, if not redirect to login
                if (!token) {
                    alert('You are not authenticated. Please login first.');
                    window.location.href = 'login.html'; // Redirect to login page
                    return;
                }
        
                const response = await fetch(`${apiUrl}/quizzes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,  // Send JWT token for authentication
                    },
                    body: JSON.stringify(quizData),  // Send the quiz data
                });
        
                const data = await response.json(); // Wait for the response data
        
                if (response.ok) {
                    alert('Quiz created successfully!');
                    window.location.href = 'index.html';  // Redirect to teacher dashboard
                } else {
                    alert(data.error); // Show error returned from server
                }
            } catch (error) {
                console.error('Error:', error); // Log any errors during fetch
                alert("An error occurred while creating the quiz."); // User-friendly error message
            }
        });        
        
    }

    // Call displayResult() on page load if on the results page
    if (window.location.pathname.endsWith('result.html')) {
        displayResult();
    }
});

// Display Result on Result Page
function displayResult() {
    const result = JSON.parse(localStorage.getItem('quizResult'));
    const resultContainer = document.getElementById('result-container');

    if (result) {
        resultContainer.innerHTML = `<h2>Your Quiz Results</h2>
                                    <p>Total Questions: ${result.totalQuestions}</p>
                                    <p>Correct Answers: ${result.correctAnswers}</p>
                                    <p>Your Score: ${result.score}</p>`;
    } else {
        resultContainer.innerHTML = '<p>No results found.</p>';
    }
}
