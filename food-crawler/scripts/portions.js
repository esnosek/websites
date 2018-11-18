function savePortions() {
    const http = new XMLHttpRequest();
    http.open("POST", 'portion');
    http.responseType = "text";
    http.setRequestHeader("Content-Type", "application/json");
    http.send();
}

function changeQuantity(element) {
    const http = new XMLHttpRequest();
    http.open("POST", 'quantity');
    http.responseType = "text";
    http.setRequestHeader("Content-Type", "application/json");
    http.send(JSON.stringify({name : element.innerText, quantity : 100}));
}

function removePortion(productId, element) {
    const http = new XMLHttpRequest();
    http.open("DELETE", 'portion');
    http.responseType = "text";
    http.setRequestHeader("Content-Type", "application/json");
    http.onload = function() {
        if (this.status == 200)
            element.parentNode.parentNode.remove()
    };
    http.send(JSON.stringify({productId : productId}));
}