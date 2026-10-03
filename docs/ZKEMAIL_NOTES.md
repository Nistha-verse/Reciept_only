# zk-email Notes

## Sources checked

- Official docs: <https://docs.zk.email/zk-email-sdk/setup>
- Blueprint registry docs: <https://docs.zk.email/zk-email-sdk/registry>
- Blueprint creation docs: <https://docs.zk.email/zk-email-sdk/create-blueprint>
- Verifier setup docs: <https://docs.zk.email/zk-email-verifier/setup>
- Official SDK demo: <https://github.com/zkemail/sdk-ts-demo>
- Official verifier repository: <https://github.com/zkemail/zk-email-verify>
- Official SDK repository: <https://github.com/zkemail/zk-email-sdk-js>

The documentation pages were fetched on 2026-10-03. The registry/conductor API was also queried directly without transmitting an email.

## Package versions

The current Blueprint SDK package is:

```text
@zk-email/sdk      2.0.11
```

The installed package declares these relevant runtime dependencies:

```text
@zk-email/relayer-utils 0.4.67-alpha.1
@zk-email/zkemail-nr    1.3.3-3
@zk-email/snarkjs       ^0.0.1
snarkjs                 ^0.7.5
viem                    ^2.21.53
zod                     ^3.23.8
```

The legacy verifier documentation names `@zk-email/helpers`, `@zk-email/circuits`, and `@zk-email/contracts`; the current Blueprint SDK is the documented package for new integrations. The SDK package is isolated behind the future `zkEmailProvider.ts` adapter.

## Chosen proving path

The only acceptable path for this product is local proving in the browser. The current SDK exposes:

```ts
const sdk = initZkEmailSdk();
const blueprint = await sdk.getBlueprint("owner/circuit@vN");
const prover = blueprint.createProver({ isLocal: true });
const proof = await prover.generateProof(rawEmail, externalInputs, { noirWasm });
```

The official demo initializes Noir WASM with `@zk-email/sdk/initNoirWasm`. The current SDK's local prover creates a browser `Worker`, downloads the compiled circuit assets, and never requires a server-side proof request. The default `generateProof()` path can use the remote conductor, so it must not be used here.

The official demo repository states Node.js 20+ and documents local Noir WASM initialization. No browser binary is installed in this WSL environment, so the browser proving step could not be executed in this phase.

## External input support

External inputs are explicitly supported by the current Blueprint Registry and SDK. The official creation guide has an **External Inputs** section, and the installed SDK's `IProver.generateProof` signature is:

```ts
  eml: string,
  externalInputs?: ExternalInputInput[],
  options?: GenerateProofOptions,
): Promise<Proof>
```

The SDK passes external inputs into circuit input generation and includes them in the proof request. Therefore, a review-binding field can be modeled as an external input at the blueprint level. This does not yet prove that a specific compiled Zomato blueprint exposes the binding in the required public signal order; that requires a successfully compiled blueprint and proof.

## Public-signal layout

No trustworthy project-specific layout was found yet. The current SDK's generic Circom helpers establish only that public output index `0` is treated as the public-key hash and indices `1` and `2` are used to form the header hash. Blueprint-specific extracted fields and external inputs are additional circuit outputs and must be read from the compiled blueprint metadata/proof, not guessed. Consequently, `SignalLayout.sol` and the TypeScript mirror remain intentionally unimplemented.

## DKIM registry and verifier

The official docs confirm that a blueprint specifies the DKIM sender domain from the email's `DKIM-Signature: d=` field and that the Registry compiles a verifier contract for the blueprint. The exact current Solidity package interfaces, deployed registry address, and verifier public-input ordering were not safely inferable from the unavailable registry response; these remain Phase 4 integration work and must be copied from the actual compiled blueprint artifacts.

## Official sample and spike result

Downloaded the official SDK sample referenced by the setup page to the ignored local path:

```text
samples/official-residency.eml
7485 bytes
```

The file was not printed, logged, committed, or sent anywhere.

The official setup example uses the blueprint slug `Bisht13/SuccinctZKResidencyInvite@v3`. Both the SDK lookup and direct API lookup failed:

```text
node SDK lookup:
WARNING: Missing strong random number source
Error: HTTP error! status: 500

curl https://conductor.zk.email/blueprint/by-slug/Bisht13%2FSuccinctZKResidencyInvite/3
HTTP status: 500
{"error":"Internal server error"}
```

The documented Luma blueprint ID produced the same HTTP 500 response. Because the registry did not return blueprint metadata or circuit download URLs, a local proof could not be generated or verified. This is an external registry availability blocker, not a switch to remote/server proving.

## Zomato status

No official Zomato blueprint was identified in the checked official docs, SDK demo, or verifier repositories. The current Registry workflow supports creating one, but that requires a real Zomato `.eml`, deterministic regex configuration, compilation, and a generated verifier. No Zomato blueprint can be claimed until those artifacts exist and the provider's real DKIM `d=` domain and order fields are verified from a sample.

## Decision

Phase 1 cannot meet its required DONE condition yet: the official sample was obtained, but the official registry returned HTTP 500 and no browser runtime is available for local proving. No contract signal indices or Zomato blueprint details will be invented. Resume with a working Registry/Conductor service and a browser-capable local proving environment before implementing contracts.
