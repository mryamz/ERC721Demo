import { ethers, upgrades } from "hardhat";

async function main() {
  // deploy proxy using upgrades plugin
  const ERC721Demo = await ethers.getContractFactory("ERC721Demo");
  const erc721Demo = await upgrades.deployProxy(ERC721Demo, [], {
     initializer: 'initialize',
     unsafeAllow: ['constructor']
    });
  await erc721Demo.deployed();


  console.log("ERC721Demo deployed to:", erc721Demo.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
