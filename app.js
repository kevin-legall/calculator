const body = document.querySelector("body");
const buttons = document.querySelectorAll(".button");
const switchButton = document.getElementById("switch");
const powerOn = document.querySelector(".power-on");
const result = document.getElementById("result");
const dot = document.querySelector(".dot");
const calcContent = document.getElementById("calcul");
const functionsContainer = document.querySelector(".functions-container");
const calcContainer = document.getElementById("calcContainer");
const screenContainer = document.getElementById("screenContainer");
const coloredLine = document.querySelector(".colored-line");
let historyContent = document.querySelectorAll(".history-element");
let historyContainer = document.getElementById("history");
let historiqueContent = "";
let screenCapacity = 0;
const capacity = 6;
let historique = [];
let lastChar = "";
let resultExposant = "";
let canDot = true;
let isSecondCalcul = false;
let base = "";
let exposant = "";
let index = 1;

// TODO : FEATURE converter
// TODO : verif entrées user
//   Division par zéro : /////////////////////////////////////////////////
// "10 / 0"
// "5 / (2 - 2)"
// "1 / 0.0"
// "1000 / 0.000"
// "3.14 / (6.28 - 6.28)"
// Syntaxe invalide : /////////////////////////////////////////////////
// "2 + 3 +"
// "4 * (6 +"
// "2 / 0)"
// "3 + - * 5"
// "(2 + 3 * 4) ) - 5"
// Fonctionnalités non prises en charge : /////////////////////////////////////////////////
// "2^3"
// "random()"
// "sin(45)"
// "pi *- 2"
// "sqrt(16)"
// Entrée invalide : /////////////////////////////////////////////////
// "2a + 3b"
// "4 /"
// "7..5"
// "1 + * 2"
// "3.14.15"
// Dépassement de capacité : /////////////////////////////////////////////////
// "99999999999999999999999999999 + 1"
// "1e10000 * 1e10000"
// "Math.pow(10, 10000)"
// "9999999999999999999999999999 * 9999999999999999999999999999"
// "-9999999999999999999999999999 / 0.00000000000000000000000000001"
// FIXME : verif entrées user avec paste clipboard
// TODO : refacto : lier les fonctions de keydown et de click button
// TODO : compteur de parenthèses (autant d'ouvertes que de fermées) pour check
// TODO : animations diverses
// TODO : gestion erreurs avec try/catch
// TODO : reload si il catch une erreur
// TODO : enlever tous les console log
// TODO : faire un MVC voir patient

/**
 * Fonction qui permet de réduire la taille de police 
 * en fonction du nombre de caractère affichés sur l'écran
*/
function minifyText() {
  if (result.textContent.length <= 3) {
    result.style.fontSize = "5rem";
  } else if (result.textContent.length > 3 && result.textContent.length < 7) {
    result.style.fontSize = "4rem";
  } else if (result.textContent.length >= 7) {
    result.style.fontSize = "3rem";
  }
}

/**
 * Fonction qui gère l'entrée des caractères à l'écran 
 * à chaque appui de bouton
*/
const handleClick = (e) => {
  e.target.addEventListener("click", handleClick);
  limit();
  if (result.textContent.length < screenCapacity) {
    result.style.color = "white";
    calcContent.innerHTML = "0";
    if (base !== "" && canDot && (lastChar >= '0' && lastChar <= '9')) {
      result.textContent += "^";
      canDot = false;
    }
    // Si l'écran est à zéro ou qu'un second calcul entre en jeu, le prochain caractère remplacera ce dernier
    if (result.textContent == "0" || isSecondCalcul) {
      result.textContent = e.target.id;
      majLastChar();
      isSecondCalcul = false;
    } else {
      // sinon il ira à la suite 
      result.textContent += e.target.id;
      majLastChar();
    }
    minifyText();
  }
};

/**
 * Fonction qui gère l'entrée des caractères à l'écran 
 * à chaque appui de touche clavier
*/
function handleKey(e) {
  key = e.key;
  console.log(e);
  limit();
  if (result.textContent.length < screenCapacity) {
    result.style.color = "white";
    calcContent.innerHTML = "0";
    if (base !== "" && canDot && (lastChar >= '0' && lastChar <= '9')) {
      result.textContent += "^";
      canDot = false;
    }
    if (key == "Backspace") {
      deleteLastChar();
      if (result.textContent == "") {
        initCalculator();
      }
    } else if (key == "Enter") {
      isSecondCalcul = true;
      majLastChar();
      minifyText();
      limit();
      result.textContent.trim();
      if (result.textContent.length >= screenCapacity) {
        calcContent.innerHTML = "0";
        result.textContent = "Ton père le chauve";
      } else if (lastChar == "+" || lastChar == "-" || lastChar == "*" || lastChar == "/" || lastChar == "." || lastChar == "^") {
        result.textContent = "Fainéant";
      } else if (result.textContent.includes("(") && !result.textContent.includes(")")) {
        result.textContent = "Salaup";
      } else if (!result.textContent.includes("+") && !result.textContent.includes("-") && !result.textContent.includes("*") && !result.textContent.includes("/") && !result.textContent.includes("^")) {
        result.textContent = "Arrière mécréant !";
      } else {
        addElement();
      }
    } else if (!/^(?:[0-9]|[-+*\/^%().])$/.test(key)) {
      result.textContent += "";
    } else if (result.textContent == "0" || isSecondCalcul) {
      result.textContent = key;
      isSecondCalcul = false;
    } else {
      result.textContent += key;
    }
    majLastChar();
    minifyText();
  }
};

window.addEventListener("keydown", (e) => handleKey(e));

buttons.forEach((button) => {
  button.addEventListener("click", handleClick);
});

/**
 * Fonction qui gère le nombre de caractère affichés. La limite étant à 15 caractères par défaut
*/
function limit() {
  buttons.forEach((button) => {
    if (result.textContent.length == screenCapacity) {
      calcContent.style.color = "red";
      calcContent.innerHTML = "Limite de caractère atteinte";
      button.removeEventListener("click", handleClick);
    } else if (result.textContent.length < screenCapacity) {
      button.addEventListener("click", handleClick);
    }
  });
}

/**
 * Fonction qui gère l'ajout d'élément sur le DOM, puis en cache
*/
function addElement() {
  let calculElement = "";
  let resultatElement = "";

  if (result.textContent !== "0") {
    // gestion des erreurs
    if (result.textContent == "Infinity") {
      result.textContent = "Abruti";
      return;
    } else if (result.textContent == "NaN") {
      result.textContent = "Idiot";
      return;
    } else if (result.textContent == "") {
      result.textContent = "0";
      return;
    }
    // Je vérifie si le calcul implique un exposant
    if (result.textContent.includes("^")) {
      const exposantRegex = /([+\-*\/])/g;
      calculElement = result.textContent;
      resultatElement = math.evaluate(result.textContent);
      calculElement = result.textContent.split(exposantRegex);
      for (let i = 0; i < calculElement.length; i++) {
        if (calculElement[i].includes("^")) {
          calculElement[i] = calculElement[i].split("^");
          let [base, exposant] = calculElement[i];
          calculElement[i] = base + fromRealNumberToSuperScript(exposant);
        }
        calcContent.innerHTML = calculElement.join("");
        result.textContent = resultatElement;
        minifyText();
      }
      calculElement = calculElement.join("")
    } else {
      // gestion des erreurs
      if (resultatElement == "Infinity") {
        result.textContent = "Enculé";
        return;
      } else if (resultatElement == "NaN") {
        result.textContent = "Petite merde";
        return;
        // Si il y a une virgule dans l'affichage du calcul, le résultat aura 2 chiffres après la virgule
      } else if (result.textContent.includes(".")) {
        calculElement = calcContent.innerHTML = result.textContent;
        resultatElement = result.textContent = eval(calculElement).toFixed(4);
      } else {
        // Sinon, une fonction de calcul "basique" sera effectuée
        calculElement = calcContent.textContent = result.textContent;
        resultatElement = result.textContent = eval(calculElement);
        if (result.textContent.includes(".")) {
          resultatElement = result.textContent = Number.parseFloat(result.textContent).toFixed(4);
        }
      }
    }
    // je supprime les zéro après la virgule qui ne servent à rien
    if (resultatElement != "0" && resultatElement.toString().includes(".")) {
      const deleteZeroRegex = /\.?0+$/;
      resultatElement = result.textContent = result.textContent.replace(deleteZeroRegex, "");
    }

    clear.addEventListener("click", () => {
      if (calculElement != "" || resultatElement != "") {
        // Gestion d'ajout de l'élément composé du calcul et du résultat en cache
        const element = { calculElement, resultatElement };
        historiqueContent = JSON.parse(localStorage.getItem("historique"));

        historique.unshift(element);
        if (historique.length > capacity) {
          historique.pop();
        }
        localStorage.setItem("historique", JSON.stringify(historique));
        calculElement = "";
        resultatElement = "";
        displayElements()
      }
    });

  } else {
    result.textContent = "Va crever";
  }
}

/**
 * Fonction qui gère l'affichage des éléments dans l'historique depuis le Local Storage
*/
function displayElements() {
  historiqueContent = "";
  minifyText();
  majLastChar();
  initResult();
  // Si le localStorage n'est pas vide, j'affiche chaque élément dans leurs emplacements prévus
  if (window.localStorage.getItem("historique") !== null) {
    historiqueContent = JSON.parse(localStorage.getItem("historique"));
    historiqueContent.forEach((element, index) => {
      let calc = document.getElementById("calc" + (index + 1));
      calc.innerHTML = textToHTML(element.calculElement);
      let res = document.getElementById("res" + (index + 1));
      res.textContent = element.resultatElement;
    });
    isSecondCalcul = true;
    canDot = false;
  } else {
    // le LocalStorage est vide
  }
}

hidden.addEventListener("click", () => {
  hidden.style.display = "none";
  calcContainer.classList.remove("showed");
  screenContainer.classList.remove("showed");
  checkMenu(calcMobile);
  scrollToBottom();
});

// fonctionnalité permettant de récupérer le dernier élément du presse papier de l'utilisateur et de le copier sur le DOM
result.addEventListener("dblclick", () => navigator.clipboard.readText().then((clipText) => result.textContent = clipText));

calcMobile.addEventListener("click", () => scrollToBottom());

zero.addEventListener("click", () => {
  if (result.textContent == "0") {
    result.textContent = "0";
  } else {
    result.textContent += "0";
    majLastChar();
  }
});

del.addEventListener("click", () => {
  const selection = window.getSelection();
  limit();
  if (selection.toString() !== "") {
    selection.deleteFromDocument();
    if (result.textContent === "") {
      initCalculator();
    }
  } else {
    if (lastChar == ".") {
      canDot = true;
    }
    console.log(canDot);
    if (lastChar == "+" || lastChar == "-" || lastChar == "*" || lastChar == "/") {
      if (result.textContent.includes(".")) {
        canDot = false;
      } else {
        canDot = true;
      }
    }
    deleteLastChar();
    if (result.textContent === "") {
      initCalculator();
    }
  }
  minifyText();
  majLastChar();
});

prct.addEventListener("click", () => {
  if (lastChar !== "/" && lastChar !== "*" && lastChar !== "-" && lastChar !== "+") {
    if (lastChar == "^") {
      deleteLastChar();
    }
    result.textContent += "/100";
  }
  minifyText();
  majLastChar();
});

div.addEventListener("click", () => {
  if (lastChar !== "/" && lastChar !== "*" && lastChar !== "-" && lastChar !== "+") {
    if (lastChar == "." || lastChar == "^") {
      deleteLastChar();
    }
    result.textContent += "/";
  }
  majLastChar();
  isSecondCalcul = false;
  canDot = true;
});
times.addEventListener("click", () => {
  if (lastChar !== "/" && lastChar !== "*" && lastChar !== "-" && lastChar !== "+") {
    if (lastChar == "." || lastChar == "^") {
      deleteLastChar();
    }
    result.textContent += "*";
  }
  majLastChar();
  isSecondCalcul = false;
  canDot = true;
});
minus.addEventListener("click", () => {
  if (lastChar !== "/" && lastChar !== "*" && lastChar !== "-" && lastChar !== "+") {
    if (lastChar == "." || lastChar == "^") {
      deleteLastChar();
    }
    result.textContent += "-";
  }
  majLastChar();
  isSecondCalcul = false;
  canDot = true;
});
plus.addEventListener("click", () => {
  if (lastChar !== "/" && lastChar !== "*" && lastChar !== "-" && lastChar !== "+") {
    if (lastChar == "." || lastChar == "^") {
      deleteLastChar();
    }
    result.textContent += "+";
  }
  majLastChar();
  isSecondCalcul = false;
  canDot = true;
});

dot.addEventListener("click", () => {
  if (canDot) {
    if (lastChar == "+" || lastChar == "-" || lastChar == "*" || lastChar == "/") {
      result.textContent += "0.";
      canDot = false;
    } else if (lastChar == "^") {
      result.textContent += "";
    } else {
      result.textContent += ".";
    }
    majLastChar();
    isSecondCalcul = false;
    canDot = false;
  }
});
pi.addEventListener("click", () => {
  if (result.textContent !== "0" && canDot) {
    if (lastChar >= '0' && lastChar <= '9') {
      result.textContent += "*" + Math.PI.toFixed(4);
      canDot = false;
    } else {
      result.textContent += Math.PI.toFixed(4);
      canDot = false;
    }
  } else {
    if (lastChar == "." && canDot) {
      deleteLastChar();
      result.textContent += "*" + Math.PI.toFixed(4);
      canDot = false;
    } else if (canDot) {
      result.textContent = Math.PI.toFixed(4);
      canDot = false;
    }
  }
  majLastChar();
  minifyText();
})
rand.addEventListener("click", () => {
  if (result.textContent !== "0" && canDot) {
    if (lastChar >= '0' && lastChar <= '9') {
      result.textContent += "*" + Math.random().toFixed(4);
      canDot = false;
    } else if (isSecondCalcul && lastChar >= '0' && lastChar <= '9') {
      result.textContent += "*" + Math.random().toFixed(4);
    } else {
      result.textContent += Math.random().toFixed(4);
      canDot = false;
    }
  } else {
    if (lastChar == ".") {
      deleteLastChar();
      result.textContent += "*" + Math.random().toFixed(4);
      canDot = false;
    } else {
      result.textContent = Math.random().toFixed(4);
      canDot = false;
    }
  }
  minifyText();
  majLastChar();
});

// revoir cette fonction 
xy.addEventListener("click", () => {
  // si le dernier caractère n'est pas un opérateur ou une virgule
  if (lastChar !== "+" && lastChar !== "-" && lastChar !== "*" && lastChar !== "/" && lastChar !== "." && lastChar !== "^") {
    result.textContent += "^";
  } else {
    result.textContent += "";
  }
  majLastChar();
})

paro.addEventListener("click", () => {
  if (result.textContent == "0") {
    result.textContent = "(";
  } else {
    result.textContent += "(";
    majLastChar();
  }
});
parc.addEventListener("click", () => {
  if (result.textContent.includes("(")) {
    result.textContent += ")";
  }
  majLastChar();
});


hist.addEventListener("click", () => {
  screenContainer.classList.add("showed");
  calcContainer.classList.add("showed");
  checkMenu(histMobile);
  if (screenContainer.classList.contains("showed")) {
    hidden.style.display = "block";
  }
  clear.addEventListener("click", () => {
    hidden.style.display = "none";
    calcContainer.classList.remove("showed");
    screenContainer.classList.remove("showed");
    checkMenu(calcMobile);
  });
  conv.addEventListener("click", () => {
    calcContainer.classList.remove("showed");
    screenContainer.classList.remove("showed");
    checkMenu(convMobile);
  });
  scrollToBottom();
});

histMobile.addEventListener("click", () => {
  screenContainer.classList.add("showed");
  calcContainer.classList.add("showed");
  checkMenu(histMobile);
  if (screenContainer.classList.contains("showed")) {
    hidden.style.display = "block";
  }
  calcMobile.addEventListener("click", () => {
    hidden.style.display = "none";
    calcContainer.classList.remove("showed");
    screenContainer.classList.remove("showed");
    checkMenu(calcMobile);
  });
  convMobile.addEventListener("click", () => {
    calcContainer.classList.remove("showed");
    screenContainer.classList.remove("showed");
    checkMenu(convMobile);
  });
  scrollToBottom();
});

// Je permet à l'utilisateur de récupérer les calculs et résultats passés
historyContent.forEach(element => {
  element.style.cursor = "pointer";
  element.addEventListener("click", (e) => {
    result.textContent = e.target.innerHTML;
    if (result.textContent.includes("sup")) {

    }
    minifyText();
    majLastChar();
    limit();
  });
});

clear.addEventListener("click", () => {
  initCalculator();
  // window.location.reload();
});

switchButton.addEventListener("change", () => {
  if (switchButton.checked) {
    localStorage.setItem("mode", "light");
    body.classList.add("light-mode");
  } else if (!switchButton.checked) {
    localStorage.setItem("mode", "dark");
    body.classList.remove("light-mode");
  }
  switchMode();
});

equal.addEventListener("click", () => {
  // FIXME : ne pas accepter juste un nombre sans opérateurs pour le stocker et/ou l'afficher
  isSecondCalcul = true;
  majLastChar();
  minifyText();
  limit();
  result.textContent.trim();
  if (result.textContent.length >= screenCapacity) {
    calcContent.innerHTML = "0";
    result.textContent = "Ton père le chauve";
  } else if (lastChar == "+" || lastChar == "-" || lastChar == "*" || lastChar == "/" || lastChar == "." || lastChar == "^") {
    result.textContent = "Fainéant";
  } else if (result.textContent.includes("(") && !result.textContent.includes(")")) {
    result.textContent = "Salaup";
  } else if (!result.textContent.includes("+") && !result.textContent.includes("-") && !result.textContent.includes("*") && !result.textContent.includes("/") && !result.textContent.includes("^")) {
    result.textContent = "Arrière mécréant !";
  } else {
    addElement();
  }
});

/**
 * Fonction qui supprime le dernier caractère à l'écran
 */
function deleteLastChar() {
  let newStringWithoutTheLastChar = result.textContent.slice(0, -1);
  result.textContent = newStringWithoutTheLastChar;
  majLastChar();
}

/**
 * Fonction qui met à jour le dernier caractère affiché à l'écran
 */
function majLastChar() {
  lastChar = result.textContent.slice(-1);
}

function checkMenu(menu) {
  scrollToBottom();
  let nav = [calcMobile, histMobile, convMobile];
  nav.forEach(menu => {
    menu.classList.remove("checked");
  });
  menu.classList.add("checked");
  switch (menu) {
    case calcMobile:
      coloredLine.style.left = "0%";
      break;
    case histMobile:
      coloredLine.style.left = "33%";
      break;
    case convMobile:
      coloredLine.style.left = "67%";
      break;

    default:
      coloredLine.style.left = "0%";
      break;
  }
}

/**
 * Fonction qui convertit un nombre simple en exposant
 */
function fromRealNumberToSuperScript(number) {
  return `<sup>${number} </sup>`;
}

/**
 * Fonction qui convertit une String en élément HTML
 */
let textToHTML = function (str) {

  let support = () => {
    if (!window.DOMParser) return false;
    let parser = new DOMParser();
    try {
      parser.parseFromString('x', 'text/html');
    } catch (err) {
      return false;
    }
    return true;
  }

  if (support) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(str, 'text/html');
    return doc.body.innerHTML;
  }
};

/**
 * Fonction qui bascule entre le mode sombre et le mode clair et l'enregistre en cache
 */
function switchMode() {
  let value = localStorage.getItem("mode");
  // Si une valeur est déja enregistré alors je la récupère
  if (localStorage.getItem("mode") !== null) {
    if (value == "light") {
      switchButton.checked = true;
      localStorage.setItem("mode", "light");
      body.classList.add("light-mode");
    } else if (value == "dark") {
      switchButton.checked = false;
      localStorage.setItem("mode", "dark");
      body.classList.remove("light-mode");
    } else {
      console.log("erreur switch mode");
    }
    // sinon je vérifie une entrée
  } else {
    switchButton.checked = false;
    value = "";
    return;
  }
}

function scrollToBottom() {
  historyContainer.scrollTop = historyContainer.scrollHeight;
}

function initScreenSize() {
  let screenWidth = window.innerWidth;
  if (screenWidth >= 769 && screenWidth <= 1366) {
    //format tablette
    screenCapacity = 30;
  } else if (screenWidth > 1366) {
    //format desktop
    screenCapacity = 50;
  } else if (screenWidth < 769) {
    //format smartphones
    screenCapacity = 15;
  }
}

/**
 * Fonction qui initialise la calculatrice et chacune de ses variables
 */
function initCalculator() {
  initScreenSize();
  scrollToBottom();
  displayElements();
  switchMode();
  limit();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/serviceWorker.js");
  }
  // Si l'historique existe déja, je le récupère 
  if (localStorage.getItem('historique')) {
    historique = JSON.parse(localStorage.getItem('historique'));
  }
  displayElements();
  calcContent.innerHTML = "0";
  result.textContent = "0";
  lastChar = "";
  isSecondCalcul = false;
  canDot = true;
  index = 1;
  baseLength = 0;
  base = "";
  exposant = "";
  resultExposant = 0;
}

/**
 * Fonction qui initialise le résultat lors de l'appui de la touche "equal"
*/
function initResult() {
  scrollToBottom();
  initScreenSize();
  lastChar = "";
  canDot = true;
  baseLength = 0;
  base = "";
  exposant = "";
  resultExposant = 0;
}

window.onload = initCalculator();