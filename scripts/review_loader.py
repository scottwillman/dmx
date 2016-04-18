#!/usr/bin/env python

import os, sys


base_path = sys.argv[1]

paths = []

for root, dirs, files in os.walk(base_path):
    if files:
        if files[0].endswith('.exr'):
            for f in files:
                if 'left' in f and '.exr' in f:
                    paths.append("%s" % root)
                    break

print " ".join(paths)
