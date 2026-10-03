// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// STAGE 1: authenticity is checked off-chain by the SDK; this
// contract does not verify any proof. On-chain verification is Stage 2.
/// @title Receipts Only Stage 1 review log
/// @notice Anyone can call directly with an arbitrary nullifier; SDK checks are not enforced here.
contract ReceiptsReviews {
  /// @notice Rating must be between one and five.
  error InvalidRating();
  /// @notice Review bytes must not be empty.
  error ReviewEmpty();
  /// @notice Review exceeds the 1120-byte contract limit.
  error ReviewTooLong();
  /// @notice Merchant ID must not be zero.
  error InvalidMerchant();
  /// @notice Nullifier must not be zero.
  error InvalidNullifier();
  /// @notice A nullifier may only be used once.
  error NullifierAlreadyUsed();
  /// @notice The requested review ID does not exist.
  error ReviewNotFound();

  /// @notice Compact record; full text is stored only in ReviewPosted events.
  struct Review {
    bytes32 merchantId;
    uint8 rating;
    uint64 postedAt;
    bytes32 textHash;
  }
  struct Stats {
    uint128 count;
    uint128 ratingSum;
  }
  mapping(uint256 => Review) private reviews;
  mapping(bytes32 => Stats) private stats;
  mapping(bytes32 => bool) private used;
  /// @notice Total number of reviews; IDs start at one.
  uint256 public reviewCount;

  /// @notice Public, permanent review text and the nullifier used for this post.
  event ReviewPosted(
    uint256 indexed reviewId,
    bytes32 indexed merchantId,
    bytes32 indexed nullifier,
    uint8 rating,
    string text,
    uint64 postedAt
  );

  /// @notice Append a review. Does not verify an email, signature, or proof.
  /// @param nullifier Caller-supplied one-use identifier, not an authenticity proof.
  /// @param merchantId Caller-supplied merchant identifier.
  /// @param rating Integer rating from one to five.
  /// @param text Public review text, one to 1120 UTF-8 bytes.
  /// @return reviewId Newly assigned one-based ID.
  function postReview(
    bytes32 nullifier,
    bytes32 merchantId,
    uint8 rating,
    string calldata text
  ) external returns (uint256 reviewId) {
    if (rating < 1 || rating > 5) revert InvalidRating();
    if (bytes(text).length == 0) revert ReviewEmpty();
    if (bytes(text).length > 1120) revert ReviewTooLong();
    if (merchantId == bytes32(0)) revert InvalidMerchant();
    if (nullifier == bytes32(0)) revert InvalidNullifier();
    if (used[nullifier]) revert NullifierAlreadyUsed();
    used[nullifier] = true;
    reviewId = ++reviewCount;
    uint64 postedAt = uint64(block.timestamp);
    reviews[reviewId] = Review(
      merchantId,
      rating,
      postedAt,
      keccak256(bytes(text))
    );
    Stats storage merchant = stats[merchantId];
    merchant.count += 1;
    merchant.ratingSum += rating;
    emit ReviewPosted(reviewId, merchantId, nullifier, rating, text, postedAt);
  }

  /// @notice Read compact data; rejects nonexistent IDs.
  function getReview(uint256 reviewId) external view returns (Review memory) {
    if (reviewId == 0 || reviewId > reviewCount) revert ReviewNotFound();
    return reviews[reviewId];
  }
  /// @notice Return count and rating sum; unknown merchants return zeroes.
  function merchantStats(
    bytes32 merchantId
  ) external view returns (uint128 count, uint128 ratingSum) {
    Stats storage merchant = stats[merchantId];
    return (merchant.count, merchant.ratingSum);
  }
  /// @notice Return whether a caller-supplied nullifier has already been consumed.
  function isNullifierUsed(bytes32 nullifier) external view returns (bool) {
    return used[nullifier];
  }
}
