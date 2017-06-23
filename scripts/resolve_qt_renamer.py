#!/usr/bin/env python

import os, sys, re
sys.path.append("../../")
from dmx.lib import paths


base_dir = sys.argv[1]
all_files = paths.get_all_files_in_subdirs(base_dir)

for f in all_files:
    if f.endswith('mov'):
        new_path = re.sub(r".\[\d+-\d+\]", "", f)
        os.rename(f, new_path)
