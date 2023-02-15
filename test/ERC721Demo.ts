import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("ERC721 Demo", function () {

    let erc721Demo: any;
    let owner: any;
    let addr1: any;
    let addr2: any;
    let addrs: any;

    beforeEach(async function () {
        const ERC721Demo = await ethers.getContractFactory("ERC721Demo");
        erc721Demo = await upgrades.deployProxy(ERC721Demo, [], {
            initializer: 'initialize',
            unsafeAllow: ['constructor']
        });
        await erc721Demo.deployed();

        // set base uri
        await erc721Demo.setBaseURI("https://ipfs.io/ipfs/");

        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    });

    describe("Deployment", function () {
        it("Success - Should set the right owner and base uri", async function () {
            expect(await erc721Demo.hasRole(await erc721Demo.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
            expect(await erc721Demo.hasRole(await erc721Demo.MINTER_ROLE(), owner.address)).to.equal(true);
            expect(await erc721Demo.baseURI()).to.equal("https://ipfs.io/ipfs/");
        });
    });

    describe("Minting", function () {
        it("Success - Should mint a token", async function () {
            await erc721Demo.mint(addr1.address, 1);
            expect(await erc721Demo.balanceOf(addr1.address)).to.equal(1);
        });

        it("Failure - Should not mint a token if not owner", async function () {
            await expect(erc721Demo.connect(addr1).mint(addr1.address, 1)).to.be.revertedWith("ERC721: must have minter role to mint");
        });
    });

    describe("Transferring", function () {
        it("Success - Should transfer a token", async function () {
            await erc721Demo.mint(addr1.address, 1);
            await erc721Demo.connect(addr1).approve(addr2.address, 1);
            await erc721Demo.connect(addr2).transferFrom(addr1.address, addr2.address, 1);
            expect(await erc721Demo.balanceOf(addr1.address)).to.equal(0);
            expect(await erc721Demo.balanceOf(addr2.address)).to.equal(1);
        });

        it("Failure - Should not transfer a token if not approved", async function () {
            await erc721Demo.mint(addr1.address, 1);
            await expect(erc721Demo.connect(addr2).transferFrom(addr1.address, addr2.address, 1)).to.be.revertedWith("ERC721: caller is not token owner or approved");
        });
    });

    describe("Burning", function () {
        it("Success - Should burn a token", async function () {
            await erc721Demo.mint(addr1.address, 1);
            await erc721Demo.connect(addr1).burn(1);
            expect(await erc721Demo.balanceOf(addr1.address)).to.equal(0);
        });

        it("Failure - Should not burn a token if not owner", async function () {
            await erc721Demo.mint(addr1.address, 1);
            await expect(erc721Demo.connect(addr2).burn(1)).to.be.revertedWith("ERC721: caller is not owner nor approved");
        });
    });

});
