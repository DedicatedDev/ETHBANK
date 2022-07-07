# Analysis
In requirements of a test, creation account has to be implemented in wallet app(ethereum-enabled frontend application: site or mobile app). 

Because of time limit, only implemented minimum requirements. 
Additionally, can add security check setting and consider optimize problem combine byte code and can refactor events for logging ...
Also storage contract optimize problem ...  

And then, it is good to use various testnet for confirmation but most testing is just to use mainnet forking. 
It implemented in hardhat configuration.

# Contract build
- yarn build 

# Contract Test 
- yarn test 

# Deploy Contract
- yarn deploy:<network name>
  supported network: you can find detailed command in package.json script part. 

# Upgrade Contract
- yarn upgrade:<network name>

# Note 
Before run project, need to setup .env file based on .env.example. 
Default account info is just first account of hardhat test accounts. 
Also need to setup infura key. 
