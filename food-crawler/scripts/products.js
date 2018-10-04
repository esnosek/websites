function addProduct(element) {
    const http = new XMLHttpRequest();
    http.open("POST", 'product/search');
    http.responseType = "text";
    http.setRequestHeader("Content-Type", "application/json");
    http.onload = function() {
        if (this.status == 200) {
            document.getElementById("products").innerHTML = "";
            const json = JSON.parse(http.responseText);
            const table = document.getElementById("productInfoTable");
            const caption = document.createElement("caption");
            const captionText = document.createTextNode(json.productName);
            caption.appendChild(captionText);
            table.appendChild(caption)
            for(let p in json.nutritionalValues){
                const tr = document.createElement("tr");
                const key = document.createTextNode(p)
                const value = document.createTextNode(json.nutritionalValues[p])
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
            form.setAttribute("action", "addProduct");
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
            hiddenInput.setAttribute("type", "hidden");
            hiddenInput.setAttribute("name", "productName");
            hiddenInput.setAttribute("value", json.productName);

            form.appendChild(textInput);
            form.appendChild(button);
            form.appendChild(hiddenInput);

            document.getElementById("productInfo").appendChild(form);
       }
    };
    http.send(JSON.stringify({productName : element.innerText, quantity : 100}));
}
