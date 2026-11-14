# Contributing to Bangladesh Rivers Geo-Vault

Thank you for your interest in contributing to **Bangladesh Rivers Geo-Vault**, an open-source geospatial initiative architected by **[Mohammad Golamrabbii (মোহাম্মদ গোলাম রাব্বী)](https://github.com/mohammadgolamrabbii)**.

## How to Contribute

1. **Fork the Repository**:
   Click the Fork button at the top right of this repository.

2. **Clone your Fork**:
   ```bash
   git clone https://github.com/<your-username>/Bangladesh-Rivers-Geo-Vault.git
   cd Bangladesh-Rivers-Geo-Vault
   ```

3. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/river-data-update
   ```

4. **Verify Datasets & Run Tests**:
   Before submitting changes, make sure all automated tests pass:
   ```bash
   npm test
   ```

5. **Commit with Clear Messages**:
   ```bash
   git commit -m "docs: add hydrological survey data for Halda basin"
   ```

6. **Submit a Pull Request**:
   Push to your branch and submit a PR against `main`.

## Data Governance & Accuracy Standards
- All transboundary river listings adhere to the official **Joint River Commission (JRC)** bilateral registries between Bangladesh, India, and Myanmar.
- River health classifications (Active, Seasonal, Encroached, Silted) are cross-referenced with Bangladesh Water Development Board (BWDB) reports.

## Code of Conduct
Please be respectful and constructive in all discussions, issues, and code reviews.
