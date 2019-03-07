let identifier: string;

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

    console.log("Clicked presenters");
}

let clickPresenter = (evt: MouseEvent): void => {
    let target = <HTMLElement>evt.target;
    let fragment = <string>target.getAttribute("href");

    if (fragment != null) {
        loadPresentationInfo(identifier, fragment.charAt(1));
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
    sendResponse("test", 1, "M/C", 4, "Strongly Agree");
}


let loadPresentersList = (identifier: string): void => {
    let request = new XMLHttpRequest();

    request.onload = (evt: Event): void => {
        let target = <HTMLElement>document.querySelector("#presenters");
        let json = JSON.parse(request.responseText);
        console.log(json);
        let template = <HTMLElement>document.querySelector("#presenters-template");

        if (!template.textContent) {
            console.log("Template is missing");
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
        console.log(json);

        let template = <HTMLElement>document.querySelector("#presenter-info-template");

        if (!template.textContent) {
            console.log("Template is missing");
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
        console.log(json);

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

let sendResponse = (identifier: string, presenterID: number, questionType: string, questionNumber: number, answer: string): void => {
    let request = new XMLHttpRequest();
    request.open("POST", "http://localhost:8080/api/v1/presenters/" + presenterID);
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.setRequestHeader("Content-Type", "application/json");

    let questionResponse = new Response();
    questionResponse.responderID = identifier;
    questionResponse.presentationID = presenterID;
    questionResponse.questionType = questionType;
    questionResponse.number = questionNumber;
    questionResponse.answer = answer;

    let json = JSON.stringify(questionResponse);
    request.send(json)
}

window.onload = (): void => {
    attachListeners();
}

