/**
 * CMPT 315 - Assignment 2
 * Author: Chris Mattinson
 * 
 * This handles the API requests and main functionality for the Presentation
 * Feedback System
 */

let identifier: string;
let presentationID: number;

/**
 * Used for storing responses from the API
 */
interface Response {
    responderID: string;
    presentationID: number;
    questionType: string;
    number: number;
    answer: string;
}

/**
 * Attaches event listeners to HTML Elements
 */
let attachListeners = (): void => {
    let submit = <HTMLElement>document.querySelector("#submit-button");
    submit.onclick = clickSubmit;

    let titleLinks = document.querySelectorAll("#title-items");

    for (let i = 0; i < titleLinks.length; i++) {
        let link = <HTMLElement>titleLinks[i];
        link.onclick = clickTitleLink;
    }
    
    let presentersList = <HTMLElement>document.querySelector("#presenters");
    presentersList.onclick = clickPresenter;

    let submitResponses = <HTMLElement>document.querySelector("#submit-responses");
    submitResponses.onclick = clickSubmitResponses;

    let otherPresentersSelect = <HTMLSelectElement>document.querySelector("#other-presenters-select");
    otherPresentersSelect.onchange = changeOtherPresentersSelect;

    let otherPresentationsSelect = <HTMLSelectElement>document.querySelector("#other-presentations-select");
    otherPresentationsSelect.onchange = changeOtherPresentationsSelect;
}

/**
 * Obtain the question number from either a radio button or text area
 * @param inputName Radio button group name or text area name
 * @example
 * // returns 1
 * parseQuestionNumber("multChoice0")
 * @returns {Number} Returns the question number for passed in input
 */
let parseQuestionNumber = (inputName: string): number => {
    let questionNumber = parseInt(inputName[inputName.length - 1], 10);
    questionNumber++;

    return questionNumber;
}

/**
 * Renders an error page based on an error response from the API
 * @param json Error json
 */
let renderErrorPage = (json: string): void => {
    let target = <HTMLElement>document.querySelector("#error");
    let template = <HTMLElement>document.querySelector("#error-template");

    let sectionError = <HTMLElement>document.querySelector("#error-page")
    let sectionAuth = <HTMLElement>document.querySelector("#auth-section");
    let sectionHeader = <HTMLElement>document.querySelector("#header-section");
    let sectionPresenters = <HTMLElement>document.querySelector("#presenters-section");
    let sectionQuestions = <HTMLElement>document.querySelector("#questions-section");
    let sectionPresenterInfo = <HTMLElement>document.querySelector("#presenter-info-section");

    if (!template.textContent) {
        console.log("#error-template is missing");
        return;
    }

    let renderFunc = doT.template(template.textContent);
    target.innerHTML = renderFunc(json);

    sectionError.className = "active";

    // Hide everyting except the error page
    sectionAuth.className = "";
    sectionQuestions.className = "";
    sectionPresenterInfo.className = "";
    sectionHeader.className = "";
    sectionPresenters.className = "";
}

/**
 * Test if the user trying to log in is authenticated
 * @param identifier Inputted identifier
 */
let testIsStudent = (identifier: string): void => {
    let request = new XMLHttpRequest();

    request.onload = (evt: Event): void => {
        let json = JSON.parse(request.responseText);

        if (json.statusCode === 401) {
            renderErrorPage(json);
        } else {
            loadPresentersList(identifier);
            fillOtherPresentersBox(identifier);
            fillOtherPresentationsBox(identifier);
        }
    }
    request.open("GET", "http://localhost:8080/api/v1/presenters");
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();

    return;
}

/**
 * Fills the other-presenters-select combo box with presenter's names
 * @param identifier Current user's identifier
 */
let fillOtherPresentersBox = (identifier: string): void => {
    let request = new XMLHttpRequest();

    request.onload = (evt: Event): void => {
        let select = <HTMLSelectElement>document.querySelector("#other-presenters-select");
        let json = JSON.parse(request.responseText);

        // Add each presenter's name to the combo box
        json.forEach(presenter => {
            let display = presenter.firstName + " " + presenter.lastName;
            let value = presenter.presentationID;
            
            select.options[select.options.length] = new Option(display, value);
        });
    }
    request.open("GET", "http://localhost:8080/api/v1/presenters");
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();

    return;
}

/**
 * Fills the other-presentations-select combo box with presentation titles
 * @param identifier Current user's identifier
 */
let fillOtherPresentationsBox = (identifier: string): void => {
    let request = new XMLHttpRequest();

    request.onload = (evt: Event): void => {
        let select = <HTMLSelectElement>document.querySelector("#other-presentations-select");
        let json = JSON.parse(request.responseText);

        // Add each presentation title to the combo box
        json.forEach(presentation => {
            let display = presentation.title;
            let value = presentation.presentationID;

            select.options[select.options.length] = new Option(display, value);
        });
    }

    request.open("GET", "http://localhost:8080/api/v1/presentations");
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();

    return;
}

/**
 * Gets the list of presenters from the API and displays the list of presenters section
 * @param identifier Current user's identifier
 */
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
        let sectionHeader = <HTMLElement>document.querySelector("#header-section");
        let sectionPresenters = <HTMLElement>document.querySelector("#presenters-section");
        let sectionQuestions = <HTMLElement>document.querySelector("#questions-section");
        let sectionPresenterInfo = <HTMLElement>document.querySelector("#presenter-info-section");

        // Hide everyting except the header and presenter list
        sectionAuth.className = "";
        sectionQuestions.className = "";
        sectionPresenterInfo.className = "";
        sectionHeader.className = "active";
        sectionPresenters.className = "active";
    }

    request.open("GET", "http://localhost:8080/api/v1/presenters");
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();

    return;
}

/**
 * Obtain the presentation info for the selected presentation
 * @param identifier Current user's identifier
 * @param idString ID string for the presentation obtained from the href of the presenter link
 */
let loadPresentationInfo = (identifier: string, idString: string): void => {
    let request = new XMLHttpRequest();
    let presentationID = parseInt(idString, 10);

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

/**
 * Obtain the list of questions from the API
 * @param identifier Current user's identifier
 */
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

        // Get all radio buttons on the survey form
        let radioButtons = document.querySelectorAll("input[type=radio]");

        // Will hold all the names for the button groups
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
            // Fill in previous answer for the current button group
            checkRadioButton(iterator.next().value);
        }

        // Get all text areas on the survey form
        let textAreas = document.querySelectorAll("textarea");

        for (let i = 0; i < textAreas.length; i++) {
            let textArea = <HTMLTextAreaElement>textAreas[i];

            // Fill in previous answer for the current open question
            fillPreviousResponse(textArea.name);
        }
    }

    request.open("GET", "http://localhost:8080/api/v1/questions");
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();

    return;
}

/**
 * POST or PUT a response to the API
 * @param responderID Current user's identifier
 * @param presentationID Presentation the response is being sent to
 * @param questionType Type of question (M/C or Open)
 * @param questionNumber Number of question
 * @param answer Answer to question
 */
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
        if (json.answer === "unanswered") {
            sendResponse(responseJSON);
        } else if (json.answer === answer) { // The answer is the same, do nothing
            return;
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
 * Takes in a buttonGroup and checks the button corresponding to the previous answer if there is one
 * @param buttonGroupName - The name of the button group, e.g. multChoice0
 */
let checkRadioButton = (buttonGroupName: string): void => {
    let request = new XMLHttpRequest();

    let questionNumber = parseQuestionNumber(buttonGroupName);
    let questionID = "mc" + questionNumber;

    request.onload = (evt: Event): void => {
        let json = JSON.parse(request.responseText);

        // Select all radio buttons in the desired group
        let buttonGroup = document.querySelectorAll("input[name=" + buttonGroupName + "]");

        for (let i = 0; i < buttonGroup.length; i++) {
            let button = <HTMLInputElement>buttonGroup[i];

            // Check the radio button corresponding to the previous answer
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

/**
 * Fill in the previous Open question response if there is one
 * @param textAreaName - Text area name corresponding to the Open question
 */
let fillPreviousResponse = (textAreaName: string): void => {
    let request = new XMLHttpRequest();
    
    let questionNumber = parseQuestionNumber(textAreaName);
    let questionID = "open" + questionNumber;

    request.onload = (evt: Event): void => {
        let json = JSON.parse(request.responseText);
        let textArea = <HTMLTextAreaElement>document.querySelector("textarea[name=" + textAreaName + "]");

        if (json.answer != "unanswered") {
            textArea.value = json.answer;
        }
    }

    let uri = "http://localhost:8080/api/v1/responses/" + presentationID + "/" + questionID;

    request.open("GET", uri);
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();
}

/**
 * POST a new response to the API
 * @param responseJSON Response content
 */
let sendResponse = (responseJSON: string): void => {
    let request = new XMLHttpRequest();
    request.open("POST", "http://localhost:8080/api/v1/presenters/" + presentationID);
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(responseJSON);
}

/**
 * PUT an updated response to the API
 * @param responseJSON Response content
 */
let updateResponse = (responseJSON: string): void => {
    let request = new XMLHttpRequest();
    request.open("PUT", "http://localhost:8080/api/v1/presenters/" + presentationID);
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(responseJSON)
}

/**
 * Show the combo boxes when the user is on the survey form page
 */
let showComboBoxes = (): void => {
    let comboBox1 = <HTMLElement>document.querySelector("#other-presenters-select");
    let comboBox2 = <HTMLElement>document.querySelector("#other-presentations-select");

    comboBox1.className = "active";
    comboBox2.className = "active";
}

/**
 * Hide the combo boxes when the user is not on the survey form page
 */
let hideComboBoxes = (): void => {
    let comboBox1 = <HTMLElement>document.querySelector("#other-presenters-select");
    let comboBox2 = <HTMLElement>document.querySelector("#other-presentations-select");

    comboBox1.className = "";
    comboBox2.className = "";
}

/**
 * Clears the combo boxes on logout to prevent loading options multiple times
 */
let clearComboBoxes = (): void => {
    let comboBox1 = <HTMLSelectElement>document.querySelector("#other-presenters-select");
    let comboBox2 = <HTMLSelectElement>document.querySelector("#other-presentations-select");

    // Fabiano's answer on https://stackoverflow.com/questions/3364493/how-do-i-clear-all-options-in-a-dropdown-box
    for (let i = comboBox1.options.length - 1; i >= 0; i--) {
        comboBox1.remove(i);
    }

    for (let i = comboBox2.options.length - 1; i >= 0; i--) {
        comboBox2.remove(i);
    }
}

window.onload = (): void => {
    attachListeners();
}