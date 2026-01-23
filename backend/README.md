# Using the Backend API

## Option 1: Using the server

Use `"https://34.150.25.115.sslip.io/api/videos"` as your api url.
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

The API will be available at `https://localhost:5000/` (+ `api/videos`)