# SDK Generation Scripts

Scripts for generating client SDKs from OpenAPI specification.

---

## 📦 **Quick Start**

### **Generate All SDKs**
```bash
./scripts/generate-sdk.sh
```

This will generate:
- **TypeScript SDK** → `sdk/typescript/`
- **Python SDK** → `sdk/python/`

---

## 🔧 **Requirements**

### **Node.js & pnpm**
```bash
node --version  # v18+
pnpm --version  # 8.0+
```

### **OpenAPI Generator**
Automatically installed via npx (no global install needed)

---

## 📚 **Manual SDK Usage**

Don't want to wait for code generation? Use our **manual TypeScript SDK**:

```typescript
import { WhopSaaSClient } from '@/lib/sdk/client';

const client = new WhopSaaSClient();
const products = await client.products.list({ company_id: 'biz_123' });
```

**Docs:** `/lib/sdk/README.md`

---

## 🎯 **Generated SDK Locations**

After running `./scripts/generate-sdk.sh`:

```
sdk/
├── typescript/
│   ├── src/
│   ├── package.json
│   └── USAGE.md
└── python/
    ├── whopsaas/
    ├── setup.py
    └── USAGE.md
```

---

## 🚀 **Publishing SDKs**

### **TypeScript (npm)**
```bash
cd sdk/typescript
pnpm install
pnpm build
pnpm publish --access public
```

### **Python (PyPI)**
```bash
cd sdk/python
pip install build twine
python -m build
twine upload dist/*
```

---

## 🔄 **Regenerate After API Changes**

1. Update `openapi.yaml`
2. Run `./scripts/generate-sdk.sh`
3. Review changes in `sdk/` directory
4. Test generated code
5. Commit and publish

---

## 🐛 **Troubleshooting**

### **Permission Denied**
```bash
chmod +x ./scripts/generate-sdk.sh
```

### **npx Command Not Found**
```bash
pnpm add -g npx
```

### **Network Issues**
Use the manual SDK in `/lib/sdk/client.ts` - no generation needed!

---

## 📖 **Related Documentation**

- [OpenAPI Spec](../openapi.yaml)
- [API Documentation](../API_DOCUMENTATION.md)
- [Manual SDK Guide](../lib/sdk/README.md)
- [Team Guide](../TEAM_GUIDE.md)

---

**Note:** The manual TypeScript SDK (`/lib/sdk/client.ts`) is production-ready and can be used immediately without running code generation.
