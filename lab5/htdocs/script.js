"use strict";
var emojiData = [
    { name: "+1",
        url: "https://github.githubassets.com/images/icons/emoji/unicode/1f44d.png?v8" },
    { name: "-1",
        url: "https://github.githubassets.com/images/icons/emoji/unicode/1f44e.png?v8" },
    { name: "100",
        url: "https://github.githubassets.com/images/icons/emoji/unicode/1f4af.png?v8" },
    { name: "1234",
        url: "https://github.githubassets.com/images/icons/emoji/unicode/1f522.png?v8" },
    { name: "1st_place_medal",
        url: "https://github.githubassets.com/images/icons/emoji/unicode/1f947.png?v8" },
    { name: "2nd_place_medal",
        url: "https://github.githubassets.com/images/icons/emoji/unicode/1f948.png?v8" },
    { name: "3rd_place_medal",
        url: "https://github.githubassets.com/images/icons/emoji/unicode/1f949.png?v8" },
    { name: "8ball",
        url: "https://github.githubassets.com/images/icons/emoji/unicode/1f3b1.png?v8" }
];
var attachNavListeners = function () {
    var navWelcome = document.querySelector("#nav-welcome");
    navWelcome.onclick = clickWelcome;
    var navEmojis = document.querySelector("#nav-emojis");
    navEmojis.onclick = clickEmojis;
};
var clickWelcome = function (evt) {
    var sectionWelcome = document.querySelector("#welcome");
    var sectionEmojis = document.querySelector("#emojis");
    sectionWelcome.className = "active";
    sectionEmojis.className = "";
};
var clickEmojis = function (evt) {
    var sectionWelcome = document.querySelector("#welcome");
    var sectionEmojis = document.querySelector("#emojis");
    sectionWelcome.className = "";
    sectionEmojis.className = "active";
};
var renderEmojiTab = function () {
    var template = document.querySelector("#emoji-template");
    var target = document.querySelector("#emojis-table");
    if (!template.textContent) {
        return;
    }
    var renderFunc = doT.template(template.textContent);
    target.innerHTML = renderFunc(template.textContent);
};
window.onload = function () {
    attachNavListeners();
    renderEmojiTab();
};
