function addProduct(element) {
    const http = new XMLHttpRequest();
    http.open("POST", 'todaysProduct');
    http.setRequestHeader("Content-Type", "application/json");
    http.onreadystatechange = function() {
        if (this.status == 200) {
            location.href = "/"
       }
    };
    http.send(JSON.stringify({productName : element.innerText}));
}
