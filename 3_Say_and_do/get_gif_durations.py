import os
import json
from PIL import Image

def get_gif_duration(file_path):
    try:
        img = Image.open(file_path)
        duration = 0
        for frame in range(img.n_frames):
            img.seek(frame)
            duration += img.info.get('duration', 100)
        return duration
    except Exception as e:
        return 3500

folder = '/Users/syifasabrina/Documents/emodul-project/3_Say_and_do/assets'
durations = {}

for filename in os.listdir(folder):
    if filename.endswith('.gif'):
        path = os.path.join(folder, filename)
        name = filename.replace('.gif', '').replace('-', '_')
        # handle the specific names if they differ
        if name == 'breakfast': name = 'have_breakfast'
        if name == 'lunch_at_school': name = 'have_lunch'
        if name == 'dinner': name = 'have_dinner'
        if name == 'brush_teeth' or name == 'brushing_teeth': name = 'brush_my_teeth'
        
        durations[name] = get_gif_duration(path)

print(json.dumps(durations, indent=2))
