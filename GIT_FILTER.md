# 📋 Git Filter - File yang Akan Di-upload ke GitHub

## ✅ File yang AKAN Di-upload (Included)

### 📁 Source Code
- ✅ Semua file `.ts`, `.tsx`, `.js`, `.jsx` (source code)
- ✅ Semua file `.rs` (Rust contracts)
- ✅ Semua file `.css` (stylesheets)
- ✅ Semua file `.html` (HTML templates)

### 📁 Configuration Files
- ✅ `package.json`, `package-lock.json`
- ✅ `Cargo.toml`, `Cargo.lock`
- ✅ `tsconfig.json`, `tsconfig.*.json`
- ✅ `vite.config.ts`
- ✅ `eslint.config.js`
- ✅ `scaffold.config.js`
- ✅ `rust-toolchain.toml`
- ✅ `environments.toml`

### 📁 Documentation
- ✅ `README.md` (utama)
- ✅ `CODE_OF_CONDUCT.md`
- ✅ `CONTRIBUTING.md`
- ✅ `SECURITY.md`
- ✅ `LICENSE`
- ✅ `contracts/README.md`

### 📁 Assets (Public)
- ✅ `frontend/public/**` (game assets, images)
- ✅ `assets/nft-images/ships/*.gif` (ship images)
- ✅ `assets/nft-images/ships/*.svg` (ship SVGs)
- ✅ `public/favicon.ico`

### 📁 Scripts
- ✅ `scripts/*.js`
- ✅ `scripts/*.ps1`
- ✅ `scripts/*.sh`
- ✅ `backend/scripts/migrate*.js`
- ✅ `backend/scripts/auto-migrate.js`
- ✅ `backend/scripts/setup-database.js`

### 📁 Smart Contracts
- ✅ `contracts/**/*.rs` (Rust source)
- ✅ `contracts/**/Cargo.toml`
- ✅ `contracts/Cargo.toml`

---

## ❌ File yang TIDAK Di-upload (Excluded)

### 🔒 Sensitive Files (SANGAT PENTING!)
- ❌ `.env`, `.env.*` (environment variables)
- ❌ `*_KEYS.txt`, `*_SECRET*.txt`
- ❌ `*_PRIVATE*.txt`, `*_API*.txt`
- ❌ `railway.json`, `vercel.json` (deployment configs)
- ❌ File dengan private keys, API keys, secrets

### 📦 Dependencies
- ❌ `node_modules/` (akan diinstall via `npm install`)
- ❌ `target/` (Rust build output)
- ❌ `dist/`, `build/` (build outputs)

### 🗑️ Build Artifacts
- ❌ `*.wasm` (compiled contracts)
- ❌ `*.wasm.map` (source maps)
- ❌ `contracts/.soroban/` (Soroban cache)

### 📝 Logs & Temporary
- ❌ `*.log` (semua log files)
- ❌ `*.tmp`, `*.bak`, `*.old`
- ❌ `*.swp`, `*~` (editor temp files)

### 💾 User-Generated Content
- ❌ `assets/uploads/` (user uploads)
- ❌ `backend/uploads/` (user uploads)
- ❌ Database files (`*.db`, `*.sqlite`)

### 🧪 Test Files dengan Sensitive Data
- ❌ `backend/scripts/test-*.js`
- ❌ `backend/scripts/debug-*.js`
- ❌ `backend/scripts/create-test-account.js`

### 🖥️ OS & IDE Files
- ❌ `.DS_Store` (macOS)
- ❌ `Thumbs.db` (Windows)
- ❌ `.vscode/`, `.idea/` (IDE settings)

---

## 🔍 Cara Memverifikasi

### 1. Cek File yang Akan Di-commit
```bash
git status
```

### 2. Cek File yang Di-ignore
```bash
git check-ignore -v <file-path>
```

### 3. Test .gitignore
```bash
# Cek apakah file sensitif ter-ignore
git check-ignore .env
git check-ignore node_modules/
git check-ignore target/
```

---

## ⚠️ PENTING: Sebelum Push ke GitHub

### ✅ Checklist
- [ ] Pastikan tidak ada file `.env` di repository
- [ ] Pastikan tidak ada private keys atau API keys
- [ ] Pastikan `node_modules/` tidak ter-commit
- [ ] Pastikan `target/` dan `dist/` tidak ter-commit
- [ ] Pastikan `*.wasm` tidak ter-commit
- [ ] Review `git status` sebelum commit
- [ ] Gunakan `git add .` dengan hati-hati

### 🛡️ Security Best Practices
1. **JANGAN PERNAH** commit file `.env`
2. **JANGAN PERNAH** hardcode secrets di source code
3. Gunakan environment variables untuk semua konfigurasi sensitif
4. Review semua file sebelum commit pertama
5. Gunakan GitHub Secrets untuk CI/CD

---

## 📝 Catatan

- File `.gitignore` sudah dikonfigurasi untuk memfilter semua file sensitif
- File `.gitattributes` mengatur line endings dan binary files
- Jika ada file yang seharusnya di-ignore tapi masih muncul, tambahkan ke `.gitignore`

---

**Last Updated:** $(date)

