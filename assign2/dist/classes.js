"use strict";
var Student = (function () {
    function Student(identifier, firstName, lastName) {
        this.identifier = identifier;
        this.firstName = firstName;
        this.lastName = lastName;
    }
    return Student;
}());
