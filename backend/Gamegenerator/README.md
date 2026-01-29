# Game Generation Module

An AI-powered educational game generator that creates interactive HTML games based on user-specified topics.

## Overview

This module uses the OpenRouter API with the Kimi K2.5 model to dynamically generate educational HTML games. The generated games include challenges designed to reinforce learning concepts through interactive gameplay.

## Features

- **AI-Powered Game Creation**: Leverages large language models to generate complete HTML games
- **Topic-Based Generation**: Creates games tailored to any educational topic
- **Challenge-Focused Learning**: Games include immersive challenges to reinforce concepts
- **Automatic HTML Export**: Saves generated games as standalone HTML files

## Dependencies

```
instructor
openai
pydantic
python-dotenv
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key for accessing the Kimi K2.5 model |

Create a `.env` file in the project root:
```
OPENROUTER_API_KEY=your_api_key_here
```

## Usage

```bash
python Game_generation.py
```

When prompted, enter the educational topic you want to generate a game for:
```
Topic: Photosynthesis
```

The script will:
1. Send the topic to the AI model
2. Generate an interactive HTML game with challenges
3. Save the game as `{game_name}.html` in the current directory

## Output

The generated game includes:
- **Game Name**: A descriptive title for the game
- **Game HTML**: Complete, standalone HTML with embedded CSS and JavaScript

## Model Configuration

| Setting | Value |
|---------|-------|
| API Provider | OpenRouter |
| Model | `moonshotai/kimi-k2.5` |
| Response Format | JSON (via Instructor) |

## Data Models

### ExtractGame
| Field | Type | Description |
|-------|------|-------------|
| `game_name` | `str` | Name/title of the generated game |
| `game_HTML` | `str` | Complete HTML code for the game |

## Example

```bash
$ python Game_generation.py
Topic: Newton's Laws of Motion
# Game generated and saved as "Newtons_Motion_Challenge.html"
```

## Notes

- Games are designed to avoid simple quizzes in favor of interactive experiences
- The AI validates that games are completable before outputting
- Slider-based challenges are tested for valid value ranges
