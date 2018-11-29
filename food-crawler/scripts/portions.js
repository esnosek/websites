function savePortions() {
    const http = new XMLHttpRequest();
    http.open("POST", 'portion');
    http.responseType = "text";
    http.setRequestHeader("Content-Type", "application/json");
    http.send();
}

function removePortion(productId, element) {
    const http = new XMLHttpRequest();
    http.open("DELETE", 'portion');
    http.responseType = "text";
    http.setRequestHeader("Content-Type", "application/json");
    http.onload = function() {
        if (this.status == 200)
            document.getElementById("todaysPortions").innerHTML = this.response;
    };
    http.send(JSON.stringify({productId : productId}));
}

function updatePortionQuantity(productId, element) {
    const http = new XMLHttpRequest();
    http.open("PATCH", 'portion');
    http.responseType = "text";
    http.setRequestHeader("Content-Type", "application/json");
    http.onload = function() {
        if (this.status == 200)
            document.getElementById("todaysPortions").innerHTML = this.response;
    };
    http.send(JSON.stringify({productId : productId, quantity : element.value}));
}