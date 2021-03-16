import json

with open('out.json', 'r') as f:
    obj = json.load(f)

set1 = set()

for x in obj:
    set1.add(x.split("\n")[1])

with open('names.json', 'r') as f:
    obj = json.load(f)

set2 = set()

for x in obj:
    for y in x:
        set2.add(y)

assert set1 == set2