#!/usr/bin/env python

import os, sys, re


source_edl = sys.argv[1]


output_dir = os.path.dirname(source_edl)
output_file_left  = os.path.basename(source_edl).replace('.edl', '_left.edl')
output_file_right = os.path.basename(source_edl).replace('.edl', '_right.edl')

output_path_left = os.path.join(output_dir, output_file_left)
output_path_right = os.path.join(output_dir, output_file_right)


TC_REGEX = r'(.+ )0[1-8](:0[0-1]:\d{2}:\d{2} )0[1-8](:0[0-1]:\d{2}:\d{2} \d{2}:\d{2}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}:\d{2})'

with open(output_path_left, 'wb') as fout_left:
    with open(output_path_right, 'wb') as fout_right:
        with open(source_edl, 'rbU') as fin:
            for line in fin:
                output_line = None

                tc_match = re.search(TC_REGEX, line)
                if tc_match:
                    output_line = re.sub(TC_REGEX, r'\g<1>00\g<2>00\g<3>', line)

                token = '.MOV.S3D'
                if token in line:
                    if output_line:
                        output_line = output_line.replace(token, '')
                    else:
                        output_line = line.replace(token, '')

                if not output_line:
                    output_line = line

                fout_left.write(output_line)

                if 'LEFT' in output_line:
                    output_line = output_line.replace('LEFT','RIGHT')

                fout_right.write(output_line)
