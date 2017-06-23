#!/usr/bin/env python


import re, sys, os, csv
from pprint import pprint



finals_list_file = "/volume1/general/StereoFinalsList.csv"
submissions_dir  = "/volume1/general/submissions/HFT_S3D_20170222_A"
finals_dir       = "/volume1/general/finals"


def convertListToString(x): return x[0]

with open(finals_list_file, 'rbU') as f:
    reader = csv.reader(f)
    finals_list = map((lambda x: x[0].lower()), reader)


IGNORE_DIRS = ["QTs", "Submission_Forms"]

for root, dirs, files in os.walk(submissions_dir):

    for i in IGNORE_DIRS:
        if i in dirs: dirs.remove(i)

    for f in sorted(files):
        if f.lower().endswith('.exr'):
            for l in finals_list:
                if l in f:
                    # makeLinks = True
                    print "Found:", f
                    base_dir = root.lstrip(submissions_dir)

                    parts = base_dir.split("/")

                    shot_name  = re.search("^(.+)_(right|left).\d+.exr$", f).group(1)
                    sub_dir    = parts[0]
                    file_type  = "exr"
                    resolution = re.search("/(\d+x\d+)", base_dir).group(1)
                    eye        = re.search("(left|right)", f.lower()).group(1)
                    multi_part = re.search("/(pt\d)/", f.lower())
                    if multi_part:
                        shot_name = "%s_%s" % (shot_name, multi_part.group(1))

                    outputSymDir = os.path.join(finals_dir, sub_dir, shot_name, file_type, eye, resolution)
                    if not os.path.isdir(outputSymDir): os.makedirs(outputSymDir)

                    dst_f = f
                    match = re.search("(_\d+.exr)", dst_f)
                    if match:
                        new_ending = match.group(1).replace('_','.')
                        dst_f = dst_f.replace(match.group(1), new_ending)

                    src = os.path.join(root, f).replace('/volume1/','/Volumes/')
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



                    # if makeLinks:
                    #     for f in sorted(files):
                    #         if f.endswith('.exr'):
                    #
                    #             dst_f = f
                    #             match = re.search("(_\d+.exr)", dst_f)
                    #             if match:
                    #                 new_ending = match.group(1).replace('_','.')
                    #                 dst_f = dst_f.replace(match.group(1), new_ending)
                    #
                    #             src = os.path.join(root, f)
                    #             dst = os.path.join(outputSymDir, dst_f)
                    #
                    #             if os.path.exists(dst):
                    #                 print "exists:", dst
                    #                 pass
                    #             else:
                    #                 print "creating:", dst
                    #                 retries = 5
                    #                 while retries:
                    #                     try:
                    #                         if retries < 5:
                    #                             print "retrying:", dst
                    #                             time.sleep(2)
                    #                         os.symlink(src, dst)
                    #                         break
                    #                     except:
                    #                         retries -= 1
                    #                         if not retries:
                    #                             print "ERROR"
                    #                             print "Could not be created:", dst
                    #                             print "SOURCE:", src
                    #                             sys.exit(1)
                    #                         continue

        # if not d.lower().startswith('exr'):
        #     print "pass:", d
        #     continue
        # else:
        #
        #     exr_dir = os.path.join(root, d)
        #     print "found:", exr_dir
        #     for r, ds, fs in os.walk(exr_dir):
        #         for n in ds:
        #             if n.lower() in finals_list:
        #                 print os.path.join(r, n)
        #             else:
        #                 ds.remove(n)



        # if d.startswith('zzz'):
        #     dirs.remove(d)
        #     continue
        #
        # if "EXRs" in root:
        #     if d.lower() in finals_list:
        #         # print os.path.join(root, d)
        #         # finals_list.remove(d.lower())
        #
        #         makeLinks = False
        #         outputSymDir = None
        #         for f in files:
        #
        #             if f.endswith('.exr'):
        #                 makeLinks = True
        #                 base_dir = root.lstrip(submissions_dir)
        #
        #                 parts = base_dir.split("/")
        #
        #                 shot_name  = re.search("^(.+)_(right|left).\d+.exr$", f).group(1)
        #                 sub_dir    = parts[0]
        #                 file_type  = "exr"
        #                 resolution = re.search("/(\d+x\d+)", base_dir).group(1)
        #                 eye        = re.search("(left|right)", f.lower()).group(1)
        #
        #                 outputSymDir = os.path.join(shots_dir, sub_dir, shot_name, file_type, eye, resolution)
        #                 if not os.path.isdir(outputSymDir): os.makedirs(outputSymDir)
        #                 break
        #
        #         if makeLinks:
        #             for f in sorted(files):
        #                 if f.endswith('.exr'):
        #
        #                     dst_f = f
        #                     match = re.search("(_\d+.exr)", dst_f)
        #                     if match:
        #                         new_ending = match.group(1).replace('_','.')
        #                         dst_f = dst_f.replace(match.group(1), new_ending)
        #
        #                     src = os.path.join(root, f)
        #                     dst = os.path.join(outputSymDir, dst_f)
        #
        #                     if os.path.exists(dst):
        #                         print "exists:", dst
        #                         pass
        #                     else:
        #                         print "creating:", dst
        #                         retries = 5
        #                         while retries:
        #                             try:
        #                                 if retries < 5:
        #                                     print "retrying:", dst
        #                                     time.sleep(2)
        #                                 os.symlink(src, dst)
        #                                 break
        #                             except:
        #                                 retries -= 1
        #                                 if not retries:
        #                                     print "ERROR"
        #                                     print "Could not be created:", dst
        #                                     print "SOURCE:", src
        #                                     sys.exit(1)
        #                                 continue
