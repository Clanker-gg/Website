// Configuration
const API_BASE_URL = 'http://localhost:8000'; // Change this to your Django server URL
const API_ENDPOINT = `${API_BASE_URL}/api/generate-course/`;

// DOM Elements
const courseForm = document.getElementById('courseForm');
const generateBtn = document.getElementById('generateBtn');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const results = document.getElementById('results');
const courseContent = document.getElementById('courseContent');
const downloadBtn = document.getElementById('downloadBtn');

// Global variable to store the generated course
let generatedCourse = null;

// Form submission handler
courseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data - updated to match Mistral API structure
    const formData = {
        topic: document.getElementById('topic').value,
        lessons_count: parseInt(document.getElementById('modules').value)  // Changed from modules_count
    };
    
    // Reset UI
    hideError();
    hideResults();
    showLoading();
    generateBtn.disabled = true;
    
    try {
        // Make API call
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate course');
        }
        
        if (data.success && data.course) {
            generatedCourse = data.course;
            displayCourse(data.course);
        } else {
            throw new Error('Invalid response format');
        }
        
    } catch (error) {
        showError(error.message);
        console.error('Error:', error);
    } finally {
        hideLoading();
        generateBtn.disabled = false;
    }
});

// Display the generated course - updated to match Mistral structure
function displayCourse(course) {
    let html = '';
    
    // Course header
    html += `
        <div class="course-header">
            <h3 class="course-title">${escapeHtml(course.genre || 'Generated Course')}</h3>
            <div class="course-meta">
                <span class="meta-item">Subject: ${escapeHtml(course.genre || 'N/A')}</span>
                <span class="meta-item">${course.total_lessons || course.lessons?.length || 0} Lessons</span>
            </div>
        </div>
    `;
    
    // Prerequisites
    if (course.prerequisites && course.prerequisites.length > 0) {
        html += `
            <div class="objectives">
                <h3>Prerequisites</h3>
                <ul>
                    ${course.prerequisites.map(prereq => `<li>${escapeHtml(prereq)}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    // Lessons (updated from modules)
    if (course.lessons && course.lessons.length > 0) {
        course.lessons.forEach((lesson, index) => {
            html += `
                <div class="module">
                    <div class="module-header">
                        <h3 class="module-title">Lesson ${index + 1}: ${escapeHtml(lesson.name)}</h3>
                        <p class="module-description">${escapeHtml(lesson.description || '')}</p>
                        <span class="difficulty-badge">${escapeHtml(lesson.difficulty || '')}</span>
                    </div>
            `;
            
            // Subtopics
            if (lesson.subtopics && lesson.subtopics.length > 0) {
                html += '<div class="lessons">';
                html += '<h4 style="margin-bottom: 12px; color: #2d3748;">Key Subtopics</h4>';
                html += '<ul style="list-style-position: inside; color: #4a5568; line-height: 1.8;">';
                lesson.subtopics.forEach(subtopic => {
                    html += `<li>${escapeHtml(subtopic)}</li>`;
                });
                html += '</ul>';
                html += '</div>';
            }
            
            // Real-life examples
            if (lesson.real_life_examples && lesson.real_life_examples.length > 0) {
                html += `
                    <div class="takeaways">
                        <h4>Real-life Examples</h4>
                        <ul>
                            ${lesson.real_life_examples.map(example => `<li>${escapeHtml(example)}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }
            
            html += '</div>';
        });
    }
    
    courseContent.innerHTML = html;
    showResults();
}

// Download course as JSON
downloadBtn.addEventListener('click', () => {
    if (!generatedCourse) return;
    
    const dataStr = JSON.stringify(generatedCourse, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `course_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});

// UI Helper Functions
function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    errorDiv.classList.add('hidden');
}

function showResults() {
    results.classList.remove('hidden');
}

function hideResults() {
    results.classList.add('hidden');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}