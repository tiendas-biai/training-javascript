// Block 1 exhibit: account operations in a concurrent server.
// This mirrors the reported Karat task: "Class BankAccount with functions
// working with account balance. It runs in a multi-threaded environment.
// Figure out all issues within the methods."
// Run it: node bankAccount.js — watch the balance go wrong.

class BankAccount {
  constructor(balance) {
    this.balance = balance;
  }

  async getBalance() {
    await sleep(10); // simulates a DB read
    return this.balance;
  }

  async setBalance(value) {
    await sleep(10); // simulates a DB write
    this.balance = value;
  }

  async withdraw(amount) {
    const balance = await this.getBalance();
    if (balance >= amount) {
      await this.setBalance(balance - amount);
      return true;
    }
    return false;
  }

  async addInterest(rate) {
    const balance = await this.getBalance();
    await this.setBalance(balance * (1 + rate));
  }

  async transferTo(other, amount) {
    try {
      await this.withdraw(amount);
      await other.deposit(amount);
    } catch (e) {
      // never mind
    }
  }

  async deposit(amount) {
    const balance = await this.getBalance();
    await this.setBalance(balance + amount);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  // 1) Two concurrent withdrawals of 80 from a balance of 100:
  const account = new BankAccount(100);
  const results = await Promise.all([account.withdraw(80), account.withdraw(80)]);
  console.log('withdraw results:', results); // [true, true] ?!
  console.log('balance after both:', await account.getBalance()); // 20, not -60 rejected

  // 2) Interest on a float balance:
  const savings = new BankAccount(0.1);
  await savings.deposit(0.2);
  console.log('0.1 + 0.2 deposited:', await savings.getBalance()); // 0.30000000000000004

  // 3) transferTo: withdraw can "fail" by returning false — money appears:
  const poor = new BankAccount(10);
  const rich = new BankAccount(0);
  await poor.transferTo(rich, 50);
  console.log('poor:', await poor.getBalance(), 'rich:', await rich.getBalance());
  // poor: 10, rich: 50 — 50 was created out of thin air
}

main();
