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
    // Loop through all 10 multiple choice questions
    for (let i = 0; i < 10; i++) {
        let choiceName = "multChoice" + i;
        let selection = <HTMLInputElement>document.querySelector("input[name=" + choiceName + "]:checked")

        if (selection != null) {
            let questionResponse = new Response();
            questionResponse.responderID = identifier;
            questionResponse.presentationID = presentationID;
            questionResponse.questionType = "M/C";
            questionResponse.number = i + 1; // Convert zero based indexing of template to actual question number
            questionResponse.answer = selection.value;

            let json = JSON.stringify(questionResponse);
            sendResponse(json);
        }
    }
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
    }

    request.open("GET", "http://localhost:8080/api/v1/questions");
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();

    return;
}

let sendResponse = (json: string): void => {
    let request = new XMLHttpRequest();
    request.open("POST", "http://localhost:8080/api/v1/presenters/" + presentationID);
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(json)
}

window.onload = (): void => {
    attachListeners();
}

