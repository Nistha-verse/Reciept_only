// Contract boundary, event integrity, replay, and randomized aggregate tests.
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { randomBytes } from "node:crypto";
async function fixture() {
  const c = await ethers.deployContract("ReceiptsReviews");
  const [first, second] = await ethers.getSigners();
  return {
    c,
    first,
    second,
    n: ethers.id("receipt"),
    m: ethers.id("merchant"),
  };
}
describe("ReceiptsReviews", () => {
  it("posts exact event fields and compact state", async () => {
    const { c, n, m } = await loadFixture(fixture);
    const stamp = (await time.latest()) + 1;
    await time.setNextBlockTimestamp(stamp);
    await expect(c.postReview(n, m, 4, "Good food"))
      .to.emit(c, "ReviewPosted")
      .withArgs(1, m, n, 4, "Good food", stamp);
    expect(await c.reviewCount()).to.equal(1);
    expect(await c.getReview(1)).to.deep.equal([
      m,
      4n,
      BigInt(stamp),
      ethers.id("Good food"),
    ]);
    expect(await c.merchantStats(m)).to.deep.equal([1n, 4n]);
    expect(await c.isNullifierUsed(n)).to.equal(true);
  });
  for (const rating of [0, 1, 5, 6])
    it(`rating ${rating}`, async () => {
      const { c, n, m } = await loadFixture(fixture);
      const tx = c.postReview(n, m, rating, "x");
      if (rating === 0 || rating === 6)
        await expect(tx).to.be.revertedWithCustomError(c, "InvalidRating");
      else await expect(tx).to.emit(c, "ReviewPosted");
    });
  for (const length of [0, 1, 280, 1120, 1121])
    it(`text bytes ${length}`, async () => {
      const { c, n, m } = await loadFixture(fixture);
      const tx = c.postReview(n, m, 5, "a".repeat(length));
      if (!length)
        await expect(tx).to.be.revertedWithCustomError(c, "ReviewEmpty");
      else if (length > 1120)
        await expect(tx).to.be.revertedWithCustomError(c, "ReviewTooLong");
      else await expect(tx).to.emit(c, "ReviewPosted");
    });
  it("accepts 280 four-byte codepoints", async () => {
    const { c, n, m } = await loadFixture(fixture);
    await expect(c.postReview(n, m, 5, "🍜".repeat(280))).to.emit(
      c,
      "ReviewPosted",
    );
  });
  it("rejects zero merchant, zero nullifier, and nonexistent IDs", async () => {
    const { c, n, m } = await loadFixture(fixture);
    await expect(
      c.postReview(n, ethers.ZeroHash, 5, "x"),
    ).to.be.revertedWithCustomError(c, "InvalidMerchant");
    await expect(
      c.postReview(ethers.ZeroHash, m, 5, "x"),
    ).to.be.revertedWithCustomError(c, "InvalidNullifier");
    for (const id of [0, 1, 999])
      await expect(c.getReview(id)).to.be.revertedWithCustomError(
        c,
        "ReviewNotFound",
      );
  });
  it("preserves check ordering", async () => {
    const { c } = await loadFixture(fixture);
    await expect(
      c.postReview(ethers.ZeroHash, ethers.ZeroHash, 0, ""),
    ).to.be.revertedWithCustomError(c, "InvalidRating");
    await expect(
      c.postReview(ethers.ZeroHash, ethers.ZeroHash, 1, ""),
    ).to.be.revertedWithCustomError(c, "ReviewEmpty");
  });
  it("blocks reuse by the same or a different account without changing state", async () => {
    const { c, n, m, second } = await loadFixture(fixture);
    await c.postReview(n, m, 3, "first");
    await expect(c.postReview(n, m, 5, "again")).to.be.revertedWithCustomError(
      c,
      "NullifierAlreadyUsed",
    );
    await expect(
      c.connect(second).postReview(n, ethers.id("other"), 5, "again"),
    ).to.be.revertedWithCustomError(c, "NullifierAlreadyUsed");
    expect(await c.reviewCount()).to.equal(1);
  });
  it("keeps separate merchant statistics", async () => {
    const { c, n, m } = await loadFixture(fixture);
    await c.postReview(n, m, 1, "one");
    const other = ethers.id("other");
    await c.postReview(ethers.id("two"), other, 5, "two");
    expect(await c.merchantStats(m)).to.deep.equal([1n, 1n]);
    expect(await c.merchantStats(other)).to.deep.equal([1n, 5n]);
  });
  it("200 random valid posts preserve aggregate invariants after every post", async () => {
    const { c } = await loadFixture(fixture);
    const merchants = Array.from({ length: 4 }, (_, i) =>
      ethers.id(`merchant-${i}`),
    );
    const counts = [0n, 0n, 0n, 0n],
      sums = [0n, 0n, 0n, 0n];
    for (let i = 0; i < 200; i++) {
      const random = randomBytes(2),
        merchant = random[0] % 4,
        rating = 1 + (random[1] % 5);
      await c.postReview(
        ethers.hexlify(randomBytes(32)),
        merchants[merchant],
        rating,
        `Review ${i}`,
      );
      counts[merchant]++;
      sums[merchant] += BigInt(rating);
      for (let j = 0; j < 4; j++)
        expect(await c.merchantStats(merchants[j])).to.deep.equal([
          counts[j],
          sums[j],
        ]);
      expect(await c.reviewCount()).to.equal(
        counts.reduce((a, b) => a + b, 0n),
      );
    }
  });
});
