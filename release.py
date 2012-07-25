#!/usr/bin/python
import os
import shutil
import zipfile

FILES = ["manifest.json",
         "fb.js",
         "options.js",
         "options_page.js",
         "background.js",
         "jquery.js",
         "options.html",
         "icon-16.png"]

RELEASE_DIR = "release"

if os.path.isdir(RELEASE_DIR):
    raise Exception("Release directory already exists.")

os.mkdir(RELEASE_DIR)
for f in FILES:
    shutil.copy2(f, os.path.join(RELEASE_DIR, f))
