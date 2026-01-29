import instructor
from openai import OpenAI
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()  
class ExtractGame(BaseModel):
    game_name: str
    game_HTML: str
topic = input("Topic: ")
client = instructor.from_openai(
    OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv("OPENROUTER_API_KEY"),  
    ),
    mode=instructor.Mode.JSON
)
resp = client.create(
    model="moonshotai/kimi-k2.5",  
    response_model=ExtractGame,
    messages=[{"role": "user", "content": 
    f"You are to make a game for the {topic}, you should add challenges to the game to make it as immersive as possible and make the challenges hard so that the concept gets reinforced in the user’s mind. You should not make a game with a quiz, you should add a fun concept so play around with. You should also run through all the missions/challenges in the game once to make sure there are no bugs and that the game is actually completable using the tools given, especially if using the sliders make sure the game is completable with the values within the range of the sliders."}],
)
print(resp)
# Save the game HTML to a file
filename = f"{resp.game_name.replace(' ', '_')}.html"
with open(filename, "w") as f:
    f.write(resp.game_HTML)
print(f"Game saved to {filename}")