// login button object for setting up firebase authentication
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, signInWithPopup, createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { firebaseConfig } from "./secrets.js"

export default class loginButton {
    constructor(buttonID) {
        this.buttonDiv = document.getElementById(buttonID);
        
        // possibly implement dropdown in future
        // this.dropdown = null;
        
        this.image = null;

        this.loginStatus = false;
        this.user = null;
        this.#initialRender();


        this.firebaseApp = initializeApp(firebaseConfig);
        this.auth = getAuth(this.firebaseApp);
        this.provider = new GoogleAuthProvider();
        this.provider.setCustomParameters({
          'prompt': 'select_account'
        })
        this.buttonDiv.addEventListener("click", (event) => {
          if (!this.user) {
            signInWithPopup(this.auth, this.provider).then((result) => {
              // This gives you a Google Access Token. You can use it to access the Google API.
              const credential = GoogleAuthProvider.credentialFromResult(result);
              const token = credential.accessToken;
              // The signed-in user info.
              const user = result.user;
              console.log("logged in")
              // IdP data available using getAdditionalUserInfo(result)
              // ...
      
            }).catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;
              // The email of the user's account used.
              // The AuthCredential type that was used.
              const credential = error.credential;
              console.log("error loggin in")
              console.log(error)
              console.log(errorCode)
              console.log(errorMessage)
              console.log(credential)
              // ...
            })
          } else {
            this.auth.signOut().then(this.#renderButton()).catch((error)=>console.log(error));
          }
          
        })

        onAuthStateChanged(this.auth, (user => {
            if (user) {
                console.log("user");
                console.log(user);
                const uid = user.uid;
                this.user = user;
                this.loginStatus = true;
              } else {
                this.user = null;
                this.loginStatus = false;
              }
            this.#renderButton()
        }))

    }

    get isLoggedIn() {
      return this.loginStatus
    }

    async userIDToken() {
      if(this.user && this.user.getIdToken) {
        const id = await this.user.getIdToken(true);
        return id;
      } else {
        return "";
      }
    }

    #initialRender() {
        this.buttonDiv.innerHTML = `
        <img
            src="./images/noUser.jpeg"
            alt="cannot be displayed"
            class="profile-pic"
        />`;
        //<div class="login-dropdown"></div>;
        this.image = this.buttonDiv.querySelector(".profile-pic");
        // this.dropdown = this.buttonDiv.querySelector(".login-dropdown");
        this.#renderButton();
    }
    #renderButton() {
        if (this.isLoggedIn) {
            this.image.src = this.user.photoURL;
            this.buttonDiv.setAttribute("data-hover",`Signed in as ${this.user.displayName}`);
            // this.dropdown.innerHTML = this.#dropdownHTML.loggedIn
            
          } else {
            this.image.src = "./images/noUser.jpeg";
            this.buttonDiv.setAttribute("data-hover","Sign in");
            // this.dropdown.innerHTML = this.#dropdownHTML.loggedOut
          }
    }

    // #dropdownHTML = {
    //     loggedIn: `
    //     `,
    //     loggedOut: `
    //     `
    // }
}