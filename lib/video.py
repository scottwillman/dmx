import os, subprocess, json


def dump_to_frames(source):
    tempdir = "/tmp/imgseq_dump/"
    os.makedirs(tempdir)
    output_path = "%s/temp.%%06d.jpg" % tempdir
    # make output path
    print "FFMpeg extracting frames..."
    result = subprocess.check_output('ffmpeg -loglevel panic -i "%s" "%s"' % (source, output_path), shell=True)
    return tempdir


def grab_frame_from_imgseq(frame, dir_path, token=None):
    # if token:
    #     output = "%s/%s_%s.jpg" % (os.getcwd(), name, token)
    # else:
    #     output = "%s/%s.jpg" % (os.getcwd(), name)

    for file in os.listdir(dir_path):
        if ("%06d" % frame) in file:
            return os.path.join(dir_path, file)

    # directory = os.path.join(os.getcwd(), "temp")
    # filename  = "temp.%06d.jpg" % frame
    # path = os.path.join(directory, filename)
    # print path, output
    # try:
    #     shutil.copy2(path, output)
    #     return True
    # except IOError:
    #     return False


def getFormat(source):
    cmd = 'ffprobe -v quiet -print_format json -show_format "%s"' % source

    result = subprocess.check_output(cmd, stderr=subprocess.STDOUT, shell=True)
    json_result = json.loads(result)
    return json_result['format']['tags']


def extract_frame(source, time, name, token=None):
    if token:
        output = "%s_%s.jpg" % (name, token)
    else:
        output = "tmp/%s.jpg" % (name)

    cmd = 'ffmpeg -ss %s -i "%s" -vframes 1 -an -f mjpeg "%s"' % (time, source, output)
    # print cmd
    os.system(cmd)
