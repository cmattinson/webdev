let attachListeners = (): void => {
    let submit = <HTMLElement>document.querySelector("#submit-button");
    submit.onclick = clickSubmit;

    let navPresenters = <HTMLElement>document.querySelector("#nav-presenters");
    navPresenters.onclick = clickPresenters;

    let navResponses = <HTMLElement>document.querySelector("#nav-responses");
    navResponses.onclick = clickResponses;
}

// Event handler for the clicking of the Submit button on the authentication page
let clickSubmit = (evt: MouseEvent): void => {
    let input = <HTMLInputElement>document.querySelector("#id-box");

    if (input == null) {
        return;
    }

    let request = new XMLHttpRequest();
    // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/onreadystatechange
    request.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            let target = <HTMLElement>document.querySelector("#presenters-list");
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

        if (this.readyState === 4 && this.status === 401) {
            let target = <HTMLElement>document.querySelector("#error");

            // Remove the top header in the response text
            let response = request.responseText;
            let split = response.split("\n");
            split.splice(0,1);
            let message = split.join("\n");

            let json = JSON.parse(message);

            let template = <HTMLElement>document.querySelector("#error-template");

            if (!template.textContent) {
                console.log("#error-template is missing");
                return;
            }

            let renderFunc = doT.template(template.textContent);
            target.innerHTML = renderFunc(json);

            let sectionError = <HTMLElement>document.querySelector("#error-page");
            let sectionAuth = <HTMLElement>document.querySelector("#auth-section");

            sectionError.className = "active";
            sectionAuth.className = "";
        }
    }
    request.open("GET", "http://localhost:8080/api/v1/presenters");
    request.setRequestHeader("Authorization", "Bearer " + input.value);
    request.send();

    console.log("Clicked submit");
    return;
}

let clickPresenters = (evt: MouseEvent): void => {
    let sectionPresenters = <HTMLElement>document.querySelector("#presenters-section");
    let sectionAuth = <HTMLElement>document.querySelector("#auth-section");
    let sectionResponses = <HTMLElement>document.querySelector("#responses-section");
    
    sectionPresenters.className = "active";
    sectionResponses.className = "";

    console.log("Clicked presenters");
}

let clickResponses = (evt: MouseEvent): void => {
    let sectionResponses = <HTMLElement>document.querySelector("#responses-section");
    let sectionPresenters = <HTMLElement>document.querySelector("#presenters-section");

    sectionResponses.className = "active";
    sectionPresenters.className = "";

    console.log("Clicked responses");
}

let clickHello = (evt: MouseEvent): void => {
    console.log("Clicked");
}

window.onload = (): void => {
    attachListeners();
}

