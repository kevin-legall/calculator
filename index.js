const buttons = document.querySelectorAll(".btn.number");
const result = document.getElementById("result");

buttons.forEach((button) => {
  button.addEventListener("click", (e) => {
    result.textContent += e.target.id;
  });
});

// if (result.textContent === '') {
//   result.style.marginTop = '211px'
// } else {
//   result.style.marginTop = '7px'
//   console.log('coucou');
// }

equal.addEventListener("click", () => {
  result.textContent = eval(result.textContent);
});

zero.addEventListener("click", () => {
  result.textContent += "0";
});
plusminus.addEventListener("click", () => {
  result.textContent = "-";
});
prct.addEventListener("click", () => {
  result.textContent += "/100";
});
div.addEventListener("click", () => {
  result.textContent += "/";
});
times.addEventListener("click", () => {
  result.textContent += "*";
});
minus.addEventListener("click", () => {
  result.textContent += "-";
});
plus.addEventListener("click", () => {
  result.textContent += "+";
});

clear.addEventListener("click", () => {
  result.textContent = "";
});
