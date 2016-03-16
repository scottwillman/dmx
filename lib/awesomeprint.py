
def printTabularData(data, maxColWidth=0, colRightPadding=2, linePadding=False, underlineHeader=False):
    
    import textwrap
    
    splitLines = []
    for lineIndex, rawLine in enumerate(data):
        processedLines = []
        for idx, col in enumerate(rawLine):
            processedLine = []
            if col:
                col = str(col).strip()
                for subLine in col.split('\n'):
                    if maxColWidth:
                        txt = textwrap.fill(subLine, width=maxColWidth)
                        dedented_text = textwrap.dedent(txt).strip()
                        for subSubLine in dedented_text.split('\n'):
                            processedLine.append(subSubLine)
                    else:
                        processedLine.append(subLine)
                processedLines.append(processedLine)
            else:
                processedLines.append("")
        
        splitLines.append(processedLines)
    
    
    maxWidths  = []
    maxHeights = []
    for line in splitLines:
        maxHeight = 1
        for col in line:
            if len(col) > maxHeight: maxHeight = len(col)
        maxHeights.append(maxHeight)
        
        for idx, entry in enumerate(line):
            for e in entry:
                try:
                    if len(e) > maxWidths[idx]: maxWidths[idx] = len(e)
                except IndexError:
                    maxWidths.append(len(e))
    
    for idx, width in enumerate(maxWidths):
        maxWidths[idx] += colRightPadding
    
    
    for lineIndex, line in enumerate(splitLines):
        for height in range(0, maxHeights[lineIndex]):
            printLine = ""
            for colIdx, col in enumerate(line):
                try:
                    printLine += col[height]
                    printLine += " " * (maxWidths[colIdx] - len(col[height]))
                except IndexError:
                    printLine += " " * maxWidths[colIdx]
            print printLine
            
            # add underlines to header row
            if lineIndex == 0 and underlineHeader:
                printLine = ""
                for colIdx, col in enumerate(line):
                    printLine += "-" * len(col[height])
                    printLine += " " * (maxWidths[colIdx] - len(col[height]))
                print printLine
        if linePadding: print ""

