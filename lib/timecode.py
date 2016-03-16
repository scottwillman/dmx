
def convert_tc_to_frames(tc, fps=24, remove_base_hour_1=False):
    parts = tc.split(':')
    if remove_base_hour_1 and int(parts[0]) >= 1:
        h = (int(parts[0])-1)*60*60*fps
    else:
        h = int(parts[0])*60*60*fps
    m = int(parts[1])*60*fps
    s = int(parts[2])*fps
    f = int(parts[3])
    return h+m+s+f

def convert_frames_to_tc(frames, fps=24):
    seconds = frames / fps
    minutes = seconds / 60
    hours   = minutes / 60
    f = frames % fps
    h = hours
    m = minutes - 60 * hours
    s = seconds - (m*60 + h*60*60)
    return "%02d:%02d:%02d:%02d" % (h, m, s, f)

def convert_frames_to_time(frames, fps=24):
    seconds = frames / fps
    minutes = seconds / 60
    hours   = minutes / 60
    # 05:05:32:13 05:07:26:20 00:01:54.114 NA5250

    f = str((frames % fps) / 24.0).split(".")[1]

    h = hours
    m = minutes - 60 * hours
    s = seconds - (m*60 + h*60*60)
    return "%02d:%02d:%02d.%02d" % (h, m, s, int(f))
