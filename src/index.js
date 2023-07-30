import spikeRepl from "./spikeRepl.js";
import { spike3Docs } from "./messages.js"
import loginButton from "./loginButton.js";

const textArea = document.querySelector("#promptBox");

textArea.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
});

const replWindow = new spikeRepl("repl");
const loginWidget = new loginButton("sign-in");

let aceEditor = ace.edit("aceEditor");
aceEditor.setTheme("ace/theme/chrome");
aceEditor.session.setMode("ace/mode/python");

// button event listener assignment
document.querySelector("#toggleModules").addEventListener("click",toggleModules);
document.querySelector("#submitPrompt").addEventListener("click",sendCommandToGPT);
document.querySelector("#runCode").addEventListener("click",runCode);
document.querySelector("#clearCode").addEventListener("click",clearCode);
document.querySelector("#explainCode").addEventListener("click",explainSelection);
document.querySelector("#improveCode").addEventListener("click",improveSelection);

document.addEventListener('DOMContentLoaded', (event) => {
  const savedUserCode = localStorage.getItem('userCode');
  const savedAssumptions = localStorage.getItem('savedAssumptions');
  aceEditor.setValue(savedUserCode);
  document.querySelector("#assumptionsBox").innerText = savedAssumptions;
})


aceEditor.session.on('change', function() {
  localStorage.setItem('userCode', aceEditor.getValue())
})

const toggleables = document.querySelectorAll(".toggleable");
toggleables.forEach(element => {
  element.querySelector(".toggleable-head").addEventListener('click', event => {
    element.querySelector(".toggleable-body").classList.toggle("hidden")
    element.querySelector(".caret").classList.toggle("open")
  })
});



window.onclick = function(e) {
  if (!e.target.closest(".dropdown-menu") && !e.target.closest("#toggleModules")) {
    const dropdown = document.querySelector("#moduleDropdownMenu").querySelector(".dropdown-menu")
    if (getComputedStyle(dropdown).visibility == "visible") {
      toggleModules();
    };
  };
};

function toggleModules() {
  const dropdown = document.querySelector("#moduleDropdownMenu")
  const menu = dropdown.querySelector(".dropdown-menu")
  const caret = dropdown.querySelector(".caret")
  menu.classList.toggle("open")
  caret.classList.toggle("open")
}

function clearCode() {
  if(window.confirm("Are you sure you want to clear the code? This cannot be undone.")) {
    aceEditor.setValue("");
    document.querySelector("#assumptionsBox").innerText = "";
    localStorage.setItem('userCode', aceEditor.getValue())
    localStorage.setItem('savedAssumptions', document.querySelector("#assumptionsBox").innerText)
  };
}

function compileMessages (messages) {
  // check each checkbox and concatenate appropriate messages
  
  if (document.querySelector("#hubCheckbox").checked) {
    messages.push(...spike3Docs.hubDoc);
  };
  if (document.querySelector("#portCheckbox").checked) {
    messages.push(...spike3Docs.portDoc);
  };
  if (document.querySelector("#motionSensorCheckbox").checked) {
    messages.push(...spike3Docs.motionSensorDoc);
  };
  if (document.querySelector("#soundCheckbox").checked) {
    messages.push(...spike3Docs.soundDoc);
  };
  if (document.querySelector("#buttonCheckbox").checked) {
    messages.push(...spike3Docs.buttonDoc);
  };
  
  if (document.querySelector("#motorCheckbox").checked) {
    messages.push(...spike3Docs.motorDoc);
  };
  if (document.querySelector("#distanceSensorCheckbox").checked) {
    messages.push(...spike3Docs.distanceSensorDoc);
  };

  if (document.querySelector("#forceSensorCheckbox").checked) {
    messages.push(...spike3Docs.forceSensorDoc);
  };
  if (document.querySelector("#colorSensorCheckbox").checked) {
    messages.push(...spike3Docs.colorSensorDoc);
  };
  if (document.querySelector("#runloopCheckbox").checked) {
    messages.push(...spike3Docs.runloopDoc);
  };
}

async function fetchAI(messages) {
  return fetch("https://gpt4chatcompletion-texhgputha-uc.a.run.app", {
      method: "POST",
      body: JSON.stringify({
        messages: messages,
        temperature: 0,
        token: await loginWidget.userIDToken(),
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })
    .then((res) => res.json())
}

async function sendCommandToGPT() {
  if (!loginWidget.isLoggedIn) {
    alert("Please log in by clicking the user icon in the top right corner to submit prompts.");
    return;
  }

  showLoad();
  aceEditor.setReadOnly(true)

  let messages = spike3Docs.defaultMessages.slice();
  const prompt = document.querySelector("#promptBox").value;
  compileMessages(messages);
  // Add code to prompt if there is code in the box
  const code = aceEditor.getValue();
  if (code) {
    messages.push({role: "system", content: `Edit and/or add and/or replace the following code to get the robot to do what the user wants:
\`\`\`python
${code}
\`\`\`
If the code contains functions that are not supported by the new SPIKE 3, replace them. If a module/function is not described in previous messages and is not supported on virtually every version of micropython, it is not supported.`})
  }
  messages.push({role: "user", content: prompt});

  
  console.log(messages);

  const fetchPromise = fetchAI(messages)
    .then((res) => {
      console.log(res);
      displayCode(res.response);
      hideLoad();
      aceEditor.setReadOnly(false)
    })
    .catch((error) => {
      console.log(error)
      hideLoad();
      aceEditor.setReadOnly(false)
    })
  
  splashElement("code-block", fetchPromise)
}

async function explainSelection() {
  const selection = aceEditor.session.getTextRange(aceEditor.getSelectionRange())
  const selectionRange = [aceEditor.getSelectionRange().start.row+1, aceEditor.getSelectionRange().end.row+1]
  if (!selection) {
    alert("please make a selection to use this feature")
    return
  }
  const lineString = selectionRange[0]==selectionRange[1] ? `(on line ${selectionRange[0]})`: `(on lines ${selectionRange[0]} to ${selectionRange[1]})`

  let messages = spike3Docs.explanationContext.slice();
  compileMessages(messages);
  const code = aceEditor.getValue();
  if (code) {
    messages.push({role: "system", content: `Here is the code you need to explain a part of:
\`\`\`python
${code}
\`\`\``})
  }
  messages.push({role: "user", content: `explain this section of the code to me in detail ${lineString}: \`\`\`python\n${selection}\n\`\`\``});

  console.log(messages)

  showLoad()
  const fetchPromise = fetchAI(messages)
    .then((res) => {
      hideLoad()
      console.log(res);
      console.log(res.response);
      displayResponse(res.response);
    })
    .catch((error) => {
      hideLoad()
      console.log(error)
    })
  splashElement("responseBox-container", fetchPromise)
}

async function improveSelection() {

  const selection = aceEditor.session.getTextRange(aceEditor.getSelectionRange())
  const selectionRange = [aceEditor.getSelectionRange().start.row+1, aceEditor.getSelectionRange().end.row+1]
  if (!selection) {
    alert("please make a selection to use this feature")
    return
  }
  const lineString = selectionRange[0]==selectionRange[1] ? `(on line ${selectionRange[0]})`: `(on lines ${selectionRange[0]} to ${selectionRange[1]})`

  let messages = spike3Docs.improvementContext.slice();
  compileMessages(messages);
  const code = aceEditor.getValue();
  if (code) {
    messages.push({role: "system", content: `Here is the code you will need to improve a part of:
\`\`\`python
${code}
\`\`\``})
  }
  messages.push({role: "user", content: `Is there a better way to write this section of my code? ${lineString}: \`\`\`python\n${selection}\n\`\`\``});

  console.log(messages)
  showLoad()
  const fetchPromise = fetchAI(messages)
    .then((res) => {
      hideLoad()
      console.log(res);
      console.log(res.response);;
      displayResponse(res.response);
    })
    .catch((error) => {
      hideLoad()
      console.log(error)
    })
  splashElement("responseBox-container", fetchPromise)
}

let displayEditors = [];
function displayResponse(res) {
  //response element
  const responseBox = document.querySelector("#responseBox");

  console.log("start")
  const parsedArray = res.match(/```python|```|(?<=^|```python|```)[\s\S]*?(?=$|```python|```)/g);
  //destroy old editors
  displayEditors.forEach((editor) => {
    editor.destroy()
    editor.container.remove()
  });

  //empty editor list and innerhtml
  displayEditors = [];
  responseBox.innerHTML = '';

  //iterate through response array
  let numEditors = 0;
  let codeMode = false;
  parsedArray.forEach((string) => {
    string = string.trim();
    if (string == "```python") {
        codeMode = true;
      } else if (string == "```") {
        codeMode = false;
      } else if (codeMode) {
        //make container element
        const newCodeBlock = document.createElement("div");
        newCodeBlock.className = "responseBox-code";
        newCodeBlock.id = `responseBox-code${numEditors}`;
        responseBox.appendChild(newCodeBlock);
        numEditors+=1;

        //insert and configure new ace editor
        let newEditor = ace.edit(newCodeBlock.id)
        newEditor.setTheme("ace/theme/chrome");
        newEditor.session.setMode("ace/mode/python");
        newEditor.setReadOnly(true);

        //push editor onto list
        displayEditors.push(newEditor);

        //place code in editor
        newEditor.setValue(string)

        //adjust height of editor after render
        setTimeout(() => {
          const lineHeight = newEditor.renderer.lineHeight;
          let newHeight = lineHeight * newEditor.session.getLength();
          newHeight = newHeight == 0 ? 100 : newHeight;
          newEditor.container.style.height = newHeight.toString() + "px";
          newEditor.resize()
        }, 0);

      } else if (!codeMode) {
        //append plain text
        const newText = document.createTextNode(string);
        responseBox.appendChild(newText);
      }
  });
  console.log("stop");
}

// Takes in a response, extracts code and displays it
// Returns extracted code
function displayCode(res) {
  const code = res.match(/```python\n([\s\S]*)\n```/);
  console.log(`\nGPT response:\n${res}\n\n`);
  if (code) {
    aceEditor.setValue(code[1]);
  } else {
    console.log("code not located");
  };
  

  const assumptions = res.match(/<Assumptions>\n([\s\S]*)\n<\/Assumptions>/s);

  if (assumptions) {
    document.querySelector("#assumptionsBox").innerText = assumptions[1]
    localStorage.setItem("savedAssumptions", assumptions[1])
  } else {
    document.querySelector("#assumptionsBox").innerText = "No assumptions given"
  };
}

function runCode() {
  if (!(window.pyrepl && window.pyrepl.isActive)) {
    alert("SPIKE not connected, connect and try again");
    return;
  }
  // replWindow.startStream()
  const code = aceEditor.getValue();
  console.log(`sending code:\n${code}`);
  window.pyrepl.write = code;
}

// Shows a loading icon and disables the submit prompt button
function showLoad() {
  document.querySelector("#submitPrompt").disabled = true;
  document.querySelector("#explainCode").disabled = true;
  document.querySelector("#improveCode").disabled = true;;
}

// Hides loading icon when execution has stopped
function hideLoad() {
  document.querySelector("#submitPrompt").disabled = false;
  document.querySelector("#explainCode").disabled = false;
  document.querySelector("#improveCode").disabled = false;
}

// Throws loading spash element over specified element. Requires a promise
// to be passed which will indicate when the splash should be removed
async function splashElement(elementID, endPromise) {
  const parentElement = document.getElementById(elementID);
  const splash = document.createElement("div");
  splash.className = "splashElement";
  parentElement.appendChild(splash);
  
  const loadText = document.createTextNode("Loading ");
  splash.appendChild(loadText);

  const loadingSpinner = document.createElement("div");
  loadingSpinner.className = "splashElement-loader";
  splash.appendChild(loadingSpinner);

  await endPromise;
  
  for (let elem of [loadingSpinner, loadText, splash]) {
    elem.remove();
  }
}