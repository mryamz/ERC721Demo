// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/IAccessControlUpgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";



contract ERC721Demo is ERC721Upgradeable, AccessControlUpgradeable, UUPSUpgradeable {

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    string public baseURI;

    mapping(uint256 => string) public uris;

    mapping(uint256 => bool) public frozen;

    constructor() initializer {
    }

    function initialize() public initializer {
        __ERC721_init("ERC721 Demo", "ERC721");
        __AccessControl_init();
        __UUPSUpgradeable_init();
        // setup roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        // only DEFAULT_ADMIN_ROLE can grant MINTER_ROLE
        _setRoleAdmin(MINTER_ROLE, DEFAULT_ADMIN_ROLE);
    }

    /// @dev Mints a new token.
    /// @param to The address that will own the minted token.
    /// @param tokenId The token id to mint.
    function mint(address to, uint256 tokenId) public {
        require(hasRole(MINTER_ROLE, _msgSender()), "ERC721: must have minter role to mint");
        _mint(to, tokenId);
    }

    /// @dev updates the token URI
    /// @param tokenId The token id to update.
    /// @param _tokenURI The new token URI.
    function setTokenIdURI(uint256 tokenId, string memory _tokenURI) public {
        require(hasRole(MINTER_ROLE, _msgSender()), "ERC721: must have minter role to set token URI");
        require(!frozen[tokenId], "ERC721: token URI is frozen");
        uris[tokenId] = _tokenURI;
    }

    /// @dev freezes the token URI from being updated
    /// @param tokenId The token id to freeze.
    function freezeTokenIdURI(uint256 tokenId) public {
        require(hasRole(MINTER_ROLE, _msgSender()), "ERC721: must have minter role to freeze token URI");
        frozen[tokenId] = true;
    }

    /// @dev See {IERC165-supportsInterface}.
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Upgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /// @dev Sets the base URI for all token IDs
    /// @param _baseURI The new base URI
    function setBaseURI(string memory _baseURI) public {
        require(hasRole(MINTER_ROLE, _msgSender()), "ERC721: must have minter role to set base URI");
        baseURI = _baseURI;
    }

    /// @dev See {IERC721Metadata-tokenURI}.
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    /// @dev See {IERC721Metadata-tokenURI}.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return string.concat(_baseURI(), uris[tokenId]);
    }

    /// @dev Logic for controlling the upgradeability of the contract
    function _authorizeUpgrade(address) internal override {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "ERC721: must have admin role to upgrade");
    }

    /// @dev Burns a token.
    function burn(uint256 tokenId) public {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not owner nor approved");
        _burn(tokenId);
    }
}
