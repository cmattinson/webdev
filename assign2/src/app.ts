let identifier: string;
let presentationID: number;

interface Response {
    responderID: string;
    presentationID: number;
    questionType: string;
    number: number;
    answer: string;
}

let attachListeners = (): void => {
    let submit = <HTMLElement>document.querySelector("#submit-button");
    submit.onclick = clickSubmit;

    let navPresenters = <HTMLElement>document.querySelector("#nav-presenters");
    navPresenters.onclick = clickPresenters;

    let navResponses = <HTMLElement>document.querySelector("#nav-responses");
    navResponses.onclick = clickResponses;

    let presentersList = <HTMLElement>document.querySelector("#presenters");
    presentersList.onclick = clickPresenter;

    let submitResponses = <HTMLElement>document.querySelector("#submit-responses");
    submitResponses.onclick = clickSubmitResponses;
}

// Event handler for the clicking of the Submit button on the authentication page
let clickSubmit = (evt: MouseEvent): void => {
    let input = <HTMLInputElement>document.querySelector("#id-box");
    identifier = input.value;

    if (input == null) {
        return;
    }

    loadPresentersList(identifier);
}

let clickPresenters = (evt: MouseEvent): void => {
    let sectionPresenters = <HTMLElement>document.querySelector("#presenters-section");
    let sectionAuth = <HTMLElement>document.querySelector("#auth-section");
    let sectionResponses = <HTMLElement>document.querySelector("#responses-section");

    let buttonPresenters = <HTMLElement>document.querySelector("#nav-presenters");
    let buttonResponses = <HTMLElement>document.querySelector("#nav-responses");
    
    sectionPresenters.className = "active";
    sectionResponses.className = "";

    buttonPresenters.className = "active";
    buttonResponses.className = "";
}

let clickPresenter = (evt: MouseEvent): void => {
    let target = <HTMLElement>evt.target;
    let fragment = <string>target.getAttribute("href");
    let presID = fragment.charAt(1);

    if (fragment != null) {
        presentationID = parseInt(presID, 10);
        loadPresentationInfo(identifier, presID);
        loadQuestions(identifier);
    }
}

let clickResponses = (evt: MouseEvent): void => {
    let sectionResponses = <HTMLElement>document.querySelector("#responses-section");
    let sectionPresenters = <HTMLElement>document.querySelector("#presenters-section");

    let buttonPresenters = <HTMLElement>document.querySelector("#nav-presenters");
    let buttonResponses = <HTMLElement>document.querySelector("#nav-responses");

    sectionResponses.className = "active";
    sectionPresenters.className = "";

    buttonPresenters.className = "";
    buttonResponses.className = "active";
}

let clickSubmitResponses = (evt: MouseEvent): void => {
    let textAreas = document.querySelectorAll("textarea");
    for (let i = 0; i < textAreas.length; i++) {
        let textArea = textAreas[i];
        let boxName = textArea.name;
        let answer = textArea.value;

        let questionNumber = parseQuestionNumber(boxName);
        manageResponse(identifier, presentationID, "Open", questionNumber, answer);
    }
}

let clickRadioButton = (evt: MouseEvent): void => {
    let element = <HTMLInputElement>evt.target;
    let choiceName = element.name;

    // choiceName would be in the form multChoice0, get the 0 from the end and increment it to get the question number
    let questionNumber = parseQuestionNumber(choiceName);
  
    manageResponse(identifier, presentationID, "M/C", questionNumber, element.value);
}

let parseQuestionNumber = (inputName: string): number => {
    let questionNumber = parseInt(inputName[inputName.length - 1], 10);
    questionNumber++;

    return questionNumber;
}

let loadPresentersList = (identifier: string): void => {
    let request = new XMLHttpRequest();

    request.onload = (evt: Event): void => {
        let target = <HTMLElement>document.querySelector("#presenters");
        let json = JSON.parse(request.responseText);
        let template = <HTMLElement>document.querySelector("#presenters-template");

        if (!template.textContent) {
            console.log("#presenters-template is missing");
            return;
        }

        let renderFunc = doT.template(template.textContent);
        target.innerHTML = renderFunc(json);

        let sectionAuth = <HTMLElement>document.querySelector("#auth-section");
        let sectionPresenters = <HTMLElement>document.querySelector("#presenters-section");
        let sectionNav = <HTMLElement>document.querySelector("#navigation")
        sectionAuth.className = "";
        sectionNav.className = "active";
        sectionPresenters.className = "active";
    }

    request.open("GET", "http://localhost:8080/api/v1/presenters");
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();

    return;
}

let loadPresentationInfo = (identifier: string, fragment: string): void => {
    let request = new XMLHttpRequest();
    let presentationID = parseInt(fragment, 10);

    request.onload = (evt: Event): void => {
        let target = <HTMLElement>document.querySelector("#presenter-info");
        let json = JSON.parse(request.responseText);

        let template = <HTMLElement>document.querySelector("#presenter-info-template");

        if (!template.textContent) {
            console.log("#presenters-info-template is missing");
            return;
        }

        let renderFunc = doT.template(template.textContent);
        target.innerHTML = renderFunc(json);

        let sectionPresenter = <HTMLElement>document.querySelector("#presenter-info-section");
        let sectionPresenters = <HTMLElement>document.querySelector("#presenters-section");
        sectionPresenters.className = "";
        sectionPresenter.className = "active";
    }

    let uri = "http://localhost:8080/api/v1/presenters/" + presentationID;

    request.open("GET", uri);
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();

    return;
}

let loadQuestions = (identifier: string): void => {
    let request = new XMLHttpRequest();
    
    request.onload = (evt: Event): void => {
        let target = <HTMLElement>document.querySelector("#questions");
        let json = JSON.parse(request.responseText);

        let template = <HTMLElement>document.querySelector("#question-template");

        if (!template.textContent) {
            console.log("#question-template is missing");
            return;
        }

        let renderFunc = doT.template(template.textContent);
        target.innerHTML = renderFunc(json);

        let sectionQuestions = <HTMLElement>document.querySelector("#questions-section");
        sectionQuestions.className = "active";


        let radioButtons = document.querySelectorAll("input[type=radio]");
        let buttonGroupSet = new Set();

        // Add click listeners to every radio button
        for (let i = 0; i < radioButtons.length; i++) {
            let radioButton = <HTMLInputElement>radioButtons[i];
            radioButton.onclick = clickRadioButton;


            // Add the button group, e.g. "multChoice0", to buttonGroupSet
            buttonGroupSet.add(radioButton.name);
        }      
        
        let iterator = buttonGroupSet.values();

        // If the buttonGroup has a previous answer, check it upon loading question list
        for (let i = 0; i < buttonGroupSet.size; i++) {
            checkRadioButton(iterator.next().value);
        }

        let textAreas = document.querySelectorAll("textarea");

        for (let i = 0; i < textAreas.length; i++) {
            let textArea = <HTMLTextAreaElement>textAreas[i];
            fillPreviousResponse(textArea.name);
        }
    }

    request.open("GET", "http://localhost:8080/api/v1/questions");
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();

    return;
}

let manageResponse = (responderID: string, presentationID: number, questionType: string, questionNumber: number, answer: string): void => {
    let request = new XMLHttpRequest();
    let questionID: string;
    
    if (questionType === "M/C") {
        questionID = "mc" + questionNumber;
    } else if (questionType === "Open") {
        questionID = "open" + questionNumber;
    } else {
        return;
    }

    request.onload = (evt: Event): void => {
        let json = JSON.parse(request.responseText);
        
        let questionResponse = new Response();
        questionResponse.responderID = responderID;
        questionResponse.presentationID = presentationID;
        questionResponse.questionType = questionType;
        questionResponse.number = questionNumber;
        questionResponse.answer = answer;

        let responseJSON = JSON.stringify(questionResponse);  

        // The response being sent is new
        if (json.answer === "") {
            sendResponse(responseJSON);
        } else { // The response being sent is an update
            updateResponse(responseJSON);
        }
    }

    let uri = "http://localhost:8080/api/v1/responses/" + presentationID + "/" + questionID;

    request.open("GET", uri);
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();
}

/**
 * This function takes in a buttonGroup and checks the button corresponding to the previous answer if there is one
 * @param buttonGroupName - The name of the button group, e.g. multChoice0
 */
let checkRadioButton = (buttonGroupName: string): void => {
    let request = new XMLHttpRequest();

    let questionNumber = parseQuestionNumber(buttonGroupName);
    let questionID = "mc" + questionNumber;

    request.onload = (evt: Event): void => {
        let json = JSON.parse(request.responseText);
        let buttonGroup = document.querySelectorAll("input[name=" + buttonGroupName + "]");

        for (let i = 0; i < buttonGroup.length; i++) {
            let button = <HTMLInputElement>buttonGroup[i];

            if (json.answer === button.value) {
                button.checked = true;
            }
        }
    }

    let uri = "http://localhost:8080/api/v1/responses/" + presentationID + "/" + questionID;

    request.open("GET", uri);
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();
}


let fillPreviousResponse = (textAreaName: string): void => {
    let request = new XMLHttpRequest();
    
    let questionNumber = parseQuestionNumber(textAreaName);
    let questionID = "open" + questionNumber;

    request.onload = (evt: Event): void => {
        let json = JSON.parse(request.responseText);
        let textArea = <HTMLTextAreaElement>document.querySelector("textarea[name=" + textAreaName + "]");

        if (json.answer != "") {
            textArea.value = json.answer;
        }
    }

    let uri = "http://localhost:8080/api/v1/responses/" + presentationID + "/" + questionID;

    request.open("GET", uri);
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();
}

let sendResponse = (json: string): void => {
    let request = new XMLHttpRequest();
    request.open("POST", "http://localhost:8080/api/v1/presenters/" + presentationID);
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(json);
}

let updateResponse = (json: string): void => {
    let request = new XMLHttpRequest();
    request.open("PUT", "http://localhost:8080/api/v1/presenters/" + presentationID);
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(json)
}

window.onload = (): void => {
    attachListeners();
}

