#!/usr/bin/env python

import os, sys
sys.path.append("../../")
from dmx.lib import paths


base_path = sys.argv[1]
ALLOWED_EXTENSIONS = ['exr','mov']

all_files = paths.get_all_files_in_subdirs(base_path)
seqs      = paths.group_file_sequences(all_files)
groups    = paths.find_and_group_paths(seqs)


paths = []
for group in groups[0]:

    try:
        ext = os.path.splitext(group['left'])[1].lower().lstrip('.')
    except IndexError:
        continue

    if ext in ALLOWED_EXTENSIONS:
        paths.append("[ %s ]" % group['left'])


print " ".join(paths)
