import glob
import re
import xml.etree.ElementTree as ET
xmls = glob.glob('./all_xml/*/*.xml')
xmls = list(reversed(sorted(xmls)))
jsonobj = []
output_txt = False

def n(x):
    return x or ''

def remove_last_spaces(x):
    return re.sub('[\n ]*$', '', x)

def is_only_spaces(x):
    return re.match("^[\n ]*$", x)

def innerXML(tag):
    return (tag.text or '') + ''.join(ET.tostring(e, encoding='unicode') for e in tag)

for i, fn in enumerate(xmls):
    print("%s / %s" % (i + 1, len(xmls)))
    with open(fn) as f:
        data = f.read()
    tree = ET.fromstring(data)
    result = ''
    for elem in tree.iter():
        append = ''

        text = n(elem.text)
        tail = n(elem.tail)

        if elem.tag in ['Rt', 'Ruby']:
            continue
        elif elem.find('Ruby'):
            append = re.sub('Rt>\n', 'Rt>', innerXML(elem))
        else:
            append = remove_last_spaces(text) + remove_last_spaces(tail)
            
            if elem.tag == "ItemTitle":
                append = "#i#" + append
            
            if elem.tag == "ParagraphNum":
                append = "#p#" + append

            if elem.tag == "ArticleTitle":
                append = "#a#" + append

            m = re.match('Subitem(\d+)Title', elem.tag)
            if m:
                append = ("#s%s#" % m[1]) + append
        
        if (not is_only_spaces(append)):
            result += append + "\n"
    
    jsonobj.append(result)
    if output_txt:
        with open('sample/%s.txt' % i, 'w') as f:
            f.write(result)

import json

with open('out.json', 'w') as f:
    json.dump(jsonobj, f, indent=1, ensure_ascii=False)