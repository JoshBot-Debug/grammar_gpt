const textarea = document.querySelector("textarea");

const apiKey = "sk-Jjm7hfCEvGffmfdBRPCg8fHT3BlbkFJSCHCRacwFMLytUWIdDGI";
const apiUrl = "https://api.openai.com/v1/chat/completions";


if (textarea) {

  const icon = document.createElement("img");
  icon.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABdFBMVEVHcEwEDAth87FX47dTxqhh6awjYW8iIyEZLicDCAc1l8Qrep07qN47pthZ7LRCt80ECgwCBghP18hRy8E1l45Ews0qd5FIyaxIzcJg56hQx71i+rFg+bNT47ti3rBV6LwufoFd97VS26c+sd88qMk6nrxCv9U4obU9sdQyj6w3n8BJz7o7o4tU4cJDwspDwb9j+rJP3L1h+bBHyNE8q7Bd9LFh97RGvZde6Lpi8bX///9TtbxV6b5T5cA/teJX7LxM1spCv9lL1MtX7rtFyNRFxtVEw9ZDwdhCvdtY8LlBu9xR4MNP3sVR4sJd97VK0s1IztBHzNFZ8rhGytNBud5a9LdAt99M2MlO3MZd+bRK0M76/v5N2sdO2sg+suRfsLaq7+Rf+7M+sOZb9rbm+fnS9/BO2Mru/Ppz1t+m6edY5cNf38x55tJl38/+//9d1NVr6clj0Nt34tWN49+x7Om/9eh76dFOxtig5+V82t7C7+962N+t3dlWAAAAO3RSTlMACJeYJE04AQUMpWLu3KibFxPfTWHaUqLqPj7l7twe+Sr5fvp+VPqnq4u12Ezu8dnR8NLuqNvZV3Z2FyV8GCgAAAGrSURBVDjLdZPnV8IwFMWBrqQMqTKcuBAE99ZzHLgX7oEa8KCWLYJ7/fMGWpIWar7+bl7ue7nPZNIfQTD9ewQft2BxOJh5zmekAm2W2d6Hi9Pd9ZXuLqYd1HPW0nl9qPDFxaWlEYbVc278TssP9qPNLdrXuY56fhXXKox4LEIUAjvZwBOxyNqRW/UBLMb85rhJ6aVN6z+fp/xkql0pQHk5mUolC4m0ws82qiXYGcLz708ZOVWI1fhm1QXXS+qXM6lioUjub24FBrCgj/CDD5Ss9Ef49qofW2Co/0eUjKe1fAebMDtof1igu7+zN2jGAto/FqRfc18lws+xADB0Pi8ot/b2hLKEX+InhD46/xf0dlT6QVnCl/04OnPdZL5FOZPLZVCW8P5Kmz1dKsf+X2WEZDlb48v2HiyAXs3/lL5/n58/a/xWhJXfHp7Q/A/1h7nNU00v9Ebr5qfye1FSAsMPGXM7r8YfuFqNuM1Ksg9drUYc0lRD11hDfSvU7Jdg5qdHdf5F3qzfP+D0BN0BdX520eNs2D0BSLw1FAyHxZCVl4DhkgsASk6nBHX0DxPUx/69z3x5AAAAAElFTkSuQmCC";
  icon.className = "grammar_trigger_icon";

  const button = document.createElement("button");
  button.append(icon);
  button.className = "grammar_trigger";
  button.type = "button";

  const suggestionBox = createSuggestionBox(button);

  button.onclick = async function (e) {
    if (suggestionBox.isVisible()) return;
    const sentence = textarea.value;
    if (sentence.length === 0) return;

    const suggestions = await getSuggestions(sentence)
    suggestionBox.show(suggestions);
  }

  textarea.insertAdjacentElement("afterend", button);
}


function createSuggestionBox(parent) {

  const container = document.createElement("div");
  container.classList.add("grammar_suggestion", "grammar_hide");

  const title = document.createElement("p");
  title.innerText = "Grammar suggestions";

  const suggestionList = document.createElement("ol");
  container.append(title, suggestionList);

  function hide() {
    if (container.classList.contains("grammar_hide")) return;
    container.classList.add("grammar_animate_out");
  }

  parent.append(container);
  parent.addEventListener('blur', hide);

  container.addEventListener('animationend', () => {
    if (container.classList.contains('grammar_animate_in')) {
      container.classList.remove("grammar_animate_in");
    }
    if (container.classList.contains('grammar_animate_out')) {
      suggestionList.innerHTML = "";
      container.classList.add("grammar_hide");
      container.classList.remove("grammar_show", "grammar_animate_out");
    }
  });

  return {
    container,
    hide,
    isVisible: () => container.classList.contains("grammar_show"),
    show: (suggestions) => {
      if (container.classList.contains("grammar_show")) return;

      suggestionList.innerHTML = "";
      suggestions.forEach(s => {
        const suggestion = document.createElement("li");
        suggestion.innerText = s;
        suggestionList.append(suggestion);
      });
      container.classList.remove("grammar_hide");
      container.classList.add("grammar_show", "grammar_animate_in");
    },
  }

}


async function getSuggestions(sentence) {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        max_tokens: 50,
        prompt: `5 alternative ways of saying "${sentence}". JSON response {"alt": []}`,
      })
    });

    const result = await response.json();

    if ("alt" in result) return result.alt;

    return ["Unexpected response from GPT."];
  }
  catch (error) {
    console.error(error.message);
    return [`Something went wrong! Error: ${error.message}`];
  }
}