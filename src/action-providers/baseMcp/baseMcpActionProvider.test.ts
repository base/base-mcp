// import { BaseMcpActionProvider } from "./baseMcpActionProvider";
// import { Network } from "../../network";
// import { ExampleActionSchema } from "./schemas";
// import { EvmWalletProvider } from "../../wallet-providers";

// describe("BaseMcpActionProvider", () => {
//   const provider = new BaseMcpActionProvider();
//   let mockWalletProvider: jest.Mocked<EvmWalletProvider>;

//   beforeEach(() => {
//     mockWalletProvider = {
//       getAddress: jest.fn(),
//       getBalance: jest.fn(),
//       getName: jest.fn(),
//       getNetwork: jest.fn().mockReturnValue({
//         protocolFamily: "evm",
//         networkId: "test-network",
//       }),
//       nativeTransfer: jest.fn(),
//     } as unknown as jest.Mocked<EvmWalletProvider>;
//   });

//   describe("network support", () => {
//     it("should support the protocol family", () => {
//       expect(
//         provider.supportsNetwork({
//           protocolFamily: "evm",
//         }),
//       ).toBe(true);
//     });

//     it("should not support other protocol families", () => {
//       expect(
//         provider.supportsNetwork({
//           protocolFamily: "other-protocol-family",
//         }),
//       ).toBe(false);
//     });

//     it("should handle invalid network objects", () => {
//       expect(provider.supportsNetwork({} as Network)).toBe(false);
//     });
//   });

//   describe("action validation", () => {
//     it("should validate example action schema", () => {
//       const validInput = {
//         fieldName: "test",
//         amount: "1.0",
//       };
//       const parseResult = ExampleActionSchema.safeParse(validInput);
//       expect(parseResult.success).toBe(true);
//     });

//     it("should reject invalid example action input", () => {
//       const invalidInput = {
//         fieldName: "",
//         amount: "invalid",
//       };
//       const parseResult = ExampleActionSchema.safeParse(invalidInput);
//       expect(parseResult.success).toBe(false);
//     });
//   });

//   describe("example action", () => {
//     it("should execute example action with wallet provider", async () => {
//       const args = {
//         fieldName: "test",
//         amount: "1.0",
//       };
//       const result = await provider.exampleAction(mockWalletProvider, args);
//       expect(result).toContain(args.fieldName);
//       expect(mockWalletProvider.getNetwork).toHaveBeenCalled();
//     });
//   });
// });
