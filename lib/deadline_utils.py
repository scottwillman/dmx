import os, sys


def getRenderChunkSize(in_frame, out_frame, cores_available=16):
    import math

    dur = out_frame - in_frame + 1
    chunks = math.ceil(dur/float(cores_available))
    return int(chunks)


def deadline_buildJobInfoFile(frame_start, frame_end, job_name, chunk_size, job_files_dir, priority=90):
    data = [
        "Plugin=Nuke",
        "Frames=%s-%s" % (frame_start, frame_end),
        "Name=%s" % job_name,
        "ChunkSize=%s" % chunk_size,
        "Priority=%s" % priority,
        "ConcurrentTasks=4",
    ]

    filename = "job_info_%s.job" % job_name
    file_path = os.path.join(job_files_dir, filename)
    with open(file_path, 'w') as f:
        for line in data:
            f.write(line + '\n')
    return file_path


def deadline_buildPluginInfoFile(file_to_render, job_name, job_files_dir, write_node=None):
    data = [
        "SceneFile=%s" % file_to_render,
        "Version=8.0",
        "NukeX=False",
        "BatchMode=True",
        # "IsMovieRender=True"
    ]
    if write_node:
        data.append("WriteNode=%s"% write_node)

    filename = "plugin_info_%s.job" % job_name
    file_path = os.path.join(job_files_dir, filename)
    with open(file_path, 'w') as f:
        for line in data:
            f.write(line + '\n')
    return file_path


## USAGE EXAMPLE ##
# chunk_size = deadline_utils.getRenderChunkSize(in_frame, out_frame)
#
# job_name = "auto_comp_%s_v%03d.nk" % (shot_name, next_version)
#
# job_info_file_path = deadline_utils.deadline_buildJobInfoFile(in_frame, out_frame, job_name, chunk_size, job_files_dir, priority=90)
# plugin_info_file_path = deadline_utils.deadline_buildPluginInfoFile(out_script_path, job_name, job_files_dir)
#
# cmd = '/Applications/Thinkbox/Deadline6/DeadlineCommand.app/Contents/MacOS/DeadlineCommand %s %s' % (job_info_file_path, plugin_info_file_path)
# print "Launching to Queue: %s" % cmd
# os.system(cmd)
##
