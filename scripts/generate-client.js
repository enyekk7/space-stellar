// Generate TypeScript client for contract (Scaffold Stellar style)
import { config } from 'dotenv';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

config();

const CONTRACT_ID = process.env.CONTRACT_ID || '';
const CONTRACT_NAME = 'SpaceStellarNFT';

if (!CONTRACT_ID) {
  console.warn('⚠️  CONTRACT_ID not set in .env');
  console.log('Set CONTRACT_ID after deploying contract\n');
}

// Generate basic TypeScript client
const clientCode = `// Auto-generated client for ${CONTRACT_NAME}
// Update this after deploying contract

export const CONTRACT_ID = '${CONTRACT_ID}';

export interface ShipMetadata {
  class: string;
  rarity: string;
  attack: number;
  speed: number;
  shield: number;
  ipfsCid: string;
}

export class ${CONTRACT_NAME}Client {
  constructor(
    public contractId: string = CONTRACT_ID,
    public network: 'testnet' | 'mainnet' = 'testnet'
  ) {}

  // Implement contract methods here
  // Use @stellar/stellar-sdk for contract invocation
}

export default ${CONTRACT_NAME}Client;
`;

const outputDir = join(process.cwd(), 'frontend', 'src', 'contracts');
mkdirSync(outputDir, { recursive: true });

writeFileSync(
  join(outputDir, 'client.ts'),
  clientCode
);

console.log('✅ TypeScript client generated!');
console.log(`📄 Location: ${join(outputDir, 'client.ts')}\n`);







