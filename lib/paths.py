#!/usr/bin/env python

import os, sys, re


def get_all_files_in_subdirs(base_path):
	paths = []
	for root, dirs, files in os.walk(base_path):
		files_to_sort = []
		for f in files:
			if f.startswith('.'): continue
			files_to_sort.append(os.path.join(root,f))
		sorted_files = group_file_sequences(files_to_sort)
		if sorted_files:
			paths += sorted_files
	return paths


def group_file_sequences(files):
	'''
	Generic function to sort and group files into
	sequences starting from an input file list.
	Outputs:
	results = [
		"filename.ext",
		"filename.1001-1200#.ext",
		"filename.1004-1006,1009-1020#.ext",
	]
	'''

	pattern = r"^(.+)\.(\d+)\.(.+)$"

	groups = {}
	non_groups = []
	for f in files:
		if f.startswith('.'): continue
		match = re.match(pattern, f)
		if match:
			fname = match.group(1)
			fnum  = match.group(2)
			ext   = match.group(3)


			idx = "%s||%s" % (fname, ext)
			if idx in groups.keys():
				groups[idx].append(int(fnum))
			else:
				groups[idx] = [int(fnum)]
		else:
			non_groups.append(f)

	results = []
	for g in groups.keys():
		frames = sorted(groups[g])
		fname,ext = g.split('||')

		if len(frames) == 1:
			non_groups.append(g.replace('||',".%d." % frames[0]))
		else:
			low  = frames[0]
			high = frames[-1]

			ranges = [[]]
			group_num = 0
			for x in range(low, high+1):
				if x in frames:
					ranges[group_num].append(x)
				else:
					try:
						if len(ranges[group_num]):
							raise IndexError

					except IndexError:
						group_num += 1
						ranges.append([])

			sequence = ""
			for r in ranges:
				if sequence: sequence += ","
				sequence += "%d-%d" % (r[0], r[-1])
			sequence = "%s.%s#.%s" % (fname, sequence, ext)
			results.append(sequence)

	if non_groups:
		results = results+non_groups


	return results
