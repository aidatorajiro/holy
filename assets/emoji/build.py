import subprocess

subprocess.run(["lualatex", "main.tex"])

subprocess.run(["convert", "-density", "300", "main.pdf", "image.png"])

import glob

for p in glob.glob("./image-*.png"):
    subprocess.run(["mogrify", "-trim", p])
