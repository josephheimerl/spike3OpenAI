import spikeRepl from "./spikeRepl.js";
import { spike3Docs } from "./messages.js"
import loginButton from "./loginButton.js";

const textArea = document.querySelector("#promptBox");

textArea.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
});

const replWindow = new spikeRepl("replWindow");
const loginWidget = new loginButton("sign-in");

var aceEditor = ace.edit("aceEditor");
aceEditor.setTheme("ace/theme/chrome");
aceEditor.session.setMode("ace/mode/python");

// button event listener assignment
document.querySelector("#toggleModules").addEventListener("click",toggleModules);
document.querySelector("#submitPrompt").addEventListener("click",sendCommandToGPT);
document.querySelector("#runCode").addEventListener("click",runCode);
document.querySelector("#clearCode").addEventListener("click",clearCode);
document.querySelector("#refreshREPL").addEventListener("click",replWindow._refresh.bind(replWindow));
document.querySelector("#ctrlC").addEventListener("click",abortCode);

document.addEventListener('DOMContentLoaded', (event) => {
  const savedUserCode = localStorage.getItem('userCode');
  const savedAssumptions = localStorage.getItem('savedAssumptions');
  aceEditor.setValue(savedUserCode);
  document.querySelector("#assumptionsBox").innerText = savedAssumptions;
})


aceEditor.session.on('change', function() {
  localStorage.setItem('userCode', aceEditor.getValue())
})



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
  };
}

function compileMessages (prompt) {
  let messages = spike3Docs.defaultMessages.slice();
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

  return messages;
}

async function sendCommandToGPT() {
  if (!loginWidget.isLoggedIn) {
    alert("Please log in by clicking the user icon in the top right corner to submit prompts.");
    return;
  }

  showLoad();

  const prompt = document.querySelector("#promptBox").value;

  let messages = compileMessages(prompt)
  
  console.log(messages);

  fetch("https://gpt4chatcompletion-texhgputha-uc.a.run.app", {
      method: "POST",
      body: JSON.stringify({
        messages: messages,
        temperature: 0,
        token: await loginWidget.userIDToken()
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      displayCode(res.response);
      hideLoad();
    })
    .catch((error) => {
      console.log(error)
      hideLoad();
    })
  
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
  aceEditor.setReadOnly(true);
}

// Hides loading icon when execution has stopped
function hideLoad() {
  document.querySelector("#submitPrompt").disabled = false;
  aceEditor.setReadOnly(false);
}

function abortCode() {
  window.pyrepl.write = "motor.stop()"
  window.pyrepl.stop
}