function showProductInfo(event) {
    const http = new XMLHttpRequest();
    http.open("GET", 'product?productId=' + event.target.id);
    http.responseType = "text";
    http.onload = function() {
        if (this.status == 200) {
            document.getElementById("search-menu").innerHTML = this.response;
            document.getElementById('portionForm').onsubmit = addPortion;
       }
    };
    http.send();
}

function addPortion(event) {
    const http = new XMLHttpRequest();
    http.open("POST", 'portion');
    http.responseType = "text";
    http.setRequestHeader("Content-Type", "application/json");
    http.onload = function() {
        if (this.status == 200)
            document.location.replace("/")
    };
    http.send(JSON.stringify({productId : event.srcElement.productId.value, quantity : event.srcElement.quantity.value}));
    return false;
}

function changeDay(event) {
    const http = new XMLHttpRequest();
    http.open("POST", 'day');
    http.responseType = "text";
    http.setRequestHeader("Content-Type", "application/json");
    http.onload = function() {
        if (this.status == 200)
            document.location.replace("/")
    };
    http.send(JSON.stringify({day : event.target.value}));
}

document.getElementById('day').onchange = changeDay
Array.from(document.getElementsByClassName('productImage')).forEach(e => e.onclick = showProductInfo);
