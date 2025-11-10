// Deploy script for Scaffold Stellar
import { config } from 'dotenv';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

config();

const CONTRACT_NAME = 'space-stellar-nft';
const WASM_PATH = join(process.cwd(), 'contracts', 'target', 'wasm32-unknown-unknown', 'release', `${CONTRACT_NAME}.wasm`);

console.log('🚀 Deploying Space Stellar NFT Contract...\n');

try {
  // Build contract
  console.log('📦 Building contract...');
  execSync('cargo build --target wasm32-unknown-unknown --release', {
    cwd: join(process.cwd(), 'contracts'),
    stdio: 'inherit'
  });

  console.log('\n✅ Contract built successfully!');
  console.log(`📄 WASM file: ${WASM_PATH}\n`);
  
  console.log('📝 Next steps:');
  console.log('1. Deploy using Stellar CLI:');
  console.log(`   stellar contract deploy --wasm ${WASM_PATH} --source YourAccount --network testnet`);
  console.log('\n2. Or use Scaffold Stellar CLI:');
  console.log('   stellar scaffold deploy');
  console.log('\n3. Update CONTRACT_ID in .env file after deployment\n');

} catch (error) {
  console.error('❌ Deployment error:', error.message);
  process.exit(1);
}







