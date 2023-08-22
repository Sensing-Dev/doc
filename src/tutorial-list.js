
import React from 'react';
import '/src/css/home.css';

// Edit here to enable/disable tutorials to show
var tutorials = {
    "display-image" : "Obtain the image data",
    "add-building-block" : "Create your own building block",
    "save-gendc" : "Save GenDC to Bin file"
}

export default function TutorialCards() {
    
    var ret = [];
    for (const [file, exp] of Object.entries(tutorials)) {
        ret.push(
            <a class="card" href={file}>{exp}</a>
        )
    }
    return ret;
  }

