// Class used to manage the repl streamed from the spike

export default class spikeRepl {
    constructor(replID) {
        this.replEditor = ace.edit(replID);
        this.replEditor.setTheme("ace/theme/chrome");
        this.replEditor.setHighlightActiveLine(false);
        this.replEditor.setShowPrintMargin(false);
        this.replEditor.renderer.setShowGutter(false);

        // remove this once I implement sending commands via repl
        this.replEditor.setReadOnly(true);

        this.intervalID = null;
    }
    writeToRepl(msg) {
        this.replEditor.setValue(msg);
    }

    startStream() {
        console.log("stream")
        this.intervalID = setInterval(this._refresh.bind(this), 2000);
    }

    stopStream() {
        clearInterval(this.intervalID);
    }

    _refresh() {
        let messageArray = window.pyrepl.read;
        let messageString = '';
        let lastLine;
        for (const line of messageArray) {
            messageString += line;
            lastLine = line;
        };
        if (messageString) {
            this.writeToRepl(messageString);
        }
        console.log(messageArray);
        if (lastLine == ">>> \r") {
            this.stopStream();
        }
    }
}