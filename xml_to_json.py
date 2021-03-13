import glob
import re
import xml.etree.ElementTree as ET
xmls = glob.glob('./all_xml/*/*.xml')
xmls = list(reversed(sorted(xmls)))
jsonobj = []
output_txt = False
get_nonempty_set = False
nonempty_set = set()
nonempty_set_child = set()

def n(x):
    return x or ''

def remove_last_spaces(x):
    return re.sub('[\n \t]*$', '', x)

def is_only_spaces(x):
    return re.match("^[\n \t]*$", x)

def tst(e):
    return ET.tostring(e, encoding='unicode')

def innerXML(tag):
    return (tag.text or '') + ''.join(tst(e) for e in tag)

for i, fn in enumerate(xmls):
    print("%s / %s" % (i + 1, len(xmls)))
    with open(fn) as f:
        data = f.read()
    tree = ET.fromstring(data)
    result = ''
    for elem in tree.iter():
        text = n(elem.text)
        tail = n(elem.tail)

        if elem.tag == "Ruby":
            append = remove_last_spaces(tst(elem)).replace("\n", "").replace("<Ruby>", "$").replace("</Ruby>", "$").replace("<Rt>", "%").replace("</Rt>", "%").replace("<Rt/>", "%%")
        elif elem.tag == "Rt":
            append = ''
        else:
            append = (remove_last_spaces(text) + remove_last_spaces(tail)).replace("\n", "")

            if elem.tag == "ItemTitle":
                append = "#i#" + append

            if elem.tag == "ParagraphNum":
                append = "#p#" + append

            if elem.tag == "ArticleTitle":
                append = "#a#" + append

            m = re.match('Subitem(\d+)Title', elem.tag)
            if m:
                append = ("#s%s#" % m[1]) + append

        if not is_only_spaces(append):
            if get_nonempty_set:
                nonempty_set.add(elem.tag)
                for x in elem.iter():
                    nonempty_set_child.add(x.tag)
            
            result += append + "\n"

    jsonobj.append(result)
    if output_txt:
        with open('sample/%s.txt' % i, 'w') as f:
            f.write(result)

import json

with open('out.json', 'w') as f:
    json.dump(jsonobj, f, indent=1, ensure_ascii=False)

if get_nonempty_set:
    with open('nonempty_set.txt', 'w') as f:
        f.write(str(nonempty_set))
    with open('nonempty_set_child.txt', 'w') as f:
        f.write(str(nonempty_set_child))