#!/usr/bin/python
import os
import shutil, errno
import zipfile

def copyanything(src, dst):
    try:
        shutil.copytree(src, dst)
    except OSError as ex:
        if ex.errno == errno.ENOTDIR:
            shutil.copy(src, dst)
        else:
            raise

def rmanything(src):
    try:
        try:
            shutil.rmtree(src)
        except OSError as ex:
            if ex.errno == errno.ENOTDIR:
                os.remove(src)
    except OSError as ex:
        if ex.errno != errno.ENOENT:
            raise

def zipdir(src, dst):
    zip = zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED)
    rootlen = len(src) + 1
    for base, dirs, files in os.walk(src):
       for file in files:
          fn = os.path.join(base, file)
          zip.write(fn, fn[rootlen:])

FILES = ["manifest.json",
         "fb.js",
         "options.js",
         "options_page.js",
         "background.html",
         "jquery.js",
         "options.html",
         "icon-16.png",
         "_locales"]

RELEASE_DIR = "release"
RELEASE_FILE = "release.zip"

rmanything(RELEASE_DIR)
rmanything(RELEASE_FILE)
os.mkdir(RELEASE_DIR)

for f in FILES:
    copyanything(f, os.path.join(RELEASE_DIR, f))

zipdir(RELEASE_DIR, RELEASE_FILE)