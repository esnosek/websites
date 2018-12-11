function removePortion(event) {
    const http = new XMLHttpRequest();
    http.open("DELETE", 'portion');
    http.responseType = "text";
    http.setRequestHeader("Content-Type", "application/json");
    http.onload = function() {
        if (this.status == 200){
            document.getElementById("todaysPortions").innerHTML = this.response;
            Array.from(document.getElementsByClassName('removePortionButton')).forEach(e => e.onclick = removePortion);
            Array.from(document.getElementsByClassName('portionQuantityInput')).forEach(e => e.onchange = updatePortionQuantity);
        }
    };
    http.send(JSON.stringify({portionId : event.srcElement.parentNode.parentNode.id}));
}

function updatePortionQuantity(event) {
    const http = new XMLHttpRequest();
    http.open("PATCH", 'portion');
    http.responseType = "text";
    http.setRequestHeader("Content-Type", "application/json");
    http.onload = function() {
        if (this.status == 200){
            document.getElementById("todaysPortions").innerHTML = this.response;
            Array.from(document.getElementsByClassName('removePortionButton')).forEach(e => e.onclick = removePortion);
            Array.from(document.getElementsByClassName('portionQuantityInput')).forEach(e => e.onchange = updatePortionQuantity);
        }
    };
    http.send(JSON.stringify({portionId : event.srcElement.parentNode.parentNode.id, quantity : event.target.value}));
}

Array.from(document.getElementsByClassName('removePortionButton')).forEach(e => e.onclick = removePortion);
Array.from(document.getElementsByClassName('portionQuantityInput')).forEach(e => e.onchange = updatePortionQuantity);