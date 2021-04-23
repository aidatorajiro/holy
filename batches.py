import json

with open('out.json', 'r') as f:
    out_json = json.load(f)

with open('names.json', 'r') as f:
    name_json = json.load(f)

for i, x in enumerate(name_json):
    current = []
    for y in x:
        current.append(out_json[y[0]])
    with open('batches/%s.json' % i, 'w') as f:
        json.dump(current, f, indent=1, ensure_ascii=False)

with open('batches/len.txt', 'w') as f:
    f.write(str(len(name_json)))