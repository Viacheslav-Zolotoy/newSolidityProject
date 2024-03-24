// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Payments2 {
    address owner;

    event Paid(address indexed _from, uint _amount, uint _timestamp);

    constructor() {
        owner = msg.sender;
    }
    receive() external payable {
        pay();
    }
    function pay() public payable {
        emit Paid(msg.sender, msg.value, block.timestamp);
    }

    // address demoAddr; // 00000000000000
    modifier onlyOwner(address _to) {
        require(msg.sender == owner, "you are not an owner!");
        require(_to != address(0), "incorect address");
        _; //вийти та почати виконувати код функції !!!
    }

    function withdraw(address payable _to) external onlyOwner(_to) {
        // assert(msg.sender == owner);
        // require(msg.sender == owner, "you are not an owner!"); або onlyOwner
        //require === if
        _to.transfer(address(this).balance);
    }
}
