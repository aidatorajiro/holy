import json

with open('out.json', 'r') as f:
    obj1 = json.load(f)

set1 = set(range(len(obj1)))

with open('names.json', 'r') as f:
    obj2 = json.load(f)

set2 = set()

for x in obj2:
    for y in x:
        set2.add(y[0])

assert set1 == set2