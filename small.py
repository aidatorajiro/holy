import json
import random

with open('out.json', 'r') as f:
    obj = json.load(f)

N = 100

with open('out.small.json', 'w') as f:
    json.dump(random.sample(obj, N), f, indent=1, ensure_ascii=False)