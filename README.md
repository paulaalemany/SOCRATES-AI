# SOCRATES-AI

![GitHub Logo](/Components.png)

Description: Chatbot ...

## Inputs

Description: Inputs ...

## AmazonLEX

First of all, you need to login in AWS Console. Once that, just search lex on the browser.
![Screenshot](/AmazonLEX/images/home.png)

***Before that, its extremly important create the Lambda function with the .zip included in /AmazonLEX/Lambda and modify the "uri" with the new arn for each intent (KPI). If not, you probably won't be able to import it. In this case, it corresponds with the lines 16 and 1603 of the ClaribaChatbot.json file***

If you want to create your own lambda function, it's important have a "handler" named functions inside the index file or have coherence between your code and the definition of Lambda.
![Screenshot](/AmazonLEX/images/lambda.png)

Inside Lambda you will select or create a role with the proper permissions and modify the timeout according to your needs
![Screenshot](/AmazonLEX/images/lambda_roltimeout.png)

To be able to execute this lambda function you will need definde a new role of execution including some policies (permissions). The included role in the screenshot is a bad security example, we just add all that we need to run tests without problems.
![Screenshot](/AmazonLEX/images/rol.png)

Inside LEX there are 3 sections: Bots, Intents and Slots. If we begin, then we have to create a bot from 0. If not (as this case) you can import an implemented bot included in /AmazonLEX/Bot. 

![Screenshot](/AmazonLEX/images/bots.png)

If we need to import new intents, following the format os the provided samples, you just have to replace the Lambda uri with the correct arn and include the new set of samples utterances before import it. (Care with version number, sometimes we try to upload a new version without updating the number on .json file)
![Screenshot](/AmazonLEX/images/Intent.png)

Slots follows the same idea.
![Screenshot](/AmazonLEX/images/slot.png)

To sum up, if we can import the entire bot just if we previously create the Lambda function, his role and update the uri on bot.json definition file. If not, create a new bot from 0 and follow the intents samples files provided to add new kinds of questions but don't forget to update the lambda uri before importing it.


![Screenshot](/AmazonLEX/images/Sample_utterances.png)
![Screenshot](/AmazonLEX/images/Intent_description.png)
![Screenshot](/AmazonLEX/images/slot_description.png)



## ClabotAPI  
 