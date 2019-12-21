# Inputs

You could find in this folder the next files: 
> take_db_values_training_dimensions.js with the DB json

> examples_inputs_dimensions.txt with dimensions examples. 

## Chatito

Custom entities like 'context', 'required' and 'type' will be available at the output so you can handle this custom arguments as you want.

### NPM package

Chatito supports Node.js `>= v8.11`.

Install it with yarn or npm:
```
npm i chatito --save
```

Then create a definition file (e.g.: `trainClimateBot.chatito`) with your code.

Run the npm generator:

```
npx chatito trainClimateBot.chatito
```

The generated dataset should be available next to your definition file.

Here is the full npm generator options:
```
npx chatito <pathToFileOrDirectory> --format=<format> --formatOptions=<formatOptions> --outputPath=<outputPath> --trainingFileName=<trainingFileName> --testingFileName=<testingFileName> --defaultDistribution=<defaultDistribution> --autoAliases=<autoAliases>
```

 - `<pathToFileOrDirectory>` path to a `.chatito` file or a directory that contains chatito files. If it is a directory, will search recursively for all `*.chatito` files inside and use them to generate the dataset. e.g.: `lightsChange.chatito` or `./chatitoFilesFolder`
 - `<format>` Optional. `default`, `rasa`, `luis`, `flair` or `snips`.
 - `<formatOptions>` Optional. Path to a .json file that each adapter optionally can use
 - `<outputPath>` Optional. The directory where to save the generated datasets. Uses the current directory as default.
- `<trainingFileName>` Optional. The name of the generated training dataset file. Do not forget to add a .json extension at the end. Uses `<format>`_dataset_training.json as default file name.
- `<testingFileName>` Optional. The name of the generated testing dataset file. Do not forget to add a .json extension at the end. Uses `<format>`_dataset_testing.json as default file name.
- `<defaultDistribution>` Optional. The default frequency distribution if not defined at the entity level. Defaults to `regular` and can be set to `even`.
- `<autoAliases>` Optional. The generaor behavior when finding an undefined alias. Valid opions are `allow`, `warn`, `restrict`. Defauls to 'allow'.

### Create inputs

For each kpi execute the next line, to create its inputs with chatito:
```
npx chatito <name_kpi>.chatito
```

Example: npx chatito deals_won_v1.chatito
This execution generates the file default_dataset_training.json.

You could change the format from default_dataset_training.json to name_kpi.txt, which is compatible with AWS(Amazon Web Service).
```
node format_inputs_json_to_txt.js > <name_kpi>.txt
```

