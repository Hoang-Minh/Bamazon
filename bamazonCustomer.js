var inq = require('inquirer');
var pmpt = inq.createPromptModule();

function Question(type, name, message){
    this.type = type;
    this.name = name;
    this.message = message;    
}

var questions = [
    new Question('input', 'id', "what product Id would you like to buy?"),
    new Question('input', 'quantity', "How many units of the product?")
]

pmpt(questions).then(processOrder);

// Process order
function processOrder(r){
    var orderId = r.id;
    var orderQuantity = r.quantity;

    if(orderId > 0 && orderId <=10) {        

        var mysql      = require('mysql');
        var connection = mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : 'root',
            database : 'bamazon'
        });


        connection.connect(function(err){
            if(err) throw err;
            var queryStr = "SELECT * FROM products WHERE id = " + orderId;           

            connection.query(queryStr, function(err, result){
                if(err) throw err;
                
                var stockQuantity = result[0].stock_quantity;

                if(stockQuantity < orderQuantity) {
                    console.log("Stock Quantity: " + stockQuantity + "\nOrder Quantity: " + orderQuantity + "\nInsufficient quantity!");
                    connection.end(function(err){
                        if(err) throw err;
                    })

                }else{
                    var price = orderQuantity * result[0].price;
                    var remainQuantity = stockQuantity - orderQuantity;
                    queryStr = "UPDATE products SET stock_quantity = " + remainQuantity + " WHERE id = " + orderId;
                    connection.query(queryStr, function(err, result){
                        if(err) throw err;
                        console.log("Stock Quantity: " + stockQuantity + "\nOrder Quantity: " + orderQuantity + "\nRemained Quantity: " + remainQuantity);
                        console.log("Total cost: " + price);
                    });

                    connection.end(function(err){
                        if(err) throw err;
                    })
                }
            });
        })
    }
    else{
        console.log("There is no product associated with this id.\nPlease chose id from 0 to 10");
    }

}