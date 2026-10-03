// Measure actual receipt gas rather than estimating or inventing benchmarks.
import { expect } from "chai";
import { ethers } from "hardhat";
describe("gas", () => {
  it("reports deployment and post gas for first/repeat merchants", async () => {
    const c = await ethers.deployContract("ReceiptsReviews");
    const deployment = await c.deploymentTransaction()!.wait();
    console.log(`GAS deployment=${deployment!.gasUsed}`);
    for (const [index, text] of [
      "x",
      "a".repeat(280),
      "🍜".repeat(280),
    ].entries()) {
      const receipt = await (
        await c.postReview(
          ethers.id(`gas-${index}`),
          ethers.id("gas merchant"),
          5,
          text,
        )
      ).wait();
      console.log(
        `GAS postReview bytes=${Buffer.byteLength(text)} gas=${receipt!.gasUsed}`,
      );
      expect(receipt!.gasUsed).to.be.lessThan(300_000n);
    }
  });
});
