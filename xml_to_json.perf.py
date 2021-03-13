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
        append = ''

        text = n(elem.text)
        tail = n(elem.tail)

        if elem.tag in ['Rt', 'Ruby', 'QuoteStruct', 'Sup', 'ArithFormula', 'Sub']: # elem is either Rt or Ruby
            continue

        if all(map(lambda x: x.tag in ['Ruby', 'QuoteStruct', 'Sup', 'ArithFormula', 'Sub'], elem)): # has only these direct child, or no child
            append = innerXML(elem).replace("\n", "").replace("<Ruby>", "$").replace("</Ruby>", "$").replace("<Rt>", "%").replace("</Rt>", "%").replace("<Rt />", "").replace("<Rt/>", "")

            if ("Ruby" in append):
                print(tst(elem))
                raise Exception("unhandled Ruby detected")
            
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
                result += append + "\n"
            else:
                print("Unhandled empty tag")
                print(tst(elem))
        else:
            if not is_only_spaces(text + tail):
                print(tst(elem))
                raise Exception("unhandled element with text exist")
    
    jsonobj.append(result)
    if output_txt:
        with open('sample/%s.txt' % i, 'w') as f:
            f.write(result)

import json

with open('out.json', 'w') as f:
    json.dump(jsonobj, f, indent=1, ensure_ascii=False)