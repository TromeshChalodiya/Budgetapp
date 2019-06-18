//Budget Controller
var budgetController = (function() {
    /*Here we are using function constructor 
    expense in capital letter as Expense */

    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percantage = -1;
    };

    Expense.prototype.calcPercantages = function(totalIncome){

        if(totalIncome > 0){
            this.percantage = Math.round((this.value / totalIncome) * 100);
        }
        else{
            this.percantage = -1;
        }
    }

    Expense.prototype.getPercantages = function(){
        return this.percantage;
    }

    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;

        //we are using tye loop over an array so we are using forEach loop
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;//this function will store the income and expenses
    }

    /*User put 10 income so we create an empty array
    to store all data and this is called a Global data model*/

    var data = {
        allItems : {
        exp : [],//this both array are store instances 
        inc : []
        },
        totals : {
            exp : 0,
            inc : 0
        },
        budget : 0,   //to store the budget data
        percantage : -1  //that means no value exist at this point for showing the percantage info
    };

    return {
        addItem: function(type, des, val) {

            var newItem,ID;
           //[1 2 3 4 5], next ID = 6
           //[1 2 4 6 8]next ID = 9
           // ID = last ID + 1
           //we are going to print here the last id number

           //create ID
           if(data.allItems[type].length > 0){

                 ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
           }else {
               ID = 0;
           }
           //create newItem based on 'exp' and 'inc'
           if(type === 'exp'){
             newItem = new Expense(ID, des, val);
           }else if(type === 'inc'){
             newItem = new Income(ID, des, val);
           }
           
        //Push it into our data structure
        data.allItems[type].push(newItem);

        //return the new element
        return newItem;

      },

      deleteItem: function(type, id){

        var ids, index;

        ids = data.allItems[type].map(function(current){
            return current.id;
        });

        index = ids.indexOf(id);

        if(index !== -1) {
            data.allItems[type].splice(index, 1);
        }

      },

      calculateBudget: function() {

        //1. calculate total income and expenses 
        calculateTotal('exp');
        calculateTotal('inc');

        //2.calculate the budget = income - expenses
        data.budget = data.totals.inc - data.totals.exp;

        //3. calculate the percantage of the income that we spent 

        if(data.totals.inc > 0){
        data.percantage = Math.round((data.totals.exp / data.totals.inc) * 100);
        }else{
            data.percantage = -1;
        }
        
      },

      calculatePercantages: function(){

        data.allItems.exp.forEach(function(cur){
            cur.calcPercantages(data.totals.inc);
        })
      },

      getPercantage: function(){

        var allPerca = data.allItems.exp.map(function(cur){
            return cur.getPercantages();
        });
        return allPerca;
      },

      getBudget: function() {
          return {
              budget : data.budget,
              totalInc : data.totals.inc,
              totalExp : data.totals.exp,
              percantage : data.percantage  
          };
      },

      testing : function() {
          console.log(data);
      }
    };

})();
 

//UI CONTROLLER
var UIController = (function() {  
     
    var DOMstrings = {
        inputType : '.add__type',
        inputDescription : '.add__description', 
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percantageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel:'.item__percentage',
        dateLabel:'.budget__title--month'
    };

    var formatNumber = function(num, type){

        var numSplit, int, dec;
        /*
        + or - before number
        exactly 2 decimal points
        comma seprating the thousands
        */

        //here abs means absolute value
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        if(int.length > 3 || int.length > 4){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };


    var nodeListForEach = function(list, callback){
        for(var i = 0; i < list.length; i++){
            callback(list[i],i);
        }
    };


    return {
        getinput: function() {

            return{//this is our method to returning all the inputs that we call it in

                type : document.querySelector(DOMstrings.inputType).value,//will be either income or expense
                description : document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {

            var html, newHtml, element;
            //create HTML string with placeholder text

            if(type === 'inc'){
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type === 'exp'){
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //Replace the placeholder text with some actual data

            newHtml = html.replace('%id%', obj.id);//id property hold the property of all the id number like this.id = id
            newHtml = newHtml.replace('%description%', obj.description);//in this line if you are using html.replace then it won't work because it will write the same %id%
            newHtml = newHtml.replace('%value%',formatNumber(obj.value, type));


            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);

        },

        deleteListItem: function(selectorID){
            
            var el;

            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget : function(obj) {
            /*below line we have to change only the value of the budget label, income label and expense label etc.
            whichever given in numeric format
            */

            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent =  formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent =  formatNumber(obj.totalExp, 'exp');
            

            if(obj.percantage > 0) {
                document.querySelector(DOMstrings.percantageLabel).textContent = obj.percantage + '%';
            }
            else{
                document.querySelector(DOMstrings.percantageLabel).textContent = '0' + '%';
            }

        },

        displayPercantages: function(percanatge){

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            /*

            line no:- 277 to 291 we have used first call function:passing function as an argument

            */

            nodeListForEach(fields, function(current, index){

                if(percanatge[index] > 0){
                    current.textContent = percanatge[index] + '%';
                }
                else{
                    current.textContent = '---';
                }
            });

        },

        displayMonth: function(){

            var now, months, month, year;

            now = new Date();

            months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function(){

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + 
                DOMstrings.inputDescription + ',' + 
                DOMstrings.inputValue);

                nodeListForEach(fields, function(cur){

                    cur.classList.toggle('red-focus'); 
                });

                document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function() {//here we are exposing the DOMstrings in the public
            //So we can use them outside this module
            return DOMstrings;
        }
    };

})();



//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

    /*here we are create a function called set up eventlistner
    in this function all eventllistner are placed.
    */

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress',function(event) {
            
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  
    };

    var updateBudget = function() {
        
        //1. Calculate the budget
        budgetCtrl.calculateBudget();

        //2. Return the Budget
        var budget = budgetCtrl.getBudget();

        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }

    var updatePercantages = function(){

        //1. Calculate percantages
        budgetCtrl.calculatePercantages();

        //2. Read the percantages from the budget controller
        var percantage = budgetCtrl.getPercantage();

        //3. Update the UI with new percantages
        UICtrl.displayPercantages(percantage);
    }
    

    var ctrlAddItem = function() {

        var input, newItem;

        //1. Get the filed input data
        input = UICtrl.getinput();

        if(input.description !== '' && !isNaN(input.value) && input.value > 0){
    
        //2. add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        //3.Add the item to the UI
        UICtrl.addListItem(newItem, input.type);

        //4. Clear the fields
        UICtrl.clearFields();
        
        //5. Calculate and update the budget
        updateBudget();

        //6.Update the UI with new percantages
        updatePercantages();
        }

    };

    var ctrlDeleteItem = function(event){

        var itemId, splitId, type, ID;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemId) {


            //inc-1 there is method in the js call all string has access to and that is called a split
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);

            //1.delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //2 Delete the item from the UI
            console.log(itemId);
            UICtrl.deleteListItem(itemId);
            
            //3 Update and show the new budget
            updateBudget();

            //4.Update the UI with new percantages
            updatePercantages();
        }
    };

    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget : 0.0,
                totalInc : 0.0,
                totalExp : 0.0,
                percantage : -1  
               });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();