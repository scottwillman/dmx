#!/usr/bin/env python

import os, sys, argparse
sys.path.append("../../")
from dmx.lib import paths


ALLOWED_EXTENSIONS = ['exr','mov']

parser = argparse.ArgumentParser(description='Build and launch an RV session based on the contents of a supplied directory.')
parser.add_argument('--dir', help='Directory containing images', required=True)
parser.add_argument('--formats', nargs="+", default=ALLOWED_EXTENSIONS)
args = parser.parse_args()

RV_PATH = "/Applications/RV64.app/Contents/MacOS/RV"


all_files = paths.get_all_files_in_subdirs(args.dir)
seqs      = paths.group_file_sequences(all_files, padding_type="precision")
groups    = paths.find_and_group_paths(seqs)


paths = []
for group in groups[0]:

    try:
        ext = os.path.splitext(group['left'])[1].lower().lstrip('.')
    except IndexError:
        continue
    except KeyError:
        print "ERROR:", group
        continue

    if ext in args.formats:
        paths.append("[ %s ]" % group['left'])

rv_params = " ".join(paths)

cmd = "%s %s -eval 'pushEventTable(\"stereo\");' -present" % (RV_PATH, rv_params)

os.system(cmd)
