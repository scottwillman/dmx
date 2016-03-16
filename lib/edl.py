import re

def parse_file32_edl(path):
    f = open(path,'rbU')

    lines = f.readlines()
    pattern = re.compile("(^\d{1,8})")

    events = []
    in_effect_event = False
    for idx, line in enumerate(lines):
        line = line.strip()

        if re.search(pattern, line):
            if line.startswith('BL'): continue

            event = {}
            event["event_name"]  = line[0:7].strip()
            event["source_name"] = line[8:40].strip()
            event["event_types"] = list(line[41:55].replace(" ",""))

            event["source_in"]      = line[56:67].strip()
            event["source_out"]     = line[68:79].strip()
            event["rec_in"]         = line[80:91].strip()
            event["rec_out"]        = line[92:103].strip()
            event["effects"]        = []
            event["from_clip_name"] = ""

            in_event = True
            while in_event:
                idx += 1
                try:
                    new_line = lines[idx].strip()
                    if re.search(pattern, lines[idx]):
                        if new_line[0:7].strip() == event["event_name"]:
                            in_effect_event = True
                            if "D" in list(new_line[41:55].replace(" ","")): # Dissolve!
                                # print 'Dissolve in event: %s' % event["event_name"]
                                pass
                            break
                        else:
                            in_event = False
                            in_effect_event = False
                    elif re.search(r"^>>>", new_line) and not in_effect_event:
                        pass
                    elif re.search(r"^\*", new_line) and not in_effect_event:
                        if new_line.startswith("*FROM CLIP NAME"):
                            parts = new_line.partition(":")
                            event['from_clip_name'] = parts[2].strip()
                    elif re.search(r"^[\d\w\s]", new_line):
                        event['effects'].append(re.sub(r"\s+", " ", new_line).split(" "))
                    else:
                        pass
                except IndexError:
                    in_event = False

            if not in_effect_event:
                events.append(event)

    return events
