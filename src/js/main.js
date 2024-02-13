const initApp = () => {
  /**
   * This script handles the calculation of the number of cycles and loop values.
   */

  /**
   * Handles the calculation of the number of cycles.
   */
  const $freq = document.querySelector("#freq");
  const $freq_div = document.querySelector("#freq_div");
  const $delay = document.querySelector("#delay");
  const $time_div = document.querySelector("#time_div");

  /**
   * Calculates the number of cycles based on the frequency and delay time.
   */
  function calculateNumeroCicli() {
    let periodo = 0;
    if ($freq.value !== "") {
      periodo = 1 / ($freq.value * Math.pow(10, $freq_div.value));
    }
    let ciclo_istruzione = periodo * 4;
    let numero_cicli = ($delay.value * Math.pow(10, $time_div.value)) / ciclo_istruzione;
    numero_cicli = Math.round(numero_cicli).toFixed(1);

    document.querySelector(".js-resultNumeroCicli-periodo").innerHTML = convertNumberWithMultiplesSubmultiples(periodo);
    document.querySelector(".js-resultNumeroCicli-CI").innerHTML = convertNumberWithMultiplesSubmultiples(ciclo_istruzione);
    document.querySelector(".js-resultNumeroCicli-cicli").innerHTML = numero_cicli;
  }

  /**
   * Converts a number to its multiple or submultiple representation.
   * @param {number} number - The number to convert.
   * @returns {string} The converted number.
   */
  function convertNumberWithMultiplesSubmultiples(number) {
    let multiplesSubmultiples = {
      0: " ",
      3: "K",
      6: "M",
      9: "G",
      12: "T",
      15: "P",
      18: "E",
      21: "Z",
      24: "Y",
      '-3': "m",
      '-6': "u",
      '-9': "n",
      '-12': "p",
      '-15': "f",
      '-18': "a",
      '-21': "z",
      '-24': "y",
    };
    // check which multiple or submultiple to use
    let multipleSubmultiple;
    if (number >= 1) {
      multipleSubmultiple = Math.floor(Math.log10(number) / 3) * 3;
    } else {
      multipleSubmultiple = Math.ceil(Math.log10(number) / 3) * 3;
    }
    // return value with multiple or submultiple
    return number * Math.pow(10, -multipleSubmultiple) + multiplesSubmultiples[multipleSubmultiple];
  }

  // Event listeners for the calculation of the number of cycles
  $freq.addEventListener("keyup", calculateNumeroCicli);
  $freq_div.addEventListener("change", calculateNumeroCicli);
  $delay.addEventListener("keyup", calculateNumeroCicli);
  $time_div.addEventListener("change", calculateNumeroCicli);


  /**
   * Handles the calculation of loop values.
   */
  const $formLoop = document.querySelector(".js-form-loop");
  const $resultCicliMancanti = document.querySelector("#resultCicliMancanti");
  const $resultAssembly = document.querySelector("#resultAssembly");

  let cicli = [];
  cicli[0] = new Ciclo(0, 0);
  // inject first row
  addRow();

  /**
   * Adds a new row to the form for loop calculation.
   */
  function addRow() {
    const loopNumber = document.querySelectorAll(".js-form-loop .row").length + 1;

    let $divRowEl = document.createElement("div");
    $divRowEl.classList.add("row");

    let $divColEl1 = document.createElement("div");
    $divColEl1.classList.add("col");
    $divRowEl.appendChild($divColEl1);

    let $divColEl2 = document.createElement("div");
    $divColEl2.classList.add("col");
    $divRowEl.appendChild($divColEl2);

    let $divColEl3 = document.createElement("div");
    $divColEl3.classList.add("col");
    $divRowEl.appendChild($divColEl3);

    let $pLoopNumberEl = document.createElement("p");
    $pLoopNumberEl.innerHTML = "Loop " + loopNumber + ":";
    $divColEl1.appendChild($pLoopNumberEl);

    let $labelCicliEl = document.createElement("label");
    $labelCicliEl.for = "cicli";
    $labelCicliEl.innerHTML = "Cicli";
    $divColEl2.appendChild($labelCicliEl);

    let $inputCicliEl = document.createElement("input");
    $inputCicliEl.type = "number";
    $inputCicliEl.classList.add("form-control", "cicli");
    $inputCicliEl.placeholder = "Cicli";
    // min value 0 and max value 255
    $inputCicliEl.min = "0";
    $inputCicliEl.max = "255";
    $divColEl2.appendChild($inputCicliEl);

    let $labelNopEl = document.createElement("label");
    $labelNopEl.for = "nop";
    $labelNopEl.innerHTML = "Nop";
    $divColEl2.appendChild($labelNopEl);

    let $inputNopEl = document.createElement("input");
    $inputNopEl.type = "number";
    $inputNopEl.classList.add("form-control", "nop");
    $inputNopEl.placeholder = "Nop";
    $divColEl2.appendChild($inputNopEl);

    let $btnAddLoopEl = document.createElement("button");
    $btnAddLoopEl.classList.add("btn", "btn-primary", "btn-sm", "js-add-loop");
    $btnAddLoopEl.innerHTML = "Aggiungi ciclo";
    $divColEl3.appendChild($btnAddLoopEl);

    let $btnRemoveLoopEl = document.createElement("button");
    $btnRemoveLoopEl.classList.add("btn", "btn-danger", "btn-sm", "js-remove-loop");
    $btnRemoveLoopEl.innerHTML = "Rimuovi ciclo";
    // disabled remove button on first row
    if (loopNumber === 1) {
      $btnRemoveLoopEl.disabled = true;
    }
    $divColEl3.appendChild($btnRemoveLoopEl);

    $formLoop.appendChild($divRowEl);

    $inputCicliEl.addEventListener("keyup", () => updateLoopResult());
    $inputNopEl.addEventListener("keyup", () => updateLoopResult());

    $btnAddLoopEl.addEventListener("click", addRow);
    $btnRemoveLoopEl.addEventListener("click", () => removeRow($divRowEl));
  }

  /**
   * Removes a row from the form for loop calculation.
   * @param {HTMLElement} $divRowEl - The row element to remove.
   */
  function removeRow($divRowEl) {
    $divRowEl.remove();
    // update loop number on all rows
    const $rows = document.querySelectorAll(".js-form-loop .row");
    $rows.forEach(($row, index) => {
      $row.querySelector("p").innerHTML = "Loop " + (index + 1) + ":";
    });
  }

  /**
   * Calculates the loop values based on the number of cycles and additional NOPs.
   * @param {number} loopNumber - The loop number.
   * @param {HTMLElement} $cicli - The input element for the number of cycles.
   * @param {HTMLElement} $nop - The input element for the number of additional NOPs.
   */
  function calculateLoop(loopNumber, $cicli, $nop) {
    // get value from input, if empty set to 0
    let numero_cicli = $cicli.value === "" ? 0 : parseInt($cicli.value);
    let nop_aggiuntivi = $nop.value === "" ? 0 : parseInt($nop.value);

    cicli[loopNumber] = new Ciclo(numero_cicli, nop_aggiuntivi, cicli[loopNumber - 1]);

    // print all loops
    outputLoopResult();
  }

  /**
   * Outputs the result of the loop calculation.
   */
  function outputLoopResult() {
    let $outputHtmlCicliMancanti = '<div>';
    for (let i = 1; i < cicli.length; i++) {
      $outputHtmlCicliMancanti += '<p>Loop ' + i + ': ' + cicli[i].getNumeroCicli() + '</p>';
    }
    $outputHtmlCicliMancanti += '</div>';

    $resultCicliMancanti.innerHTML = $outputHtmlCicliMancanti;

    // print codice assembly
    let $outputHtmlAssembly = '<pre><code>';
    $outputHtmlAssembly += '; Dichiarazione variabili';
    $outputHtmlAssembly += '</br>PSECT udata_acs';
    for (let i = 1; i < cicli.length; i++) {
      $outputHtmlAssembly += '</br>&emsp;Delay' + i + ': DS 1';
    }
    $outputHtmlAssembly += '</br>';
    $outputHtmlAssembly += '</br>'; // add empty line
    $outputHtmlAssembly += '</br>; Codice assembly';
    $outputHtmlAssembly += '</br>; Routine';
    $outputHtmlAssembly += '</br>Delay:';
    for (let i = cicli.length - 1; i > 0; i--) {
      $outputHtmlAssembly += '</br>&emsp;MOVLW ' + cicli[i].getNumeroCicliDecfsz();
      $outputHtmlAssembly += '</br>&emsp;MOVWF ' + 'Delay' + i;
      $outputHtmlAssembly += '</br>D_Loop' + i + ':';
    }
    for (let i = 1; i < cicli.length; i++) {
      $outputHtmlAssembly += '</br>&emsp;DECFSZ ' + 'Delay' + i + ', F';
      $outputHtmlAssembly += '</br>&emsp;GOTO ' + 'D_Loop' + i;
      for (let j = 0; j < cicli[i].getNopAggiuntivi(); j++) {
        $outputHtmlAssembly += '</br>&emsp;NOP';
      }
    }
    $outputHtmlAssembly += '</br>';
    $outputHtmlAssembly += '</br>&emsp;RETURN';
    $outputHtmlAssembly += '</code></pre>';

    $resultAssembly.innerHTML = $outputHtmlAssembly;
  }

  /**
   * Updates the result of the loop calculation.
   */
  function updateLoopResult() {
    const $rows = document.querySelectorAll(".js-form-loop .row");
    $rows.forEach(($row, index) => {
      const $cicli = $row.querySelector(".cicli");
      const $nop = $row.querySelector(".nop");
      calculateLoop(index + 1, $cicli, $nop);
    });
  }
}

if (document.readyState === 'complete' || (document.readyState !== 'loading')) {
  initApp();
} else {
  document.addEventListener('DOMContentLoaded', initApp);
}

class Ciclo {
  /**
   * @param {number} numero_cicli_decfsz
   * @param {number} nop_aggiuntivi
   * @param {Ciclo} ciclo_precedente
   */
  constructor(numero_cicli_decfsz, nop_aggiuntivi, ciclo_precedente = null) {
    this.numero_cicli_decfsz = numero_cicli_decfsz;
    this.nop_aggiuntivi = nop_aggiuntivi;
    this.ciclo_precedente = ciclo_precedente;
  }

  getNumeroCicli() {
    if (this.ciclo_precedente === null) {
      return 0;
    }
    return 2 + this.numero_cicli_decfsz * (this.ciclo_precedente.getNumeroCicli() + 3) + this.nop_aggiuntivi;
  }

  getNumeroCicliDecfsz() {
    return this.numero_cicli_decfsz;
  }

  getNopAggiuntivi() {
    return this.nop_aggiuntivi;
  }
}
