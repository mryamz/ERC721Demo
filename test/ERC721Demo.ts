import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { id, keccak256 } from "ethers/lib/utils";

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

    describe("Setting Token URI", function () {
        it("Success - Should set the token uri", async function () {
            for(var i = 0; i < 10; i++) {
                await erc721Demo.setTokenIdURI(i, id("id:" + i));
            }

            for(var i = 0; i < 10; i++) {
                expect(await erc721Demo.tokenURI(i)).to.equal("https://ipfs.io/ipfs/" + id("id:" + i));
            }
        });

        it("Failure - Should not set the token uri if not minter", async function () {
            await expect(erc721Demo.connect(addr1).setTokenIdURI(1, id("id:1"))).to.be.revertedWith("ERC721: must have minter role to set token URI");
        });

        it("Failure - Should not set the token uri if frozen", async function () {
            await erc721Demo.freezeTokenIdURI(1);
            await expect(erc721Demo.setTokenIdURI(1, id("id:1"))).to.be.revertedWith("ERC721: token URI is frozen");
        });
    });

    describe("Freezing Token URI", function () {
        it("Success - Should freeze the token uri", async function () {
            await erc721Demo.freezeTokenIdURI(1);
            expect(await erc721Demo.frozen(1)).to.equal(true);
        });

        it("Failure - Should not freeze the token uri if not minter", async function () {
            await expect(erc721Demo.connect(addr1).freezeTokenIdURI(1)).to.be.revertedWith("ERC721: must have minter role to freeze token URI");
        });
    });

    describe("Minting", function () {
        it("Success - Should mint a token", async function () {
            await erc721Demo.mint(addr1.address, 1);
            expect(await erc721Demo.balanceOf(addr1.address)).to.equal(1);
        });

        it("Failure - Should not mint a token if not minter", async function () {
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

    describe("Set Base URI", function () {
        it("Success - Should set the base uri", async function () {
            await erc721Demo.setBaseURI("https://ipfs.io/ipfs/");
            expect(await erc721Demo.baseURI()).to.equal("https://ipfs.io/ipfs/");
        });

        it("Failure - Should not set the base uri if not owner", async function () {
            await expect(erc721Demo.connect(addr1).setBaseURI("https://ipfs.io/ipfs/")).to.be.revertedWith("ERC721: must have minter role to set base URI");
        });
    });

});
