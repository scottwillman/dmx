use rvtypes;
use extra_commands;
use commands;
use gl;
use glu;


module: stereo_measurement_tool {

    class: StereoMeasurementToolMode : MinorMode
    {
        bool   _pointerStarted;
        vector float[2] _pointerStartPos;
        vector float[2] _pointerCurPos;
        
        method: StereoMeasurementToolMode(StereoMeasurementToolMode;)
        {
            init("stereo-measurement-tool-mode",
                [("pointer-1--control-shift--drag", cursorDrag, "capture"),
                 ("pointer-1--control-shift--release", cursorRelease, "release"),
                ],
                nil,
                nil
            );
            
            _pointerStarted = false;
        }
        
        method: cursorDrag(void; Event event)
        {
            if (_pointerStarted == false)
            {
                _pointerStarted = true;
                _pointerStartPos = event.pointer();
            }
            
            _pointerCurPos = event.pointer();
        }
        
        method: cursorRelease(void; Event event)
        {
            _pointerStarted  = false;
            _pointerStartPos = Point(0,0); // Not that important to do
            _pointerCurPos   = Point(0,0);
        }
        
        method: render(void; Event event)
        {
            int window_width  = event.domain().x;
            int window_height = event.domain().y;
            
            let pInfoStart = imagesAtPixel(_pointerStartPos, nil, true).front();
            let pInfoCur   = imagesAtPixel(_pointerCurPos, nil, true).front();
            
            let cursorStartX = pInfoStart.px;
            let cursorCurX   = pInfoCur.px;
            
            let difference = cursorCurX - cursorStartX;
            
            if (difference - math.floor(difference) < 0.5)
            {
                difference = math.floor(difference);
            } else {
                difference = math.floor(difference) + 0.5;
            }
            
            if (_pointerStarted) {
                displayFeedback("Separation: %gpx" % difference);
                
                glMatrixMode(GL_PROJECTION);
                glLoadIdentity();
                gluOrtho2D(0.0, window_width, 0.0, window_height);
                
                glMatrixMode(GL_MODELVIEW);
                glLoadIdentity();
                
                
                glColor(Color(1,0,0,1));
                glDisable(GL_LINE_SMOOTH);
                
                glBegin(GL_LINES);
                glVertex(_pointerStartPos.x, 0);
                glVertex(_pointerStartPos.x, window_height);
                glEnd();
                
                glBegin(GL_LINES);
                glVertex(_pointerCurPos.x, 0);
                glVertex(_pointerCurPos.x, window_height);
                glEnd();
                
                glEnable(GL_LINE_SMOOTH);
            }
        }
    }
    
    
    \: createMode(Mode;)
    {
        return StereoMeasurementToolMode();
    }
    
}