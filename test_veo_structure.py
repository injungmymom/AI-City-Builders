import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
from pathlib import Path
import time

load_dotenv(dotenv_path='.env')

def test_veo():
    client = genai.Client(api_key=os.getenv('GCP_API_KEY'))
    
    print("🎬 Veo 3.1 Test Start...")
    try:
        operation = client.models.generate_videos(
            model="veo-3.1-generate-preview",
            prompt="A cute cat running in a park, cinematic, 4k",
            config=types.GenerateVideosConfig(
                aspect_ratio="9:16",
                number_of_videos=1,
            )
        )
        
        print(f"Operation Name: {operation.name}")
        
        while not operation.done:
            print("P", end="", flush=True)
            time.sleep(10)
            operation = client.operations.get(operation=operation)
        
        print("\nDone!")
        print(f"Result: {operation.result}")
        print(f"Error: {operation.error}")
        
        if operation.result and (getattr(operation.result, 'generated_videos', None) or getattr(operation.result, 'videos', None)):
            videos = getattr(operation.result, 'generated_videos', None) or getattr(operation.result, 'videos', None)
            for i, video in enumerate(videos):
                print(f"\n--- Video {i} Full Object ---")
                print(video)
                print(f"Type: {type(video)}")
                # Check for uri and video fields specifically
                print(f"Has 'uri': {hasattr(video, 'uri')}, Value: {getattr(video, 'uri', 'N/A')}")
                print(f"Has 'video': {hasattr(video, 'video')}, Value: {getattr(video, 'video', 'N/A')}")
        else:
            print(f"No videos in result. Result type: {type(operation.result)}")
            print(f"Result data: {operation.result}")

            
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_veo()
