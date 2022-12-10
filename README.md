# lamb-cli

## quick-start

### Installation

via NPM:
```bash
npm install -g lamb-cli
```

via yarn:
```bash
yarn global add lamb-cli
```

via pnpm:
```bash
pnpm add -g lamb-cli
```

or.
You can use through npx or pnpx or yarn
`npx lamb-cli add`

Note: If you don’t already have Node on your machine, [install it first](https://nodejs.org/)

### Getting started

To add a lambda function, run the command below and follow the prompts:

```bash
# Add exiting lambda function to update
lamb-cli add
```

`add` command will ask you couple of questions:

1. **Name** : Give a semantic name to find your function in your local project
2. **Function ARN** : Copy the arn from the aws-console
3. **Function Region** : Copy the region name from aws-console
4. **Entry File Path** : Put the absolute or relative path of the entry file (can be ts or js)

eg.

```

? Function Name: test-fn
? Function ARN: arn:aws:lambda:<region>:<id>:function:<name>
? Function Region: ap-south-1
? Entry file path: src/main.ts

```

To update a function to the server, run the command below and follow the prompts:

```bash
# Build and push the lambda function
lamb-cli push
```

`push` will ask you to choose from the added functions


```bash
# Create a lambda function along with necessary role
lamb-cli create
```



```bash
# delete the generated function and the role from the server
lamb-cli delete
```



