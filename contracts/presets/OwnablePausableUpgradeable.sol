// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "../interface/IOwnablePausable.sol";

/**
 * @title OwnablePausableUpgradeable
 *
 * @dev Bundles Access Control, Pausable and Upgradeable contracts in one.
 *
 */
abstract contract OwnablePausableUpgradeable is
    IOwnablePausable,
    PausableUpgradeable,
    AccessControlUpgradeable
{
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    uint256 public paginationSize;

    /**
     * @dev Modifier for checking whether the caller is an admin.
     */
    modifier onlyAdmin() {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "OwnablePausable: access denied"
        );
        _;
    }

    /**
     * @dev Modifier for checking whether the caller is a pauser.
     */
    modifier onlyPauser() {
        require(
            hasRole(PAUSER_ROLE, msg.sender),
            "OwnablePausable: access denied"
        );
        _;
    }

    // solhint-disable-next-line func-name-mixedcase
    function __OwnablePausableUpgradeable_init(address _admin)
        internal
        initializer
    {
        __Context_init_unchained();
        __AccessControl_init_unchained();
        __Pausable_init_unchained();
        __OwnablePausableUpgradeable_init_unchained(_admin);
        paginationSize = 100;
    }

    /**
     * @dev Grants `DEFAULT_ADMIN_ROLE`, `PAUSER_ROLE` to the admin account.
     */
    // solhint-disable-next-line func-name-mixedcase
    function __OwnablePausableUpgradeable_init_unchained(address _admin)
        internal
        initializer
    {
        _setupRole(DEFAULT_ADMIN_ROLE, _admin);
        _setupRole(PAUSER_ROLE, _admin);
    }

    /**
     * @dev See {IOwnablePausable-isAdmin}.
     */
    function isAdmin(address _account) external view override returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, _account);
    }

    /**
     * @dev See {IOwnablePausable-addAdmin}.
     */
    function addAdmin(address _account) public override {
        grantRole(DEFAULT_ADMIN_ROLE, _account);
    }

    /**
     * @dev See {IOwnablePausable-removeAdmin}.
     */
    function removeAdmin(address _account) public override {
        revokeRole(DEFAULT_ADMIN_ROLE, _account);
    }

    /**
     * @dev See {IOwnablePausable-isPauser}.
     */
    function isPauser(address _account) external view override returns (bool) {
        return hasRole(PAUSER_ROLE, _account);
    }

    /**
     * @dev See {IOwnablePausable-addPauser}.
     */
    function addPauser(address _account) external override {
        grantRole(PAUSER_ROLE, _account);
    }

    /**
     * @dev See {IOwnablePausable-removePauser}.
     */
    function removePauser(address _account) external override {
        revokeRole(PAUSER_ROLE, _account);
    }

    /**
     * @dev See {IOwnablePausable-pause}.
     */
    function pause() external override onlyPauser {
        _pause();
    }

    /**
     * @dev See {IOwnablePausable-unpause}.
     */
    function unpause() external override onlyPauser {
        _unpause();
    }
}
