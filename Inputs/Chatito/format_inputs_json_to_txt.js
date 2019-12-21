//Read json file, then return the string to train inputs in AWS.
const fs = require('fs')
fs.readFile('./default_dataset_training.json', 'utf8', (err, jsonString) => {
    if (err) {
        console.log("Error reading file from disk:", err)
        return
    }
    try {
        const customer = JSON.parse(jsonString);
        for (var i = 0; i < customer.inputs.length; ++i) {
            input = '';
            customer.inputs[i].forEach(element => {
                if (element.type == 'Text') {
                    input += element.value;
                }
                else {
                    input += element.value + ' {' + element.slot + '}';
                }
            });
            input = '"' + input + '",';
            console.log(input)
        }
    } catch (err) {
        console.log('Error parsing JSON string:', err)
    }
})