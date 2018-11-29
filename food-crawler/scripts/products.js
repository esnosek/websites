function addProduct(event) {
    const element = event.target
    const http = new XMLHttpRequest();
    // TODO fetch
    http.open("POST", 'product/search');
    http.responseType = "text";
    http.setRequestHeader("Content-Type", "application/json");
    http.onload = function() {
        if (this.status == 200) {
            document.getElementById("products").innerHTML = "";
            const productJson = JSON.parse(http.responseText);
            const table = document.getElementById("productInfoTable");
            const caption = document.createElement("caption");
            const captionText = document.createTextNode(productJson._source.productName);
            caption.appendChild(captionText);
            table.appendChild(caption)
            
            for(let p in productJson._source.nutritionalValues){
                const tr = document.createElement("tr");
                const key = document.createTextNode(p)
                const value = document.createTextNode(productJson._source.nutritionalValues[p])
                const tdKey = document.createElement("td");
                const tdValue = document.createElement("td");
                tdKey.appendChild(key);
                tdValue.appendChild(value);
                tr.appendChild(tdKey)
                tr.appendChild(tdValue)
                table.appendChild(tr)
            }

            const form = document.createElement("form");
            form.setAttribute("method", "POST");
            //form.setAttribute("action", "addProduct");
            form.setAttribute("onsubmit", "return someFunction(this);");
            form.setAttribute("enctype", "application/json");

            const textInput = document.createElement("input");
            textInput.setAttribute("id", "quantity");
            textInput.setAttribute("type", "text");
            textInput.setAttribute("name", "quantity");

            const button = document.createElement("button");
            button.setAttribute("id", "submit");
            button.setAttribute("type", "submit");
            button.setAttribute("name", "submit");
            const addProductText = document.createTextNode("Add product");
            button.appendChild(addProductText);

            const hiddenInput = document.createElement("input");
            hiddenInput.setAttribute("id", "productId");
            hiddenInput.setAttribute("type", "hidden");
            hiddenInput.setAttribute("name", "productId");
            hiddenInput.setAttribute("value", productJson._id);

            form.appendChild(textInput);
            form.appendChild(button);
            form.appendChild(hiddenInput);

            document.getElementById("productInfo").appendChild(form);
            return false;
       }
    };
    console.log(element.id)
    http.send(JSON.stringify({productName : element.id}));
}

function someFunction(element) {
    console.log("in some function")
    const http = new XMLHttpRequest();
    http.open("POST", 'addProduct');
    http.responseType = "text";
    http.setRequestHeader("Content-Type", "application/json");
    let id = document.getElementById("productId").value;
    let quantity = document.getElementById("quantity").value;
    http.onload = function() {
        if (this.status == 200) {
            document.location.replace("/")
        }
    }
    http.send(JSON.stringify({productId : id, quantity : quantity}));
    console.log("in some function2");
    return false;
}

var el = document.getElementsByClassName('productImage');
for (var i=0; i < el.length; i++) {
    el.item(i).onclick = addProduct;
}