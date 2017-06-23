#!/usr/bin/env python


import os, sys, re, time


submissions_dir = "/Volumes/general/submissions"
shots_dir = "/Volumes/general/shots"

try:
    search_dir = sys.argv[1]
except:
    search_dir = submissions_dir


ignore_list = [
    "HFT_PRF_20170403_A",    "HFT_PRF_20170404_A",    "HFT_PRF_20170407_A",    "HFT_PRF_20170410_A",    "HFT_PRF_20170411_A",    "HFT_PRF_20170413_A",    "HFT_PRF_20170418_A",    "HFT_PRF_20170418_B",    "HFT_PRF_20170419_A",    "HFT_PRF_20170421_A",    "HFT_PRF_20170424_A",    "HFT_PRF_20170424_B",    "HFT_PRF_20170426_A",    "HFT_PRF_20170427_A",    "HFT_PRF_20170427_E",    "HFT_PRF_20170428_A",    "HFT_PRF_20170501_A",    "HFT_PRF_20170502_A",    "HFT_PRF_20170504_A",    "HFT_PRF_20170504_B",    "HFT_PRF_20170504_C",    "HFT_PRF_20170505_A",    "HFT_PRF_20170505_B",    "HFT_PRF_20170508_A",    "HFT_S3D_20170118_A",    "HFT_S3D_20170118_B",    "HFT_S3D_20170120_A",    "HFT_S3D_20170124_A",    "HFT_S3D_20170124_B",    "HFT_S3D_20170124_C",    "HFT_S3D_20170130_A",    "HFT_S3D_20170130_B",    "HFT_S3D_20170130_C",    "HFT_S3D_20170130_D",    "HFT_S3D_20170208_A",    "HFT_S3D_20170208_B",    "HFT_S3D_20170208_C",    "HFT_S3D_20170208_D",    "HFT_S3D_20170214_A",    "HFT_S3D_20170214_B",    "HFT_S3D_20170214_C",    "HFT_S3D_20170214_D",    "HFT_S3D_20170221_A",    "HFT_S3D_20170221_B",    "HFT_S3D_20170221_C",    "HFT_S3D_20170221_D",    "HFT_S3D_20170222_A",    "HFT_S3D_20170302_A",    "HFT_S3D_20170302_B",    "HFT_S3D_20170302_C",    "HFT_S3D_20170302_D",    "HFT_S3D_20170303_A",    "HFT_S3D_20170307_A",    "HFT_S3D_20170307_B",    "HFT_S3D_20170307_C",    "HFT_S3D_20170307_D",    "HFT_S3D_20170308_A",    "HFT_S3D_20170314_A",    "HFT_S3D_20170314_B",    "HFT_S3D_20170314_C",    "HFT_S3D_20170321_A",    "HFT_S3D_20170321_B",    "HFT_S3D_20170321_C",    "HFT_S3D_20170321_D",    "HFT_S3D_20170328_A",    "HFT_S3D_20170328_B",    "HFT_S3D_20170328_C",    "HFT_S3D_20170404_A",    "HFT_S3D_20170404_B",    "HFT_S3D_20170404_C",    "HFT_S3D_20170404_D",    "HFT_S3D_20170414_A",    "HFT_S3D_20170414_B",
]

for root, dirs, files in os.walk(search_dir):

    skip = False
    for i in ignore_list:
        for d in dirs:
            if i in d:
                print "skipping:", d
                dirs.remove(d)
                skip = True
    if skip: continue

    makeLinks = False
    outputSymDir = None
    for f in files:

        if f.endswith('.exr'):
            if f.startswith('zzz'): continue
            makeLinks = True
            base_dir = root.lstrip(submissions_dir)

            parts = base_dir.split("/")

            shot_name  = re.search("^(.+)_(right|left).\d+.exr$", f).group(1)
            sub_dir    = parts[0]
            file_type  = "exr"
            resolution = re.search("/(\d+x\d+)", base_dir).group(1)
            eye        = re.search("(left|right)", f.lower()).group(1)

            outputSymDir = os.path.join(shots_dir, sub_dir, shot_name, file_type, eye, resolution)
            if not os.path.isdir(outputSymDir): os.makedirs(outputSymDir)
            break

    if makeLinks:
        for f in sorted(files):
            if f.endswith('.exr'):

                dst_f = f
                match = re.search("(_\d+.exr)", dst_f)
                if match:
                    new_ending = match.group(1).replace('_','.')
                    dst_f = dst_f.replace(match.group(1), new_ending)

                src = os.path.join(root, f)
                dst = os.path.join(outputSymDir, dst_f)

                if os.path.exists(dst):
                    print "exists:", dst
                    pass
                else:
                    print "creating:", dst
                    retries = 5
                    while retries:
                        try:
                            if retries < 5:
                                print "retrying:", dst
                                time.sleep(2)
                            os.symlink(src, dst)
                            break
                        except:
                            retries -= 1
                            if not retries:
                                print "ERROR"
                                print "Could not be created:", dst
                                print "SOURCE:", src
                                sys.exit(1)
                            continue
