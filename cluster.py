import json

with open('out.json', 'r') as f:
    obj = json.load(f)

names = []

for i, x in enumerate(obj):
    names.append([i, x.split("\n")[1]])

names = sorted(names, key=lambda x: x[1])

num_map = {}

first_map = {}

takelen = 2

for (i, n) in enumerate(names):
    n = n[1]
    s = n[0:takelen]
    if not s in first_map:
        first_map[s] = i
    if not s in num_map:
        num_map[s] = 0
    num_map[s] += 1

import random

lis = list(num_map.items())

random.shuffle(lis)

lis = sorted(lis, key=lambda x: x[1])

size = 10
divides = []
stack = []
total = 0

for (k, v) in lis:
    if total + v > size:
        divides.append([stack, total])
        stack = []
        total = 0
    stack.append([k, v])
    total += v

divides.append([stack, total])

def split(list_to_split, len_each_list):
    l = []
    for i in range(0, len(list_to_split), len_each_list):
        l.append(list_to_split[i:i + len_each_list])
    return l

def split2(l, n):
    a = len(l) // n
    b = len(l) % n
    # a - b  x  n         
    # b      x  n + 1
    # (a - b)*n + b*(n + 1) = a*n + b = len(l)
    return split(l[0 : (a - b) * n], n) + split(l[(a - b) * n : (a - b) * n + b * (n + 1)], n + 1)

def bins_ft(n, m, f):
    i0 = n
    i2 = m
    while i0 != i2:
        i1 = (i2 + i0) // 2
        if f(i1) == True: # l (i0 ... i1)
            i2 = i1
        else: # r (i1+1 ... i2)
            i0 = i1 + 1
    return i0

import math

result = []

for [prefixes, num] in divides:
    if num > size:
        assert len(prefixes) == 1
        prefix = prefixes[0][0]
        small_size = num // (num // 10)
        f = first_map[prefix]
        # print(num, small_size)
        matches = names[f : f + num]
        random.shuffle(matches)
        s = split2(matches, small_size)
        result += s
        # print(list(map(len, s)))
    else:
        r = []
        for [prefix, m] in prefixes:
            f = first_map[prefix]
            matches = names[f : f + m]
            random.shuffle(matches)
            r += matches
        result.append(r)

random.shuffle(result)

with open('names.json', 'w') as f:
    json.dump(result, f, indent=1, ensure_ascii=False)