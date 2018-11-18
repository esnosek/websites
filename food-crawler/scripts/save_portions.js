function savePortions() {
    const http = new XMLHttpRequest();
    http.open("POST", 'save');
    http.responseType = "text";
    http.setRequestHeader("Content-Type", "application/json");
    http.onload = function() {
        if (this.status == 200) {
            document.getElementsByClassName("main")[0].innerHTML = "DODANE";
       }
    };
    http.send();

}