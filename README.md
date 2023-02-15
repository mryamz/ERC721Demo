# Sample ERC721 NFT Project

## Setup
```shell
npm install
npx hardhat test
```

## Deploy
```shell
npx hardhat run ./scripts/deploy.ts --network <name>
```

## Proxy Choice
ERC1967Proxies are the direction the market is moving. They are the predecessor to Transparent Proxies. UUPS allows better structured upgrade logic. There is also more infra that help devs deploy UUPS proxies and check for unsafe upgrades.

## Unkowns
- What is track burning?
- Why should URI be a function of tokenId and address?