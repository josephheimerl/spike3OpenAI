// Class used to manage the repl streamed from the spike

export default class spikeRepl {
    constructor(replID) {
        this.replDiv = document.getElementById(replID);
        this.replDiv.innerHTML = this.replHTML;

        this.ctrlCButton = this.replDiv.querySelector("#ctrlC");
        this.clearReplButton = this.replDiv.querySelector("#clear-repl");
        this.scrollWithGenButton = this.replDiv.querySelector("#scroll-with-gen");
        this.inputField = this.replDiv.querySelector("#repl-input");

        this.prevInputs = [''];
        this.currInputIndex = 0;

        this.ctrlCButton.addEventListener("click",this.abortCode);
        this.clearReplButton.addEventListener("click",this.clearCode.bind(this));
        this.scrollWithGenButton.addEventListener("click",this.scrollWithGenToggle.bind(this));
        this.inputField.addEventListener("keydown",this.inputBoxCallback.bind(this));

        this.replEditor = ace.edit("replWindow");
        this.replEditor.setTheme("ace/theme/chrome");
        this.replEditor.setHighlightActiveLine(false);
        this.replEditor.setShowPrintMargin(false);
        this.replEditor.renderer.setShowGutter(false);

        // remove this once I implement sending commands via repl
        this.replEditor.setReadOnly(true);

        this.scrollWithGeneration = true;

        this.logString = '';
        window.pyrepl.consoleStream = this.#newDataCallback.bind(this);
        
    }
    writeToRepl(msg) {
        this.replEditor.setValue(msg);
        // prevent highlighting
        this.replEditor.clearSelection();
    }

    abortCode() {
        window.pyrepl.rawWrite = "\x03\r\n";
        window.pyrepl.write = `import motor\nmotor.stop()`;
    }

    clearCode() {
        this.logString = '';
        this.writeToRepl(this.logString);
    }

    inputBoxCallback(event) {
        if (event.key == "Enter") {
            window.pyrepl.rawWrite = `${this.inputField.value}\r\n`;
            this.prevInputs[this.prevInputs.length -1] = this.inputField.value;
            this.prevInputs.push('');
            this.currInputIndex = this.prevInputs.length -1;
            this.inputField.value = '';

        } else if (event.key == "ArrowUp") {
            this.incrementInputHistory(-1);
        } else if (event.key == "ArrowDown") {
            this.incrementInputHistory(1);
        }
    }

    incrementInputHistory(val) {
        this.currInputIndex += val;
        if (this.currInputIndex < 0) {
            this.currInputIndex = 0;
        } else if (this.currInputIndex > this.prevInputs.length - 1) {
            this.currInputIndex = this.prevInputs.length - 1;
        }
        this.inputField.value = this.prevInputs[this.currInputIndex];
    }


    scrollWithGenToggle() {
        if (this.scrollWithGeneration) {
            this.scrollWithGeneration = false;
            this.scrollWithGenButton.classList.remove("selected")
        } else {
            this.scrollWithGeneration = true;
            this.scrollWithGenButton.classList.add("selected")
        }
    }

    #newDataCallback(data) {
        this.logString += data;
        if(this.logString) {
            this.writeToRepl(this.logString);
        }
        if(this.scrollWithGeneration) {
            this.replEditor.renderer.scrollToLine(this.replEditor.getSession().getLength());
        }
    }

    replHTML = `
    <div id="replContainer">
      <pre id="replWindow">Connect SPIKE to view REPL</pre>
    </div>
    <input type="text" id="repl-input" placeholder="Input to REPL">
    <button id="ctrlC" class="generic button">ctrlC (Abort)</button>
    <button id="clear-repl" class="generic button">Clear REPL</button>
    <button id="scroll-with-gen" class="generic button selected">Scroll With Generation</button>
    `
}