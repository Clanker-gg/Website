# Using the Backend API

## Option 1: Using the server

Use `https://34.150.25.115.sslip.io/api/videos` as your API url.
This will only work if the server is running a debug environment. In production, it will only allow requests from the frontend server itself, so this will no longer work.

## Option 2: Running the backend on your device

## Installation

```bash
cd backend # if needed
pip install -r requirements.txt
```

## Running the Server

Create a `.env` file in `\backend` with the contents:

```bash
YOUTUBE_API_KEY="<api token (find the value on google cloud)>"
```

or store the env variable `YOUTUBE_API_KEY` on your terminal/computer.

```bash
python manage.py runserver localhost:5000
```

You can now use `https://localhost:5000/api/videos` as your API url.

# LLM Wrapper - Lesson Plan Generator

An AI-powered lesson plan generator that creates structured educational curricula using the Mistral Large model.

## Overview

This module provides an interactive CLI tool for generating comprehensive lesson plans on any topic. It uses structured output with Pydantic models to ensure consistent, well-formatted educational content.

## Features

- **Structured Lesson Plans**: Generates complete curricula with lessons, subtopics, and examples
- **Customizable Lesson Count**: Specify exactly how many lessons you need
- **Progressive Difficulty**: Lessons build from foundational to advanced concepts
- **Real-Life Examples**: Each lesson includes practical, real-world applications
- **JSON Export**: Automatically saves lesson plans in structured JSON format
- **Multiple Difficulty Levels**: Supports Elementary, Middle School, High School, and University levels

## Dependencies

```
openai
pydantic
instructor
```

## Usage

```bash
python manage.py rundev
```

### Interactive Flow

1. **Specify lesson count**:
   ```
   Please specify how many lessons you want to generate:
   User: 5
   ```

2. **Enter topic**:
   ```
   Please specify on what topic you want to generate lessons on:
   User: Machine Learning
   ```

3. **View generated plan**: The lesson plan will display in the console and save to JSON

4. **Continue or exit**: Enter another topic or type `quit` to exit

## Data Models

### LessonPlan
| Field | Type | Description |
|-------|------|-------------|
| `genre` | `str` | Subject category (e.g., biology, physics, math) |
| `lessons` | `List[Lesson]` | Array of generated lessons |
| `prerequisites` | `List[str]` | Required prior knowledge |

### Lesson
| Field | Type | Description |
|-------|------|-------------|
| `name` | `str` | Lesson title (5-8 words) |
| `description` | `str` | Brief lesson description |
| `subtopics` | `List[str]` | 3-5 specific learning points |
| `real_life_examples` | `List[str]` | 2-4 practical examples |
| `difficulty` | `str` | Educational level |

## Output

### Console Output
```
Genre: Computer Science
Prerequisites: ['Basic Programming', 'Statistics']
Total Lessons: 5

Lesson 1: Introduction to Machine Learning Concepts
Difficulty: High School
Description: Foundational overview of ML principles...
Subtopics: supervised learning, unsupervised learning, neural networks
Real-life Examples: spam filters, recommendation systems
----------------------------------------
```

### JSON Export
Lesson plans are saved as `lesson_plan_{topic}.json`:
```json
{
  "topic": "Machine Learning",
  "requested_lessons": 5,
  "generated_lessons": 5,
  "genre": "Computer Science",
  "prerequisites": ["Basic Programming", "Statistics"],
  "lessons": [...]
}
```

## Model Configuration

| Setting | Value |
|---------|-------|
| API Provider | Mistral AI |
| Model | `mistral-large-latest` |
| Temperature | 0.7 |
| Response Format | Structured (via Instructor) |

## Supported Genres

The AI categorizes topics into genres including:
- Math, Science, Biology, Physics, Chemistry
- History, Literature, Art, Philosophy
- Technology, Computer Science, Engineering
- Business, Economics, Psychology, Sociology

## Example

```bash
$ python Wrapper.py
Please specify how many lessons you want to generate:
User: 3
Client initialized: Type quit to exit.
Please specify on what topic you want to generate lessons on:
User: Quantum Physics

Genre: Physics
Prerequisites: ['Classical Mechanics', 'Linear Algebra', 'Calculus']
Total Lessons: 3
...
```

## Notes

- In your .env file, you'll need the have your mistral api key and django SECRET_KEY
- Generate the secret key with:
```bash
python - <<EOF
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
EOF
```
- Lessons progress logically from foundational to advanced topics
- Prerequisites are listed comprehensively, including basic concepts