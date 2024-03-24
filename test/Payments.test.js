const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Payments", function () {
  let acc1;
  let acc2;
  let payments;

  beforeEach(async function () {
    [acc1, acc2] = await ethers.getSigners();
    const Payments = await ethers.getContractFactory("Payments", acc1);
    payments = await Payments.deploy();
    await payments.getDeployedCode();
    await payments.getAddress();
  });

  it("should be deployed", async function () {
    expect(await payments.getAddress()).to.be.properAddress;
  });
  it("it should have 0 ether by default", async function () {
    const balance = await payments.currentBalance();
    expect(balance).to.eq(0);
  });
  it("should be possible to send funds", async function () {
    const sum = 100;
    const msg = "hello from hardhat";
    const tx = await payments.connect(acc2).pay(msg, { value: sum });
    await expect(() => tx).to.changeEtherBalances(
      [acc2, payments],
      [-sum, sum]
    );
    const newPayment = await payments.getPayment(acc2.address, 0);
    expect(newPayment.message).to.eq(msg);
    expect(newPayment.amount).to.eq(sum);
    expect(newPayment.from).to.eq(acc2.address);
  });

  // Перевірка зміни балансу
  it("should increase contract balance after payment", async function () {
    const sum = 100;
    const msg = "hello from hardhat";
    await payments.connect(acc2).pay(msg, { value: sum });
    const newBalance = await payments.currentBalance();
    expect(newBalance).to.eq(sum);
  });

  // Перевірка повідомлення після платежу
  it("should store the message correctly after payment", async function () {
    const sum = 100;
    const msg = "hello from hardhat";
    await payments.connect(acc2).pay(msg, { value: sum });
    const newPayment = await payments.getPayment(acc2.address, 0);
    expect(newPayment.message).to.eq(msg);
  });

  // Перевірка індексу платежу
  it("should increment payment index correctly", async function () {
    const sum1 = 100;
    const sum2 = 200;
    const msg = "hello from hardhat";
    await payments.connect(acc2).pay(msg, { value: sum1 });
    await payments.connect(acc2).pay(msg, { value: sum2 });
    const payment1 = await payments.getPayment(acc2.address, 0);
    const payment2 = await payments.getPayment(acc2.address, 1);
    expect(payment1.amount).to.eq(sum1);
    expect(payment2.amount).to.eq(sum2);
  });

  // Тести на випадок конфліктів
  it("should handle concurrent payments correctly", async function () {
    const sum = 100;
    const msg = "hello from hardhat";
    const tx1 = payments.connect(acc1).pay(msg, { value: sum });
    const tx2 = payments.connect(acc2).pay(msg, { value: sum });
    await expect(tx1).to.be.fulfilled;
    await expect(tx2).to.be.fulfilled;
  });
});
