import json

with open('out.json', 'r') as f:
    obj = json.load(f)

names = []

for x in obj:
    names.append(x.split("\n")[1])

def update(x):
    l = len(x)
    for n in filter(lambda y: y.startswith(x), names):
        s = n[0:l+1]
        if not s in num_map:
            num_map[s] = 0
        num_map[s] += 1

def bins(n, m, f):
    i0 = n
    i2 = m
    while i0 != i2:
        i1 = (i2 + i0) // 2
        if f(i1) == True: # l  i0 ... i1
            i2 = i1
        else: # r i1+1 ... i2
            i0 = i1 + 1
    return i0

num_map = {}

thres = 10

update('')

i = 0

while max(num_map.values()) > thres:
    for (k, v) in list(num_map.items()):
        if v > thres:
            i += 1
            del num_map[k]
            update(k)

num_map_sort = sorted(num_map.items(), key=lambda x: x[0])

stack_k = []
stack_v = 0
