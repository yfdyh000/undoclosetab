const input_label = document.querySelector("#checkbox_input_label");
const checkbox_input = document.querySelector("#checkbox_input");
const note_restrict = document.querySelector("#note_restrict");

function init() {
  input_label.textContent = browser.i18n.getMessage("checkbox_moreMenuItems");
  note_restrict.textContent = browser.i18n.getMessage("note_restrict");

  loadOptions();
  checkbox_input.addEventListener("change", saveOptions);
}

function saveOptions() {
  browser.storage.local.set({
    moreMenuItems: !!checkbox_input.checked
  }).then(() => {
  }, error => {
    console.error(error);
  }
  );
}

function loadOptions() {
  function setCurrentOptions(result) {
    checkbox_input.checked = !!result.moreMenuItems;
  }

  browser.storage.local.get("moreMenuItems").then(setCurrentOptions, error => {
    console.log(error);
  });
}

init();